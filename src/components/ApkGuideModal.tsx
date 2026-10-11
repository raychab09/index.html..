import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Share2,
} from 'lucide-react';
import { sound } from '../services/sound';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'capacitor'>('pwabuilder');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    sound.playClick();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 space-y-4 my-8 text-right max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                دليل تحويل التطبيق لملف APK لأندرويد
              </h3>
              <p className="text-xs text-slate-400">
                كيف تشغل التطبيق وترسله لأصدقائك كملف تثبيت
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('pwabuilder');
            }}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'pwabuilder'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. ملف APK جاهز ⚡
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('pwa');
            }}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. تثبيت مباشر 📲
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('capacitor');
            }}
            className={`py-2 px-2 rounded-xl transition ${
              activeTab === 'capacitor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. كود أندرويد ستوديو 💻
          </button>
        </div>

        {/* Tab 1: PWABuilder (Easiest direct APK file creation) */}
        {activeTab === 'pwabuilder' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
              <span className="font-bold block mb-1">
                ⭐ أسهل طريقة لإنشاء ملف APK قابل للإرسال لصديقك:
              </span>
              تستخدم أداة <strong>PWABuilder</strong> الرسمية من Microsoft لتحويل رابط التطبيق مباشرة إلى ملف APK جاهز للتحميل والتثبيت.
            </div>

            <ol className="space-y-2.5 list-decimal list-inside pr-1">
              <li className="space-y-1">
                <span className="font-bold text-white">انسخ رابط التطبيق المنشور:</span>
                <p className="text-slate-400 pr-4">
                  اضغط على زر المشاركة (Share) في Google AI Studio وانسخ الرابط العام للتطبيق.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-white">افتح موقع PWABuilder:</span>
                <p className="text-slate-400 pr-4">
                  توجه إلى{' '}
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline font-semibold"
                  >
                    pwabuilder.com
                  </a>{' '}
                  والصق رابط التطبيق واضغط <strong>Start</strong>.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-white">تنزيل حزمة أندرويد:</span>
                <p className="text-slate-400 pr-4">
                  اضغط على خيار <strong>Android</strong> ثم <strong>Generate Package</strong>. سيتم توليد ملف APK و AAB جاهزين.
                </p>
              </li>

              <li className="space-y-1">
                <span className="font-bold text-white">أرسل ملف الـ APK لصديقك:</span>
                <p className="text-slate-400 pr-4">
                  أرسل ملف <code>.apk</code> لصديقك عبر واتساب أو تيليغرام، ويقوم بالنقر عليه وتثبيته مباشرة مثل أي تطبيق أندرويد!
                </p>
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: Direct Phone Install (PWA / WebAPK) */}
        {activeTab === 'pwa' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
              <span className="font-bold block mb-1">
                📲 التثبيت الفوري بنقرة واحدة بدون برامج:
              </span>
              التطبيق مجهز بتقنية PWA، ويمكن لأي شخص تثبيته على هاتفه الأندرويد في 5 ثوانٍ ليصبح تطبيقاً مستقلاً تماماً على شاشته الرئيسية.
            </div>

            <ol className="space-y-2.5 list-decimal list-inside pr-1">
              <li>
                <span className="font-bold text-white">أرسل الرابط لصديقك</span> ليفتحه في متصفح <strong>Google Chrome</strong> على هاتفه.
              </li>
              <li>
                سيظهر له شريط في الأسفل: <strong>"إضافة تحدي المعرفة إلى الشاشة الرئيسية"</strong> أو <strong>"تثبيت التطبيق"</strong>.
              </li>
              <li>
                أو من قائمة المتصفح (الثلاث نقاط <strong>⋮</strong>)، يختار <strong>"تثبيت التطبيق" (Install app)</strong>.
              </li>
              <li>
                يظهر التطبيق كأيقونة في قائمة تطبيقات الهاتف، ويعمل بملء الشاشة مع حفظ البيانات بدون إنترنت!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: Capacitor (Native Android Project) */}
        {activeTab === 'capacitor' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
              <span className="font-bold block mb-1">
                💻 للمطورين - تحويل المشروع إلى تطبيق أندرويد أصلي (Native APK):
              </span>
              إذا قمت بتنزيل ملفات المشروع كـ ZIP أو تصديرها لـ GitHub، يمكنك استخدام <strong>Capacitor</strong> في 3 خطوات بسيطة:
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white">1. تثبيت Capacitor في مجلد المشروع:</div>
              <div className="relative bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
                <span>npm i @capacitor/core @capacitor/android @capacitor/cli</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm i @capacitor/core @capacitor/android @capacitor/cli',
                      1
                    )
                  }
                  className="absolute left-2 top-2 p-1 bg-slate-800 rounded text-slate-300 hover:text-white"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="font-bold text-white">2. تهيئة التطبيق وإضافة منصة Android:</div>
              <div className="relative bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
                <span>npx cap init "تحدي المعرفة" "com.tahaddi.knowledge" --web-dir=dist</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npx cap init "تحدي المعرفة" "com.tahaddi.knowledge" --web-dir=dist',
                      2
                    )
                  }
                  className="absolute left-2 top-2 p-1 bg-slate-800 rounded text-slate-300 hover:text-white"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="font-bold text-white">3. بناء التطبيق وفتح Android Studio:</div>
              <div className="relative bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
                <span>npm run build && npx cap add android && npx cap open android</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm run build && npx cap add android && npx cap open android',
                      3
                    )
                  }
                  className="absolute left-2 top-2 p-1 bg-slate-800 rounded text-slate-300 hover:text-white"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                في أندرويد ستوديو، اختر من القائمة العلوية: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>، وسيكون ملف <code>app-debug.apk</code> جاهزاً للإرسال!
              </p>
            </div>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            إغلاق ومتابعة اللعب
          </button>
        </div>
      </div>
    </div>
  );
};
