'use client';

import { useRouter } from 'next/navigation';
import { useFreighter } from '@/hooks/useFreighter';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { connectWallet, loading, isWalletConnected, freighterInstalled, debugInfo } = useFreighter();

  // If already connected, redirect to main
  useEffect(() => {
    console.log('Home page useEffect - isWalletConnected:', isWalletConnected);
    if (isWalletConnected) {
      console.log('Redirecting to /main...');
      router.push('/main');
    }
  }, [isWalletConnected, router]);

  const handleConnect = async () => {
    console.log('Connect button clicked');
    const success = await connectWallet();
    console.log('Connect result:', success);
    if (success) {
      console.log('Connection successful, redirecting to /main');
      router.push('/main');
    } else {
      console.log('Connection failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧩 Micro-Task Payment
          </h1>
          <p className="text-gray-600">
            Connect your Freighter wallet to start paying for completed tasks
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">What you can do:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pay freelancers for completed tasks</li>
              <li>• Track payment history</li>
              <li>• Instant Stellar payments</li>
            </ul>
          </div>
        </div>

        {/* Freighter Status with Debug Info */}
        <div className="mb-6">
          <div className={`text-sm p-3 rounded-lg ${freighterInstalled ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {freighterInstalled ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Freighter wallet detected</span>
                </div>
                {debugInfo && (
                  <div className="text-xs opacity-75">
                    {debugInfo}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>Freighter wallet not detected</span>
                </div>
                {debugInfo && (
                  <div className="text-xs opacity-75">
                    Debug: {debugInfo}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Connection Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>{freighterInstalled ? 'Connect Freighter Wallet' : 'Try to Connect Anyway'}</span>
              </>
            )}
          </button>

          {!freighterInstalled && (
            <button
              onClick={() => window.open('https://freighter.app', '_blank')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>📦</span>
              <span>Install Freighter Wallet</span>
            </button>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-500">
            {freighterInstalled 
              ? "Wallet detected and ready to connect" 
              : "Please make sure Freighter wallet extension is installed and enabled"
            }
          </p>
          <a 
            href="https://freighter.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Get Freighter Wallet →
          </a>
        </div>

        {/* Developer Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-left">
            <div className="font-semibold mb-1">Debug Info:</div>
            <div>Detection Status: {freighterInstalled ? 'TRUE' : 'FALSE'}</div>
            <div>Debug Message: {debugInfo || 'None'}</div>
            <div>window.freighterApi: {typeof window !== 'undefined' && window.freighterApi ? 'EXISTS' : 'NOT_FOUND'}</div>
          </div>
        )}
      </div>
    </div>
  );
}