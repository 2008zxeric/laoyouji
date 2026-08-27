import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, TournamentEvent, Order } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Circle,
  Sparkles,
  Share2,
  Download,
  Phone,
  ShieldCheck,
  Heart,
  Footprints,
  Award,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronRight,
  ChevronDown,
  Trophy,
  Copy,
  Smartphone,
  Utensils,
  Building,
  Plus,
  Compass,
  Info,
  CalendarCheck,
  Check,
} from 'lucide-react';
import {
  CalendarEventData,
  buildIcsContent,
  shareOrDownloadIcs,
  downloadIcsFile,
} from '../utils/calendarExport';

export interface PlannedTripItem {
  id: string;
  orderId: string;
  orderNo: string;
  type: 'activity' | 'event';
  title: string;
  cover: string;
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  days: number;
  nights: number;
  travelers: { name: string; phone?: string; dietaryNote?: string; healthNote?: string }[];
  groupType?: string;
  payAmount: number;
  activityData?: Activity;
  eventData?: TournamentEvent;
  tgoContact?: {
    name: string;
    roleTitle: string;
    badge: string;
    phone: string;
    avatar?: string;
  };
  itineraryDays?: {
    day: number;
    title: string;
    theme: string;
    morning: string;
    afternoon: string;
    evening: string;
    dining: { breakfast: string; lunch: string; dinner: string };
    hotel: string;
    stepsEstimated: string;
    tips?: string;
  }[];
  eventSchedule?: {
    time: string;
    title: string;
    desc: string;
    isRestBreak?: boolean;
  }[];
  statusBadge: string;
  daysRemaining: number;
}

interface MyItineraryTimelineViewProps {
  onOpenActivity?: (activity: Activity) => void;
  onOpenEvent?: (event: TournamentEvent) => void;
  onAskAiAboutTrip?: (prompt: string) => void;
}

export const MyItineraryTimelineView: React.FC<MyItineraryTimelineViewProps> = ({
  onOpenActivity,
  onOpenEvent,
  onAskAiAboutTrip,
}) => {
  const {
    orders,
    activities,
    events,
    userProfile,
    currentTier,
    showToast,
    setSelectedActivity,
    setSelectedEvent,
    openBooking,
    isCareMode,
  } = useApp();

  // Selected trip for deep timeline view
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'activity' | 'event'>('all');
  const [showCalendarGuideModal, setShowCalendarGuideModal] = useState(false);

  // Interactive Checklist State (saved in localStorage)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lyj_itinerary_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // AI Trip Advisory Loading & Content
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvisory, setAiAdvisory] = useState<{
    weatherForecast: string;
    healthNotice: string;
    packingChecklist: string[];
    butlerGreeting: string;
  } | null>(null);

  // Map Confirmed/Paid Orders into PlannedTripItems
  const bookedTrips: PlannedTripItem[] = useMemo(() => {
    const validOrders = orders.filter(
      (o) => o.status === 'paid' || o.status === 'travelling' || o.status === 'completed'
    );

    const mapped: PlannedTripItem[] = [];

    validOrders.forEach((order) => {
      if (order.bizType === 'activity') {
        const act = activities.find((a) => a.id === order.targetId) || activities[0];
        const departureDate = order.departureDate || '2026-09-26';
        const durationDays = act?.durationDays || 5;
        const durationNights = act?.durationNights || 4;

        // Calculate return date
        const startDateObj = new Date(departureDate);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + durationDays - 1);
        const endDateStr = endDateObj.toISOString().split('T')[0];

        // Days remaining calculation
        const today = new Date();
        const diffDays = Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let statusBadge = '即将启程';
        if (diffDays <= 0 && diffDays >= -durationDays) {
          statusBadge = '慢游进行中';
        } else if (diffDays < -durationDays) {
          statusBadge = '已圆满完成';
        } else if (diffDays <= 7) {
          statusBadge = `7天内出发 (${diffDays}天后)`;
        } else {
          statusBadge = `还有 ${diffDays} 天出发`;
        }

        mapped.push({
          id: `trip-${order.id}`,
          orderId: order.id,
          orderNo: order.orderNo,
          type: 'activity',
          title: order.targetTitle || act.title,
          cover: order.targetCover || act.cover,
          destination: act.destination || '江南',
          departureCity: act.departureCity || '上海集合',
          startDate: departureDate,
          endDate: endDateStr,
          days: durationDays,
          nights: durationNights,
          travelers: order.travelers.map((t) => ({
            name: t.name,
            phone: t.phone,
            dietaryNote: t.dietaryNote,
            healthNote: t.healthNote,
          })),
          groupType: order.groupType === 'small' ? '名仕私享小团 (6-10人)' : '经典文化大团',
          payAmount: order.payAmount,
          activityData: act,
          tgoContact: {
            name: act.tgo?.name || '林曼怡 (小林管家)',
            roleTitle: act.tgo?.roleTitle || '金牌乐龄伴游管家',
            badge: act.tgo?.badge || '国家一级导游 · 红十字急救员',
            phone: act.tgo?.phone || '400-880-9966 转 801',
            avatar: act.tgo?.avatar,
          },
          itineraryDays: act.itinerary || [],
          statusBadge,
          daysRemaining: diffDays,
        });
      } else if (order.bizType === 'event') {
        const evt = events.find((e) => e.id === order.targetId) || events[0];
        const startDate = order.departureDate || evt.startDate || '2026-10-18';
        const endDate = evt.endDate || '2026-10-21';

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const durationDays = Math.max(
          1,
          Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
        );

        const today = new Date();
        const diffDays = Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let statusBadge = '赛事筹备中';
        if (diffDays <= 0 && diffDays >= -durationDays) {
          statusBadge = '赛事火热开赛中';
        } else if (diffDays < -durationDays) {
          statusBadge = '赛事已圆满收官';
        } else if (diffDays <= 7) {
          statusBadge = `7天内开赛 (${diffDays}天后)`;
        } else {
          statusBadge = `还有 ${diffDays} 天开赛`;
        }

        mapped.push({
          id: `trip-${order.id}`,
          orderId: order.id,
          orderNo: order.orderNo,
          type: 'event',
          title: order.targetTitle || evt.title,
          cover: order.targetCover || evt.cover,
          destination: evt.city || '黄山',
          departureCity: `${evt.city} · ${evt.venue || '主赛场'}`,
          startDate,
          endDate,
          days: durationDays,
          nights: Math.max(1, durationDays - 1),
          travelers: order.travelers.map((t) => ({
            name: t.name,
            phone: t.phone,
            dietaryNote: t.dietaryNote,
            healthNote: t.healthNote,
          })),
          payAmount: order.payAmount,
          eventData: evt,
          tgoContact: {
            name: '赛事会务与健康守护处',
            roleTitle: '国家级裁判与三甲急救护士组',
            badge: '双AED配置 · 绿色急救通道',
            phone: '400-880-9966 转 赛事组',
          },
          eventSchedule: evt.schedule || [
            { time: '08:30', title: '报到检录与名仕抽签', desc: '核验身份，发放纪念牌与大师证' },
            { time: '09:00', title: '赛前健康血压脉搏筛查', desc: '随团医生建立健康档案，提供温润养生茶' },
            { time: '09:30', title: '第一阶段预选积分赛', desc: '适老慢节奏对弈，配静音护腰桌椅' },
            { time: '11:30', title: '低糖养生茶歇与自由休憩', desc: '提供枸杞菊花茶与低糖点心' },
            { time: '14:00', title: '大师淘汰赛与决胜轮', desc: '争夺年度名仕常青藤大师荣誉' },
            { time: '16:30', title: '颁奖盛典与文旅合影', desc: '颁发纯金大师奖章与年度积分' },
          ],
          statusBadge,
          daysRemaining: diffDays,
        });
      }
    });

    // Sort chronologically by start date
    return mapped.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [orders, activities, events]);

  // Set default active trip when list loads or changes
  const activeTrip = useMemo(() => {
    if (selectedTripId) {
      const found = bookedTrips.find((t) => t.id === selectedTripId);
      if (found) return found;
    }
    return bookedTrips[0] || null;
  }, [bookedTrips, selectedTripId]);

  // Filtered trips list
  const filteredTrips = useMemo(() => {
    if (activeFilter === 'all') return bookedTrips;
    return bookedTrips.filter((t) => t.type === activeFilter);
  }, [bookedTrips, activeFilter]);

  // Fetch AI Advisory for the active trip
  const fetchAiTripTips = async (trip: PlannedTripItem) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-itinerary-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          days: trip.days,
          category: trip.type,
          travelers: trip.travelers,
          isEvent: trip.type === 'event',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tips) {
          setAiAdvisory(data.tips);
          showToast('已为您生成 AI 专属气温穿衣与适老备忘！');
          return;
        }
      }
      throw new Error('API request failed');
    } catch {
      // Fallback
      setAiAdvisory({
        weatherForecast: `【气候与着装】${trip.destination}出游时段常态气温约 20℃~26℃，体感舒适。建议穿防风轻薄外套、透气棉麻衬衫与防滑软底健步鞋。`,
        healthNotice: `【健康与步数建议】行程每日步数约 3,800 步，平缓石板步道无高陡台阶。随团专配 AED 与医护人员。请随身携带日常降压/降糖药品及保温杯。`,
        packingChecklist: [
          '二代身份证原件及老年优待证/退休证',
          '常备慢性病个人药品（请按出行天数额外多备3天量）',
          '防滑软底减震健步鞋与备用棉袜',
          '轻便防风外套与遮阳帽/雨伞',
          '手机充电宝、老花镜与随身保温水杯',
        ],
        butlerGreeting: `尊敬的${userProfile.name}，您的《${trip.title}》已就绪！TGO伴游管家将全程为您悉心护航，让您安心享受文化与赛事之乐。`,
      });
      showToast('已为您准备好行程贴士！');
    } finally {
      setAiLoading(false);
    }
  };

  // Toggle checklist item
  const toggleCheckItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('lyj_itinerary_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Convert PlannedTripItem to CalendarEventData
  const convertToCalendarEvent = (trip: PlannedTripItem): CalendarEventData => {
    let descLines = [
      `【老友记·出行日程通知】`,
      `行程名称：${trip.title}`,
      `出行时段：${trip.startDate} 至 ${trip.endDate} (${trip.days}天)`,
      `目的地/集合：${trip.destination} (${trip.departureCity})`,
      `同行老友：${trip.travelers.map((t) => t.name).join('、')}`,
      `服务团型：${trip.groupType || '名仕尊享'}`,
      `专属管家：${trip.tgoContact?.name} (电话: ${trip.tgoContact?.phone})`,
      `医疗保障：配备随团持证医护人员与专业 AED 除颤仪`,
      ``,
      `【每日核心节奏与安排】`,
    ];

    if (trip.type === 'activity' && trip.itineraryDays) {
      trip.itineraryDays.forEach((d) => {
        descLines.push(
          `Day ${d.day} (${d.theme})：晨间【${d.morning}】；午后【${d.afternoon}】；晚间【${d.evening}】；酒店【${d.hotel}】；适老步数【${d.stepsEstimated}】`
        );
      });
    } else if (trip.type === 'event' && trip.eventSchedule) {
      trip.eventSchedule.forEach((s) => {
        descLines.push(`${s.time} - ${s.title}：${s.desc}`);
      });
    }

    descLines.push(
      ``,
      `【行前备忘提醒】请随身带好身份证、老年优待证及日常降压/降糖慢病常备药！`
    );

    return {
      id: trip.id,
      title: `【老友记·${trip.type === 'activity' ? '慢游' : '赛事'}】${trip.title}`,
      startDate: trip.startDate,
      endDate: trip.endDate,
      startTime: '08:30',
      endTime: '18:00',
      location: `${trip.destination} · ${trip.departureCity}`,
      description: descLines.join('\n'),
    };
  };

  // Export Single Trip to Mobile System Calendar
  const handleExportSingleToCalendar = async (trip: PlannedTripItem) => {
    const calEvent = convertToCalendarEvent(trip);
    const icsString = buildIcsContent([calEvent], `老友记·${trip.title}`);
    const filename = `老友记_${trip.startDate}_${trip.destination}.ics`;

    showToast('正在调起手机系统日历...');
    const success = await shareOrDownloadIcs(filename, icsString, trip.title);

    if (success) {
      showToast('已生成日历文件！点击打开即可存入手机系统日历');
      setShowCalendarGuideModal(true);
    }
  };

  // Export ALL Booked Trips into one .ics
  const handleExportAllToCalendar = async () => {
    if (bookedTrips.length === 0) {
      showToast('您当前暂无已报名的行程');
      return;
    }

    const calEvents = bookedTrips.map(convertToCalendarEvent);
    const icsString = buildIcsContent(
      calEvents,
      `老友记·${userProfile.name}的全部出行日程`
    );
    const filename = `老友记_我的全部行程日程表.ics`;

    showToast('正在合并生成全部日程并调起系统日历...');
    const success = await shareOrDownloadIcs(
      filename,
      icsString,
      '老友记全部出行日程'
    );

    if (success) {
      showToast(`已成功打包 ${bookedTrips.length} 项行程！点击即可一次性存入日历`);
      setShowCalendarGuideModal(true);
    }
  };

  // Copy readable schedule text to clipboard
  const handleCopyScheduleText = (trip: PlannedTripItem) => {
    const calEvent = convertToCalendarEvent(trip);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(calEvent.description);
      showToast('已复制完整行程与每日时间表到剪贴板！可直接粘贴发送微信');
    } else {
      showToast('行程已准备完毕');
    }
  };

  // Helper to add sample trip if user has none
  const handleAddSampleTrip = () => {
    const sampleAct = activities[0];
    if (sampleAct) {
      openBooking('activity', sampleAct);
    }
  };

  // Standard packing checklist items
  const defaultChecklist = [
    { id: 'c1', label: '本人二代身份证原件（及老年优待证/退休证）', category: '证件随身' },
    { id: 'c2', label: '日常慢性病常用药（降压/降糖药备足5~7天量）', category: '健康药品' },
    { id: 'c3', label: '防滑减震软底健步鞋（适老平步，舒适不磨脚）', category: '穿着装备' },
    { id: 'c4', label: '早晚防风保暖轻薄外套或披肩', category: '穿着装备' },
    { id: 'c5', label: '随身保温水杯（随时饮用温开水与养生茶）', category: '生活用具' },
    { id: 'c6', label: '手机大容量便携充电宝与老花镜', category: '电子用具' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] overflow-y-auto space-y-4 p-3 md:p-5">
      {/* 1. Header Banner with Total Stats & 1-Click Batch Export to Calendar */}
      <div className="bg-gradient-to-r from-[#2C3E50] via-[#1F2E3D] to-[#2C3E50] text-white rounded-3xl p-4 md:p-6 shadow-md border border-[#D4AF37]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 rounded-full bg-[#D4AF37]"></span>
              <h2 className="font-serif font-bold text-lg md:text-xl text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#D4AF37]" />
                <span>我的行程规划 · 智能时间轴清单</span>
              </h2>
              <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs px-2.5 py-0.5 rounded-full font-medium">
                已同步已报活动与赛事
              </span>
            </div>

            <p className="text-xs text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
              尊敬的 <strong>{userProfile.name}</strong>，AI 管家已自动读取您的报名记录，为您排定精确到日的集合、游览、赛事与休养时间轴，并已配置
              <strong className="text-amber-200"> 行前1天与出发前2小时智能闹钟提醒</strong>。
            </p>
          </div>

          {/* Action Button: Batch Sync to Mobile Calendar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportAllToCalendar}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8843E] hover:from-[#e0bc46] hover:to-[#c99146] text-stone-950 font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-stone-950" />
              <span>一键同步全部行程到手机日历</span>
            </button>

            <button
              onClick={() => setShowCalendarGuideModal(true)}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 text-xs font-semibold rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#D4AF37]" />
              <span>日历添加指引</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-black/20 rounded-2xl p-2.5 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400">已报名慢游</div>
              <div className="font-serif font-bold text-sm text-white">
                {bookedTrips.filter((t) => t.type === 'activity').length} 项
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-2.5 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400">已报名赛事</div>
              <div className="font-serif font-bold text-sm text-white">
                {bookedTrips.filter((t) => t.type === 'event').length} 场
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-2.5 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400">适老医护与AED</div>
              <div className="font-serif font-bold text-sm text-emerald-300">
                100% 全程护航
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-2.5 border border-white/10 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-stone-400">尊享会员礼遇</div>
              <div className="font-serif font-bold text-sm text-amber-200">
                {currentTier.name} (免单房差)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Body: If No Bookings, Display Empty & Quick Load Sample */}
      {bookedTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#EAE6DF] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#85660d] border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
            <Calendar className="w-8 h-8 text-[#B8843E]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
              您目前暂无已确认报名的行程
            </h3>
            <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
              当您在【慢游活动】或【乐龄赛事】中完成报名后，AI 智能管家将立即在此为您生成精确到日与分时的时间轴行程清单，并提供一键导出手机日历与行前慢病备药备忘。
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleAddSampleTrip}
              className="px-5 py-2.5 bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] font-bold text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-sm transition-all border border-[#D4AF37]/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>立即体验报名并生成时间轴</span>
            </button>
          </div>
        </div>
      ) : (
        /* Has Booked Trips: Dual Column View (Chronological Timeline List + Detailed Daily Breakdown) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 Cols): Trip Chronological Selection List */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-[#EAE6DF]">
              <div className="flex items-center space-x-1">
                {[
                  { id: 'all', label: `全部 (${bookedTrips.length})` },
                  {
                    id: 'activity',
                    label: `慢游 (${bookedTrips.filter((t) => t.type === 'activity').length})`,
                  },
                  {
                    id: 'event',
                    label: `赛事 (${bookedTrips.filter((t) => t.type === 'event').length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-stone-400 pr-2">
                按时间顺序自动排定
              </span>
            </div>

            {/* Timeline Item Cards */}
            <div className="space-y-3">
              {filteredTrips.map((trip, idx) => {
                const isSelected = activeTrip?.id === trip.id;

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTripId(trip.id)}
                    className={`relative rounded-3xl p-4 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30'
                        : 'bg-white border-[#EAE6DF] hover:border-[#D4AF37]/50 shadow-2xs'
                    }`}
                  >
                    {/* Left Timeline Indicator Bar */}
                    <div
                      className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full ${
                        isSelected ? 'bg-[#D4AF37]' : 'bg-stone-300'
                      }`}
                    ></div>

                    <div className="pl-2 space-y-2.5">
                      {/* Top Badges & Countdown */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              trip.type === 'activity'
                                ? 'bg-amber-50 text-[#85660d] border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {trip.type === 'activity' ? '🏛️ 文化慢游' : '🏆 乐龄赛事'}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            {trip.startDate}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            trip.daysRemaining <= 7 && trip.daysRemaining > 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {trip.statusBadge}
                        </span>
                      </div>

                      {/* Title & Cover */}
                      <div className="flex space-x-3">
                        <img
                          src={trip.cover}
                          alt={trip.title}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-200 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#2C3E50] line-clamp-2 leading-snug">
                            {trip.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span className="truncate">{trip.destination} · {trip.days}天{trip.nights}晚</span>
                          </p>
                        </div>
                      </div>

                      {/* Travelers & Order Info */}
                      <div className="bg-[#FAF9F6] p-2.5 rounded-2xl border border-[#EAE6DF] flex items-center justify-between text-xs text-stone-600">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-[#2C3E50]" />
                          <span>同行老友：<strong>{trip.travelers.map((t) => t.name).join('、')}</strong></span>
                        </div>

                        <div className="text-[11px] text-stone-400 font-mono">
                          {trip.orderNo}
                        </div>
                      </div>

                      {/* Action Bar for Single Item */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-[#85660d] font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#B8843E]" />
                          <span>配备持证医护与AED</span>
                        </span>

                        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleExportSingleToCalendar(trip)}
                            title="添加到手机系统日历"
                            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#85660d] border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#B8843E]" />
                            <span>加日历</span>
                          </button>

                          <button
                            onClick={() => handleCopyScheduleText(trip)}
                            title="复制日程发送微信"
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制日程</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 Cols): Deep Micro Timeline & Butler Guide for Active Trip */}
          {activeTrip && (
            <div className="lg:col-span-7 space-y-4">
              {/* Selected Trip Details Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                        {activeTrip.type === 'activity' ? '慢游研学时间表' : '赛事规程时间表'}
                      </span>
                      <span className="font-mono text-xs text-stone-500">
                        {activeTrip.startDate} ~ {activeTrip.endDate} ({activeTrip.days}天)
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base md:text-lg text-[#2C3E50] mt-1.5">
                      {activeTrip.title}
                    </h3>
                  </div>

                  {/* 1-Click Add This Trip to Calendar */}
                  <button
                    onClick={() => handleExportSingleToCalendar(activeTrip)}
                    className="px-3.5 py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 border border-[#D4AF37]/40"
                  >
                    <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                    <span>添加到手机日历 (含闹钟)</span>
                  </button>
                </div>

                {/* TGO Butler & Medical Guarantee Card */}
                <div className="bg-gradient-to-r from-[#FAF9F6] via-amber-50/40 to-[#FAF9F6] p-3.5 rounded-2xl border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center font-serif font-bold text-sm shadow-2xs shrink-0 border border-[#D4AF37]/40">
                      管家
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <span>{activeTrip.tgoContact?.name}</span>
                        <span className="bg-[#2C3E50]/10 text-[#2C3E50] text-[10px] px-2 py-0.2 rounded-full font-medium">
                          {activeTrip.tgoContact?.roleTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        资质：{activeTrip.tgoContact?.badge} · 热线：<strong className="text-[#2C3E50] font-mono">{activeTrip.tgoContact?.phone}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 font-medium text-[11px] shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>随团配备AED与急救医护</span>
                  </div>
                </div>

                {/* 3. Detailed Daily/Hourly Milestone Timeline */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#2C3E50] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <span>带时间轴的行程清单 (逐日/分时节奏)</span>
                    </h4>
                    <span className="text-xs text-stone-400">
                      无购物 · 慢节奏 · 适老步道
                    </span>
                  </div>

                  {/* Day 0: Pre-departure Checkpoint */}
                  <div className="relative pl-6 pb-4 border-l-2 border-dashed border-[#D4AF37]">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#D4AF37] border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2C3E50]"></div>
                    </div>

                    <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#EAE6DF] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#85660d] font-bold">
                        <span>【行前 1~3 天】出团通知与管家 1 对 1 致电</span>
                        <span className="text-[10px] bg-[#D4AF37]/20 px-2 py-0.5 rounded-full">准备阶段</span>
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        TGO 专属伴游管家将致电确认出发集合时间、接站车牌号及天气预报，核对慢病常备药与双床房需求，发送《乐龄出团通知书》。
                      </p>
                    </div>
                  </div>

                  {/* Activity Itinerary Days */}
                  {activeTrip.type === 'activity' && activeTrip.itineraryDays && (
                    <div className="space-y-4">
                      {activeTrip.itineraryDays.map((dayItem) => (
                        <div
                          key={dayItem.day}
                          className="relative pl-6 pb-4 border-l-2 border-[#D4AF37]/50 last:border-l-0"
                        >
                          {/* Timeline Dot Node */}
                          <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#2C3E50] text-[#D4AF37] border-2 border-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                            D{dayItem.day}
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-[#EAE6DF] space-y-3 shadow-2xs hover:border-[#D4AF37]/40 transition-colors text-xs">
                            {/* Day Title & Theme */}
                            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                              <div>
                                <span className="font-bold text-stone-900 text-sm">
                                  第 {dayItem.day} 天：{dayItem.title}
                                </span>
                                <div className="text-[11px] text-[#85660d] font-medium mt-0.5">
                                  主题：{dayItem.theme}
                                </div>
                              </div>

                              <span className="bg-stone-100 text-stone-700 text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 font-mono">
                                <Footprints className="w-3 h-3 text-[#2C3E50]" />
                                <span>{dayItem.stepsEstimated}</span>
                              </span>
                            </div>

                            {/* Morning / Afternoon / Evening Timeline Blocks */}
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              {/* Morning */}
                              <div className="flex items-start space-x-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-stone-100">
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                                  🌅 晨间
                                </span>
                                <span className="text-stone-700 leading-relaxed text-[11px]">
                                  {dayItem.morning}
                                </span>
                              </div>

                              {/* Afternoon */}
                              <div className="flex items-start space-x-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-stone-100">
                                <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-bold shrink-0">
                                  ☀️ 午后
                                </span>
                                <span className="text-stone-700 leading-relaxed text-[11px]">
                                  {dayItem.afternoon}
                                </span>
                              </div>

                              {/* Evening */}
                              <div className="flex items-start space-x-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-stone-100">
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-bold shrink-0">
                                  🌙 傍晚
                                </span>
                                <span className="text-stone-700 leading-relaxed text-[11px]">
                                  {dayItem.evening}
                                </span>
                              </div>
                            </div>

                            {/* Dining & Hotel Footer */}
                            <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
                              <div className="flex items-center gap-1.5">
                                <Utensils className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                                <span className="truncate">
                                  早: {dayItem.dining.breakfast} · 午: {dayItem.dining.lunch} · 晚: {dayItem.dining.dinner}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-[#2C3E50] shrink-0" />
                                <span className="truncate">下榻: {dayItem.hotel}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tournament Event Schedule */}
                  {activeTrip.type === 'event' && activeTrip.eventSchedule && (
                    <div className="space-y-3">
                      {activeTrip.eventSchedule.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="relative pl-6 pb-3 border-l-2 border-[#D4AF37]/50 last:border-l-0"
                        >
                          <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-[#2C3E50] text-[#D4AF37] border-2 border-white flex items-center justify-center font-bold text-[9px]">
                            {sIdx + 1}
                          </div>

                          <div
                            className={`p-3 rounded-2xl border text-xs space-y-1 ${
                              slot.isRestBreak
                                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                : 'bg-white border-[#EAE6DF] text-stone-800'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-2">
                                <span className="font-mono text-[#2C3E50] bg-stone-100 px-2 py-0.5 rounded-md">
                                  {slot.time}
                                </span>
                                <span>{slot.title}</span>
                              </span>
                              {slot.isRestBreak && (
                                <span className="bg-amber-200/80 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  ☕ 适老温润茶歇防疲劳
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed pl-1">
                              {slot.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Interactive Packing & Medical Checklist */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-serif font-bold text-sm text-[#2C3E50] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>行前必备清单（点击可打勾标记备齐）</span>
                    </div>

                    <span className="text-[11px] text-stone-500 font-mono">
                      已备好{' '}
                      {
                        defaultChecklist.filter(
                          (c) => checkedItems[`${activeTrip.id}-${c.id}`]
                        ).length
                      }
                      /{defaultChecklist.length} 项
                    </span>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {defaultChecklist.map((item) => {
                      const itemKey = `${activeTrip.id}-${item.id}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheckItem(itemKey)}
                          className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 line-through opacity-80'
                              : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-stone-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-[11px] leading-snug flex-1">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. AI Smart Health & Weather Advisory Generator */}
                <div className="bg-white rounded-2xl p-4 border border-[#D4AF37]/30 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-serif font-bold text-sm text-[#2C3E50] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>AI 管家 · 目的地气温与慢病用药定制备忘</span>
                    </div>

                    <button
                      onClick={() => fetchAiTripTips(activeTrip)}
                      disabled={aiLoading}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#85660d] border border-amber-200 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`}
                      />
                      <span>{aiLoading ? 'AI 分析中...' : '生成专属行前贴士'}</span>
                    </button>
                  </div>

                  {aiAdvisory ? (
                    <div className="space-y-2 animate-fadeIn">
                      <p className="bg-[#FAF9F6] p-3 rounded-xl border border-stone-200 text-stone-700 leading-relaxed text-[11px]">
                        {aiAdvisory.butlerGreeting}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-amber-900 leading-relaxed">
                          {aiAdvisory.weatherForecast}
                        </div>
                        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 text-emerald-900 leading-relaxed">
                          {aiAdvisory.healthNotice}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      点击右上角按钮，AI 管家将根据【{activeTrip.destination}】出发期间的气候特征与您的健康偏好，为您智能测算早晚温差防风衣物与常备药品携带量。
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyScheduleText(activeTrip)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制日程文本发老友群</span>
                    </button>

                    {onAskAiAboutTrip && (
                      <button
                        onClick={() =>
                          onAskAiAboutTrip(
                            `请问我已报名的《${activeTrip.title}》（${activeTrip.startDate}出发，${activeTrip.days}天），每天的具体适老车程与用餐安排是怎样的？`
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-[#FAF9F6] hover:bg-stone-100 text-[#2C3E50] border border-[#D4AF37]/30 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>向伴游管家询问此行程细节</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleExportSingleToCalendar(activeTrip)}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-stone-950" />
                    <span>加入手机日历</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Modal Guide: How to Add to Phone Calendar */}
      {showCalendarGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#D4AF37]/40">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#85660d] flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-[#B8843E]" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2C3E50]">
                  如何添加到手机系统日历？
                </h3>
              </div>
              <button
                onClick={() => setShowCalendarGuideModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-stone-700 leading-relaxed">
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="font-bold text-[#2C3E50] flex items-center gap-1.5">
                  <span>📱 苹果手机 (iPhone / iPad / Safari)</span>
                </div>
                <p className="text-stone-600 text-xs">
                  点击添加后，系统会自动调起日历应用并弹出日程预览，点击右上角<strong>【添加全部】</strong>或<strong>【完成】</strong>即可。
                </p>
              </div>

              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="font-bold text-[#2C3E50] flex items-center gap-1.5">
                  <span>🤖 华为 / 荣耀 / 小米 / OPPO / vivo (安卓系统)</span>
                </div>
                <p className="text-stone-600 text-xs">
                  点击后将下载标准日历日程文件（.ics），点击通知栏或下载完成提示中的<strong>【打开方式 ➡️ 系统日历】</strong>，选择<strong>【保存到日程】</strong>即可。
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>自动闹钟提醒机制</span>
                </div>
                <p className="text-amber-800/90 text-[11px]">
                  存入日历后，手机将在<strong>出发前 1 天上午 9:00</strong> 以及 <strong>出发当天提前 2 小时</strong> 自动推送响铃提醒，避免长辈遗忘证件与用药！
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCalendarGuideModal(false)}
                className="w-full py-2.5 bg-[#2C3E50] text-[#D4AF37] font-bold text-xs rounded-2xl hover:bg-[#1a252f] transition-colors cursor-pointer border border-[#D4AF37]/30"
              >
                我已明白，关闭说明
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
