'use client';

import { useEffect } from 'react';
import { useFreighter } from '@/hooks/useFreighter';

interface WalletConnectProps {
  onConnect?: () => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { connectWallet, disconnectWallet, loading, isWalletConnected, publicKey } = useFreighter();

  useEffect(() => {
    const checkConnection = async () => {
      // Logic to check connection status on component mount
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success && onConnect) {
      onConnect();
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    // Additional logic on disconnect if needed
  };

  if (isWalletConnected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm">
          <span className="text-gray-600">Connected:</span>
          <span className="font-mono ml-1">{publicKey.slice(0, 8)}...{publicKey.slice(-4)}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded flex items-center space-x-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>
  );
}