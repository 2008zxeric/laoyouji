import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { HIKING_STAGES, HIKING_ACTIVITIES } from '../../data/hikingData';
import { Activity } from '../../types';
import { HikingPassportModal } from './HikingPassportModal';
import { HikingStampsWallModal } from './HikingStampsWallModal';
import { HikingMapModal } from './HikingMapModal';
import { HikingButlerContactModal } from './HikingButlerContactModal';
import { HikingElderFaqModal } from './HikingElderFaqModal';
import { HikingQuickApplyModal } from './HikingQuickApplyModal';
import {
  Compass,
  Footprints,
  Mountain,
  Heart,
  Shield,
  Coffee,
  Sparkles,
  Award,
  ChevronRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Users,
  MapPin,
  Search,
  BookOpen,
  Package,
  Layers,
  Leaf,
  Phone,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Bot,
  HelpCircle,
  Volume2,
  Smile,
  Clock,
  ShieldCheck,
  Check,
  Flame,
} from 'lucide-react';

type ChannelTab = 'routes' | 'stages' | 'safety' | 'passport';
type FitnessFeelingType = 'flat_easy' | 'gentle_slope' | 'mountain_overnight' | 'all';

export const HikingChannelView: React.FC = () => {
  const {
    activities,
    setSelectedActivity,
    openBooking,
    userProfile,
    userHikingProfile,
    hikingStamps,
    applyPhysicalPassport,
    setActivitySubChannel,
    showToast,
    openGlobalAiWithPrompt,
  } = useApp();

  // Primary Channel Navigation Tab (Fixed Layout Architecture)
  const [activeTab, setActiveTab] = useState<ChannelTab>('routes');

  // Elder Care Mode (Large Font & High Contrast)
  const [isSeniorLargeFont, setIsSeniorLargeFont] = useState(false);

  // 10-Second Fitness Feeling Quick-Selector
  const [fitnessFeeling, setFitnessFeeling] = useState<FitnessFeelingType>('all');

  const [selectedStageTab, setSelectedStageTab] = useState<number | 'all'>('all');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isStampsWallOpen, setIsStampsWallOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isButlerModalOpen, setIsButlerModalOpen] = useState(false);
  const [isQuickApplyOpen, setIsQuickApplyOpen] = useState(false);

  // Selected Activity for Elder FAQ Modal
  const [faqModalActivity, setFaqModalActivity] = useState<Activity | null>(null);

  // Active stage inspected in the 5-Stage Ladder tab
  const [activeStageDetail, setActiveStageDetail] = useState<number>(userHikingProfile.currentStage);

  // Helper: Extract & format 3 core metrics (步程难度、预计时长、海拔高度) for each route
  const getRouteCoreMetrics = (act: Activity) => {
    const meta = act.hikingMeta;
    const dist = meta?.distanceKm || 4.5;
    const elev = meta?.elevationGainM || (meta?.stageRequired === 1 ? 25 : meta?.stageRequired === 2 ? 160 : 280);

    // 1. 步程难度
    let difficultyTag = '🟢 散步平路级';
    let difficultySub = '0台阶栈道';
    if (meta?.stageRequired === 2) {
      difficultyTag = '🟡 缓坡微汗级';
      difficultySub = '松针林荫缓坡';
    } else if (meta?.stageRequired && meta.stageRequired >= 3) {
      difficultyTag = '🟠 访古登高级';
      difficultySub = '名山雅宿舒缓';
    }

    // 2. 预计时长 (含25分钟茶歇)
    let estDuration = '约 1.5 小时';
    if (dist <= 4.0) {
      estDuration = '约 1 小时';
    } else if (dist <= 6.0) {
      estDuration = '约 2 小时';
    } else if (dist <= 8.0) {
      estDuration = '约 2.5 小时';
    } else {
      estDuration = '约 3.5 小时';
    }

    // 3. 海拔高度 / 累计爬升
    const elevationText = `爬升 ${elev}m`;
    const elevationSub = elev <= 50 ? '平缓无陡坡' : elev <= 200 ? '坡度平缓<6°' : '微汗轻登高';

    return {
      difficultyTag,
      difficultySub,
      estDuration,
      elevationText,
      elevationSub,
    };
  };

  // Speech helper for elderly users
  const speakElderTip = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.88; // 放慢语速，清晰可辨
      window.speechSynthesis.speak(utterance);
      showToast('🔊 正在为您语音慢速朗读适老路线指南...');
    } else {
      showToast('您的浏览器暂未开启语音朗读');
    }
  };

  // Extract all hiking activities from activities list or fallback to HIKING_ACTIVITIES
  const allHikingList: Activity[] = useMemo(() => {
    const list = activities.filter((a) => a.isHiking || a.category === '徒步');
    return list.length > 0 ? list : HIKING_ACTIVITIES;
  }, [activities]);

  const destinations = ['all', '宁波', '余姚/四明山', '杭州', '徽州/绩溪', '黄山/休宁', '温州/雁荡山'];

  // Handle Fitness Feeling selection
  const handleFitnessFeelingSelect = (type: FitnessFeelingType) => {
    setFitnessFeeling(type);
    if (type === 'flat_easy') {
      setSelectedStageTab(1);
      showToast('🟢 已为您筛选【0台阶平路亲水栈道】，如同公园散步，随团护士与双杖随行！');
    } else if (type === 'gentle_slope') {
      setSelectedStageTab(2);
      showToast('🟡 已为您筛选【松针林荫缓坡吸氧专线】，坡度平缓微出汗，25分钟坐椅喝茶！');
    } else if (type === 'mountain_overnight') {
      setSelectedStageTab(3);
      showToast('🟠 已为您筛选【名胜古道山居过夜专线】，专人领队压步，舒享山野私房素膳！');
    } else {
      setSelectedStageTab('all');
      showToast('已显示老友徒步全部精选路线');
    }
  };

  // Filtered hiking routes
  const filteredHikingActivities = useMemo(() => {
    return allHikingList.filter((act) => {
      // Stage filter
      if (selectedStageTab !== 'all' && act.hikingMeta?.stageRequired !== selectedStageTab) {
        return false;
      }
      // Destination filter
      if (selectedDestinationFilter !== 'all' && !act.destination.includes(selectedDestinationFilter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchSubtitle = act.subtitle?.toLowerCase().includes(q);
        const matchDest = act.destination.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchDest) return false;
      }
      return true;
    });
  }, [allHikingList, selectedStageTab, selectedDestinationFilter, searchQuery]);

  const currentStageInfo = HIKING_STAGES.find((s) => s.stage === userHikingProfile.currentStage) || HIKING_STAGES[0];
  const nextStageInfo = HIKING_STAGES.find((s) => s.stage === userHikingProfile.currentStage + 1);

  const handleBooking = (act: Activity) => {
    if (act.hikingMeta && act.hikingMeta.stageRequired && act.hikingMeta.stageRequired > userHikingProfile.currentStage) {
      showToast(
        `温馨提示：该路线适合【${act.hikingMeta.stageRequiredName || '进阶'}】长者。伴游管家与随团护士将全程关照，请放心报名。`
      );
    }
    openBooking('activity', act);
  };

  return (
    <div className={`space-y-6 animate-fadeIn pb-16 ${isSeniorLargeFont ? 'senior-large-mode text-base' : ''}`}>
      {/* ========================================================================= */}
      {/* 1. TOP BENTO HEADER: Hero Brand Card + User Member Passport Card */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hero Card (8 cols) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-lg border border-[#D4AF37]/40 bg-gradient-to-br from-[#1E293B] via-[#243342] to-[#1E293B] text-white p-6 sm:p-7 flex flex-col justify-between">
          {/* Subtle patterned overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage:
                'radial-gradient(#D4AF37 1.5px, transparent 1.5px), radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 space-y-4">
            {/* Top action row */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => setActivitySubChannel('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-serif transition-colors cursor-pointer border border-white/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回全部文旅慢游</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Large Font Toggle */}
                <button
                  onClick={() => {
                    setIsSeniorLargeFont(!isSeniorLargeFont);
                    showToast(isSeniorLargeFont ? '已恢复标准字体' : '👓 已开启大字关怀模式！');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif flex items-center gap-1 transition-all cursor-pointer border ${
                    isSeniorLargeFont
                      ? 'bg-[#D4AF37] text-stone-900 font-bold border-[#D4AF37] shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/20'
                  }`}
                  title="字号放大，阅读不费眼"
                >
                  {isSeniorLargeFont ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isSeniorLargeFont ? '大字已开启' : '大字关怀'}</span>
                </button>

                {/* Butler Hotline */}
                <button
                  onClick={() => setIsButlerModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/40 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-200" />
                  <span>管家热线</span>
                </button>

                {/* Map Modal */}
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>足迹地图</span>
                </button>
              </div>
            </div>

            {/* Brand Title & Philosophy */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner shrink-0">
                  <Footprints className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`font-serif font-black tracking-wide text-[#FBF9F5] ${isSeniorLargeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                      老友徒步 · 银发慢行，丈量山海
                    </h1>
                    <span className="hidden sm:inline-block text-[11px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-serif">
                      中华老年保健协会指导
                    </span>
                  </div>
                  <p className={`text-stone-300 font-serif mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                    专为 50-75 岁长者设计：50步/分控速 · 25分钟软椅茶歇 · 随团急救护士AED · 德国避震双杖免费配发
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 5 Assurances Micro-Strip */}
          <div className="relative z-10 mt-5 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-[#D4AF37] font-serif font-bold shrink-0">适老五心保障：</span>
            <div className="flex flex-wrap items-center gap-2 text-stone-200 text-xs">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>50步/分控速</span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>25分软椅茶歇</span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>德国避震双手杖</span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>随团急救护士+AED</span>
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>单反装裱寄送</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Member Passport Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#FAF8F5] rounded-3xl p-5 sm:p-6 border-2 border-[#D4AF37]/50 shadow-md flex flex-col justify-between space-y-4">
          {/* Top User Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-[#D4AF37]/80 shadow-xs"
                />
                <div className="absolute -bottom-1.5 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-stone-900 font-bold text-[9px] flex items-center justify-center shadow-xs">
                  L{userHikingProfile.currentStage}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {userProfile.name}
                  </h3>
                  <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-serif font-bold border border-amber-300">
                    第{userHikingProfile.currentStage}段 · {currentStageInfo.name}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  护照号: <span className="font-mono text-stone-700">{userHikingProfile.passportNumber}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPassportOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-amber-950 text-xs font-serif font-semibold border border-[#D4AF37]/50 transition-colors cursor-pointer"
            >
              翻开内页
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-white rounded-2xl border border-stone-200/80 text-center shadow-2xs">
            <div>
              <span className="text-[10px] text-stone-400 block">慢行里程</span>
              <span className="font-serif font-bold text-sm text-stone-800">{userHikingProfile.totalDistanceKm}</span>
              <span className="text-[9px] text-stone-500"> km</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">累计爬升</span>
              <span className="font-serif font-bold text-sm text-stone-800">{userHikingProfile.totalElevationM}</span>
              <span className="text-[9px] text-stone-500"> m</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">完赛路线</span>
              <span className="font-serif font-bold text-sm text-stone-800">{userHikingProfile.completedTripsCount}</span>
              <span className="text-[9px] text-stone-500"> 条</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">荣誉印迹</span>
              <span className="font-serif font-bold text-sm text-amber-700">{userHikingProfile.unlockedStampIds.length}</span>
              <span className="text-[9px] text-stone-500"> 枚</span>
            </div>
          </div>

          {/* Advancement Hint & Buttons */}
          <div className="space-y-2.5">
            {nextStageInfo && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">晋升下阶：第{nextStageInfo.stage}段 {nextStageInfo.name}</span>
                  <span className="font-serif font-bold text-amber-800">
                    {userHikingProfile.unlockedStampIds.length} / {nextStageInfo.stampsRequiredCount || 5} 印记
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (userHikingProfile.unlockedStampIds.length / (nextStageInfo.stampsRequiredCount || 5)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsStampsWallOpen(true)}
                className="flex-1 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-serif flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>印迹墙 ({hikingStamps.filter((s) => s.isUnlocked).length})</span>
              </button>

              <button
                onClick={applyPhysicalPassport}
                className="flex-1 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-900 text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Package className="w-3.5 h-3.5 text-stone-900" />
                <span>{userHikingProfile.physicalPassportApplied ? '烫金护照已寄' : '申领烫金护照'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RATIONAL CHANNEL NAVIGATION TABS: Routes First, No Endless Stacking! */}
      {/* ========================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-2 sticky top-2 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-[#2C3E50] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>精选适老专线库</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {filteredHikingActivities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stages'
                ? 'bg-[#2C3E50] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Mountain className="w-4 h-4 text-[#D4AF37]" />
            <span>银发五段位标准</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'safety'
                ? 'bg-[#2C3E50] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>安心保障与行前指南</span>
          </button>

          <button
            onClick={() => setActiveTab('passport')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'passport'
                ? 'bg-[#2C3E50] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>我的徒步护照与荣誉</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500 pr-2">
          <span>专属领队压步</span>
          <span className="text-stone-300">·</span>
          <span>德国避震双杖</span>
          <span className="text-stone-300">·</span>
          <span>红十字急救护士</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: 适老精选路线库 (THE PRIMARY VIEW - ROUTES FIRST!) */}
      {/* ========================================================================= */}
      {activeTab === 'routes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* A. 10-Second Fitness Feeling Quick-Selector (Streamlined) */}
          <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-[#D4AF37]/50 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-amber-700" />
                  <h3 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-xl' : 'text-base'}`}>
                    长者适老体能 10 秒速配 · 请问您平时散步的感觉是？
                  </h3>
                </div>
                <p className={`text-stone-500 mt-1 ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                  点选最符合您体力感觉的卡片，一秒直达最安全舒心的适老路线：
                </p>
              </div>

              {fitnessFeeling !== 'all' && (
                <button
                  onClick={() => handleFitnessFeelingSelect('all')}
                  className="text-xs text-amber-900 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer font-serif"
                >
                  重置并显示全部
                </button>
              )}
            </div>

            {/* 4 Large Interactive Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Choice 1: Flat Easy */}
              <div
                onClick={() => handleFitnessFeelingSelect('flat_easy')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  fitnessFeeling === 'flat_easy'
                    ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-400/50 scale-[1.01]'
                    : 'bg-white hover:bg-emerald-50/40 border-stone-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 font-serif">
                      🟢 散步平路级
                    </span>
                    {fitnessFeeling === 'flat_easy' && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-lg' : 'text-sm'}`}>
                    平时只走平路 · 0台阶看风景
                  </h4>
                  <p className={`text-stone-600 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    慢走30-40分钟，不走任何陡峭台阶。适合湖畔绿道、森林栈道。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-700 font-serif">
                  匹配：第1段 · 起步者专线
                </div>
              </div>

              {/* Choice 2: Gentle Slope */}
              <div
                onClick={() => handleFitnessFeelingSelect('gentle_slope')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  fitnessFeeling === 'gentle_slope'
                    ? 'bg-amber-50/90 border-amber-600 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                    : 'bg-white hover:bg-amber-50/40 border-stone-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 font-serif">
                      🟡 林荫微汗级
                    </span>
                    {fitnessFeeling === 'gentle_slope' && <Check className="w-4 h-4 text-amber-700" />}
                  </div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-lg' : 'text-sm'}`}>
                    常逛公园小缓坡 · 走走停停吸氧
                  </h4>
                  <p className={`text-stone-600 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    能慢走40-60分钟，不怕平缓林荫小坡。适合竹海古道、茶田步道。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 font-serif">
                  匹配：第2段 · 行路者专线
                </div>
              </div>

              {/* Choice 3: Mountain Overnight */}
              <div
                onClick={() => handleFitnessFeelingSelect('mountain_overnight')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  fitnessFeeling === 'mountain_overnight'
                    ? 'bg-orange-50/90 border-orange-600 shadow-md ring-2 ring-orange-400/50 scale-[1.01]'
                    : 'bg-white hover:bg-orange-50/40 border-stone-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-orange-100 text-orange-900 font-serif">
                      🟠 访古登高级
                    </span>
                    {fitnessFeeling === 'mountain_overnight' && <Check className="w-4 h-4 text-orange-700" />}
                  </div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-lg' : 'text-sm'}`}>
                    体力硬朗 · 喜欢名胜古道过夜
                  </h4>
                  <p className={`text-stone-600 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    膝关节无酸痛，喜欢慢走名山古道、宿山间雅居、尝素斋。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-orange-200/60 text-[11px] text-orange-800 font-serif">
                  匹配：第3段 · 翻山者专线
                </div>
              </div>

              {/* Choice 4: Show All */}
              <div
                onClick={() => handleFitnessFeelingSelect('all')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  fitnessFeeling === 'all'
                    ? 'bg-stone-100/90 border-stone-700 shadow-md ring-2 ring-stone-300 scale-[1.01]'
                    : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-stone-100 text-stone-700 font-serif">
                      ⚪ 全部专线
                    </span>
                    {fitnessFeeling === 'all' && <Check className="w-4 h-4 text-stone-800" />}
                  </div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-lg' : 'text-sm'}`}>
                    浏览全部徒步路线
                  </h4>
                  <p className={`text-stone-600 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    包含同城轻步、山野慢行与跨省避暑，均经适老五星认证。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200/70 text-[11px] text-stone-500 font-serif">
                  展示全库 {allHikingList.length} 条专线
                </div>
              </div>
            </div>

            {/* Reassuring Feedback Banner */}
            {fitnessFeeling !== 'all' && (
              <div className="bg-white rounded-2xl p-3.5 border border-amber-300/80 shadow-2xs flex items-center justify-between gap-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <b>管家温馨提示：</b>已为您筛选出该体能区间的路线。若仍有顾虑，可随时点击【管家热线】进行 1 对 1 评估。
                  </span>
                </div>
                <button
                  onClick={() => handleFitnessFeelingSelect('all')}
                  className="text-stone-500 hover:text-stone-800 underline shrink-0 cursor-pointer"
                >
                  清除体能筛选
                </button>
              </div>
            )}
          </div>

          {/* B. Filter Toolbar (City + Stage + Search) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Destination Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs text-stone-500 whitespace-nowrap">目的地：</span>
                {destinations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDestinationFilter(d)}
                    className={`px-3 py-1 rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      selectedDestinationFilter === d
                        ? 'bg-[#D4AF37] text-stone-900 font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    {d === 'all' ? '全部地区' : d}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索古道、目的地或领队..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Stage Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500 whitespace-nowrap">适老化段位：</span>
              <button
                onClick={() => {
                  setSelectedStageTab('all');
                  setFitnessFeeling('all');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-colors cursor-pointer ${
                  selectedStageTab === 'all'
                    ? 'bg-[#2C3E50] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                }`}
              >
                全部段位
              </button>
              {HIKING_STAGES.map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setSelectedStageTab(s.stage)}
                  className={`px-3 py-1 rounded-xl text-xs font-serif transition-colors cursor-pointer whitespace-nowrap ${
                    selectedStageTab === s.stage
                      ? 'bg-[#2C3E50] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  第{s.stage}段 · {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* C. Routes Grid */}
          {filteredHikingActivities.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
              <Footprints className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="font-serif font-bold text-stone-700">暂无符合条件的徒步专线</h4>
              <p className="text-xs text-stone-400">请尝试切换上方“体能速配”或目的地筛选条件</p>
              <button
                onClick={() => handleFitnessFeelingSelect('all')}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-serif cursor-pointer"
              >
                查看全部路线
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredHikingActivities.map((act) => {
                const meta = act.hikingMeta;
                const metrics = getRouteCoreMetrics(act);

                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
                  >
                    {/* 1. 大图 + 关键信息遮罩容器 (Large Photo + Hero Metric Mask) */}
                    <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-stone-900 select-none">
                      {/* Full-width Cover Photo with smooth hover zoom */}
                      <img
                        src={act.cover}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.96]"
                      />

                      {/* Top Floating Glass Badges */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#1E293B]/85 backdrop-blur-md text-[#F8FAFC] text-xs font-serif font-semibold px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{act.destination}</span>
                          </span>
                          <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                            {act.durationDays}天{act.durationNights}晚
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Voice read-aloud button */}
                          <button
                            onClick={(e) =>
                              speakElderTip(
                                `${act.title}，慢行约${meta?.distanceKm || 4.5}公里，${metrics.difficultyTag}，预计时长${metrics.estDuration}，${metrics.elevationText}。配专业领队压步与随团急救护士，请长者放心出行。`,
                                e
                              )
                            }
                            className="w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-sm"
                            title="点击语音慢速朗读"
                          >
                            <Volume2 className="w-4 h-4 text-amber-300" />
                          </button>

                          {meta?.associatedStampName && (
                            <span className="bg-red-600/90 backdrop-blur-md text-white text-[11px] font-serif px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-red-400/40">
                              <span>🎖️ {meta.associatedStampName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 关键信息遮罩 (High-contrast Dark Mask Overlay at bottom of Photo) */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B132B]/95 via-[#0B132B]/75 to-transparent pt-14 pb-3.5 px-3.5 sm:px-4 backdrop-blur-[1.5px] z-10">
                        {/* 3 Core Highlight Metrics: 步程难度、预计时长、海拔高度 */}
                        <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 shadow-inner">
                          {/* 1. 步程难度 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-300 font-serif mb-0.5">
                              <Footprints className="w-3 h-3 text-emerald-400" />
                              <span>步程难度</span>
                            </div>
                            <div className={`font-serif font-bold text-xs sm:text-[13px] text-white truncate ${isSeniorLargeFont ? 'text-sm' : ''}`}>
                              {metrics.difficultyTag}
                            </div>
                            <div className="text-[10px] text-emerald-200 font-normal truncate mt-0.5">
                              {metrics.difficultySub}
                            </div>
                          </div>

                          {/* 2. 预计时长 */}
                          <div className="text-center border-x border-white/15 px-1">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-300 font-serif mb-0.5">
                              <Clock className="w-3 h-3 text-amber-300" />
                              <span>预计时长</span>
                            </div>
                            <div className={`font-serif font-bold text-xs sm:text-[13px] text-white truncate ${isSeniorLargeFont ? 'text-sm' : ''}`}>
                              {metrics.estDuration}
                            </div>
                            <div className="text-[10px] text-amber-200 font-normal truncate mt-0.5">
                              含25分茶歇
                            </div>
                          </div>

                          {/* 3. 海拔高度 / 累计爬升 */}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] text-stone-300 font-serif mb-0.5">
                              <Mountain className="w-3 h-3 text-sky-300" />
                              <span>海拔/爬升</span>
                            </div>
                            <div className={`font-serif font-bold text-xs sm:text-[13px] text-white truncate ${isSeniorLargeFont ? 'text-sm' : ''}`}>
                              {metrics.elevationText}
                            </div>
                            <div className="text-[10px] text-stone-300 font-normal truncate mt-0.5">
                              {metrics.elevationSub}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Card Lower Content (Clean & High Readability) */}
                    <div className="p-4.5 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {/* Route Title */}
                        <h4 className={`font-serif font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 ${isSeniorLargeFont ? 'text-lg' : 'text-base'}`}>
                          {act.title}
                        </h4>

                        {/* Elder Reassurance Strip */}
                        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-xs text-stone-600 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-stone-700">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">50步/分压步 · 备发德国避震杖 · 随车急救</span>
                          </span>
                          <span className="text-[11px] text-stone-400 whitespace-nowrap pl-1">
                            {meta?.distanceKm || 4.5}km
                          </span>
                        </div>

                        {/* Elder Q&A Trigger Button (Opens Modal) */}
                        <button
                          onClick={() => setFaqModalActivity(act)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-serif font-semibold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                            <span>适合我吗？膝关节与体力放心答疑</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
                        </button>

                        {/* Staff & Medical tags */}
                        <div className="flex items-center justify-between text-xs text-stone-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>领队: {act.tgo?.name || '资深TGO管家'}</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>红十字急救护士随行</span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Price & Action Buttons */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400">长者会员价</span>
                          <div className="text-xl font-bold font-serif text-amber-800">
                            ¥{act.priceGroup}
                            <span className="text-xs text-stone-500 font-normal"> /位</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => setIsButlerModalOpen(true)}
                            className="px-2.5 py-2 text-xs rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="电话咨询管家"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>咨询</span>
                          </button>
                          <button
                            onClick={() => setSelectedActivity(act)}
                            className="px-3 py-2 text-xs rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                          >
                            详情
                          </button>
                          <button
                            onClick={() => handleBooking(act)}
                            className="px-4 py-2 text-xs rounded-xl bg-[#2C3E50] hover:bg-[#1E293B] text-[#FBF9F5] border border-[#D4AF37]/50 font-serif font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                          >
                            专属预约
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: 银发五段位标准 (DEDICATED IMMERSIVE LADDER) */}
      {/* ========================================================================= */}
      {activeTab === 'stages' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Mountain className="w-6 h-6 text-emerald-700" />
                  <h3 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-2xl' : 'text-xl'}`}>
                    老友徒步 · 银发五段位评定体系
                  </h3>
                </div>
                <p className={`text-stone-500 mt-1 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                  经中华老年保健协会指导设立，科学分阶、步步从容，段位终身有效且享有专属礼遇
                </p>
              </div>
              <span className="text-xs text-[#D4AF37] font-medium font-serif bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                每一阶位均赠予专属烫金勋章
              </span>
            </div>

            {/* Stage selection tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {HIKING_STAGES.map((stg) => {
                const isUserCurrent = userHikingProfile.currentStage === stg.stage;
                const isSelected = activeStageDetail === stg.stage;
                return (
                  <button
                    key={stg.stage}
                    onClick={() => setActiveStageDetail(stg.stage)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-md scale-[1.02]'
                        : 'bg-[#FAF8F5] text-stone-800 border-stone-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    {isUserCurrent && (
                      <span className="absolute top-2 right-2 text-[9px] bg-[#D4AF37] text-stone-900 font-bold px-1.5 py-0.5 rounded-full">
                        当前段位
                      </span>
                    )}
                    <div className="text-[10px] font-mono tracking-wider opacity-70">
                      {stg.code}
                    </div>
                    <div className={`font-serif font-bold mt-1 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                      第{stg.stage}段 · {stg.name}
                    </div>
                    <div className="text-[11px] opacity-80 mt-1 line-clamp-1">
                      {stg.badgeVisual}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed view of currently inspected stage */}
            {(() => {
              const detail = HIKING_STAGES.find((s) => s.stage === activeStageDetail) || HIKING_STAGES[0];
              return (
                <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-stone-200 space-y-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-[#D4AF37] text-stone-900 font-serif font-bold px-2.5 py-1 rounded-full">
                          {detail.badgeName}
                        </span>
                        <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-xl' : 'text-lg'}`}>
                          第{detail.stage}段 · 【{detail.name}】适老评定标准
                        </h4>
                      </div>
                      <p className={`text-stone-600 mt-2 leading-relaxed ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                        {detail.targetDescription}
                      </p>
                    </div>

                    <div className="bg-white px-4 py-3 rounded-2xl border border-stone-200 text-xs text-stone-600 shrink-0 shadow-2xs">
                      <span className="text-stone-400">所需印记：</span>
                      <b className="text-stone-800 font-bold font-serif">{detail.stampsRequiredCount} 枚</b>
                      <span className="mx-2 text-stone-300">|</span>
                      <span className="text-stone-400">晋升条件：</span>
                      <b className="text-emerald-700">{detail.upgradeCondition}</b>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-stone-200/80">
                    {/* Privileges */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200/70 shadow-2xs">
                      <span className="text-sm font-serif font-bold text-stone-900 flex items-center gap-1.5 mb-3">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        <span>该段位专属老友礼遇权益：</span>
                      </span>
                      <ul className="space-y-2">
                        {detail.privileges.map((p, idx) => (
                          <li key={idx} className={`flex items-start gap-2 text-stone-700 ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Elder caution */}
                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold font-serif text-sm">
                        <Heart className="w-4 h-4 text-amber-700" />
                        <span>适老化健康出行指导：</span>
                      </div>
                      <p className={`leading-relaxed text-amber-900 ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                        该段位对应心肺负荷平稳，出发前请确保随身常备降压药与温水杯；我们已在全线部署适老静音茶歇点与红十字救护员巡护。
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setSelectedStageTab(detail.stage);
                            setActiveTab('routes');
                          }}
                          className="w-full py-2 bg-white hover:bg-amber-100 text-amber-950 font-serif font-bold rounded-xl border border-amber-300 text-xs transition-colors cursor-pointer"
                        >
                          直接查看适合【第{detail.stage}段 · {detail.name}】的精选路线 →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: 安心保障与行前指南 (SAFETY & 3 STEPS) */}
      {/* ========================================================================= */}
      {activeTab === 'safety' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Beginner 3 Steps Guide */}
          <div className="bg-gradient-to-r from-amber-50/80 via-white to-stone-50 rounded-3xl p-6 border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-xl' : 'text-lg'}`}>
                  老友徒步 3 步指南 · 长者这样走最舒心
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-serif">
                零门槛 · 不盲走 · 全程有医护与软椅守候
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-serif font-black text-sm flex items-center justify-center shrink-0 border border-amber-300">
                  1
                </div>
                <div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                    10秒测体能选路线
                  </h4>
                  <p className={`text-stone-500 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    不用研究复杂参数，根据平时散步感觉一键筛选 0 陡坡台阶的安全平缓路线。
                  </p>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 font-serif font-black text-sm flex items-center justify-center shrink-0 border border-emerald-300">
                  2
                </div>
                <div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                    领队压步软椅喝茶
                  </h4>
                  <p className={`text-stone-500 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    专业领队以 50步/分慢速压阵，走 25 分钟便坐椅喝热罗汉果茶，急救护士带血压计全程随行。
                  </p>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 font-serif font-black text-sm flex items-center justify-center shrink-0 border border-blue-300">
                  3
                </div>
                <div>
                  <h4 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                    打卡盖章领金勋章
                  </h4>
                  <p className={`text-stone-500 mt-1 leading-relaxed ${isSeniorLargeFont ? 'text-sm' : 'text-xs'}`}>
                    走完全程由管家在《乐龄徒步护照》盖章，积攒印迹晋升段位，官方免费寄送实体烫金护照与勋章。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Assurances In Depth */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Shield className="w-5 h-5 text-emerald-700" />
              <h3 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-xl' : 'text-base'}`}>
                老友记 · 适老化科学徒步五大安心承诺详解
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Footprints className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  1. 50步/分科学控速
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  领队在前平稳压步，微汗不喘，严禁快步与超车。走得慢是硬性纪律。
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  2. 25分钟软椅茶歇
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  携带轻便折叠软椅，走25分钟就坐椅喝热罗汉果润喉汤，绝不站立硬撑。
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  3. 德国避震双手杖免借
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  免费配发德国 LEKI 双手杖+减压护膝，由手臂分担膝关节 30% 承重。
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  4. 随团急救护士+AED
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  红十字应急救护员伴游，配备电子血压计、除颤仪与属地三甲绿色通道。
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4.5 rounded-2xl border border-stone-200/70 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  5. 单反旅拍装裱寄送
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  随团摄影师跟拍银发欢颜，免费精修冲印并实木装裱寄送长者府上。
                </p>
              </div>
            </div>
          </div>

          {/* 3 Golden Rules */}
          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  老友记 · 适老科学健步 3 大黄金守则
                </h4>
              </div>
              <span className="text-xs text-stone-500 font-serif">科学慢行，越走越精神</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/70 space-y-1.5 shadow-2xs">
                <h5 className="font-serif font-bold text-stone-900 text-sm">
                  🥢 双手杖使用：分担膝部30%压力
                </h5>
                <p className="text-stone-500 leading-relaxed text-xs">
                  行走时肘关节呈90度角，手杖触地与脚步同频自然摆动，下坡时手杖先于身体落地，分担膝关节冲击，防止滑倒。
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/70 space-y-1.5 shadow-2xs">
                <h5 className="font-serif font-bold text-stone-900 text-sm">
                  💧 少量多次补水：生津润喉不腹胀
                </h5>
                <p className="text-stone-500 leading-relaxed text-xs">
                  慢行中每15-20分钟补充50-100毫升温水，管家随团备有金银花温茶与罗汉果汤，切忌大口暴饮冰凉饮品，润喉即可。
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-stone-200/70 space-y-1.5 shadow-2xs">
                <h5 className="font-serif font-bold text-stone-900 text-sm">
                  👣 脚跟过渡步态：小步高频最稳当
                </h5>
                <p className="text-stone-500 leading-relaxed text-xs">
                  足跟着地，平稳过渡至足弓外侧，再由大脚趾蹬离地面。步幅保持在平时步幅的70%-80%，以小步稳健换取极致安全。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 4: 我的徒步护照与足迹 (PASSPORT & HONORS) */}
      {/* ========================================================================= */}
      {activeTab === 'passport' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className={`font-serif font-bold text-stone-900 ${isSeniorLargeFont ? 'text-2xl' : 'text-xl'}`}>
                    《乐龄徒步护照》专属荣誉档案
                  </h3>
                </div>
                <p className={`text-stone-500 mt-1 ${isSeniorLargeFont ? 'text-base' : 'text-sm'}`}>
                  持照人：{userProfile.name} · 终身护照编码：{userHikingProfile.passportNumber}
                </p>
              </div>

              <button
                onClick={() => setIsPassportOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] hover:bg-[#C29D26] text-stone-950 font-serif font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>全屏翻开《乐龄徒步护照》</span>
              </button>
            </div>

            {/* Passport Showcase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Physical Passport Status Card */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#D4AF37]/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-base">
                      官方烫金实体护照礼遇
                    </h4>
                    <span className="text-xs text-stone-500">免费顺丰包邮寄送长者府上</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  采用复古皮质烫金封皮与特种米黄道林纸，可在线下由TGO管家亲手加盖实体火漆印与路线特种纪念章。
                </p>

                <div className="pt-2">
                  {userHikingProfile.physicalPassportApplied ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 font-serif font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>已成功申领实体护照，正为您烫金定制并安排顺丰寄送</span>
                    </div>
                  ) : (
                    <button
                      onClick={applyPhysicalPassport}
                      className="w-full py-3 px-4 rounded-2xl bg-[#2C3E50] hover:bg-[#1E293B] text-white font-serif font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4 text-[#D4AF37]" />
                      <span>免费填写地址申领实体烫金护照</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stamps Wall Card */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">
                        荣誉印迹墙 ({hikingStamps.filter((s) => s.isUnlocked).length} / {hikingStamps.length})
                      </h4>
                      <span className="text-xs text-stone-500">已点亮 {hikingStamps.filter((s) => s.isUnlocked).length} 枚路线专属荣誉章</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsStampsWallOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-serif cursor-pointer shadow-2xs"
                  >
                    查看印迹墙
                  </button>
                </div>

                {/* Stamp Icons Preview */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {hikingStamps.slice(0, 4).map((st) => (
                    <div
                      key={st.id}
                      className={`p-2 rounded-xl text-center border ${
                        st.isUnlocked
                          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                          : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60'
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{st.badgeVisual ? st.badgeVisual.slice(0, 2) : '🎖️'}</span>
                      <span className="text-[10px] font-serif block truncate">{st.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FLOATING ACTION BUTTON (一键报名徒步 悬浮行动按钮) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-7 z-40">
        <button
          onClick={() => setIsQuickApplyOpen(true)}
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[#2C3E50] via-[#1E293B] to-[#2C3E50] hover:from-[#1E293B] hover:to-[#0F172A] text-white border-2 border-[#D4AF37] shadow-2xl hover:shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-3 group"
          title="一键快速报名适老徒步路线"
        >
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:rotate-12 transition-transform shadow-inner shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 font-serif font-bold text-sm sm:text-base text-[#FBF9F5]">
              <span>一键报名徒步</span>
              <span className="text-[10px] bg-[#D4AF37] text-stone-950 px-1.5 py-0.2 rounded font-sans font-extrabold shadow-2xs">
                省心快道
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90 font-serif">
              管家全程协助 · 专配医护双杖
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 7. MODALS (PASSPORT, STAMPS, MAP, BUTLER, ELDER FAQ, QUICK APPLY) */}
      {/* ========================================================================= */}
      <HikingPassportModal isOpen={isPassportOpen} onClose={() => setIsPassportOpen(false)} />
      <HikingStampsWallModal isOpen={isStampsWallOpen} onClose={() => setIsStampsWallOpen(false)} />
      <HikingMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
      <HikingButlerContactModal
        isOpen={isButlerModalOpen}
        onClose={() => setIsButlerModalOpen(false)}
        onCallSuccess={(phone) => showToast(`已呼叫徒步管家：${phone}`)}
      />
      <HikingElderFaqModal
        isOpen={!!faqModalActivity}
        activity={faqModalActivity}
        onClose={() => setFaqModalActivity(null)}
        onAskAi={(act) => {
          openGlobalAiWithPrompt(
            `你好小老友，请针对赵元博教授的健康情况（平时步数限5000步内、血压平稳控制），客观评估能否参加《${act.title}》？有哪些特别关照事项？`
          );
        }}
        onContactButler={() => setIsButlerModalOpen(true)}
      />
      <HikingQuickApplyModal
        isOpen={isQuickApplyOpen}
        onClose={() => setIsQuickApplyOpen(false)}
        activities={allHikingList}
        userProfile={userProfile}
        userHikingProfile={userHikingProfile}
        onConfirmBooking={(act) => handleBooking(act)}
        onCallButler={() => setIsButlerModalOpen(true)}
      />
    </div>
  );
};
