import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { authApi } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device or emulator with Google Play Services');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('FCM Token:', token);

    try {
      await authApi.saveFcmToken(token);
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }

    return token;
  } catch (error) {
    console.log('Push notifications not available on this device');
    return;
  }
};

export const setupNotificationListeners = () => {
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
};
