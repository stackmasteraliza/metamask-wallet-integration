import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import {useResponsive} from '../hooks';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  ...textInputProps
}) => {
  const {wp, hp} = useResponsive();

  return (
    <View style={[styles.container, {marginBottom: hp(2.5)}, containerStyle]}>
      <Text style={[styles.label, {marginBottom: hp(1)}]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderRadius: wp(3),
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.8),
          },
          error ? styles.inputError : null,
        ]}
        placeholderTextColor="#64748B"
        {...textInputProps}
      />
      {error ? (
        <Text style={[styles.errorText, {marginTop: hp(0.5)}]}>{error}</Text>
      ) : null}
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
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
});
