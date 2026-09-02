import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Activity,
  TournamentEvent,
  Order,
  Traveler,
  PointsLog,
  PointsProduct,
  PointsRedemption,
  WishItem,
  ReviewItem,
  InviteInfo,
  FreeCampaign,
  AIKnowledgeItem,
  ChatLogItem,
  OperationLog,
  AdminUser,
  AdminTab,
  TripCategoryType,
  ArticleItem,
  MerchantApplication,
  DictCategory,
  DictItem,
  HealthProfile,
  TripReminderNotice,
} from '../types';
import type { SiteInfo } from '../api/gateway';
import {
  MOCK_ACTIVITIES,
  MOCK_EVENTS,
  MEMBER_TIERS,
  MOCK_POINTS_PRODUCTS,
  MOCK_POINTS_REDEMPTIONS,
  MOCK_WISHES,
  MOCK_REVIEWS,
  MOCK_INVITE_INFO,
  MOCK_FREE_CAMPAIGNS,
  MOCK_AI_KNOWLEDGE,
  MOCK_CHAT_LOGS,
  MOCK_OPERATION_LOGS,
  MOCK_ADMIN_USERS,
  MOCK_ARTICLES,
  MOCK_MERCHANTS,
  MOCK_TGOS,
  POINTS_CONFIG_2026,
} from '../data/mockData';
import { Tgo } from '../api/gateway';
import {
  DEFAULT_DICT_CATEGORIES,
  DEFAULT_DICT_ITEMS,
  getDefaultPermissionsByRole,
} from '../data/dictionariesData';
import confetti from 'canvas-confetti';


export interface UserProfile {
  name: string;
  title: string;
  phone: string;
  avatar: string;
  levelId: number;
  points: number;
  memberNo: string;
  annualFreeQuota: number; // 年度免费慢游名额
  freeQuotaUsed: number;
  idCard: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  healthProfile?: HealthProfile;
  isLoggedIn?: boolean;
}

interface AppContextType {
  // Mode switch: Client (小程序会员端) vs Admin (Web端管理后台)
  viewMode: 'client' | 'admin';
  setViewMode: (mode: 'client' | 'admin') => void;
  adminActiveTab: AdminTab;
  setAdminActiveTab: (tab: AdminTab) => void;

  // Navigation & View
  activeTab: 'home' | 'activities' | 'events' | 'community' | 'ai' | 'profile';
  setActiveTab: (tab: 'home' | 'activities' | 'events' | 'community' | 'ai' | 'profile') => void;
  isLargeFont: boolean;
  setIsLargeFont: React.Dispatch<React.SetStateAction<boolean>>;
  isCareMode: boolean;
  setIsCareMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCareMode: () => void;
  deviceMode: 'mobile' | 'responsive';
  setDeviceMode: (mode: 'mobile' | 'responsive') => void;

  // Data
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  events: TournamentEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TournamentEvent[]>>;
  tgos: Tgo[];
  setTgos: React.Dispatch<React.SetStateAction<Tgo[]>>;
  pointsProducts: PointsProduct[];
  setPointsProducts: React.Dispatch<React.SetStateAction<PointsProduct[]>>;
  setPointsRedemptions: React.Dispatch<React.SetStateAction<PointsRedemption[]>>;
  wishes: WishItem[];
  articles: ArticleItem[];
  reviews: ReviewItem[];
  invites: InviteInfo;
  freeCampaigns: FreeCampaign[];
  aiKnowledgeList: AIKnowledgeItem[];
  chatLogs: ChatLogItem[];
  operationLogs: OperationLog[];
  adminUsers: AdminUser[];
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  currentAdminUser: AdminUser;
  setCurrentAdminUser: React.Dispatch<React.SetStateAction<AdminUser>>;
  addAdminUser: (user: Omit<AdminUser, 'id'>) => void;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  hasPermission: (permId: string) => boolean;
  adminTheme: 'eyeCareLight' | 'warmPaper' | 'darkTwilight' | 'warmRice' | 'slateDark';
  setAdminTheme: React.Dispatch<React.SetStateAction<'eyeCareLight' | 'warmPaper' | 'darkTwilight' | 'warmRice' | 'slateDark'>>;

  // Data Dictionaries & Dynamic Tag / Category Tables
  dictCategories: DictCategory[];
  setDictCategories: React.Dispatch<React.SetStateAction<DictCategory[]>>;
  dictItems: DictItem[];
  setDictItems: React.Dispatch<React.SetStateAction<DictItem[]>>;
  addDictCategory: (category: Omit<DictCategory, 'id'>) => void;
  updateDictCategory: (id: string, category: Partial<DictCategory>) => void;
  deleteDictCategory: (id: string) => void;
  addDictItem: (item: Omit<DictItem, 'id'>) => void;
  updateDictItem: (id: string, item: Partial<DictItem>) => void;
  deleteDictItem: (id: string) => void;
  toggleDictItemStatus: (id: string) => void;
  getDictItemsByCategory: (categoryCode: string) => DictItem[];

  merchants: MerchantApplication[];
  pointsConfig: typeof POINTS_CONFIG_2026;

  // Merchant Application & Partnership
  addMerchantApplication: (appData: Omit<MerchantApplication, 'id' | 'createdAt' | 'status'>) => void;
  auditMerchantApplication: (id: string, status: 'approved' | 'rejected', note?: string) => void;

  // Detail Modals
  selectedActivity: Activity | null;
  setSelectedActivity: (activity: Activity | null) => void;
  selectedEvent: TournamentEvent | null;
  setSelectedEvent: (event: TournamentEvent | null) => void;
  selectedTgo: Tgo | null;
  setSelectedTgo: (tgo: Tgo | null) => void;
  isTgoListOpen: boolean;
  setIsTgoListOpen: (open: boolean) => void;

  // Booking Flow
  isBookingOpen: boolean;
  bookingTarget: { type: 'activity' | 'event'; data: Activity | TournamentEvent } | null;
  openBooking: (type: 'activity' | 'event', data: Activity | TournamentEvent) => void;
  closeBooking: () => void;

  // Other Modals
  isCheckinOpen: boolean;
  setIsCheckinOpen: (open: boolean) => void;
  isPointsMallOpen: boolean;
  setIsPointsMallOpen: (open: boolean) => void;
  isPosterOpen: boolean;
  posterData: Activity | TournamentEvent | null;
  openPoster: (data: Activity | TournamentEvent) => void;
  closePoster: () => void;
  isMembershipModalOpen: boolean;
  setIsMembershipModalOpen: (open: boolean) => void;

  // New Dedicated Modals: Points Guide, Invite Share, Write Review
  isPointsGuideOpen: boolean;
  setIsPointsGuideOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewTargetActivity: Activity | null;
  openWriteReview: (activity: Activity) => void;
  closeWriteReview: () => void;

  // Health Profile Modal & State
  isHealthModalOpen: boolean;
  setIsHealthModalOpen: (open: boolean) => void;
  updateHealthProfile: (profile: HealthProfile) => void;

  // Global AI Floating Concierge Assistant
  isGlobalAiOpen: boolean;
  setIsGlobalAiOpen: (open: boolean) => void;
  globalAiInitialPrompt: string;
  setGlobalAiInitialPrompt: (prompt: string) => void;
  openGlobalAiWithPrompt: (prompt?: string) => void;

  // User & State
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentTier: (typeof MEMBER_TIERS)[0];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;

  // Points & Check-in
  pointsLogs: PointsLog[];
  checkedInToday: boolean;
  checkinStreak: number;
  doCheckin: () => { success: boolean; pointsAdded: number; message: string };
  redeemProduct: (product: PointsProduct, address: string) => { success: boolean; message: string };

  // Points Redemptions & Shipping
  pointsRedemptions: PointsRedemption[];
  updateRedemptionTracking: (id: string, courierName: string, trackingNumber: string, status?: 'pending_shipment' | 'shipped' | 'delivered', traceDetail?: string) => void;
  checkFreeEligibility: (activityId: string) => { isEligible: boolean; reason: string; campaignId?: string };

  // Review Operations (Frontend & Admin Audit)
  submitReview: (activityId: string, rating: number, content: string, images?: string[]) => void;
  likeReview: (reviewId: string) => void;
  auditReview: (reviewId: string, status: 'approved' | 'rejected', reply?: string) => void;
  deleteReview: (reviewId: string) => void;

  // Invite & Referral Operations
  simulateFriendJoinAndTrip: () => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  payOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  requestRefund: (orderId: string, reason?: string) => void;
  auditRefund: (orderId: string, approved: boolean) => void;

  // Travelers
  travelers: Traveler[];
  addTraveler: (traveler: Omit<Traveler, 'id'>) => void;
  removeTraveler: (id: string) => void;

  // Wish voting & Adding
  voteWish: (wishId: string) => void;
  addWish: (newWish: Omit<WishItem, 'id' | 'likes' | 'status' | 'votesRequired' | 'createdAt'>) => void;
  auditWish: (wishId: string, approved: boolean) => void;

  // Admin CRUD helper functions
  addActivity: (act: Activity) => void;
  updateActivity: (id: string, partial: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  toggleActivityStatus: (id: string) => void;
  addEvent: (evt: TournamentEvent) => void;
  updateEvent: (id: string, partial: Partial<TournamentEvent>) => void;
  deleteEvent: (id: string) => void;
  addFreeCampaign: (camp: FreeCampaign) => void;
  updateFreeCampaign: (id: string, partial: Partial<FreeCampaign>) => void;
  deleteFreeCampaign: (id: string) => void;
  toggleFreeCampaign: (id: string) => void;
  addKnowledgeItem: (item: Omit<AIKnowledgeItem, 'id' | 'useCount'>) => void;
  resolveChatLog: (id: string) => void;
  adjustMemberPoints: (delta: number, reason: string) => void;

  // Points Calculation Formula Helpers
  calculatePointsEarned: (payAmount: number, tripCategory?: TripCategoryType) => number;
  calculateMaxPointsDeduction: (totalPrice: number, tripCategory?: TripCategoryType) => { maxPoints: number; maxYuan: number };

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Activity / Event Starting & Departure Reminders (活动开赛/研学24小时提醒)
  isTripReminderEnabled: boolean;
  setIsTripReminderEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTripReminder: (val?: boolean) => void;
  tripReminderLeadHours: number;
  setTripReminderLeadHours: React.Dispatch<React.SetStateAction<number>>;
  hasUnreadTripReminder: boolean;
  setHasUnreadTripReminder: React.Dispatch<React.SetStateAction<boolean>>;
  activeTripReminderNotice: TripReminderNotice | null;
  setActiveTripReminderNotice: React.Dispatch<React.SetStateAction<TripReminderNotice | null>>;
  isTripReminderModalOpen: boolean;
  setIsTripReminderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerTripReminderCheck: (forceToast?: boolean, forceSimulate?: boolean) => TripReminderNotice | null;
  dismissTripReminder: () => void;

  // Front Preview Layer
  previewTarget: { activity?: Activity; event?: TournamentEvent } | null;
  openFrontPreview: (target: { activity?: Activity; event?: TournamentEvent }) => void;
  closeFrontPreview: () => void;

  // Site Info Management
  siteInfo: SiteInfo;
  updateSiteInfo: (info: Partial<SiteInfo>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode: Client vs Web Admin
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTab>('stats');

  // Navigation & Display
  const [activeTab, setActiveTab] = useState<'home' | 'activities' | 'events' | 'community' | 'ai' | 'profile'>('home');
  const [isLargeFont, setIsLargeFont] = useState<boolean>(true); // Default to Large Font mode for 50-75 age group
  const [isCareMode, setIsCareMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lyj_care_mode');
      return saved !== null ? saved === 'true' : true; // Default enabled for supreme senior care
    } catch {
      return true;
    }
  });
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'responsive'>('mobile');

  const toggleCareMode = () => {
    setIsCareMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lyj_care_mode', String(next));
      } catch {}
      if (next) {
        setIsLargeFont(true);
        showToast('已开启『关怀模式』：全局字号1.2倍放大 · 按钮超高对比度 · 列表极简防眩');
      } else {
        showToast('已切换为『标准精细模式』');
      }
      return next;
    });
  };

  // Core Data
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [events, setEvents] = useState<TournamentEvent[]>(MOCK_EVENTS);
  const [tgos, setTgos] = useState<Tgo[]>(MOCK_TGOS);
  const [pointsProducts, setPointsProducts] = useState<PointsProduct[]>(MOCK_POINTS_PRODUCTS);
  const [pointsRedemptions, setPointsRedemptions] = useState<PointsRedemption[]>(MOCK_POINTS_REDEMPTIONS);
  const [wishes, setWishes] = useState<WishItem[]>(MOCK_WISHES);
  const [articles] = useState<ArticleItem[]>(MOCK_ARTICLES);
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [invites, setInvites] = useState<InviteInfo>(MOCK_INVITE_INFO);
  const [freeCampaigns, setFreeCampaigns] = useState<FreeCampaign[]>(MOCK_FREE_CAMPAIGNS);
  const [aiKnowledgeList, setAiKnowledgeList] = useState<AIKnowledgeItem[]>(MOCK_AI_KNOWLEDGE);
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>(MOCK_CHAT_LOGS);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>(MOCK_OPERATION_LOGS);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser>(MOCK_ADMIN_USERS[0]);
  const [adminTheme, setAdminTheme] = useState<'eyeCareLight' | 'warmPaper' | 'darkTwilight' | 'warmRice' | 'slateDark'>('eyeCareLight');

  // Dynamic Dictionaries State
  const [dictCategories, setDictCategories] = useState<DictCategory[]>(DEFAULT_DICT_CATEGORIES);
  const [dictItems, setDictItems] = useState<DictItem[]>(DEFAULT_DICT_ITEMS);

  const [merchants, setMerchants] = useState<MerchantApplication[]>(MOCK_MERCHANTS);
  const [pointsConfig] = useState(POINTS_CONFIG_2026);

  // Modals
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);
  const [selectedTgo, setSelectedTgo] = useState<Tgo | null>(null);
  const [isTgoListOpen, setIsTgoListOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{ type: 'activity' | 'event'; data: Activity | TournamentEvent } | null>(null);

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isPointsMallOpen, setIsPointsMallOpen] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [posterData, setPosterData] = useState<Activity | TournamentEvent | null>(null);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);

  // New Modals
  const [isPointsGuideOpen, setIsPointsGuideOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetActivity, setReviewTargetActivity] = useState<Activity | null>(null);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Global AI Concierge State
  const [isGlobalAiOpen, setIsGlobalAiOpen] = useState(false);
  const [globalAiInitialPrompt, setGlobalAiInitialPrompt] = useState('');

  const openGlobalAiWithPrompt = (prompt?: string) => {
    if (prompt) {
      setGlobalAiInitialPrompt(prompt);
    }
    setIsGlobalAiOpen(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Activity / Event Starting & Departure Reminders (活动开赛/研学24小时行前提醒)
  const [isTripReminderEnabled, setIsTripReminderEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lyj_trip_reminder_enabled');
      return saved !== null ? saved === 'true' : true; // Default ON for senior care
    } catch {
      return true;
    }
  });
  const [tripReminderLeadHours, setTripReminderLeadHours] = useState<number>(24);
  const [hasUnreadTripReminder, setHasUnreadTripReminder] = useState<boolean>(true);
  const [isTripReminderModalOpen, setIsTripReminderModalOpen] = useState<boolean>(false);
  const [activeTripReminderNotice, setActiveTripReminderNotice] = useState<TripReminderNotice | null>(() => {
    return {
      id: 'remind-1001',
      orderId: 'ord-1001',
      orderNo: 'LYJ20260812009',
      bizType: 'activity',
      title: '《江南文脉·苏州园林美学与昆曲私享名师慢游 5日》',
      cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
      departureDate: '2026-09-26',
      hoursLeft: 24,
      venueOrDestination: '江苏省苏州市姑苏区平江路文创昆曲雅聚前厅',
      contactGuideName: '顾清雅 (TGO专属管家)',
      contactGuidePhone: '181 0012 9722',
      gatheringTime: '明日上午 08:30 集合出发',
      gatheringPlace: '苏州古城昆曲会馆正门前厅（近地铁平江路站，提供无障碍接送）',
      weatherTips: '明日苏州晴转多云，气温 22℃~28℃，微风适宜出行；建议着轻便透气长袖与防滑软底鞋，早晚备薄开衫。',
      medicationTips: [
        '高血压/降糖等长期慢病常用药物（备足5日剂量）',
        '自备保温水壶（各景点设温热罗汉果草本茶饮站）',
        '防眩晕、创可贴及个人特殊护理包',
      ],
      healthReminders: [
        '随团配 AED 便携急救除颤仪与红十字应急救护员',
        '全程执行适老慢节奏，每漫步40分钟设静音茶歇',
        '已接入苏州三甲医院20分钟应急绿色就医通道',
      ],
      packingChecklist: [
        '本人二代身份证原件（入园核验必备）',
        '常备慢性病药品与降压药盒',
        '轻便软底防滑健步鞋',
        '便携保温水壶（常喝温水）',
        '智能手机及随身充电宝',
        '遮阳帽或折叠晴雨伞',
      ],
      status: 'upcoming_24h',
      createdAt: '2026-08-28 08:00',
    };
  });

  const triggerTripReminderCheck = (forceToast = false, forceSimulate = false): TripReminderNotice | null => {
    if (!isTripReminderEnabled && !forceSimulate) return null;

    // Find the earliest upcoming paid order or mock
    const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'travelling');
    const targetOrder = paidOrders[0] || orders[0];

    if (!targetOrder) return null;

    const isEvt = targetOrder.bizType === 'event';
    const notice: TripReminderNotice = {
      id: `remind-${Date.now()}`,
      orderId: targetOrder.id,
      orderNo: targetOrder.orderNo,
      bizType: targetOrder.bizType === 'event' ? 'event' : 'activity',
      title: targetOrder.targetTitle,
      cover: targetOrder.targetCover,
      departureDate: targetOrder.departureDate || '2026-09-26',
      hoursLeft: 24,
      venueOrDestination: isEvt ? '黄山昱城皇冠假日酒店 乐龄棋牌主赛场' : '江苏省苏州市姑苏区平江路文创会馆',
      contactGuideName: isEvt ? '沈国栋 (特邀国家级裁判长)' : '顾清雅 (TGO专属管家)',
      contactGuidePhone: '181 0012 9722',
      gatheringTime: isEvt ? '明日上午 08:30 开幕检录' : '明日上午 08:30 集合出发',
      gatheringPlace: isEvt ? '黄山昱城皇冠假日酒店 3楼千人宴会厅检录台' : '苏州古城昆曲会馆正门前厅（近地铁站，配无障碍电梯）',
      weatherTips: isEvt
        ? '明日黄山天气晴好微凉，室内比赛大厅空调恒定24℃，建议携带防风外套，赛场提供温热养生茶。'
        : '明日目的地晴转多云，气温 22℃~28℃，微风适宜出行；建议着轻便透气衣物与防滑软底鞋。',
      medicationTips: [
        '长期服用的降压药、降糖药（请随身携带备足用量）',
        '自备温水杯（现场设草本茶饮与低糖茶水站）',
        '心血管常用速效急救药品随身放于随手包中',
      ],
      healthReminders: [
        '现场/随团配备 AED 便携除颤仪与专业三甲护士',
        isEvt ? '执行适老限时积分制，每轮赛局后强制20分钟站立调息茶歇' : '全程平缓步道无台阶，每走40分钟安排茶歇休憩',
        '已对接属地三甲医院20分钟绿色急救通道',
      ],
      packingChecklist: [
        '本人二代身份证原件（检录/入住凭据）',
        '常备慢性病药品与降压药',
        '轻便防滑健步鞋',
        '便携保温水杯',
        '手机与随身充电宝',
        '换洗衣物与薄外套',
      ],
      status: 'upcoming_24h',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };

    setActiveTripReminderNotice(notice);
    setHasUnreadTripReminder(true);

    if (forceToast) {
      showToast(
        isEvt
          ? `🔔【24小时开赛提醒】您报名的《${notice.title.slice(0, 16)}...》将于明日开赛，请做好准备！`
          : `🔔【24小时行前提醒】您报名的《${notice.title.slice(0, 16)}...》将于明日启程，管家已在集合点恭候！`
      );
    }

    return notice;
  };

  const toggleTripReminder = (explicitVal?: boolean) => {
    setIsTripReminderEnabled((prev) => {
      const next = explicitVal !== undefined ? explicitVal : !prev;
      try {
        localStorage.setItem('lyj_trip_reminder_enabled', String(next));
      } catch {}
      if (next) {
        showToast('🔔 已开启『活动开赛/研学提醒』：将在开始前24小时推送页面内Toast与红点提醒');
        triggerTripReminderCheck(true, true);
      } else {
        showToast('已关闭行程开赛与研学出团提醒');
        setHasUnreadTripReminder(false);
      }
      return next;
    });
  };

  const dismissTripReminder = () => {
    setHasUnreadTripReminder(false);
  };

  // Front Preview Layer State
  const [previewTarget, setPreviewTarget] = useState<{ activity?: Activity; event?: TournamentEvent } | null>(null);
  const openFrontPreview = (target: { activity?: Activity; event?: TournamentEvent }) => {
    setPreviewTarget(target);
  };
  const closeFrontPreview = () => {
    setPreviewTarget(null);
  };

  // Site Info State
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(() => {
    const saved = localStorage.getItem('lyj_site_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      brand: '老友记 老好玩儿',
      slogan: '老好玩儿了 · 雅趣同行',
      company: '浙江四季游文旅集团有限公司',
      serviceWechat: 'laoyouji_service',
      servicePhone: '18100129722',
      serviceTime: '每日 9:00 - 21:00',
      hotline: '400-880-9966',
      address: '浙江省宁波市海曙区天一阁文创中心4楼',
      icp: '浙ICP备20260827号-1',
      intro: '面向 50-75 岁高净值知青学者的乐龄文化慢游与文体赛事社区',
      about: '老友记文旅社区以老友相聚、适老慢游为核心，专为长辈打造高品质文化研学与康养赛事体验。',
      agreement: '老友记文旅用户服务协议与隐私声明条款……',
    };
  });

  const updateSiteInfo = async (info: Partial<SiteInfo>) => {
    setSiteInfo((prev) => {
      const next = { ...prev, ...info };
      try {
        localStorage.setItem('lyj_site_info', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lyj_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '赵元博 教授',
      title: '原复旦大学特聘学者',
      phone: '138 0123 6688',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      levelId: 4, // 挚友 (年度15000分, x1.5倍)
      points: 16800,
      memberNo: 'LYJ-882069',
      annualFreeQuota: 1, // 享每年1次免费慢游资格
      freeQuotaUsed: 0,
      idCard: '31010419550812****',
      emergencyContactName: '赵晓琳 (女儿)',
      emergencyContactPhone: '139 1888 9966',
      healthProfile: {
        bloodPressureStatus: 'controlled_hypertension',
        heartCondition: 'normal',
        mobilityLevel: 'gentle_walker',
        altitudeSensitivity: 'sensitive',
        chronicConditions: ['高血压 (平稳控制)'],
        allergies: ['海鲜/甲壳类'],
        dailyMedications: ['降压药 (每日晨起1次)', '硝酸甘油 / 速效救心丸 (随身应急)'],
        maxDailyStepsComfort: 5000,
        emergencyContactName: '赵晓琳',
        emergencyContactPhone: '139 1888 9966',
        emergencyContactRelation: '女儿',
        specialDietary: '低盐少油、少糖清淡，不食重辣与海鲜',
        medicalNotes: '平时晨起活动半小时，午后需小憩30分钟；随身常备温水杯与降压药。',
        lastUpdated: '2026-08-20',
        isDeclared: true,
      },
    };
  });

  const updateHealthProfile = (hp: HealthProfile) => {
    setUserProfile((prev) => ({
      ...prev,
      healthProfile: hp,
      emergencyContactName: hp.emergencyContactName || prev.emergencyContactName,
      emergencyContactPhone: hp.emergencyContactPhone || prev.emergencyContactPhone,
    }));
  };

  useEffect(() => {
    localStorage.setItem('lyj_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const currentTier = MEMBER_TIERS.find((t) => t.id === userProfile.levelId) || MEMBER_TIERS[0];

  // Calculate Points Earned Helper: 1 元 = 10 积分 × 等级倍数 × 品类系数
  const calculatePointsEarned = (payAmount: number, tripCategory: TripCategoryType = 'domestic'): number => {
    const coeff = POINTS_CONFIG_2026.categoryCoefficients[tripCategory]?.multiplier || 1.5;
    return Math.floor(payAmount * POINTS_CONFIG_2026.baseEarnRate * currentTier.multiplier * coeff);
  };

  // Calculate Max Points Deduction Helper: 100 积分 = 1 元，每单上限 15%，封顶 30/100/300 元
  const calculateMaxPointsDeduction = (totalPrice: number, tripCategory: TripCategoryType = 'domestic') => {
    const catCfg = POINTS_CONFIG_2026.categoryCoefficients[tripCategory] || POINTS_CONFIG_2026.categoryCoefficients.domestic;
    const ratioCapYuan = Math.floor(totalPrice * POINTS_CONFIG_2026.maxDeductionRatio);
    const maxYuanAllowed = Math.min(ratioCapYuan, catCfg.maxDeductionYuan);
    const maxPointsAllowed = maxYuanAllowed * POINTS_CONFIG_2026.pointsToYuanRate;

    // Limited by user current balance
    const actualPointsCanUse = Math.min(userProfile.points, maxPointsAllowed);
    const actualYuanDiscount = Math.floor(actualPointsCanUse / POINTS_CONFIG_2026.pointsToYuanRate);

    return {
      maxPoints: actualPointsCanUse,
      maxYuan: actualYuanDiscount,
    };
  };

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('lyj_favorites');
    return saved ? JSON.parse(saved) : ['act-1', 'evt-1'];
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('lyj_favorites', JSON.stringify(next));
      showToast(prev.includes(id) ? '已从您的收藏中移除' : '已成功加入老友收藏');
      return next;
    });
  };

  const isFavorited = (id: string) => favorites.includes(id);

  // Points Ledger
  const [pointsLogs, setPointsLogs] = useState<PointsLog[]>([
    { id: 'log-1', title: '新会员注册赠送', amount: 50, type: 'earn', date: '2026-08-01', balanceAfter: 50, sourceRule: 'register' },
    { id: 'log-2', title: '邀请好友【林雅琴】首次出游奖励', amount: 1000, type: 'earn', date: '2026-08-12', balanceAfter: 1050, sourceRule: 'invite' },
    { id: 'log-3', title: '邀请好友【钱宏发】首次出游奖励', amount: 1000, type: 'earn', date: '2026-08-15', balanceAfter: 2050, sourceRule: 'invite' },
    { id: 'log-4', title: '完成《春醉姑苏》出行返积分 (1.5x 等级倍数 × 1.5 品类系数)', amount: 12750, type: 'earn', date: '2026-08-16', balanceAfter: 14800, sourceRule: 'booking' },
    { id: 'log-5', title: '写活动评价并晒图审核通过奖励', amount: 100, type: 'earn', date: '2026-08-18', balanceAfter: 14900, sourceRule: 'review_photo' },
    { id: 'log-6', title: '连续签到7日奖励', amount: 25, type: 'earn', date: '2026-08-20', balanceAfter: 14925, sourceRule: 'daily_checkin' },
    { id: 'log-7', title: '年度忠诚会员奖励预发放', amount: 1875, type: 'earn', date: '2026-08-21', balanceAfter: 16800, sourceRule: 'annual_reward' },
  ]);

  // Check-in (2026-08 rules: 每天 +5，连续 7 天额外 +20)
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkinStreak, setCheckinStreak] = useState(6);

  const doCheckin = () => {
    if (checkedInToday) {
      return { success: false, pointsAdded: 0, message: '今日已完成签到，明天继续来聚！' };
    }
    const isStreak7 = (checkinStreak + 1) % 7 === 0;
    const reward = isStreak7 ? 25 : 5; // 5 base, +20 bonus on 7th day
    const newPoints = userProfile.points + reward;
    const newStreak = checkinStreak + 1;

    setUserProfile((prev) => ({ ...prev, points: newPoints }));
    setCheckedInToday(true);
    setCheckinStreak(newStreak);

    setPointsLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title: isStreak7 ? `连续签到第 ${newStreak} 天特别奖励 (+5 基础 +20 连签好礼)` : `每日签到奖励 (连续第 ${newStreak} 天)`,
        amount: reward,
        type: 'earn',
        date: new Date().toISOString().split('T')[0],
        balanceAfter: newPoints,
        sourceRule: 'daily_checkin',
      },
      ...prev,
    ]);

    confetti({
      particleCount: isStreak7 ? 120 : 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    return {
      success: true,
      pointsAdded: reward,
      message: isStreak7
        ? `恭喜您连续坚持 7 天！获得 5 分 + 额外 20 分大礼包（共 +25 积分）！`
        : `签到成功！赠送 +${reward} 积分，已连续坚持 ${newStreak} 天！`,
    };
  };

  // Saved Travelers
  const [travelers, setTravelers] = useState<Traveler[]>([
    {
      id: 'tr-1',
      name: '赵元博',
      idCard: '310104195508121234',
      phone: '138 0123 6688',
      isSenior: true,
      dietaryNote: '低盐低糖，不吃香菜',
      healthNote: '血压轻微偏高，已遵医嘱服药，日常步数无碍',
      emergencyContactName: '赵晓琳',
      emergencyContactPhone: '139 1888 9966',
    },
    {
      id: 'tr-2',
      name: '林雅琴 (老伴)',
      idCard: '310104195704255678',
      phone: '138 0123 6689',
      isSenior: true,
      dietaryNote: '偏好清淡江南本帮菜',
      healthNote: '膝关节偶有微酸，平缓步道无压力',
    },
    {
      id: 'tr-3',
      name: '钱宏发 (老同学/牌友)',
      idCard: '320501195409153456',
      phone: '139 0512 8899',
      isSenior: true,
      dietaryNote: '常年素食',
    },
  ]);

  const addTraveler = (t: Omit<Traveler, 'id'>) => {
    const newTr: Traveler = { ...t, id: `tr-${Date.now()}` };
    setTravelers((prev) => [...prev, newTr]);
    showToast('已成功添加出行老友档案');
  };

  const removeTraveler = (id: string) => {
    setTravelers((prev) => prev.filter((t) => t.id !== id));
    showToast('已移除出行人信息');
  };

  // Orders
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-1001',
      orderNo: 'LYJ20260812009',
      bizType: 'activity',
      targetId: 'act-1',
      targetTitle: '《江南文脉·苏州园林美学与昆曲私享名师慢游 5日》',
      targetCover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
      tripCategory: 'domestic',
      departureDate: '2026-09-26',
      groupType: 'small',
      unitPrice: 5680,
      travelers: [travelers[0], travelers[1]],
      totalPrice: 11360,
      pointsUsed: 10000,
      pointsDeductedAmount: 100, // 国内封顶抵 100 元
      payAmount: 11260,
      earnedPoints: 25335,
      status: 'paid',
      createdAt: '2026-08-12 10:24',
      contactName: '赵元博',
      contactPhone: '138 0123 6688',
      roomPreference: 'twin',
    },
    {
      id: 'ord-1002',
      orderNo: 'LYJ20260805003',
      bizType: 'event',
      targetId: 'evt-1',
      targetTitle: '《第二届全国乐龄“智汇杯”掼蛋大师黄山公开赛》',
      targetCover: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=400&q=80',
      tripCategory: 'domestic',
      departureDate: '2026-10-18',
      unitPrice: 2280,
      travelers: [travelers[0], travelers[2]],
      totalPrice: 4560,
      pointsUsed: 0,
      pointsDeductedAmount: 0,
      payAmount: 4560,
      earnedPoints: 10260,
      status: 'paid',
      createdAt: '2026-08-05 16:40',
      contactName: '赵元博',
      contactPhone: '138 0123 6688',
    },
  ]);

  const createOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo: `LYJ${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
      bizType: orderData.bizType || 'activity',
      targetId: orderData.targetId || '',
      targetTitle: orderData.targetTitle || '',
      targetCover: orderData.targetCover || '',
      tripCategory: orderData.tripCategory || 'domestic',
      departureDate: orderData.departureDate,
      groupType: orderData.groupType || 'large',
      unitPrice: orderData.unitPrice || 0,
      travelers: orderData.travelers || [travelers[0]],
      totalPrice: orderData.totalPrice || 0,
      pointsUsed: orderData.pointsUsed || 0,
      pointsDeductedAmount: orderData.pointsDeductedAmount || 0,
      payAmount: orderData.payAmount || 0,
      earnedPoints: orderData.earnedPoints || 0,
      status: 'pending_pay',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      contactName: orderData.contactName || userProfile.name,
      contactPhone: orderData.contactPhone || userProfile.phone,
      roomPreference: orderData.roomPreference || 'twin',
      hasFreeQuotaUsed: orderData.hasFreeQuotaUsed || false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const payOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Deduct points if used (100 pts = 1 RMB)
    if (targetOrder.pointsUsed > 0) {
      setUserProfile((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - targetOrder.pointsUsed),
      }));
      setPointsLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          title: `报名出游抵扣现金 (${targetOrder.targetTitle.slice(0, 12)}...)`,
          amount: -targetOrder.pointsUsed,
          type: 'spend',
          date: new Date().toISOString().split('T')[0],
          balanceAfter: userProfile.points - targetOrder.pointsUsed,
          sourceRule: 'deduct',
        },
        ...prev,
      ]);
    }

    // Free quota used
    if (targetOrder.hasFreeQuotaUsed) {
      setUserProfile((prev) => ({
        ...prev,
        freeQuotaUsed: prev.freeQuotaUsed + 1,
      }));
    }

    // Award booking points
    if (targetOrder.earnedPoints > 0) {
      setUserProfile((prev) => ({
        ...prev,
        points: prev.points + targetOrder.earnedPoints,
      }));
      setPointsLogs((prev) => [
        {
          id: `log-earn-${Date.now()}`,
          title: `活动报名出行立得积分 (实付 ¥${targetOrder.payAmount} × 10 × ${currentTier.multiplier}x × 品类系数)`,
          amount: targetOrder.earnedPoints,
          type: 'earn',
          date: new Date().toISOString().split('T')[0],
          balanceAfter: userProfile.points + targetOrder.earnedPoints,
          sourceRule: 'booking',
        },
        ...prev,
      ]);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
    );

    // Write audit log
    const logItem: OperationLog = {
      id: `op-${Date.now()}`,
      adminName: '系统支付网关',
      action: '订单支付成功',
      module: 'orders',
      detail: `订单【${targetOrder.orderNo}】实付 ¥${targetOrder.payAmount}，抵扣 ${targetOrder.pointsUsed} 积分，赠送 ${targetOrder.earnedPoints} 积分`,
      ip: '127.0.0.1',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    setOperationLogs((prev) => [logItem, ...prev]);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    showToast('支付成功！您的专属出行管家「小老友」将在24小时内与您电话联系');
  };

  const cancelOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.pointsUsed > 0 && targetOrder.status === 'paid') {
      // Refund points
      setUserProfile((prev) => ({ ...prev, points: prev.points + targetOrder.pointsUsed }));
      setPointsLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          title: `订单取消积分退回 (${targetOrder.targetTitle.slice(0, 10)})`,
          amount: targetOrder.pointsUsed,
          type: 'earn',
          date: new Date().toISOString().split('T')[0],
          balanceAfter: userProfile.points + targetOrder.pointsUsed,
        },
        ...prev,
      ]);
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    showToast('订单已成功取消');
  };

  const requestRefund = (orderId: string, reason: string = '行程时间冲突，申请退改') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'refund_requested',
              refundReason: reason,
              refundTime: new Date().toLocaleString('zh-CN', { hour12: false }),
            }
          : o
      )
    );
    showToast('已提交退款申请，我们将在1个工作日内微信原路退回');
  };

  const auditRefund = (orderId: string, approved: boolean) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (approved) {
      // Restore points if used
      if (order.pointsUsed > 0) {
        setUserProfile((prev) => ({ ...prev, points: prev.points + order.pointsUsed }));
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' } : o))
      );
      showToast(`订单 ${order.orderNo} 退款审批通过，已原路退回 ¥${order.payAmount}`);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
      );
      showToast(`订单 ${order.orderNo} 退款申请已驳回`);
    }
  };

  const redeemProduct = (product: PointsProduct, address: string) => {
    if (userProfile.points < product.pointsCost) {
      return { success: false, message: '您的积分余额不足以兑换该礼品' };
    }
    const newBal = userProfile.points - product.pointsCost;
    setUserProfile((prev) => ({ ...prev, points: newBal }));
    setPointsLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title: `积分商城兑换【${product.name.slice(0, 12)}...】`,
        amount: -product.pointsCost,
        type: 'spend',
        date: new Date().toISOString().split('T')[0],
        balanceAfter: newBal,
        sourceRule: 'mall_redeem',
      },
      ...prev,
    ]);

    // Create redemption record with shipping tracking
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingNo = `SF1${randomSuffix}88`;
    const newRedemption: PointsRedemption = {
      id: `red-${Date.now()}`,
      redemptionNo: `DH${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(100 + Math.random() * 900)}`,
      productId: product.id,
      productName: product.name,
      productCover: product.cover,
      pointsCost: product.pointsCost,
      recipientName: userProfile.name,
      recipientPhone: userProfile.phone,
      shippingAddress: address || '上海市黄浦区复兴中路507弄8号302室',
      courierName: '顺丰速运',
      trackingNumber: trackingNo,
      status: 'pending_shipment',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      logisticsTrace: [
        {
          time: new Date().toLocaleString('zh-CN', { hour12: false }),
          title: '已提交礼遇兑换申请',
          detail: '仓库已生成出库备货单，准备加固防震打包',
        },
      ],
    };

    setPointsRedemptions((prev) => [newRedemption, ...prev]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    return {
      success: true,
      message: `兑换成功！顺丰运单号已预分配：${trackingNo}，3个工作日内送达。`,
    };
  };

  const updateRedemptionTracking = (
    id: string,
    courierName: string,
    trackingNumber: string,
    status: 'pending_shipment' | 'shipped' | 'delivered' = 'shipped',
    traceDetail?: string
  ) => {
    setPointsRedemptions((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
          const defaultTrace =
            status === 'delivered'
              ? '老友本人已确认签收，感谢您的参与！'
              : status === 'shipped'
              ? '顺丰/EMS 集散中心已揽收并发往老友收件地址'
              : '仓储物流中心已接收打包指令';
          const newTrace = [
            ...(r.logisticsTrace || []),
            {
              time: nowStr,
              title: status === 'delivered' ? '已签收送达' : status === 'shipped' ? '已发货运输中' : '仓库备货中',
              detail: traceDetail || `【${courierName}】运单号 ${trackingNumber} · ${defaultTrace}`,
            },
          ];
          return {
            ...r,
            courierName,
            trackingNumber,
            status,
            shippedAt: status !== 'pending_shipment' ? (r.shippedAt || nowStr) : undefined,
            logisticsTrace: newTrace,
          };
        }
        return r;
      })
    );
    showToast('快递单号与发货物流状态已更新！');
  };

  // Check Free Campaign and Annual Free Quota Eligibility
  const checkFreeEligibility = (activityId: string): { isEligible: boolean; reason: string; campaignId?: string } => {
    // 1. Check FreeCampaigns (subsequentFree rule)
    const matchingCampaigns = freeCampaigns.filter(
      (c) => c.enabled && (c.activityId === activityId || c.subsequentFreeActivityIds?.includes(activityId))
    );

    for (const camp of matchingCampaigns) {
      // Verify member scope
      const isMemberMatch =
        camp.memberScope === 'all' ||
        (camp.memberScope === 'specific_tiers' && camp.targetMemberTierIds?.includes(currentTier.id as any));

      if (isMemberMatch) {
        if (camp.ruleType === 'subsequentFree') {
          const requiredPaid = camp.paidTimesRequired || 1;
          const userPaidCount = orders.filter(
            (o) => o.status === 'paid' && o.targetId === camp.activityId && !o.hasFreeQuotaUsed
          ).length;

          if (userPaidCount >= requiredPaid && camp.remainingQuota > 0) {
            return {
              isEligible: true,
              reason: `特惠免单：您已在指定时段内付款参加过《${camp.activityTitle}》，根据【首购后后续免费】特权，本次出游全额免单！`,
              campaignId: camp.id,
            };
          }
        } else if (camp.ruleType === 'annualLoyalty') {
          if (userProfile.annualFreeQuota > userProfile.freeQuotaUsed) {
            return {
              isEligible: true,
              reason: `高阶会员礼遇：享有每年 1 次免费慢游名额，本次出游全额免单！`,
              campaignId: camp.id,
            };
          }
        }
      }
    }

    // 2. Default Annual Free Quota
    if (userProfile.annualFreeQuota > userProfile.freeQuotaUsed) {
      return {
        isEligible: true,
        reason: `享有年度免费慢游资格 (剩余 ${userProfile.annualFreeQuota - userProfile.freeQuotaUsed} 次)，可免除 1 位出行人全部费用！`,
      };
    }

    return { isEligible: false, reason: '' };
  };

  // Review Operations
  const openWriteReview = (act: Activity) => {
    setReviewTargetActivity(act);
    setIsReviewModalOpen(true);
  };

  const closeWriteReview = () => {
    setIsReviewModalOpen(false);
    setReviewTargetActivity(null);
  };

  const submitReview = (activityId: string, rating: number, content: string, images?: string[]) => {
    const act = activities.find((a) => a.id === activityId) || selectedActivity;
    const hasPhotos = images && images.length > 0;
    const potentialPoints = hasPhotos ? 100 : 50;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      activityId,
      activityTitle: act?.title || '老友慢游活动',
      author: userProfile.name,
      avatar: userProfile.avatar,
      memberLevel: currentTier.name,
      rating,
      date: new Date().toISOString().split('T')[0],
      content,
      images,
      likes: 0,
      isLiked: false,
      status: 'pending', // 提交后待后台审核
      pointsAwarded: potentialPoints,
    };

    setReviews((prev) => [newRev, ...prev]);

    // Also update activity reviews if present
    if (act) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, reviews: [newRev, ...a.reviews] } : a))
      );
    }

    closeWriteReview();
    showToast(`评价提交成功！审核通过后将立得 +50 积分${hasPhotos ? '（晒图加赠 +50 积分，共 +100 分）' : ''}！`);
  };

  const likeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likes: isLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
          };
        }
        return r;
      })
    );
    showToast('感谢您的点赞与共鸣！');
  };

  const auditReview = (reviewId: string, status: 'approved' | 'rejected', reply?: string) => {
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev) return;

    if (status === 'approved' && targetRev.status === 'pending') {
      const reward = targetRev.pointsAwarded || (targetRev.images?.length ? 100 : 50);

      // If review is by current user, award points directly
      if (targetRev.author === userProfile.name) {
        setUserProfile((prev) => ({ ...prev, points: prev.points + reward }));
        setPointsLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            title: `活动评价审核通过奖励【${targetRev.activityTitle?.slice(0, 10) || '出游评价'}】`,
            amount: reward,
            type: 'earn',
            date: new Date().toISOString().split('T')[0],
            balanceAfter: userProfile.points + reward,
            sourceRule: 'review',
          },
          ...prev,
        ]);
      }

      showToast(`评价已审核通过，已为会员发放 +${reward} 积分！`);
    } else if (status === 'rejected') {
      showToast('评价已标记驳回');
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              status,
              adminReply: reply || r.adminReply,
            }
          : r
      )
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    showToast('评价已删除');
  };

  // Referral / Invite Friend Simulation
  const simulateFriendJoinAndTrip = () => {
    const friendNames = ['钱伯初 (老同学)', '孙立文 (太极队队长)', '周秀华 (摄影老友)', '吴建平 (大学舍友)'];
    const randomName = friendNames[Math.floor(Math.random() * friendNames.length)];
    const reward = 1000; // 邀请好友首次出游获 1000 积分

    const newRecord = {
      id: `inv-${Date.now()}`,
      friendName: randomName,
      friendPhone: `138****${Math.floor(1000 + Math.random() * 9000)}`,
      friendAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      status: 'completed_trip' as const,
      date: new Date().toISOString().split('T')[0],
      pointsEarned: reward,
    };

    setInvites((prev) => ({
      ...prev,
      totalInvited: prev.totalInvited + 1,
      totalTripped: prev.totalTripped + 1,
      totalPointsEarned: prev.totalPointsEarned + reward,
      records: [newRecord, ...prev.records],
    }));

    setUserProfile((prev) => ({ ...prev, points: prev.points + reward }));
    setPointsLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title: `好友【${randomName}】首次报名出游奖励`,
        amount: reward,
        type: 'earn',
        date: new Date().toISOString().split('T')[0],
        balanceAfter: userProfile.points + reward,
        sourceRule: 'invite',
      },
      ...prev,
    ]);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 },
    });

    showToast(`🎉 成功邀请好友【${randomName}】完成首场出游，恭喜您获得 +1,000 积分！`);
  };

  // Modals & Navigation
  const openBooking = (type: 'activity' | 'event', data: Activity | TournamentEvent) => {
    setBookingTarget({ type, data });
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setBookingTarget(null);
  };

  const openPoster = (data: Activity | TournamentEvent) => {
    setPosterData(data);
    setIsPosterOpen(true);
  };

  const closePoster = () => {
    setIsPosterOpen(false);
    setPosterData(null);
  };

  const voteWish = (wishId: string) => {
    setWishes((prev) =>
      prev.map((w) => {
        if (w.id === wishId) {
          const isLiked = !w.isLiked;
          const likes = isLiked ? w.likes + 1 : w.likes - 1;
          const status = likes >= w.votesRequired ? 'in_preparation' : w.status;
          return { ...w, isLiked, likes, status };
        }
        return w;
      })
    );
    showToast('感谢您的支持与投票！满50票即刻立项发团');
  };

  const addWish = (newWish: Omit<WishItem, 'id' | 'likes' | 'status' | 'votesRequired' | 'createdAt'>) => {
    const item: WishItem = {
      ...newWish,
      id: `wish-${Date.now()}`,
      likes: 1,
      isLiked: true,
      status: 'voting',
      votesRequired: 50,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWishes((prev) => [item, ...prev]);
    showToast('您的心愿目的地已发布！老友们正在为您投票');
  };

  const auditWish = (wishId: string, approved: boolean) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, status: approved ? 'approved' : 'voting' } : w))
    );
    showToast(approved ? '心愿已审核立项！' : '心愿已驳回');
  };

  // Admin CRUD helper implementations
  const addActivity = (act: Activity) => {
    setActivities((prev) => [act, ...prev]);
    showToast(`活动【${act.title.slice(0, 10)}...】已成功添加`);
  };

  const updateActivity = (id: string, partial: Partial<Activity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...partial } : a)));
    showToast('活动信息已更新');
  };

  const toggleActivityStatus = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'published' ? 'offline' : 'published';
          showToast(`活动状态已切换为：${nextStatus === 'published' ? '已上架' : '已下架'}`);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('活动已删除');
  };

  const addEvent = (evt: TournamentEvent) => {
    setEvents((prev) => [evt, ...prev]);
    showToast(`赛事【${evt.title.slice(0, 10)}...】已成功发布`);
  };

  const updateEvent = (id: string, partial: Partial<TournamentEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...partial } : e)));
    showToast('赛事信息已更新');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('赛事已删除');
  };

  const addFreeCampaign = (camp: FreeCampaign) => {
    setFreeCampaigns((prev) => [camp, ...prev]);
    showToast('免费活动规则已创建');
  };

  const updateFreeCampaign = (id: string, partial: Partial<FreeCampaign>) => {
    setFreeCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
    showToast('免费活动规则已更新');
  };

  const deleteFreeCampaign = (id: string) => {
    setFreeCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('免费活动规则已删除');
  };

  const toggleFreeCampaign = (id: string) => {
    setFreeCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    showToast('免费活动状态已变更');
  };

  const addKnowledgeItem = (item: Omit<AIKnowledgeItem, 'id' | 'useCount'>) => {
    const newItem: AIKnowledgeItem = {
      ...item,
      id: `kno-${Date.now()}`,
      useCount: 0,
    };
    setAiKnowledgeList((prev) => [newItem, ...prev]);
    showToast('已录入知识库');
  };

  const resolveChatLog = (id: string) => {
    setChatLogs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
    showToast('客服工单状态已更新');
  };

  const adjustMemberPoints = (delta: number, reason: string) => {
    const newBal = Math.max(0, userProfile.points + delta);
    setUserProfile((prev) => ({ ...prev, points: newBal }));
    setPointsLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title: `【管理员手动调整】${reason}`,
        amount: delta,
        type: delta >= 0 ? 'earn' : 'spend',
        date: new Date().toISOString().split('T')[0],
        balanceAfter: newBal,
        sourceRule: 'admin_adjust',
      },
      ...prev,
    ]);
    showToast(`积分已调整：${delta > 0 ? `+${delta}` : delta} 分`);
  };

  const addMerchantApplication = (
    appData: Omit<MerchantApplication, 'id' | 'createdAt' | 'status'>
  ) => {
    const newMerchant: MerchantApplication = {
      ...appData,
      id: `mer-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMerchants((prev) => [newMerchant, ...prev]);
    showToast('商家合作申请已提交！专属文旅商务管家将在24小时内联系您');
  };

  const auditMerchantApplication = (
    id: string,
    status: 'approved' | 'rejected',
    note?: string
  ) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              auditNote: note || (status === 'approved' ? '审核通过，已对接文旅合作' : '未通过审核'),
            }
          : m
      )
    );
    showToast(`商户合作申请已${status === 'approved' ? '批准通过' : '驳回'}`);
  };

  // ================= 管理员与权限管理 =================
  const addAdminUser = (userData: Omit<AdminUser, 'id'>) => {
    const newUser: AdminUser = {
      ...userData,
      id: `adm-${Date.now()}`,
      lastLogin: '从未登录',
      permissions: userData.permissions || getDefaultPermissionsByRole(userData.role),
    };
    setAdminUsers((prev) => [...prev, newUser]);
    showToast(`成功新增管理员：${newUser.name} (${newUser.account})`);
  };

  const updateAdminUser = (id: string, partial: Partial<AdminUser>) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...partial };
          if (partial.role && partial.role !== u.role && !partial.permissions) {
            updated.permissions = getDefaultPermissionsByRole(partial.role);
          }
          if (currentAdminUser.id === id) {
            setCurrentAdminUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    showToast('管理员账号与权限已更新保存');
  };

  const deleteAdminUser = (id: string) => {
    if (adminUsers.length <= 1) {
      showToast('系统至少需保留一个超级管理员账号');
      return;
    }
    const target = adminUsers.find((u) => u.id === id);
    if (target?.role === 'superAdmin' && adminUsers.filter((u) => u.role === 'superAdmin').length <= 1) {
      showToast('唯一超级管理员不可删除');
      return;
    }
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('管理员账号已删除');
  };

  const hasPermission = (permKey: string): boolean => {
    if (!currentAdminUser) return false;
    if (currentAdminUser.role === 'superAdmin') return true;
    if (currentAdminUser.role === 'admin') {
      // 管理员拥有除系统底层配置和权限分配外的全部权限
      return permKey !== 'config.edit' && permKey !== 'admins.manage' && permKey !== 'config';
    }
    if (currentAdminUser.role === 'operations') {
      const opPerms = getDefaultPermissionsByRole('operations');
      if (permKey === 'config' || permKey === 'admins') return false;
      return opPerms.includes(permKey) || opPerms.some((p) => p.startsWith(permKey.split('.')[0]));
    }
    // 操作员 (按细分子类勾选)
    const userPerms = currentAdminUser.permissions || [];
    if (userPerms.includes(permKey)) return true;
    const baseModule = permKey.split('.')[0];
    if (userPerms.some((p) => p.startsWith(`${baseModule}.`) || p === baseModule)) return true;
    return false;
  };

  // ================= 数据字典表管理 =================
  const addDictCategory = (catData: Omit<DictCategory, 'id'>) => {
    const newCat: DictCategory = {
      ...catData,
      id: `cat_${catData.code || Date.now()}`,
    };
    setDictCategories((prev) => [...prev, newCat]);
    showToast(`字典类型【${newCat.name}】已创建`);
  };

  const updateDictCategory = (id: string, partial: Partial<DictCategory>) => {
    setDictCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
    showToast('字典类型信息已更新');
  };

  const deleteDictCategory = (id: string) => {
    const target = dictCategories.find((c) => c.id === id);
    if (target?.isSystem) {
      showToast('系统核心字典类型不可删除');
      return;
    }
    setDictCategories((prev) => prev.filter((c) => c.id !== id));
    setDictItems((prev) => prev.filter((i) => i.categoryCode !== target?.code));
    showToast('字典类型及关联字典项已删除');
  };

  const addDictItem = (itemData: Omit<DictItem, 'id'>) => {
    const newItem: DictItem = {
      ...itemData,
      id: `dict_${Date.now()}`,
    };
    setDictItems((prev) => [...prev, newItem]);
    showToast(`字典项【${newItem.name}】已添加`);
  };

  const updateDictItem = (id: string, partial: Partial<DictItem>) => {
    setDictItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...partial } : i)));
    showToast('字典项已更新保存');
  };

  const deleteDictItem = (id: string) => {
    setDictItems((prev) => prev.filter((i) => i.id !== id));
    showToast('字典项已删除');
  };

  const toggleDictItemStatus = (id: string) => {
    setDictItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'active' ? 'disabled' : 'active' } : i))
    );
    showToast('字典项启用状态已切换');
  };

  const getDictItemsByCategory = (categoryCode: string): DictItem[] => {
    return dictItems
      .filter((i) => i.categoryCode === categoryCode && i.status === 'active')
      .sort((a, b) => a.sort - b.sort);
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminActiveTab,
        setAdminActiveTab,
        activeTab,
        setActiveTab,
        isLargeFont,
        setIsLargeFont,
        isCareMode,
        setIsCareMode,
        toggleCareMode,
        deviceMode,
        setDeviceMode,
        activities,
        setActivities,
        events,
        setEvents,
        tgos,
        setTgos,
        pointsProducts,
        setPointsProducts,
        pointsRedemptions,
        setPointsRedemptions,
        updateRedemptionTracking,
        wishes,
        articles,
        reviews,
        invites,
        freeCampaigns,
        aiKnowledgeList,
        chatLogs,
        operationLogs,
        adminUsers,
        setAdminUsers,
        currentAdminUser,
        setCurrentAdminUser,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        hasPermission,
        adminTheme,
        setAdminTheme,
        dictCategories,
        setDictCategories,
        dictItems,
        setDictItems,
        addDictCategory,
        updateDictCategory,
        deleteDictCategory,
        addDictItem,
        updateDictItem,
        deleteDictItem,
        toggleDictItemStatus,
        getDictItemsByCategory,
        merchants,
        addMerchantApplication,
        auditMerchantApplication,
        pointsConfig,
        selectedActivity,
        setSelectedActivity,
        selectedEvent,
        setSelectedEvent,
        selectedTgo,
        setSelectedTgo,
        isTgoListOpen,
        setIsTgoListOpen,
        isBookingOpen,
        bookingTarget,
        openBooking,
        closeBooking,
        isCheckinOpen,
        setIsCheckinOpen,
        isPointsMallOpen,
        setIsPointsMallOpen,
        isPosterOpen,
        posterData,
        openPoster,
        closePoster,
        isMembershipModalOpen,
        setIsMembershipModalOpen,
        isPointsGuideOpen,
        setIsPointsGuideOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewTargetActivity,
        openWriteReview,
        closeWriteReview,
        isHealthModalOpen,
        setIsHealthModalOpen,
        updateHealthProfile,
        isGlobalAiOpen,
        setIsGlobalAiOpen,
        globalAiInitialPrompt,
        setGlobalAiInitialPrompt,
        openGlobalAiWithPrompt,
        userProfile,
        setUserProfile,
        currentTier,
        favorites,
        toggleFavorite,
        isFavorited,
        pointsLogs,
        checkedInToday,
        checkinStreak,
        doCheckin,
        redeemProduct,
        checkFreeEligibility,
        submitReview,
        likeReview,
        auditReview,
        deleteReview,
        simulateFriendJoinAndTrip,
        orders,
        createOrder,
        payOrder,
        cancelOrder,
        requestRefund,
        auditRefund,
        travelers,
        addTraveler,
        removeTraveler,
        voteWish,
        addWish,
        auditWish,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityStatus,
        addEvent,
        updateEvent,
        deleteEvent,
        addFreeCampaign,
        updateFreeCampaign,
        deleteFreeCampaign,
        toggleFreeCampaign,
        addKnowledgeItem,
        resolveChatLog,
        adjustMemberPoints,
        calculatePointsEarned,
        calculateMaxPointsDeduction,
        toastMessage,
        showToast,
        isTripReminderEnabled,
        setIsTripReminderEnabled,
        toggleTripReminder,
        tripReminderLeadHours,
        setTripReminderLeadHours,
        hasUnreadTripReminder,
        setHasUnreadTripReminder,
        activeTripReminderNotice,
        setActiveTripReminderNotice,
        isTripReminderModalOpen,
        setIsTripReminderModalOpen,
        triggerTripReminderCheck,
        dismissTripReminder,
        previewTarget,
        openFrontPreview,
        closeFrontPreview,
        siteInfo,
        updateSiteInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

