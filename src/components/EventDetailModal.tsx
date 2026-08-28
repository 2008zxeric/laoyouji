import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Award,
  Users,
  Trophy,
  Share2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ShieldAlert,
  HeartPulse,
  Stethoscope,
  Coffee,
  Sparkles,
  Layers,
  User,
  Image as ImageIcon,
  Bot,
  Volume2,
  VolumeX,
  Send,
  Heart,
  FileText,
  Clock,
  Activity as ActivityIcon,
  Sparkle,
  Compass,
  AlertCircle,
  HelpCircle,
  Phone,
  Flame,
} from 'lucide-react';
import { TournamentEvent } from '../types';
import { useApp } from '../context/AppContext';

interface EventDetailModalProps {
  event: TournamentEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const { openBooking, showToast, userProfile, toggleFavorite, isFavorited, openPoster } = useApp();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'schedule' | 'prizes' | 'medical' | 'rules' | 'referee' | 'leisure'>('schedule');

  // AI QA States
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{
    answer: string;
    spokenText?: string;
    suitabilityScore?: number;
    comfortTips?: string[];
  } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!event) return null;

  const isFav = isFavorited(event.id || '');

  // 1. Safe Fallbacks for all fields
  const title = event.title || '乐龄文体交流大师赛';
  const subtitle = event.subtitle || '国家级裁判执裁 · 适老慢节奏竞技 · 温泉康养与积分双重礼遇';
  const code = event.code || 'EVT-2026-001';
  const category = event.category || '智力竞技';
  const city = event.city || '全国';
  const venue = event.venue || '五星国宾温泉酒店国际会议中心';
  const startDate = event.startDate || '2026-10-18';
  const endDate = event.endDate || '2026-10-21';
  const registrationDeadline = event.registrationDeadline || '2026-10-10';
  const registrationFee = event.registrationFee || 2280;
  const registeredTeams = event.registeredTeams || 0;
  const maxTeams = event.maxTeams || 60;
  const percentFull = Math.min(100, Math.round((registeredTeams / (maxTeams || 1)) * 100));

  const cover = event.cover || 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80';
  const images = (event.images && event.images.length > 0)
    ? event.images
    : [
        cover,
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
      ];
  const activeImage = images[selectedImageIdx] || cover;

  // Safe Prize Pool
  const prizePool = {
    first: event.prizePool?.first || '冠军文旅基金 10,000 元 + 纯金大师奖章 + 10,000 名仕积分',
    second: event.prizePool?.second || '亚军文旅基金 6,000 元 + 纯银勋章 + 6,000 名仕积分',
    third: event.prizePool?.third || '季军文旅基金 3,000 元 + 铜奖勋章 + 3,000 名仕积分',
    participation: event.prizePool?.participation || '✨ 全员尊享定制老友伴手礼盒 + 国家裁判签章纪念证书 + 1,000 积分',
    points: event.prizePool?.points || 50000,
    honors: event.prizePool?.honors || [
      '全国老友竞技大师荣誉称号',
      '四季游年度名人堂终身入选名录',
      '五星国宾温泉终身VIP尊享特权',
    ],
  };

  // Safe Referee
  const referee = event.referee || {
    name: '特邀国家级裁判长',
    title: '文体赛事高级技术顾问 / 国家级裁判员',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    intro: '执裁全国大型文体及智力竞技赛事数十场，秉持公平公正与乐龄适老关怀准则。',
    badge: '国家级执裁',
  };

  // Safe Schedule
  const scheduleList = (event.schedule && event.schedule.length > 0)
    ? event.schedule
    : [
        { time: '第一天 14:00-18:00', title: '签到入住 · 适老健康建档与温泉洗尘', desc: '入住五星温泉度假酒店，专人测量血压脉搏，领取参赛秩序册与定制战袍，晚间举行开幕欢迎晚宴与抽签仪式。' },
        { time: '第二天 09:00-10:20', title: '小组积分循环预选赛（第1-2轮）', desc: '采用积分编排制，节奏适中，单场限时40分钟，避免长辈久坐疲劳。' },
        { time: '第二天 10:20-10:50', title: '🍵 适老养生茶歇与颈椎放松操', desc: '全员暂停比赛，提供热枸杞红枣茶与无糖能量点心，专业理疗师带练八段锦颈椎操。', isRestBreak: true },
        { time: '第二天 10:50-12:00', title: '小组循环预选赛（第3轮）', desc: '角逐晋级名额，午间享用徽派温润清淡养生宴并安排1.5小时舒心午休。' },
        { time: '第二天 14:30-17:30', title: '大师晋级晋阶轮（第4-5轮）', desc: '决出全国十六强，晚上安排天然温泉慢泡理疗，消除脑力疲劳。' },
        { time: '第三天 09:00-12:00', title: '八强半决赛与总决赛巅峰对决', desc: '裁判长全程大屏幕现场复盘，冠亚季军决战。' },
        { time: '第三天 14:30-17:00', title: '胜景平步慢游与名家茶会', desc: '平缓电瓶车游览当地名胜园林，举办结友品茗会。' },
        { time: '第三天 18:30-21:00', title: '颁奖盛典 · 庆功荣耀晚宴', desc: '颁发纯金奖章、荣誉证书、文旅基金，全员举杯欢庆老友情谊。' },
        { time: '第四天 08:30-11:30', title: '满载荣耀 · 专车返程', desc: '专车护送至高铁站/机场，相约下届再聚。' },
      ];

  // Safe Medical Assurance Parser
  const parseMedicalAssurance = () => {
    if (!event.medicalAssurance) {
      return [
        { label: '现场 AED 急救配置', desc: '赛场驻守 2 台便携式 AED 心脏除颤仪与持证三甲急救护士全程巡场', icon: Stethoscope },
        { label: '赛前健康体测', desc: '赛前专人免费测量血压、脉搏与血氧饱和度，建立参赛健康档案', icon: HeartPulse },
        { label: '适老护腰工学座椅', desc: '比赛场地全场配备加厚记忆棉护腰静音软椅与绿色无障碍平缓通道', icon: ShieldCheck },
        { label: '全天温热茶歇补给', desc: '常设罗汉果茶、枸杞菊花温热养生茶饮站与无糖粗粮低卡能量点心', icon: Coffee },
        { label: '慢节奏防久坐调息', desc: '每日赛程严格限制在 2.5 小时内，每轮设 20 分钟强制茶歇与颈椎放松操', icon: HeartHandshake },
        { label: '三甲医院绿色救援', desc: '与属地三甲医院建立 20 分钟紧急就医绿色通道，救护车随时联动', icon: ActivityIcon },
      ];
    }

    if (typeof event.medicalAssurance === 'object' && !Array.isArray(event.medicalAssurance)) {
      const med = event.medicalAssurance as any;
      const list = [];
      if (med.hasAed || med.hasDoctor) {
        list.push({ label: 'AED 与持证医护随守', desc: '配备专业 AED 便携除颤仪与随队三甲急救医护人员全程保障', icon: Stethoscope });
      }
      if (med.preExam) {
        list.push({ label: '赛前适老体检', desc: String(med.preExam), icon: HeartPulse });
      }
      if (med.comfortSeats) {
        list.push({ label: '护腰软座无障碍', desc: String(med.comfortSeats), icon: ShieldCheck });
      }
      if (med.teaStation) {
        list.push({ label: '温热养生茶饮站', desc: String(med.teaStation), icon: Coffee });
      }
      if (med.greenChannel) {
        list.push({ label: '急救绿色通道', desc: String(med.greenChannel), icon: ActivityIcon });
      }
      if (list.length > 0) return list;
    }

    if (Array.isArray(event.medicalAssurance)) {
      return event.medicalAssurance.map((item, idx) => ({
        label: `适老保障 0${idx + 1}`,
        desc: String(item),
        icon: ShieldCheck,
      }));
    }

    return [
      { label: '适老医护全保障', desc: String(event.medicalAssurance), icon: ShieldCheck },
    ];
  };

  const medicalList = parseMedicalAssurance();

  // Safe Rules
  const rulesList = (Array.isArray(event.rules) && event.rules.length > 0)
    ? event.rules
    : [
        '比赛遵循国家竞技最新竞赛规则与适老关怀公约，采用限时限副积分编排制。',
        '参赛者年龄建议在 50-75 周岁之间，身心健康，品行端正。',
        '提倡“友谊第一、以牌/体悟道、文明对弈”，严禁任何形式的违规暗号或不文明言辞。',
        '单人报名者可由组委会根据水平与地域智能匹配实力相当的乐龄搭档。',
      ];

  // Safe Health Declaration
  const healthDeclarationList = (Array.isArray(event.healthDeclaration) && event.healthDeclaration.length > 0)
    ? event.healthDeclaration
    : [
        '参赛老友确认自身无严重未受控高血压、不稳定型心绞痛等突发性重症。',
        '比赛全程坚持“心态平和、重在文娱”，严禁任何涉及现金等私下违规交易。',
        '现场如有任何身体不适，可随时向巡场全科医护示意暂停比赛或在休息区吸氧调息。',
      ];

  // Safe Perks
  const perksList = (Array.isArray(event.perks) && event.perks.length > 0)
    ? event.perks
    : [
        '包含五星国宾温泉度假酒店 3 晚豪华客房（双人标间，含温泉私汤畅泡）',
        '全程包含 6 顿特色名师养生正餐与 3 顿自助养生早餐',
        '赠送定制专业比赛用具一套 + 国家级裁判签章荣誉证书',
        '随队持证医护人员全程测量血压，全天候保障赛事舒适安全',
        '赠送保额 100 万元乐龄境内人身意外及突发急性病医疗保险',
      ];

  // Safe Leisure Extension
  const leisureExtension = event.leisureExtension || {
    title: '五星温泉慢调康养延展包',
    desc: '比赛结束后可自选延住 2 晚，享受新安江生态游船与徽派私房养生药膳调理',
    packagePrice: 880,
    highlights: ['国宾温泉私汤独享', '古村落平步漫赏摄影', '老专家一对一中医体质调理'],
  };

  const quickEventQuestions = [
    { label: '🎴 比赛对弈节奏与久坐放松', q: '请问本赛事的对弈轮次与单场时长如何？赛间有无站立舒展和茶歇安排？' },
    { label: '🚑 现场医疗急救与AED配置', q: '赛事现场有无持证急救医护与便携AED除颤仪？高血压长辈参赛有何监护？' },
    { label: '🏆 积分与奖金如何发放？', q: '请问本赛事的奖励规则如何？获胜积分如何入账并用于兑换研学？' },
    { label: '♨️ 赛事配套养生与住宿', q: '请问赛事包含的度假酒店、温泉理疗与养生餐饮标准如何？' },
  ];

  const handleAskAi = async (customQ?: string) => {
    const q = (customQ || aiQuestion).trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/ai-activity-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle: title,
          destination: `${city} · ${venue}`,
          durationDays: 4,
          fitnessDesc: '乐龄智力/文体竞赛，每轮40-50分钟，中途含健康茶歇',
          masterName: referee.name,
          tgoName: '金牌赛事管家',
          question: q,
          userProfile,
          isEvent: true,
        }),
      });

      if (!res.ok) throw new Error('网络异常');
      const data = await res.json();
      setAiAnswer({
        answer: data.answer,
        spokenText: data.spokenText,
        suitabilityScore: data.suitabilityScore || 98,
        comfortTips: data.comfortTips,
      });
      setAiQuestion('');
    } catch {
      setAiAnswer({
        answer: `尊敬的${userProfile.name || '名仕老友'}，针对《${title}》：现场严格执行适老健康竞技标准，设单场限时与20分钟强制茶歇，现场驻守三甲急救护士与AED除颤仪，并全天供应温热养生茶饮，非常适合长辈尽情切磋对弈！`,
        spokenText: `现场配有专业急救护士与AED除颤仪，每场对弈间隙安排养生茶歇，长辈可以安心参赛交流！`,
        suitabilityScore: 98,
        comfortTips: ['对弈间隙多站立眺望', '随身备好降压温开水', '赛后享受温泉水疗放松'],
      });
    } finally {
      setAiLoading(false);
    }
  };

  const speakAiText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('当前浏览器暂不支持语音播报');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`~]/g, '').replace(/\n+/g, '，');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 0.88;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('赛事简章链接已复制，可直接发送至长辈微信群邀约搭档');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'registration':
        return { text: '🟢 火热报名中', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'draft':
        return { text: '🟡 待发布 (审核中)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ongoing':
        return { text: '🔵 比赛对弈中', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'expired':
        return { text: '⚪ 已完赛 (回顾档案)', bg: 'bg-stone-200 text-stone-700 border-stone-300' };
      case 'offline':
        return { text: '🔴 已下架', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { text: '🟢 报名中', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const statusInfo = getStatusBadge(event.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white w-full h-full md:h-[92vh] md:max-w-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-[#EAE6DF]">
        {/* Sticky Header Top Action Bar */}
        <div className="shrink-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#EAE6DF] flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}>
              {statusInfo.text}
            </span>
            <span className="text-xs text-stone-500 font-mono font-bold hidden sm:inline">
              {code}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => openPoster(event)}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-[#D4AF37] transition-colors cursor-pointer"
              title="生成专属赛事分享海报"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(event.id)}
              className={`p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer ${
                isFav ? 'text-rose-500' : 'text-stone-600 hover:text-rose-400'
              }`}
              title="收藏赛事"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-stone-50/40 space-y-4">
          {/* Hero Cover & Gallery */}
          <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
            <img src={activeImage} alt={title} className="w-full h-full object-cover transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                {category}
              </span>
              {event.productTheme && (
                <span className="bg-amber-900/80 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/40">
                  {event.productTheme}主题 · {event.productCarrier || '赛事课堂'}
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-1.5 text-xs text-amber-200 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{city}</span>
                <span>·</span>
                <span>{venue}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold leading-snug drop-shadow-md text-[#FAF9F6]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-stone-300 mt-1 line-clamp-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Photos Thumbnail Switcher */}
          {images.length > 1 && (
            <div className="px-4 flex items-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-[#85660d] scale-105 shadow-sm' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 3.1 Framework Dimension Tags */}
          <div className="mx-4 p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#85660d] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>3.1产品架构：</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
              主题: {event.productTheme || '体育/文娱'}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-medium">
              形式: {event.productForm || '社交'}
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium">
              载体: {event.productCarrier || '赛事课堂'}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-medium">
              跨度: {event.timeLevel || 'L2 (3~4天)'}
            </span>
            {event.creator && (
              <span className="ml-auto text-[11px] text-stone-500 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                <span>录入发布：{event.creator}</span>
              </span>
            )}
          </div>

          {/* AI SENIOR TOURNAMENT ADVISOR (小老友 · 赛事健康与参赛评估) */}
          <div className="mx-4 p-4 bg-gradient-to-br from-amber-50/90 via-white to-stone-50 rounded-3xl border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif font-bold text-xs md:text-sm text-[#2C3E50] flex items-center gap-1.5">
                    <span>小老友 · 赛事适老健康与赛制顾问</span>
                    <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">
                      智能赛程答疑
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    久坐放松、医疗AED守护、积分奖励规则快速查询
                  </div>
                </div>
              </div>

              {aiAnswer?.suitabilityScore && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-stone-500">适老安全度</div>
                  <div className="font-serif font-bold text-sm text-emerald-700">
                    {aiAnswer.suitabilityScore}% 安全
                  </div>
                </div>
              )}
            </div>

            {/* Quick Preset Tournament Questions */}
            <div className="flex flex-wrap gap-1.5">
              {quickEventQuestions.map((qItem, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAi(qItem.q)}
                  disabled={aiLoading}
                  className="bg-white hover:bg-amber-50 text-stone-700 hover:text-[#2C3E50] text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-[#D4AF37]/60 shadow-2xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>{qItem.label}</span>
                </button>
              ))}
            </div>

            {/* AI Answer Box */}
            {aiLoading ? (
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs flex items-center gap-2 text-xs text-stone-600 animate-pulse">
                <Bot className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                <span className="font-medium">小老友正在为您查询赛事急救医护与适老赛程节奏...</span>
              </div>
            ) : aiAnswer ? (
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-2 animate-fadeIn">
                <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {aiAnswer.answer}
                </div>

                {aiAnswer.comfortTips && aiAnswer.comfortTips.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {aiAnswer.comfortTips.map((tip, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md border border-emerald-200 font-medium"
                      >
                        ✓ {tip}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                  <span>AI 乐龄赛事保障 · 仅供参考</span>
                  {aiAnswer.spokenText && (
                    <button
                      onClick={() => speakAiText(aiAnswer.spokenText!)}
                      className="text-[#85660d] hover:text-[#5c4609] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? '停止朗读' : '慢速朗读给长辈'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="问问小老友：如搭档要求、温泉理疗服务安排？"
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#2C3E50]"
              />
              <button
                type="submit"
                disabled={!aiQuestion.trim() || aiLoading}
                className="px-3 py-2 bg-[#2C3E50] hover:bg-[#1a252f] disabled:opacity-40 text-[#D4AF37] text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer transition-transform active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>提问</span>
              </button>
            </form>
          </div>

          {/* Multi-Tab Navigation for Comprehensive Tournament Sections */}
          <div className="mx-4 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>赛程日程</span>
            </button>

            <button
              onClick={() => setActiveTab('prizes')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'prizes'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>荣誉奖池</span>
            </button>

            <button
              onClick={() => setActiveTab('medical')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'medical'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>适老医护</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>竞赛公约</span>
            </button>

            <button
              onClick={() => setActiveTab('referee')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'referee'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>特邀裁判</span>
            </button>

            <button
              onClick={() => setActiveTab('leisure')}
              className={`flex-1 min-w-[76px] py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${
                activeTab === 'leisure'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>康养延展</span>
            </button>
          </div>

          {/* TAB 1: SCHEDULE (赛程日程与每日安排) */}
          {activeTab === 'schedule' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              {/* Quick Schedule Overview Card */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                    <Calendar className="w-5 h-5 text-[#2C3E50]" />
                    <span>赛事日程与适老节律安排</span>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                    全程平缓无阶梯
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {scheduleList.map((sc: any, idx: number) => {
                    const isRest = sc.isRestBreak;
                    return (
                      <div
                        key={idx}
                        className={`text-xs rounded-xl p-3 border transition-all ${
                          isRest
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-stone-50/60 border-stone-200/80 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className={`flex items-center gap-1.5 ${isRest ? 'text-amber-900' : 'text-[#2C3E50]'}`}>
                            {isRest ? <Coffee className="w-3.5 h-3.5 text-amber-600" /> : <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />}
                            <span>{sc.time} · {sc.title}</span>
                          </span>
                          {isRest && (
                            <span className="bg-amber-200/70 text-amber-900 text-[10px] px-2 py-0.5 rounded-md">
                              适老茶歇
                            </span>
                          )}
                        </div>
                        <div className="text-stone-600 leading-relaxed pl-5">{sc.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Included Perks Overview */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] space-y-2 text-xs text-stone-700">
                <div className="font-bold text-[#2C3E50] flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>🏨 参赛服务费全含内容标准：</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {perksList.map((p: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-stone-600">
                      <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                      <span className="leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIZE POOL & HONORS (荣誉奖池与积分) */}
          {activeTab === 'prizes' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#FAF9F6] via-white to-amber-50/40 rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                    <span>健康文娱优胜表彰与全员礼遇</span>
                  </div>
                  <span className="text-xs text-[#85660d] font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    总奖池 {(prizePool.points || 50000).toLocaleString()} 积分
                  </span>
                </div>

                <div className="space-y-2.5 text-xs pt-1">
                  <div className="bg-gradient-to-r from-amber-50/90 to-white rounded-xl p-3 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                    <span className="font-bold text-[#85660d] flex items-center gap-1">
                      <span>🥇 冠军优胜荣誉：</span>
                    </span>
                    <span className="font-semibold text-[#2C3E50]">{prizePool.first}</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                    <span className="font-bold text-slate-700">🥈 亚军优胜礼遇：</span>
                    <span className="text-slate-800">{prizePool.second}</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                    <span className="font-bold text-amber-900">🥉 季军优胜礼遇：</span>
                    <span className="text-stone-800">{prizePool.third}</span>
                  </div>

                  <div className="text-xs text-stone-700 bg-amber-50/60 p-3 rounded-xl border border-amber-100 leading-relaxed">
                    🎁 <strong>参赛全员纪念礼：</strong>{prizePool.participation}
                  </div>
                </div>

                {/* Honors List */}
                {prizePool.honors && prizePool.honors.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <div className="text-xs font-bold text-[#2C3E50] mb-2 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>名仕殿堂专属荣耀特权：</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {prizePool.honors.map((h: string, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-2 border border-stone-200 text-center text-xs font-medium text-stone-700">
                          ✨ {h}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SENIOR MEDICAL & SAFETY (适老医护与急救守护) */}
          {activeTab === 'medical' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-serif font-bold text-base border-b border-emerald-200/80 pb-2">
                  <Stethoscope className="w-5 h-5 text-emerald-700" />
                  <span>乐龄赛场六重适老健康监护体系</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {medicalList.map((m: any, idx: number) => {
                    const IconComp = m.icon || ShieldCheck;
                    return (
                      <div key={idx} className="bg-white/90 rounded-2xl p-3 border border-emerald-100 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                          <IconComp className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{m.label}</span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed pl-5.5">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>贴心提示：</strong>每场对弈间歇强制安排 20 分钟站立眺望与八段锦经络舒展，随团常设温热养生茶饮，让长辈在身心愉悦中结交益友！
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOURNAMENT RULES & CODE OF CONDUCT (竞赛规则与公约) */}
          {activeTab === 'rules' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base border-b border-stone-100 pb-2">
                  <ShieldAlert className="w-5 h-5 text-[#2C3E50]" />
                  <span>比赛规则与适老文明对弈公约</span>
                </div>

                <div className="space-y-2 text-xs text-stone-700">
                  {rulesList.map((rule: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200">
                      <CheckCircle2 className="w-4 h-4 text-[#2C3E50] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="font-bold text-[#85660d] text-xs flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>乐龄参赛健康与知情承诺：</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600">
                    {healthDeclarationList.map((h: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-stone-400">•</span>
                        <span className="leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHIEF REFEREE & MENTORS (特邀裁判长) */}
          {activeTab === 'referee' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              <div className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={referee.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'}
                    alt={referee.name || '裁判长'}
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-sm shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-[#2C3E50] text-lg">
                        {referee.name || '特邀国家级裁判长'}
                      </span>
                      <span className="bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {referee.badge || '国家级裁判'}
                      </span>
                    </div>
                    <div className="text-xs text-[#85660d] font-semibold mt-1">
                      {referee.title || '文体赛事技术仲裁长'}
                    </div>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {referee.intro || '深耕棋牌及文体竞技执裁数十年，秉持公平公正与乐龄友谊第一准则，全程指导赛事仲裁与现场复盘讲评。'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>大师现场牌局/技艺复盘点评雅集</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    决赛结束后，裁判长将现场进行大屏幕牌局/动作复盘解析，分享高段技战术布局思路，并与老友面对面交流切磋！
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LEISURE EXTENSION (慢调康养延展包) */}
          {activeTab === 'leisure' && (
            <div className="mx-4 space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-amber-50/60 via-white to-stone-50 rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                    <Coffee className="w-5 h-5 text-[#D4AF37]" />
                    <span>{leisureExtension.title || '慢调康养延展包'}</span>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    可选自选 +¥{leisureExtension.packagePrice || 880}/人
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {leisureExtension.desc || '比赛结束后可自选延住 2 晚，享受新安江游船与徽派私房养生药膳'}
                </p>

                {leisureExtension.highlights && leisureExtension.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="font-bold text-stone-800">✨ 延展包亮点包含：</div>
                    {leisureExtension.highlights.map((hl: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-stone-600 bg-white p-2 rounded-xl border border-stone-200">
                        <span className="text-[#85660d] font-bold">✓</span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Bar */}
        <div className="shrink-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#EAE6DF] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-stone-500">
                已报 <strong className="text-[#2C3E50]">{registeredTeams}</strong> / {maxTeams} 席 ({percentFull}% 招募)
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-red-600 font-bold">¥</span>
                <span className="text-2xl font-bold font-serif text-red-600">
                  {registrationFee}
                </span>
                <span className="text-xs text-stone-500">/人 (含五星国宾住宿+全膳食)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openBooking('event', event)}
                className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-6 py-3 rounded-2xl font-bold text-sm md:text-base shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span>立即报名</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
