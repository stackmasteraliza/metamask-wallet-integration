import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {TransactionStatus} from '../types';
import {useResponsive} from '../hooks';

interface StatusModalProps {
  visible: boolean;
  status: TransactionStatus;
  message: string;
  txHash?: string;
  onClose: () => void;
  onViewTransaction?: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  status,
  message,
  txHash,
  onClose,
  onViewTransaction,
}) => {
  const {wp, hp} = useResponsive();

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <ActivityIndicator size="large" color="#10B981" />;
      case 'success':
        return <Text style={styles.successIcon}>✓</Text>;
      case 'error':
        return <Text style={styles.errorIcon}>✕</Text>;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'pending':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'pending':
        return 'Transaction Pending';
      case 'success':
        return 'Transaction Successful';
      case 'error':
        return 'Transaction Failed';
      default:
        return '';
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={[styles.overlay, {padding: wp(5)}]}>
        <View
          style={[
            styles.modalContent,
            {
              borderRadius: wp(5),
              padding: wp(7),
              maxWidth: wp(90),
            },
          ]}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${getStatusColor()}15`,
                width: wp(20),
                height: wp(20),
                borderRadius: wp(10),
                marginBottom: hp(2.5),
              },
            ]}>
            {getStatusIcon()}
          </View>

          <Text style={[styles.title, {marginBottom: hp(1.2)}]}>
            {getTitle()}
          </Text>
          <Text style={[styles.message, {marginBottom: hp(2.5), lineHeight: hp(2.5)}]}>
            {message}
          </Text>

          {txHash && (
            <View
              style={[
                styles.txHashContainer,
                {
                  padding: wp(3),
                  borderRadius: wp(2),
                  marginBottom: hp(2.5),
                },
              ]}>
              <Text style={[styles.txHashLabel, {marginBottom: hp(0.5)}]}>
                Transaction Hash:
              </Text>
              <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="middle">
                {txHash}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {status === 'success' && txHash && onViewTransaction && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.viewButton,
                  {
                    paddingVertical: hp(1.8),
                    borderRadius: wp(3),
                    marginBottom: hp(1.2),
                  },
                ]}
                onPress={onViewTransaction}>
                <Text style={styles.viewButtonText}>View on Explorer</Text>
              </TouchableOpacity>
            )}

            {status !== 'pending' && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.closeButton,
                  {
                    paddingVertical: hp(1.8),
                    borderRadius: wp(3),
                    marginBottom: hp(1.2),
                  },
                ]}
                onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: '#10B981',
    fontWeight: '700',
  },
  errorIcon: {
    fontSize: 48,
    color: '#EF4444',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  txHashContainer: {
    backgroundColor: '#0F172A',
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  txHashLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  txHash: {
    fontSize: 12,
    color: '#E2E8F0',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#10B981',
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#334155',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
