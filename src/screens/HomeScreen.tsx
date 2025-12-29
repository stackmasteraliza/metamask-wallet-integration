import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Button,
  Input,
  NetworkSelector,
  StatusModal,
  QRCodeModal,
} from '../components';
import {
  WalletState,
  NetworkType,
  TransactionStatus,
  TransactionReceipt,
} from '../types';
import {useWalletConnect} from '../contexts/WalletConnectContext';
import {walletService} from '../services/walletService';
import {transactionService} from '../services/transactionService';
import {getNetworkConfig} from '../config/networks';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useResponsive} from '../hooks';

export const HomeScreen: React.FC = () => {
  const {provider, connect, disconnect, cancelConnection, isConnected, address, uri} =
    useWalletConnect();
  const {wp, hp} = useResponsive();

  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    chainId: null,
    balance: '0',
  });

  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('SEPOLIA');
  const [usdtBalance, setUsdtBalance] = useState('0');

  const [connecting, setConnecting] = useState(false);
  const [transacting, setTransacting] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>();

  const [amountError, setAmountError] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (provider) {
      walletService.initializeProvider(provider);
    }
  }, [provider]);

  useEffect(() => {
    const updateWalletState = async () => {
      if (isConnected && address && provider) {
        try {
          const state = await walletService.getWalletState();
          if (state) {
            setWalletState(state);
            await loadUsdtBalance(selectedNetwork);
          }
        } catch (error) {
          console.error('Failed to update wallet state:', error);
        }
      } else {
        setWalletState({
          address: null,
          connected: false,
          chainId: null,
          balance: '0',
        });
        setUsdtBalance('0');
      }
    };

    updateWalletState();
  }, [isConnected, address, provider]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await connect();
    } catch (error: any) {
      Alert.alert('Connection Error', error.message);
    } finally {
      setConnecting(false);
    }
  };

  // Stop loading when QRCode modal appears (URI is generated)
  useEffect(() => {
    console.log('HomeScreen uri changed:', uri ? 'has uri' : 'no uri', 'isConnected:', isConnected);
    if (uri) {
      setConnecting(false);
    }
  }, [uri, isConnected]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      await walletService.disconnect();
      setWalletState({
        address: null,
        connected: false,
        chainId: null,
        balance: '0',
      });
      setUsdtBalance('0');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCancelConnection = () => {
    cancelConnection();
    setConnecting(false);
  };

  const loadUsdtBalance = async (network: NetworkType) => {
    try {
      setLoadingBalance(true);
      const balance = await transactionService.getUsdtBalance(network);
      setUsdtBalance(balance);
    } catch (error: any) {
      console.error('Failed to load USDT balance:', error);
      setUsdtBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleNetworkChange = async (network: NetworkType) => {
    setSelectedNetwork(network);
    if (walletState.connected) {
      await loadUsdtBalance(network);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!amount || parseFloat(amount) <= 0) {
      setAmountError('Please enter a valid amount');
      isValid = false;
    } else {
      const validation = transactionService.validateAmount(amount, usdtBalance);
      if (!validation.valid) {
        setAmountError(validation.error || 'Invalid amount');
        isValid = false;
      } else {
        setAmountError('');
      }
    }

    if (!recipientAddress) {
      setAddressError('Please enter recipient address');
      isValid = false;
    } else if (!transactionService.validateAddress(recipientAddress)) {
      setAddressError('Invalid wallet address');
      isValid = false;
    } else {
      setAddressError('');
    }

    return isValid;
  };

  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setTransacting(true);
      setTransactionStatus('pending');
      setStatusMessage('Processing your transaction...');
      setStatusModalVisible(true);

      const receipt: TransactionReceipt =
        await transactionService.transferUsdt(
          recipientAddress,
          amount,
          selectedNetwork,
        );

      setTransactionStatus('success');
      setStatusMessage(
        `Successfully transferred ${amount} USDT to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
      );
      setCurrentTxHash(receipt.hash);

      setAmount('');
      setRecipientAddress('');

      await loadUsdtBalance(selectedNetwork);
    } catch (error: any) {
      setTransactionStatus('error');
      setStatusMessage(error.message);
    } finally {
      setTransacting(false);
    }
  };

  const handleViewTransaction = () => {
    if (currentTxHash) {
      const networkConfig = getNetworkConfig(selectedNetwork);
      const url = `${networkConfig.blockExplorerUrl}/tx/${currentTxHash}`;
      Linking.openURL(url);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModalVisible(false);
    setCurrentTxHash(undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {padding: wp(5), paddingBottom: hp(5)},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.header, {marginBottom: hp(3)}]}>
          <View style={[styles.logoContainer, {gap: wp(3)}]}>
            <View
              style={[
                styles.logo,
                {
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                },
              ]}>
              <Text style={[styles.logoText, {fontSize: wp(7)}]}>₮</Text>
            </View>
            <View>
              <Text style={styles.title}>USDT Transfer</Text>
              <Text style={[styles.subtitle, {marginTop: hp(0.3)}]}>
                Multi-Chain Wallet
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              borderRadius: wp(5),
              paddingHorizontal: wp(6),
              paddingVertical: hp(1.2),
            },
          ]}>
          {!isConnected ? (
            <View style={[styles.connectSection, {paddingVertical: hp(2.5)}]}>
              <View
                style={[
                  styles.iconWrapper,
                  {
                    width: wp(20),
                    height: wp(20),
                    borderRadius: wp(10),
                    marginBottom: hp(2.5),
                  },
                ]}>
                <Text style={[styles.icon, {fontSize: wp(10)}]}>🔗</Text>
              </View>
              <Text style={[styles.connectTitle, {marginBottom: hp(1)}]}>
                Connect Your Wallet
              </Text>
              <Text
                style={[
                  styles.connectSubtitle,
                  {marginBottom: hp(3), lineHeight: hp(2.5)},
                ]}>
                Link your MetaMask to start transferring USDT
              </Text>
              <Button
                title="Connect MetaMask"
                onPress={handleConnect}
                loading={connecting}
                style={styles.connectButton}
              />
            </View>
          ) : (
            <>
              <View style={[styles.walletHeader, {marginBottom: hp(2.5)}]}>
                <View
                  style={[
                    styles.connectedBadge,
                    {
                      paddingHorizontal: wp(3),
                      paddingVertical: hp(0.8),
                      borderRadius: wp(5),
                    },
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        width: wp(2),
                        height: wp(2),
                        borderRadius: wp(1),
                        marginRight: wp(1.5),
                      },
                    ]}
                  />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <Button
                  title="Disconnect"
                  onPress={handleDisconnect}
                  variant="secondary"
                  style={{
                    paddingVertical: hp(1),
                    paddingHorizontal: wp(4),
                    minHeight: hp(4.5),
                  }}
                  textStyle={styles.disconnectBtnText}
                />
              </View>

              <View
                style={[
                  styles.addressCard,
                  {
                    padding: wp(4),
                    borderRadius: wp(3),
                    marginBottom: hp(2.5),
                  },
                ]}>
                <Text style={[styles.addressLabel, {marginBottom: hp(0.8)}]}>
                  Wallet Address
                </Text>
                <Text style={styles.addressText}>
                  {walletState.address?.slice(0, 10)}...
                  {walletState.address?.slice(-8)}
                </Text>
              </View>

              <View style={[styles.balancesGrid, {gap: wp(3)}]}>
                <View
                  style={[
                    styles.balanceCard,
                    {padding: wp(4), borderRadius: wp(3)},
                  ]}>
                  <Text style={[styles.balanceLabel, {marginBottom: hp(1)}]}>
                    Native Balance
                  </Text>
                  <Text style={[styles.balanceAmount, {marginBottom: hp(0.5)}]}>
                    {parseFloat(walletState.balance).toFixed(4)}
                  </Text>
                  <Text style={styles.balanceCurrency}>
                    {selectedNetwork === 'ETH' || selectedNetwork === 'SEPOLIA'
                      ? 'ETH'
                      : selectedNetwork === 'POL'
                        ? 'MATIC'
                        : 'BNB'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.balanceCard,
                    styles.usdtCard,
                    {padding: wp(4), borderRadius: wp(3)},
                  ]}>
                  <Text style={[styles.balanceLabel, {marginBottom: hp(1)}]}>
                    USDT Balance
                  </Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      styles.usdtAmount,
                      {marginBottom: hp(0.5)},
                    ]}>
                    {loadingBalance
                      ? '...'
                      : parseFloat(usdtBalance).toFixed(2)}
                  </Text>
                  <Text style={styles.usdtLabel}>USDT</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {isConnected && (
          <View
            style={[
              styles.card,
              {
                borderRadius: wp(5),
                paddingHorizontal: wp(6),
                paddingVertical: hp(2),
                marginTop: hp(2),
              },
            ]}>
            <Text style={[styles.sectionTitle, {marginBottom: hp(2.5)}]}>
              Send USDT
            </Text>

            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onSelect={handleNetworkChange}
              label="Network"
            />

            <Input
              label="Amount"
              value={amount}
              onChangeText={text => {
                setAmount(text);
                setAmountError('');
              }}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={amountError}
            />

            <Input
              label="Recipient Address"
              value={recipientAddress}
              onChangeText={text => {
                setRecipientAddress(text);
                setAddressError('');
              }}
              placeholder="0x..."
              autoCapitalize="none"
              autoCorrect={false}
              error={addressError}
            />

            <Button
              title="Send USDT"
              onPress={handleSend}
              loading={transacting}
              disabled={!isConnected}
              style={{marginTop: hp(1)}}
            />
          </View>
        )}
      </ScrollView>

      <QRCodeModal
        visible={!!uri && !isConnected}
        uri={uri || ''}
        onClose={handleCancelConnection}
      />

      <StatusModal
        visible={statusModalVisible}
        status={transactionStatus}
        message={statusMessage}
        txHash={currentTxHash}
        onClose={handleCloseStatusModal}
        onViewTransaction={handleViewTransaction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  header: {},
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  card: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  connectSection: {
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {},
  connectTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  connectSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  connectButton: {
    width: '100%',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F4610',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusDot: {
    backgroundColor: '#10B981',
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  disconnectBtnText: {
    fontSize: 13,
  },
  addressCard: {
    backgroundColor: '#0F172A',
  },
  addressLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  balancesGrid: {
    flexDirection: 'row',
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  usdtCard: {
    backgroundColor: '#10B98110',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  balanceLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  usdtAmount: {
    color: '#10B981',
  },
  balanceCurrency: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  usdtLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
