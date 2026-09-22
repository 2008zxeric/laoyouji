import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import {
  Sparkles,
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
  SlidersHorizontal,
  History,
  BookOpen,
  Award,
  Check,
  X,
} from 'lucide-react';

const CANDIDATE_INTERESTS = [
  '古建文博',
  '园林美学',
  '非遗茶道',
  '名师同行',
  '道医养生',
  '盛唐历史',
  '温泉康养',
  '山海轻步',
  '书法金石',
  '昆曲评弹',
  '生态林泉',
  '乐龄赛事',
];

export const AiPersonalizedRecommendationSection: React.FC = () => {
  const {
    activities,
    orders,
    userProfile,
    updateResearchInterests,
    setSelectedActivity,
    openBooking,
    toggleFavorite,
    isFavorited,
    openGlobalAiWithPrompt,
  } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTuningOpen, setIsTuningOpen] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>(
    userProfile.researchInterests || ['古建文博', '园林美学', '非遗茶道', '名师同行', '道医养生']
  );

  const userInterests = userProfile.researchInterests || ['古建文博', '园林美学', '非遗茶道', '名师同行', '道医养生'];

  // Past activity titles & categories from orders
  const pastTripTitles = useMemo(() => {
    return orders.map((o) => o.targetTitle).filter(Boolean);
  }, [orders]);

  // Scoring algorithm for each activity based on researchInterests and past orders
  const scoredActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    return activities
      .map((activity) => {
        let score = 75; // base score
        const matchReasons: string[] = [];

        // 1. Interest Matching
        let interestHitCount = 0;
        const textToSearch = `${activity.title} ${activity.subtitle || ''} ${activity.category || ''} ${activity.form || ''} ${
          activity.master?.title || ''
        } ${activity.master?.name || ''} ${(activity.features || []).join(' ')} ${(activity.seniorFeatures || []).join(' ')}`;

        userInterests.forEach((interest) => {
          if (textToSearch.includes(interest)) {
            interestHitCount++;
          }
        });

        if (interestHitCount > 0) {
          const boost = Math.min(interestHitCount * 5.5, 18);
          score += boost;
          matchReasons.push(
            `高度命中您偏好的【${userInterests.filter((i) => textToSearch.includes(i)).slice(0, 2).join(' / ')}】研学方向`
          );
        }

        // 2. Scholar / Master Bonus
        if (activity.master) {
          score += 4.5;
          matchReasons.push(`特邀专家名师【${activity.master.name}】全程伴游解析深度文脉`);
        }

        // 3. Historical participation continuity
        const hasSuzhouHistory = pastTripTitles.some((t) => t.includes('苏州') || t.includes('园林'));
        if (hasSuzhouHistory) {
          if (activity.destination.includes('西安') || activity.title.includes('盛唐') || activity.title.includes('长安')) {
            score += 5;
            matchReasons.push('承接您此前参与的《苏州园林昆曲慢游》，文脉从江南宋元雅韵升华至盛唐长安气象');
          } else if (activity.destination.includes('武夷山') || activity.title.includes('茶')) {
            score += 4.5;
            matchReasons.push('延续您对江南雅集品茗的喜爱，升级至武夷九曲非遗母树大红袍沉浸式溯源');
          }
        }

        // 4. Senior health & comfort safety compatibility
        const maxSteps = userProfile.healthProfile?.maxDailyStepsComfort || 5000;
        if (activity.fitnessLevel <= 2) {
          score += 3;
          matchReasons.push(`全线平缓缓步设计，日均步数约 3,200~4,200 步，完全契合您 ≤${maxSteps} 步舒适区间`);
        }

        // Cap score at 99.5
        const finalScore = Math.min(Number(score.toFixed(1)), 99.5);

        return {
          activity,
          score: finalScore,
          reasons: matchReasons.slice(0, 3),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [activities, userInterests, pastTripTitles, userProfile.healthProfile]);

  const topRecommendations = scoredActivities.slice(0, 4);
  const currentItem = topRecommendations[activeIndex % topRecommendations.length] || topRecommendations[0];

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % topRecommendations.length);
      setIsRefreshing(false);
    }, 350);
  };

  const handleOpenTuning = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempInterests(userInterests);
    setIsTuningOpen(true);
  };

  const toggleInterestTag = (tag: string) => {
    setTempInterests((prev) =>
      prev.includes(tag) ? (prev.length > 1 ? prev.filter((t) => t !== tag) : prev) : [...prev, tag]
    );
  };

  const handleSaveTuning = () => {
    updateResearchInterests(tempInterests);
    setIsTuningOpen(false);
    setActiveIndex(0);
  };

  if (!currentItem) return null;

  const { activity: currentActivity, score: currentScore, reasons: currentReasons } = currentItem;
  const isCurrentFav = isFavorited(currentActivity.id);

  return (
    <section className="relative bg-gradient-to-br from-[#FAF9F6] via-white to-amber-50/20 rounded-3xl p-4 sm:p-6 border border-[#EAE6DF] shadow-sm hover:shadow-md transition-all duration-300">
      {/* 1. Header Bar: Title, Subtitle, & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-serif font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AI 个性化推荐</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>已同步适老健康档案</span>
            </span>
            <span className="text-xs text-stone-500 font-serif">
              基于【{userProfile.name}】研学偏好与往期出游
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-1">
            智能研判研学偏好、历史参团习惯与步数心率，为您优选文脉相承的慢游路线
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleOpenTuning}
            className="text-xs bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="微调研学兴趣方向"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>调校兴趣</span>
          </button>
          <button
            onClick={handleRefresh}
            className="text-xs bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="更换推荐路线"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>换一批</span>
          </button>
          <button
            onClick={() =>
              openGlobalAiWithPrompt(
                `你好小老友，请针对赵元博教授的研学兴趣（${userInterests.join(
                  '、'
                )}）和已参加的《苏州园林昆曲慢游》，详细解析为什么推荐《${currentActivity.title}》？有哪些适老安排？`
              )
            }
            className="text-xs bg-gradient-to-r from-[#2C3E50] to-[#1f2d3a] hover:from-[#1f2d3a] hover:to-[#2C3E50] text-[#FAF9F6] px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>问AI理由</span>
          </button>
        </div>
      </div>

      {/* 2. User Context Banner: Current Interests & Historical Continuity */}
      <div className="mt-3.5 bg-amber-50/60 rounded-2xl p-3 border border-amber-200/50 flex flex-wrap items-center justify-between gap-2.5 text-xs text-stone-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-amber-900 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            研学画像偏好：
          </span>
          {userInterests.map((interest) => (
            <span
              key={interest}
              className="bg-white/90 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/80 font-serif"
            >
              #{interest}
            </span>
          ))}
        </div>

        {pastTripTitles.length > 0 && (
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
            <History className="w-3.5 h-3.5 text-stone-400" />
            <span>参考历史：已参加 {pastTripTitles[0].slice(0, 16)}...</span>
          </div>
        )}
      </div>

      {/* 3. Main Showcase Card: Recommended Activity */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Image & Key Badges */}
        <div
          onClick={() => setSelectedActivity(currentActivity)}
          className="lg:col-span-5 relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm min-h-[220px]"
        >
          <img
            src={currentActivity.cover}
            alt={currentActivity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* AI Match Score Badge */}
          <div className="absolute top-3 left-3 bg-amber-500/95 backdrop-blur-md text-white text-xs font-serif font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-300/40">
            <Flame className="w-3.5 h-3.5 text-amber-100 fill-amber-100" />
            <span>AI 契合指数 {currentScore}%</span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentActivity.id);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isCurrentFav ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
          </button>

          {/* Bottom Info on Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-2 text-xs text-amber-200/90 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentActivity.destination}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{currentActivity.durationDays}天{currentActivity.durationNights}晚</span>
            </div>
            <h4 className="font-serif font-bold text-base line-clamp-1 group-hover:text-amber-200 transition-colors">
              {currentActivity.title}
            </h4>
          </div>
        </div>

        {/* Right: Detailed Match Analysis & Booking Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold font-serif">
                    {currentActivity.category}
                  </span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                    {currentActivity.form}
                  </span>
                  {currentActivity.master && (
                    <span className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200/50 flex items-center gap-1 font-serif">
                      <Award className="w-3 h-3 text-blue-600" />
                      <span>{currentActivity.master.badge} · {currentActivity.master.name}</span>
                    </span>
                  )}
                </div>
                <h3
                  onClick={() => setSelectedActivity(currentActivity)}
                  className="font-serif font-bold text-lg md:text-xl text-[#2C3E50] hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {currentActivity.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {currentActivity.subtitle}
                </p>
              </div>
            </div>

            {/* AI Recommendation Rationale Box */}
            <div className="mt-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>AI 智能研判推荐理由：</span>
              </div>
              <div className="space-y-1.5">
                {currentReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200/60">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-stone-500">会员尊享价</span>
                <span className="font-serif font-bold text-2xl text-amber-900">
                  ¥{currentActivity.priceGroup.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500">起 / 人</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                ✨ 赠送返还约 {Math.round(currentActivity.priceGroup * 1.5 * 1.5).toLocaleString()} 积分 · 支持积分抵扣
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedActivity(currentActivity)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-serif font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>线路详情</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openBooking('activity', currentActivity)}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>专属预约</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Alternative High-Matching Routes Carousel Bar */}
      <div className="mt-5 pt-4 border-t border-stone-200/70">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-serif font-semibold text-stone-600 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>更多高契合候选路线（点击切换）：</span>
          </span>
          <span className="text-[11px] text-stone-400">
            共精选 {topRecommendations.length} 条文旅路线
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topRecommendations.map((item, idx) => {
            const isSelected = idx === activeIndex % topRecommendations.length;
            return (
              <div
                key={item.activity.id}
                onClick={() => setActiveIndex(idx)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 shadow-xs'
                    : 'bg-white hover:bg-stone-50 border-stone-200/80 shadow-2xs'
                }`}
              >
                <img
                  src={item.activity.cover}
                  alt={item.activity.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] text-stone-500 font-serif truncate">
                      {item.activity.destination}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <h5 className="font-serif font-medium text-xs text-stone-800 truncate">
                    {item.activity.title}
                  </h5>
                  <p className="text-[11px] font-bold text-amber-900 mt-0.5">
                    ¥{item.activity.priceGroup.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interest Tuning Modal (调校研学偏好) */}
      {isTuningOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif font-bold text-lg text-stone-800">
                  调校您的研学偏好与兴趣
                </h3>
              </div>
              <button
                onClick={() => setIsTuningOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              勾选您当下最感兴趣的文化名仕主题，AI 伴游算法将即时调整权重，为您匹配精准文脉线路。
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {CANDIDATE_INTERESTS.map((tag) => {
                const isChecked = tempInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleInterestTag(tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-serif font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-500">
                已选中 {tempInterests.length} 项偏好
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTuningOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-serif text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveTuning}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  保存并智能匹配
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
