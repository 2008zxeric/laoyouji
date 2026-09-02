import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Compass,
  Trophy,
  Users,
  Gift,
  Bot,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Award,
  Heart,
  UserCheck,
  Footprints,
  Clock,
  ThumbsUp,
  Share2,
  BookOpen,
  ArrowRight,
  Sun,
  Activity as ActivityIcon,
} from 'lucide-react';
import { MOCK_ARTICLES, MOCK_PAST_EVENTS } from '../data/mockData';
import { Activity, TournamentEvent } from '../types';

export const HomeView: React.FC = () => {
  const {
    activities,
    events,
    tgos,
    setSelectedActivity,
    setSelectedEvent,
    setIsTgoListOpen,
    isTgoListOpen, // Add this
    setSelectedTgo,
    openBooking,
    openPoster,
    toggleFavorite,
    isFavorited,
    setActiveTab,
    setIsCheckinOpen,
    setIsPointsMallOpen,
    setIsMembershipModalOpen,
    userProfile,
    currentTier,
    openGlobalAiWithPrompt,
  } = useApp();

  // Hero carousel active index
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Featured top activities & events for the home showcase
  const featuredActivities = activities.filter((a) => a.isFeatured || a.rating >= 4.9).slice(0, 3);
  const featuredEvents = events.slice(0, 2);

  // Auto rotate banner every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const heroBanners = [
    {
      id: 'banner-1',
      title: '江南文脉 · 苏州园林美学与昆曲私享慢游',
      subtitle: '苏大古建教授伴游 · 耦园闭馆夜游评弹雅集 · 拙政园晨光包场',
      tag: '金秋学者行',
      badge: '仅剩 3 席',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      type: 'activity' as const,
      data: activities[0],
      price: '¥5,680 起',
    },
    {
      id: 'banner-2',
      title: '第二届全国乐龄“智汇杯”掼蛋大师黄山温泉公开赛',
      subtitle: '总奖池50万积分 · 纯正黄山温泉康养 · 国家级裁判长现场执裁',
      tag: '重磅赛事',
      badge: '报名过半',
      image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
      type: 'event' as const,
      data: events[0],
      price: '¥2,280 /双人队',
    },
    {
      id: 'banner-3',
      title: '长安寻根 · 盛唐气象与终南山草堂茶会 6日',
      subtitle: '陕博资深研究员专场私享 · 终南山草堂古琴茶道雅集',
      tag: '文化研学',
      badge: '早鸟立减',
      image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=1200&q=80',
      type: 'activity' as const,
      data: activities[1] || activities[0],
      price: '¥6,880 起',
    },
  ];

  const currentBanner = heroBanners[activeBannerIndex];

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* 1. Hero Cultural Carousel Banner */}
      <section className="relative rounded-3xl overflow-hidden shadow-lg border border-[#EAE6DF] bg-stone-900 group">
        <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden">
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Gradient Overlay for high text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent"></div>

          {/* Top Banner Tags */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow-md backdrop-blur-md">
              {currentBanner.tag}
            </span>
            <span className="bg-rose-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md animate-pulse">
              {currentBanner.badge}
            </span>
          </div>

          {/* Banner Content Bottom */}
          <div className="absolute bottom-4 left-4 right-4 text-[#FAF9F6]">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h2 className="text-lg sm:text-2xl font-serif italic font-semibold leading-tight drop-shadow-sm line-clamp-1">
                {currentBanner.title}
              </h2>
              <span className="text-[#A68F6C] font-serif font-semibold text-base sm:text-xl shrink-0">
                {currentBanner.price}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#DCDAD7] line-clamp-1 mb-3 opacity-90 font-light">
              {currentBanner.subtitle}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#FAF9F6]/15">
              <div className="flex items-center gap-2">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeBannerIndex === idx ? 'w-6 bg-[#A68F6C]' : 'w-2 bg-[#FAF9F6]/50'
                    }`}
                    title={`切换第 ${idx + 1} 张`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentBanner.type === 'activity') {
                      setSelectedActivity(currentBanner.data as Activity);
                    } else {
                      setSelectedEvent(currentBanner.data as TournamentEvent);
                    }
                  }}
                  className="bg-[#D4AF37] hover:bg-[#C5A028] text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center gap-1"
                >
                  <span>查看详情</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Senior Dispatch & Daily Comfort Index */}
      <section className="bg-white rounded-2xl p-4 border border-[#E6E3DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4E0D9] text-[#3A3F44] flex items-center justify-center shrink-0 border border-[#DCDAD7]">
            <Sun className="w-5 h-5 text-[#8B939A] animate-spin duration-10000" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-[#3A3F44] text-sm">乐龄金秋乐游指数</span>
              <span className="bg-[#E4E0D9] text-[#5D666E] font-medium text-[10px] px-2 py-0.5 rounded-full border border-[#DCDAD7]">
                适宜度 98% · 宜缓步
              </span>
            </div>
            <p className="text-xs text-[#7D7F82] mt-0.5 line-clamp-1">
              今日江浙及徽州秋高气爽，平均步数预计控制在 4,000 步以内，配备随团医疗包。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => openGlobalAiWithPrompt ? openGlobalAiWithPrompt() : setActiveTab('ai')}
            className="flex-1 sm:flex-none text-xs bg-[#FAF9F6] hover:bg-[#F0EEEB] text-[#5D666E] border border-[#EAE6DF] px-3 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#A68F6C]" />
            <span>问AI管家</span>
          </button>
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="flex-1 sm:flex-none text-xs bg-[#3A3F44] hover:bg-[#2C3E50] text-[#FAF9F6] px-3 py-1.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-[#5D666E] transition-transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#A68F6C]" />
            <span>今日签到</span>
          </button>
        </div>
      </section>

      {/* 2.5 NEW: 1+2 Layout (Find Companions + Slow Travel/Competition) */}
      <section className="space-y-4">
        {/* Hero: Find Companions (Most Prominent) */}
        <div
          onClick={() => {
            // Placeholder: Show selector modal
            setIsTgoListOpen(true);
          }}
          className="relative bg-gradient-to-br from-[#2C3E50] via-[#1f2d3a] to-[#2C3E50] rounded-3xl p-6 shadow-xl border border-[#D4AF37]/60 cursor-pointer overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/15 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center justify-between z-10 relative">
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-2xl text-[#FAF9F6]">找旅伴 · 名师管家</h3>
              <p className="text-sm text-stone-300">TGO/名师/裁判，三位一体尊享随行</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] text-[#2C3E50] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* New Interactive AI Companion Portal */}
        <div
          onClick={() => openGlobalAiWithPrompt ? openGlobalAiWithPrompt('请帮我规划一段舒缓的慢游行程') : setActiveTab('ai')}
          className="bg-[#2C3E50] rounded-3xl p-5 shadow-lg border border-[#D4AF37]/40 flex items-center gap-4 cursor-pointer hover:bg-[#1f2d3a] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0 animate-pulse">
            <Bot className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-bold text-lg text-[#FAF9F6]">伴游 AI 管家</h3>
            <p className="text-xs text-stone-300 mt-1">24小时语音陪伴，适老规划，即问即答</p>
          </div>
          <ChevronRight className="w-6 h-6 text-[#D4AF37]" />
        </div>

        {/* 2-Grid: Travel / Competition (Distinct, Elevated) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Find Travel */}
          <div
            onClick={() => setActiveTab('activities')}
            className="bg-gradient-to-br from-amber-50 to-white rounded-3xl p-5 border border-[#D4AF37]/40 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Compass className="w-6 h-6 text-[#2C3E50]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">找慢游</h3>
              <p className="text-xs text-stone-500 mt-1">发现适老文旅</p>
            </div>
          </div>
          {/* Find Competition */}
          <div
            onClick={() => setActiveTab('events')}
            className="bg-gradient-to-br from-rose-50 to-white rounded-3xl p-5 border border-rose-200 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">找赛事</h3>
              <p className="text-xs text-stone-500 mt-1">一展竞技风采</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Refined Portals Navigation (Reduced to 4) */}
      <section className="grid grid-cols-4 gap-3">
        {[
          { title: '会员礼遇', icon: Award, action: () => setIsMembershipModalOpen(true) },
          { title: '积分商城', icon: Gift, action: () => setIsPointsMallOpen(true) },
          { title: '老友圈', icon: Users, action: () => setActiveTab('community') },
          { title: 'AI规划', icon: Bot, action: () => openGlobalAiWithPrompt ? openGlobalAiWithPrompt() : setActiveTab('ai') },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="bg-white p-3 rounded-2xl border border-[#EAE6DF] flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2C3E50]/5 text-[#2C3E50] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-bold text-[11px] text-[#2C3E50]">{item.title}</span>
            </button>
          );
        })}
      </section>

      {/* 4. Season Curated Slow Travel Highlights */}
      <section className="space-y-3.5">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-4 bg-[#D4AF37] rounded-full"></span>
              <h2 className="text-lg md:text-xl font-serif italic font-bold text-[#2C3E50]">
                本季重磅 · 慢游文博
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-sans ml-3.5 mt-0.5">
              名校教授全程伴游 · 适老五星旅居 · 每天步数不超标
            </p>
          </div>
          <button
            onClick={() => setActiveTab('activities')}
            className="text-xs font-bold text-[#2C3E50] hover:text-[#D4AF37] flex items-center gap-0.5 transition-colors"
          >
            <span>全部活动</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredActivities.map((activity) => {
            const isFav = isFavorited(activity.id);
            return (
              <div
                key={activity.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                {/* Image Section */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                  <img
                    src={activity.cover}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></div>

                  {/* Badges on card top */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-[#2C3E50] text-[#D4AF37] text-[11px] font-bold px-2.5 py-0.8 rounded-full border border-[#D4AF37]/40 shadow-xs">
                      {activity.category}
                    </span>
                    <span className="bg-stone-900/80 text-white text-[11px] px-2 py-0.8 rounded-full backdrop-blur-md border border-white/20">
                      {activity.durationDays}天{activity.durationNights}晚
                    </span>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(activity.id);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 ${
                      isFav ? 'text-rose-500' : 'text-white'
                    }`}
                    title="收藏"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Destination & Departure City */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 opacity-90">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{activity.destination}</span>
                    </div>
                    <div className="bg-black/50 px-2 py-0.5 rounded-md text-[10px] text-amber-200">
                      {activity.departureDates[0]?.date} 出发
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif italic font-bold text-base text-[#2C3E50] group-hover:text-[#B8843E] transition-colors line-clamp-1 leading-snug">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 font-light leading-relaxed">
                      {activity.subtitle}
                    </p>
                  </div>

                  {/* Scholar Mentor Pill */}
                  {activity.master && (
                    <div className="flex items-center gap-2.5 bg-[#FAF9F6] p-2 rounded-xl border border-[#EAE6DF]">
                      <img
                        src={activity.master.avatar}
                        alt={activity.master.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/50"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-xs text-[#2C3E50]">
                            {activity.master.name}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                            {activity.master.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">{activity.master.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Dual-package price & CTA */}
                  <div className="pt-2 border-t border-[#EAE6DF] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-500">
                        大团 ¥{activity.priceGroup.toLocaleString()} ·{' '}
                        <span className="font-medium text-[#2C3E50]">私享小团</span>
                      </div>
                      <div className="text-base font-serif font-bold text-[#D4AF37] flex items-baseline gap-0.5">
                        <span className="text-xs">¥</span>
                        <span>{activity.pricePremium.toLocaleString()}</span>
                        <span className="text-[11px] text-stone-400 font-sans font-normal ml-1">/人起</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPoster(activity);
                        }}
                        className="p-2 rounded-xl text-stone-500 hover:text-[#2C3E50] hover:bg-stone-100 transition-colors border border-stone-200"
                        title="生成海报"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openBooking('activity', activity);
                        }}
                        className="bg-[#2C3E50] hover:bg-[#1f2d3a] text-[#FAF9F6] px-3.5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-2xs border border-[#D4AF37]/30"
                      >
                        立即预订
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Senior Mind Sports & Tournaments (掼蛋·桥牌) */}
      <section className="space-y-3.5">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-4 bg-rose-600 rounded-full"></span>
              <h2 className="text-lg md:text-xl font-serif italic font-bold text-[#2C3E50]">
                乐龄赛事 · 智乐长青
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-sans ml-3.5 mt-0.5">
              全国掼蛋/桥牌邀请赛 · 丰厚积分奖池 · 徽州温汤康养
            </p>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="text-xs font-bold text-[#2C3E50] hover:text-[#D4AF37] flex items-center gap-0.5 transition-colors"
          >
            <span>全部赛事</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredEvents.map((evt) => {
            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => setSelectedEvent(evt)}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                  <img
                    src={evt.cover}
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.8 rounded-full shadow-xs flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-[#D4AF37]" />
                      {evt.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-[#2C3E50]/90 backdrop-blur-md text-[#D4AF37] text-xs font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                    总奖池 {(evt.prizePool?.points || 50000).toLocaleString()} 积分
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-xs text-amber-200 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{evt.city} · {evt.venue}</span>
                    </div>
                    <h3 className="font-serif italic font-bold text-base line-clamp-1 text-white">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2">{evt.subtitle}</p>

                  <div className="flex items-center justify-between bg-[#FAF9F6] p-2 rounded-xl text-xs border border-[#EAE6DF]">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{evt.startDate} 至 {evt.endDate}</span>
                    </div>
                    <div className="text-xs font-bold text-rose-600">
                      已报 {evt.registeredTeams}/{evt.maxTeams} 队
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE6DF] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-500">双人队报名费</div>
                      <div className="text-base font-serif font-bold text-[#D4AF37]">
                        ¥{evt.registrationFee.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBooking('event', evt);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-2xs"
                    >
                      名仕报名
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Placeholder for future expansion if needed */}
      <div className="h-12"></div>
    </div>
  );
};
