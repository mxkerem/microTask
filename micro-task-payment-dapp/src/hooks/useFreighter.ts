'use client';

import { useState, useEffect } from 'react';

// Define window.freighterApi type for TypeScript
declare global {
  interface Window {
    freighterApi?: any;
  }
}

export const useFreighter = () => {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false); // Add initialization state

  // Check if wallet is already connected on mount
  useEffect(() => {
    const initializeFreighter = async () => {
      console.log('🔄 Initializing Freighter...');
      
      // First check if we have a stored public key
      const storedPublicKey = localStorage.getItem('stellar_publicKey');
      if (storedPublicKey) {
        console.log('📦 Found stored public key:', storedPublicKey);
        setPublicKey(storedPublicKey);
        setIsWalletConnected(true);
      }
      
      await checkFreighterInstallation();
      
      // Only check connection if we don't already have a stored key
      if (!storedPublicKey) {
        await checkConnection();
      } else {
        console.log('✅ Using stored wallet connection');
      }
      
      setIsInitialized(true); // Mark as initialized
    };
    
    initializeFreighter();
  }, []);

  const checkFreighterInstallation = async () => {
    try {
      let detected = false;
      let debugMsg = '';

      // Method 1: Direct window.freighterApi check
      if (typeof window !== 'undefined') {
        if (window.freighterApi) {
          detected = true;
          debugMsg = 'Detected via window.freighterApi';
        }
        
        // Method 2: Check if extension injected the API
        if (!detected && (window as any).freighter) {
          detected = true;
          debugMsg = 'Detected via window.freighter';
        }
      }

      // Method 3: Try dynamic import of Freighter API
      if (!detected) {
        try {
          const freighterApi = await import('@stellar/freighter-api');
          // Try default export first
          const isConnectedFn = freighterApi.default?.isConnected || freighterApi.isConnected;
          if (isConnectedFn) {
            const isConnectedResult = await isConnectedFn();
            // Handle boolean response
            if (isConnectedResult) {
              detected = true;
              debugMsg = 'Detected via @stellar/freighter-api.isConnected()';
            } else {
              debugMsg = 'API loaded but isConnected returned false';
            }
          } else {
            debugMsg = 'API loaded but isConnected function not found';
          }
        } catch (error) {
          debugMsg = `API import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      // Method 4: Retry after delay (extension might still be loading)
      if (!detected) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (typeof window !== 'undefined' && window.freighterApi) {
          detected = true;
          debugMsg = 'Detected after 2s delay via window.freighterApi';
        }
      }

      setFreighterInstalled(detected);
      setDebugInfo(debugMsg);
      console.log('Freighter detection:', { detected, debugMsg });

    } catch (error) {
      const errorMsg = `Detection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setDebugInfo(errorMsg);
      console.error('Freighter detection error:', error);
      setFreighterInstalled(false);
    }
  };

  const checkConnection = async () => {
    try {
      // Only check connection if we detected Freighter
      if (!freighterInstalled) return;

      const freighterApi = await import('@stellar/freighter-api');
      const getPublicKeyFn = freighterApi.default?.getPublicKey || freighterApi.getPublicKey;
      
      if (getPublicKeyFn) {
        try {
          const publicKeyResult = await getPublicKeyFn();
          
          if (publicKeyResult && typeof publicKeyResult === 'string') {
            setPublicKey(publicKeyResult);
            setIsWalletConnected(true);
            
            // Get network info if available
            const getNetworkFn = freighterApi.default?.getNetwork || freighterApi.getNetwork;
            if (getNetworkFn) {
              const networkDetails = await getNetworkFn();
              setNetworkInfo(networkDetails);
            }
          }
        } catch (error) {
          // User hasn't connected yet, this is expected
          console.log('User not connected yet:', error);
        }
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      console.log('🔄 connectWallet: Starting connection process...');
      
      // Force re-check installation before connecting
      await checkFreighterInstallation();
      
      if (!freighterInstalled) {
        console.log('❌ connectWallet: Freighter not installed');
        alert(`Freighter wallet not detected. Debug: ${debugInfo}`);
        setLoading(false);
        return false;
      }

      // Import and use Freighter API
      const freighterApi = await import('@stellar/freighter-api');
      
      // Try to get public key directly (this will prompt user if not connected)
      const getPublicKeyFn = freighterApi.default?.getPublicKey || freighterApi.getPublicKey;
      
      if (!getPublicKeyFn) {
        throw new Error('getPublicKey function not found in Freighter API');
      }
      
      console.log('🔄 connectWallet: Requesting wallet connection...');
      const publicKeyResult = await getPublicKeyFn();
      
      if (publicKeyResult && typeof publicKeyResult === 'string') {
        console.log('✅ connectWallet: Connected successfully:', publicKeyResult);
        setPublicKey(publicKeyResult);
        setIsWalletConnected(true);
        localStorage.setItem('stellar_publicKey', publicKeyResult);
        
        console.log('🔄 connectWallet: Updated state - isWalletConnected:', true);
        
        // Get network details
        try {
          const getNetworkFn = freighterApi.default?.getNetwork || freighterApi.getNetwork;
          if (getNetworkFn) {
            const networkDetails = await getNetworkFn();
            setNetworkInfo(networkDetails);
            console.log('📡 connectWallet: Network details:', networkDetails);
          }
        } catch (netError) {
          console.warn('⚠️ connectWallet: Could not get network details:', netError);
        }
        
        setLoading(false);
        console.log('✅ connectWallet: Returning success = true');
        return true;
      } else {
        console.error('❌ connectWallet: Failed to get public key');
        setLoading(false);
        return false;
      }
      
    } catch (error) {
      console.error('❌ connectWallet: Connection failed:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    setPublicKey('');
    setIsWalletConnected(false);
    setNetworkInfo(null);
    localStorage.removeItem('stellar_publicKey');
  };

  return {
    publicKey,
    isWalletConnected,
    loading,
    networkInfo,
    freighterInstalled,
    debugInfo,
    isInitialized, // Export initialization state
    connectWallet,
    disconnectWallet,
  };
};