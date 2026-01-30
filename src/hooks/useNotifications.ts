import { useState, useEffect } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  data?: any;
}

interface UseNotificationsReturn {
  permission: NotificationPermission | null;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission | null>;
  showNotification: (options: NotificationOptions) => Promise<void>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission | null> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      console.log('Notification permission:', result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  };

  const showNotification = async (options: NotificationOptions): Promise<void> => {
    if (!isSupported) {
      console.warn('Notifications are not supported');
      return;
    }

    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const notificationOptions: NotificationOptions = {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.svg',
        badge: options.badge || '/icons/icon-72x72.svg',
        tag: options.tag || 'wallfin-notification',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        data: options.data || {}
      };

      await registration.showNotification(options.title, notificationOptions);
      console.log('Notification shown:', options.title);
    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  };

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return existingSubscription;
      }

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured. Push notifications will use basic mode.');
      }

      const subscriptionOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        ...(vapidPublicKey && {
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
      };

      const subscription = await registration.pushManager.subscribe(subscriptionOptions);
      console.log('Subscribed to push notifications:', subscription);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return result;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
