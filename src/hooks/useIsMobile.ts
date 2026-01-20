import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface PlatformInfo {
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isMobile: boolean;
  platform: 'ios' | 'android' | 'web';
  screenWidth: number;
  screenHeight: number;
}

export function useIsMobile(): PlatformInfo {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isWeb = platform === 'web';
  const isMobile = isNative || screenWidth < 768;

  return {
    isNative,
    isIOS,
    isAndroid,
    isWeb,
    isMobile,
    platform,
    screenWidth,
    screenHeight,
  };
}
