import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { notificationService } from '../services/NotificationService';

interface UseCapacitorNotificationsReturn {
  isNative: boolean;
  isInitialized: boolean;
  hasPermission: boolean;
  pushToken: string | null;
  requestPermissions: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string) => Promise<void>;
  scheduleNotification: (title: string, body: string, date: Date) => Promise<void>;
  testNotification: () => Promise<void>;
}

export function useCapacitorNotifications(): UseCapacitorNotificationsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    initializeNotifications();

    return () => {
      if (isNative) {
        notificationService.removeAllListeners();
      }
    };
  }, [isNative]);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      setIsInitialized(true);

      const permissions = await notificationService.checkPermissions();
      setHasPermission(permissions.granted);

      const token = notificationService.getToken();
      if (token) {
        setPushToken(token);
      }

      console.log('[useCapacitorNotifications] Initialized:', {
        isNative,
        hasPermission: permissions.granted,
        token
      });
    } catch (error) {
      console.error('[useCapacitorNotifications] Initialization error:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);

      if (granted) {
        const token = notificationService.getToken();
        if (token) {
          setPushToken(token);
        }
      }

      return granted;
    } catch (error) {
      console.error('[useCapacitorNotifications] Permission request error:', error);
      return false;
    }
  };

  const sendLocalNotification = async (title: string, body: string): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          console.warn('Cannot send notification: permission not granted');
          return;
        }
      }

      await notificationService.sendLocalNotification(title, body);
      console.log('[useCapacitorNotifications] Notification sent:', { title, body });
    } catch (error) {
      console.error('[useCapacitorNotifications] Send notification error:', error);
      throw error;
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    date: Date
  ): Promise<void> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          console.warn('Cannot schedule notification: permission not granted');
          return;
        }
      }

      await notificationService.scheduleLocalNotification(title, body, date);
      console.log('[useCapacitorNotifications] Notification scheduled:', { title, body, date });
    } catch (error) {
      console.error('[useCapacitorNotifications] Schedule notification error:', error);
      throw error;
    }
  };

  const testNotification = async (): Promise<void> => {
    try {
      await sendLocalNotification(
        'Test Wallfin',
        'Ceci est une notification de test!'
      );
    } catch (error) {
      console.error('[useCapacitorNotifications] Test notification error:', error);
    }
  };

  return {
    isNative,
    isInitialized,
    hasPermission,
    pushToken,
    requestPermissions,
    sendLocalNotification,
    scheduleNotification,
    testNotification,
  };
}
