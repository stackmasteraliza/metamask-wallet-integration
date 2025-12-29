export type NetworkType = 'ETH' | 'POL' | 'BNB' | 'SEPOLIA';

export interface NetworkConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  usdtContractAddress: string;
}

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionData {
  amount: string;
  recipientAddress: string;
  network: NetworkType;
  hash?: string;
  error?: string;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  chainId: number | null;
  balance: string;
}

export interface TransactionFormData {
  amount: string;
  recipientAddress: string;
  network: NetworkType;
}

export interface ErrorResponse {
  code?: number;
  message: string;
  details?: string;
}

export interface TransactionReceipt {
  hash: string;
  from: string;
  to: string;
  blockNumber: number;
  gasUsed: string;
  status: number;
}

export interface NetworkOption {
  label: string;
  value: NetworkType;
  icon?: string;
}
