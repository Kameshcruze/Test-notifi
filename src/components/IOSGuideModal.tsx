import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, Bell, ArrowRight } from 'lucide-react';

interface IOSGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableInAppMode?: () => void;
  inAppModeActive?: boolean;
}

export const IOSGuideModal: React.FC<IOSGuideModalProps> = ({
  isOpen,
  onClose,
  onEnableInAppMode,
  inAppModeActive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">iPhone / iPad Setup</h2>
              <p className="text-xs text-blue-400 font-medium">Apple iOS Web Push Requirement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Important explanation notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="text-base"></span> Why did the button not prompt in Safari?
            </p>
            <p className="leading-relaxed text-[11px] text-amber-200/90">
              Apple disables the <code>Notification</code> API inside regular Safari &amp; Chrome browser tabs on iOS. <strong>Apple requires you to add the website to your Home Screen first</strong> (iOS 16.4+).
            </p>
          </div>

          {/* 3 Step Visual Guide */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              3 Steps to Enable on iOS:
            </h3>

            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white text-xs block mb-0.5">1. Tap Safari's Share Button</strong>
                <p className="text-slate-400 text-[11px]">
                  At the bottom of Safari, tap the <strong>Share</strong> icon (the square with an arrow pointing up <span className="font-mono text-blue-400">[↑]</span>).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white text-xs block mb-0.5">2. Tap "Add to Home Screen"</strong>
                <p className="text-slate-400 text-[11px]">
                  Scroll down the share sheet and select <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong> in the top-right corner.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white text-xs block mb-0.5">3. Open from Home Screen</strong>
                <p className="text-slate-400 text-[11px]">
                  Go to your iPhone home screen and tap the new <strong>PushTester</strong> icon. Once opened, tap <strong>Enable Notifications</strong> — Apple's native permission dialog will appear!
                </p>
              </div>
            </div>
          </div>

          {/* Alternative: In-App Tab Testing */}
          <div className="pt-2 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    Quick In-App Testing Mode
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Test the 30s schedule right now with floating iOS-style banners and chimes.
                  </span>
                </div>
              </div>
              {onEnableInAppMode && (
                <button
                  onClick={() => {
                    onEnableInAppMode();
                    onClose();
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    inAppModeActive
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                  }`}
                >
                  {inAppModeActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In-App Mode Active (Ready to Start)</span>
                    </>
                  ) : (
                    <>
                      <span>Enable In-App Simulation Mode</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
