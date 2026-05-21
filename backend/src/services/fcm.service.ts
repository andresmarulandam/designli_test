import admin from 'firebase-admin';

let initialized = false;

export const initFirebase = (): void => {
  if (initialized) return;

  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    initialized = true;
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin error:', error);
  }
};

export const sendPriceAlertNotification = async (fcmToken: string, symbol: string, currentPrice: number, targetPrice: number): Promise<void> => {
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: `Price Alert: ${symbol}`,
        body: `${symbol} reached $${currentPrice.toFixed(2)} (target: $${targetPrice.toFixed(2)})`,
      },
    });
    console.log(`Notification sent for ${symbol}`);
  } catch (error) {
    console.error('Error sending FCM notification:', error);
  }
};
