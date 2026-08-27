import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Compass,
  Trophy,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Zap,
  Tag,
  Upload,
  Image as ImageIcon,
  Heart,
  Sliders,
  Check,
  Info,
  HelpCircle,
  Stethoscope,
  HeartPulse,
  Users,
  ShieldAlert,
  Flame,
  Coffee,
} from 'lucide-react';
import {
  Activity,
  TournamentEvent,
  ActivityCategory,
  ActivityForm,
  ActivityLevel,
  TripCategoryType,
  DayItinerary,
  DepartureRule,
  ActivityDepartureDate,
  ProductTheme,
  ProductForm,
  ProductCarrier,
  TimeLevel,
  BusinessTrack,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FEE_EXCLUDES } from '../../data/mockData';
import {
  NOTICE_TEMPLATES,
  PACKING_TEMPLATES,
  SENIOR_FEATURE_PACKAGES,
  PRESET_GALLERY_PHOTOS,
} from '../../data/adminTemplates';
import { AiActivityPreParserModal } from './AiActivityPreParserModal';

interface ActivityPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialActivity?: Activity | Partial<Activity> | null;
  initialEvent?: TournamentEvent | null;
  defaultMode?: 'activity' | 'event';
}

export const ActivityPublishModal: React.FC<ActivityPublishModalProps> = ({
  isOpen,
  onClose,
  initialActivity,
  initialEvent,
  defaultMode = 'activity',
}) => {
  const { addActivity, updateActivity, addEvent, updateEvent, showToast, currentAdminUser } = useApp();

  const [publishType, setPublishType] = useState<'activity' | 'event'>(
    initialEvent ? 'event' : defaultMode
  );
  const [activeSection, setActiveSection] = useState<'basic' | 'highlights' | 'master' | 'itinerary' | 'pricing' | 'notices'>('basic');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // 3.1 Framework Fields (Common)
  const [productTheme, setProductTheme] = useState<ProductTheme>('文化');
  const [productForm, setProductForm] = useState<ProductForm>('研学');
  const [productCarrier, setProductCarrier] = useState<ProductCarrier>('无障碍大巴');
  const [timeLevel, setTimeLevel] = useState<TimeLevel>('L3');
  const [businessTrack, setBusinessTrack] = useState<BusinessTrack>('track2_mainstream');
  const [creatorName, setCreatorName] = useState('');

  // Activity Form State
  const [actTitle, setActTitle] = useState('');
  const [actSubtitle, setActSubtitle] = useState('');
  const [actDestination, setActDestination] = useState('苏州·太湖');
  const [actDepartureCity, setActDepartureCity] = useState('上海市黄浦区集中发车');
  const [actCategory, setActCategory] = useState<ActivityCategory>('学者同行');
  const [actForm, setActForm] = useState<ActivityForm>('名校名师研学');
  const [actLevel, setActLevel] = useState<ActivityLevel>('尊享名仕');
  const [actTripCategory, setActTripCategory] = useState<TripCategoryType>('domestic');
  const [actDays, setActDays] = useState(5);
  const [actNights, setActNights] = useState(4);
  const [actPriceGroup, setActPriceGroup] = useState(3980);
  const [actPricePremium, setActPricePremium] = useState(5880);
  const [actSingleSupplement, setActSingleSupplement] = useState(800);

  // 3 Images Gallery (Cover + 2 Gallery Images) with size limits
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=800&q=80',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [targetImageSlot, setTargetImageSlot] = useState<number>(0);

  // Highlights & Senior Features
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState(2);
  const [fitnessDesc, setFitnessDesc] = useState('平缓慢行·适老五星·配随团急救医疗包');
  const [selectedSeniorBadges, setSelectedSeniorBadges] = useState<string[]>([
    '随团医护+AED',
    '每日≤4000步',
    '全程平缓无台阶',
    '五星适老防滑卫浴',
  ]);

  // Master & TGO Profile
  const [masterName, setMasterName] = useState('顾云舟 教授');
  const [masterTitle, setMasterTitle] = useState('复旦大学中华古籍保护研究院 特聘导师');
  const [masterBadge, setMasterBadge] = useState('国家文博专家');
  const [masterIntro, setMasterIntro] = useState(
    '深研江南园林与明清文人生活美学四十余载，讲学深入浅出，深受乐龄长辈喜爱。'
  );
  const [masterAvatar, setMasterAvatar] = useState(
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  );

  const [tgoName, setTgoName] = useState('林晨 (晨晨)');
  const [tgoRole, setTgoRole] = useState('四季游金牌乐龄管家');
  const [tgoBadge, setTgoBadge] = useState('国家一级导游 · 红十字急救员');
  const [tgoRating, setTgoRating] = useState(5.0);
  const [tgoAvatar, setTgoAvatar] = useState(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  );
  const [tgoMotto, setTgoMotto] = useState(
    '把每位长辈当自己的父母悉心照料，让每一段旅途充满安心与温情。'
  );

  // Group Details
  const [groupSize, setGroupSize] = useState('20-30人经典文化大团');
  const [groupCoach, setGroupCoach] = useState('豪华2+1航空大巴 (配一级低踏板)');
  const [groupHotel, setGroupHotel] = useState('严选五星适老化园林度假酒店');
  const [premiumSize, setPremiumSize] = useState('6-12人名仕私享小团');
  const [premiumCoach, setPremiumCoach] = useState('考斯特/奔驰商务专车 (1对1行李送房)');
  const [premiumHotel, setPremiumHotel] = useState('五星国宾馆/私享园林套房');

  // Itinerary (Days)
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);

  // Schedule Rule & Departure Dates
  const [departureRuleType, setDepartureRuleType] = useState<'weekly_day' | 'monthly_day' | 'custom_dates' | 'daily'>('weekly_day');
  const [selectedWeeklyDays, setSelectedWeeklyDays] = useState<number[]>([2, 6]);
  const [selectedMonthlyDays, setSelectedMonthlyDays] = useState<number[]>([5, 15, 25]);
  const [scheduleStartMonth, setScheduleStartMonth] = useState('2026-09');
  const [scheduleEndMonth, setScheduleEndMonth] = useState('2026-11');
  const [defaultBatchSlots, setDefaultBatchSlots] = useState(16);
  const [defaultBatchTag, setDefaultBatchTag] = useState('名师随团');
  const [ruleSummaryText, setRuleSummaryText] = useState('每周二、周六固定发班 (提前5天截止)');
  const [departureDates, setDepartureDates] = useState<ActivityDepartureDate[]>([]);
  const [newDateInput, setNewDateInput] = useState('2026-11-10');
  const [calendarViewMonth, setCalendarViewMonth] = useState('2026-09');

  // Notices, Packing Tips & Fees (With Templates)
  const [notices, setNotices] = useState<string[]>([]);
  const [newNoticeInput, setNewNoticeInput] = useState('');
  const [packingTips, setPackingTips] = useState<string[]>([]);
  const [newPackingInput, setNewPackingInput] = useState('');
  const [feeIncludes, setFeeIncludes] = useState<{ category: string; detail: string }[]>([
    { category: '住', detail: '行程所列五星标准适老化酒店或特色人文园林客栈双人间' },
    { category: '行', detail: '当地全程豪华适老2+1宽体航空大巴/奔驰商务车' },
    { category: '食', detail: '全程甄选地道养生膳食（少油低盐慢火炖煮，软烂可口）' },
    { category: '享', detail: '特邀名师讲座开讲、专属乐龄管家全程陪护照料、100万专项旅游意外险' },
  ]);
  const [feeExcludes, setFeeExcludes] = useState<string[]>([...DEFAULT_FEE_EXCLUDES]);

  // Tournament Event Form State
  const [evtTitle, setEvtTitle] = useState('2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛');
  const [evtSubtitle, setEvtSubtitle] = useState('黄山名山雅居 · 智力竞技与名仕温泉旅居双享');
  const [evtCity, setEvtCity] = useState('安徽 · 黄山');
  const [evtVenue, setEvtVenue] = useState('黄山国际温泉会议中心 · 大师赛专属展厅');
  const [evtCategory, setEvtCategory] = useState<string>('掼蛋大师赛');
  const [evtStartDate, setEvtStartDate] = useState('2026-10-22');
  const [evtEndDate, setEvtEndDate] = useState('2026-10-26');
  const [evtFee, setEvtFee] = useState(2680);
  const [evtRegisteredTeams, setEvtRegisteredTeams] = useState(18);
  const [evtTotalQuota, setEvtTotalQuota] = useState(64);
  const [evtStatus, setEvtStatus] = useState<'registration' | 'draft' | 'ongoing' | 'expired' | 'offline'>('registration');
  const [evtFirstPrize, setEvtFirstPrize] = useState('¥10,000 文旅研学基金 + 金质大师纪念奖杯 + 10,000名仕积分');
  const [evtSecondPrize, setEvtSecondPrize] = useState('¥5,000 文旅装备金 + 银质纪念奖章 + 5,000名仕积分');
  const [evtThirdPrize, setEvtThirdPrize] = useState('¥2,000 文旅装备金 + 铜质纪念奖章 + 2,000名仕积分');
  const [evtParticipationPrize, setEvtParticipationPrize] = useState('老友定制精美伴手礼盒 + 纯铜参赛纪念徽章 + 500名仕积分');
  const [evtPrizePoints, setEvtPrizePoints] = useState(10000);
  const [evtRefereeName, setEvtRefereeName] = useState('严裁判长');
  const [evtRefereeTitle, setEvtRefereeTitle] = useState('国家一级棋牌裁判员 / 智力运动会资深仲裁主任');
  const [evtRefereeBadge, setEvtRefereeBadge] = useState('国家级执裁');
  const [evtRefereeIntro, setEvtRefereeIntro] = useState('执裁智力运动会及全国乐龄棋牌赛十余载，严谨公正，深受长辈信赖。');
  const [evtRefereeAvatar, setEvtRefereeAvatar] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  );
  const [evtMedicalAssurances, setEvtMedicalAssurances] = useState<string[]>([
    '配备 2 台专业 AED 除颤仪与随队三甲急救医护人员',
    '赛前提供免费血压、脉搏健康筛查与健康档案建立',
    '赛场全场采用加厚人体工学护腰软椅与绿色无障碍通道',
    '全天供应温热养生草本茶饮（罗汉果茶、枸杞菊花茶）',
    '每日赛程严格限制在 2.5 小时内，每轮设 20 分钟颈椎放松操与茶歇',
  ]);
  const [evtCompanionPackage, setEvtCompanionPackage] = useState('伴侣/亲友同行慢享温泉养生包 (¥1,680/人，不参赛仅陪同游览温泉)');
  const [evtRules, setEvtRules] = useState<string[]>([
    '执行国家体育总局最新审定文体交流规则，坚持健康文娱、杜绝违规博彩',
    '双人搭档瑞士移位积分循环赛，每轮严格限时，杜绝超时疲劳',
    '全程配备国家级裁判长执裁与随队红十字医疗急救保障',
  ]);
  const [evtPerks, setEvtPerks] = useState<string[]>([
    '全程入住五星温泉度假酒店养生房（含防滑扶手）',
    '定制老友防风保暖参赛马甲与大师秩序册',
    '赛场提供专业AED配备、随队医生与养生草本茶饮站',
    '专属专业跟拍摄影并赠送实体纪念相册',
  ]);

  // Set default creator from current admin user
  useEffect(() => {
    if (!creatorName && currentAdminUser) {
      setCreatorName(`${currentAdminUser.name} (${currentAdminUser.roleName || '管理员'})`);
    }
  }, [currentAdminUser, creatorName]);

  // Initialize from props
  useEffect(() => {
    if (initialActivity) {
      setPublishType('activity');
      setActTitle(initialActivity.title || '');
      setActSubtitle(initialActivity.subtitle || '');
      setActDestination(initialActivity.destination || '苏州·太湖');
      setActDepartureCity(initialActivity.departureCity || '上海市黄浦区集中发车');
      setActCategory(initialActivity.category || '学者同行');
      setActForm(initialActivity.form || '名校名师研学');
      setActLevel(initialActivity.level || '尊享名仕');
      setActTripCategory(initialActivity.tripCategory || 'domestic');
      setActDays(initialActivity.durationDays || 5);
      setActNights(initialActivity.durationNights || 4);
      setActPriceGroup(initialActivity.priceGroup || 3980);
      setActPricePremium(initialActivity.pricePremium || 5880);
      setActSingleSupplement(initialActivity.singleSupplement || 800);

      // 3.1 Dimensions
      if (initialActivity.productTheme) setProductTheme(initialActivity.productTheme);
      if (initialActivity.productForm) setProductForm(initialActivity.productForm);
      if (initialActivity.productCarrier) setProductCarrier(initialActivity.productCarrier);
      if (initialActivity.timeLevel) setTimeLevel(initialActivity.timeLevel);
      if (initialActivity.businessTrack) setBusinessTrack(initialActivity.businessTrack);
      if (initialActivity.creator) setCreatorName(initialActivity.creator);

      if (initialActivity.images && initialActivity.images.length > 0) {
        setGalleryImages(initialActivity.images.slice(0, 3));
      } else if (initialActivity.cover) {
        setGalleryImages([initialActivity.cover, PRESET_GALLERY_PHOTOS[1]?.images[0] || '', PRESET_GALLERY_PHOTOS[2]?.images[0] || '']);
      }

      if (initialActivity.features) setHighlights(initialActivity.features);
      if (initialActivity.fitnessLevel) setFitnessLevel(initialActivity.fitnessLevel);
      if (initialActivity.fitnessDesc) setFitnessDesc(initialActivity.fitnessDesc);

      if (initialActivity.master) {
        setMasterName(initialActivity.master.name || '');
        setMasterTitle(initialActivity.master.title || '');
        setMasterBadge(initialActivity.master.badge || '');
        setMasterIntro(initialActivity.master.intro || '');
        setMasterAvatar(initialActivity.master.avatar || '');
      }

      if (initialActivity.tgo) {
        setTgoName(initialActivity.tgo.name || '');
        setTgoRole(initialActivity.tgo.roleTitle || '');
        setTgoBadge(initialActivity.tgo.badge || '');
        setTgoRating(initialActivity.tgo.serviceRating || 5.0);
        setTgoAvatar(initialActivity.tgo.avatar || '');
        setTgoMotto(initialActivity.tgo.motto || '');
      }

      if (initialActivity.itinerary) setItinerary(initialActivity.itinerary);
      if (initialActivity.departureDates) setDepartureDates(initialActivity.departureDates);
      if (initialActivity.notices) setNotices(initialActivity.notices);
      if (initialActivity.packingTips) setPackingTips(initialActivity.packingTips);
      if (initialActivity.feeIncludes) setFeeIncludes(initialActivity.feeIncludes);
      if (initialActivity.feeExcludes) setFeeExcludes(initialActivity.feeExcludes);
    } else if (initialEvent) {
      setPublishType('event');
      setEvtTitle(initialEvent.title || '');
      setEvtSubtitle(initialEvent.subtitle || '');
      setEvtCity(initialEvent.city || '安徽 · 黄山');
      setEvtVenue(initialEvent.venue || '黄山国际温泉会议中心');
      setEvtCategory(initialEvent.category || '掼蛋大师赛');
      setEvtStartDate(initialEvent.startDate || '2026-10-22');
      setEvtEndDate(initialEvent.endDate || '2026-10-26');
      setEvtFee(initialEvent.registrationFee || 2680);
      setEvtTotalQuota(initialEvent.maxTeams || 64);
      setEvtRegisteredTeams(initialEvent.registeredTeams || 16);
      setEvtStatus((initialEvent.status as any) || 'registration');

      if (initialEvent.productTheme) setProductTheme(initialEvent.productTheme);
      if (initialEvent.productForm) setProductForm(initialEvent.productForm);
      if (initialEvent.productCarrier) setProductCarrier(initialEvent.productCarrier);
      if (initialEvent.timeLevel) setTimeLevel(initialEvent.timeLevel);
      if (initialEvent.businessTrack) setBusinessTrack(initialEvent.businessTrack);
      if (initialEvent.creator) setCreatorName(initialEvent.creator);

      if (initialEvent.prizePool) {
        setEvtFirstPrize(initialEvent.prizePool.first || '');
        setEvtSecondPrize(initialEvent.prizePool.second || '');
        setEvtThirdPrize(initialEvent.prizePool.third || '');
        setEvtParticipationPrize(initialEvent.prizePool.participation || '');
        setEvtPrizePoints(initialEvent.prizePool.points || 10000);
      }

      if (initialEvent.referee) {
        setEvtRefereeName(initialEvent.referee.name || '');
        setEvtRefereeTitle(initialEvent.referee.title || '');
        setEvtRefereeBadge(initialEvent.referee.badge || '');
        setEvtRefereeIntro(initialEvent.referee.intro || '');
        setEvtRefereeAvatar(initialEvent.referee.avatar || '');
      }

      if (initialEvent.images && initialEvent.images.length > 0) {
        setGalleryImages(initialEvent.images.slice(0, 3));
      } else if (initialEvent.cover) {
        setGalleryImages([initialEvent.cover, PRESET_GALLERY_PHOTOS[1]?.images[0] || '', PRESET_GALLERY_PHOTOS[2]?.images[0] || '']);
      }

      if (initialEvent.medicalAssurance) {
        if (Array.isArray(initialEvent.medicalAssurance)) {
          setEvtMedicalAssurances(initialEvent.medicalAssurance);
        } else {
          const m = initialEvent.medicalAssurance;
          const items: string[] = [];
          if (m.hasAed) items.push('配备专业 AED 自动体外除颤器');
          if (m.hasDoctor) items.push('随队三甲医护与红十字救护员全程保障');
          if (m.preExam) items.push(m.preExam);
          if (m.comfortSeats) items.push(m.comfortSeats);
          if (m.teaStation) items.push(m.teaStation);
          if (m.greenChannel) items.push(m.greenChannel);
          setEvtMedicalAssurances(items.length > 0 ? items : [
            '配备 2 台专业 AED 除颤仪与随队三甲急救医护人员',
            '赛前提供免费血压、脉搏健康筛查与健康档案建立',
          ]);
        }
      }
      if (initialEvent.rules) setEvtRules(initialEvent.rules);
      if (initialEvent.perks) setEvtPerks(initialEvent.perks);
    } else {
      // Default new item initialization
      handleApplyNoticeTemplate(NOTICE_TEMPLATES[0], 'replace');
      handleApplyPackingTemplate(PACKING_TEMPLATES[0]);
    }
  }, [initialActivity, initialEvent, defaultMode]);

  // Handle AI pre-entry data injection
  const handleApplyAiParsedData = (data: Partial<Activity> | Partial<TournamentEvent>, type: 'activity' | 'event') => {
    setPublishType(type);
    if (type === 'event') {
      const evt = data as Partial<TournamentEvent>;
      if (evt.title) setEvtTitle(evt.title);
      if (evt.subtitle) setEvtSubtitle(evt.subtitle);
      if (evt.city) setEvtCity(evt.city);
      if (evt.venue) setEvtVenue(evt.venue);
      if (evt.category) setEvtCategory(evt.category);
      if (evt.startDate) setEvtStartDate(evt.startDate);
      if (evt.endDate) setEvtEndDate(evt.endDate);
      if (evt.registrationFee) setEvtFee(evt.registrationFee);
      if (evt.maxTeams) setEvtTotalQuota(evt.maxTeams);
      if (evt.registeredTeams) setEvtRegisteredTeams(evt.registeredTeams);
      if (evt.productTheme) setProductTheme(evt.productTheme);
      if (evt.productForm) setProductForm(evt.productForm);
      if (evt.productCarrier) setProductCarrier(evt.productCarrier);
      if (evt.timeLevel) setTimeLevel(evt.timeLevel);
      if (evt.businessTrack) setBusinessTrack(evt.businessTrack);
      if (evt.creator) setCreatorName(evt.creator);
      if (evt.prizePool) {
        if (evt.prizePool.first) setEvtFirstPrize(evt.prizePool.first);
        if (evt.prizePool.second) setEvtSecondPrize(evt.prizePool.second);
        if (evt.prizePool.third) setEvtThirdPrize(evt.prizePool.third);
        if (evt.prizePool.participation) setEvtParticipationPrize(evt.prizePool.participation);
        if (evt.prizePool.points) setEvtPrizePoints(evt.prizePool.points);
      }
      if (evt.referee) {
        if (evt.referee.name) setEvtRefereeName(evt.referee.name);
        if (evt.referee.title) setEvtRefereeTitle(evt.referee.title);
        if (evt.referee.badge) setEvtRefereeBadge(evt.referee.badge);
        if (evt.referee.intro) setEvtRefereeIntro(evt.referee.intro);
        if (evt.referee.avatar) setEvtRefereeAvatar(evt.referee.avatar);
      }
      if (evt.images && evt.images.length > 0) setGalleryImages(evt.images.slice(0, 3));
      if (evt.cover) {
        setGalleryImages((prev) => [evt.cover!, prev[1] || '', prev[2] || '']);
      }
      if (evt.medicalAssurance) {
        if (Array.isArray(evt.medicalAssurance)) {
          setEvtMedicalAssurances(evt.medicalAssurance);
        }
      }
      if (evt.rules && Array.isArray(evt.rules)) setEvtRules(evt.rules);
      if (evt.perks && Array.isArray(evt.perks)) setEvtPerks(evt.perks);
    } else {
      const act = data as any;
      if (act.title) setActTitle(act.title);
      if (act.subtitle) setActSubtitle(act.subtitle);
      if (act.destination) setActDestination(act.destination);
      if (act.departureCity) setActDepartureCity(act.departureCity);
      if (act.category) setActCategory(act.category);
      if (act.form) setActForm(act.form);
      if (act.level) setActLevel(act.level);
      if (act.tripCategory) setActTripCategory(act.tripCategory);
      if (act.durationDays) setActDays(act.durationDays);
      if (act.durationNights) setActNights(act.durationNights);
      if (act.priceGroup) setActPriceGroup(act.priceGroup);
      if (act.pricePremium) setActPricePremium(act.pricePremium);
      if (act.singleSupplement) setActSingleSupplement(act.singleSupplement);
      if (act.productTheme) setProductTheme(act.productTheme);
      if (act.productForm) setProductForm(act.productForm);
      if (act.productCarrier) setProductCarrier(act.productCarrier);
      if (act.timeLevel) setTimeLevel(act.timeLevel);
      if (act.businessTrack) setBusinessTrack(act.businessTrack);
      if (act.creator) setCreatorName(act.creator);
      if (act.features && Array.isArray(act.features)) setHighlights(act.features);
      if (act.fitnessLevel) setFitnessLevel(act.fitnessLevel);
      if (act.fitnessDesc) setFitnessDesc(act.fitnessDesc);
      if (act.master) {
        if (act.master.name) setMasterName(act.master.name);
        if (act.master.title) setMasterTitle(act.master.title);
        if (act.master.badge) setMasterBadge(act.master.badge);
        if (act.master.intro) setMasterIntro(act.master.intro);
        if (act.master.avatar) setMasterAvatar(act.master.avatar);
      }
      if (act.tgo) {
        if (act.tgo.name) setTgoName(act.tgo.name);
        if (act.tgo.roleTitle) setTgoRole(act.tgo.roleTitle);
        if (act.tgo.badge) setTgoBadge(act.tgo.badge);
        if (act.tgo.avatar) setTgoAvatar(act.tgo.avatar);
        if (act.tgo.motto) setTgoMotto(act.tgo.motto);
        if (act.tgo.serviceRating) setTgoRating(act.tgo.serviceRating);
      }
      if (act.itinerary && Array.isArray(act.itinerary) && act.itinerary.length > 0) {
        setItinerary(act.itinerary);
      }
      if (act.departureRule) {
        if (act.departureRule.type) setDepartureRuleType(act.departureRule.type);
        if (act.departureRule.ruleSummary) setRuleSummaryText(act.departureRule.ruleSummary);
        if (act.departureRule.weeklyDays) setSelectedWeeklyDays(act.departureRule.weeklyDays);
        if (act.departureRule.monthlyDays) setSelectedMonthlyDays(act.departureRule.monthlyDays);
      }
      if (act.feeIncludes && Array.isArray(act.feeIncludes) && act.feeIncludes.length > 0) {
        setFeeIncludes(act.feeIncludes);
      }
      if (act.feeExcludes && Array.isArray(act.feeExcludes) && act.feeExcludes.length > 0) {
        setFeeExcludes(act.feeExcludes);
      }
      if (act.packingTips && Array.isArray(act.packingTips) && act.packingTips.length > 0) {
        setPackingTips(act.packingTips);
      }
      if (act.notice && Array.isArray(act.notice) && act.notice.length > 0) {
        setNotices(act.notice);
      }
      if (act.images && act.images.length > 0) {
        setGalleryImages(act.images.slice(0, 3));
      } else if (act.suggestedImages && act.suggestedImages.length > 0) {
        setGalleryImages(act.suggestedImages.slice(0, 3));
      }
    }
  };

  // Image Slot Management
  const handleSetImageSlot = (url: string, slotIndex: number) => {
    setGalleryImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = url;
      return updated;
    });
    showToast(`主图图位 ${slotIndex + 1} 已成功更新`);
  };

  const handleApplyCustomUrl = () => {
    if (!customImageUrl.trim()) {
      showToast('请输入有效的图片网络链接 URL');
      return;
    }
    handleSetImageSlot(customImageUrl.trim(), targetImageSlot);
    setCustomImageUrl('');
  };

  // Image Upload Simulation with size check
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('⚠️ 上传图片过大！为保障手机端极速加载，主图大小不得超过 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleSetImageSlot(event.target.result as string, slotIndex);
      }
    };
    reader.readAsDataURL(file);
  };

  // Template Handlers
  const handleApplyNoticeTemplate = (template: (typeof NOTICE_TEMPLATES)[0], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setNotices([...template.items]);
      showToast(`已套用【${template.title}】注意事项模板`);
    } else {
      setNotices((prev) => [...prev, ...template.items]);
      showToast(`已追加【${template.title}】至注意事项列表`);
    }
  };

  const handleApplyPackingTemplate = (template: (typeof PACKING_TEMPLATES)[0]) => {
    setPackingTips([...template.items]);
    showToast(`已套用【${template.title}】行前准备清单`);
  };

  const handleAddNoticeItem = () => {
    if (!newNoticeInput.trim()) return;
    setNotices((prev) => [...prev, newNoticeInput.trim()]);
    setNewNoticeInput('');
  };

  const handleAddPackingItem = () => {
    if (!newPackingInput.trim()) return;
    setPackingTips((prev) => [...prev, newPackingInput.trim()]);
    setNewPackingInput('');
  };

  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setHighlights((prev) => [...prev, newHighlightInput.trim()]);
    setNewHighlightInput('');
  };

  const handleToggleSeniorBadge = (badge: string) => {
    setSelectedSeniorBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Save Activity
  const handleSaveActivity = () => {
    if (!actTitle.trim()) {
      showToast('请输入活动主标题');
      return;
    }

    const activityData: Activity = {
      id: initialActivity && (initialActivity as any).id ? (initialActivity as any).id : `act-auto-${Date.now()}`,
      code: initialActivity && (initialActivity as any).code ? (initialActivity as any).code : `LYJ-2026-ACT${Math.floor(100 + Math.random() * 900)}`,
      title: actTitle,
      subtitle: actSubtitle,
      destination: actDestination,
      departureCity: actDepartureCity,
      category: actCategory,
      form: actForm,
      level: actLevel,
      tripCategory: actTripCategory,
      // 3.1 Dimensions
      productTheme,
      productForm,
      productCarrier,
      timeLevel,
      businessTrack,
      creator: creatorName || `${currentAdminUser.name} (${currentAdminUser.roleName || '管理员'})`,
      durationDays: actDays,
      durationNights: actNights,
      priceGroup: actPriceGroup,
      pricePremium: actPricePremium,
      singleSupplement: actSingleSupplement,
      cover: galleryImages[0] || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      images: galleryImages,
      features: highlights.length > 0 ? highlights : ['【名师随团】深度文化讲座', '【适老慢行】每日控制步数', '【五星园林】舒缓养生温泉'],
      fitnessLevel,
      fitnessDesc,
      seniorFeatures: selectedSeniorBadges,
      master: {
        name: masterName,
        title: masterTitle,
        badge: masterBadge,
        intro: masterIntro,
        avatar: masterAvatar,
      },
      tgo: {
        name: tgoName,
        roleTitle: tgoRole,
        badge: tgoBadge,
        experienceYears: 10,
        tripsLed: 180,
        serviceRating: tgoRating,
        tags: ['随队急救员', '控速防跌', '膳食低盐关照'],
        avatar: tgoAvatar,
        motto: tgoMotto,
      },
      group: {
        size: groupSize,
        coach: groupCoach,
        hotelType: groupHotel,
        features: ['20-30人经典大团', '随团医生+AED配备', '低踏板航空大巴'],
      },
      premium: {
        size: premiumSize,
        coach: premiumCoach,
        hotelType: premiumHotel,
        features: ['6-12人名仕小团', '1对1行李送房', '独立卫浴套房'],
      },
      itinerary: itinerary.length > 0 ? itinerary : [
        {
          day: 1,
          title: '各地出发 · 专车接送 · 养生迎宾晚宴',
          morning: '各地高铁站/机场集合，专属乐龄管家接站，入住五星适老度假酒店',
          afternoon: '酒店茶室举行【老友品茗破冰雅集】，特邀名师开讲前言导读',
          evening: '享用少油低盐养生清炖迎宾宴，管家协助长辈熟悉房间防滑设施',
          meals: '早: 自理 | 午: 自理 | 晚: 苏帮迎宾养生宴',
          hotel: '苏州五星级适老化园林度假酒店 (配防滑卫浴与紧急呼叫钮)',
        },
      ],
      departureDates: departureDates.length > 0 ? departureDates : [
        { date: '2026-09-12', available: true, remainingSlots: 16, largePrice: actPriceGroup, smallPrice: actPricePremium },
        { date: '2026-09-19', available: true, remainingSlots: 12, largePrice: actPriceGroup, smallPrice: actPricePremium },
        { date: '2026-09-26', available: true, remainingSlots: 8, largePrice: actPriceGroup, smallPrice: actPricePremium },
      ],
      notice: notices.length > 0 ? notices : ['本行程专为50岁以上乐龄长辈设计，每日步数严格控制在4500步内。'],
      packingTips: packingTips.length > 0 ? packingTips : ['请随身携带慢病日常用药及保温杯。'],
      feeIncludes,
      feeExcludes,
      viewCount: 268,
      rating: 4.9,
      reviewsCount: 32,
      reviews: [],
      status: 'published',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (initialActivity && (initialActivity as any).id) {
      updateActivity(activityData);
      showToast(`已成功更新并审核活动：《${actTitle}》`);
    } else {
      addActivity(activityData);
      showToast(`🎉 已成功发布全新慢游行程：《${actTitle}》`);
    }
    onClose();
  };

  // Save Tournament Event
  const handleSaveEvent = () => {
    if (!evtTitle.trim()) {
      showToast('请输入赛事主标题');
      return;
    }

    const eventData: TournamentEvent = {
      id: initialEvent ? initialEvent.id : `evt-auto-${Date.now()}`,
      code: initialEvent ? initialEvent.code : `EVT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: evtTitle,
      subtitle: evtSubtitle,
      category: evtCategory,
      // 3.1 Dimensions
      productTheme,
      productForm: '社交',
      productCarrier: '赛事课堂',
      timeLevel,
      businessTrack,
      creator: creatorName || `${currentAdminUser.name} (${currentAdminUser.roleName || '管理员'})`,
      city: evtCity,
      venue: evtVenue,
      startDate: evtStartDate,
      endDate: evtEndDate,
      registrationFee: evtFee,
      registeredTeams: evtRegisteredTeams,
      maxTeams: evtTotalQuota,
      status: evtStatus,
      cover: galleryImages[0] || 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
      images: galleryImages,
      prizePool: {
        first: evtFirstPrize,
        second: evtSecondPrize,
        third: evtThirdPrize,
        participation: evtParticipationPrize,
        points: evtPrizePoints,
      },
      referee: {
        name: evtRefereeName,
        title: evtRefereeTitle,
        badge: evtRefereeBadge,
        intro: evtRefereeIntro,
        avatar: evtRefereeAvatar,
      },
      medicalAssurance: evtMedicalAssurances,
      rules: evtRules,
      perks: evtPerks,
      schedule: [
        { time: 'Day 1 下午', title: '名仕签到与开幕破冰', desc: '入住五星温泉度假酒店，领取定制参赛马甲及秩序册，晚间老友洗尘晚宴' },
        { time: 'Day 2 全天', title: '预选积分赛 (设中场颈椎操与茶歇)', desc: '瑞士移位制积分赛，每场50分钟设20分钟适老茶歇，避免疲劳' },
        { time: 'Day 3 上午', title: '半决赛与巅峰总决赛', desc: '冠亚季军荣誉赛；下午名胜园林慢游理疗与温泉调理' },
        { time: 'Day 4 晚上', title: '颁奖盛典与知青欢庆晚宴', desc: '颁发荣誉证书、非遗奖品与老友知青欢庆晚宴' },
        { time: 'Day 5 舒适返程', title: '专车护送返程', desc: '适老专车管家护送至高铁站/机场，平安温馨返程' },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (initialEvent) {
      updateEvent(eventData);
      showToast(`已成功更新乐龄赛事：《${evtTitle}》`);
    } else {
      addEvent(eventData);
      showToast(`🎉 已成功发布全新乐龄文体交流赛：《${evtTitle}》`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white text-slate-800 rounded-3xl w-full max-w-5xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              {publishType === 'activity' ? <Compass className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  {initialActivity && (initialActivity as any).id
                    ? '编辑与审核文旅慢游活动'
                    : initialEvent
                    ? '编辑与审核乐龄文体赛事'
                    : '录入发布全新产品（3.1 三维三轨）'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 font-medium">
                  3.1 框架 · 录入人: {creatorName || currentAdminUser.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                支持 3 张主图相册、3.1产品框架分类、适老化医护保障、名师学者与注意事项模板化套用
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Direct AI Pre-Entry Button */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>✨ AI 智能预录入/导入文件</span>
            </button>

            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 border border-slate-200 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{showLivePreview ? '收起预览' : '实时预览'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs (For Activity) */}
        {publishType === 'activity' ? (
          <div className="bg-slate-100/70 px-6 py-2 border-b border-slate-200 flex gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveSection('basic')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'basic' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>1. 3.1框架与3张主图</span>
            </button>
            <button
              onClick={() => setActiveSection('highlights')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'highlights' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>2. 亮点 & 适老化特点模板 ({highlights.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('master')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'master' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>3. 特邀名师 & TGO管家</span>
            </button>
            <button
              onClick={() => setActiveSection('itinerary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'itinerary' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>4. 每日详细行程 ({itinerary.length}日)</span>
            </button>
            <button
              onClick={() => setActiveSection('pricing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'pricing' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-amber-600" />
              <span>5. 定价与发班日历 ({departureDates.length}班)</span>
            </button>
            <button
              onClick={() => setActiveSection('notices')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'notices' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>6. 注意事项与行前准备模板</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-100/70 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" />
                乐龄文体交流赛事录入与适老保障专区
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                坚持健康文娱 · 弱化博彩词汇 · 医疗急救与赛程慢节奏保障
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 0: Common 3.1 Framework Dimension Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  产品 3.1 体系：「三维三轨」标准分类架构
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>录入人：</span>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {/* Dim 1: Theme */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">第一维：主题</label>
                <select
                  value={productTheme}
                  onChange={(e) => setProductTheme(e.target.value as ProductTheme)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                >
                  <option value="文化">🏛️ 文化 (文博研学)</option>
                  <option value="体育">🏆 体育 (文体交流)</option>
                  <option value="农业">🌾 农业 (生态采摘)</option>
                  <option value="健康">🧘 健康 (道医康养)</option>
                </select>
              </div>

              {/* Dim 2: Form */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">第二维：形式</label>
                <select
                  value={productForm}
                  onChange={(e) => setProductForm(e.target.value as ProductForm)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                >
                  <option value="观光">🌄 观光 (山水人文)</option>
                  <option value="研学">📚 研学 (名校专家)</option>
                  <option value="旅居">🏡 旅居 (养生慢住)</option>
                  <option value="社交">🤝 社交 (老友联谊)</option>
                </select>
              </div>

              {/* Dim 3: Carrier */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">第三维：载体</label>
                <select
                  value={productCarrier}
                  onChange={(e) => setProductCarrier(e.target.value as ProductCarrier)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                >
                  <option value="无障碍大巴">🚌 无障碍大巴 (2+1航空座椅)</option>
                  <option value="游轮">🚢 游轮 (湖海慢享)</option>
                  <option value="专列">🚆 专列 (慢速专线)</option>
                  <option value="赛事课堂">♟️ 赛事课堂 (裁判执裁)</option>
                  <option value="航空包机">✈️ 航空包机</option>
                  <option value="自驾">🚗 乐龄自驾</option>
                </select>
              </div>

              {/* Dim 3: TimeLevel */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">第三维：时间跨度</label>
                <select
                  value={timeLevel}
                  onChange={(e) => setTimeLevel(e.target.value as TimeLevel)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
                >
                  <option value="L1">L1 · 周边短途 (1~2天)</option>
                  <option value="L2">L2 · 邻省中短途 (3~4天)</option>
                  <option value="L3">L3 · 跨省长途 (5~8天)</option>
                  <option value="L4">L4 · 候鸟旅居康养 (9天以上)</option>
                </select>
              </div>

              {/* Track */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium">三轨业务定位</label>
                <select
                  value={businessTrack}
                  onChange={(e) => setBusinessTrack(e.target.value as BusinessTrack)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 focus:outline-none focus:border-emerald-600 font-bold"
                >
                  <option value="track1_marketing">轨道1 · 营销引流 (高频体验)</option>
                  <option value="track2_mainstream">轨道2 · 常规主力 (经典高复购)</option>
                  <option value="track3_premium">轨道3 · 高端特需 (名仕私享)</option>
                </select>
              </div>
            </div>
          </div>

          {publishType === 'activity' ? (
            <>
              {/* SECTION 1: Basic Info & 3 Images Gallery */}
              {activeSection === 'basic' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Text Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>活动主标题 (必填)</span>
                        <span className="text-[10px] text-slate-500 font-normal">建议突出名师、慢游或核心人文地标</span>
                      </label>
                      <input
                        type="text"
                        value={actTitle}
                        onChange={(e) => setActTitle(e.target.value)}
                        placeholder="例如：苏州古典园林与吴门文脉5日深度学术慢游"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-serif"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700">副标题 / 适老亮点标语</label>
                      <input
                        type="text"
                        value={actSubtitle}
                        onChange={(e) => setActSubtitle(e.target.value)}
                        placeholder="例如：特邀文博学者随团 · 五星适老园林客栈 · 每日步数≤4200步"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">目的地</label>
                      <input
                        type="text"
                        value={actDestination}
                        onChange={(e) => setActDestination(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">集合出发地点</label>
                      <input
                        type="text"
                        value={actDepartureCity}
                        onChange={(e) => setActDepartureCity(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* 3 Images Gallery Management */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-amber-600" />
                          <h4 className="text-sm font-bold text-slate-800">主图相册管理 (规定最多 3 张，单图 ≤ 2MB)</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          第 1 张为手机端封面主图，第 2、3 张为详情页轮播相册。请保持高清并符合乐龄审美。
                        </p>
                      </div>
                    </div>

                    {/* 3 Image Slots Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[0, 1, 2].map((slotIdx) => (
                        <div
                          key={slotIdx}
                          className={`p-3 rounded-2xl border transition-all ${
                            targetImageSlot === slotIdx
                              ? 'bg-amber-50/70 border-amber-500 shadow-xs'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-slate-800">
                              {slotIdx === 0 ? '① 封面主图 (首屏)' : `② 图位 ${slotIdx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTargetImageSlot(slotIdx)}
                              className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                                targetImageSlot === slotIdx
                                  ? 'bg-amber-600 text-white font-bold'
                                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {targetImageSlot === slotIdx ? '当前编辑中' : '设为编辑目标'}
                            </button>
                          </div>

                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={galleryImages[slotIdx]}
                              alt={`Slot ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Upload Action */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <label className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium text-center cursor-pointer transition-colors border border-slate-300 flex items-center justify-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>上传新图 (≤2MB)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLocalImageUpload(e, slotIdx)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Highlights & Senior Features */}
              {activeSection === 'highlights' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-bold text-slate-800">核心亮点与适老特色</h4>
                      </div>
                    </div>

                    {/* Add Highlight */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlightInput}
                        onChange={(e) => setNewHighlightInput(e.target.value)}
                        placeholder="输入特色亮点，如：【名师随行】特邀古籍专家全程深度导赏..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        onClick={handleAddHighlight}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加亮点</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {highlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs"
                        >
                          <span className="text-slate-800 font-medium">{hl}</span>
                          <button
                            onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Senior Badges */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <label className="text-xs font-bold text-slate-700">适老化保障标签（点击快速勾选）：</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '随团医护+AED',
                          '每日≤4000步',
                          '全程平缓无台阶',
                          '五星适老防滑卫浴',
                          '低盐少油养生膳食',
                          '考斯特商务车配低踏板',
                          '一对一行李送房',
                          '常备轮椅与登山手杖',
                        ].map((badge) => (
                          <button
                            key={badge}
                            type="button"
                            onClick={() => handleToggleSeniorBadge(badge)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              selectedSeniorBadges.includes(badge)
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: Master & TGO Profile */}
              {activeSection === 'master' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Master Card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200 pb-2">
                        <User className="w-4 h-4 text-amber-600" />
                        <span>特邀学者 / 名师导师档案</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600">名师姓名</label>
                          <input
                            type="text"
                            value={masterName}
                            onChange={(e) => setMasterName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600">头衔/职称</label>
                          <input
                            type="text"
                            value={masterTitle}
                            onChange={(e) => setMasterTitle(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600">简介</label>
                          <textarea
                            value={masterIntro}
                            onChange={(e) => setMasterIntro(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* TGO Card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200 pb-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>专属 TGO 乐龄管家档案</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="text-slate-600">管家姓名</label>
                          <input
                            type="text"
                            value={tgoName}
                            onChange={(e) => setTgoName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600">专业资质</label>
                          <input
                            type="text"
                            value={tgoBadge}
                            onChange={(e) => setTgoBadge(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600">服务格言</label>
                          <textarea
                            value={tgoMotto}
                            onChange={(e) => setTgoMotto(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Itinerary */}
              {activeSection === 'itinerary' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-bold text-slate-800">
                          每日详细行程安排 ({actDays} 天 {actNights} 晚)
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Array.from({ length: actDays }, (_, i) => i + 1).map((d) => (
                        <div key={d} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                          <div className="font-bold text-slate-900 text-xs">
                            Day {d}：{d === 1 ? '各地抵达成团 · 洗尘雅集' : d === actDays ? '舒心晨练 · 专车温馨返程' : `名胜探访 · 名师随行随讲 (D${d})`}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-slate-600">上午行程</label>
                              <input
                                type="text"
                                defaultValue={d === 1 ? '集合出发抵达成团' : '名胜探访，平缓无障碍步道慢行'}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-600">下午/晚上行程</label>
                              <input
                                type="text"
                                defaultValue={d === 1 ? '名师开讲前言，享用苏帮迎宾宴' : '温泉调理，老友品茗茶话会'}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: Pricing & Departure Rule */}
              {activeSection === 'pricing' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-bold text-slate-800">团型定价与发班排期</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="text-slate-700 font-bold">经典大团价 (20-30人)</label>
                        <input
                          type="number"
                          value={actPriceGroup}
                          onChange={(e) => setActPriceGroup(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 font-bold">名仕私享小团价 (6-12人)</label>
                        <input
                          type="number"
                          value={actPricePremium}
                          onChange={(e) => setActPricePremium(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 font-bold">单房差</label>
                        <input
                          type="number"
                          value={actSingleSupplement}
                          onChange={(e) => setActSingleSupplement(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: Notices Templates */}
              {activeSection === 'notices' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-bold text-slate-800">注意事项与健康告知 (固定模板库)</h4>
                      </div>
                      <select
                        onChange={(e) => {
                          const found = NOTICE_TEMPLATES.find((t) => t.id === e.target.value);
                          if (found) handleApplyNoticeTemplate(found, 'replace');
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-amber-800 font-bold"
                        defaultValue=""
                      >
                        <option value="" disabled>-- 选择并套用注意事项模板 --</option>
                        {NOTICE_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>{tpl.title} ({tpl.category})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      {notices.map((n, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
                          <span className="text-slate-700">• {n}</span>
                          <button
                            onClick={() => setNotices((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* EVENT PUBLISHING FORM - Senior Tournament Specifics */
            <div className="space-y-6 animate-fadeIn">
              {/* Event Basic Info */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                  1. 赛事基本信息与席位定价
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-800">赛事主标题 (必填)</label>
                    <input
                      type="text"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                      placeholder="如：2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-serif focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-700">副标题 / 适老标语</label>
                    <input
                      type="text"
                      value={evtSubtitle}
                      onChange={(e) => setEvtSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">赛事类别</label>
                    <select
                      value={evtCategory}
                      onChange={(e) => setEvtCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    >
                      <option value="掼蛋大师赛">🀄 掼蛋大师赛</option>
                      <option value="常青藤桥牌">♠️ 常青藤桥牌</option>
                      <option value="乐龄围棋">⚪ 乐龄围棋</option>
                      <option value="中国象棋">🔴 中国象棋</option>
                      <option value="金秋摄影">📷 金秋摄影展评</option>
                      <option value="太极养生功">🧘 太极养生功法</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">当前发布状态</label>
                    <select
                      value={evtStatus}
                      onChange={(e) => setEvtStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 font-bold"
                    >
                      <option value="registration">🟢 在售上架 (接受报名)</option>
                      <option value="draft">🟡 待发布 / 草稿审核</option>
                      <option value="ongoing">🔵 进行中 / 比赛对弈中</option>
                      <option value="expired">⚪ 已过期 / 已完赛</option>
                      <option value="offline">🔴 已下架</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">举办城市与场馆</label>
                    <input
                      type="text"
                      value={evtCity}
                      onChange={(e) => setEvtCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">场馆/五星酒店</label>
                    <input
                      type="text"
                      value={evtVenue}
                      onChange={(e) => setEvtVenue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">比赛起止日期</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={evtStartDate}
                        onChange={(e) => setEvtStartDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                      />
                      <span className="text-slate-400">至</span>
                      <input
                        type="date"
                        value={evtEndDate}
                        onChange={(e) => setEvtEndDate(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">参赛服务费 (含食宿/人)</label>
                    <input
                      type="number"
                      value={evtFee}
                      onChange={(e) => setEvtFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-amber-800 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">席位规模 (组)</label>
                    <input
                      type="number"
                      value={evtTotalQuota}
                      onChange={(e) => setEvtTotalQuota(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">已报队伍 (组)</label>
                    <input
                      type="number"
                      value={evtRegisteredTeams}
                      onChange={(e) => setEvtRegisteredTeams(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Senior Medical & Safety Assurances */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>2. 赛场适老关怀与医疗急救保障 (AED配备、随队医生、防疲劳软椅)</span>
                </div>

                <div className="space-y-2">
                  {evtMedicalAssurances.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-xs">
                      <span className="text-slate-800 flex items-center gap-2">
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {item}
                      </span>
                      <button
                        onClick={() => setEvtMedicalAssurances((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">伴侣/亲友同行慢游康养延展包</label>
                  <input
                    type="text"
                    value={evtCompanionPackage}
                    onChange={(e) => setEvtCompanionPackage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Honors & De-gamblized Gifts */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>3. 健康文娱优胜表彰与全员礼遇 (坚持健康文娱、弱化博彩词汇)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-bold">🥇 冠军优胜荣誉</label>
                    <input
                      type="text"
                      value={evtFirstPrize}
                      onChange={(e) => setEvtFirstPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold">🥈 亚军优胜礼遇</label>
                    <input
                      type="text"
                      value={evtSecondPrize}
                      onChange={(e) => setEvtSecondPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold">🥉 季军优胜礼遇</label>
                    <input
                      type="text"
                      value={evtThirdPrize}
                      onChange={(e) => setEvtThirdPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold">🎁 参赛全员老友纪念礼</label>
                    <input
                      type="text"
                      value={evtParticipationPrize}
                      onChange={(e) => setEvtParticipationPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Referee Team */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>4. 执裁专家阵容</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600">裁判长/导师姓名</label>
                    <input
                      type="text"
                      value={evtRefereeName}
                      onChange={(e) => setEvtRefereeName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-600">执裁资质/头衔</label>
                    <input
                      type="text"
                      value={evtRefereeTitle}
                      onChange={(e) => setEvtRefereeTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW BOX */}
          {showLivePreview && (
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-amber-400 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold border-b border-slate-200 pb-2">
                <span>📱 手机端发布效果实时预览</span>
                <span className="text-slate-500">老友记客户端即时渲染效果</span>
              </div>

              <div className="bg-white text-slate-900 p-4 rounded-2xl space-y-3 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-serif">
                    {publishType === 'activity' ? actTitle || '《活动标题预览》' : evtTitle || '《赛事标题预览》'}
                  </span>
                  <span className="text-xs font-bold text-red-600 font-serif">
                    ¥{publishType === 'activity' ? actPriceGroup : evtFee} 起/人
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-800">🌟 核心适老保障：</div>
                  {(publishType === 'activity' ? highlights : evtMedicalAssurances).slice(0, 3).map((hl, i) => (
                    <div key={i} className="text-[10px] text-slate-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      {hl}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            录入人：<strong className="text-slate-800">{creatorName || currentAdminUser.name}</strong> · 录入完成并提交后将立即全平台同步
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              取消
            </button>

            <button
              onClick={publishType === 'activity' ? handleSaveActivity : handleSaveEvent}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>确认发布上线 (人工审核通过)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Pre-Parser Modal Sub-Trigger */}
      <AiActivityPreParserModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialType={publishType}
        onApplyParsedData={(parsedData, parsedType) => {
          handleApplyAiParsedData(parsedData, parsedType);
        }}
      />
    </div>
  );
};
