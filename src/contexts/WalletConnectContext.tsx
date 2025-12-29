import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import UniversalProvider from '@walletconnect/universal-provider';
import {
  WALLET_CONNECT_PROJECT_ID,
  WALLET_CONNECT_METADATA,
  WALLET_CONNECT_NAMESPACES,
} from '../config/walletConnect';
import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletConnectContextType {
  provider: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  cancelConnection: () => void;
  isConnected: boolean;
  address?: string;
  uri?: string;
}

const WalletConnectContext = createContext<
  WalletConnectContextType | undefined
>(undefined);

interface WalletConnectProviderProps {
  children: ReactNode;
}

const WC_SESSION_KEY = '@walletconnect_session';

// Helper to extract address from accounts array
const extractAddress = (accounts: string[]): string | undefined => {
  if (accounts && accounts.length > 0) {
    // accounts format: "eip155:chainId:address"
    const parts = accounts[0].split(':');
    return parts.length >= 3 ? parts[2] : undefined;
  }
  return undefined;
};

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({
  children,
}) => {
  const [provider, setProvider] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>();
  const [uri, setUri] = useState<string | undefined>();
  const connectionInProgress = useRef(false);

  const clearStaleSession = async () => {
    try {
      await AsyncStorage.removeItem(WC_SESSION_KEY);
    } catch (error) {
      // Silently fail
    }
  };

  const updateConnectionState = useCallback((session: any) => {
    if (session?.namespaces?.eip155?.accounts) {
      const addr = extractAddress(session.namespaces.eip155.accounts);
      if (addr) {
        setAddress(addr);
        setIsConnected(true);
        setUri(undefined);
        console.log('Wallet connected:', addr);
        return true;
      }
    }
    return false;
  }, []);

  const initProvider = useCallback(async () => {
    try {
      const universalProvider = await UniversalProvider.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        metadata: WALLET_CONNECT_METADATA,
      });

      // Check for existing session
      if (universalProvider.session) {
        updateConnectionState(universalProvider.session);
      }

      setProvider(universalProvider);

      // URI for QR code / deep link
      universalProvider.on('display_uri', (displayUri: string) => {
        console.log('WalletConnect URI generated:', displayUri);
        setUri(displayUri);
      });

      // Session events
      universalProvider.on('session_event', () => {
        // Check current session state
        if (universalProvider.session) {
          updateConnectionState(universalProvider.session);
        }
      });

      universalProvider.on('session_update', ({params}: any) => {
        console.log('Session updated');
        if (params?.namespaces?.eip155?.accounts) {
          const addr = extractAddress(params.namespaces.eip155.accounts);
          if (addr) {
            setAddress(addr);
            setIsConnected(true);
          }
        }
      });

      universalProvider.on('session_delete', () => {
        console.log('Session deleted');
        setIsConnected(false);
        setAddress(undefined);
        setUri(undefined);
      });

      universalProvider.on('connect', (session: any) => {
        console.log('Connected event received');
        updateConnectionState(session);
        connectionInProgress.current = false;
      });

      universalProvider.on('disconnect', () => {
        console.log('Disconnected');
        setIsConnected(false);
        setAddress(undefined);
        setUri(undefined);
      });

    } catch (error) {
      console.error('Failed to initialize provider:', error);
      await clearStaleSession();
    }
  }, [updateConnectionState]);

  useEffect(() => {
    initProvider();
  }, [initProvider]);

  // Handle app state changes (when coming back from MetaMask)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && provider) {
        // Small delay to let WalletConnect sync
        setTimeout(() => {
          const session = provider.session;
          if (session && !isConnected) {
            updateConnectionState(session);
          }
        }, 500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [provider, isConnected, updateConnectionState]);

  const connect = async () => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    if (connectionInProgress.current) {
      return;
    }

    // If already connected, don't start a new connection
    if (isConnected && provider.session) {
      console.log('Already connected, skipping new connection');
      return;
    }

    try {
      connectionInProgress.current = true;
      setUri(undefined);
      // Reset connected state before starting new connection
      setIsConnected(false);

      const session = await provider.connect({
        namespaces: WALLET_CONNECT_NAMESPACES,
      });

      if (session) {
        updateConnectionState(session);
      }
    } catch (error: any) {
      connectionInProgress.current = false;
      setUri(undefined);

      // Handle user rejection gracefully
      if (error?.code === 5002 || error?.message?.includes('rejected')) {
        throw new Error('Connection was rejected. Please try again.');
      }

      // Ignore session topic errors - they're internal WC issues
      if (error?.message?.includes('session topic') ||
          error?.message?.includes('No matching key')) {
        // Check if we actually connected despite the error
        if (provider.session) {
          updateConnectionState(provider.session);
          return;
        }
      }

      throw error;
    }
  };

  const disconnect = async () => {
    if (provider) {
      try {
        await provider.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      } finally {
        setIsConnected(false);
        setAddress(undefined);
        setUri(undefined);
        connectionInProgress.current = false;
        await clearStaleSession();
      }
    }
  };

  const cancelConnection = () => {
    setUri(undefined);
    connectionInProgress.current = false;
  };

  return (
    <WalletConnectContext.Provider
      value={{
        provider,
        connect,
        disconnect,
        cancelConnection,
        isConnected,
        address,
        uri,
      }}>
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (context === undefined) {
    throw new Error(
      'useWalletConnect must be used within a WalletConnectProvider',
    );
  }
  return context;
};
