import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import {NetworkType} from '../types';
import {useResponsive} from '../hooks';

interface NetworkOption {
  label: string;
  value: NetworkType;
  symbol: string;
}

const NETWORK_OPTIONS: NetworkOption[] = [
  {label: 'Sepolia (Testnet)', value: 'SEPOLIA', symbol: 'TEST'},
  {label: 'Ethereum', value: 'ETH', symbol: 'ETH'},
  {label: 'Polygon', value: 'POL', symbol: 'MATIC'},
  {label: 'BNB Smart Chain', value: 'BNB', symbol: 'BNB'},
];

interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onSelect: (network: NetworkType) => void;
  label?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onSelect,
  label = 'Select Network',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {wp, hp} = useResponsive();

  const selectedOption = NETWORK_OPTIONS.find(
    opt => opt.value === selectedNetwork,
  );

  const handleSelect = (network: NetworkType) => {
    onSelect(network);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, {marginBottom: hp(2.5)}]}>
      <Text style={[styles.label, {marginBottom: hp(1)}]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            borderRadius: wp(3),
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.8),
          },
        ]}
        onPress={() => setModalVisible(true)}>
        <View style={styles.selectedValue}>
          <View
            style={[
              styles.networkBadge,
              {
                paddingHorizontal: wp(2.5),
                paddingVertical: hp(0.5),
                borderRadius: wp(1.5),
                marginRight: wp(2.5),
              },
            ]}>
            <Text style={styles.networkSymbol}>{selectedOption?.symbol}</Text>
          </View>
          <Text style={styles.selectedText}>{selectedOption?.label}</Text>
        </View>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                borderTopLeftRadius: wp(5),
                borderTopRightRadius: wp(5),
                paddingBottom: hp(5),
              },
            ]}>
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: wp(5),
                  paddingVertical: hp(2.5),
                },
              ]}>
              <Text style={styles.modalTitle}>Select Network</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={NETWORK_OPTIONS}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedNetwork && styles.selectedOption,
                    {
                      paddingHorizontal: wp(5),
                      paddingVertical: hp(2),
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}>
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.networkBadge,
                        {
                          paddingHorizontal: wp(2.5),
                          paddingVertical: hp(0.5),
                          borderRadius: wp(1.5),
                        },
                      ]}>
                      <Text style={styles.networkSymbol}>{item.symbol}</Text>
                    </View>
                    <View style={[styles.optionTextContainer, {marginLeft: wp(1)}]}>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                      <Text style={[styles.optionValue, {marginTop: hp(0.3)}]}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                  {item.value === selectedNetwork && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkBadge: {
    backgroundColor: '#10B98115',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  networkSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  selectedText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 12,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#94A3B8',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  selectedOption: {
    backgroundColor: '#0F172A',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {},
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionValue: {
    fontSize: 12,
    color: '#94A3B8',
  },
  checkmark: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: '700',
  },
});
