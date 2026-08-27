import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Award,
  Users,
  Trophy,
  Share2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ShieldAlert,
  HeartPulse,
  Stethoscope,
  Coffee,
  Sparkles,
  Layers,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { TournamentEvent } from '../types';
import { useApp } from '../context/AppContext';

interface EventDetailModalProps {
  event: TournamentEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const { openBooking, showToast } = useApp();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!event) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('赛事简章链接已复制，可直接发送至长辈微信群邀约搭档');
  };

  const images = event.images && event.images.length > 0 ? event.images : [event.cover];
  const activeImage = images[selectedImageIdx] || event.cover;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'registration':
        return { text: '🟢 报名中 (在售上架)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'draft':
        return { text: '🟡 待发布 (审核草稿)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ongoing':
        return { text: '🔵 比赛对弈中', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'expired':
        return { text: '⚪ 已完赛 (归档回顾)', bg: 'bg-stone-200 text-stone-700 border-stone-300' };
      case 'offline':
        return { text: '🔴 已下架', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { text: '🟢 报名中', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const statusInfo = getStatusBadge(event.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white w-full h-full md:h-[92vh] md:max-w-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-[#EAE6DF]">
        {/* Sticky Header Top Action Bar */}
        <div className="shrink-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#EAE6DF] flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}>
              {statusInfo.text}
            </span>
            <span className="text-xs text-stone-500 font-mono font-bold hidden sm:inline">
              {event.code}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
              title="分享赛事"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-stone-50/40 space-y-4">
          {/* Hero Cover & Gallery */}
          <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
            <img src={activeImage} alt={event.title} className="w-full h-full object-cover transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                {event.category}
              </span>
              {event.productTheme && (
                <span className="bg-amber-900/80 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/40">
                  {event.productTheme}主题 · {event.productCarrier || '赛事课堂'}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-1.5 text-xs text-amber-200 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{event.city}</span>
                <span>·</span>
                <span>{event.venue}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold leading-snug drop-shadow-md text-[#FAF9F6]">
                {event.title}
              </h1>
              {event.subtitle && (
                <p className="text-xs text-stone-300 mt-1 line-clamp-1">{event.subtitle}</p>
              )}
            </div>
          </div>

          {/* 3 Photos Thumbnail Switcher */}
          {images.length > 1 && (
            <div className="px-4 flex items-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-[#85660d] scale-105 shadow-sm' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 3.1 Framework Dimension Tags */}
          <div className="mx-4 p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#85660d] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>3.1产品架构：</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
              主题: {event.productTheme || '体育/文娱'}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-medium">
              形式: {event.productForm || '社交'}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium">
              载体: {event.productCarrier || '赛事课堂'}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-medium">
              跨度: {event.timeLevel || 'L2 (3~4天)'}
            </span>
            {event.creator && (
              <span className="ml-auto text-[11px] text-stone-500 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                <span>录入发布：{event.creator}</span>
              </span>
            )}
          </div>

          {/* Senior Medical & Safety Assurances */}
          <div className="mx-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>乐龄赛场适老关怀与医疗急救保障</span>
            </div>
            <div className="space-y-1.5 text-xs text-emerald-950">
              {(event.medicalAssurance && event.medicalAssurance.length > 0
                ? event.medicalAssurance
                : [
                    '配备 2 台专业 AED 除颤仪与随队三甲急救医护人员',
                    '赛场全场采用加厚人体工学护腰软椅与绿色无障碍通道',
                    '全天供应温热养生草本茶饮（罗汉果茶、枸杞菊花茶）',
                    '每日赛程严格限制在 2.5 小时内，每轮设 20 分钟颈椎放松操与茶歇',
                  ]
              ).map((med, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{med}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prize Pool Spotlight Card */}
          <div className="mx-4 p-4 bg-[#FAF9F6] rounded-2xl border border-[#EAE6DF]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span>健康文娱优胜表彰与全员礼遇</span>
              </div>
              <span className="text-xs text-[#85660d] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                名仕积分 {event.prizePool.points.toLocaleString()} 积分
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white rounded-xl p-2.5 border border-[#EAE6DF] flex items-center justify-between shadow-2xs">
                <span className="font-bold text-[#85660d]">🥇 冠军优胜荣誉：</span>
                <span className="font-semibold text-[#2C3E50]">{event.prizePool.first}</span>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-[#EAE6DF] flex items-center justify-between shadow-2xs">
                <span className="font-bold text-stone-700">🥈 亚军优胜礼遇：</span>
                <span className="text-stone-800">{event.prizePool.second}</span>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-[#EAE6DF] flex items-center justify-between shadow-2xs">
                <span className="font-bold text-stone-700">🥉 季军优胜礼遇：</span>
                <span className="text-stone-800">{event.prizePool.third}</span>
              </div>
              <div className="text-[11px] text-stone-600 text-center pt-1 font-medium bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                🎁 参赛全员纪念礼：{event.prizePool.participation}
              </div>
            </div>
          </div>

          {/* Referee Card */}
          <div className="mx-4 p-4 bg-white rounded-2xl border border-[#EAE6DF] flex items-start space-x-3 shadow-2xs">
            <img
              src={event.referee.avatar}
              alt={event.referee.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-2xs shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-[#2C3E50] text-sm md:text-base">
                  {event.referee.name}
                </span>
                <span className="bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {event.referee.badge}
                </span>
              </div>
              <div className="text-xs text-[#85660d] font-medium mt-0.5">{event.referee.title}</div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{event.referee.intro}</p>
            </div>
          </div>

          {/* Schedule & Rules */}
          <div className="mx-4 space-y-4 pb-4">
            {/* Schedule */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base border-b border-stone-100 pb-2">
                <Calendar className="w-5 h-5 text-[#2C3E50]" />
                <span>赛事赛程安排与慢游休闲</span>
              </div>
              <div className="space-y-3">
                {event.schedule.map((sc, idx) => (
                  <div key={idx} className="text-xs border-l-2 border-[#D4AF37] pl-3 space-y-0.5">
                    <div className="font-bold text-[#2C3E50]">{sc.time} · {sc.title}</div>
                    <div className="text-stone-600 leading-relaxed">{sc.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules & Fair Play */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base border-b border-stone-100 pb-2">
                <ShieldAlert className="w-5 h-5 text-[#2C3E50]" />
                <span>比赛规则与适老文明对弈公约</span>
              </div>
              <div className="space-y-2 text-xs text-stone-700">
                {event.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2C3E50] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Perks */}
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] space-y-2 text-xs text-stone-700">
              <div className="font-bold text-[#2C3E50]">🏨 参赛服务费全含内容：</div>
              {event.perks.map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-stone-600">
                  <span className="text-[#2C3E50] font-bold">✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Bottom Bar */}
        <div className="shrink-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#EAE6DF] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-stone-500">
                已报 {event.registeredTeams} / {event.maxTeams} 席 (限额招募)
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-red-600 font-bold">¥</span>
                <span className="text-2xl font-bold font-serif text-red-600">
                  {event.registrationFee}
                </span>
                <span className="text-xs text-stone-500">/人 (含五星酒店+全膳食)</span>
              </div>
            </div>

            <button
              onClick={() => openBooking('event', event)}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-6 py-3 rounded-2xl font-bold text-sm md:text-base shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span>立即报名</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
