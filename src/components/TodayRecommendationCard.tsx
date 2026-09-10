import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import {
  Sparkles,
  BookOpen,
  Compass,
  ChevronRight,
  Heart,
  ShieldCheck,
  Footprints,
  UserCheck,
  RefreshCw,
  Flame,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bot,
} from 'lucide-react';

export const TodayRecommendationCard: React.FC = () => {
  const {
    activities,
    setSelectedActivity,
    userProfile,
    toggleFavorite,
    isFavorited,
    openGlobalAiWithPrompt,
  } = useApp();

  // Active preference category: 'academic' (学术研学) or 'lightweight' (轻量文旅)
  // Default to 'academic' for scholar/professor profiles, or based on user identity
  const [prefType, setPrefType] = useState<'academic' | 'lightweight'>('academic');
  const [rotationIndex, setRotationIndex] = useState<number>(0);

  // Filter pool based on preference type
  const academicActivities = useMemo(() => {
    return activities.filter((a) => {
      return (
        a.category === '学者同行' ||
        a.form === '名校名师研学' ||
        a.productForm === '研学' ||
        !!a.master ||
        a.title.includes('研学') ||
        a.title.includes('学术') ||
        a.title.includes('文脉') ||
        a.title.includes('文博')
      );
    });
  }, [activities]);

  const lightweightActivities = useMemo(() => {
    return activities.filter((a) => {
      return (
        a.durationDays <= 4 ||
        a.fitnessLevel === 1 ||
        a.form === '雅集沙龙' ||
        a.form === '慢调旅居' ||
        a.category === '康养山海' ||
        a.category === '茶道文博' ||
        a.title.includes('养生') ||
        a.title.includes('慢调') ||
        a.title.includes('茶')
      );
    });
  }, [activities]);

  const currentPool = prefType === 'academic' ? academicActivities : lightweightActivities;
  const activePool = currentPool.length > 0 ? currentPool : activities;

  // Selected recommended activity
  const recommendedActivity: Activity | undefined =
    activePool[rotationIndex % activePool.length] || activities[0];

  const handleNextRecommendation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRotationIndex((prev) => (prev + 1) % activePool.length);
  };

  const handleOpenDetail = () => {
    if (recommendedActivity) {
      setSelectedActivity(recommendedActivity);
    }
  };

  if (!recommendedActivity) return null;

  // Match score & personalized reason calculation
  const matchScore = prefType === 'academic' ? 99 : 96;
  const userGreeting = userProfile.name ? `${userProfile.name}` : '您';
  const stepsComfort = userProfile.healthProfile?.maxDailyStepsComfort || 5000;

  return (
    <section className="relative bg-gradient-to-br from-[#FAF9F6] via-white to-amber-50/30 rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all duration-300">
      {/* 1. Header Bar: Tag, Personalized Match Reason, & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-200/80">
        <div className="flex items-center flex-wrap gap-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2C3E50] to-[#1f2d3a] text-amber-300 px-3 py-1 rounded-full text-xs font-bold shadow-2xs border border-[#D4AF37]/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>今日推荐</span>
            <span className="text-stone-400">·</span>
            <span className="text-[#FAF9F6]">智能甄选</span>
          </div>

          {/* Match Score Indicator */}
          <span className="inline-flex items-center gap-1 bg-amber-100/80 text-amber-900 border border-amber-300/80 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>契合度 {matchScore}%</span>
          </span>

          {/* User Custom Hint */}
          <span className="text-xs text-stone-500 hidden md:inline-block">
            为 <strong className="text-[#2C3E50] font-medium">{userGreeting}</strong> 专属量身匹配
          </span>
        </div>

        {/* Preference Category Selector (学术研学 vs 轻量文旅) + Refresh */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200/70 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPrefType('academic');
                setRotationIndex(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                prefType === 'academic'
                  ? 'bg-[#2C3E50] text-amber-200 font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>学术研学</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPrefType('lightweight');
                setRotationIndex(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                prefType === 'lightweight'
                  ? 'bg-[#2C3E50] text-amber-200 font-bold shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>轻量文旅</span>
            </button>
          </div>

          {/* Refresh / Next Pick Button */}
          {activePool.length > 1 && (
            <button
              onClick={handleNextRecommendation}
              className="flex items-center gap-1 text-xs text-stone-600 hover:text-[#2C3E50] bg-white hover:bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-xl font-medium transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="换一个推荐活动"
            >
              <RefreshCw className="w-3 h-3 text-stone-500" />
              <span className="hidden sm:inline">换一换</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Personalized Reason Callout */}
      <div className="mt-2.5 mb-3 bg-amber-50/70 rounded-xl px-3 py-1.5 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="line-clamp-1">
            <strong>推荐依据：</strong>
            {prefType === 'academic'
              ? `依据您的学术名仕偏好，精选名师随行解读与闭馆特展深度慢游`
              : `依据适老健步习惯（日均≤${stepsComfort}步），精选平缓无阶、慢调养生雅集`}
          </span>
        </div>
        <span className="text-[11px] text-amber-700 font-medium shrink-0 ml-2 hidden sm:inline">
          平缓慢行 · 适老五星
        </span>
      </div>

      {/* 3. Main Recommendation Showcase Card (Clickable to open detail) */}
      <div
        onClick={handleOpenDetail}
        className="group cursor-pointer bg-white rounded-2xl p-3 md:p-4 border border-stone-200/90 shadow-2xs hover:border-[#D4AF37] hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4"
      >
        {/* Left/Top: Visual Cover & Fast Badges */}
        <div className="relative w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 bg-stone-100">
          <img
            src={recommendedActivity.cover}
            alt={recommendedActivity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>

          {/* Top Left Tag: Category & Form */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="bg-[#2C3E50]/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-[#D4AF37]/30">
              {recommendedActivity.form || recommendedActivity.category}
            </span>
            <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
              {recommendedActivity.durationDays}天{recommendedActivity.durationNights}晚
            </span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recommendedActivity.id);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white flex items-center justify-center transition-colors cursor-pointer"
            title="收藏此活动"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited(recommendedActivity.id)
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-white'
              }`}
            />
          </button>

          {/* Bottom Destination & Level */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
            <span className="flex items-center gap-1 truncate font-medium drop-shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{recommendedActivity.destination.split('·')[0]}</span>
            </span>
            <span className="text-amber-200 font-serif">适老五星保障</span>
          </div>
        </div>

        {/* Right/Body: Deep Information & Elderly-friendly Attributes */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Title & Level */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50] group-hover:text-amber-700 transition-colors line-clamp-1">
                  {recommendedActivity.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {recommendedActivity.subtitle}
                </p>
              </div>
            </div>

            {/* Scholar / Master Profile Pill (If Available) */}
            {recommendedActivity.master && (
              <div className="flex items-center gap-2 bg-[#FAF9F6] border border-stone-200/80 rounded-xl p-2">
                <img
                  src={recommendedActivity.master.avatar}
                  alt={recommendedActivity.master.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-300/60"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#2C3E50]">
                      {recommendedActivity.master.name}
                    </span>
                    <span className="bg-[#D4AF37]/15 text-[#85660d] text-[10px] font-bold px-1.5 py-0.2 rounded border border-[#D4AF37]/30">
                      随行导师
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {recommendedActivity.master.title}
                  </p>
                </div>
              </div>
            )}

            {/* Senior Comfort Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-stone-600 bg-stone-50 rounded-lg p-1.5 border border-stone-150">
                <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] truncate">
                  步数：日均约 3.5k-4.5k
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 bg-stone-50 rounded-lg p-1.5 border border-stone-150">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] truncate">配备随团医护与AED</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 bg-stone-50 rounded-lg p-1.5 border border-stone-150 col-span-2 sm:col-span-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px] truncate">1人2座航空舱大巴</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Button Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-stone-500">大团立享</span>
              <span className="font-serif font-bold text-lg md:text-xl text-[#2C3E50]">
                ¥{recommendedActivity.priceGroup.toLocaleString()}
              </span>
              <span className="text-xs text-stone-400">/人起</span>
              {recommendedActivity.isFreeEligible && (
                <span className="hidden sm:inline-block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                  可享年度免费慢游权益
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (openGlobalAiWithPrompt) {
                    openGlobalAiWithPrompt(`请向我介绍一下「${recommendedActivity.title}」的行程亮点与适老细节`);
                  }
                }}
                className="hidden sm:flex items-center gap-1 text-xs text-stone-600 hover:text-[#2C3E50] bg-stone-100 hover:bg-stone-200/80 px-2.5 py-2 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-amber-700" />
                <span>问管家</span>
              </button>

              <button
                type="button"
                onClick={handleOpenDetail}
                className="flex items-center gap-1 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#c29e2e] hover:to-[#b38f20] text-stone-950 font-bold text-xs md:text-sm px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <span>查看活动详情</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
