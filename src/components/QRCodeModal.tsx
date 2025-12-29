import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, {Path} from 'react-native-svg';
import {useResponsive} from '../hooks';

interface QRCodeModalProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  uri,
  onClose,
}) => {
  const [showQR, setShowQR] = useState(false);
  const {wp, hp} = useResponsive();

  if (!uri) return null;

  const handleOpenWeb = () => {
    const metamaskUrl = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
    Linking.openURL(metamaskUrl).catch(err =>
      console.error('Failed to open MetaMask:', err),
    );
    onClose();
  };

  const handleScanQR = () => {
    setShowQR(true);
  };

  const handleBack = () => {
    setShowQR(false);
  };

  const handleClose = () => {
    setShowQR(false);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View style={[styles.overlay, {padding: wp(5)}]}>
        <View
          style={[
            styles.modalContent,
            {
              maxWidth: wp(90),
              padding: wp(6),
              paddingVertical: hp(3),
              borderRadius: wp(5),
            },
          ]}>
          {!showQR ? (
            <>
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

              <Text style={[styles.title, {marginBottom: hp(1)}]}>
                Connect to MetaMask
              </Text>
              <Text style={[styles.subtitle, {marginBottom: hp(3.5)}]}>
                Choose how you want to connect your wallet
              </Text>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    padding: wp(4),
                    marginBottom: hp(1.5),
                    borderRadius: wp(3),
                  },
                ]}
                onPress={handleScanQR}>
                <View
                  style={[
                    styles.optionIcon,
                    {
                      width: wp(12),
                      height: wp(12),
                      borderRadius: wp(6),
                      marginRight: wp(3),
                    },
                  ]}>
                  <Text style={[styles.optionEmoji, {fontSize: wp(6)}]}>📱</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Scan QR Code</Text>
                  <Text style={styles.optionDescription}>
                    Use MetaMask mobile app to scan
                  </Text>
                </View>
                <Text style={[styles.arrow, {marginLeft: wp(2)}]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    padding: wp(4),
                    marginBottom: hp(1.5),
                    borderRadius: wp(3),
                  },
                ]}
                onPress={handleOpenWeb}>
                <View
                  style={[
                    styles.optionIcon,
                    {
                      width: wp(12),
                      height: wp(12),
                      borderRadius: wp(6),
                      marginRight: wp(3),
                    },
                  ]}>
                  <Text style={[styles.optionEmoji, {fontSize: wp(6)}]}>🌐</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Open in Browser</Text>
                  <Text style={styles.optionDescription}>
                    Connect via MetaMask web link
                  </Text>
                </View>
                <Text style={[styles.arrow, {marginLeft: wp(2)}]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, {marginTop: hp(1), paddingVertical: hp(1.5)}]}
                onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.backButton, {marginBottom: hp(2.5), paddingVertical: hp(1)}]}>
                <Svg width={wp(6)} height={wp(6)} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M15 18L9 12L15 6"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <View style={styles.qrSection}>
                <View
                  style={[
                    styles.qrContainer,
                    {
                      padding: wp(5),
                      borderRadius: wp(3),
                      marginBottom: hp(3),
                    },
                  ]}>
                  <QRCode value={uri} size={wp(55)} />
                </View>

                <Text style={[styles.qrTitle, {marginBottom: hp(1.5)}]}>
                  Scan with MetaMask
                </Text>
                <Text style={[styles.qrInstructions, {marginBottom: hp(2.5)}]}>
                  Open MetaMask mobile app → Tap menu (☰) → Select "Scan QR
                  code"
                </Text>

                <Text style={styles.waitingText}>Waiting for connection...</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {},
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionIcon: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionEmoji: {},
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 24,
    color: '#64748B',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#10B981',
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  waitingText: {
    fontSize: 14,
    color: '#10B981',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
