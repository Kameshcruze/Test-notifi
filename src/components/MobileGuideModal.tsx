import React from 'react';
import { X, Smartphone, ArrowRight, ShieldCheck, BatteryCharging, CloudLightning, Info } from 'lucide-react';

interface MobileGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileGuideModal: React.FC<MobileGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mobile Testing & Technical Guide</h2>
              <p className="text-xs text-slate-400">Android Chrome & Background Notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Step-by-step test instructions */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                1
              </span>
              How to Test on Your Android Phone
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-blue-400 text-xs mt-0.5">Step 1:</span>
                <div>
                  <strong className="text-white">Open in Chrome on Android:</strong>
                  <p className="text-slate-400 mt-0.5">
                    Navigate to this site using Google Chrome on your Android mobile device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-blue-400 text-xs mt-0.5">Step 2:</span>
                <div>
                  <strong className="text-white">Tap "Enable Notifications":</strong>
                  <p className="text-slate-400 mt-0.5">
                    When the browser displays <em>"Allow push notifications?"</em>, tap <strong>Allow</strong>. The status badge will change to green.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-blue-400 text-xs mt-0.5">Step 3:</span>
                <div>
                  <strong className="text-white">Tap "Start Loop (30s)":</strong>
                  <p className="text-slate-400 mt-0.5">
                    The timer begins ticking down from 30 seconds. (You can also tap <em>"Send Instant Test"</em> to verify immediately).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-blue-400 text-xs mt-0.5">Step 4:</span>
                <div>
                  <strong className="text-white">Switch to WhatsApp or another app:</strong>
                  <p className="text-slate-400 mt-0.5">
                    Press the Home button or app switcher and switch to WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-blue-400 text-xs mt-0.5">Step 5:</span>
                <div>
                  <strong className="text-white">Check Your Android Notification Shade:</strong>
                  <p className="text-slate-400 mt-0.5">
                    When the 30-second interval elapses, your phone will vibrate and display <strong>"Test Notification: This is a test notification."</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Explanation of Foreground vs. Background */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                2
              </span>
              Technical Reality: Foreground vs. Background Delivery
            </h3>

            <div className="space-y-3">
              {/* Foreground explanation */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-900/40">
                <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  What Works Out-of-the-Box (Foreground & Short Background)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  When Chrome is active or recently switched (e.g., swapping to WhatsApp for a few minutes), our Service Worker (<code>sw.js</code>) and Web Worker timer execute the scheduled notification with full vibration, icon, and action buttons.
                </p>
              </div>

              {/* Background throttling explanation */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-900/40">
                <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1">
                  <BatteryCharging className="w-4 h-4" />
                  Why Mobile OSes Throttle Client-Side Timers
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Mobile operating systems (Android, iOS) aggressively prioritize battery life. When Chrome is left in the background for prolonged periods or when memory is low, Android <strong>suspends client-side JavaScript execution (including <code>setInterval</code>)</strong>. No website code can permanently run a loop forever in the background without being suspended by the OS.
                </p>
              </div>

              {/* True Web Push Explanation */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-blue-900/40">
                <div className="flex items-center gap-2 font-semibold text-blue-400 mb-1">
                  <CloudLightning className="w-4 h-4" />
                  What Genuine Background Push Requires (Production Architecture)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  For apps like WhatsApp, Slack, or banking apps that deliver notifications even when the browser is completely closed or device has been asleep for hours, the standard web solution is the <strong>Web Push Protocol</strong>:
                </p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-400 pl-2 border-l-2 border-blue-500/40">
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                    <span><strong>PushManager:</strong> The client registers with <code>pushManager.subscribe()</code> using VAPID keys.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                    <span><strong>Cloud Push Service:</strong> A server sends an encrypted push packet to Google's Push Service (FCM).</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                    <span><strong>OS Wakeup:</strong> Android wakes up the Service Worker in the background via the <code>push</code> event, even if Chrome is closed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Android Troubleshooting Checklist */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
            <h4 className="text-xs font-semibold text-blue-300 flex items-center gap-1.5 mb-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              Android Troubleshooting Checklist
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Ensure Chrome notification permissions are not disabled in <strong>Android Settings &gt; Apps &gt; Chrome &gt; Notifications</strong>.</li>
              <li>Make sure <strong>Do Not Disturb</strong> mode is not muting incoming notifications.</li>
              <li>For longest background execution, disable aggressive battery optimization for Chrome under device Battery settings.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition cursor-pointer"
          >
            Got it, Let's Test
          </button>
        </div>
      </div>
    </div>
  );
};
