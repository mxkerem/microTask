'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFreighter } from '@/hooks/useFreighter';
import { PaymentFormData } from '@/types';
import { stellarService, checkContractConnection } from '@/services/stellar';

export default function MainPage() {
  const router = useRouter();
  const { publicKey, isWalletConnected, networkInfo, disconnectWallet, isInitialized } = useFreighter();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    taskId: '',
    freelancerAddress: '',
    paymentAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [lastTaskInfo, setLastTaskInfo] = useState<{taskId: string, freelancer: string} | null>(null);
  const [contractConnected, setContractConnected] = useState(false);

  // Redirect if not connected - but only after initialization is complete
  useEffect(() => {
    if (isInitialized && !isWalletConnected && !publicKey) {
      console.log('❌ Main page: No wallet connection, redirecting to home');
      router.push('/');
    }
  }, [isInitialized, isWalletConnected, publicKey, router]);

  // Load contract data when component mounts
  useEffect(() => {
    if (isWalletConnected && publicKey) {
      loadContractData();
    }
  }, [isWalletConnected, publicKey]);

  const loadContractData = async () => {
    try {
      // Check if contract is accessible
      const connected = await checkContractConnection();
      setContractConnected(connected);
      
      if (connected) {
        // Load total tasks from contract
        const total = await stellarService.getTotalPaidTasks();
        setTotalTasks(total);
        
        // Load last task info from contract
        const lastTask = await stellarService.getLastPaidTaskInfo();
        if (lastTask) {
          setLastTaskInfo({
            taskId: lastTask.taskId.toString(),
            freelancer: lastTask.freelancerAddress.length > 12 
              ? lastTask.freelancerAddress.slice(0, 8) + '...' + lastTask.freelancerAddress.slice(-4)
              : lastTask.freelancerAddress
          });
        }
      }
    } catch (error) {
      console.error('Failed to load contract data:', error);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayForTask = async () => {
    const { taskId, freelancerAddress, paymentAmount } = formData;
    
    if (!taskId || !freelancerAddress || !paymentAmount) {
      alert('Please fill all fields');
      return;
    }

    if (!publicKey) {
      alert('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      if (contractConnected) {
        // Use actual contract integration
        console.log('🚀 Calling Soroban contract...');
        
        const txHash = await stellarService.completeTaskAndPay(
          parseInt(taskId), 
          freelancerAddress, 
          parseFloat(paymentAmount) * 10000000, // Convert XLM to stroops
          publicKey
        );
        
        console.log('✅ Transaction successful:', txHash);
        
        // Reload contract data to update UI
        await loadContractData();
        
        alert(`✅ Payment successful! Transaction: ${txHash.slice(0, 8)}...`);
      } else {
        // Fallback to mock behavior when contract is not deployed
        console.log('⚠️ Contract not deployed, using mock behavior');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update local state
        setTotalTasks(prev => prev + 1);
        setLastTaskInfo({
          taskId,
          freelancer: freelancerAddress.length > 12 
            ? freelancerAddress.slice(0, 8) + '...' + freelancerAddress.slice(-4)
            : freelancerAddress
        });
        
        alert('✅ Payment logged locally (contract not deployed yet)');
      }

      // Clear form on success
      setFormData({
        taskId: '',
        freelancerAddress: '',
        paymentAmount: ''
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert(`❌ Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  // Show loading while checking connection - now checks initialization too
  if (!isInitialized || (!isWalletConnected && !publicKey)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{!isInitialized ? 'Initializing wallet...' : 'Checking wallet connection...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🧩 Task Payment Dashboard</h1>
              <p className="text-gray-600">
                Connected: {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-4)}` : 'Not connected'}
              </p>
              {networkInfo && (
                <p className="text-xs text-green-600">
                  Network: {networkInfo.networkUrl ? 'Testnet' : 'Unknown'} 
                  {networkInfo.sorobanRpcUrl && ' • Soroban Ready'}
                </p>
              )}
              <p className={`text-xs ${contractConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                Contract: {contractConnected ? '✅ Connected' : '⚠️ Not deployed (using local mode)'}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Tasks Paid</h3>
            <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
            <p className="text-xs text-gray-500 mt-1">
              {contractConnected ? 'From blockchain' : 'Local count'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Last Payment</h3>
            {lastTaskInfo ? (
              <div className="text-sm text-gray-600">
                <p>Task: #{lastTaskInfo.taskId}</p>
                <p>To: {lastTaskInfo.freelancer}</p>
              </div>
            ) : (
              <p className="text-gray-500">No payments yet</p>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Pay for Completed Task</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task ID
              </label>
              <input
                type="text"
                value={formData.taskId}
                onChange={(e) => handleInputChange('taskId', e.target.value)}
                placeholder="e.g., TASK001, DESIGN123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Freelancer Wallet Address
              </label>
              <input
                type="text"
                value={formData.freelancerAddress}
                onChange={(e) => handleInputChange('freelancerAddress', e.target.value)}
                placeholder="GXXXXXX... (Stellar public key)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (XLM)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.paymentAmount}
                onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                placeholder="e.g., 10.5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handlePayForTask}
              disabled={loading || !formData.taskId || !formData.freelancerAddress || !formData.paymentAmount}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>💰</span>
                  <span>{contractConnected ? 'Pay via Contract' : 'Pay (Local Mode)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ⚡ Powered by Stellar Network • 🔒 Secured by Freighter Wallet
            {!contractConnected && (
              <span className="block text-yellow-600 mt-1">
                📝 Deploy contract to enable blockchain payments
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}