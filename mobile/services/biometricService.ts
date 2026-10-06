import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricStatus {
  isAvailable: boolean;
  hasEnrolled: boolean;
  biometryType: string;
}

export async function checkBiometricStatus(): Promise<BiometricStatus> {
  if (Platform.OS === 'web') {
    return { isAvailable: false, hasEnrolled: false, biometryType: 'None' };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometryType = 'Biometrics';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryType = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryType = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    }

    return {
      isAvailable: hasHardware,
      hasEnrolled: isEnrolled,
      biometryType
    };
  } catch (err) {
    console.warn('[Biometrics] Error checking status:', err);
    return { isAvailable: false, hasEnrolled: false, biometryType: 'None' };
  }
}

export async function authenticateWithBiometrics(
  reason = 'Unlock Galaxy Finance Command Center'
): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  try {
    const status = await checkBiometricStatus();
    if (!status.isAvailable || !status.hasEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    return result.success;
  } catch (err) {
    console.warn('[Biometrics] Authentication error:', err);
    return false;
  }
}
