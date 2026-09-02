// 老友记文旅产品 3.1 版本「三维三轨」全新制度框架
export type ProductTheme = '文化' | '体育' | '农业' | '健康'; // 第一维：4大产品主题
export type ProductForm = '观光' | '研学' | '旅居' | '社交'; // 第二维：4大体验载体形式
export type ProductCarrier = '游轮' | '专列' | '自驾' | '赛事课堂' | '航空包机' | '无障碍大巴'; // 配套体验载体单元
export type TimeLevel = 'L1' | 'L2' | 'L3' | 'L4'; // 第三维：L1(单日/半日周边) | L2(1-3晚短途) | L3(跨省长途4天+) | L4(旅居3天+/高端包机康养)
export type BusinessTrack = 'track1_marketing' | 'track2_mainstream' | 'track3_premium'; // 三轨：轨道1营销引流 | 轨道2常规主力 | 轨道3高端定制特需

export type ActivityCategory = '文化' | '体育' | '农业' | '健康' | '学者同行' | '慢游雅居' | '茶道文博' | '康养山海';
export type ActivityForm = '观光' | '研学' | '旅居' | '社交' | '名校名师研学' | '慢调旅居' | '雅集沙龙' | '体验游' | '赛事游';
export type ActivityLevel = '典雅舒适' | '尊享名仕' | '黑金私享';
export type ActivityStatus = 'published' | 'draft' | 'offline' | 'expired';
export type GroupType = 'large' | 'small'; // 大团体验 (20-30人) vs 拼小团·名仕精品团 (6-12人)
export type TripCategoryType = 'local' | 'domestic' | 'outbound'; // 同城/本地 (1.0x, 最多抵30元) | 国内/跨省 (1.5x, 最多抵100元) | 出境/大额 (1.6x, 最多抵300元)

export interface TgoProfile {
  name: string;
  roleTitle: string; // e.g. "四季游金牌 TGO · 资深乐龄慢游管家"
  avatar: string;
  badge: string; // e.g. "国家一级导游 · 红十字急救员"
  experienceYears: number; // e.g. 12
  tripsLed: number; // e.g. 180+
  serviceRating: number; // e.g. 5.0
  tags: string[]; // e.g. ["慢节奏引导", "熟知适老急救", "单反跟拍相册", "耐心温和"]
  motto: string; // e.g. "把每位长辈当自己的父母悉心照料，让每一段旅途都充满安心与温情。"
  phone?: string;
}

export interface MasterProfile {
  name: string;
  title: string;
  avatar: string;
  intro: string;
  badge: string;
}

export interface DayItinerary {
  day: number;
  title: string;
  theme?: string;
  morning: string;
  afternoon: string;
  evening: string;
  dining?: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  meals?: string;
  hotel: string;
  stepsEstimated?: string; // e.g. "约 4,200 步 (平缓石板路，无台阶)"
  tips?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewItem {
  id: string;
  activityId: string;
  activityTitle?: string;
  author: string;
  userName?: string;
  avatar: string;
  memberLevel: string;
  rating: number; // 1-5
  date: string;
  content: string;
  images?: string[];
  likes: number;
  isLiked?: boolean;
  status: ReviewStatus;
  adminReply?: string;
  isFeatured?: boolean;
  pointsAwarded?: number; // 50 (纯文字) 或 100 (含晒图)
}

export interface DepartureRule {
  type: 'monthly_day' | 'weekly_day' | 'custom_dates' | 'daily';
  monthlyDays?: number[]; // 每月几号，如 [5, 15, 25] 或 [8, 18, 28]
  weeklyDays?: number[]; // 每周几，如 [2, 6] (0=周日, 1=周一, 2=周二, ...)
  customDates?: string[]; // 自定义日期列表
  ruleSummary?: string; // 发班规律概要，如 "每周二、周六固定发班" 或 "每月逢8发班 (8/18/28日)"
  advanceBookingDays?: number; // 提前截止预订天数，如 3天或5天
}

export interface ActivityDepartureDate {
  date: string;
  remainingSlots: number;
  totalSlots?: number;
  largePrice: number;
  smallPrice: number;
  singleSupplement?: number;
  status?: 'available' | 'few' | 'soldout' | 'guaranteed';
  available?: boolean;
  tag?: string;
}

export interface Activity {
  id: string;
  code: string; // e.g. "LYJ-2026-SUZ01"
  title: string;
  subtitle: string;
  cover: string;
  images: string[];
  // 3.1 三维三轨全新定义
  productTheme?: ProductTheme; // 文化 / 体育 / 农业 / 健康
  productForm?: ProductForm; // 观光 / 研学 / 旅居 / 社交
  productCarrier?: ProductCarrier; // 游轮 / 专列 / 自驾 / 赛事课堂 / 航空包机 / 无障碍大巴
  timeLevel?: TimeLevel; // L1(单日/半日周边) / L2(1-3晚短途) / L3(跨省长途4天+) / L4(旅居3天+/高端包机康养)
  businessTrack?: BusinessTrack; // track1_marketing(营销引流) / track2_mainstream(常规主力) / track3_premium(高端定制特需)
  category: ActivityCategory;
  form: ActivityForm;
  level: ActivityLevel;
  tripCategory?: TripCategoryType; // For Points Calculation rules (default: 'domestic' [1.5x, max 100元])
  durationDays: number;
  durationNights: number;
  destination: string;
  departureCity: string;
  departureDates: ActivityDepartureDate[];
  departureRule?: DepartureRule;
  // Dual-package pricing & details
  priceGroup: number; // 大团价
  pricePremium: number; // 拼小团价
  singleSupplement: number; // 单房差
  group: {
    size: string; // e.g. "20-30人经典文化大团"
    features: string[];
    coach: string;
    hotelType: string;
  };
  premium: {
    size: string; // e.g. "6-12人名仕私享小团"
    features: string[];
    coach: string;
    hotelType: string;
  };
  // Senior fitness rating (1-5, 1=Easiest)
  fitnessLevel: number;
  fitnessDesc: string; // e.g. "平缓慢行·适老五星·专配医疗急救包"
  tgo?: TgoProfile; // TGO 专属领队管家
  master?: MasterProfile;
  features: string[];
  seniorFeatures?: string[];
  itinerary: DayItinerary[];
  feeIncludes: {
    category: string;
    detail: string;
  }[];
  feeExcludes: string[]; // Strict 5 default items
  packingTips: string[];
  notice: string[];
  notices?: string[];
  viewCount: number;
  rating: number;
  reviewsCount: number;
  reviews: ReviewItem[];
  isFeatured?: boolean;
  isFreeEligible?: boolean;
  status?: ActivityStatus; // 'published' | 'draft' | 'offline' | 'expired'
  creator?: string; // 录入人/发布人，如 "周主管 (超级管理员)", "陆经理 (管理员)"
  createdAt?: string; // 录入时间，如 "2026-08-22"
  date?: string;
}

export type EventStatus = 'registration' | 'draft' | 'ongoing' | 'completed' | 'offline' | 'expired';

export interface TournamentEvent {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  // 3.1 三维三轨定义
  productTheme?: ProductTheme; // 体育 / 文化 / 健康 / 农业
  productForm?: ProductForm; // 社交 / 研学 / 旅居 / 观光
  productCarrier?: ProductCarrier; // 赛事课堂 / 自驾 / 专列 / 游轮
  timeLevel?: TimeLevel; // L1(半日/单日交流赛) / L2(周末跨城友谊赛) / L3(全国老友锦标巡回) / L4(候鸟旅居常青杯)
  businessTrack?: BusinessTrack; // track1_marketing(营销获客型) / track2_mainstream(常规联赛) / track3_premium(名士巡回赛)
  category: '掼蛋大师赛' | '常青藤乒乓球' | '中国象棋名士赛' | '乐龄围棋' | '常青藤桥牌' | '金秋摄影' | '太极养生功' | '乐龄门球' | string;
  tripCategory?: TripCategoryType;
  cover: string;
  images: string[];
  startDate: string;
  endDate: string;
  registrationDeadline?: string; // 报名截止时间
  venue: string; // 比赛场馆
  city: string; // 举办城市
  registrationFee: number; // 参赛会务费 (元)
  price?: number;
  maxTeams: number; // 席位/队伍上限
  registeredTeams: number; // 已报名组数
  creator?: string; // 录入人/发布人 (自动取当前管理员)
  createdAt?: string; // 录入时间
  status: EventStatus; // 'registration' | 'draft' | 'ongoing' | 'completed' | 'offline' | 'expired'
  // 奖池与荣誉 (重荣誉文旅礼遇，弱化博彩)
  prizePool: {
    first: string;
    second: string;
    third: string;
    participation: string; // ✨ 全员名士阳光普照礼
    points: number; // 赠送积分
    honors?: string[]; // 荣誉证书、金银铜奖杯、年度大师积分等
  };
  referee: MasterProfile; // 特邀国家级主裁判长 / 乐龄名宿
  // 赛程防疲劳节奏
  schedule: {
    time: string;
    title: string;
    desc: string;
    isRestBreak?: boolean; // 适老茶歇防疲劳休息段
  }[];
  // 适老专属医疗急救与健康守护保障
  medicalAssurance?: {
    hasAed: boolean;
    hasDoctor: boolean;
    preExam: string; // 赛前血压脉搏监测
    comfortSeats: string; // 适老静音护腰桌椅
    teaStation: string; // 低糖温润养生茶歇
    greenChannel: string; // 三甲绿色应急通道
  } | string[];
  rules: string[]; // 竞赛规程与计分规则
  healthDeclaration?: string[]; // 乐龄健康参赛守则 (建议50-75周岁、友谊第一、严禁私下涉赌)
  perks: string[]; // 参赛礼遇与尊享服务
  // 配套赛事+周边慢游康养套餐
  leisureExtension?: {
    title: string;
    desc: string;
    packagePrice?: number;
    highlights: string[];
  };
  isFreeEligible?: boolean;
}

export interface MerchantApplication {
  id: string;
  merchantName: string; // 机构/商户/基地名称
  merchantType: '康养基地/度假村' | '文化场馆/非遗研学' | '适老餐饮/茶社' | '医疗康复/健康检测' | '棋牌会所/俱乐部' | '其他特色服务' | string;
  businessType?: string;
  contactPerson: string;
  phone: string;
  contactPhone?: string;
  city: string;
  serviceDescription: string; // 提供服务或发起活动需求详情
  serviceCapacity?: string;
  description?: string;
  proposedActivityType?: string; // 拟发起或承办的活动
  advantage?: string; // 适老设施与优势（如电梯入户、医疗保障、无障碍通道等）
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  auditNote?: string;
}

export interface MemberTier {
  id: number;
  name: '初始会员' | '暖友' | '密友' | '挚友' | '契友' | '盟友';
  title: string;
  minPoints: number; // 年度积分要求
  maxPoints: number;
  multiplier: number; // e.g. x1.0, x1.2, x1.5, x1.8, x2.0
  color: string;
  badgeBg: string;
  perks: string[];
  annualFreeTrips: number;
  singleSupplementDiscount: string;
  birthdayGift: string;
}

export interface PointsProduct {
  id: string;
  name: string;
  cover: string;
  image?: string;
  pointsCost: number;
  originalPrice: number;
  category: '非遗名茶' | '文旅装备' | '乐龄赛事' | '文创典籍' | '出游礼券' | string;
  stock: number;
  sales: number;
  description: string;
  tags: string[];
  status?: 'active' | 'offline';
}

export interface PointsRedemption {
  id: string;
  redemptionNo: string;
  productId: string;
  productName: string;
  productCover: string;
  pointsCost: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  courierName: string; // 顺丰速运, 京东快递, EMS
  trackingNumber: string; // e.g. SF1688920188
  status: 'pending_shipment' | 'shipped' | 'delivered';
  createdAt: string;
  shippedAt?: string;
  logisticsTrace?: {
    time: string;
    title: string;
    detail: string;
  }[];
}

export interface WishItem {
  id: string;
  author: string;
  avatar: string;
  memberLevel: string;
  title: string;
  content: string;
  destination: string;
  suggestedDays: number;
  likes: number;
  isLiked?: boolean;
  status: 'voting' | 'approved' | 'in_preparation';
  votesRequired: number;
  createdAt: string;
  reason?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorTitle: string;
  avatar: string;
  cover: string;
  date: string;
  readCount: number;
  likes: number;
  tags: string[];
  content: string[];
  status?: 'published' | 'draft';
}

export interface SeniorTalentUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  title: string;
  tierName: '盟友' | '契友' | '挚友' | '密友' | '暖友' | '初始会员';
  tierColor: string;
  tierBadgeBg: string;
  points: number;
  monthlyPoints?: number;
  totalTrips: number;
  totalArticles: number;
  totalReviews: number;
  badges: string[];
  quote: string;
  likesCount: number;
  isLiked?: boolean;
  city: string;
  joinedDays: number;
}

export interface PastEventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  participantsCount: number;
  cover: string;
  photos: string[];
  highlights: string[];
  participantQuotes: {
    name: string;
    age: number;
    quote: string;
    avatar: string;
  }[];
}

export interface HealthProfile {
  id?: string;
  memberId?: string;
  bloodPressureStatus: 'normal' | 'controlled_hypertension' | 'high' | 'unknown'; // 血压状况
  heartCondition: 'normal' | 'arrhythmia' | 'coronary_stent' | 'severe' | 'none'; // 心血管状况
  mobilityLevel: 'independent' | 'gentle_walker' | 'cane_assisted' | 'wheelchair'; // 关节与行走活动度
  altitudeSensitivity: 'normal' | 'sensitive' | 'forbidden'; // 高原反应敏感度
  chronicConditions: string[]; // 慢性病标签，如 ['高血压', '糖尿病', '腰椎间盘突出', '痛风', '冠心病支架术后(>1年)']
  chronicDiseases?: string[];
  allergies: string[]; // 过敏源，如 ['海鲜', '青霉素', '花粉']
  dailyMedications: string[]; // 常用自备药品，如 ['降压药(氨氯地平)', '降糖药(二甲双胍)', '硝酸甘油(备用)']
  maxDailyStepsComfort: number; // 适宜每日最大步数（如 3000, 5000, 8000, 12000）
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  specialDietary: string; // 饮食禁忌或偏好
  medicalNotes: string; // 其他健康与照护嘱托
  lastUpdated: string;
  isDeclared: boolean; // 是否已在线申报
}

export interface Traveler {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  isSenior: boolean;
  dietaryNote?: string;
  dietaryRequirement?: string;
  healthNote?: string;
  healthProfile?: HealthProfile;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

export type OrderStatus = 'pending_pay' | 'paid' | 'travelling' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded';

export interface Order {
  id: string;
  orderNo: string;
  bizType: 'activity' | 'event' | 'mall';
  targetId: string;
  targetTitle: string;
  targetCover: string;
  tripCategory?: TripCategoryType;
  departureDate?: string;
  groupType?: GroupType;
  unitPrice: number;
  travelers: Traveler[];
  totalPrice: number;
  pointsUsed: number;
  pointsDeductedAmount: number;
  payAmount: number;
  earnedPoints: number;
  status: OrderStatus;
  createdAt: string;
  contactName: string;
  contactPhone: string;
  roomPreference?: 'twin' | 'king' | 'single_supplement';
  hasFreeQuotaUsed?: boolean;
  refundReason?: string;
  refundTime?: string;
  specialNeeds?: string;
}

export interface PointsLog {
  id: string;
  title: string;
  amount: number; // positive for gain, negative for spend
  type: 'earn' | 'spend';
  date: string;
  balanceAfter: number;
  sourceRule?: string;
}

export interface InviteRecord {
  id: string;
  friendName: string;
  friendPhone: string;
  friendAvatar: string;
  status: 'registered' | 'completed_trip';
  date: string;
  pointsEarned: number; // 0 for registered only, 1000 when completed first trip
}

export interface InviteInfo {
  code: string;
  shareUrl: string;
  totalInvited: number;
  totalTripped: number;
  totalPointsEarned: number;
  records: InviteRecord[];
}

export interface FreeCampaign {
  id: string;
  name?: string; // 营销方案名称
  activityId: string; // 关联主活动 ID (或 'all' 全部活动)
  activityTitle: string;
  rule?: 'paidOnce' | 'all' | 'annualLoyalty' | 'subsequentFree';
  ruleType?: 'paidOnce' | 'all' | 'annualLoyalty' | 'subsequentFree';
  ruleDesc: string;
  startDate?: string; // 适用时段起
  endDate?: string; // 适用时段止
  validUntil?: string;
  targetMemberScope?: 'all' | 'specific_tiers' | 'selected_members';
  memberScope?: 'all' | 'specific_tiers' | 'selected_members';
  targetTierNames?: string[];
  targetMemberTierIds?: (string | number)[];
  paidTimesRequired?: number; // 满足第几次全额付款后 (如 1)
  subsequentFreeActivityIds?: string[]; // 哪些后续活动可免费参加 (如 ['act-1', 'act-3'] 或 'same_series' 同系列)
  remainingQuota: number;
  totalQuota: number;
  claimedCount?: number;
  enabled: boolean;
}

export interface AIKnowledgeItem {
  id: string;
  category: '活动与行程' | '积分与会员' | '适老与医疗' | '退改与保障' | '掼蛋与赛事';
  question: string;
  answer: string;
  tags: string[];
  useCount: number;
}

export interface ChatLogItem {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  question: string;
  answer: string;
  timestamp: string;
  resolved: boolean;
  channel: 'ai_concierge' | 'human_service';
}

export interface OperationLog {
  id: string;
  adminName: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
  createdAt: string;
}

export type AdminRoleType = 'superAdmin' | 'admin' | 'operations' | 'operator';

export interface AdminPermissionItem {
  id: string;
  name: string;
  module: string;
  category: string;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  account: string;
  role: AdminRoleType;
  roleName?: string;
  phone: string;
  lastLogin: string;
  status: 'active' | 'disabled';
  permissions?: string[]; // Granular permission keys for operator or custom overrides
  department?: string;
  avatar?: string;
  note?: string;
}

export interface DictItem {
  id: string;
  code: string; // 标识码，如 'sightseeing', 'master_led'
  name: string; // 显示名称，如 '观光游', '名师随团'
  categoryCode: string; // 归属字典类别编码，如 'trip_forms', 'tags'
  sort: number; // 排序号，越小越靠前
  status: 'active' | 'disabled'; // 启用 / 停用
  color?: string; // 标签视觉色 (amber, emerald, blue, rose, purple, etc.)
  isDefault?: boolean; // 系统内置
  description?: string; // 说明备注
}

export interface DictCategory {
  id: string;
  code: string; // e.g. 'trip_forms', 'tags', 'activity_categories', 'senior_care_services', 'tournament_categories', 'merchant_types'
  name: string; // e.g. '行程类型 / 行态', '标签库', '活动主题', '适老化保障服务', '赛事竞技项目', '商户合作类型'
  description: string;
  isSystem: boolean; // 是否系统核心字典
  icon?: string;
}

export interface RiskAlertItem {
  id: string;
  level: 'danger' | 'warning' | 'info';
  category: '气候温差' | '步道地形' | '年龄慢病' | '强度疲劳' | '应急通道' | string;
  title: string;
  triggerFactor: string;
  affectedScope: string;
  potentialHazard: string;
  warningMessage: string;
}

export interface MitigationMeasureItem {
  priority: 'urgent' | 'important' | 'routine';
  category: '管家随行' | '医疗急救' | '行程微调' | '物资装备' | '会员告知' | string;
  action: string;
  responsiblePerson: string;
}

export interface RiskAnalysisResult {
  suitabilityScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  overallVerdict: string;
  targetAgeSuitability: string;
  dimensionScores: {
    ageFitness: number;
    intensitySafety: number;
    weatherRisk: number;
    medicalEmergency: number;
  };
  riskAlerts: RiskAlertItem[];
  mitigationMeasures: MitigationMeasureItem[];
  butlerSafetyChecklist: string[];
  elderlyAdvisoryNotice: string;
}

export type AdminTab =
  | 'stats'
  | 'risk'
  | 'activities'
  | 'events'
  | 'merchants'
  | 'free'
  | 'mall'
  | 'members'
  | 'wishes'
  | 'reviews'
  | 'orders'
  | 'chatlogs'
  | 'news'
  | 'knowledge'
  | 'dictionaries'
  | 'admins'
  | 'config'
  | 'site_info'
  | 'posters'
  | 'suppliers'
  | 'finance'
  | 'refunds'
  | 'tgos'
  | 'tgo_apply'
  | 'activity_apply';

export interface TripReminderNotice {
  id: string;
  orderId: string;
  orderNo: string;
  bizType: 'activity' | 'event';
  title: string;
  cover: string;
  departureDate: string;
  hoursLeft: number;
  venueOrDestination: string;
  contactGuideName: string;
  contactGuidePhone: string;
  gatheringTime: string;
  gatheringPlace: string;
  weatherTips: string;
  medicationTips: string[];
  healthReminders: string[];
  packingChecklist: string[];
  status: 'upcoming_24h' | 'starting_today' | 'reminded';
  createdAt: string;
}



