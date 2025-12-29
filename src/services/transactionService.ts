import {ethers} from 'ethers';
import {NetworkType, TransactionReceipt} from '../types';
import {getNetworkConfig, USDT_ABI} from '../config/networks';
import {walletService} from './walletService';

class TransactionService {
  async getUsdtBalance(networkType: NetworkType): Promise<string> {
    try {
      const provider = walletService.getProvider();
      const signer = walletService.getSigner();

      if (!provider || !signer) {
        throw new Error('Wallet not connected');
      }

      const networkConfig = getNetworkConfig(networkType);
      const userAddress = await signer.getAddress();

      const usdtContract = new ethers.Contract(
        networkConfig.usdtContractAddress,
        USDT_ABI,
        provider,
      );

      const balance = await usdtContract.balanceOf(userAddress);

      const decimals = await usdtContract.decimals();

      const formattedBalance = ethers.formatUnits(balance, decimals);

      return formattedBalance;
    } catch (error: any) {
      console.error('Get USDT balance error:', error);
      throw new Error(`Failed to get USDT balance: ${error.message}`);
    }
  }

  validateAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  validateAmount(
    amount: string,
    balance: string,
  ): {valid: boolean; error?: string} {
    try {
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        return {valid: false, error: 'Amount must be greater than 0'};
      }

      const balanceNum = parseFloat(balance);

      if (amountNum > balanceNum) {
        return {valid: false, error: 'Insufficient USDT balance'};
      }

      return {valid: true};
    } catch (error) {
      return {valid: false, error: 'Invalid amount format'};
    }
  }

  async estimateGas(
    recipientAddress: string,
    amount: string,
    networkType: NetworkType,
  ): Promise<string> {
    try {
      const provider = walletService.getProvider();
      const signer = walletService.getSigner();

      if (!provider || !signer) {
        throw new Error('Wallet not connected');
      }

      const networkConfig = getNetworkConfig(networkType);

      const usdtContract = new ethers.Contract(
        networkConfig.usdtContractAddress,
        USDT_ABI,
        signer,
      );

      const decimals = await usdtContract.decimals();

      const amountInWei = ethers.parseUnits(amount, decimals);

      const gasEstimate = await usdtContract.transfer.estimateGas(
        recipientAddress,
        amountInWei,
      );

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

      const gasCost = gasEstimate * gasPrice;
      const gasCostInEth = ethers.formatEther(gasCost);

      return gasCostInEth;
    } catch (error: any) {
      console.error('Gas estimation error:', error);
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  async transferUsdt(
    recipientAddress: string,
    amount: string,
    networkType: NetworkType,
  ): Promise<TransactionReceipt> {
    try {
      if (!this.validateAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      const signer = walletService.getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const networkConfig = getNetworkConfig(networkType);

      await walletService.switchNetwork(networkType);

      const usdtContract = new ethers.Contract(
        networkConfig.usdtContractAddress,
        USDT_ABI,
        signer,
      );

      const decimals = await usdtContract.decimals();

      const balance = await this.getUsdtBalance(networkType);
      const validation = this.validateAmount(amount, balance);

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const amountInWei = ethers.parseUnits(amount, decimals);

      console.log(`Transferring ${amount} USDT to ${recipientAddress}...`);
      const tx = await usdtContract.transfer(recipientAddress, amountInWei);

      console.log('Transaction submitted:', tx.hash);
      console.log('Waiting for confirmation...');

      const receipt = await tx.wait();

      console.log('Transaction confirmed!');

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      };
    } catch (error: any) {
      console.error('Transfer error:', error);

      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for gas fees');
      } else if (error.message.includes('insufficient allowance')) {
        throw new Error('Insufficient USDT allowance');
      } else {
        throw new Error(
          error.message || 'Transaction failed. Please try again.',
        );
      }
    }
  }

  async getTransactionStatus(
    txHash: string,
  ): Promise<TransactionReceipt | null> {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('Provider not initialized');
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return null;
      }

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to || '',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status || 0,
      };
    } catch (error: any) {
      console.error('Get transaction status error:', error);
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }
}

export const transactionService = new TransactionService();
