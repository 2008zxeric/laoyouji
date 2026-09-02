import React from 'react';
import { useApp } from '../context/AppContext';
import { TripReminderNotice } from '../types';
import {
  Bell,
  Clock,
  MapPin,
  Phone,
  Sun,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
  Trophy,
  X,
  Share2,
  HeartPulse,
  Navigation,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface TripReminderModalProps {
  isOpen?: boolean;
  notice?: TripReminderNotice | null;
  onClose?: () => void;
}

export const TripReminderModal: React.FC<TripReminderModalProps> = ({
  isOpen,
  notice: propNotice,
  onClose,
}) => {
  const {
    activeTripReminderNotice,
    isTripReminderModalOpen,
    setIsTripReminderModalOpen,
    dismissTripReminder,
    showToast,
    setSelectedActivity,
    setSelectedEvent,
    activities,
    events,
    setActiveTab,
  } = useApp();

  const notice = propNotice || activeTripReminderNotice;
  const isVisible = isOpen !== undefined ? isOpen : isTripReminderModalOpen;

  if (!isVisible && !propNotice) return null;
  if (!notice) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsTripReminderModalOpen(false);
    }
  };

  const handleViewDetail = () => {
    handleClose();
    if (notice.bizType === 'activity') {
      const act = activities.find((a) => a.id === notice.orderId || a.title.includes(notice.title.slice(1, 6)));
      if (act) {
        setSelectedActivity(act);
      } else if (activities[0]) {
        setSelectedActivity(activities[0]);
      }
    } else {
      const evt = events.find((e) => e.id === notice.orderId || e.title.includes(notice.title.slice(1, 6)));
      if (evt) {
        setSelectedEvent(evt);
      } else if (events[0]) {
        setSelectedEvent(events[0]);
      }
    }
  };

  const handleSaveToCalendar = () => {
    showToast('✅ 已为您生成行前提醒并同步至手机日程（提前24小时及出发前2小时双重闹钟）');
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-amber-300/40 my-auto animate-scaleUp">
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2C3E50] via-[#1a252f] to-[#2C3E50] text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs animate-bounce">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  行前 24 小时关怀提醒
                </span>
                <h3 className="font-serif font-bold text-lg text-[#FAF9F6] mt-0.5">
                  {notice.bizType === 'event' ? '🏆 乐龄赛事 · 明日开赛提醒' : '🧭 文旅研学 · 明日启程通知'}
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Time Countdown Pill */}
          <div className="mt-3.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>距正式出发仅剩：</span>
              <span className="font-mono font-black text-amber-300 text-sm">约 {notice.hoursLeft || 24} 小时</span>
            </div>
            <span className="text-[11px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full">
              请做好行前准备
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Target Summary Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] flex gap-3 shadow-2xs">
            <img
              src={notice.cover}
              alt={notice.title}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#2C3E50] text-amber-200">
                  {notice.bizType === 'event' ? '乐龄赛事' : '文旅研学'}
                </span>
                <span className="text-[10px] font-mono text-stone-400">单号 {notice.orderNo}</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2C3E50] leading-snug line-clamp-2">
                {notice.title}
              </h4>
              <div className="flex items-center text-xs text-amber-800 font-semibold gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>出发/开赛日期：{notice.departureDate}</span>
              </div>
            </div>
          </div>

          {/* 1. Gathering & Butler Info */}
          <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950 border-b border-amber-200/60 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>📍 集合地点与带团管家</span>
              </div>
              <span className="text-[11px] text-amber-800 font-normal">请提前 15 分钟抵达</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200/50 space-y-1">
                <span className="text-stone-500 text-[11px]">集合时间与地点</span>
                <div className="font-bold text-[#2C3E50]">{notice.gatheringTime}</div>
                <div className="text-stone-600 text-[11px] line-clamp-1">{notice.gatheringPlace}</div>
              </div>

              <div className="bg-white/80 rounded-xl p-2.5 border border-amber-200/50 flex items-center justify-between">
                <div>
                  <span className="text-stone-500 text-[11px]">专属带团管家/裁判长</span>
                  <div className="font-bold text-[#2C3E50]">{notice.contactGuideName}</div>
                  <div className="font-mono text-[11px] text-stone-600">{notice.contactGuidePhone}</div>
                </div>
                <a
                  href={`tel:${notice.contactGuidePhone.replace(/\s+/g, '')}`}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>直拨</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Senior Care Medication & Packing Checklist */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E50] border-b border-stone-100 pb-2">
              <Pill className="w-4 h-4 text-red-600" />
              <span>💊 适老随身必备清单（请逐项核对）</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {notice.packingChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200/70 text-stone-800"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Weather & Health Tips */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#2C3E50]">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>目的地天气与着装建议</span>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              {notice.weatherTips}
            </p>
          </div>

          {/* 4. Medical Assurance Guarantee */}
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">平台 100% 适老医疗急救守护已就绪</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                随团/赛场配备便携 AED 除颤仪、红十字救护员、动态血压监测、防久坐每40分钟站立舒展茶歇。
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-[#EAE6DF] flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSaveToCalendar}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-[#2C3E50] text-xs font-bold py-3 rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>同步闹钟到手机</span>
          </button>

          <button
            onClick={handleViewDetail}
            className="flex-1 bg-gradient-to-r from-[#2C3E50] to-[#1a252f] text-amber-200 text-xs font-bold py-3 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 border border-[#D4AF37]/40 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>查看完整出团凭据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
