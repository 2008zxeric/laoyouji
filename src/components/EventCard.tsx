import React from 'react';
import { TournamentEvent } from '../types';
import { useApp } from '../context/AppContext';
import { Trophy, Calendar, MapPin, Award, Users, Share2, Heart, ChevronRight } from 'lucide-react';

interface EventCardProps {
  event: TournamentEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { setSelectedEvent, toggleFavorite, isFavorited, openPoster, openBooking, isCareMode } = useApp();
  if (!event) return null;

  const isFav = isFavorited(event.id || '');
  const registeredTeams = event.registeredTeams || 0;
  const maxTeams = event.maxTeams || 50;
  const percentFull = Math.min(100, Math.round((registeredTeams / (maxTeams || 1)) * 100));
  const coverUrl = event.cover || (event.images && event.images[0]) || 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80';
  const venueDisplay = event.venue ? event.venue.split('（')[0] : '精选赛场';
  const refereeName = event.referee?.name ? event.referee.name.split(' ')[0] : '特邀裁判长';
  const refereeBadge = event.referee?.badge || '国家级裁判';
  const prizePoints = event.prizePool?.points || 50000;
  const prizeFirst = event.prizePool?.first || '冠军金奖奖杯 + 20,000名仕积分 + 终身免单研学';
  const startDate = event.startDate || '2026-10-18';
  const endDate = event.endDate ? (event.endDate.length > 5 ? event.endDate.slice(5) : event.endDate) : '10-21';

  // Care Mode: Simplified List Presentation (极简大字·无干扰展示)
  if (isCareMode) {
    return (
      <div
        onClick={() => setSelectedEvent(event)}
        className="bg-white rounded-3xl overflow-hidden border-2 border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer active:scale-[0.99] relative"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
          <img
            src={coverUrl}
            alt={event.title || '乐龄赛事'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-amber-500 text-stone-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
              🏆 {event.category || '智力竞技'} · 报名中
            </span>
          </div>
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <span className="bg-black/75 px-3 py-1 rounded-xl text-xs font-bold border border-white/30">
              📍 {event.city || '全国'} · {venueDisplay}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2C3E50] leading-snug">
              {event.title}
            </h3>
            {event.subtitle && (
              <p className="text-sm text-stone-700 mt-1 font-medium line-clamp-2">
                {event.subtitle}
              </p>
            )}
          </div>

          <div className="bg-stone-100 p-2.5 rounded-xl border border-stone-300 flex items-center justify-between text-xs text-stone-800 font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              比赛时间：{startDate} ~ {endDate}
            </span>
            <span className="text-amber-800 font-black">
              已报 {registeredTeams}/{maxTeams} 席
            </span>
          </div>

          <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">参赛服务费</span>
              <span className="text-2xl font-black font-serif text-[#2C3E50]">
                ¥{event.registrationFee || 2280}
              </span>
              <span className="text-xs text-stone-600 font-bold ml-1">/人</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openBooking('event', event);
              }}
              className="bg-[#1a252f] hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-md flex items-center gap-2 border-2 border-stone-900 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>组队报名</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setSelectedEvent(event)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#EAE6DF] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer active:scale-[0.99] relative"
    >
      {/* Gold & Navy Tournament Header Stripe */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#34495e] to-[#2C3E50] text-amber-50 px-4 py-1.5 flex items-center justify-between text-xs font-semibold border-b border-[#D4AF37]/30">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>乐龄赛事 · {event.category || '文体竞技'}</span>
        </div>
        <span className="bg-[#D4AF37] text-stone-950 px-2 py-0.5 rounded text-[10px] font-bold">
          火热报名中
        </span>
      </div>

      {/* Cover & Badges */}
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
        <img
          src={coverUrl}
          alt={event.title || '赛事封面'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Top Action Icons */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPoster(event);
            }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-[#D4AF37] flex items-center justify-center transition-transform active:scale-90 border border-white/20"
            title="分享赛事海报"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(event.id);
            }}
            className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 border border-white/20 ${
              isFav ? 'text-rose-500' : 'text-white/90 hover:text-rose-400'
            }`}
            title="收藏赛事"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Referee badge & Venue */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 text-stone-200">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            {event.city || '全国'} · {venueDisplay}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-[#D4AF37] font-semibold px-2 py-0.5 rounded-full text-[11px] border border-[#D4AF37]/30">
            {refereeBadge}：{refereeName}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50] leading-snug line-clamp-2 hover:text-[#D4AF37] transition-colors">
            {event.title}
          </h3>
          {event.subtitle && (
            <p className="text-xs md:text-sm text-stone-600 mt-1 line-clamp-2">
              {event.subtitle}
            </p>
          )}
        </div>

        {/* Prize Pool Highlight Card */}
        <div className="bg-gradient-to-br from-[#FAF9F6] to-[#F1F3F5] rounded-xl p-3 border border-[#EAE6DF] flex flex-col space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[#2C3E50] font-bold">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>冠军益智礼遇</span>
            </div>
            <span className="text-[#85660d] font-bold">积分礼遇 {prizePoints.toLocaleString()}分</span>
          </div>
          <div className="text-stone-800 text-xs font-medium pl-5 line-clamp-1">
            {prizeFirst}
          </div>
        </div>

        {/* Schedule & Registration Status */}
        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-stone-500">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              比赛时间：{startDate} ~ {endDate}
            </span>
            <span className="font-medium text-[#2C3E50]">
              已报 {registeredTeams} / {maxTeams} 席 ({percentFull}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2C3E50] to-[#D4AF37] rounded-full transition-all duration-500"
              style={{ width: `${percentFull}%` }}
            ></div>
          </div>
        </div>

        {/* Pricing & CTA Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-500">参赛服务费</span>
              <span className="text-xs text-[#2C3E50] font-bold">¥</span>
              <span className="text-xl font-bold font-serif text-[#2C3E50]">
                {event.registrationFee || 2280}
              </span>
              <span className="text-xs text-stone-400">/人</span>
            </div>
            <div className="text-[11px] text-[#2C3E50]/80">含3晚国宾级食宿及全套定制伴手礼</div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openBooking('event', event);
              }}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1 border border-[#D4AF37]/30 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>组队报名</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
