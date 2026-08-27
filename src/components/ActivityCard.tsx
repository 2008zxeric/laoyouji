import React from 'react';
import { Activity } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Share2, Users, Calendar, Award, Sparkles, Footprints } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const {
    setSelectedActivity,
    toggleFavorite,
    isFavorited,
    openPoster,
    openBooking,
    isCareMode,
  } = useApp();

  const isFav = isFavorited(activity.id);

  // Care Mode: Simplified List Presentation (极简大字·无干扰展示)
  if (isCareMode) {
    return (
      <div
        onClick={() => setSelectedActivity(activity)}
        className="bg-white rounded-3xl overflow-hidden border-2 border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-[0.99] relative"
      >
        {/* Simplified Large Cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
          <img
            src={activity.cover}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-stone-900 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/50 shadow-xs">
              {activity.category} · {activity.durationDays}天{activity.durationNights}晚
            </span>
          </div>
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <span className="bg-black/75 px-3 py-1 rounded-xl text-xs font-bold border border-white/30">
              📍 {activity.destination}
            </span>
          </div>
        </div>

        {/* Simplified Content Body */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2C3E50] leading-snug">
              {activity.title}
            </h3>
            <p className="text-sm text-stone-700 mt-1.5 line-clamp-2 font-medium">
              {activity.subtitle}
            </p>
          </div>

          {/* Key Elder Safeguard Tag */}
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
            <Footprints className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{activity.fitnessDesc}</span>
          </div>

          {/* Simple Big Pricing & High-Contrast Button */}
          <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">慢游特惠价</span>
              <span className="text-2xl font-black font-serif text-[#2C3E50]">
                ¥{activity.priceGroup}
              </span>
              <span className="text-xs text-stone-600 font-bold ml-1">/人起</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openBooking('activity', activity);
              }}
              className="bg-[#1a252f] hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-md flex items-center gap-2 border-2 border-stone-900 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>立即预订</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard Mode: Rich Fine Detail Presentation
  return (
    <div
      onClick={() => setSelectedActivity(activity)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#EAE6DF] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer active:scale-[0.99] relative"
    >
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={activity.cover}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="bg-[#2C3E50]/90 backdrop-blur-md text-[#D4AF37] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 shadow-xs">
            {activity.category}
          </span>
          <span className="bg-stone-900/80 backdrop-blur-md text-stone-100 text-xs px-2 py-0.5 rounded-full">
            {activity.durationDays}天{activity.durationNights}晚
          </span>
          {activity.isFreeEligible && (
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              名仕免费权益
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPoster(activity);
            }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-[#D4AF37] flex items-center justify-center transition-transform active:scale-90 border border-white/20"
            title="生成老友海报"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(activity.id);
            }}
            className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 border border-white/20 ${
              isFav ? 'text-rose-500' : 'text-white/90 hover:text-rose-400'
            }`}
            title="加入收藏"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Destination & Master on Image Bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <div className="flex items-center justify-between text-xs text-stone-200/90 mb-1">
            <span className="flex items-center gap-1 font-medium">
              📍 {activity.destination}
            </span>
            {activity.master && (
              <span className="bg-[#2C3E50]/85 backdrop-blur-md text-[#D4AF37] font-semibold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border border-[#D4AF37]/30">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                {activity.master.badge}：{activity.master.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50] leading-snug line-clamp-2 hover:text-[#D4AF37] transition-colors">
            {activity.title}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {activity.subtitle}
          </p>
        </div>

        {/* Senior Fitness & Highlights */}
        <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-[#EAE6DF] flex flex-col space-y-1.5 text-xs text-stone-700">
          <div className="flex items-center text-[#2C3E50] font-medium gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>{activity.fitnessDesc}</span>
          </div>
          <div className="flex items-center text-stone-600 gap-1.5 text-[11px]">
            <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{activity.features[0]}</span>
          </div>
        </div>

        {/* Departure Dates & Schedule Rule Snippet */}
        <div className="space-y-1.5">
          {activity.departureRule?.ruleSummary && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#85660d] font-medium">
              <span className="bg-[#D4AF37]/15 text-[#85660d] px-2 py-0.5 rounded-md border border-[#D4AF37]/30 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#B8843E]" />
                <span>{activity.departureRule.ruleSummary}</span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 overflow-hidden">
            <span className="shrink-0 text-stone-500 text-[11px]">近期待发：</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
              {activity.departureDates.slice(0, 3).map((d) => (
                <span
                  key={d.date}
                  className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] whitespace-nowrap border border-stone-200"
                >
                  {d.date.slice(5)} {d.tag ? `· ${d.tag}` : ''} (余{d.remainingSlots}位)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Package Pricing & Quick CTA */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-500 font-sans">体验价</span>
              <span className="text-xs text-[#2C3E50] font-bold">¥</span>
              <span className="text-xl font-bold font-serif text-[#2C3E50]">
                {activity.priceGroup}
              </span>
              <span className="text-xs text-stone-400">/人起</span>
            </div>
            <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
              <span className="bg-[#D4AF37]/15 text-[#85660d] font-medium px-1.5 py-0.2 rounded text-[10px] border border-[#D4AF37]/30">
                名仕尊享团
              </span>
              <span className="font-semibold text-stone-700">¥{activity.pricePremium}/人</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openBooking('activity', activity);
              }}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1.5 border border-[#D4AF37]/30"
            >
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>立即预订</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
