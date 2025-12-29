import {ethers} from 'ethers';
import {WalletState, NetworkType} from '../types';
import {getNetworkConfig} from '../config/networks';

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletConnectProvider: any = null;

  initializeProvider(wcProvider: any) {
    this.walletConnectProvider = wcProvider;
  }

  async connect(): Promise<WalletState> {
    try {
      if (!this.walletConnectProvider) {
        throw new Error('WalletConnect provider not initialized');
      }

      await this.walletConnectProvider.enable();

      this.provider = new ethers.BrowserProvider(this.walletConnectProvider);
      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();

      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      return {
        address,
        connected: true,
        chainId,
        balance: balanceInEth,
      };
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw new Error(
        error.message || 'Failed to connect wallet. Please try again.',
      );
    }
  }

  async disconnect(): Promise<void> {
    // Just clean up local state - the WalletConnect provider disconnect
    // is handled by WalletConnectContext
    this.provider = null;
    this.signer = null;
    this.walletConnectProvider = null;
  }

  async switchNetwork(networkType: NetworkType): Promise<void> {
    try {
      if (!this.walletConnectProvider) {
        throw new Error('Wallet not connected');
      }

      const networkConfig = getNetworkConfig(networkType);

      try {
        await this.walletConnectProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: networkConfig.chainIdHex}],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await this.addNetwork(networkType);
        } else {
          throw switchError;
        }
      }

      this.provider = new ethers.BrowserProvider(this.walletConnectProvider);
      this.signer = await this.provider.getSigner();
    } catch (error: any) {
      console.error('Network switch error:', error);
      throw new Error(
        `Failed to switch to ${networkType} network. ${error.message}`,
      );
    }
  }

  async addNetwork(networkType: NetworkType): Promise<void> {
    try {
      if (!this.walletConnectProvider) {
        throw new Error('Wallet not connected');
      }

      const networkConfig = getNetworkConfig(networkType);

      await this.walletConnectProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: networkConfig.chainIdHex,
            chainName: networkConfig.name,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.blockExplorerUrl],
          },
        ],
      });
    } catch (error: any) {
      console.error('Add network error:', error);
      throw new Error(`Failed to add ${networkType} network. ${error.message}`);
    }
  }

  async getWalletState(): Promise<WalletState | null> {
    try {
      if (!this.provider || !this.signer) {
        return null;
      }

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      const balance = await this.provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      return {
        address,
        connected: true,
        chainId,
        balance: balanceInEth,
      };
    } catch (error) {
      console.error('Get wallet state error:', error);
      return null;
    }
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }
}

export const walletService = new WalletService();
