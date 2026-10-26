/**
 * Service to manage Web Notifications, Service Worker registration,
 * and audio chime feedback across mobile (Android & iOS) and desktop browsers.
 */

export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'default'
  | 'unsupported'
  | 'ios-requires-pwa';

export interface SendNotificationOptions {
  title: string;
  body: string;
  count: number;
  vibrate?: boolean;
  playSound?: boolean;
  tag?: string;
  allowInAppFallback?: boolean;
}

export interface NotificationLogItem {
  id: string;
  count: number;
  title: string;
  body: string;
  timestamp: Date;
  deliveryMethod: 'service-worker' | 'standard-api' | 'in-app-toast' | 'simulated';
  visibilityState: 'foreground' | 'background';
  success: boolean;
  error?: string;
}

/**
 * Detect Apple iOS devices (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect if web app is running in Standalone PWA mode (added to home screen)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Audio chime using Web Audio API (no external mp3 dependency required)
export function playChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell sound (two oscillators with gentle decay)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Check if the browser supports the Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if the browser supports Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get the current permission state, with special detection for iOS browser tabs
 */
export function getPermissionState(): NotificationPermissionState {
  // Apple iOS Safari / Chrome tab check:
  // Apple only enables Notification API if the app is added to Home Screen (iOS 16.4+)
  if (isIOS() && !isStandalone()) {
    if (!isNotificationSupported()) {
      return 'ios-requires-pwa';
    }
  }

  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermissionState> {
  // If on iOS and not yet installed to home screen
  if (isIOS() && !isStandalone() && !isNotificationSupported()) {
    return 'ios-requires-pwa';
  }

  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const promise = Notification.requestPermission();
    if (promise && typeof promise.then === 'function') {
      const result = await promise;
      return result;
    } else {
      // Legacy callback support for older WebKit
      return new Promise((resolve) => {
        Notification.requestPermission((result) => {
          resolve(result);
        });
      });
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notification.permission || 'denied';
  }
}

let cachedRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the Service Worker for mobile notification handling
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Wait until it is active
    await navigator.serviceWorker.ready;
    cachedRegistration = registration;
    return registration;
  } catch (error) {
    console.warn('Service Worker registration failed or unsupported in this context:', error);
    return null;
  }
}

/**
 * Deliver a notification using the Service Worker (required on Android Chrome and iOS PWA)
 * or fallback to standard new Notification() or in-app toast
 */
export async function deliverNotification(
  options: SendNotificationOptions
): Promise<{ success: boolean; method: 'service-worker' | 'standard-api' | 'in-app-toast' | 'simulated'; error?: string }> {
  if (options.playSound) {
    playChime();
  }

  const notificationOptions: NotificationOptions & { vibrate?: number[]; badge?: string } = {
    body: options.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: options.tag || `push-test-${options.count}`,
    vibrate: options.vibrate ? [200, 100, 200] : undefined,
    data: {
      count: options.count,
      sentAt: new Date().toISOString(),
    },
  };

  // 1. Try Service Worker showNotification (Crucial for Android Chrome & iOS PWA 16.4+)
  if (isServiceWorkerSupported()) {
    try {
      const reg = cachedRegistration || (await navigator.serviceWorker.ready);
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(options.title, notificationOptions);
        return { success: true, method: 'service-worker' };
      }
    } catch (swError) {
      console.warn('Service Worker showNotification failed, trying standard API:', swError);
    }
  }

  // 2. Try Standard Notification API constructor (desktop / supported mobile)
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notification = new Notification(options.title, notificationOptions);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return { success: true, method: 'standard-api' };
    } catch (apiError) {
      const msg = apiError instanceof Error ? apiError.message : String(apiError);
      console.error('Standard Notification constructor failed:', apiError);
    }
  }

  // 3. If in-app fallback allowed (e.g. iOS Safari browser tab before Add to Home Screen)
  if (options.allowInAppFallback) {
    return { success: true, method: 'in-app-toast' };
  }

  return {
    success: false,
    method: 'simulated',
    error: 'Notification permission not granted or API not supported on this browser tab',
  };
}
