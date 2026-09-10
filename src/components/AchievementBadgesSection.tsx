import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AchievementBadge } from '../types';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  Compass,
  Scroll,
  PenTool,
  MessageSquareQuote,
  Heart,
  ShieldCheck,
  Crown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Share2,
  X,
  Flame,
  ArrowUpRight,
  Gift,
  Star,
  Trophy,
  MapPin,
} from 'lucide-react';

export const AchievementBadgesSection: React.FC = () => {
  const {
    userProfile,
    orders,
    reviews,
    activities,
    openWriteReview,
    setActiveTab,
    showToast,
    isCareMode,
    setIsHealthModalOpen,
    activityCheckins,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'study' | 'review' | 'honor'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  // 1. Calculate dynamic statistics
  // Study Trips: 1 base historical study trip + active paid/completed activity orders
  const paidActivityOrders = orders.filter(
    (o) => o.bizType === 'activity' && (o.status === 'paid' || o.status === 'completed')
  );
  const studyCount = 1 + paidActivityOrders.length; // e.g. 2 trips

  // User reviews: authored by current user
  const userReviews = reviews.filter((r) => {
    if (!r.author) return false;
    return (
      r.author.includes('赵元博') ||
      r.author === userProfile.name ||
      userProfile.name.includes(r.author.split(' ')[0])
    );
  });
  const reviewCount = Math.max(1, userReviews.length); // At least the seed review or authored reviews
  const reviewLikesTotal = userReviews.reduce((sum, r) => sum + (r.likes || 0), 0);

  // 2. Build badge list with dynamic calculation
  const badges: AchievementBadge[] = [
    // 研学足迹系列
    {
      id: 'badge-study-1',
      category: 'study',
      categoryLabel: '研学修身',
      title: '研学初探者',
      subtitle: '初履胜景·迈出博雅研学第一步',
      description: '首次报名并参与老友记深度文化研学慢游，开启知行相契的文人游学之旅。',
      iconName: 'Compass',
      accentColor: 'amber',
      unlocked: studyCount >= 1,
      unlockedAt: '2026-05-18',
      currentCount: Math.min(studyCount, 1),
      targetCount: 1,
      unit: '次研学',
      rewardPoints: 300,
      privilegeDesc: '点亮专属“博雅初程”名仕徽标，获赠研学随行手册与早鸟优选权。',
      actionText: '查看研学足迹',
      actionType: 'activity',
    },
    {
      id: 'badge-study-3',
      category: 'study',
      categoryLabel: '研学修身',
      title: '博雅行者',
      subtitle: '知行合一·三度探访名山文脉',
      description: '累计参与 3 次深度文化研学，探寻江南园林、丝路古迹等中华文脉精粹。',
      iconName: 'BookOpen',
      accentColor: 'emerald',
      unlocked: studyCount >= 3,
      unlockedAt: studyCount >= 3 ? '2026-09-01' : undefined,
      currentCount: Math.min(studyCount, 3),
      targetCount: 3,
      unit: '次研学',
      rewardPoints: 800,
      privilegeDesc: '享出游单房差 8.8 折特权券，名师私享研学班优先锁定席位。',
      actionText: studyCount >= 3 ? '查看研学特权' : `去探索研学 (还差 ${3 - studyCount} 次)`,
      actionType: 'activity',
    },
    {
      id: 'badge-study-5',
      category: 'study',
      categoryLabel: '研学修身',
      title: '人文大夫',
      subtitle: '踏遍十方·见闻广博学养深厚',
      description: '累计完成 5 次名校名师研学与文化雅集，游学阅历位列前茅，深受同行赞许。',
      iconName: 'Scroll',
      accentColor: 'indigo',
      unlocked: studyCount >= 5,
      currentCount: Math.min(studyCount, 5),
      targetCount: 5,
      unit: '次研学',
      rewardPoints: 1500,
      privilegeDesc: '特聘为“老友记研学文化顾问”，专享年度新品路线内部试游名额。',
      actionText: '浏览高阶研学路线',
      actionType: 'activity',
    },
    {
      id: 'badge-study-10',
      category: 'study',
      categoryLabel: '研学修身',
      title: '游学泰斗',
      subtitle: '大家风骨·十程游学历久弥新',
      description: '完成 10 次跨省或名家同行大课研学，成为社区德高望重的游学领路人。',
      iconName: 'Crown',
      accentColor: 'purple',
      unlocked: studyCount >= 10,
      currentCount: Math.min(studyCount, 10),
      targetCount: 10,
      unit: '次研学',
      rewardPoints: 3000,
      privilegeDesc: '每年享 1 次名仕研学名额全免权益，授予终身尊贵名仕金印标识。',
      actionText: '冲击泰斗荣耀',
      actionType: 'activity',
    },

    // 社区评鉴系列
    {
      id: 'badge-review-1',
      category: 'review',
      categoryLabel: '社区评鉴',
      title: '文墨初鸣',
      subtitle: '妙笔留痕·留下真挚出游体验',
      description: '在社区发表首篇出行评鉴，用生动温情的文字为更多老友提供真实出游参考。',
      iconName: 'PenTool',
      accentColor: 'rose',
      unlocked: reviewCount >= 1,
      unlockedAt: '2026-08-25',
      currentCount: Math.min(reviewCount, 1),
      targetCount: 1,
      unit: '篇评鉴',
      rewardPoints: 200,
      privilegeDesc: '社区昵称佩戴金色“初鸣评鉴”微章，后续点评积分收益提升 10%。',
      actionText: '查看我的评鉴',
      actionType: 'community',
    },
    {
      id: 'badge-review-3',
      category: 'review',
      categoryLabel: '社区评鉴',
      title: '金牌评鉴官',
      subtitle: '行家里手·累计贡献 3 篇深度评价',
      description: '累计发表 3 篇翔实图文评价，涵盖食宿适老度、步履舒适度与名师授课心得。',
      iconName: 'MessageSquareQuote',
      accentColor: 'amber',
      unlocked: reviewCount >= 3,
      unlockedAt: reviewCount >= 3 ? '2026-09-02' : undefined,
      currentCount: Math.min(reviewCount, 3),
      targetCount: 3,
      unit: '篇评鉴',
      rewardPoints: 600,
      privilegeDesc: '评鉴文章优先入选官方《老友慢游指南》刊物，每次评鉴返双倍名仕积分。',
      actionText: reviewCount >= 3 ? '查看我的精华评鉴' : `去发表评鉴 (还差 ${3 - reviewCount} 篇)`,
      actionType: 'review',
    },
    {
      id: 'badge-likes-50',
      category: 'review',
      categoryLabel: '社区评鉴',
      title: '众望所归',
      subtitle: '高山流水·获老友热烈点赞 50 次',
      description: '撰写的活动感悟与摄影作品获得老友圈超 50 次真诚点赞与共鸣转述。',
      iconName: 'Heart',
      accentColor: 'rose',
      unlocked: reviewLikesTotal >= 50,
      currentCount: Math.min(reviewLikesTotal, 50),
      targetCount: 50,
      unit: '次点赞',
      rewardPoints: 500,
      privilegeDesc: '入选老友社区“风雅达人榜”，享社群名录置顶推荐与定制文创折扇。',
      actionText: '去社区看看老友互动',
      actionType: 'community',
    },

    // 专享荣誉系列
    {
      id: 'badge-honor-health',
      category: 'honor',
      categoryLabel: '专享荣誉',
      title: '严谨周至',
      subtitle: '防患未然·完善乐龄健康档案',
      description: '主动申报健康档案与步态偏好，秉持对同行老友与家人高度负责的名仕风范。',
      iconName: 'ShieldCheck',
      accentColor: 'emerald',
      unlocked: !!userProfile.healthProfile?.isDeclared,
      unlockedAt: userProfile.healthProfile?.lastUpdated || '2026-08-20',
      currentCount: userProfile.healthProfile?.isDeclared ? 1 : 0,
      targetCount: 1,
      unit: '项申报',
      rewardPoints: 300,
      privilegeDesc: '随团三甲医师 1v1 健康保障建档，出游强度智能适配预警守护。',
      actionText: '查看健康档案',
      actionType: 'invite',
    },
    {
      id: 'badge-honor-checkin',
      category: 'honor',
      categoryLabel: '专享荣誉',
      title: '印迹金章',
      subtitle: '知行实履·完成线下研学定点签到打卡',
      description: '在参与文旅研学活动中，亲临历史遗迹与名师讲学现场，完成 GPS 定点签到并盖上研学纪念印章。',
      iconName: 'MapPin',
      accentColor: 'amber',
      unlocked: activityCheckins.length >= 1,
      unlockedAt: activityCheckins[0]?.timestamp ? activityCheckins[0].timestamp.split(' ')[0] : '2026-09-08',
      currentCount: Math.min(activityCheckins.length, 3),
      targetCount: 3,
      unit: '个地标打卡',
      rewardPoints: 500,
      privilegeDesc: '点亮“文脉定点探访者”勋章，线下打卡时享 TGO 领队专属拍照打卡加权服务。',
      actionText: '去活动详情打卡',
      actionType: 'activity',
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const renderBadgeIcon = (iconName: string, unlocked: boolean, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Scroll':
        return <Scroll className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'PenTool':
        return <PenTool className={className} />;
      case 'MessageSquareQuote':
        return <MessageSquareQuote className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const handleAction = (badge: AchievementBadge) => {
    if (badge.actionType === 'activity') {
      setActiveTab('activities');
      setSelectedBadge(null);
      showToast('已为您导航至最新研学活动列表');
    } else if (badge.actionType === 'review') {
      setSelectedBadge(null);
      if (activities && activities.length > 0) {
        openWriteReview(activities[0]);
      } else {
        setActiveTab('community');
      }
    } else if (badge.actionType === 'community') {
      setActiveTab('community');
      setSelectedBadge(null);
      showToast('已为您切换至老友社区圈');
    } else if (badge.actionType === 'invite') {
      setSelectedBadge(null);
      setIsHealthModalOpen(true);
    }
  };

  const handleShareBadge = (badge: AchievementBadge) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#2C3E50', '#FAF9F6', '#E4E0D9'],
    });
    showToast(`荣誉成就「${badge.title}」已复制分享！`);
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2C3E50] to-[#1a252f] text-amber-300 border border-[#D4AF37]/40 flex items-center justify-center shadow-xs">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-[#2C3E50] text-base">
                名仕成就勋章
              </h3>
              <span className="bg-[#D4AF37]/15 text-[#85660d] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                已点亮 {unlockedCount} / {badges.length} 枚
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              记录您的研学求知足迹与社区交流奉献，激励老友同行
            </p>
          </div>
        </div>

        {/* Quick Review / Activity Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activities && activities.length > 0) {
                openWriteReview(activities[0]);
              } else {
                setActiveTab('community');
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E50] bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-700" />
            <span>写出行点评 (+100分)</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Overview Bento */}
      <div className="bg-gradient-to-br from-[#FAF9F6] via-amber-50/30 to-[#FAF9F6] rounded-2xl p-3.5 border border-[#EAE6DF] grid grid-cols-3 gap-2 text-center text-xs">
        <div className="space-y-1">
          <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>研学出游</span>
          </div>
          <div className="font-serif font-bold text-[#2C3E50] text-base">
            {studyCount} <span className="text-xs font-normal text-stone-500">次</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">已解锁初探徽章</div>
        </div>

        <div className="space-y-1 border-x border-stone-200/80">
          <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
            <MessageSquareQuote className="w-3.5 h-3.5 text-rose-600" />
            <span>活动评鉴</span>
          </div>
          <div className="font-serif font-bold text-[#2C3E50] text-base">
            {reviewCount} <span className="text-xs font-normal text-stone-500">篇</span>
          </div>
          <div className="text-[10px] text-amber-800 font-medium">
            距下级勋章还差 {Math.max(0, 3 - reviewCount)} 篇
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-600" />
            <span>老友点赞</span>
          </div>
          <div className="font-serif font-bold text-[#2C3E50] text-base">
            {reviewLikesTotal} <span className="text-xs font-normal text-stone-500">次</span>
          </div>
          <div className="text-[10px] text-stone-500 font-medium">共鸣度极高</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs font-medium text-stone-600">
        {[
          { id: 'all', label: `全部勋章 (${badges.length})` },
          { id: 'study', label: '研学足迹 (4)' },
          { id: 'review', label: '社区评鉴 (3)' },
          { id: 'honor', label: '专享荣誉 (1)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-[#2C3E50] text-amber-200 font-bold shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filteredBadges.map((badge) => {
          const isComplete = badge.unlocked;
          const progressPercent = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isComplete
                  ? 'bg-gradient-to-b from-[#FAF9F6] to-amber-50/40 border-[#D4AF37]/50 shadow-2xs hover:shadow-xs hover:border-[#D4AF37]'
                  : 'bg-stone-50/70 border-stone-200/80 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Top Tag */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    isComplete
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {badge.categoryLabel}
                </span>

                {isComplete ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-700 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>已点亮</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] text-stone-400">
                    <Lock className="w-3 h-3" />
                    <span>待解锁</span>
                  </span>
                )}
              </div>

              {/* Central Emblem Token */}
              <div className="my-3 flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center relative transition-transform group-hover:scale-105 shadow-2xs ${
                    isComplete
                      ? 'bg-gradient-to-br from-[#2C3E50] via-[#3d536b] to-[#1f2d3a] text-[#D4AF37] border-2 border-[#D4AF37]'
                      : 'bg-stone-200 text-stone-400 border border-stone-300'
                  }`}
                >
                  {renderBadgeIcon(badge.iconName, isComplete, 'w-7 h-7')}
                  {isComplete && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                      ✓
                    </div>
                  )}
                </div>

                <h4 className="font-serif font-bold text-xs md:text-sm text-[#2C3E50] mt-2.5">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                  {badge.subtitle.split('·')[0]}
                </p>
              </div>

              {/* Bottom Progress or Accomplished Info */}
              <div className="pt-2 border-t border-stone-200/60 text-[11px]">
                {isComplete ? (
                  <div className="flex items-center justify-between text-stone-500 text-[10px]">
                    <span className="text-amber-700 font-medium">奖励 +{badge.rewardPoints}分</span>
                    <span className="text-stone-400">{badge.unlockedAt ? '已获勋' : '已达成'}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>进度</span>
                      <span className="font-medium text-stone-700">
                        {badge.currentCount}/{badge.targetCount} {badge.unit}
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Banner / Action Footer */}
      <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-stone-600">
            每参与 1 次研学或发表 1 篇真实评鉴，均可累积勋章成就并领取名仕积分奖励。
          </span>
        </div>

        <button
          onClick={() => setActiveTab('activities')}
          className="text-stone-800 hover:text-stone-950 font-bold flex items-center gap-1 text-xs shrink-0 self-end sm:self-auto cursor-pointer"
        >
          <span>探索近期精选研学</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        </button>
      </div>

      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-70 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-[#D4AF37]/40 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Emblem Showcase */}
            <div className="flex flex-col items-center text-center pt-2">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center relative shadow-md ${
                  selectedBadge.unlocked
                    ? 'bg-gradient-to-br from-[#2C3E50] via-[#384e66] to-[#1a252f] text-[#D4AF37] border-2 border-[#D4AF37]'
                    : 'bg-stone-200 text-stone-400 border border-stone-300'
                }`}
              >
                {renderBadgeIcon(selectedBadge.iconName, selectedBadge.unlocked, 'w-10 h-10')}
                {selectedBadge.unlocked && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black shadow-sm">
                    ✓
                  </div>
                )}
              </div>

              <div className="mt-3.5 space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {selectedBadge.categoryLabel}
                </span>
                <h3 className="font-serif font-bold text-lg md:text-xl text-[#2C3E50]">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-stone-500">{selectedBadge.subtitle}</p>
              </div>
            </div>

            {/* Progress or Achievement Tag */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">当前达成状态</span>
                {selectedBadge.unlocked ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已圆满解锁</span>
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold">
                    进行中 ({selectedBadge.currentCount} / {selectedBadge.targetCount} {selectedBadge.unit})
                  </span>
                )}
              </div>

              {!selectedBadge.unlocked && (
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedBadge.currentCount / selectedBadge.targetCount) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              )}

              <p className="text-stone-600 text-xs leading-relaxed pt-1">
                {selectedBadge.description}
              </p>
            </div>

            {/* Privileges & Rewards Box */}
            <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-700" />
                  <span>解锁名仕专属权益</span>
                </div>
                <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  +{selectedBadge.rewardPoints} 积分
                </span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                {selectedBadge.privilegeDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              {selectedBadge.unlocked ? (
                <button
                  onClick={() => handleShareBadge(selectedBadge)}
                  className="flex-1 py-3 rounded-2xl bg-[#2C3E50] text-amber-100 font-bold text-xs shadow-xs border border-[#D4AF37]/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <Share2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>分享荣誉勋章</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAction(selectedBadge)}
                  className="flex-1 py-3 rounded-2xl bg-[#2C3E50] text-amber-100 font-bold text-xs shadow-xs border border-[#D4AF37]/40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <span>{selectedBadge.actionText || '立即前往参与'}</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
