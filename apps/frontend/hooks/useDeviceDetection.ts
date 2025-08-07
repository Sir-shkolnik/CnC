import { useState, useEffect } from 'react';
import { DeviceType } from '@/utils/interfaceDetection';

export interface DeviceInfo {
  deviceType: DeviceType;
  screenSize: {
    width: number;
    height: number;
  };
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  userAgent: string;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: 'desktop',
    screenSize: { width: 0, height: 0 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    pixelRatio: 1,
    userAgent: ''
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      const userAgent = navigator.userAgent;

      // Determine device type based on screen width
      let deviceType: DeviceType = 'desktop';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      if (width < 768) {
        deviceType = 'mobile';
        isMobile = true;
        isTablet = false;
        isDesktop = false;
      } else if (width < 1024) {
        deviceType = 'mobile'; // Treat tablets as mobile for our purposes
        isMobile = false;
        isTablet = true;
        isDesktop = false;
      } else {
        deviceType = 'desktop';
        isMobile = false;
        isTablet = false;
        isDesktop = true;
      }

      // Determine orientation
      const orientation: 'portrait' | 'landscape' = width > height ? 'landscape' : 'portrait';

      setDeviceInfo({
        deviceType,
        screenSize: { width, height },
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        pixelRatio,
        userAgent
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize events
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    // Cleanup
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
};

// ===== UTILITY FUNCTIONS =====
export const getBreakpoint = (width: number): string => {
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const getDeviceCapabilities = () => {
  if (typeof window === 'undefined') return {};

  return {
    hasGPS: 'geolocation' in navigator,
    hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    hasTouch: isTouchDevice(),
    hasPWA: isPWA(),
    hasOffline: 'serviceWorker' in navigator,
    hasPushNotifications: 'PushManager' in window,
    hasWebGL: !!window.WebGLRenderingContext,
    hasWebAudio: !!window.AudioContext || !!(window as any).webkitAudioContext
  };
}; 