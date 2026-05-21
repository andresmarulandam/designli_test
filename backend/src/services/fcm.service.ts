import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let initialized = false;

export const initFirebase = (): void => {
  if (initialized) return;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }

    initialized = true;
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
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
