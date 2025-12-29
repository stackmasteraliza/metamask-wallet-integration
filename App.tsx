/**
 * MetaMask USDT Transfer App
 * React Native application for transferring USDT across multiple blockchain networks
 *
 * @format
 */

// Import polyfills first
import './src/config/polyfills';

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {WalletConnectProvider} from './src/contexts/WalletConnectContext';
import {HomeScreen} from './src/screens/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <WalletConnectProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <HomeScreen />
      </WalletConnectProvider>
    </SafeAreaProvider>
  );
}

export default App;
