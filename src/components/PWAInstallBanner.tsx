import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../services/sound';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  if (!isInstallable && !isIOS) return null;

  const handleInstallClick = async () => {
    sound.playClick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-indigo-900/60 border border-emerald-500/30 text-white flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">تثبيت التطبيق على هاتفك</h4>
            <p className="text-[11px] text-slate-300">
              للعب السريع وبدون إنترنت بملء الشاشة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition active:scale-95 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            title="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 text-right">
            <h3 className="text-sm font-bold text-white">التثبيت على آيفون (iOS)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. اضغط على زر المشاركة (Share) في أسفل متصفح Safari.
              <br />
              2. مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
