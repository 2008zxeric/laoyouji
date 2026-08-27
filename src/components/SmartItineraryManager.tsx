import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import {
  Sparkles,
  Calendar,
  Award,
  Footprints,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Users,
  Compass,
  Zap,
  Printer,
  ChevronRight,
  RefreshCw,
  Clock,
  MapPin,
  Flame,
  Info,
} from 'lucide-react';

interface RecommendedPlanItem {
  activityId: string;
  activity?: Activity;
  recommendedDate: string;
  dateReason: string;
  customHighlight: string;
  estimatedSteps: string;
  expectedPointsEarned: number;
  memberPerkApplied: string;
}

interface MonthlyPlan {
  greeting: string;
  monthlyTheme: string;
  healthAdvice: string;
  pointsStrategy: string;
  recommendedItems: RecommendedPlanItem[];
}

interface SmartItineraryManagerProps {
  onOpenActivity?: (activity: Activity) => void;
  onAskAiAboutPlan?: (prompt: string) => void;
}

export const SmartItineraryManager: React.FC<SmartItineraryManagerProps> = ({
  onOpenActivity,
  onAskAiAboutPlan,
}) => {
  const {
    userProfile,
    currentTier,
    activities,
    openBooking,
    openPoster,
    showToast,
    setSelectedActivity,
  } = useApp();

  // Filter & Generation States
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [intensity, setIntensity] = useState<'relaxed' | 'moderate' | 'active'>('moderate');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    '学者同行',
    '茶道文博',
    '康养山海',
  ]);
  const [preferredGroup, setPreferredGroup] = useState<'premium' | 'group'>('premium');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);

  const availableThemes = [
    { id: '学者同行', label: '🏛️ 学者名师随团' },
    { id: '茶道文博', label: '🍵 茶道雅集文博' },
    { id: '康养山海', label: '🌿 道医温泉康养' },
    { id: '掼蛋智力赛', label: '🏆 乐龄棋牌赛事' },
    { id: '诗意园林', label: '🏞️ 江南园林慢步' },
    { id: '非遗手作', label: '🎨 非遗工坊私享' },
  ];

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId) ? (prev.length > 1 ? prev.filter((t) => t !== themeId) : prev) : [...prev, themeId]
    );
  };

  // Generate Plan Handler
  const generatePlan = async () => {
    setLoading(true);

    try {
      // Prepare filtered activity pool for backend/gemini
      const activityPool = activities.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.subtitle,
        category: a.category,
        destination: a.destination,
        durationDays: a.durationDays,
        priceGroup: a.priceGroup,
        pricePremium: a.pricePremium,
        fitnessDesc: a.fitnessDesc,
        departureRule: a.departureRule,
        departureDates: a.departureDates,
        master: a.master,
      }));

      const res = await fetch('/api/ai-monthly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          intensity,
          themes: selectedThemes,
          groupType: preferredGroup,
          userContext: {
            name: userProfile.name,
            level: currentTier.name,
            points: userProfile.points,
            preferences: '热爱文史、讲究舒适慢节奏、偏好五星适老化与专家导赏',
          },
          availableActivities: activityPool,
        }),
      });

      if (!res.ok) {
        throw new Error('网络请求异常');
      }

      const data = await res.json();
      if (data.plan) {
        // Enforce matched activity references
        const hydratedItems = data.plan.recommendedItems.map((item: any) => {
          const matchedAct = activities.find((a) => a.id === item.activityId) || activities[0];
          return {
            ...item,
            activity: matchedAct,
          };
        });

        setPlan({
          ...data.plan,
          recommendedItems: hydratedItems,
        });
        showToast('个性化文旅研学月度计划已由 AI 智能生成！');
      }
    } catch (err) {
      console.error(err);
      // Client-side intelligent fallback
      const filtered = activities.slice(0, 2);
      const fallbackPlan: MonthlyPlan = {
        greeting: `尊敬的${userProfile.name}，金秋九月，暑气渐退，正是江南园林丹桂飘香与河西大漠星空最澄澈的时节。小老友结合您【${currentTier.name}】的尊享权益与以往文史偏好，特为您研制了本月研学方案。`,
        monthlyTheme: `${selectedMonth.replace('-', '年')}月 · 金秋文脉与适老康养雅集计划`,
        healthAdvice: '秋季早晚温差逐渐增加，建议备一件防风轻便薄外套；各行程均配有随团医护、AED与慢步手杖，每日步数平缓控制在 4,000 步左右。',
        pointsStrategy: `您当前积分为 ${userProfile.points} 分，本月出游可使用【免单房差权益】，且本次研学报名预计可再赚取约 2,800~4,500 点高额积分。`,
        recommendedItems: filtered.map((act) => {
          const matchDate = act.departureDates.find((d) => d.date.startsWith(selectedMonth)) || act.departureDates[0];
          return {
            activityId: act.id,
            activity: act,
            recommendedDate: matchDate?.date || `${selectedMonth}-15`,
            dateReason: act.departureRule?.ruleSummary || '名师全程随团，气候温润适宜慢游',
            customHighlight: `特约为老友安排闭馆专场赏析，入住苏式园林五星酒店，享 ${currentTier.multiplier} 倍积分加成。`,
            estimatedSteps: act.fitnessDesc || '约 3,800 步 (平缓适老步道)',
            expectedPointsEarned: Math.round(act.priceGroup * currentTier.multiplier * 0.1),
            memberPerkApplied: `【${currentTier.name}礼遇】单房差全免 + 专车1对1接驳`,
          };
        }),
      };
      setPlan(fallbackPlan);
      showToast('月度计划已生成！');
    } finally {
      setLoading(false);
    }
  };

  // Initial generation on first mount
  useEffect(() => {
    if (!plan) {
      generatePlan();
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] overflow-y-auto space-y-4 p-3 md:p-5">
      {/* 1. Member Profile & Privilege Header */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#1e2b37] to-[#2C3E50] text-white rounded-3xl p-4 md:p-6 shadow-md border border-[#D4AF37]/30 relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* User Info */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-[#D4AF37] text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full border border-stone-900 shadow-2xs">
                Lv.{userProfile.levelId}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg md:text-xl text-white">
                  {userProfile.name}
                </h2>
                <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{currentTier.name}</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                会员卡号：<span className="font-mono text-amber-200">{userProfile.memberNo}</span> · 现有积分：
                <span className="font-bold text-[#D4AF37] font-serif text-sm"> {userProfile.points}</span> 分
              </p>
            </div>
          </div>

          {/* Active Tier Perks Badges */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>积分加速: <strong>{currentTier.multiplier}x</strong></span>
            </div>
            <span className="text-stone-500">|</span>
            <div className="flex items-center gap-1.5 text-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>单房差: <strong>{currentTier.singleSupplementDiscount}</strong></span>
            </div>
            <span className="text-stone-500">|</span>
            <div className="flex items-center gap-1.5 text-amber-200">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>年度慢游免费名额: <strong>{userProfile.annualFreeQuota - userProfile.freeQuotaUsed}次</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Generation Criteria & Goal Customizer */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2C3E50] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>智能行程管家 · 月度出游偏好定制</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              根据您的积分等级、以往偏好及活动发班日历，AI 将为您智能匹配最佳班期与慢游方案
            </p>
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-4 py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 border border-[#D4AF37]/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'AI 正在研制计划...' : '重新生成月度计划'}</span>
          </button>
        </div>

        {/* Selection Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Target Month */}
          <div className="space-y-1.5">
            <label className="text-stone-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#2C3E50]" />
              <span>出游月份</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-[#2C3E50]"
            >
              <option value="2026-09">2026年9月 (金秋初爽 · 桂花雅集)</option>
              <option value="2026-10">2026年10月 (秋高气爽 · 重阳登高)</option>
              <option value="2026-11">2026年11月 (初冬暖阳 · 温泉慢养)</option>
            </select>
          </div>

          {/* Fitness & Intensity */}
          <div className="space-y-1.5">
            <label className="text-stone-600 font-semibold flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#2C3E50]" />
              <span>步调与体能要求</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              {[
                { id: 'relaxed', label: '极度舒缓' },
                { id: 'moderate', label: '适老慢行' },
                { id: 'active', label: '深度探秘' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setIntensity(lvl.id as any)}
                  className={`py-1.5 rounded-lg text-center font-medium transition-all ${
                    intensity === lvl.id
                      ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group Type Preference */}
          <div className="space-y-1.5">
            <label className="text-stone-600 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#2C3E50]" />
              <span>偏好团型</span>
            </label>
            <div className="grid grid-cols-2 gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setPreferredGroup('premium')}
                className={`py-1.5 rounded-lg text-center font-medium transition-all ${
                  preferredGroup === 'premium'
                    ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                名仕私享小团
              </button>
              <button
                onClick={() => setPreferredGroup('group')}
                className={`py-1.5 rounded-lg text-center font-medium transition-all ${
                  preferredGroup === 'group'
                    ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                经典文化大团
              </button>
            </div>
          </div>

          {/* Points Tier Strategy summary */}
          <div className="space-y-1.5 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#D4AF37]/30 flex flex-col justify-between">
            <div className="text-[11px] text-[#85660d] font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#B8843E]" />
              <span>当前会员尊享策略：</span>
            </div>
            <div className="text-[11px] text-stone-600 leading-snug">
              已自动应用【{currentTier.name}】{currentTier.multiplier}x 积分回馈与免单房差权益
            </div>
          </div>
        </div>

        {/* Themes Multi-Select */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs text-stone-600 font-semibold">
            偏好研学主题（可多选）：
          </label>
          <div className="flex flex-wrap gap-2">
            {availableThemes.map((t) => {
              const isSelected = selectedThemes.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/50 shadow-2xs font-semibold'
                      : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <span>{t.label}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. AI Generated Monthly Plan Output */}
      {loading ? (
        <div className="bg-white rounded-3xl p-10 border border-[#EAE6DF] shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-[#D4AF37]/50 flex items-center justify-center text-[#2C3E50] shadow-sm animate-pulse">
            <Sparkles className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#2C3E50]">
              小老友正在为您智能规划【{selectedMonth}】文旅研学方案...
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              分析发班日历规律 · 测算名仕积分抵扣 · 匹配适老步数节奏
            </p>
          </div>
        </div>
      ) : plan ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Plan Greeting & Strategy Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 rounded-full bg-[#D4AF37]"></span>
                <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
                  {plan.monthlyTheme}
                </h3>
              </div>
              <span className="bg-[#FAF9F6] text-[#85660d] border border-[#D4AF37]/30 text-xs px-3 py-1 rounded-full font-medium">
                AI 专属定制计划书
              </span>
            </div>

            {/* Greeting */}
            <p className="text-xs md:text-sm text-stone-700 leading-relaxed bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF]">
              {plan.greeting}
            </p>

            {/* Health & Points Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/60 space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>当月适老健康与气候指引</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">{plan.healthAdvice}</p>
              </div>

              <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/60 space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-700" />
                  <span>名仕积分与权益攻略</span>
                </div>
                <p className="text-emerald-800/90 leading-relaxed">{plan.pointsStrategy}</p>
              </div>
            </div>
          </div>

          {/* Recommended Activities List Based on Departure Calendar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-serif font-bold text-base text-[#2C3E50] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>精选研学班期推荐（基于发班日历匹配）</span>
              </h4>
              <span className="text-xs text-stone-500">
                共推荐 {plan.recommendedItems.length} 个理想行程
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.recommendedItems.map((item, idx) => {
                const act = item.activity || activities.find((a) => a.id === item.activityId) || activities[0];

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-[#EAE6DF] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Cover & Tags */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                        <img
                          src={act.cover}
                          alt={act.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="bg-[#2C3E50]/90 text-[#D4AF37] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                            {act.category}
                          </span>
                          <span className="bg-stone-900/80 text-stone-100 text-xs px-2 py-0.5 rounded-full">
                            {act.durationDays}天{act.durationNights}晚
                          </span>
                        </div>

                        {/* Destination & Master */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-xs">
                          <span className="font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {act.destination}
                          </span>
                          {act.master && (
                            <span className="bg-[#2C3E50]/80 text-[#D4AF37] px-2 py-0.5 rounded-full text-[11px] border border-[#D4AF37]/30">
                              {act.master.badge}：{act.master.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <h4
                          onClick={() => {
                            if (onOpenActivity) onOpenActivity(act);
                            else setSelectedActivity(act);
                          }}
                          className="font-serif font-bold text-base text-[#2C3E50] hover:text-[#D4AF37] transition-colors cursor-pointer"
                        >
                          {act.title}
                        </h4>

                        {/* Departure Match Info Box */}
                        <div className="bg-[#FAF9F6] rounded-2xl p-3 border border-[#EAE6DF] space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[#85660d] font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#B8843E]" />
                              <span>推荐发班：{item.recommendedDate}</span>
                            </span>
                            <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 font-bold">
                              AI 优选班期
                            </span>
                          </div>

                          <div className="text-stone-600 text-[11px]">
                            <strong>班期理由：</strong>{item.dateReason}
                          </div>

                          <div className="text-stone-600 text-[11px]">
                            <strong>定制亮点：</strong>{item.customHighlight}
                          </div>

                          <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 flex items-center gap-1">
                              <Footprints className="w-3 h-3 text-[#2C3E50]" />
                              <span>{item.estimatedSteps}</span>
                            </span>
                            <span className="text-amber-700 font-bold">
                              预计获赠 +{item.expectedPointsEarned} 积分
                            </span>
                          </div>
                        </div>

                        {/* Member Perk Highlight */}
                        <div className="bg-amber-50 text-amber-900 rounded-xl px-3 py-1.5 text-[11px] font-medium border border-amber-200/60 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{item.memberPerkApplied}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Booking Actions Footer */}
                    <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-stone-500">体验起价</div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs text-[#2C3E50] font-bold">¥</span>
                          <span className="text-xl font-bold font-serif text-[#2C3E50]">
                            {preferredGroup === 'premium' ? act.pricePremium : act.priceGroup}
                          </span>
                          <span className="text-xs text-stone-400">/人</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (onOpenActivity) onOpenActivity(act);
                            else setSelectedActivity(act);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => openBooking('activity', act)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 transition-all active:scale-95 shadow-xs border border-[#D4AF37]/30"
                        >
                          立即预订
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              <span>对当前推荐方案有任何疑问？随时可向 AI 伴游管家提问深挖！</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.print();
                  showToast('已调起打印 / 导出 PDF');
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>导出/打印计划书</span>
              </button>

              {onAskAiAboutPlan && (
                <button
                  onClick={() =>
                    onAskAiAboutPlan(
                      `请根据我【${selectedMonth}】生成的《${plan.monthlyTheme}》，帮我详细规划出游行前准备与每天的适老餐食建议。`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] font-bold flex items-center gap-1.5 transition-all shadow-xs border border-[#D4AF37]/30 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>与 AI 管家就此计划深聊</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
