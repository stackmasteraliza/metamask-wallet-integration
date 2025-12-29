import {NetworkConfig, NetworkType} from '../types';

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  SEPOLIA: {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    // Test USDT contract on Sepolia (Aave test USDT)
    usdtContractAddress: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
  },
  ETH: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    usdtContractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  POL: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    usdtContractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  BNB: {
    chainId: 56,
    chainIdHex: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    usdtContractAddress: '0x55d398326f99059fF775485246999027B3197955',
  },
};

export const USDT_ABI = [
  {
    constant: true,
    inputs: [{name: '_owner', type: 'address'}],
    name: 'balanceOf',
    outputs: [{name: 'balance', type: 'uint256'}],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {name: '_to', type: 'address'},
      {name: '_value', type: 'uint256'},
    ],
    name: 'transfer',
    outputs: [{name: '', type: 'bool'}],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{name: '', type: 'uint8'}],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {name: '_spender', type: 'address'},
      {name: '_value', type: 'uint256'},
    ],
    name: 'approve',
    outputs: [{name: '', type: 'bool'}],
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {indexed: true, name: 'from', type: 'address'},
      {indexed: true, name: 'to', type: 'address'},
      {indexed: false, name: 'value', type: 'uint256'},
    ],
    name: 'Transfer',
    type: 'event',
  },
];

export const getNetworkConfig = (networkType: NetworkType): NetworkConfig => {
  return NETWORKS[networkType];
};

export const getAllNetworks = (): NetworkConfig[] => {
  return Object.values(NETWORKS);
};

export const getNetworkByChainId = (
  chainId: number,
): NetworkConfig | undefined => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};
