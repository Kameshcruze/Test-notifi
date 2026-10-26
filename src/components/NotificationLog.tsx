import React from 'react';
import { History, Trash2, CheckCircle2, AlertCircle, Smartphone, Globe } from 'lucide-react';
import { NotificationLogItem } from '../services/notificationService';

interface NotificationLogProps {
  logs: NotificationLogItem[];
  onClearLogs: () => void;
}

export const NotificationLog: React.FC<NotificationLogProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Delivery Log ({logs.length})
          </h2>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800/80 rounded-xl">
          <History className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
          <p>No notifications sent yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Start the schedule or trigger an instant test to view logs.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-start justify-between gap-3 transition hover:border-slate-700/80"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-blue-500/20">
                  #{log.count}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-white truncate">{log.title}</span>
                    {log.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">{log.body}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      {log.deliveryMethod === 'service-worker' ? (
                        <>
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                          <span>ServiceWorker</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-cyan-400" />
                          <span>WebAPI</span>
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded ${
                        log.visibilityState === 'foreground'
                          ? 'bg-blue-500/15 text-blue-300'
                          : 'bg-purple-500/15 text-purple-300'
                      }`}
                    >
                      {log.visibilityState}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono shrink-0 text-right">
                {log.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
