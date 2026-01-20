import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class HapticsService {
  private isNative = Capacitor.isNativePlatform();

  async impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isNative) {
      this.vibrateWeb(10);
      return;
    }

    try {
      const impactStyle =
        style === 'light' ? ImpactStyle.Light :
        style === 'heavy' ? ImpactStyle.Heavy :
        ImpactStyle.Medium;

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.isNative) {
      const pattern = type === 'error' ? [10, 50, 10] : [10];
      this.vibrateWeb(pattern);
      return;
    }

    try {
      const notificationType =
        type === 'success' ? NotificationType.Success :
        type === 'warning' ? NotificationType.Warning :
        NotificationType.Error;

      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  async selection(): Promise<void> {
    if (!this.isNative) {
      this.vibrateWeb(5);
      return;
    }

    try {
      await Haptics.selectionStart();
      setTimeout(async () => {
        await Haptics.selectionEnd();
      }, 50);
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  async vibrate(duration: number = 100): Promise<void> {
    if (!this.isNative) {
      this.vibrateWeb(duration);
      return;
    }

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('Haptics not available:', error);
    }
  }

  private vibrateWeb(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const hapticsService = new HapticsService();
