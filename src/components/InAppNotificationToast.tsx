import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

export interface ToastPayload {
  id: string;
  count: number;
  title: string;
  body: string;
  timestamp: Date;
}

interface InAppNotificationToastProps {
  toast: ToastPayload | null;
  onDismiss: () => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-3 left-4 right-4 max-w-sm mx-auto z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 text-white flex items-start gap-3">
        {/* App Icon */}
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
          <Bell className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              PUSHTESTER #{toast.count}
            </span>
            <span>now</span>
          </div>
          <div className="font-semibold text-xs text-white">{toast.title}</div>
          <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{toast.body}</p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 200);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
