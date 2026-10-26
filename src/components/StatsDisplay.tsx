import React from 'react';
import { Hash, Clock, Timer, Sparkles } from 'lucide-react';

interface StatsDisplayProps {
  counter: number;
  lastNotificationTime: Date | null;
  remainingSeconds: number;
  intervalSeconds: number;
  isScheduleRunning: boolean;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  counter,
  lastNotificationTime,
  remainingSeconds,
  intervalSeconds,
  isScheduleRunning,
}) => {
  // Format last notification time
  const formatTime = (date: Date | null) => {
    if (!date) return 'None yet';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateRelativeTime = (date: Date | null) => {
    if (!date) return 'Waiting for first notification';
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  };

  // Progress for countdown
  const progressPercent = isScheduleRunning
    ? Math.max(0, Math.min(100, ((intervalSeconds - remainingSeconds) / intervalSeconds) * 100))
    : 0;

  return (
    <div className="space-y-3">
      {/* 2 Primary Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Notification Counter */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              Total Sent
            </span>
            {counter > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            )}
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
              {counter}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{counter === 1 ? '1 notification sent' : `${counter} notifications delivered`}</span>
          </div>
        </div>

        {/* Last Notification Time */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between shadow-lg">
          <div className="text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Last Delivered
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums">
              {formatTime(lastNotificationTime)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {calculateRelativeTime(lastNotificationTime)}
          </div>
        </div>
      </div>

      {/* Countdown Progress Card (When running) */}
      {isScheduleRunning && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/50 p-3.5 sm:p-4 shadow-md">
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <div className="flex items-center gap-1.5 text-blue-300">
              <Timer className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Next notification in:</span>
              <span className="font-bold text-white tabular-nums bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-400/30">
                {remainingSeconds}s
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Cycle: {intervalSeconds}s
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
