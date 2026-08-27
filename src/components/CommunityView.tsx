import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ARTICLES, MOCK_PAST_EVENTS, MOCK_SENIOR_TALENTS } from '../data/mockData';
import { ArticleItem, WishItem, MerchantApplication, SeniorTalentUser } from '../types';
import {
  Users,
  Heart,
  MessageSquare,
  Sparkles,
  Plus,
  ThumbsUp,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
  Share2,
  Building2,
  Handshake,
  Award,
  Send,
  Star,
  ShieldCheck,
  Compass,
  Trophy,
  Crown,
  Medal,
  HelpCircle,
  TrendingUp,
  Coins,
  ChevronRight,
  Gift,
  Flame,
  BookOpen,
  Info,
  Check,
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const {
    wishes,
    voteWish,
    addWish,
    reviews,
    addMerchantApplication,
    merchants,
    showToast,
    setIsPointsGuideOpen,
    userProfile,
    currentTier,
    isCareMode,
  } = useApp();

  const [communityTab, setCommunityTab] = useState<'leaderboard' | 'stories' | 'wishes' | 'past' | 'merchants'>('leaderboard');
  const [articles, setArticles] = useState<ArticleItem[]>(MOCK_ARTICLES);
  const [talents, setTalents] = useState<SeniorTalentUser[]>(MOCK_SENIOR_TALENTS);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'annual' | 'monthly' | 'badges'>('annual');
  const [isPointsExplanationOpen, setIsPointsExplanationOpen] = useState(false);

  // New Wish Modal State
  const [isNewWishOpen, setIsNewWishOpen] = useState(false);
  const [wishDestination, setWishDestination] = useState('');
  const [wishTitle, setWishTitle] = useState('');
  const [wishContent, setWishContent] = useState('');
  const [wishDays, setWishDays] = useState(5);

  // Merchant Application Form State
  const [merchantName, setMerchantName] = useState('');
  const [merchantType, setMerchantType] = useState<MerchantApplication['merchantType']>('康养基地/度假村');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [proposedActivityType, setProposedActivityType] = useState('');
  const [advantage, setAdvantage] = useState('');
  const [isMerchantSubmitted, setIsMerchantSubmitted] = useState(false);

  const toggleArticleLike = (artId: string) => {
    setArticles((prev) =>
      prev.map((st) => {
        if (st.id === artId) {
          const likes = st.likes + 1;
          return { ...st, likes };
        }
        return st;
      })
    );
    showToast('感谢您的点赞与共鸣！');
  };

  const toggleTalentLike = (talentId: string) => {
    setTalents((prev) =>
      prev.map((t) => {
        if (t.id === talentId) {
          const isLiked = !t.isLiked;
          const likesCount = isLiked ? t.likesCount + 1 : t.likesCount - 1;
          return { ...t, isLiked, likesCount };
        }
        return t;
      })
    );
    showToast('🌸 已向乐龄达人送上鲜花与祝贺！');
  };

  const handleCreateWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishDestination.trim() || !wishTitle.trim() || !wishContent.trim()) {
      showToast('请完整填写目的地与心愿理由');
      return;
    }

    addWish({
      destination: wishDestination.trim(),
      title: wishTitle.trim(),
      content: wishContent.trim(),
      suggestedDays: wishDays,
      author: userProfile.name || '赵元博 教授 (原复旦中文系)',
      avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      memberLevel: '博雅·知音',
    });

    setWishDestination('');
    setWishTitle('');
    setWishContent('');
    setIsNewWishOpen(false);
  };

  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim() || !contactPerson.trim() || !phone.trim() || !serviceDescription.trim()) {
      showToast('请完整填写商户名称、联系人、电话及服务介绍');
      return;
    }

    addMerchantApplication({
      merchantName: merchantName.trim(),
      merchantType,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      city: city.trim() || '全国/待定',
      serviceDescription: serviceDescription.trim(),
      proposedActivityType: proposedActivityType.trim() || '适老特色文旅活动',
      advantage: advantage.trim() || '具备适老无障碍配套与健康医护保障',
    });

    setIsMerchantSubmitted(true);
    setMerchantName('');
    setContactPerson('');
    setPhone('');
    setCity('');
    setServiceDescription('');
    setProposedActivityType('');
    setAdvantage('');
  };

  // Sort talents according to filter
  const sortedTalents = [...talents].sort((a, b) => {
    if (leaderboardFilter === 'monthly') {
      return (b.monthlyPoints || 0) - (a.monthlyPoints || 0);
    }
    return b.points - a.points;
  });

  const top1 = sortedTalents[0];
  const top2 = sortedTalents[1];
  const top3 = sortedTalents[2];
  const restTalents = sortedTalents.slice(3, 10);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Community Hero Header */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#34495e] to-[#1a252f] rounded-3xl p-5 text-white shadow-xs space-y-2 border border-[#D4AF37]/30">
        <div className="flex items-center justify-between">
          <span className="bg-[#D4AF37] text-stone-950 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Users className="w-3.5 h-3.5" />
            乐龄活动与文旅社区
          </span>
          <button
            onClick={() => setIsPointsExplanationOpen(true)}
            className="text-xs text-amber-200 hover:text-amber-100 flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full border border-amber-300/30 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>积分获取方式说明</span>
          </button>
        </div>
        <h2 className="font-serif italic font-semibold text-lg md:text-xl text-[#FAF9F6]">
          青山不老 · 老友常欢 · 智汇长青
        </h2>
        <p className="text-xs text-stone-300 leading-relaxed">
          在这里，查阅「乐龄达人」积分风云榜、品读名师慢游所见所思、回顾往期长者真实口碑、发起心愿目的地；亦热诚欢迎优质适老基地与机构合作共建！
        </p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-white rounded-2xl p-1 border border-[#EAE6DF] shadow-2xs flex text-xs md:text-sm font-semibold overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setCommunityTab('leaderboard')}
          className={`flex-1 py-2.5 px-3 rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            communityTab === 'leaderboard'
              ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#D4AF37]" />
          <span>乐龄达人榜</span>
        </button>
        <button
          onClick={() => setCommunityTab('stories')}
          className={`flex-1 py-2.5 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            communityTab === 'stories'
              ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📖 老友游记 ({articles.length})
        </button>
        <button
          onClick={() => setCommunityTab('wishes')}
          className={`flex-1 py-2.5 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            communityTab === 'wishes'
              ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          ✨ 心愿申请 ({wishes.length})
        </button>
        <button
          onClick={() => setCommunityTab('past')}
          className={`flex-1 py-2.5 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            communityTab === 'past'
              ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          📸 往期回顾与点评
        </button>
        <button
          onClick={() => setCommunityTab('merchants')}
          className={`flex-1 py-2.5 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            communityTab === 'merchants'
              ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          🤝 基地与商户合作
        </button>
      </div>

      {/* TAB 0: LEADERBOARD (乐龄达人积分排行榜) */}
      {communityTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Leaderboard Top Card */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#F5EFE6] rounded-3xl p-5 border border-[#D4AF37]/40 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-200/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
                    <Trophy className="w-4 h-4 text-amber-950" />
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50]">
                    乐龄达人 · 社区积分排行榜
                  </h3>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  汇聚社区积分排名前十的银发活跃楷模 · 见证老有所乐与知己同行
                </p>
              </div>

              {/* Explanations & Rules Trigger */}
              <button
                onClick={() => setIsPointsExplanationOpen(true)}
                className="self-start sm:self-auto bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 border border-[#D4AF37]/40 transition-transform active:scale-95 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>积分获取方式说明</span>
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between pt-3 text-xs">
              <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setLeaderboardFilter('annual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leaderboardFilter === 'annual'
                      ? 'bg-white text-[#2C3E50] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🏆 年度总积分榜 (Top 10)
                </button>
                <button
                  onClick={() => setLeaderboardFilter('monthly')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leaderboardFilter === 'monthly'
                      ? 'bg-white text-[#2C3E50] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ⚡ 本月新锐榜
                </button>
              </div>

              <span className="text-[11px] text-stone-500 hidden sm:inline">
                每日 24:00 系统自动更新核算
              </span>
            </div>
          </div>

          {/* Top 3 Podium (前三甲领奖台) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2 pb-2">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="bg-gradient-to-t from-slate-100 via-white to-slate-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-slate-300 shadow-xs flex flex-col items-center text-center relative group">
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-extrabold flex items-center justify-center text-xs shadow-sm border-2 border-white">
                  2
                </div>
                <div className="relative mt-2">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-300 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-slate-300">
                    🥈 榜眼
                  </span>
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50] mt-2 line-clamp-1">
                  {top2.name}
                </div>
                <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                  {top2.title.split('·')[0]}
                </div>
                <div className="mt-1.5 bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {top2.tierName}
                </div>
                <div className="text-amber-800 font-extrabold text-xs sm:text-sm mt-1.5 font-mono">
                  {(leaderboardFilter === 'monthly' ? top2.monthlyPoints : top2.points)?.toLocaleString()} <span className="text-[10px] font-normal text-stone-500">分</span>
                </div>
                <button
                  onClick={() => toggleTalentLike(top2.id)}
                  className={`mt-2 w-full py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    top2.isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${top2.isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <span>{top2.likesCount}</span>
                </button>
              </div>
            )}

            {/* Rank 1 (Gold - Elevated) */}
            {top1 && (
              <div className="bg-gradient-to-t from-amber-100/90 via-amber-50/70 to-yellow-50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border-2 border-amber-400 shadow-md flex flex-col items-center text-center relative -translate-y-2 group">
                <div className="absolute -top-4 w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-amber-950 font-black flex items-center justify-center text-sm shadow-md border-2 border-white">
                  <Crown className="w-5 h-5 text-amber-950 fill-amber-950" />
                </div>
                <div className="relative mt-2">
                  <img
                    src={top1.avatar}
                    alt={top1.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-amber-400 shadow-md ring-4 ring-amber-300/30"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 shadow-xs">
                    👑 状元榜首
                  </span>
                </div>
                <div className="font-serif font-bold text-sm sm:text-base text-[#2C3E50] mt-2.5 line-clamp-1">
                  {top1.name}
                </div>
                <div className="text-[10px] text-amber-900 font-medium line-clamp-1 mt-0.5">
                  {top1.title.split('·')[0]}
                </div>
                <div className="mt-1.5 bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                  {top1.tierName} · 至尊荣衔
                </div>
                <div className="text-amber-950 font-black text-sm sm:text-base mt-1.5 font-mono">
                  {(leaderboardFilter === 'monthly' ? top1.monthlyPoints : top1.points)?.toLocaleString()} <span className="text-[11px] font-bold text-amber-800">积分</span>
                </div>
                <button
                  onClick={() => toggleTalentLike(top1.id)}
                  className={`mt-2 w-full py-1.5 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs ${
                    top1.isLiked
                      ? 'bg-rose-500 text-white'
                      : 'bg-gradient-to-r from-[#2C3E50] to-[#1a252f] text-amber-100 border border-amber-400/40'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${top1.isLiked ? 'fill-white text-white' : 'text-amber-300 fill-amber-300'}`} />
                  <span>送花祝贺 ({top1.likesCount})</span>
                </button>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="bg-gradient-to-t from-amber-50/60 via-white to-orange-50/40 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-amber-600/40 shadow-xs flex flex-col items-center text-center relative group">
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-extrabold flex items-center justify-center text-xs shadow-sm border-2 border-white">
                  3
                </div>
                <div className="relative mt-2">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-600/40 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                    🥉 探花
                  </span>
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50] mt-2 line-clamp-1">
                  {top3.name}
                </div>
                <div className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                  {top3.title.split('·')[0]}
                </div>
                <div className="mt-1.5 bg-amber-50 text-amber-900 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {top3.tierName}
                </div>
                <div className="text-amber-800 font-extrabold text-xs sm:text-sm mt-1.5 font-mono">
                  {(leaderboardFilter === 'monthly' ? top3.monthlyPoints : top3.points)?.toLocaleString()} <span className="text-[10px] font-normal text-stone-500">分</span>
                </div>
                <button
                  onClick={() => toggleTalentLike(top3.id)}
                  className={`mt-2 w-full py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    top3.isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${top3.isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <span>{top3.likesCount}</span>
                </button>
              </div>
            )}
          </div>

          {/* Rest of Top 10 List (Rank 4 - 10) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50] flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-600" />
                <span>乐龄榜样 (第 4 - 10 名)</span>
              </h4>
              <span className="text-[11px] text-stone-500">
                出游 · 游记 · 点评多维积分
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {restTalents.map((t, idx) => {
                const currentRank = idx + 4;
                return (
                  <div
                    key={t.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] p-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Rank Number Badge */}
                      <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-stone-200">
                        {currentRank}
                      </div>

                      {/* Avatar */}
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                      />

                      {/* Info */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#2C3E50]">
                            {t.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.2 rounded-full"
                            style={{
                              color: t.tierColor,
                              backgroundColor: `${t.tierColor}15`,
                              border: `1px solid ${t.tierColor}30`,
                            }}
                          >
                            {t.tierName}
                          </span>
                          <span className="text-[10px] text-stone-400 hidden sm:inline">
                            📍 {t.city}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-600 line-clamp-1">
                          {t.title}
                        </p>

                        {/* Badges & Stats */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {t.badges.slice(0, 3).map((b) => (
                            <span
                              key={b}
                              className="text-[9px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-medium"
                            >
                              ★ {b}
                            </span>
                          ))}
                          <span className="text-[10px] text-stone-400">
                            · 出游{t.totalTrips}次 · 游记{t.totalArticles}篇
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Points & Like Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-10 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <div className="font-mono font-extrabold text-sm sm:text-base text-amber-900">
                          {(leaderboardFilter === 'monthly' ? t.monthlyPoints : t.points)?.toLocaleString()} <span className="text-[10px] font-normal text-stone-500">分</span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          获赞 {t.likesCount} 次
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTalentLike(t.id)}
                        className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                          t.isLiked
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                        title="送上鲜花祝贺"
                      >
                        <Heart className={`w-3.5 h-3.5 ${t.isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                        <span className="hidden sm:inline">{t.isLiked ? '已献花' : '献花祝贺'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current User Ranking Status Footer Card */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] rounded-2xl p-4 text-white shadow-xs border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-amber-100">
                    {userProfile.name} (您)
                  </span>
                  <span className="bg-[#D4AF37] text-stone-950 text-[10px] font-bold px-2 py-0.2 rounded-full">
                    {currentTier.name} (x{currentTier.multiplier}倍)
                  </span>
                </div>
                <div className="text-xs text-stone-300 mt-0.5 flex items-center gap-2">
                  <span>当前社区排名：<strong>第 12 名</strong></span>
                  <span>·</span>
                  <span>总积分：<strong className="text-amber-300">{userProfile.points.toLocaleString()}</strong> 分</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPointsExplanationOpen(true)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold border border-amber-300/30 transition-colors cursor-pointer text-center"
              >
                如何攒积分？
              </button>
              <button
                onClick={() => {
                  setIsPointsGuideOpen(true);
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2e] text-stone-950 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer text-center"
              >
                去出游出赛攒积分
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: STORIES */}
      {communityTab === 'stories' && (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-3"
            >
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={art.avatar}
                    alt={art.author}
                    className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs md:text-sm text-[#2C3E50]">
                        {art.author}
                      </span>
                      <span className="bg-[#D4AF37]/15 text-[#85660d] text-[10px] px-1.5 py-0.2 rounded font-medium border border-[#D4AF37]/30">
                        {art.authorTitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                      <span>{art.date}</span>
                      <span>·</span>
                      <span className="text-[#2C3E50] font-medium">阅读 {art.readCount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => showToast('已生成老友游记卡片！')}
                  className="w-8 h-8 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-600 flex items-center justify-center border border-stone-200 cursor-pointer"
                  title="分享游记"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Cover & Content */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-sm md:text-base text-[#2C3E50]">
                  {art.title}
                </h3>
                {art.cover && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={art.cover}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-xs md:text-sm text-stone-700 leading-relaxed space-y-1.5">
                  {art.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Tags & Likes */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex gap-1.5">
                  {art.tags.map((t) => (
                    <span key={t} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleArticleLike(art.id)}
                    className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{art.likes}</span>
                  </button>

                  <button
                    onClick={() => showToast('已打开知青老友书话交流区')}
                    className="flex items-center gap-1 hover:text-[#2C3E50] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>研讨交流</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: WISHES WALL */}
      {communityTab === 'wishes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#F8F9FA] rounded-2xl p-4 border border-[#EAE6DF]">
            <div>
              <div className="font-serif font-bold text-[#2C3E50] text-sm">
                老友心愿目的地征集墙
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                心愿只要获得 <strong>50 位老友投票</strong>，我们将安排名师专家实地考察并发团！
              </div>
            </div>

            <button
              onClick={() => setIsNewWishOpen(true)}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1 border border-[#D4AF37]/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>发起心愿</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishes.map((wish) => {
              const progress = Math.min(100, Math.round((wish.likes / wish.votesRequired) * 100));

              return (
                <div
                  key={wish.id}
                  className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={wish.avatar}
                          alt={wish.author}
                          className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
                        />
                        <div>
                          <div className="font-bold text-xs text-[#2C3E50]">
                            {wish.author}
                          </div>
                          <div className="text-[10px] text-stone-400">{wish.memberLevel}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          wish.status === 'in_preparation' || wish.status === 'approved'
                            ? 'bg-[#D4AF37]/20 text-[#85660d] border border-[#D4AF37]/40'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {wish.status === 'in_preparation' || wish.status === 'approved'
                          ? '🎉 已达标立项中'
                          : '🔥 正在征集中'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-xs md:text-sm text-[#2C3E50]">
                        {wish.title}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{wish.content}</p>
                      <div className="text-[11px] text-stone-400 mt-1.5 flex items-center gap-2">
                        <span className="text-[#2C3E50] font-medium">📍 {wish.destination}</span>
                        <span>·</span>
                        <span>建议行程：{wish.suggestedDays} 天</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Voting Button */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>已获老友投票 ({wish.likes} / {wish.votesRequired} 票)</span>
                      <span className="font-bold text-[#2C3E50]">{progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2C3E50] to-[#D4AF37] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <button
                      onClick={() => voteWish(wish.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        wish.isLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 shadow-2xs border border-[#D4AF37]/30'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${wish.isLiked ? 'fill-rose-600' : 'text-[#D4AF37]'}`} />
                      <span>{wish.isLiked ? '已投票支持 (再次点击撤销)' : '支持这个目的地 (+1票)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAST TRIPS & REVIEWS */}
      {communityTab === 'past' && (
        <div className="space-y-4">
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm md:text-base text-[#2C3E50]">往期活动与赛事真实回顾</h3>
              <p className="text-xs text-stone-500 mt-0.5">历届学员老友真实点评，见证每一步慢游成长</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#85660d] font-bold">综合满意度 99.8%</div>
              <div className="flex text-amber-500 text-xs mt-0.5">★★★★★</div>
            </div>
          </div>

          {MOCK_PAST_EVENTS.map((pe) => (
            <div
              key={pe.id}
              className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div>
                  <h3 className="font-serif font-bold text-[#2C3E50] text-sm md:text-base">
                    {pe.title}
                  </h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {pe.date} · {pe.location} · {pe.participantsCount}位老友同行
                  </div>
                </div>
                <span className="bg-[#D4AF37]/15 text-[#85660d] text-xs font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                  满分好评
                </span>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-3 gap-2">
                {pe.photos.map((ph, idx) => (
                  <img
                    key={idx}
                    src={ph}
                    alt="past event"
                    className="w-full aspect-[4/3] rounded-xl object-cover"
                  />
                ))}
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {pe.highlights.map((h, idx) => (
                  <span
                    key={idx}
                    className="bg-stone-50 text-stone-700 border border-stone-200 text-[11px] px-2 py-0.5 rounded-full"
                  >
                    ★ {h}
                  </span>
                ))}
              </div>

              {/* Participant quotes */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="text-xs font-bold text-[#2C3E50] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>随团老友真挚点评：</span>
                </div>
                {pe.participantQuotes.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8F9FA] rounded-xl p-2.5 text-xs text-stone-700 border border-[#EAE6DF] flex items-center space-x-2.5"
                  >
                    <img
                      src={q.avatar}
                      alt={q.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#D4AF37] shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C3E50]">{q.name}</span>
                        <span className="text-[10px] text-amber-500 font-bold">★★★★★ 推荐</span>
                      </div>
                      <p className="italic text-stone-600 mt-0.5">{q.quote}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* User Reviews List from Context */}
          {reviews && reviews.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#2C3E50] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>社区最新点评</span>
              </h4>
              <div className="space-y-2.5">
                {reviews.slice(0, 5).map((rev) => (
                  <div key={rev.id} className="border-b border-stone-100 last:border-0 pb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2C3E50]">{rev.userName}</span>
                      <span className="text-stone-400 text-[10px]">{rev.date}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{rev.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MERCHANT COOPERATION PORTAL */}
      {communityTab === 'merchants' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#2C3E50] to-[#1a252f] rounded-2xl p-5 text-white shadow-xs border border-[#D4AF37]/40 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="font-serif italic font-bold text-base md:text-lg text-amber-100">
                乐龄生态 · 商家与基地合作共建平台
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              四季游致力于打造高品质、有尊严的乐龄银发活力乐园。我们热诚欢迎优质温泉康养基地、文化研学书院、非遗工坊、适老文旅车队及文体协会入驻，提供专业服务或联合发起定制活动！
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-[#D4AF37] font-bold">精准触达</div>
                <div className="text-[10px] text-stone-300 mt-0.5">8000+ 高净值老友</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-[#D4AF37] font-bold">品质认证</div>
                <div className="text-[10px] text-stone-300 mt-0.5">四季游官方适老标杆</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="text-[#D4AF37] font-bold">闭环协同</div>
                <div className="text-[10px] text-stone-300 mt-0.5">专属 TGO 全流程协同</div>
              </div>
            </div>
          </div>

          {/* Form / Submitted Success View */}
          {isMerchantSubmitted ? (
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#2C3E50]">合作申请已提交！</h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                感谢您对乐龄银发事业的支持。我们的商务生态团队将在 1-2 个工作日内与您取得联系并进行服务基地勘评。
              </p>
              <button
                onClick={() => setIsMerchantSubmitted(false)}
                className="px-5 py-2 rounded-xl bg-[#2C3E50] text-amber-100 text-xs font-bold cursor-pointer"
              >
                再提交一条新申请
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-2">
                <h4 className="font-serif font-bold text-sm md:text-base text-[#2C3E50] flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[#D4AF37]" />
                  <span>提交商家服务或发起活动需求申请</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">请填写合作机构信息与拟合作方案，我们将尽快评估对接</p>
              </div>

              <form onSubmit={handleMerchantSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      机构/商户名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="如：黄山汤口悦榕温泉度假村 / 景德镇柴窑非遗工坊"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">机构类型</label>
                    <select
                      value={merchantType}
                      onChange={(e) => setMerchantType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] bg-white"
                    >
                      <option value="康养基地/度假村">康养基地 / 温泉度假村</option>
                      <option value="文化研学/非遗工坊">文化研学机构 / 非遗传承工坊</option>
                      <option value="适老交通/车队服务">适老头等舱车队 / 接送保障</option>
                      <option value="医疗健康/康复中心">医疗健康 / 随团医护与康复机构</option>
                      <option value="老年协会/文体俱乐部">老年协会 / 棋牌摄影文体俱乐部</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      联系人姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="如：陈总监"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      联系手机 / 微信 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="如：138-0000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">所在城市 / 区域</label>
                    <input
                      type="text"
                      placeholder="如：安徽黄山 / 浙江杭州"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    提供服务内容 / 设施介绍 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="介绍您的场地设施、房型、餐饮特色或适老无障碍配套..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">拟发起/承办活动类型</label>
                    <input
                      type="text"
                      placeholder="如：掼蛋养生友谊赛、茶道品鉴营、摄影创作周"
                      value={proposedActivityType}
                      onChange={(e) => setProposedActivityType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">适老优势与配套保障</label>
                    <input
                      type="text"
                      placeholder="如：全平坦无障碍电梯、24小时医务室、低油少盐膳食"
                      value={advantage}
                      onChange={(e) => setAdvantage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#D4AF37]/30 text-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>提交合作申请 · 共建乐龄平台</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Partner Showcase */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2C3E50] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>已入驻认证合作商家/基地 ({merchants.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {merchants.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C3E50]">{m.merchantName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      m.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status === 'approved' ? '✓ 官方认证合作' : '审核中'}
                    </span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {m.merchantType} · {m.city}
                  </div>
                  <p className="text-stone-600 text-xs line-clamp-2">{m.serviceDescription}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 1: Points Earning Guide Explanation Modal */}
      {isPointsExplanationOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto border border-[#D4AF37]/30">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4 text-amber-700" />
                </div>
                <h4 className="font-serif font-bold text-[#2C3E50] text-base md:text-lg">
                  乐龄积分获取方式与权益说明
                </h4>
              </div>
              <button
                onClick={() => setIsPointsExplanationOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Rule Intro */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-stone-50 p-4 rounded-2xl border border-amber-200 text-xs text-stone-700 space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center gap-1.5 text-sm font-serif">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>乐龄会员积分价值：100 积分 = 1 元抵扣现金</span>
              </div>
              <p className="leading-relaxed text-stone-600">
                参加文旅出游或文体赛事时，积分可直接抵扣团费（最高抵扣订单总额 15%），亦可在积分商城兑换武夷山正岩大红袍、非遗竹编文创、定制太极服等好礼！
              </p>
            </div>

            {/* 7 Ways to Earn Points */}
            <div className="space-y-2.5 text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>积分 7 大获取渠道全览</span>
              </div>

              {/* Channel 1 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">报名出游与赛事活动消费</span>
                    <span className="text-amber-800 font-bold">实付 1 元 = 10 积分起</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    基础比率 1元=10分 × 会员等级倍数 (初始x1.0 ~ 盟友x2.0) × 出游品类系数 (同城1.0, 跨省1.5, 出境1.6)。实付越多，攒分越快！
                  </p>
                </div>
              </div>

              {/* Channel 2 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">每日健康打卡与签到</span>
                    <span className="text-amber-800 font-bold">+5 ~ +50 积分/日</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    每天进入小程序签到即得 5 积分，连续签到 7 天额外奖励 +20 积分，月度满签更有专属惊喜盲盒！
                  </p>
                </div>
              </div>

              {/* Channel 3 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">行程结束后撰写真实评价与晒图</span>
                    <span className="text-amber-800 font-bold">+50 ~ +100 积分/条</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    文字点评审核通过即奖 50 积分；附带旅途真实风景或老友合影晒图，额外再奖 50 积分（共 100 积分）。
                  </p>
                </div>
              </div>

              {/* Channel 4 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">社区发布老友游记获精选</span>
                    <span className="text-amber-800 font-bold">+200 积分/篇</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    在社区发表深度散文、诗词感怀或摄影集锦，一经采纳为“精选游记”，即获 200 积分并全平台置顶展示。
                  </p>
                </div>
              </div>

              {/* Channel 5 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  5
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">邀请老友同行</span>
                    <span className="text-amber-800 font-bold">+1,000 积分/人</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    通过专属邀请码邀请老同学、老战友、老邻居注册并首次完成慢游或赛事，邀请人即可获 1000 积分，上不封顶！
                  </p>
                </div>
              </div>

              {/* Channel 6 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  6
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">心愿目的地征集与建言</span>
                    <span className="text-amber-800 font-bold">+10 ~ +500 积分</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    每次为心愿墙投票 +10 积分；由您首发的心愿如果达到 50 票并正式立项成团，发起人将获 500 积分大奖！
                  </p>
                </div>
              </div>

              {/* Channel 7 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-amber-200 font-bold flex items-center justify-center shrink-0 text-xs">
                  7
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">掼蛋/太极/乒乓等乐龄赛事荣誉</span>
                    <span className="text-amber-800 font-bold">+800 ~ +30,000 积分</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    参加全国乐龄赛事，全员均可享参与积分礼遇；荣获冠亚季军等奖项，赛事专属奖池直接注入会员账户。
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setIsPointsExplanationOpen(false);
                  setIsPointsGuideOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#2C3E50] text-[#2C3E50] font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                打开实付积分智能试算器
              </button>
              <button
                type="button"
                onClick={() => setIsPointsExplanationOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2C3E50] text-amber-100 font-bold text-xs shadow-xs border border-[#D4AF37]/30 cursor-pointer"
              >
                我知道了 · 去攒积分
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Create New Wish */}
      {isNewWishOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-serif font-bold text-[#2C3E50] text-base">
                发起心愿目的地征集
              </h4>
              <button
                onClick={() => setIsNewWishOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWish} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-bold mb-1">心愿目的地</label>
                <input
                  type="text"
                  required
                  placeholder="如：山西应县木塔与悬空寺古建"
                  value={wishDestination}
                  onChange={(e) => setWishDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">主题构想</label>
                <input
                  type="text"
                  required
                  placeholder="如：期盼开通《梁思成林徽因古建寻踪 6日慢游》"
                  value={wishTitle}
                  onChange={(e) => setWishTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">发起理由 / 期望师资</label>
                <textarea
                  rows={3}
                  required
                  placeholder="说说您为何想去？期望哪位学者同行？"
                  value={wishContent}
                  onChange={(e) => setWishContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">建议行程天数</label>
                <select
                  value={wishDays}
                  onChange={(e) => setWishDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-xs bg-white"
                >
                  <option value={4}>4 天 3 晚 (周边近程)</option>
                  <option value={5}>5 天 4 晚 (经典深度)</option>
                  <option value={6}>6 天 5 晚 (舒缓慢游)</option>
                  <option value={8}>8 天 7 晚 (西北/大西南慢品)</option>
                  <option value={14}>14 天 13 晚 (康养候鸟旅居)</option>
                </select>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewWishOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#2C3E50] text-amber-100 font-bold shadow-xs border border-[#D4AF37]/30"
                >
                  确认发布心愿
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
