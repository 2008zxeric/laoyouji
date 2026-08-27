import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Compass,
  Trophy,
  Gift,
  MessageSquareQuote,
  Users,
  ShoppingCart,
  Sparkles,
  ShoppingBag,
  Bot,
  Settings,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Phone,
  FileText,
  RefreshCw,
  Award,
  ChevronRight,
  ChevronDown,
  Building2,
  Calendar,
  User,
  ExternalLink,
  MapPin,
  HeartHandshake,
  Truck,
  Copy,
  Check,
  Sun,
  Moon,
  Leaf,
  Layers,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminTab, Activity, TournamentEvent, TripCategoryType, ReviewItem, MerchantApplication, FreeCampaign, PointsRedemption } from '../../types';
import { MEMBER_TIERS } from '../../data/mockData';
import { ActivityPublishModal } from './ActivityPublishModal';
import { FreeCampaignModal } from './FreeCampaignModal';
import { LogisticsTrackingModal } from './LogisticsTrackingModal';
import { DictionaryManagement } from './DictionaryManagement';
import { AdminRolesManagement } from './AdminRolesManagement';
import { AiActivityPreParserModal } from './AiActivityPreParserModal';
import { RiskAnalysisDashboard } from './RiskAnalysisDashboard';
import { SiteInfoManagement } from './SiteInfoManagement';
import { PosterManagement } from './PosterManagement';
import { SupplierPanel } from './SupplierPanel';
import { FinancePanel } from './FinancePanel';
import { RefundCenterPanel } from './RefundCenterPanel';
import { OrderOpsPanel } from './OrderOpsPanel';
import { TgoAdminPanel } from './TgoAdminPanel';
import { TgoApplicationReviewPanel } from './TgoApplicationReviewPanel';
import { ActivityApplyReviewPanel } from './ActivityApplyReviewPanel';
import { NoticeTplManager } from './NoticeTplManager';
import { ComboProfitModal } from './ComboProfitModal';

export const AdminDashboard: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    adminActiveTab,
    setAdminActiveTab,
    activities,
    setActivities,
    addActivity,
    updateActivity,
    toggleActivityStatus,
    events,
    setEvents,
    addEvent,
    updateEvent,
    orders,
    auditRefund,
    reviews,
    auditReview,
    deleteReview,
    wishes,
    auditWish,
    freeCampaigns,
    toggleFreeCampaign,
    aiKnowledgeList,
    addKnowledgeItem,
    chatLogs,
    resolveChatLog,
    operationLogs,
    adminUsers,
    currentAdminUser,
    setCurrentAdminUser,
    hasPermission,
    adminTheme,
    setAdminTheme,
    dictCategories,
    dictItems,
    merchants,
    auditMerchantApplication,
    pointsConfig,
    adjustMemberPoints,
    userProfile,
    showToast,
    pointsProducts,
    pointsRedemptions,
    setSelectedActivity,
    setSelectedEvent,
  } = useApp();

  // Search and filters for Activities
  const [actSearchTerm, setActSearchTerm] = useState('');
  const [actFilterCategory, setActFilterCategory] = useState<string>('all');
  const [actFilterCreator, setActFilterCreator] = useState<string>('all');
  const [actFilterStatus, setActFilterStatus] = useState<string>('all');

  // Search and filters for Events
  const [evtSearchTerm, setEvtSearchTerm] = useState('');
  const [evtFilterCategory, setEvtFilterCategory] = useState<string>('all');
  const [evtFilterStatus, setEvtFilterStatus] = useState<string>('all');
  const [evtFilterTheme, setEvtFilterTheme] = useState<string>('all');
  const [evtFilterTrack, setEvtFilterTrack] = useState<string>('all');
  const [evtFilterCreator, setEvtFilterCreator] = useState<string>('all');

  // AI Pre-Parser Modal Trigger State
  const [isAiPreParserOpen, setIsAiPreParserOpen] = useState(false);
  const [aiPreParserType, setAiPreParserType] = useState<'activity' | 'event'>('activity');

  // Search and filters for Merchants
  const [merchantSearchTerm, setMerchantSearchTerm] = useState('');
  const [merchantFilterStatus, setMerchantFilterStatus] = useState<string>('all');

  // New Comprehensive Activity/Event Publishing Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTargetActivity, setPublishTargetActivity] = useState<Activity | null>(null);
  const [publishTargetEvent, setPublishTargetEvent] = useState<TournamentEvent | null>(null);
  const [publishDefaultMode, setPublishDefaultMode] = useState<'activity' | 'event'>('activity');

  // Free Marketing Campaign Modal
  const [isFreeCampaignModalOpen, setIsFreeCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<FreeCampaign | null>(null);

  // Logistics & Courier Tracking Modal
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [selectedRedemptionForTracking, setSelectedRedemptionForTracking] = useState<PointsRedemption | null>(null);
  const [mallSubTab, setMallSubTab] = useState<'products' | 'redemptions'>('products');
  const [copiedTrackingNo, setCopiedTrackingNo] = useState<string | null>(null);

  // Modals inside Admin
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);

  // Edit / Add Activity Form State
  const [activityForm, setActivityForm] = useState<Partial<Activity>>({
    title: '',
    subtitle: '',
    destination: '',
    category: '学者同行',
    form: '名校名师研学',
    level: '尊享名仕',
    tripCategory: 'domestic',
    durationDays: 5,
    durationNights: 4,
    priceGroup: 3880,
    pricePremium: 5680,
    departureCity: '集中集合接送',
    creator: '周主管 (超级管理员)',
    cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  });

  // Edit / Preview Event State
  const [editingEvent, setEditingEvent] = useState<TournamentEvent | null>(null);
  const [previewEvent, setPreviewEvent] = useState<TournamentEvent | null>(null);

  // Review reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Merchant audit note dialog
  const [auditingMerchant, setAuditingMerchant] = useState<MerchantApplication | null>(null);
  const [merchantAuditNote, setMerchantAuditNote] = useState('');

  // Knowledge base form
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [newKnoCategory, setNewKnoCategory] = useState('适老与医疗');
  const [newKnoQuestion, setNewKnoQuestion] = useState('');
  const [newKnoAnswer, setNewKnoAnswer] = useState('');

  // Points adjust modal
  const [isAdjustPointsOpen, setIsAdjustPointsOpen] = useState(false);
  const [adjustPointsDelta, setAdjustPointsDelta] = useState(500);
  const [adjustPointsReason, setAdjustPointsReason] = useState('客服特别关怀赠送');

  // Stats summary calculations
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const pendingRefundsCount = orders.filter((o) => o.status === 'refund_requested').length;
  const pendingMerchantsCount = merchants.filter((m) => m.status === 'pending').length;
  const totalPaidOrders = orders.filter((o) => o.status === 'paid').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.payAmount, 0);
  const totalPointsSpentInOrders = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.pointsUsed || 0), 0);

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; permCheck?: string }[] = [
    { id: 'stats', label: '经营概览大盘', icon: BarChart3 },
    { id: 'risk', label: 'AI 适老风险分析', icon: ShieldAlert, badge: 2, permCheck: 'risk.view' },
    { id: 'orders', label: '出团运营与订单', icon: ShoppingCart, badge: pendingRefundsCount, permCheck: 'orders.view' },
    { id: 'refunds', label: '退款专款审批中心', icon: CreditCard, badge: pendingRefundsCount, permCheck: 'orders.view' },
    { id: 'activities', label: '慢游活动管理', icon: Compass, badge: activities.length, permCheck: 'activities.view' },
    { id: 'activity_apply', label: '活动发布申请审核', icon: FileText, badge: 1, permCheck: 'activities.view' },
    { id: 'events', label: '赛事报名管理', icon: Trophy, badge: events.length, permCheck: 'events.view' },
    { id: 'tgos', label: 'TGO 旅伴管家档案', icon: Award, badge: 3, permCheck: 'activities.view' },
    { id: 'tgo_apply', label: 'TGO 招募申请审核', icon: Users, badge: 1, permCheck: 'activities.view' },
    { id: 'suppliers', label: 'OTA 供应商与采购库', icon: Building2, badge: 3, permCheck: 'activities.view' },
    { id: 'finance', label: '财务三级结算审批', icon: TrendingUp, permCheck: 'orders.view' },
    { id: 'posters', label: '海报轮播配置驱动', icon: Layers, permCheck: 'config.view' },
    { id: 'site_info', label: '站点信息与合规', icon: Settings, permCheck: 'config.view' },
    { id: 'dictionaries', label: '业务数据字典库', icon: BookOpen, badge: dictCategories.length, permCheck: 'dictionaries.view' },
    { id: 'merchants', label: '商家服务审核', icon: HeartHandshake, badge: pendingMerchantsCount, permCheck: 'merchants.view' },
    { id: 'reviews', label: '会员点评审核', icon: MessageSquareQuote, badge: pendingReviewsCount, permCheck: 'reviews.audit' },
    { id: 'free', label: '免费出游规则', icon: Gift, permCheck: 'free.view' },
    { id: 'members', label: '老友会员档案', icon: Users, permCheck: 'members.view' },
    { id: 'wishes', label: '心愿立项审核', icon: Sparkles, badge: wishes.filter((w) => w.likes >= w.votesRequired && w.status === 'in_preparation').length, permCheck: 'wishes.audit' },
    { id: 'mall', label: '积分商城商品', icon: ShoppingBag, permCheck: 'mall.view' },
    { id: 'knowledge', label: 'AI老友管家知识库', icon: Bot, permCheck: 'knowledge.view' },
    { id: 'admins', label: '管理员与权限配置', icon: ShieldCheck, badge: adminUsers.length, permCheck: 'admins.view' },
    { id: 'config', label: '2026积分规则配置', icon: Settings, permCheck: 'config.view' },
  ];

  // Filtered Activities list
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        !actSearchTerm.trim() ||
        act.title.toLowerCase().includes(actSearchTerm.toLowerCase()) ||
        act.destination.toLowerCase().includes(actSearchTerm.toLowerCase()) ||
        act.code.toLowerCase().includes(actSearchTerm.toLowerCase());

      const matchCategory =
        actFilterCategory === 'all' ||
        act.category === actFilterCategory ||
        act.tripCategory === actFilterCategory;

      const matchCreator =
        actFilterCreator === 'all' ||
        (act.creator && act.creator.includes(actFilterCreator)) ||
        (!act.creator && actFilterCreator === '四季游官方');

      const matchStatus =
        actFilterStatus === 'all' || act.status === actFilterStatus;

      return matchSearch && matchCategory && matchCreator && matchStatus;
    });
  }, [activities, actSearchTerm, actFilterCategory, actFilterCreator, actFilterStatus]);

  // Unique creators list for filter dropdown
  const uniqueCreators = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a.creator) set.add(a.creator);
      else set.add('四季游官方自营');
    });
    return Array.from(set);
  }, [activities]);

  // Filtered Events list
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        !evtSearchTerm.trim() ||
        evt.title.toLowerCase().includes(evtSearchTerm.toLowerCase()) ||
        evt.city.toLowerCase().includes(evtSearchTerm.toLowerCase()) ||
        evt.code.toLowerCase().includes(evtSearchTerm.toLowerCase());

      const matchCategory =
        evtFilterCategory === 'all' || evt.category === evtFilterCategory;

      const matchStatus =
        evtFilterStatus === 'all' || (evt.status || 'registration') === evtFilterStatus;

      const matchTheme =
        evtFilterTheme === 'all' || evt.productTheme === evtFilterTheme;

      const matchTrack =
        evtFilterTrack === 'all' || evt.businessTrack === evtFilterTrack;

      const matchCreator =
        evtFilterCreator === 'all' ||
        (evt.creator && evt.creator.toLowerCase().includes(evtFilterCreator.toLowerCase()));

      return matchSearch && matchCategory && matchStatus && matchTheme && matchTrack && matchCreator;
    });
  }, [events, evtSearchTerm, evtFilterCategory, evtFilterStatus, evtFilterTheme, evtFilterTrack, evtFilterCreator]);

  // Filtered Merchants list
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchSearch =
        !merchantSearchTerm.trim() ||
        m.merchantName.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
        m.proposedActivityType.toLowerCase().includes(merchantSearchTerm.toLowerCase());

      const matchStatus =
        merchantFilterStatus === 'all' || m.status === merchantFilterStatus;

      return matchSearch && matchStatus;
    });
  }, [merchants, merchantSearchTerm, merchantFilterStatus]);

  const openCreateActivityModal = () => {
    setPublishTargetActivity(null);
    setPublishTargetEvent(null);
    setPublishDefaultMode('activity');
    setIsPublishModalOpen(true);
  };

  const openEditActivityModal = (act: Activity) => {
    setPublishTargetActivity(act);
    setPublishTargetEvent(null);
    setPublishDefaultMode('activity');
    setIsPublishModalOpen(true);
  };

  const openCreateEventModal = () => {
    setPublishTargetActivity(null);
    setPublishTargetEvent(null);
    setPublishDefaultMode('event');
    setIsPublishModalOpen(true);
  };

  const openEditEventModal = (evt: TournamentEvent) => {
    setPublishTargetActivity(null);
    setPublishTargetEvent(evt);
    setPublishDefaultMode('event');
    setIsPublishModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title || !activityForm.destination) {
      showToast('请填写活动标题与目的地');
      return;
    }

    if (editingActivity) {
      // Update existing
      updateActivity(editingActivity.id, {
        ...activityForm,
      });
      showToast(`活动【${activityForm.title}】更新成功！`);
    } else {
      // Create new
      const newAct: Activity = {
        id: `act-${Date.now()}`,
        code: `LYJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: activityForm.title!,
        subtitle: activityForm.subtitle || '学者全程伴游 · 随团医护保障 · 舒缓无负担',
        cover: activityForm.cover || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        images: [activityForm.cover || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'],
        category: activityForm.category || '学者同行',
        form: activityForm.form || '名校名师研学',
        level: activityForm.level || '尊享名仕',
        tripCategory: activityForm.tripCategory || 'domestic',
        durationDays: activityForm.durationDays || 5,
        durationNights: activityForm.durationNights || 4,
        destination: activityForm.destination!,
        departureCity: activityForm.departureCity || '专车接送',
        departureDates: [
          { date: '2026-09-20', remainingSlots: 8, largePrice: activityForm.priceGroup || 3880, smallPrice: activityForm.pricePremium || 5680, singleSupplement: 980 },
          { date: '2026-10-15', remainingSlots: 10, largePrice: activityForm.priceGroup || 3880, smallPrice: activityForm.pricePremium || 5680, singleSupplement: 980 },
        ],
        priceGroup: activityForm.priceGroup || 3880,
        pricePremium: activityForm.pricePremium || 5680,
        singleSupplement: 980,
        group: {
          size: '20-25人文化慢游大团',
          features: ['豪华2+1陆地头等舱大巴', '高品质国宾/园林酒店', '学者集中研学授课', '常备随团医护保障'],
          coach: '陆地头等舱航空大巴',
          hotelType: '高星级国宾酒店',
        },
        premium: {
          size: '6-10人名仕私享小团',
          features: ['奔驰商务专车接送', '古城庭院套房', '非遗大师私房定制宴'],
          coach: '奔驰9座豪华商务车',
          hotelType: '庭院园林度假套房',
        },
        fitnessLevel: 1,
        fitnessDesc: '极度舒缓 · 适老五星 · 每日平缓步数 3,000-4,500 步',
        features: ['名师学者随团深度讲解', '随团持证医护人员早晚测血压', '老友品茗与掼蛋对弈联谊'],
        itinerary: [
          {
            day: 1,
            title: '初抵目的地 · 洗尘静养',
            theme: '专车接送 · 入住酒店 · 老友欢迎晚宴',
            morning: '抵达集合地点，专人迎候献花接送。',
            afternoon: '入住特色园林酒店，建立健康档案。',
            evening: '老友欢聚品茗宴，发布行程指南。',
            dining: { breakfast: '自理', lunch: '自理', dinner: '养生欢迎宴' },
            hotel: '特色国宾/园林酒店',
            stepsEstimated: '约 2,000 步',
          },
        ],
        feeIncludes: [
          { category: '交通', detail: '当地全程豪华2+1航空大巴/奔驰商务车' },
          { category: '住宿', detail: '全程高品质园林度假酒店' },
          { category: '餐饮', detail: '定制清淡少油少盐养生餐饮' },
          { category: '医护', detail: '随团医护与应急医疗设备' },
          { category: '保险', detail: '保额 100 万元乐龄专项出游意外险' },
        ],
        feeExcludes: ['单房差（如单人独住）', '个人私人物品购买'],
        packingTips: ['携带二代身份证原件', '备齐常备慢性病药', '防滑舒适健步鞋'],
        notice: ['本行程节奏舒缓专为 50-75 岁乐龄人群定制'],
        viewCount: 120,
        rating: 5.0,
        reviewsCount: 0,
        isFeatured: true,
        isFreeEligible: true,
        status: 'published',
        creator: activityForm.creator || '周主管 (超级管理员)',
        createdAt: new Date().toISOString().split('T')[0],
        reviews: [],
      };

      addActivity(newAct);
      showToast(`活动【${newAct.title}】已成功发布上架！`);
    }

    setIsAddActivityModalOpen(false);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
    showToast(`赛事【${editingEvent.title}】已成功更新`);
  };

  const handleAddKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnoQuestion.trim() || !newKnoAnswer.trim()) return;
    addKnowledgeItem({
      category: newKnoCategory as any,
      question: newKnoQuestion.trim(),
      answer: newKnoAnswer.trim(),
      tags: [newKnoCategory, '问答'],
    });
    setNewKnoQuestion('');
    setNewKnoAnswer('');
    setIsAddKnowledgeOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        adminTheme === 'darkTwilight'
          ? 'bg-slate-900 text-slate-100'
          : adminTheme === 'warmPaper'
          ? 'bg-[#fcf9f2] text-stone-850'
          : 'bg-[#f8fafc] text-slate-800'
      }`}
    >
      {/* Top Eye-Care Header */}
      <header
        className={`px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors border-b ${
          adminTheme === 'darkTwilight'
            ? 'bg-slate-950/95 border-slate-800 backdrop-blur-md'
            : adminTheme === 'warmPaper'
            ? 'bg-white/95 border-amber-200/80 shadow-xs backdrop-blur-md'
            : 'bg-white/95 border-slate-200/90 shadow-xs backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-serif font-bold text-white shadow-xs text-lg">
            友
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base sm:text-lg text-slate-800">
                老友记 · 数字化文旅运营管理中心
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                护眼版 · 2026 Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">浙江四季游文旅集团 · 乐龄俱乐部全链路业务运营中台</p>
          </div>
        </div>

        {/* Right Actions: Eye-care Theme Switcher, Current Logged-in Operator & Client Toggle */}
        <div className="flex items-center gap-3">
          {/* Eye-Care Theme Switcher */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => {
                setAdminTheme('eyeCareLight');
                showToast('已切换至：🌿 护眼豆沙白 (高对比柔光舒适)');
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                adminTheme === 'eyeCareLight'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="护眼豆沙白"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>护眼柔白</span>
            </button>
            <button
              onClick={() => {
                setAdminTheme('warmPaper');
                showToast('已切换至：🌾 温润米纸白 (暖色温和不刺眼)');
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                adminTheme === 'warmPaper'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="温润米纸暖白"
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>米纸暖白</span>
            </button>
            <button
              onClick={() => {
                setAdminTheme('darkTwilight');
                showToast('已切换至：🌙 夜间深色模式');
              }}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                adminTheme === 'darkTwilight'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="夜间深色"
            >
              <Moon className="w-3.5 h-3.5 text-slate-400" />
              <span>夜间深色</span>
            </button>
          </div>

          {/* Current Operator Pill */}
          <div
            onClick={() => setAdminActiveTab('admins')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer"
            title="点击前往管理员与权限配置"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-500 hidden sm:inline">当前操作员:</span>
            <span className="font-bold text-slate-800">{currentAdminUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
              {currentAdminUser.role === 'superAdmin'
                ? '超级管理员'
                : currentAdminUser.role === 'admin'
                ? '管理员'
                : currentAdminUser.role === 'operations'
                ? '运营员'
                : '操作员'}
            </span>
          </div>

          <button
            onClick={() => setViewMode('client')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>切换至会员小程序端</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <aside
          className={`w-full md:w-64 border-r p-3 flex md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 gap-1 transition-colors ${
            adminTheme === 'darkTwilight'
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200/90 text-slate-700'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminActiveTab === item.id;
            const isAllowed = !item.permCheck || hasPermission(item.permCheck);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isAllowed) {
                    showToast(`当前身份【${currentAdminUser.role}】暂无该模块访问权限，请在「管理员与权限配置」中勾选`);
                    return;
                  }
                  setAdminActiveTab(item.id);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 md:shrink md:w-full cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs font-bold'
                    : isAllowed
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    : 'text-slate-400 opacity-50 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-700' : isAllowed ? 'text-slate-400' : 'text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isAllowed && (
                    <span className="text-[10px] text-slate-400">无权</span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main
          className={`flex-1 p-4 sm:p-6 overflow-y-auto ${
            adminTheme === 'darkTwilight' ? 'bg-slate-900/90' : 'bg-[#f8fafc]'
          }`}
        >
          {/* TAB 1: Stats Overview */}
          {adminActiveTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                    运营大盘 · 实时监控
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    四季游文旅老友记 · 2026年8月 会员积分与出游数据全景
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('数据已与云端完成毫秒级实时同步')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>刷新数据</span>
                  </button>
                </div>
              </div>

              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>累计实收订单金额</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono">
                    ¥{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">已支付订单 {totalPaidOrders} 笔</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>订单积分抵扣核销</span>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-700 font-mono">
                    {totalPointsSpentInOrders.toLocaleString()} <span className="text-xs font-normal">分</span>
                  </div>
                  <div className="text-[11px] text-slate-400">折合直接补贴老友 ¥{Math.floor(totalPointsSpentInOrders / 100)} 元</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>待审核会员真实点评</span>
                    <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-700 font-mono">
                    {pendingReviewsCount} <span className="text-xs font-normal">条待审</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium">审核通过即发 50/100 积分</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>待审批退款申请</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-bold text-rose-700 font-mono">
                    {pendingRefundsCount} <span className="text-xs font-normal">笔申请</span>
                  </div>
                  <div className="text-[11px] text-slate-400">承诺 1 个工作日内原路退回</div>
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">快捷运营入口</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <button
                    onClick={() => setAdminActiveTab('risk')}
                    className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border border-amber-200 flex items-center gap-2.5 text-xs text-amber-950 font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <ShieldAlert className="w-4 h-4 text-[#B8843E]" />
                    <span>AI 适老风险研判</span>
                  </button>
                  <button
                    onClick={() => {
                      setAdminActiveTab('activities');
                      setIsAddActivityModalOpen(true);
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>发布新活动行程</span>
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('reviews')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                    <span>审核点评 ({pendingReviewsCount})</span>
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('orders')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>审核退款 ({pendingRefundsCount})</span>
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('config')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>积分规则参数配置</span>
                  </button>
                </div>
              </div>

              {/* Recent Operations Log */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>最新系统安全审计日志</span>
                  </h3>
                  <span className="text-xs text-slate-400">实时流水</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {operationLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.adminName}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{log.detail}</p>
                      </div>
                      <div className="text-right text-slate-400 text-[11px] shrink-0">
                        <div>{log.createdAt}</div>
                        <div className="font-mono text-[10px] text-slate-400">{log.ip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI Risk Analysis & Senior Safety Assessment */}
          {adminActiveTab === 'risk' && (
            <RiskAnalysisDashboard
              onSelectActivity={(act) => {
                setAdminActiveTab('activities');
                setPreviewActivity(act);
              }}
              onSelectEvent={(evt) => {
                setAdminActiveTab('events');
                setPreviewEvent(evt);
              }}
            />
          )}

          {/* TAB 2: Activities Management */}
          {adminActiveTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    文旅慢游活动管理
                  </h2>
                  <p className="text-xs text-slate-500">
                    管理产品行程、品类积分系数、大团/拼小团价格、录入人/机构与上下架状态
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAiPreParserType('activity');
                      setIsAiPreParserOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>✨ AI 智能预录入 (导入方案/AI代填)</span>
                  </button>
                  <button
                    onClick={openCreateActivityModal}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer border border-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>普通发布</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={actSearchTerm}
                    onChange={(e) => setActSearchTerm(e.target.value)}
                    placeholder="按活动名称、编码、目的地搜索..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600 placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">类型:</span>
                  <select
                    value={actFilterCategory}
                    onChange={(e) => setActFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部分类</option>
                    <option value="学者同行">学者同行</option>
                    <option value="康养山海">康养山海</option>
                    <option value="非遗探访">非遗探访</option>
                    <option value="名士慢游">名士慢游</option>
                    <option value="local">本地近郊 (1.0x)</option>
                    <option value="domestic">跨省国内 (1.5x)</option>
                    <option value="outbound">出境专线 (1.6x)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">录入人/机构:</span>
                  <select
                    value={actFilterCreator}
                    onChange={(e) => setActFilterCreator(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600 max-w-[160px]"
                  >
                    <option value="all">全部录入来源</option>
                    {uniqueCreators.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">状态:</span>
                  <select
                    value={actFilterStatus}
                    onChange={(e) => setActFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部状态</option>
                    <option value="published">在售上架</option>
                    <option value="offline">已下架</option>
                  </select>
                </div>

                {(actSearchTerm || actFilterCategory !== 'all' || actFilterCreator !== 'all' || actFilterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setActSearchTerm('');
                      setActFilterCategory('all');
                      setActFilterCreator('all');
                      setActFilterStatus('all');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 underline text-xs ml-auto cursor-pointer"
                  >
                    重置筛选
                  </button>
                )}
              </div>

              {/* Activity List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="p-3.5">活动编码 & 标题</th>
                        <th className="p-3.5">品类 / 录入人</th>
                        <th className="p-3.5">大团价 / 小团价</th>
                        <th className="p-3.5">出游天数</th>
                        <th className="p-3.5">状态</th>
                        <th className="p-3.5 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredActivities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            未找到符合条件的慢游活动
                          </td>
                        </tr>
                      ) : (
                        filteredActivities.map((act) => {
                          const tripCat = act.tripCategory || 'domestic';
                          const catCfg = pointsConfig.categoryCoefficients[tripCat] || pointsConfig.categoryCoefficients.domestic;

                          return (
                            <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={act.cover}
                                    alt={act.title}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                  <div className="max-w-xs">
                                    <div className="font-mono text-[10px] text-emerald-700 font-bold">{act.code}</div>
                                    <div className="font-bold text-slate-900 line-clamp-1">{act.title}</div>
                                    <div className="text-[11px] text-slate-500 line-clamp-1">{act.destination}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-semibold">
                                    {catCfg.name} ({catCfg.multiplier}x)
                                  </span>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>{act.creator || '四季游官方自营'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-mono">
                                  <div className="text-slate-800">大团: ¥{act.priceGroup}</div>
                                  <div className="text-amber-700 font-bold">小团: ¥{act.pricePremium}</div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-medium text-slate-800">{act.durationDays}天{act.durationNights}晚</div>
                                {act.createdAt && (
                                  <div className="text-[10px] text-slate-400">{act.createdAt}</div>
                                )}
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    act.status === 'published'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {act.status === 'published' ? '在售上架' : '已下架'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => setPreviewActivity(act)}
                                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="前台预览"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>预览</span>
                                </button>
                                <button
                                  onClick={() => openEditActivityModal(act)}
                                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="编辑活动"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>编辑</span>
                                </button>
                                <button
                                  onClick={() => toggleActivityStatus(act.id)}
                                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                    act.status === 'published'
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold'
                                  }`}
                                >
                                  {act.status === 'published' ? '下架' : '上架'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Merchants Audit */}
          {adminActiveTab === 'merchants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    入驻商家与合作服务审核
                  </h2>
                  <p className="text-xs text-slate-500">
                    审核各康养基地、研学名师、老年社团或酒店车队提交的活动与服务合作申请
                  </p>
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-bold">
                  待审核：{pendingMerchantsCount} 家机构
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={merchantSearchTerm}
                    onChange={(e) => setMerchantSearchTerm(e.target.value)}
                    placeholder="按机构名称、联系人、城市或服务类型搜索..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600 placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">审核状态:</span>
                  <select
                    value={merchantFilterStatus}
                    onChange={(e) => setMerchantFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过合作</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                </div>
              </div>

              {/* Merchants List */}
              <div className="space-y-3">
                {filteredMerchants.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    未找到符合条件的入驻申请
                  </div>
                ) : (
                  filteredMerchants.map((m) => (
                    <div
                      key={m.id}
                      className={`bg-white p-4 sm:p-5 rounded-2xl border ${
                        m.status === 'pending' ? 'border-amber-300 shadow-sm' : 'border-slate-200'
                      } space-y-3`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{m.merchantName}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200 font-semibold">
                                {m.businessType}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                              <span>联系人: {m.contactPerson} ({m.contactPhone})</span>
                              <span>所在城市: {m.city}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                              m.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : m.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {m.status === 'approved' ? '合作已通过' : m.status === 'rejected' ? '已驳回' : '待审核'}
                          </span>
                          <span className="text-[11px] text-slate-400">{m.createdAt}</span>
                        </div>
                      </div>

                      {/* Detail Content */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="text-slate-500 font-medium mb-1">拟发起/合作活动服务</div>
                          <div className="text-slate-900 font-bold">{m.proposedActivityType}</div>
                          <div className="text-slate-500 mt-1">{m.serviceCapacity}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 md:col-span-2">
                          <div className="text-slate-500 font-medium mb-1">合作方案与适老特色</div>
                          <p className="text-slate-700 leading-relaxed">{m.description}</p>
                          {m.auditNote && (
                            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                              <span className="text-amber-800 font-semibold">审核答复：</span>
                              {m.auditNote}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {m.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              auditMerchantApplication(m.id, 'approved', '平台审核通过，欢迎共建高品质乐龄慢游生态！');
                              showToast(`已批准【${m.merchantName}】的入驻申请`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>通过入驻</span>
                          </button>
                          <button
                            onClick={() => {
                              auditMerchantApplication(m.id, 'rejected', '抱歉，当前资质暂不符合乐龄适老安全标准');
                              showToast(`已驳回【${m.merchantName}】的申请`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>驳回申请</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Reviews Audit */}
          {adminActiveTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    会员出游点评与晒图审核
                  </h2>
                  <p className="text-xs text-slate-500">
                    审核老友真实评价，通过后自动发放 +50 积分（晒图加赠 +50 积分，共 +100 积分）并记录流水
                  </p>
                </div>
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-bold">
                  待审核：{pendingReviewsCount} 条
                </div>
              </div>

              {/* Review Audit Cards */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`bg-white p-4 sm:p-5 rounded-2xl border ${
                      rev.status === 'pending' ? 'border-amber-300 shadow-sm' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={rev.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.author}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                              {rev.memberLevel || '尊享会员'}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                rev.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : rev.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {rev.status === 'pending' ? '待审核' : rev.status === 'approved' ? '已审核通过' : '已驳回'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            点评行程：<span className="text-slate-800 font-medium">{rev.activityTitle || '老友慢游活动'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">{rev.date}</div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      "{rev.content}"
                    </p>

                    {/* Photos */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        {rev.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="晒图"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                          />
                        ))}
                        <span className="text-[11px] text-amber-700 font-semibold ml-1">
                          (含晒图 · 加赠 +50 积分)
                        </span>
                      </div>
                    )}

                    {/* Official reply if existing */}
                    {rev.adminReply && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <span className="font-bold">四季游文旅官方回复：</span> {rev.adminReply}
                      </div>
                    )}

                    {/* Reply Input Modal Box */}
                    {replyingReviewId === rev.id && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="输入文旅管家暖心回复内容..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1 rounded bg-slate-200 text-xs text-slate-700 cursor-pointer"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => {
                              auditReview(rev.id, 'approved', adminReplyText);
                              setReplyingReviewId(null);
                              setAdminReplyText('');
                            }}
                            className="px-3 py-1 rounded bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            审核通过并发布回复
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        奖励积分：<span className="font-bold text-amber-700">+{rev.pointsAwarded || (rev.images?.length ? 100 : 50)} 分</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rev.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setAdminReplyText('感谢老友的深度体验与赞扬！四季游文旅祝您身体安康，期待下次再聚！');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors border border-slate-200 cursor-pointer"
                            >
                              回复
                            </button>
                            <button
                              onClick={() => auditReview(rev.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              驳回
                            </button>
                            <button
                              onClick={() => auditReview(rev.id, 'approved')}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              审核通过并派发积分
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteReview(rev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="删除评价"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Orders & Departure Operations */}
          {adminActiveTab === 'orders' && (
            <OrderOpsPanel />
          )}

          {/* TAB 5: Free Campaigns */}
          {adminActiveTab === 'free' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    免费出游营销与免单规则管理
                  </h2>
                  <p className="text-xs text-slate-500">
                    支持选定活动、在选定时段内设置“全部或指定会员在首次/第N次付款参加后，后续活动免费参加”
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCampaign(null);
                    setIsFreeCampaignModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>配置【首购后后续免费】营销规则</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freeCampaigns.map((camp) => (
                  <div key={camp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{camp.activityTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          camp.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {camp.enabled ? '规则生效中' : '已停用'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-medium text-slate-900">{camp.ruleDesc}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-200">
                        <span>有效时段：{camp.startDate || '2026-08-01'} ~ {camp.endDate || '2026-12-31'}</span>
                        <span>适用群体：{camp.memberScope === 'all' ? '全体老友' : '指定高阶会员'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>剩余名额：<span className="font-mono text-emerald-700 font-bold">{camp.remainingQuota} / {camp.totalQuota}</span></div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCampaign(camp);
                            setIsFreeCampaignModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>编辑规则</span>
                        </button>
                        <button
                          onClick={() => toggleFreeCampaign(camp.id)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg cursor-pointer"
                        >
                          {camp.enabled ? '停用规则' : '启用规则'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Member Management */}
          {adminActiveTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    老友会员健康档案与积分调整
                  </h2>
                  <p className="text-xs text-slate-500">
                    查看乐龄会员等级倍数、健康膳食备注及手动调整会员积分
                  </p>
                </div>
                <button
                  onClick={() => setIsAdjustPointsOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-medium cursor-pointer shadow-xs"
                >
                  手动调整会员积分
                </button>
              </div>

              {/* Member Card Mock View */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{userProfile.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
                        {MEMBER_TIERS.find((t) => t.id === userProfile.levelId)?.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      会员卡号: {userProfile.memberNo} · 手机: {userProfile.phone}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <div className="text-slate-500 font-medium">当前积分余额</div>
                    <div className="text-lg font-bold text-amber-700 font-mono">
                      {userProfile.points.toLocaleString()} <span className="text-xs font-normal">分</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">出游积分倍数</div>
                    <div className="text-lg font-bold text-emerald-700 font-mono">
                      {MEMBER_TIERS.find((t) => t.id === userProfile.levelId)?.multiplier}x 倍
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">年度免单资格</div>
                    <div className="text-lg font-bold text-slate-800">
                      {userProfile.annualFreeQuota - userProfile.freeQuotaUsed} 次可用
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">紧急联系人</div>
                    <div className="text-sm font-medium text-slate-800">
                      {userProfile.emergencyContactName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: 2026 Points Rules Configuration */}
          {adminActiveTab === 'config' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  2026年8月版 会员积分系统参数配置
                </h2>
                <p className="text-xs text-slate-500">
                  当前规则版本：{pointsConfig.version}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">一、基础兑现与累积规则</h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>积分累积基础费率：</span>
                      <span className="font-bold text-amber-700 font-mono">实付 1 元 = 10 积分</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>积分现金抵扣汇率：</span>
                      <span className="font-bold text-emerald-700 font-mono">100 积分 = 1 元现金</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>每单抵扣比例上限：</span>
                      <span className="font-bold text-slate-900">订单总金额 15%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">二、品类积分系数与封顶</h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>同城 / 本地活动：</span>
                      <span className="font-mono text-emerald-700 font-bold">1.0x (封顶抵 ¥30 / 3,000分)</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>国内 / 跨省活动：</span>
                      <span className="font-mono text-emerald-700 font-bold">1.5x (封顶抵 ¥100 / 10,000分)</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>出境 / 大额活动：</span>
                      <span className="font-mono text-emerald-700 font-bold">1.6x (封顶抵 ¥300 / 30,000分)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AI Knowledge & Chatlogs */}
          {adminActiveTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    AI 老友管家「小老友」智能问答知识库
                  </h2>
                  <p className="text-xs text-slate-500">
                    配置适老客服问答、医疗应急指引与退改政策
                  </p>
                </div>
                <button
                  onClick={() => setIsAddKnowledgeOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加问答条目</span>
                </button>
              </div>

              <div className="space-y-3">
                {aiKnowledgeList.map((kno) => (
                  <div key={kno.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] border border-amber-200 font-semibold">
                        {kno.category}
                      </span>
                      <span className="text-[11px] text-slate-400">已调用 {kno.useCount} 次</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">问：{kno.question}</div>
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      答：{kno.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: Wishes Review */}
          {adminActiveTab === 'wishes' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  老友心愿目的地与立项发团
                </h2>
                <p className="text-xs text-slate-500">
                  会员发布的心愿目的地满 50 票后，文旅专家组即可一键立项筹备出团
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishes.map((w) => (
                  <div key={w.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{w.destination}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          w.status === 'in_preparation'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : w.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {w.status === 'in_preparation' ? '满票待立项' : w.status === 'approved' ? '已立项发团' : '众筹投票中'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{w.reason}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>当前票数：<span className="font-bold text-amber-700">{w.likes}</span> / {w.votesRequired} 票</div>
                      {w.status !== 'approved' && (
                        <button
                          onClick={() => auditWish(w.id, true)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
                        >
                          审核立项发团
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: Points Mall Products & Logistics */}
          {adminActiveTab === 'mall' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    积分商城与礼品发货物流管理
                  </h2>
                  <p className="text-xs text-slate-500">
                    管理非遗文创、健康器具与茶礼库存，录入及跟踪顺丰/EMS快递运单号
                  </p>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setMallSubTab('products')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mallSubTab === 'products'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎁 兑换礼品货架
                  </button>
                  <button
                    onClick={() => setMallSubTab('redemptions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      mallSubTab === 'redemptions'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>📦 礼品发货与快递运单 ({pointsRedemptions.length})</span>
                  </button>
                </div>
              </div>

              {mallSubTab === 'products' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pointsProducts.map((prod) => (
                    <div key={prod.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <img src={prod.image} alt={prod.name} className="w-full h-32 rounded-xl object-cover border border-slate-200" />
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{prod.name}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-700 font-bold font-mono">{prod.pointsCost} 积分</span>
                        <span className="text-slate-500">库存 {prod.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                          <th className="p-3.5">兑换单号 & 礼品</th>
                          <th className="p-3.5">收货长辈信息</th>
                          <th className="p-3.5">快递承运商 & 运单号</th>
                          <th className="p-3.5">发货状态</th>
                          <th className="p-3.5 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {pointsRedemptions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              暂无积分礼品兑换记录
                            </td>
                          </tr>
                        ) : (
                          pointsRedemptions.map((red) => (
                            <tr key={red.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={red.productCover}
                                    alt={red.productName}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <div className="font-mono text-[10px] text-emerald-700 font-bold">{red.redemptionNo}</div>
                                    <div className="font-bold text-slate-900 line-clamp-1">{red.productName}</div>
                                    <div className="text-[11px] text-amber-700 font-semibold">扣除 {red.pointsCost} 积分</div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="space-y-0.5">
                                  <div className="font-medium text-slate-900">
                                    {red.recipientName} ({red.recipientPhone})
                                  </div>
                                  <div className="text-[11px] text-slate-500 line-clamp-1">
                                    {red.shippingAddress}
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="space-y-1">
                                  <div className="text-slate-800 font-medium">{red.courierName || '顺丰速运'}</div>
                                  <div className="flex items-center gap-1.5 font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-200">
                                    <span>{red.trackingNumber}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(red.trackingNumber);
                                        setCopiedTrackingNo(red.trackingNumber);
                                        setTimeout(() => setCopiedTrackingNo(null), 2000);
                                        showToast(`已复制运单号: ${red.trackingNumber}`);
                                      }}
                                      className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                                      title="复制单号"
                                    >
                                      {copiedTrackingNo === red.trackingNumber ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    red.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : red.status === 'shipped'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {red.status === 'delivered'
                                    ? '已签收送达'
                                    : red.status === 'shipped'
                                    ? '已发货运输中'
                                    : '待发货备货'}
                                </span>
                              </td>

                              <td className="p-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedRedemptionForTracking(red);
                                    setIsLogisticsModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>录入/修改快递单号</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: Events */}
          {adminActiveTab === 'events' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    乐龄文体交流与友谊赛管理
                  </h2>
                  <p className="text-xs text-slate-500">
                    管理老友掼蛋联谊赛、桥牌、摄影展评等益智友谊活动（坚持健康文娱、弱化博彩词汇）
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAiPreParserType('event');
                      setIsAiPreParserOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>✨ AI 智能预录入 (赛事方案/AI代填)</span>
                  </button>
                  <button
                    onClick={openCreateEventModal}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer border border-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>普通发布</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={evtSearchTerm}
                    onChange={(e) => setEvtSearchTerm(e.target.value)}
                    placeholder="按交流赛名称、城市、编码搜索..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600 placeholder-slate-400"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">状态:</span>
                  <select
                    value={evtFilterStatus}
                    onChange={(e) => setEvtFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                  >
                    <option value="all">全部状态</option>
                    <option value="registration">🟢 在售上架 (接受报名)</option>
                    <option value="draft">🟡 待发布 / 审核草稿</option>
                    <option value="ongoing">🔵 进行中 / 比赛对弈中</option>
                    <option value="expired">⚪ 已过期 / 已完赛</option>
                    <option value="offline">🔴 已下架</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">类别:</span>
                  <select
                    value={evtFilterCategory}
                    onChange={(e) => setEvtFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部类别</option>
                    <option value="掼蛋大师赛">掼蛋大师赛</option>
                    <option value="常青藤桥牌">常青藤桥牌</option>
                    <option value="金秋摄影">金秋摄影</option>
                    <option value="太极养生功">太极养生功</option>
                  </select>
                </div>

                {/* 3.1 Theme Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">主题:</span>
                  <select
                    value={evtFilterTheme}
                    onChange={(e) => setEvtFilterTheme(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部主题</option>
                    <option value="文化">🏛️ 文化</option>
                    <option value="体育">🏆 体育</option>
                    <option value="农业">🌾 农业</option>
                    <option value="健康">🧘 健康</option>
                  </select>
                </div>

                {/* 3.1 Track Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">轨道:</span>
                  <select
                    value={evtFilterTrack}
                    onChange={(e) => setEvtFilterTrack(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="all">全部轨道</option>
                    <option value="track1_marketing">轨道1·引流</option>
                    <option value="track2_mainstream">轨道2·主力</option>
                    <option value="track3_premium">轨道3·高端</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEvents.map((evt) => {
                  const getStatusBadge = (st?: string) => {
                    switch (st) {
                      case 'registration':
                        return { text: '在售上架', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                      case 'draft':
                        return { text: '待发布', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                      case 'ongoing':
                        return { text: '对弈进行中', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
                      case 'expired':
                        return { text: '已过期/完赛', cls: 'bg-slate-100 text-slate-500 border-slate-200' };
                      case 'offline':
                        return { text: '已下架', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
                      default:
                        return { text: '在售上架', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                    }
                  };
                  const statusBadge = getStatusBadge(evt.status);

                  return (
                    <div key={evt.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-emerald-700 font-bold">{evt.code}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge.cls} font-bold`}>
                              {statusBadge.text}
                            </span>
                            {evt.productTheme && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                                {evt.productTheme} · {evt.productCarrier || '赛事课堂'}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">{evt.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{evt.subtitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold shrink-0">
                          {evt.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500">举办城市：</span>
                          <span className="text-slate-800 font-medium">{evt.city} ({evt.venue})</span>
                        </div>
                        <div>
                          <span className="text-slate-500">活动日期：</span>
                          <span className="text-slate-800">{evt.startDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">会务/席位费：</span>
                          <span className="text-amber-700 font-bold font-mono">¥{evt.registrationFee}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">已报队伍：</span>
                          <span className="text-slate-800">{evt.registeredTeams} / {evt.maxTeams} 组</span>
                        </div>
                      </div>

                      {/* Honor & Medical Safeguard */}
                      <div className="text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1">
                        <div className="text-amber-900 font-medium flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>优胜表彰：{evt.prizePool?.first || '文旅研学礼包 + 荣誉证书'}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>适老保障：配备AED除颤仪、随队三甲医护、防疲劳软椅</span>
                        </div>
                      </div>

                      {/* Actions & Status Quick Switch */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-500">
                          录入人: <strong className="text-slate-700">{evt.creator || '四季游官方自营'}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEvent(evt);
                              setViewMode('event_detail');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>前台预览</span>
                          </button>
                          <button
                            onClick={() => openEditEventModal(evt)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>编辑赛事</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 12: Dictionary Management (NEW) */}
          {adminActiveTab === 'dictionaries' && (
            <DictionaryManagement />
          )}

          {/* TAB 13: Admins & Roles Management */}
          {adminActiveTab === 'admins' && (
            <AdminRolesManagement />
          )}

          {/* TAB 14: Site Info Management */}
          {adminActiveTab === 'site_info' && (
            <SiteInfoManagement />
          )}

          {/* TAB 15: Poster Management */}
          {adminActiveTab === 'posters' && (
            <PosterManagement />
          )}

          {/* TAB 16: Supplier Panel */}
          {adminActiveTab === 'suppliers' && (
            <SupplierPanel />
          )}

          {/* TAB 17: Finance Settlement */}
          {adminActiveTab === 'finance' && (
            <FinancePanel />
          )}

          {/* TAB 18: Refund Center Panel */}
          {adminActiveTab === 'refunds' && (
            <RefundCenterPanel />
          )}

          {/* TAB 19: TGO Admin Panel */}
          {adminActiveTab === 'tgos' && (
            <TgoAdminPanel />
          )}

          {/* TAB 20: TGO Application Review Panel */}
          {adminActiveTab === 'tgo_apply' && (
            <TgoApplicationReviewPanel />
          )}

          {/* TAB 21: Activity Application Review Panel */}
          {adminActiveTab === 'activity_apply' && (
            <ActivityApplyReviewPanel />
          )}
        </main>
      </div>

      {/* Modal: Add or Edit Activity */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                {editingActivity ? `编辑活动行程：${editingActivity.code}` : '发布新慢游行程'}
              </h3>
              <button onClick={() => setIsAddActivityModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">活动标题</label>
                <input
                  type="text"
                  required
                  value={activityForm.title || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="例如：《巴蜀灵秀·都江堰古法放水与青城道医慢游 6日》"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">副标题 / 特色亮点</label>
                <input
                  type="text"
                  value={activityForm.subtitle || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, subtitle: e.target.value })}
                  placeholder="例如：道医名家号脉 · 六善私汤静养 · 蜀风雅韵贵宾席"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">目的地</label>
                  <input
                    type="text"
                    required
                    value={activityForm.destination || ''}
                    onChange={(e) => setActivityForm({ ...activityForm, destination: e.target.value })}
                    placeholder="如：四川·成都/青城山"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">主题分类</label>
                  <select
                    value={activityForm.category || '学者同行'}
                    onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="学者同行">学者同行</option>
                    <option value="康养山海">康养山海</option>
                    <option value="非遗探访">非遗探访</option>
                    <option value="名士慢游">名士慢游</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">积分品类系数</label>
                  <select
                    value={activityForm.tripCategory || 'domestic'}
                    onChange={(e) => setActivityForm({ ...activityForm, tripCategory: e.target.value as TripCategoryType })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="local">同城/本地活动 (1.0x)</option>
                    <option value="domestic">国内/跨省活动 (1.5x)</option>
                    <option value="outbound">出境/大额活动 (1.6x)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">大团价格 (元/人)</label>
                  <input
                    type="number"
                    value={activityForm.priceGroup || 0}
                    onChange={(e) => setActivityForm({ ...activityForm, priceGroup: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">拼小团价格 (元/人)</label>
                  <input
                    type="number"
                    value={activityForm.pricePremium || 0}
                    onChange={(e) => setActivityForm({ ...activityForm, pricePremium: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">单房差 (元)</label>
                  <input
                    type="number"
                    value={activityForm.singleSupplement || 980}
                    onChange={(e) => setActivityForm({ ...activityForm, singleSupplement: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">行程天数 (天/晚)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={activityForm.durationDays || 5}
                      onChange={(e) => setActivityForm({ ...activityForm, durationDays: Number(e.target.value) })}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                    <input
                      type="number"
                      value={activityForm.durationNights || 4}
                      onChange={(e) => setActivityForm({ ...activityForm, durationNights: Number(e.target.value) })}
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">录入人 / 合作机构</label>
                  <input
                    type="text"
                    value={activityForm.creator || ''}
                    onChange={(e) => setActivityForm({ ...activityForm, creator: e.target.value })}
                    placeholder="如：周主管 / 杭州太极养生协会"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">出游适老体力指数 (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={activityForm.fitnessLevel || 1}
                    onChange={(e) => setActivityForm({ ...activityForm, fitnessLevel: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">封面图片 URL</label>
                <input
                  type="text"
                  value={activityForm.cover || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, cover: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-xs cursor-pointer"
                >
                  {editingActivity ? '保存修改' : '确认发布上线'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Event */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-serif font-bold text-slate-900 text-base">
                编辑赛事信息：{editingEvent.code}
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">赛事标题</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">举办城市与场馆</label>
                  <input
                    type="text"
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">报名会务费 (元/队)</label>
                  <input
                    type="number"
                    value={editingEvent.registrationFee}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registrationFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">优胜第一名礼遇 (健康文娱)</label>
                <input
                  type="text"
                  value={editingEvent.prizePool?.first || ''}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      prizePool: { ...editingEvent.prizePool, first: e.target.value },
                    })
                  }
                  placeholder="如：双人5天文旅研学名额 + 景德镇定制大师茶具"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-xs cursor-pointer"
                >
                  保存赛事更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Preview Modal */}
      {previewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-700 font-bold">{previewActivity.code}</span>
                <h3 className="font-serif font-bold text-slate-900 text-base">前台呈现预览</h3>
              </div>
              <button onClick={() => setPreviewActivity(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-slate-700 text-xs">
              <div className="relative rounded-xl overflow-hidden h-48 sm:h-60 border border-slate-200">
                <img
                  src={previewActivity.cover}
                  alt={previewActivity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-medium text-[10px]">
                      {previewActivity.category}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-white mt-1">
                      {previewActivity.title}
                    </h2>
                    <p className="text-slate-200 text-xs mt-0.5">{previewActivity.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Price & Details Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-slate-500">大团价</div>
                  <div className="text-slate-900 font-bold font-mono">¥{previewActivity.priceGroup}</div>
                </div>
                <div>
                  <div className="text-slate-500">拼小团价</div>
                  <div className="text-emerald-700 font-bold font-mono">¥{previewActivity.pricePremium}</div>
                </div>
                <div>
                  <div className="text-slate-500">目的地</div>
                  <div className="text-slate-800 font-medium">{previewActivity.destination}</div>
                </div>
                <div>
                  <div className="text-slate-500">录入人/机构</div>
                  <div className="text-slate-800">{previewActivity.creator || '四季游官方'}</div>
                </div>
              </div>

              {/* TGO Leader */}
              {previewActivity.tgo && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3">
                  <img
                    src={previewActivity.tgo.avatar}
                    alt={previewActivity.tgo.name}
                    className="w-12 h-12 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-emerald-900">{previewActivity.tgo.name}</div>
                    <div className="text-[11px] text-emerald-700">{previewActivity.tgo.roleTitle}</div>
                    <p className="text-[11px] text-slate-600 italic mt-1">{previewActivity.tgo.motto}</p>
                  </div>
                </div>
              )}

              {/* Fee and Notice */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900">费用包含：</div>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  {previewActivity.feeIncludes?.map((f, i) => (
                    <li key={i}>
                      <span className="text-emerald-700 font-medium">【{f.category}】</span> {f.detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedActivity(previewActivity);
                    setViewMode('activity_detail');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>跳转至完整前台页面</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Knowledge */}
      {isAddKnowledgeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3 shadow-2xl">
            <h3 className="font-serif font-bold text-slate-900 text-sm">录入 AI 适老问答</h3>
            <form onSubmit={handleAddKnowledge} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">分类</label>
                <select
                  value={newKnoCategory}
                  onChange={(e) => setNewKnoCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="适老与医疗">适老与医疗</option>
                  <option value="积分与会员">积分与会员</option>
                  <option value="活动与行程">活动与行程</option>
                  <option value="退改与保障">退改与保障</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">常见问题 (Q)</label>
                <input
                  type="text"
                  required
                  value={newKnoQuestion}
                  onChange={(e) => setNewKnoQuestion(e.target.value)}
                  placeholder="如：随团医生每天几点测血压？"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">权威答复 (A)</label>
                <textarea
                  required
                  rows={3}
                  value={newKnoAnswer}
                  onChange={(e) => setNewKnoAnswer(e.target.value)}
                  placeholder="输入标准的关怀答复..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddKnowledgeOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 cursor-pointer shadow-xs"
                >
                  保存录入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Member Points */}
      {isAdjustPointsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3 shadow-2xl">
            <h3 className="font-serif font-bold text-slate-900 text-sm">手动调整会员积分流水</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">积分增减额 (正数增加，负数扣除)</label>
                <input
                  type="number"
                  value={adjustPointsDelta}
                  onChange={(e) => setAdjustPointsDelta(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">操作原因 / 审批单号</label>
                <input
                  type="text"
                  value={adjustPointsReason}
                  onChange={(e) => setAdjustPointsReason(e.target.value)}
                  placeholder="如：老友生日关怀赠送、活动补偿等"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustPointsOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adjustMemberPoints(adjustPointsDelta, adjustPointsReason);
                    setIsAdjustPointsOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 cursor-pointer shadow-xs"
                >
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Activity & Tournament Event Publishing Modal */}
      <ActivityPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setPublishTargetActivity(null);
          setPublishTargetEvent(null);
        }}
        initialActivity={publishTargetActivity}
        initialEvent={publishTargetEvent}
        defaultMode={publishDefaultMode}
      />

      {/* Free Marketing Campaign Configuration Modal (Buy N get subsequent free) */}
      <FreeCampaignModal
        isOpen={isFreeCampaignModalOpen}
        onClose={() => {
          setIsFreeCampaignModalOpen(false);
          setEditingCampaign(null);
        }}
        initialCampaign={editingCampaign}
      />

      {/* Points Mall Logistics & Courier Tracking Modal */}
      <LogisticsTrackingModal
        isOpen={isLogisticsModalOpen}
        onClose={() => {
          setIsLogisticsModalOpen(false);
          setSelectedRedemptionForTracking(null);
        }}
        redemption={selectedRedemptionForTracking}
      />

      {/* AI Pre-Parser Standalone Entry Point Modal */}
      <AiActivityPreParserModal
        isOpen={isAiPreParserOpen}
        onClose={() => setIsAiPreParserOpen(false)}
        initialType={aiPreParserType}
        onApplyParsedData={(parsedData, parsedType) => {
          if (parsedType === 'event') {
            setPublishTargetEvent(parsedData as TournamentEvent);
            setPublishTargetActivity(null);
            setPublishDefaultMode('event');
          } else {
            setPublishTargetActivity(parsedData as Activity);
            setPublishTargetEvent(null);
            setPublishDefaultMode('activity');
          }
          setIsPublishModalOpen(true);
        }}
      />
    </div>
  );
};
