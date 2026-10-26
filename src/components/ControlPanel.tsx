import React from 'react';
import { Play, Square, Bell, Send, Check, ShieldAlert, Smartphone, ArrowRight } from 'lucide-react';
import { NotificationPermissionState } from '../services/notificationService';

interface ControlPanelProps {
  permission: NotificationPermissionState;
  isScheduleRunning: boolean;
  onEnableNotifications: () => void;
  onStartSchedule: () => void;
  onStopSchedule: () => void;
  onTriggerInstantTest: () => void;
  isSendingInstant: boolean;
  isIOSDevice: boolean;
  onOpenIOSGuide: () => void;
  inAppModeActive: boolean;
  onToggleInAppMode: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  permission,
  isScheduleRunning,
  onEnableNotifications,
  onStartSchedule,
  onStopSchedule,
  onTriggerInstantTest,
  isSendingInstant,
  isIOSDevice,
  onOpenIOSGuide,
  inAppModeActive,
  onToggleInAppMode,
}) => {
  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';
  const isIOSRequiresPWA = permission === 'ios-requires-pwa';
  const canStart = isGranted || inAppModeActive;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Notification Controls
        </h2>
        {isScheduleRunning && (
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Active Loop
          </span>
        )}
      </div>

      {/* Button 1: Enable Notifications / iOS Action */}
      <div>
        {isIOSRequiresPWA ? (
          <div className="space-y-2">
            <button
              onClick={onOpenIOSGuide}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 active:scale-[0.98] cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-amber-100" />
              <span>iOS: Add to Home Screen to Enable</span>
            </button>

            {/* Quick in-app test toggle for iOS tab */}
            <button
              onClick={onToggleInAppMode}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                inAppModeActive
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700/60'
              }`}
            >
              <span>{inAppModeActive ? '✓ In-App Mode Active' : 'Or: Test with In-App Banner Mode'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEnableNotifications}
            disabled={isGranted}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              isGranted
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 cursor-default'
                : isDenied
                ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 active:scale-[0.98]'
            }`}
            aria-label="Enable Notifications"
          >
            {isGranted ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Notifications Enabled</span>
              </>
            ) : isDenied ? (
              <>
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Permission Denied (Tap for Help)</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 text-white animate-bounce" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
        )}

        {!isGranted && !isDenied && !isIOSRequiresPWA && (
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">
            Tap to grant browser notification permission on this device
          </p>
        )}
      </div>

      {/* Primary Actions: Start and Stop */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Start Notifications Button */}
        <button
          onClick={onStartSchedule}
          disabled={!canStart || isScheduleRunning}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            !canStart || isScheduleRunning
              ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.98] cursor-pointer'
          }`}
          aria-label="Start Notifications"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Loop (30s)</span>
        </button>

        {/* Stop Notifications Button */}
        <button
          onClick={onStopSchedule}
          disabled={!isScheduleRunning}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            !isScheduleRunning
              ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 active:scale-[0.98] cursor-pointer'
          }`}
          aria-label="Stop Notifications"
        >
          <Square className="w-4 h-4 fill-current" />
          <span>Stop Loop</span>
        </button>
      </div>

      {/* Instant 1-Click Test Button */}
      <button
        onClick={onTriggerInstantTest}
        disabled={!canStart || isSendingInstant}
        className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition active:scale-[0.99] cursor-pointer ${
          canStart
            ? 'bg-slate-800/80 hover:bg-slate-750 text-blue-300 border-blue-500/30 hover:border-blue-500/50'
            : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
        }`}
        aria-label="Send Instant Test Notification"
      >
        <Send className={`w-3.5 h-3.5 text-blue-400 ${isSendingInstant ? 'animate-spin' : ''}`} />
        <span>{isSendingInstant ? 'Sending...' : 'Send Instant Test Notification Now'}</span>
      </button>

      {/* Helper notice */}
      {!canStart && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
          <Bell className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p>
            {isIOSDevice
              ? 'On iOS Safari, tap "iOS: Add to Home Screen to Enable" to see Apple setup steps, or click "Test with In-App Banner Mode" below.'
              : 'You must click Enable Notifications and accept the prompt before starting the 30-second schedule.'}
          </p>
        </div>
      )}
    </div>
  );
};
