import React from 'react';
import { Bell, HelpCircle, Smartphone } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Push Notification Tester
              </h1>
              <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Smartphone className="w-2.5 h-2.5" />
                Mobile
              </span>
            </div>
            <p className="text-xs text-slate-400">Browser & Service Worker test suite</p>
          </div>
        </div>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 transition active:scale-95 cursor-pointer"
          title="Android Testing Guide & Background Details"
          aria-label="Testing instructions and background info"
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Guide & Background Info</span>
          <span className="sm:hidden">Guide</span>
        </button>
      </div>
    </header>
  );
};
