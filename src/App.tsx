/**
 * Push Notification Tester
 * A mobile-friendly web application for testing mobile push notifications,
 * interval scheduling, Service Worker delivery, and background behavior.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { StatsDisplay } from './components/StatsDisplay';
import { ControlPanel } from './components/ControlPanel';
import { SettingsBar } from './components/SettingsBar';
import { NotificationLog } from './components/NotificationLog';
import { MobileGuideModal } from './components/MobileGuideModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  NotificationPermissionState,
  NotificationLogItem,
  getPermissionState,
  requestPermission,
  registerServiceWorker,
  deliverNotification,
  isServiceWorkerSupported,
} from './services/notificationService';
import { ResilientTimer } from './services/timerEngine';
import { useWakeLock } from './hooks/useWakeLock';
import { Info, HelpCircle } from 'lucide-react';

export default function App() {
  // Notification permission & system state
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [visibilityState, setVisibilityState] = useState<'foreground' | 'background'>('foreground');

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

  // Initialize permissions, service worker, and visibility listener on mount
  useEffect(() => {
    // Check permission
    const currentPerm = getPermissionState();
    setPermission(currentPerm);

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

      const result = await deliverNotification({
        title,
        body,
        count: nextCount,
        playSound: playSoundRef.current,
        vibrate: vibrateRef.current,
        tag: `push-test-notification-${isManualTest ? 'instant' : nextCount}`,
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
    const res = await requestPermission();
    setPermission(res);

    if (res === 'denied') {
      setShowGuideModal(true);
    }
  };

  // Start Schedule
  const handleStartSchedule = () => {
    if (permission !== 'granted') {
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
    if (permission !== 'granted') {
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
      {/* Top Header */}
      <Header onOpenGuide={() => setShowGuideModal(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* PWA Install Banner (only renders if browser install is available) */}
        <div className="flex justify-end">
          <PWAInstallButton />
        </div>

        {/* 1. Status Indicator Card */}
        <StatusCard
          permission={permission}
          isServiceWorkerReady={isServiceWorkerReady}
          isScheduleRunning={isScheduleRunning}
          intervalSeconds={intervalSeconds}
          visibilityState={visibilityState}
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
              Testing on Mobile Phone (Android Chrome)
            </span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-blue-400 hover:text-blue-300 underline font-normal flex items-center gap-1 cursor-pointer"
            >
              <span>Full Details</span>
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed">
            1. Tap <strong>Enable Notifications</strong> and allow permission. <br />
            2. Tap <strong>Start Loop (30s)</strong> or <strong>Send Instant Test</strong>. <br />
            3. Switch to WhatsApp or lock screen — notifications will appear in your Android system shade.
          </p>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
            Note: Mobile Chrome suspends inactive timers after several minutes to save battery. Permanent background wakeups without an open browser require the Web Push protocol (VAPID + Push Service).
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400">
        <p>Push Notification Tester • Browser Notification &amp; Service Worker Standard</p>
      </footer>

      {/* Mobile Testing & Background Guide Modal */}
      <MobileGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
