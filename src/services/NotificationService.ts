import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
}

class NotificationService {
  private pushToken: string | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      await this.initializeNativeNotifications();
    } else {
      await this.initializeWebNotifications();
    }

    this.isInitialized = true;
  }

  private async initializeNativeNotifications(): Promise<void> {
    try {
      const permissionStatus = await PushNotifications.checkPermissions();

      if (permissionStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.warn('Push notification permission denied');
          return;
        }
      }

      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();
      }

      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        this.pushToken = token.value;
        this.onTokenReceived(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          this.onNotificationReceived(notification);
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
          console.log('Push notification action performed:', notification);
          this.onNotificationActionPerformed(notification);
        }
      );

      await LocalNotifications.requestPermissions();

      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Local notification received:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Local notification action performed:', notification);
      });

    } catch (error) {
      console.error('Error initializing native notifications:', error);
    }
  }

  private async initializeWebNotifications(): Promise<void> {
    try {
      if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return;
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Web notification permission denied');
          return;
        }
      }

      if (Notification.permission === 'granted') {
        console.log('Web notifications enabled');
      }

    } catch (error) {
      console.error('Error initializing web notifications:', error);
    }
  }

  async checkPermissions(): Promise<NotificationPermissionStatus> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const result = await PushNotifications.checkPermissions();
      return {
        granted: result.receive === 'granted',
        denied: result.receive === 'denied',
      };
    } else {
      if (!('Notification' in window)) {
        return { granted: false, denied: true };
      }
      return {
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
      };
    }
  }

  async requestPermissions(): Promise<boolean> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
        return true;
      }
      return false;
    } else {
      if (!('Notification' in window)) {
        return false;
      }
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    scheduleAt?: Date
  ): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const notificationId = Math.floor(Math.random() * 1000000);

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: notificationId,
            schedule: scheduleAt ? { at: scheduleAt } : undefined,
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } else {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  async sendLocalNotification(title: string, body: string): Promise<void> {
    await this.scheduleLocalNotification(title, body);
  }

  getToken(): string | null {
    return this.pushToken;
  }

  private onTokenReceived(token: string): void {
    console.log('Push token received:', token);
  }

  private onNotificationReceived(notification: PushNotificationSchema): void {
    console.log('Notification received:', notification);
  }

  private onNotificationActionPerformed(action: ActionPerformed): void {
    console.log('Notification action:', action);
  }

  async removeAllListeners(): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      await PushNotifications.removeAllListeners();
      await LocalNotifications.removeAllListeners();
    }
  }
}

export const notificationService = new NotificationService();
