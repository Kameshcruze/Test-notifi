/**
 * Push Notification Tester
 * A mobile-friendly web application for testing mobile push notifications,
 * interval scheduling, Service Worker delivery, and background behavior
 * across Android, iOS, and Desktop browsers.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { StatsDisplay } from './components/StatsDisplay';
import { ControlPanel } from './components/ControlPanel';
import { SettingsBar } from './components/SettingsBar';
import { NotificationLog } from './components/NotificationLog';
import { MobileGuideModal } from './components/MobileGuideModal';
import { IOSGuideModal } from './components/IOSGuideModal';
import { InAppNotificationToast, ToastPayload } from './components/InAppNotificationToast';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  NotificationPermissionState,
  NotificationLogItem,
  getPermissionState,
  requestPermission,
  registerServiceWorker,
  deliverNotification,
  isServiceWorkerSupported,
  isIOS,
  isStandalone,
} from './services/notificationService';
import { ResilientTimer } from './services/timerEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { Info, HelpCircle, Smartphone, ArrowRight } from 'lucide-react';

export default function App() {
  // Notification permission & system state
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [visibilityState, setVisibilityState] = useState<'foreground' | 'background'>('foreground');
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  // In-App Simulation Mode (useful for iOS browser tabs before Home Screen install)
  const [inAppModeActive, setInAppModeActive] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);

  // Schedule & Counter state
  const [isScheduleRunning, setIsScheduleRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [intervalSeconds, setIntervalSeconds] = useState(30);

  // User Settings
  const [playSound, setPlaySound] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [isSendingInstant, setIsSendingInstant] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Delivery log
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);

  // Wake Lock Hook
  const { isSupported: wakeLockSupported, isLocked: wakeLockActive, requestLock, releaseLock } = useWakeLock();

  // Refs for timer and fresh values
  const timerRef = useRef<ResilientTimer | null>(null);
  const counterRef = useRef(counter);
  counterRef.current = counter;

  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  const vibrateRef = useRef(vibrate);
  vibrateRef.current = vibrate;

  const inAppModeRef = useRef(inAppModeActive);
  inAppModeRef.current = inAppModeActive;

  // Initialize permissions, service worker, and visibility listener on mount
  useEffect(() => {
    const ios = isIOS();
    const standalone = isStandalone();
    setIsIOSDevice(ios);
    setIsStandaloneApp(standalone);

    // Check permission state
    const currentPerm = getPermissionState();
    setPermission(currentPerm);

    // Auto-open iOS guide or prompt if on iOS in browser tab
    if (ios && !standalone) {
      // In iOS Safari tab, enable in-app fallback by default so testing works out of the box
      setInAppModeActive(true);
    }

    // Register Service Worker
    if (isServiceWorkerSupported()) {
      registerServiceWorker().then((reg) => {
        if (reg) {
          setIsServiceWorkerReady(true);
        }
      });
    }

    // Visibility listener to track when user switches to WhatsApp or other apps
    const handleVisibility = () => {
      const state = document.visibilityState === 'visible' ? 'foreground' : 'background';
      setVisibilityState(state);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Deliver notification function
  const triggerNotification = useCallback(
    async (isManualTest = false) => {
      const nextCount = counterRef.current + 1;
      setCounter(nextCount);
      const now = new Date();
      setLastNotificationTime(now);

      const title = 'Test Notification';
      const body = isManualTest
        ? 'This is a test notification.'
        : `This is a test notification. (#${nextCount})`;

      // Always trigger in-app toast if in-app mode active or if Notification API not available
      if (inAppModeRef.current || !('Notification' in window) || Notification.permission !== 'granted') {
        setActiveToast({
          id: `${Date.now()}`,
          count: nextCount,
          title,
          body,
          timestamp: now,
        });
      }

      const result = await deliverNotification({
        title,
        body,
        count: nextCount,
        playSound: playSoundRef.current,
        vibrate: vibrateRef.current,
        tag: `push-test-notification-${isManualTest ? 'instant' : nextCount}`,
        allowInAppFallback: inAppModeRef.current,
      });

      const currentVisibility =
        document.visibilityState === 'visible' ? 'foreground' : 'background';

      const logItem: NotificationLogItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        count: nextCount,
        title,
        body,
        timestamp: now,
        deliveryMethod: result.method,
        visibilityState: currentVisibility,
        success: result.success,
        error: result.error,
      };

      setLogs((prev) => [logItem, ...prev].slice(0, 100));
    },
    []
  );

  // Initialize and manage timer engine
  useEffect(() => {
    const timer = new ResilientTimer(
      intervalSeconds,
      () => {
        triggerNotification(false);
      },
      (secsLeft) => {
        setRemainingSeconds(secsLeft);
      }
    );

    timerRef.current = timer;

    return () => {
      timer.destroy();
    };
  }, [intervalSeconds, triggerNotification]);

  // Request Notification Permission
  const handleEnableNotifications = async () => {
    if (isIOSDevice && !isStandaloneApp && !('Notification' in window)) {
      setShowIOSGuide(true);
      return;
    }

    const res = await requestPermission();
    setPermission(res);

    if (res === 'ios-requires-pwa') {
      setShowIOSGuide(true);
    } else if (res === 'denied') {
      setShowGuideModal(true);
    }
  };

  // Start Schedule
  const handleStartSchedule = () => {
    if (permission !== 'granted' && !inAppModeActive) {
      handleEnableNotifications();
      return;
    }

    if (timerRef.current && !timerRef.current.getIsRunning()) {
      timerRef.current.start();
      setIsScheduleRunning(true);
    }
  };

  // Stop Schedule
  const handleStopSchedule = () => {
    if (timerRef.current && timerRef.current.getIsRunning()) {
      timerRef.current.stop();
      setIsScheduleRunning(false);
      setRemainingSeconds(intervalSeconds);
    }
  };

  // Instant Test Notification
  const handleTriggerInstantTest = async () => {
    if (permission !== 'granted' && !inAppModeActive) {
      handleEnableNotifications();
      return;
    }

    setIsSendingInstant(true);
    try {
      await triggerNotification(true);
    } finally {
      setTimeout(() => setIsSendingInstant(false), 500);
    }
  };

  // Change interval
  const handleChangeInterval = (newSecs: number) => {
    setIntervalSeconds(newSecs);
    setRemainingSeconds(newSecs);
    if (timerRef.current) {
      timerRef.current.setIntervalSeconds(newSecs);
    }
  };

  // Toggle Wake Lock
  const handleToggleWakeLock = async () => {
    if (wakeLockActive) {
      await releaseLock();
    } else {
      await requestLock();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Floating In-App iOS Notification Banner */}
      <InAppNotificationToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Top Header */}
      <Header onOpenGuide={() => setShowGuideModal(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* iOS Notice Banner (Only shown if testing in iPhone/iPad browser tab before Home Screen) */}
        {isIOSDevice && !isStandaloneApp && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/60 p-3.5 shadow-lg flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Testing on iPhone / iPad?</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-medium">
                  Apple Rule
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                Apple requires web apps to be <strong>Added to Home Screen</strong> (iOS 16.4+) to trigger native system notifications.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1 underline cursor-pointer"
                >
                  <span>View 3-Step Setup Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PWA Install Banner (Android / Desktop) */}
        {!isIOSDevice && (
          <div className="flex justify-end">
            <PWAInstallButton />
          </div>
        )}

        {/* 1. Status Indicator Card */}
        <StatusCard
          permission={permission}
          isServiceWorkerReady={isServiceWorkerReady}
          isScheduleRunning={isScheduleRunning}
          intervalSeconds={intervalSeconds}
          visibilityState={visibilityState}
          isIOSDevice={isIOSDevice}
          onOpenIOSGuide={() => setShowIOSGuide(true)}
          inAppModeActive={inAppModeActive}
        />

        {/* 2. Counter and Last Delivered Time Display */}
        <StatsDisplay
          counter={counter}
          lastNotificationTime={lastNotificationTime}
          remainingSeconds={remainingSeconds}
          intervalSeconds={intervalSeconds}
          isScheduleRunning={isScheduleRunning}
        />

        {/* 3. Primary Controls (Enable, Start, Stop, Instant) */}
        <ControlPanel
          permission={permission}
          isScheduleRunning={isScheduleRunning}
          onEnableNotifications={handleEnableNotifications}
          onStartSchedule={handleStartSchedule}
          onStopSchedule={handleStopSchedule}
          onTriggerInstantTest={handleTriggerInstantTest}
          isSendingInstant={isSendingInstant}
          isIOSDevice={isIOSDevice}
          onOpenIOSGuide={() => setShowIOSGuide(true)}
          inAppModeActive={inAppModeActive}
          onToggleInAppMode={() => setInAppModeActive(!inAppModeActive)}
        />

        {/* 4. Settings (Interval, Sound, Vibration, Screen Wake Lock) */}
        <SettingsBar
          intervalSeconds={intervalSeconds}
          onChangeInterval={handleChangeInterval}
          playSound={playSound}
          onToggleSound={() => setPlaySound(!playSound)}
          vibrate={vibrate}
          onToggleVibrate={() => setVibrate(!vibrate)}
          wakeLockSupported={wakeLockSupported}
          wakeLockActive={wakeLockActive}
          onToggleWakeLock={handleToggleWakeLock}
          isScheduleRunning={isScheduleRunning}
        />

        {/* 5. Notification Log */}
        <NotificationLog logs={logs} onClearLogs={() => setLogs([])} />

        {/* 6. Quick Explainer Callout Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Info className="w-4 h-4" />
              Mobile Testing Reference
            </span>
            <button
              onClick={() => (isIOSDevice ? setShowIOSGuide(true) : setShowGuideModal(true))}
              className="text-blue-400 hover:text-blue-300 underline font-normal flex items-center gap-1 cursor-pointer"
            >
              <span>{isIOSDevice ? 'iOS Instructions' : 'Android Guide'}</span>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed">
            {isIOSDevice ? (
              <>
                For <strong>system notifications</strong> on iPhone: Tap Safari Share icon ➔ <strong>Add to Home Screen</strong> ➔ Launch from Home Screen. Or use <strong>In-App Mode</strong> right here in this browser tab.
              </>
            ) : (
              <>
                1. Tap <strong>Enable Notifications</strong> and allow permission. <br />
                2. Tap <strong>Start Loop (30s)</strong> or <strong>Send Instant Test</strong>. <br />
                3. Switch to WhatsApp or lock screen — notifications will appear in your Android system shade.
              </>
            )}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400">
        <p>Push Notification Tester • Android, iOS &amp; Web Standards</p>
      </footer>

      {/* General Android & Background Guide Modal */}
      <MobileGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Apple iOS Specific Guide Modal */}
      <IOSGuideModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
        onEnableInAppMode={() => setInAppModeActive(true)}
        inAppModeActive={inAppModeActive}
      />
    </div>
  );
}
