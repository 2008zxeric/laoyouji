import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar, Gift, Smartphone, Monitor, ShieldCheck, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    isLargeFont,
    setIsLargeFont,
    isCareMode,
    toggleCareMode,
    deviceMode,
    setDeviceMode,
    userProfile,
    currentTier,
    setIsCheckinOpen,
    setIsPointsMallOpen,
    setIsMembershipModalOpen,
    setIsPointsGuideOpen,
    setViewMode,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md text-[#1C1C1C] select-none border-b border-[#EAE6DF] shadow-xs">
      {/* Top iOS Status & WeChat Capsule Row */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-gray-500 border-b border-gray-200/50">
        <div className="flex items-center space-x-2">
          <span className="font-semibold tracking-wider text-[#2C3E50]">2026 金秋</span>
          <span className="opacity-40 text-gray-400">|</span>
          <button
            onClick={() => setIsPointsGuideOpen(true)}
            className="bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px] text-amber-900 font-medium flex items-center gap-1 border border-amber-300 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>2026-08 积分指南</span>
          </button>
        </div>

        {/* WeChat Mini Program Capsule & Accessibility Switches */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Care Mode (关怀模式) 1.2x Scale + High Contrast + Minimal List Switch */}
          <button
            onClick={toggleCareMode}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer ${
              isCareMode
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs border-2 border-stone-900 animate-pulse'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 font-semibold'
            }`}
            title="点击切换适老关怀模式：全局字号1.2倍、高对比按钮、极简防眩列表"
          >
            <span>{isCareMode ? '❤️ 关怀模式·开' : '关怀模式'}</span>
          </button>

          {/* Web Admin Portal Switch */}
          <button
            onClick={() => setViewMode('admin')}
            title="进入四季游文旅 Web 管理后台"
            className="flex items-center gap-1 text-[11px] bg-stone-900 hover:bg-stone-800 px-2 sm:px-2.5 py-0.5 rounded-full transition-colors text-amber-300 border border-stone-800 font-medium"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>运营后台</span>
          </button>

          {/* Mini Program Capsule Visual */}
          <div className="bg-stone-900/10 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center space-x-2 border border-stone-300/80 text-stone-700">
            <span className="text-[11px] tracking-widest hover:text-[#D4AF37] cursor-pointer">···</span>
            <span className="w-[1px] h-2.5 bg-stone-300"></span>
            <span className="w-2.5 h-2.5 rounded-full border-2 border-stone-700 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-stone-700"></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand Title & Member Quick Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Traditional Cultural Emblem in Artistic Flair Gold & Slate */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#2C3E50] rounded-[10px] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg border border-[#D4AF37]/40">
              老
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-stone-950 text-[9px] px-1 py-0.2 rounded-sm font-serif font-bold scale-90 shadow-xs border border-white/60">
              知青
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg md:text-xl font-serif italic font-semibold tracking-wide text-[#2C3E50] flex items-center gap-1">
                老友记 <span className="text-[#D4AF37] not-italic">·</span> <span className="not-italic font-medium text-stone-800">老好玩儿</span>
              </h1>
            </div>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase font-sans">
              The Intellectual Circle & Social Club
            </p>
          </div>
        </div>

        {/* Member Points & Checkin Buttons */}
        <div className="flex items-center space-x-2">
          {/* Check-in button */}
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="flex items-center space-x-1 bg-white hover:bg-stone-50 border border-stone-200 text-[#2C3E50] px-2.5 py-1.5 rounded-xl text-xs transition-transform active:scale-95 shadow-2xs font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>签到</span>
          </button>

          {/* Points Pill */}
          <button
            onClick={() => setIsPointsMallOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/15 hover:from-amber-500/20 hover:to-amber-600/25 border border-[#D4AF37]/50 text-[#2C3E50] px-2.5 py-1.5 rounded-xl text-xs transition-transform active:scale-95 shadow-2xs"
          >
            <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-gray-500 font-sans">名仕积分</div>
              <div className="font-bold text-[#D4AF37] font-serif">{userProfile.points}</div>
            </div>
          </button>

          {/* Member Badge Pill */}
          <button
            onClick={() => setIsMembershipModalOpen(true)}
            className="hidden sm:flex items-center space-x-1 bg-[#2C3E50] text-amber-100 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-transform active:scale-95 border border-[#D4AF37]/30"
          >
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentTier.name.split('·')[1]}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
