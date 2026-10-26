import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Cpu, Eye, Radio, BellRing, Smartphone } from 'lucide-react';
import { NotificationPermissionState } from '../services/notificationService';

interface StatusCardProps {
  permission: NotificationPermissionState;
  isServiceWorkerReady: boolean;
  isScheduleRunning: boolean;
  intervalSeconds: number;
  visibilityState: 'foreground' | 'background';
  isIOSDevice: boolean;
  onOpenIOSGuide: () => void;
  inAppModeActive: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  permission,
  isServiceWorkerReady,
  isScheduleRunning,
  intervalSeconds,
  visibilityState,
  isIOSDevice,
  onOpenIOSGuide,
  inAppModeActive,
}) => {
  const isEnabled = permission === 'granted';
  const isIOSRequiresPWA = permission === 'ios-requires-pwa';

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Subtle background glow when active */}
      {isScheduleRunning && (
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Main Status Banner */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : inAppModeActive
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : isIOSRequiresPWA
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : permission === 'denied'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isEnabled ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : inAppModeActive ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isIOSRequiresPWA ? (
              <Smartphone className="w-5 h-5" />
            ) : permission === 'denied' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Notification Status
            </div>
            <div className="text-base font-semibold text-white flex items-center gap-2">
              {isEnabled ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  Notifications Enabled
                </span>
              ) : inAppModeActive ? (
                <span className="text-blue-400 flex items-center gap-1.5">
                  In-App Notification Mode
                </span>
              ) : isIOSRequiresPWA ? (
                <button
                  onClick={onOpenIOSGuide}
                  className="text-amber-300 hover:text-amber-200 underline text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>iOS: Add to Home Screen</span>
                </button>
              ) : permission === 'denied' ? (
                <span className="text-rose-400">Notifications Blocked</span>
              ) : (
                <span className="text-amber-400">Permission Required</span>
              )}
            </div>
          </div>
        </div>

        {/* Schedule state badge */}
        <div className="flex items-center">
          {isScheduleRunning ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Active ({intervalSeconds}s)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Schedule Stopped
            </span>
          )}
        </div>
      </div>

      {/* 4 Technical Diagnosis Indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Permission */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <BellRing className="w-3.5 h-3.5 text-slate-400" />
            Permission:
          </span>
          <span
            className={`font-semibold capitalize ${
              isEnabled
                ? 'text-emerald-400'
                : inAppModeActive
                ? 'text-blue-400'
                : isIOSRequiresPWA
                ? 'text-amber-400'
                : permission === 'denied'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {isIOSRequiresPWA ? 'PWA Required' : inAppModeActive ? 'In-App Active' : permission}
          </span>
        </div>

        {/* Service Worker */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            Service Worker:
          </span>
          <span
            className={`font-semibold ${
              isServiceWorkerReady ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {isServiceWorkerReady ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* App Tab Visibility (Foreground / Background) */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            App State:
          </span>
          <span
            className={`font-medium ${
              visibilityState === 'foreground' ? 'text-blue-400' : 'text-purple-400'
            }`}
          >
            {visibilityState === 'foreground' ? 'Foreground' : 'Background'}
          </span>
        </div>

        {/* Engine mode */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            Device / OS:
          </span>
          <span className="font-medium text-slate-300">
            {isIOSDevice ? 'Apple iOS' : 'Android / Desktop'}
          </span>
        </div>
      </div>
    </div>
  );
};
