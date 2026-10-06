import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';

// Detect whether the app is executing inside Expo Go
export const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH
  })
});

export interface PushRegistrationResult {
  status: 'registered' | 'expo_go' | 'unsupported_device' | 'denied' | 'error';
  token: string | null;
  message: string;
}

/**
 * Safely registers for remote push notifications.
 * Automatically checks environment:
 * - If inside Expo Go: Skips remote push token generation without throwing/crashing.
 * - If inside Development Build or Standalone Build: Safely requests permission and registers token.
 */
export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return {
      status: 'unsupported_device',
      token: null,
      message: 'Web platform does not support mobile push notifications.'
    };
  }

  // Section 3 & 4: In Expo Go with SDK 53+, remote notifications must be bypassed
  if (isExpoGo) {
    console.info(
      '[PushNotification] Remote push notifications require a Development Build (unsupported in Expo Go since SDK 53). Local alerts and in-app notifications remain fully active.'
    );
    return {
      status: 'expo_go',
      token: null,
      message: 'Push notifications require a Development Build. Local alerts active.'
    };
  }

  if (!Device.isDevice) {
    return {
      status: 'unsupported_device',
      token: null,
      message: 'Push notifications require a physical device.'
    };
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        status: 'denied',
        token: null,
        message: 'Notification permissions were denied.'
      };
    }

    // Android notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Galaxy Finance Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
        enableLights: true,
        enableVibrate: true
      });
    }

    // Get token using projectId from configuration
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    ).catch(err => {
      console.warn('[PushToken] Error retrieving Expo push token:', err);
      return null;
    });

    const token = tokenData ? tokenData.data : null;

    if (token) {
      await api.registerPushToken(token).catch(err => {
        console.warn('[PushToken] Could not register with backend:', err);
      });
      return {
        status: 'registered',
        token,
        message: 'Registered for push notifications.'
      };
    }

    return {
      status: 'error',
      token: null,
      message: 'Notifications are currently unavailable.'
    };
  } catch (err: any) {
    console.warn('[PushNotification] Registration error:', err);
    return {
      status: 'error',
      token: null,
      message: 'Notifications are currently unavailable.'
    };
  }
}

/**
 * Schedules a local device alert (e.g. Budget warnings, sync confirmations).
 * Works reliably across Expo Go, Development Builds, and Production Builds.
 */
export async function sendLocalNotification(title: string, body: string, data: any = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true
      },
      trigger: null // immediate trigger
    });
  } catch (err) {
    console.warn('[LocalNotification] Send error:', err);
  }
}
