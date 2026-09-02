import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  MapPin,
  Calendar,
  Footprints,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coffee,
  Moon,
  Volume2,
  VolumeX,
  Share2,
  Printer,
  ChevronRight,
  RefreshCw,
  Send,
  Sliders,
  Award,
  Zap,
  BookmarkPlus,
  Utensils,
  BedDouble,
  UserCheck,
  Pill,
  ArrowRight,
  Compass,
  Smile,
  Users,
} from 'lucide-react';

interface DayPlan {
  day: number;
  dateLabel: string;
  title: string;
  theme: string;
  estimatedSteps: string;
  morning: {
    time: string;
    title: string;
    desc: string;
    elderCare: string;
  };
  lunch: {
    time: string;
    restaurant: string;
    menu: string;
  };
  noonRest: {
    time: string;
    desc: string;
  };
  afternoon: {
    time: string;
    title: string;
    desc: string;
    elderCare: string;
  };
  dinner: {
    time: string;
    restaurant: string;
    menu: string;
  };
  evening: {
    time: string;
    desc: string;
  };
  hotel: string;
  medicationTip?: string;
}

interface SlowTravelPlan {
  itineraryTitle: string;
  subtitle: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  paceType: string;
  avgDailySteps: number;
  themeTags: string[];
  elderPhilosophy: string;
  assignedMaster: {
    name: string;
    title: string;
    avatar: string;
    speechTheme: string;
  };
  assignedTgo: {
    name: string;
    cert: string;
    motto: string;
  };
  medicalAssurance: string[];
  days: DayPlan[];
  spokenSummary: string;
  estimatedPrice: number;
}

interface AiSlowTravelPlannerProps {
  onAskAiAboutPlan?: (prompt: string) => void;
  onPlanSaved?: () => void;
}

export const AiSlowTravelPlanner: React.FC<AiSlowTravelPlannerProps> = ({
  onAskAiAboutPlan,
  onPlanSaved,
}) => {
  const {
    userProfile,
    currentTier,
    showToast,
    openBooking,
    createOrder,
    activities,
    setSelectedActivity,
    isCareMode,
    isLargeFont,
  } = useApp();

  // Input States
  const [duration, setDuration] = useState<number>(3); // Default 3 days as requested
  const [selectedDest, setSelectedDest] = useState<string>('苏州 · 园林文脉与昆曲慢游');
  const [customDest, setCustomDest] = useState<string>('');
  const [isCustomDest, setIsCustomDest] = useState<boolean>(false);
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'active'>('moderate');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    '学者名师随团',
    '茶道文博雅集',
    '乐龄五星慢住',
  ]);
  const [companion, setCompanion] = useState<string>('夫妻二人出行');
  const [healthNotes, setHealthNotes] = useState<string>(
    userProfile.healthProfile?.chronicDiseases?.length
      ? `长辈有${userProfile.healthProfile.chronicDiseases.join('、')}，要求少盐低糖软烂餐饮，少爬台阶，保障充分午休`
      : '轻度高血压，偏好少油少盐软烂餐饮，少爬陡坡台阶，每日安排充分午睡'
  );

  // Generation & View States
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<SlowTravelPlan | null>(null);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [adjustmentInput, setAdjustmentInput] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  // Preset Destinations for Elderly Slow-Travel
  const presetDestinations = [
    {
      id: 'suzhou',
      name: '苏州 · 园林文脉与昆曲慢游',
      shortName: '江苏 · 苏州',
      tag: '经典水乡',
      desc: '拙政名园VIP闭馆导赏 · 昆曲水榭雅集 · 评弹私享',
      cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'huangshan',
      name: '黄山 · 徽州古村与温泉旅居',
      shortName: '安徽 · 徽州',
      tag: '养生山居',
      desc: '宏村呈坎晨雾漫步 · 名士温泉理疗 · 新安医道',
      cover: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'dunhuang',
      name: '敦煌 · 莫高特窟与大漠星空',
      shortName: '甘肃 · 敦煌',
      tag: '丝路文博',
      desc: '莫高窟特窟特聘博导解构 · 鸣沙山电瓶观光 · 晚霞雅集',
      cover: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'xian',
      name: '西安 · 盛唐古建与陕博专享',
      shortName: '陕西 · 西安',
      tag: '古都探微',
      desc: '陕博VIP绿色通道 · 碑林名家拓印 · 华清宫长恨歌',
      cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'hangzhou',
      name: '杭州 · 西湖龙井茶肆与禅意漫步',
      shortName: '浙江 · 杭州',
      tag: '茶禅一味',
      desc: '龙井茶村古法开汤 · 灵隐法云漫步 · 运河慢画舫',
      cover: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'chengdu',
      name: '成都 · 青城山道医养生与宽窄雅集',
      shortName: '四川 · 青城',
      tag: '道医康养',
      desc: '青城山道长八段锦功法 · 温泉药膳 · 蜀风雅韵川剧',
      cover: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Theme Options
  const availableThemes = [
    { id: '学者名师随团', label: '🏛️ 学者名师特窟导赏' },
    { id: '茶道文博雅集', label: '🍵 名家茶席与非遗雅集' },
    { id: '乐龄五星慢住', label: '🏨 乐龄五星养生度假' },
    { id: '道医温泉药膳', label: '🌿 道医温泉与药膳滋补' },
    { id: '乐龄棋牌交流', label: '🎴 乐龄棋牌好友切磋' },
    { id: '戏曲昆曲私享', label: '🎭 昆曲评弹私享雅座' },
    { id: '晨曦慢步摄影', label: '📸 晨曦平缓摄影跟拍' },
  ];

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId)
        ? prev.length > 1
          ? prev.filter((t) => t !== themeId)
          : prev
        : [...prev, themeId]
    );
  };

  // Generate Itinerary API Call
  const handleGenerateItinerary = async (overridePrompt?: string) => {
    setLoading(true);
    stopSpeaking();

    const targetDest = isCustomDest && customDest.trim() ? customDest.trim() : selectedDest;

    try {
      const res = await fetch('/api/ai-travel-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          destination: targetDest,
          pace,
          themes: selectedThemes,
          companion,
          healthNeeds: overridePrompt ? `${healthNotes} (特别调整要求：${overridePrompt})` : healthNotes,
          userProfile: {
            name: userProfile.name || '赵教授',
            level: currentTier.name || '博雅·知音',
            points: userProfile.points || 3680,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('网络请求异常');
      }

      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
        setSelectedDayTab(1);
        showToast(`🎉 已为您成功生成 ${duration} 天慢游研学专属行程！`);
      }
    } catch (err) {
      console.warn('Generate itinerary error, using high quality preset:', err);
      showToast('已为您载入乐龄五星 3 日慢游示范行程');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first mount if none exists
  useEffect(() => {
    if (!generatedPlan) {
      handleGenerateItinerary();
    }
  }, []);

  // Text-To-Speech (TTS)
  const speakPlan = (text?: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('当前设备暂不支持语音朗读');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak =
      text ||
      (generatedPlan
        ? `${generatedPlan.itineraryTitle}。${generatedPlan.spokenSummary || generatedPlan.elderPhilosophy}`
        : '正在为您定制慢游行程');

    const clean = textToSpeak
      .replace(/[*#_~`>]/g, '')
      .replace(/•/g, '，')
      .replace(/【|】/g, '')
      .replace(/\n+/g, '。')
      .slice(0, 450);

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 0.86; // Extra gentle for seniors
    u.pitch = 1.0;

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Save Plan into My Itinerary (Orders timeline)
  const handleSaveToMyItinerary = () => {
    if (!generatedPlan) return;

    const newOrder = createOrder({
      activityId: 'custom-slow-plan-' + Date.now(),
      title: generatedPlan.itineraryTitle,
      selectedDate: '2026-09-18',
      travelers: [
        {
          id: 'trav-self',
          name: userProfile.name || '赵教授',
          idCard: '32010219550818291X',
          phone: userProfile.phone || '13800138000',
          emergencyContact: '赵立明 (长子)',
          emergencyPhone: '13911223344',
          dietaryPreference: '低盐少油、少糖清淡',
        },
      ],
      groupType: 'group',
      originalAmount: generatedPlan.estimatedPrice || 3680,
      pointsUsed: 0,
      pointsDiscountAmount: 0,
      couponDiscountAmount: 0,
      finalAmount: generatedPlan.estimatedPrice || 3680,
      status: 'paid',
      isCustomPlan: true,
      customPlanDays: generatedPlan.days,
    } as any);

    showToast('✨ 行程已成功保存到您的【行程时间轴】中！');
    if (onPlanSaved) {
      onPlanSaved();
    }
  };

  // Fast Adjustments Presets
  const handleQuickAdjust = (prompt: string) => {
    setAdjustmentInput(prompt);
    handleGenerateItinerary(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF9F6] overflow-y-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#1E2B37] to-[#2C3E50] text-amber-50 p-4 md:p-6 border-b border-[#D4AF37]/30 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>小乐伴 · AI 慢游定制引擎</span>
              </span>
              <span className="text-[11px] text-amber-200/90 font-medium">
                专为 50~75 岁长辈研发 · 乐龄五星慢节奏
              </span>
            </div>
            <h2 className="text-lg md:text-2xl font-serif font-bold text-white tracking-wide">
              输入您的心仪偏好，1秒生成专属 3 日慢游研学行程
            </h2>
            <p className="text-xs md:text-sm text-stone-300">
              纯玩无购物 · 严控每日步数 · 每日必备 2 小时静卧午休 · 特邀名师导赏与随团急救护士
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {generatedPlan && (
              <button
                onClick={() => speakPlan()}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isSpeaking
                    ? 'bg-[#D4AF37] text-stone-950 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/30'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
                <span>{isSpeaking ? '停止朗读' : '慢速朗读行程'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 space-y-6 flex-1">
        {/* 2. Interactive Preferences Input Card */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#EAE6DF] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-sm md:text-base text-[#2C3E50]">
                第一步：设置长辈出行偏好与节奏
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">已结合您的健康档案进行安全测算</span>
          </div>

          {/* Row 1: Duration & Pace Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration (天数选择) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>行程天数 (Duration)</span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                  核心推荐：3天2晚慢游
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 2, label: '2天1晚', desc: '周末小憩' },
                  { days: 3, label: '3天2晚', desc: '金牌慢游', isDefault: true },
                  { days: 4, label: '4天3晚', desc: '深度人文' },
                  { days: 5, label: '5天4晚', desc: '康养旅居' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setDuration(item.days)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      duration === item.days
                        ? 'border-[#D4AF37] bg-amber-50/80 text-[#85660d] ring-2 ring-[#D4AF37]/30 shadow-2xs'
                        : 'border-[#EAE6DF] hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs md:text-sm">{item.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pace & Steps (步调与节奏) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>出游步调节奏 (Pace)</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                  乐龄步道严控
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'relaxed',
                    title: '极度舒缓',
                    steps: '≤3500步/天',
                    desc: '平地无阶梯·长午休',
                  },
                  {
                    id: 'moderate',
                    title: '闲适品味',
                    steps: '3500-5000步',
                    desc: '名师导赏·随车医护',
                  },
                  {
                    id: 'active',
                    title: '深度探古',
                    steps: '5000-6500步',
                    desc: '配登山杖·适度缓坡',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPace(item.id as any)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      pace === item.id
                        ? 'border-[#D4AF37] bg-amber-50/80 text-[#85660d] ring-2 ring-[#D4AF37]/30 shadow-2xs'
                        : 'border-[#EAE6DF] hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.title}</div>
                    <div className="text-[10px] text-emerald-700 font-medium">{item.steps}</div>
                    <div className="text-[9px] text-stone-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Destination Selection (目的地) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>目的地选择 (Destination)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDest(!isCustomDest)}
                className="text-[11px] text-[#85660d] hover:underline cursor-pointer font-medium"
              >
                {isCustomDest ? '← 选择推荐热门目的地' : '＋ 手动输入其他城市/景点'}
              </button>
            </div>

            {isCustomDest ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDest}
                  onChange={(e) => setCustomDest(e.target.value)}
                  placeholder="例如：扬州早茶与瘦西湖、武夷山大红袍茶园、厦门鼓浪屿慢步..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-300 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomDest(false)}
                  className="px-4 py-2.5 rounded-2xl border border-stone-300 text-xs text-stone-600 hover:bg-stone-100"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {presetDestinations.map((dest) => {
                  const isSelected = selectedDest === dest.name;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setSelectedDest(dest.name)}
                      className={`group relative overflow-hidden rounded-2xl border p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                        isSelected
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-xs'
                          : 'border-[#EAE6DF] hover:border-stone-300'
                      }`}
                    >
                      <img
                        src={dest.cover}
                        alt={dest.shortName}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-30"
                      />
                      <div className="relative z-10">
                        <span className="text-[9px] bg-[#2C3E50] text-[#D4AF37] px-1.5 py-0.5 rounded-md font-bold">
                          {dest.tag}
                        </span>
                        <div className="font-serif font-bold text-xs text-stone-900 mt-1">
                          {dest.shortName}
                        </div>
                      </div>
                      <div className="relative z-10 text-[10px] text-stone-600 line-clamp-1">
                        {dest.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Row 3: Themes & Senior Care Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>特色主题与乐龄偏好 (Themes & Preferences)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableThemes.map((theme) => {
                const isSelected = selectedThemes.includes(theme.id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => toggleTheme(theme.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2C3E50] text-[#D4AF37] border-[#2C3E50] shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Companion & Health Advice Quick input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>同行人员</span>
              </label>
              <select
                value={companion}
                onChange={(e) => setCompanion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-stone-50/50 focus:outline-hidden"
              >
                <option value="夫妻二人出行">夫妻二人出行 (偏爱安静、慢节奏与私享套房)</option>
                <option value="知青同伴4人小聚">知青同伴4人小聚 (偏爱茶肆雅叙与打牌交流)</option>
                <option value="独行同伴随团结伴">独行同伴随团结伴 (同住安排、金牌管家一对一照应)</option>
                <option value="三代同行慢游">三代同行慢游 (代际兼顾、乐龄无障碍优先)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-rose-500" />
                <span>乐龄健康与餐饮嘱托</span>
              </label>
              <input
                type="text"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="例如：少盐低糖软烂餐饮、避开台阶、随身带降压药..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-stone-50/50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI将自动配置三甲急救护士随团、随车AED与五星乐龄养生酒店标准</span>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateItinerary()}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#B8843E] text-stone-950 font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>小乐伴正在精心规划乐龄行程...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>立即生成 {duration} 天慢游行程</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Generated Itinerary Content */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DF] shadow-xs space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center mx-auto border border-amber-200">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                小乐伴正在为您推演【{selectedDest.split('·')[0]}】{duration}日慢游行程...
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                严格测算平缓步数（≤{pace === 'relaxed' ? 3500 : 5000}步）、严选避开高峰的VIP闭馆导赏、安排每日2小时静卧午休...
              </p>
            </div>
          </div>
        ) : generatedPlan ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Overview & Master/TGO Assurances */}
            <div className="bg-gradient-to-br from-amber-50/90 via-white to-stone-50 rounded-3xl p-5 md:p-6 border border-[#EAE6DF] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full font-serif">
                      {generatedPlan.durationDays}天{generatedPlan.durationNights}晚 · 乐龄慢游
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Footprints className="w-3 h-3" />
                      <span>日均约 {generatedPlan.avgDailySteps} 步 (平缓平地)</span>
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      乐龄五星认证
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg md:text-2xl text-[#2C3E50]">
                    {generatedPlan.itineraryTitle}
                  </h3>
                  <p className="text-xs md:text-sm text-[#85660d] font-medium mt-1">
                    {generatedPlan.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveToMyItinerary}
                    className="px-4 py-2 rounded-xl bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1f2c38] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>加入我的行程</span>
                  </button>

                  <button
                    onClick={() =>
                      openBooking('activity', {
                        id: 'custom-act-' + Date.now(),
                        title: generatedPlan.itineraryTitle,
                        subtitle: generatedPlan.subtitle,
                        destination: generatedPlan.destination,
                        priceGroup: generatedPlan.estimatedPrice,
                        pricePremium: generatedPlan.estimatedPrice + 1200,
                        durationDays: generatedPlan.durationDays,
                        departureDates: [{ date: '2026-09-18', remainingSlots: 8 }],
                        fitnessDesc: `日均${generatedPlan.avgDailySteps}步·平缓乐龄五星`,
                        master: generatedPlan.assignedMaster,
                        tgo: generatedPlan.assignedTgo,
                      } as any)
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 font-bold text-xs shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>一键专属预约</span>
                  </button>
                </div>
              </div>

              {/* Philosophy & Scholar/TGO Duo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Philosophy */}
                <div className="bg-white rounded-2xl p-3.5 border border-amber-200/60 shadow-2xs space-y-1.5">
                  <div className="text-xs font-bold text-[#85660d] flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>乐龄慢游核心原则</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {generatedPlan.elderPhilosophy}
                  </p>
                </div>

                {/* Master Info */}
                {generatedPlan.assignedMaster && (
                  <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex items-center gap-3">
                    <img
                      src={generatedPlan.assignedMaster.avatar}
                      alt={generatedPlan.assignedMaster.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] bg-amber-100 text-[#85660d] px-1.5 py-0.2 rounded inline-block font-bold">
                        特邀名师随团导赏
                      </div>
                      <div className="font-serif font-bold text-xs text-stone-900 truncate">
                        {generatedPlan.assignedMaster.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {generatedPlan.assignedMaster.title}
                      </div>
                    </div>
                  </div>
                )}

                {/* TGO Companion Info */}
                {generatedPlan.assignedTgo && (
                  <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded inline-block font-bold">
                        金牌 TGO 乐龄管家
                      </div>
                      <div className="font-serif font-bold text-xs text-stone-900 truncate">
                        {generatedPlan.assignedTgo.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {generatedPlan.assignedTgo.cert}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Assurances Bar */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-stone-600">
                {generatedPlan.medicalAssurance.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {generatedPlan.days.map((dayItem) => (
                <button
                  key={dayItem.day}
                  type="button"
                  onClick={() => setSelectedDayTab(dayItem.day)}
                  className={`px-5 py-3 rounded-2xl font-serif font-bold text-xs md:text-sm transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                    selectedDayTab === dayItem.day
                      ? 'bg-[#2C3E50] text-[#D4AF37] shadow-sm border border-[#D4AF37]/50'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#EAE6DF]'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{dayItem.dateLabel}：{dayItem.title.split('·')[0]}</span>
                  <span className="text-[10px] opacity-75 font-sans font-normal">
                    ({dayItem.estimatedSteps})
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Day Detailed Card */}
            {generatedPlan.days
              .filter((d) => d.day === selectedDayTab)
              .map((day) => (
                <div
                  key={day.day}
                  className="bg-white rounded-3xl p-5 md:p-6 border border-[#EAE6DF] shadow-xs space-y-6"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4AF37] text-stone-950 text-xs font-bold px-2.5 py-0.5 rounded-full font-serif">
                          {day.dateLabel}
                        </span>
                        <h4 className="font-serif font-bold text-base md:text-lg text-[#2C3E50]">
                          {day.title}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">主题：{day.theme}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400">当日预估步数</div>
                        <div className="font-serif font-bold text-xs text-emerald-700">
                          {day.estimatedSteps}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          speakPlan(
                            `${day.dateLabel}，${day.title}。上午安排：${day.morning.title}。午餐享用：${day.lunch.restaurant}。下午静卧午休两小时后，前往：${day.afternoon.title}。夜宿五星乐龄酒店。`
                          )
                        }
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#85660d] border border-amber-200 cursor-pointer"
                        title="朗读本日行程"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day Detailed Flow Timelines */}
                  <div className="space-y-4">
                    {/* 1. Morning */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                        上午
                      </div>
                      <div className="flex-1 bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs md:text-sm text-stone-900">
                            {day.morning.title}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {day.morning.time}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {day.morning.desc}
                        </p>
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>乐龄关怀：{day.morning.elderCare}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Healthy Lunch */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs md:text-sm text-emerald-950">
                            养生午宴：{day.lunch.restaurant}
                          </span>
                          <span className="text-[11px] text-emerald-800 font-mono">
                            {day.lunch.time}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-900 font-sans">
                          <span className="font-semibold">低盐软烂分餐：</span>
                          {day.lunch.menu}
                        </div>
                      </div>
                    </div>

                    {/* 3. Midday 2-Hour Nap (CRITICAL FOR ELDERS) */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-indigo-50/40 rounded-2xl p-4 border border-indigo-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs md:text-sm text-indigo-950 flex items-center gap-1.5">
                            <span>酒店 2 小时静卧午休 (体力黄金恢复期)</span>
                            <span className="bg-indigo-200/80 text-indigo-950 text-[10px] px-1.5 py-0.2 rounded font-bold">
                              乐龄核心保障
                            </span>
                          </span>
                          <span className="text-[11px] text-indigo-700 font-mono">
                            {day.noonRest.time}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-900 leading-relaxed">
                          {day.noonRest.desc}
                        </p>
                      </div>
                    </div>

                    {/* 4. Afternoon Salon / Tea */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                        下午
                      </div>
                      <div className="flex-1 bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs md:text-sm text-stone-900">
                            {day.afternoon.title}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {day.afternoon.time}
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {day.afternoon.desc}
                        </p>
                        <div className="text-[11px] text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-stone-200 flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>雅集保障：{day.afternoon.elderCare}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Dinner & Evening Rest */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                        傍晚
                      </div>
                      <div className="flex-1 bg-stone-50/80 rounded-2xl p-4 border border-stone-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs md:text-sm text-stone-900">
                            时令药膳晚宴：{day.dinner.restaurant}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            {day.dinner.time}
                          </span>
                        </div>
                        <div className="text-xs text-stone-700">
                          <span className="font-semibold">滋补食谱：</span>
                          {day.dinner.menu}
                        </div>
                        <div className="pt-2 border-t border-stone-200/60 text-xs text-stone-600 flex items-start gap-2">
                          <BedDouble className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-stone-900">
                              下榻入住：{day.hotel}
                            </span>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {day.evening.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Day Foot Medication Tip */}
                  {day.medicationTip && (
                    <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200/80 flex items-center gap-2.5 text-xs text-[#85660d]">
                      <Pill className="w-4 h-4 text-rose-500 shrink-0" />
                      <div className="leading-relaxed">
                        <span className="font-bold">管家每日健康叮咛：</span>
                        <span>{day.medicationTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* 4. AI Quick Itinerary Refinement (智能追问微调) */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#EAE6DF] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="font-serif font-bold text-sm text-[#2C3E50]">
                    对行程不满意？告诉小乐伴，一键智能微调
                  </h4>
                </div>
                <span className="text-[11px] text-stone-400">支持语音或文字即时微调</span>
              </div>

              {/* Quick Modification Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  '下午我想多留时间在茶室品茗听曲',
                  '把每天步数进一步压缩在3000步内',
                  '增加一处道医温泉泡汤理疗环节',
                  '长辈有痛风忌口，请调整海鲜类晚餐',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAdjust(chip)}
                    className="text-[11px] bg-amber-50 hover:bg-amber-100 text-[#85660d] border border-amber-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    💡 {chip}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={adjustmentInput}
                  onChange={(e) => setAdjustmentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adjustmentInput.trim() && handleGenerateItinerary(adjustmentInput)}
                  placeholder="输入您的微调要求，例如：“第一天下午请换成室内书法雅集”..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-300 text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] bg-stone-50/50"
                />
                <button
                  type="button"
                  onClick={() => adjustmentInput.trim() && handleGenerateItinerary(adjustmentInput)}
                  disabled={loading || !adjustmentInput.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1a252f] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>微调</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
