import Config from 'react-native-config';

export const WALLET_CONNECT_PROJECT_ID =
  Config.WALLET_CONNECT_PROJECT_ID || '85e808ef14bb71441ebbeb1e9fb07eb0';

export const WALLET_CONNECT_METADATA = {
  name: Config.APP_NAME || 'MetaMask USDT App',
  description:
    Config.APP_DESCRIPTION || 'Transfer USDT across multiple blockchain networks',
  url: Config.APP_URL || 'https://github.com/walletconnect',
  icons: [Config.APP_ICON || 'https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: Config.APP_REDIRECT_NATIVE || 'metamaskusdtapp://',
    universal: Config.APP_REDIRECT_UNIVERSAL || 'https://github.com/walletconnect',
  },
};

export const WALLET_CONNECT_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain',
    ],
    chains: [
      'eip155:1',
      'eip155:137',
      'eip155:56',
    ],
    events: ['chainChanged', 'accountsChanged'],
    rpcMap: {
      1: 'https://eth.llamarpc.com',
      137: 'https://polygon-rpc.com',
      56: 'https://bsc-dataseed1.binance.org',
    },
  },
};
