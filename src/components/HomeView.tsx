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
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h2 className="text-lg sm:text-2xl font-serif italic font-bold leading-tight drop-shadow-md text-[#FAF9F6] line-clamp-1">
                {currentBanner.title}
              </h2>
              <span className="text-[#D4AF37] font-serif font-bold text-base sm:text-xl shrink-0">
                {currentBanner.price}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-1 mb-3 opacity-90 font-light">
              {currentBanner.subtitle}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-white/15">
              <div className="flex items-center gap-2">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeBannerIndex === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/50'
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
      <section className="bg-gradient-to-r from-[#2C3E50]/5 via-amber-500/10 to-[#2C3E50]/5 rounded-2xl p-3.5 border border-[#D4AF37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-sm border border-[#D4AF37]/40">
            <Sun className="w-5 h-5 text-[#D4AF37] animate-spin duration-10000" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#2C3E50] text-sm">老友金秋适游指数</span>
              <span className="bg-[#D4AF37]/20 text-[#2C3E50] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                适宜度 98% · 宜缓步
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-1">
              今日江浙及徽州秋高气爽，平均步数预计控制在 4,000 步以内，配备随团医疗包。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => openGlobalAiWithPrompt ? openGlobalAiWithPrompt() : setActiveTab('ai')}
            className="flex-1 sm:flex-none text-xs bg-white hover:bg-stone-50 text-[#2C3E50] border border-[#EAE6DF] px-3 py-1.5 rounded-xl font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>问AI管家</span>
          </button>
          <button
            onClick={() => setIsCheckinOpen(true)}
            className="flex-1 sm:flex-none text-xs bg-[#2C3E50] hover:bg-[#1f2d3a] text-[#FAF9F6] px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs border border-[#D4AF37]/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>今日签到</span>
          </button>
        </div>
      </section>

      {/* 2.5 首页最醒目 2 大核心入口：找慢游 / 找赛事（复刻设计稿规范与大字号直观指引） */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 找活动大入口 */}
        <div
          onClick={() => setActiveTab('activities')}
          className="relative bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 rounded-3xl p-4 sm:p-5 border border-[#D4AF37]/40 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between group overflow-hidden"
        >
          <div className="absolute top-3 right-3 bg-[#D4AF37] text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            热
          </div>
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center font-bold text-base shadow-xs">
                🧭
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2C3E50] group-hover:text-[#D4AF37] transition-colors">
                找慢游
              </h3>
            </div>
            <p className="text-xs text-stone-600">主题 · 行程 · 预算 · 时间，随您筛选</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="bg-white text-stone-700 border border-[#D4AF37]/30 text-[10px] px-2 py-0.5 rounded-full font-medium">江南文博</span>
              <span className="bg-white text-stone-700 border border-[#D4AF37]/30 text-[10px] px-2 py-0.5 rounded-full font-medium">名师随行</span>
              <span className="bg-white text-stone-700 border border-[#D4AF37]/30 text-[10px] px-2 py-0.5 rounded-full font-medium">康养慢游</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#2C3E50] group-hover:text-[#D4AF37] font-bold text-xs shrink-0 pl-2">
            <span>去逛逛</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 找赛事大入口 */}
        <div
          onClick={() => setActiveTab('events')}
          className="relative bg-gradient-to-br from-rose-50/80 via-white to-rose-100/40 rounded-3xl p-4 sm:p-5 border border-rose-300/60 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between group overflow-hidden"
        >
          <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
            赛
          </div>
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center font-bold text-base shadow-xs">
                🏆
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2C3E50] group-hover:text-rose-700 transition-colors">
                找赛事
              </h3>
            </div>
            <p className="text-xs text-stone-600">掼蛋 · 桥牌 · 摄影 · 太极，一展身手</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="bg-white text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-medium">荣誉奖池</span>
              <span className="bg-white text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-medium">双人组队</span>
              <span className="bg-white text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-medium">乐龄竞技</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#2C3E50] group-hover:text-rose-700 font-bold text-xs shrink-0 pl-2">
            <span>去参赛</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* 3. Quick Portals Navigation (6 Gold Grid) */}
      <section className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 md:gap-3.5">
        {[
          {
            title: '找慢游',
            subtitle: '江南·文博',
            icon: Compass,
            action: () => setActiveTab('activities'),
            color: 'from-amber-500/10 to-amber-600/20 text-[#2C3E50]',
            border: 'border-[#D4AF37]/40',
          },
          {
            title: '乐龄赛事',
            subtitle: '掼蛋·桥牌',
            icon: Trophy,
            action: () => setActiveTab('events'),
            color: 'from-rose-500/10 to-rose-600/20 text-[#2C3E50]',
            border: 'border-rose-300/60',
            badge: '奖金',
          },
          {
            title: '名仕会员',
            subtitle: `${currentTier.name.split('·')[1]}礼遇`,
            icon: Award,
            action: () => setIsMembershipModalOpen(true),
            color: 'from-[#2C3E50]/10 to-[#2C3E50]/20 text-[#2C3E50]',
            border: 'border-[#2C3E50]/30',
          },
          {
            title: '积分商城',
            subtitle: `${userProfile.points} 积分`,
            icon: Gift,
            action: () => setIsPointsMallOpen(true),
            color: 'from-emerald-500/10 to-emerald-600/20 text-[#2C3E50]',
            border: 'border-emerald-300/60',
          },
          {
            title: '老友圈',
            subtitle: '心愿·游记',
            icon: Users,
            action: () => setActiveTab('community'),
            color: 'from-sky-500/10 to-sky-600/20 text-[#2C3E50]',
            border: 'border-sky-300/60',
          },
          {
            title: '伴游管家',
            subtitle: '金牌伴游库',
            icon: Award,
            action: () => setIsTgoListOpen(true),
            color: 'from-amber-500/10 to-amber-600/20 text-[#2C3E50]',
            border: 'border-amber-300/60',
            badge: '名师',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className={`relative bg-gradient-to-b ${item.color} bg-white p-3 rounded-2xl border ${item.border} flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all active:scale-95 group`}
            >
              {item.badge && (
                <span className="absolute -top-1.5 -right-1 bg-[#D4AF37] text-stone-950 text-[9px] font-bold px-1.5 py-0.2 rounded-full scale-90 shadow-2xs">
                  {item.badge}
                </span>
              )}
              <div className="w-9 h-9 rounded-xl bg-white/90 shadow-xs flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-[#2C3E50]" />
              </div>
              <span className="font-serif font-bold text-xs text-[#2C3E50] leading-tight">
                {item.title}
              </span>
              <span className="text-[10px] text-stone-500 font-sans mt-0.5">{item.subtitle}</span>
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

      {/* 6. Scholars & Certified TGO Companions */}
      <section className="bg-[#2C3E50] rounded-3xl p-4 md:p-5 text-[#FAF9F6] border border-[#D4AF37]/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-stone-950 flex items-center justify-center font-serif font-bold text-sm">
              管
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-base md:text-lg text-[#FAF9F6]">
                金牌 TGO 伴游管家 · 如侍父母
              </h2>
              <p className="text-[11px] text-[#D4AF37]/90 font-sans">
                特聘国家研学导师 · 红十字急救双认证 · 全程慢步慢语
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTgoListOpen(true)}
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
          >
            <span>全部 {tgos.length} 位管家</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tgos.slice(0, 3).map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTgo(t)}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 hover:border-[#D4AF37]/60 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 shadow-xs"
                    style={{ borderColor: t.color || '#D4AF37' }}
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-stone-950 text-[9px] px-1 py-0.2 rounded-full font-bold shadow-2xs">
                    {t.badge || (t.tier === 'gold' ? '金牌' : '资深')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm text-[#FAF9F6] group-hover:text-[#D4AF37] transition-colors">
                      {t.name}
                    </span>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold">
                      {t.tier === 'gold' ? '金旅伴' : '银旅伴'}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 line-clamp-1 mt-0.5">{t.title}</p>
                </div>
              </div>
              <p className="text-xs text-stone-200 line-clamp-2 font-light leading-relaxed">
                "{t.motto || '慢游随心，如侍父母，细心照护每一位老友。'}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-amber-200/90 pt-1 border-t border-white/10">
                <span>带团 {t.trips || 12}+ 场 · 评分 5.0</span>
                <span className="text-[#D4AF37] font-bold group-hover:underline flex items-center gap-0.5">
                  <span>查看排期与预约</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Senior Testimonials & Editorial Stories */}
      <section className="space-y-3.5">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-4 bg-emerald-600 rounded-full"></span>
              <h2 className="text-lg md:text-xl font-serif italic font-bold text-[#2C3E50]">
                老友随笔 · 真实足迹
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-sans ml-3.5 mt-0.5">
              知识分子同行 · 99.4% 好评率 · 见字如面
            </p>
          </div>
          <button
            onClick={() => setActiveTab('community')}
            className="text-xs font-bold text-[#2C3E50] hover:text-[#D4AF37] flex items-center gap-0.5 transition-colors"
          >
            <span>老友圈全部</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ARTICLES.slice(0, 2).map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveTab('community')}
              className="bg-white rounded-3xl p-4 border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={art.avatar}
                    alt={art.author}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-serif font-bold text-[#2C3E50]">{art.author}</span>
                    <span className="text-[10px] text-stone-400">· {art.authorTitle}</span>
                  </div>
                </div>

                <h3 className="font-serif italic font-bold text-sm md:text-base text-[#2C3E50] leading-snug line-clamp-1">
                  {art.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {art.content[0]}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  {art.tags.map((t, idx) => (
                    <span key={idx} className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[#2C3E50]">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{art.likes} 知音赞</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Six Senior Service Guarantees */}
      <section className="bg-gradient-to-br from-[#FAF9F6] to-[#F5F2EB] rounded-3xl p-4 md:p-6 border border-[#D4AF37]/30 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
            Six Senior Travel Standards
          </span>
          <h2 className="text-lg md:text-xl font-serif italic font-bold text-[#2C3E50]">
            老友记 · 适老名仕六重保障体系
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            专为50-75岁退休学者、高知老友量身打造，省心、舒缓、尊严、体面
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              title: '纯玩零购物',
              desc: '绝无任何隐形消费与进店，全心沉浸文化与慢步。',
              icon: ShieldCheck,
            },
            {
              title: '舒缓步数控制',
              desc: '每日步数严格控制在4000-6000步，无陡峭台阶。',
              icon: Footprints,
            },
            {
              title: '随团医疗健康包',
              desc: '每团随配急救箱，每日晨起/晚间监测血压血氧。',
              icon: ActivityIcon,
            },
            {
              title: '航空头等舱大巴',
              desc: '2+1宽体座椅，前后间距超1米，平稳不颠簸。',
              icon: Award,
            },
            {
              title: '6-12人私享小团',
              desc: '名仕精品拼小团，团友皆同道高知，节奏随心。',
              icon: Users,
            },
            {
              title: '家属安心联络',
              desc: '老友管家每日向家属同步行程简报与精修相册。',
              icon: UserCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/80 rounded-2xl p-3 border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2C3E50]/10 text-[#2C3E50] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#2C3E50]" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#2C3E50]">{item.title}</h4>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
