import React, { useState } from 'react';
import { Settings2, Volume2, VolumeX, Vibrate, Sun, ChevronDown, ChevronUp, Sliders } from 'lucide-react';

interface SettingsBarProps {
  intervalSeconds: number;
  onChangeInterval: (seconds: number) => void;
  playSound: boolean;
  onToggleSound: () => void;
  vibrate: boolean;
  onToggleVibrate: () => void;
  wakeLockSupported: boolean;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
  isScheduleRunning: boolean;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  intervalSeconds,
  onChangeInterval,
  playSound,
  onToggleSound,
  vibrate,
  onToggleVibrate,
  wakeLockSupported,
  wakeLockActive,
  onToggleWakeLock,
  isScheduleRunning,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-400" />
          <span>Test Settings & Parameters</span>
        </span>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>{intervalSeconds}s interval</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-slate-800/80 space-y-4 text-xs">
          {/* Interval selection */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Schedule Interval:
              </span>
              <span className="text-white font-bold">{intervalSeconds} seconds</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[10, 30, 60].map((sec) => (
                <button
                  key={sec}
                  disabled={isScheduleRunning}
                  onClick={() => onChangeInterval(sec)}
                  className={`py-2 px-3 rounded-xl font-medium text-xs transition border cursor-pointer ${
                    intervalSeconds === sec
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  } ${isScheduleRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sec}s {sec === 30 ? '(Default)' : ''}
                </button>
              ))}
            </div>
            {isScheduleRunning && (
              <p className="text-[10px] text-slate-500 mt-1">
                Stop schedule to change interval
              </p>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2 pt-1 border-t border-slate-800/60">
            {/* Chime Sound */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300 flex items-center gap-2">
                {playSound ? (
                  <Volume2 className="w-4 h-4 text-blue-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                Notification Chime Sound
              </span>
              <button
                onClick={onToggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  playSound ? 'bg-blue-600' : 'bg-slate-800'
                }`}
                role="switch"
                aria-checked={playSound}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    playSound ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Vibration */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300 flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-purple-400" />
                Haptic Vibration (Mobile)
              </span>
              <button
                onClick={onToggleVibrate}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  vibrate ? 'bg-blue-600' : 'bg-slate-800'
                }`}
                role="switch"
                aria-checked={vibrate}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    vibrate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Wake Lock */}
            {wakeLockSupported && (
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-slate-300 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Screen Wake Lock
                  </span>
                  <p className="text-[10px] text-slate-500 ml-6">
                    Prevents phone from turning off screen
                  </p>
                </div>
                <button
                  onClick={onToggleWakeLock}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    wakeLockActive ? 'bg-amber-600' : 'bg-slate-800'
                  }`}
                  role="switch"
                  aria-checked={wakeLockActive}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      wakeLockActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Preset Payload Preview */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
            <div className="text-slate-400 font-medium">Notification Content:</div>
            <div className="text-white font-semibold">Title: Test Notification</div>
            <div className="text-slate-300">Body: This is a test notification.</div>
          </div>
        </div>
      )}
    </div>
  );
};
