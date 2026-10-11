import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Smartphone,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { AppSettings } from '../types';
import { sound } from '../services/sound';
import {
  getQuestionEngineStats,
  clearSeenQuestionsHistory,
} from '../services/questionEngine';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onOpenApkGuide: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onOpenApkGuide,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [justResetSeen, setJustResetSeen] = useState(false);
  const [engineStats, setEngineStats] = useState(() => getQuestionEngineStats());

  useEffect(() => {
    setEngineStats(getQuestionEngineStats());
  }, []);

  const handleResetSeenHistory = () => {
    sound.playClick();
    clearSeenQuestionsHistory();
    setEngineStats(getQuestionEngineStats());
    setJustResetSeen(true);
    setTimeout(() => setJustResetSeen(false), 2500);
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.setEnabled(next);
    if (next) sound.playClick();
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const toggleTimer = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, timerEnabled: !settings.timerEnabled });
  };

  const setTimerDuration = (seconds: number) => {
    sound.playClick();
    onUpdateSettings({ ...settings, timerDurationSeconds: seconds });
  };

  const toggleDarkMode = () => {
    sound.playClick();
    onUpdateSettings({ ...settings, darkMode: !settings.darkMode });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>الإعدادات والخيارات</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          تخصيص تجربة اللعب وحفظ تفضيلاتك
        </p>
      </div>

      {/* Settings List */}
      <div className="space-y-3">
        {/* Sound Effects */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">المؤثرات الصوتية</h4>
              <p className="text-xs text-slate-400">
                أصوات الإجابة وسلسلة الانتصارات
              </p>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? '-translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Timer Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">مؤقت الأسئلة</h4>
                <p className="text-xs text-slate-400">
                  تحديد وقت لكل سؤال لزيادة الإثارة
                </p>
              </div>
            </div>

            <button
              onClick={toggleTimer}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                settings.timerEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.timerEnabled ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Duration Options */}
          {settings.timerEnabled && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                مدة السؤال:
              </span>
              <div className="flex gap-2">
                {[15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimerDuration(sec)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      settings.timerDurationSeconds === sec
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec} ثانية
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Anti-Repetition Question Engine Status & AI Toggle */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>نظام الأسئلة المتجددة</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    نشط دائماً
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  منع التكرار وخلط الخيارات وتوليد جولات طازجة
                </p>
              </div>
            </div>
          </div>

          {/* AI Generation Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>توليد أسئلة غير محدودة بالذكاء الاصطناعي (Gemini)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                توليد أسئلة فريدة عبر خادم ذكي عند الاتصال بالإنترنت
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({
                  ...settings,
                  aiGenerationEnabled: !settings.aiGenerationEnabled,
                });
              }}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 shrink-0 ${
                settings.aiGenerationEnabled ? 'bg-purple-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.aiGenerationEnabled ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Detailed Question Bank Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>إحصائيات بنك الأسئلة</span>
              <span className="text-indigo-400">
                استكشاف {Math.round((engineStats.seenCount / Math.max(1, engineStats.totalQuestions)) * 100)}%
              </span>
            </div>

            {/* Exploration Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((engineStats.seenCount / Math.max(1, engineStats.totalQuestions)) * 100)
                  )}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">الأسئلة المتوفرة</div>
                <div className="text-base font-black text-indigo-400 mt-0.5">
                  {engineStats.totalQuestions}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">أسئلة شاهدتها</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  {engineStats.seenCount}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">أسئلة جديدة متبقية</div>
                <div className="text-base font-black text-purple-400 mt-0.5">
                  {Math.max(0, engineStats.totalQuestions - engineStats.seenCount)}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetSeenHistory}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {justResetSeen ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">تم تجديد دورة الأسئلة بنجاح!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>إعادة إتاحة الأسئلة السابقة وتصفير سجل المشاهدة</span>
              </>
            )}
          </button>
        </div>

        {/* APK Conversion Guide Card */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenApkGuide();
          }}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-teal-950/30 border border-emerald-500/40 hover:border-emerald-500/70 transition cursor-pointer flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>تصدير تطبيق Android APK</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  دليل مخصص
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                شرح خطوات تحويل التطبيق لملف APK وإرساله لصديقك
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="pt-2">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط البيانات والنتائج المحفوظة</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
            <p className="text-xs font-bold text-rose-200">
              ⚠️ هل أنت متأكد من تصفير كافة النقاط والإنجازات وسجل الأرقام القياسية؟ لا يمكن التراجع!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                نعم، احذف وسجل من جديد
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-4 space-y-1 text-xs text-slate-400">
        <div className="font-bold text-slate-300">تحدي المعرفة - الإصدار 1.0</div>
        <p className="text-[11px]">يعمل بالكامل بدون اتصال بالإنترنت (Offline 100%)</p>
      </div>
    </div>
  );
};
