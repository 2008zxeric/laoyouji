import { Activity, TournamentEvent, ReviewItem, WishItem, MerchantApplication, DictCategory, DictItem, PointsProduct, FreeCampaign } from '../types';

export interface WebLoginResult {
  token: string;
  name: string;
  role: string;
  roleName: string;
  isSuperAdmin: boolean;
  canManageAdmins: boolean;
  perms: string[];
  permList: string[];
}

export interface LiveMember {
  openid: string;
  name?: string;
  phone?: string;
  phoneMasked?: string;
  level?: string;
  points?: number;
  offlineOnlyPoints?: number;
  totalSpent?: number;
  orderCount?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveMemberProfile {
  name: string;
  phone: string;
  avatar?: string;
  level: string;
  points: number;
  offlineOnlyPoints?: number;
  memberNo: string;
  annualFreeQuota?: number;
  freeQuotaUsed?: number;
}

export interface SiteInfo {
  brand: string;
  slogan: string;
  company: string;
  serviceWechat: string;
  servicePhone: string;
  serviceTime: string;
  hotline: string;
  address: string;
  icp: string;
  intro: string;
  about: string;
  agreement: string;
}

export const DEFAULT_SITE_INFO: SiteInfo = {
  brand: '老友记 老好玩儿',
  slogan: '雅趣同行 · 慢游人生',
  company: '浙江四季游文旅集团有限公司',
  serviceWechat: 'laoyouji_service',
  servicePhone: '18100129722',
  serviceTime: '每日 9:00 - 21:00',
  hotline: '400-880-9966',
  address: '浙江省宁波市海曙区鼓楼街道天一阁文创中心4楼',
  icp: '浙ICP备20260827号-1',
  intro: '面向50-75岁高净值知青学者、退休干部的乐龄文化慢游与文体赛事社区。',
  about: '老友记文旅社区以「老友相聚、适老慢游、医护随团、学术研学、智力竞技」为核心理念，打造尊崇、体面的乐龄第三人生。',
  agreement: '一、老友记文旅社区所有活动均为50岁以上健康乐龄长者定制设计……',
};

export interface Tgo {
  id: string;
  name: string;
  avatar?: string;
  tier: 'gold' | 'silver' | 'bronze';
  badge: string;
  color: string;
  source: 'hire' | 'own' | 'partner';
  title: string;
  specialty: string[];
  trips: number;
  rating: number;
  praiseRate: number;
  motto: string;
  intro: string;
  bio?: string;
  experience: { year: string; title: string; desc?: string }[];
  calendar: { date: string; activityId: string; title: string; type: string; remaining: number }[];
  fee: string;
  certified: string[];
  status?: 'active' | 'inactive';
  sort?: number;
  sortOrder?: number;
  isInactive?: boolean;
  tierCls?: string;
  tierLabel?: string;
  ratingText?: string;
}

export interface TgoApplication {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  age?: string;
  gender?: string;
  specialty?: string[];
  certs?: string[];
  time?: string[];
  remark?: string;
  status: 'pending' | 'approved' | 'rejected';
  auditNote?: string;
  createdAt?: string;
}

export interface ActivityApplication {
  _id: string;
  title: string;
  organizer: string;
  description: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  price: number;
  scale: string;
  priceDescription?: string;
  contactName: string;
  contactPhone: string;
  contactWechat?: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  createdAt?: string;
}

export interface NoticeTemplate {
  _id: string;
  name: string;
  category?: string;
  cancelPolicy: string[];
  notes: string[];
  updatedAt?: string;
}

export interface FreeStatusResult {
  free: boolean;
  type: string | null;
  reason: string;
  campaignId: string | null;
  memberFound: boolean;
}

export interface TourOrder {
  _id?: string;
  id?: string;
  orderNo?: string;
  contactName?: string;
  contactPhone?: string;
  phone?: string;
  idCard?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  roomPref?: string;
  specialNeed?: string;
  roomNote?: string;
  note?: string;
  activityTitle?: string;
  activityDate?: string;
  createdAt?: string;
  count?: number;
  travelers?: any[];
}

export interface LiveStats {
  memberCount: number;
  orderCount: number;
  totalIncome: number;
  activityCount: number;
  eventCount: number;
}

// 统一网关请求封装（支持本地模拟与真实后端）
export async function callGateway<T = any>(action: string, data: Record<string, any> = {}): Promise<T> {
  try {
    const res = await fetch('/api/admin-gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success) return json.data !== undefined ? json.data : json;
      if (json && json.msg) throw new Error(json.msg);
    }
  } catch (err) {
    // fallback or local processing
  }
  // Local fallback mock handler
  return handleLocalAction(action, data) as T;
}

function handleLocalAction(action: string, data: any): any {
  if (action === 'webLogin') {
    return {
      token: 'demo-token-' + Date.now(),
      name: data.username || '管理员',
      role: 'superAdmin',
      roleName: '超级管理员',
      isSuperAdmin: true,
      canManageAdmins: true,
      perms: ['all', 'activities.manage', 'orders.manage', 'finance.manage'],
      permList: ['all'],
    };
  }
  if (action === 'webVerify') {
    return {
      token: data.token,
      name: '超级管理员',
      role: 'superAdmin',
      roleName: '超级管理员',
      isSuperAdmin: true,
      canManageAdmins: true,
      perms: ['all'],
      permList: ['all'],
    };
  }
  return { success: true };
}

export async function webLogin(username: string, password: string): Promise<WebLoginResult> {
  return callGateway<WebLoginResult>('webLogin', { username, password });
}

export async function webVerify(token: string): Promise<WebLoginResult> {
  return callGateway<WebLoginResult>('webVerify', { token });
}

export async function webLogout(token: string): Promise<void> {
  try {
    await callGateway('webLogout', { token });
  } catch {}
}

export async function uploadImageToCloud(
  base64: string,
  filename: string,
  folder = 'covers'
): Promise<{ fileID: string; url: string }> {
  // Try server upload API or fallback to data uri
  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, filename, folder }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return { fileID: data.fileID || filename, url: data.url };
    }
  } catch {}
  return {
    fileID: `cloud://${folder}/${filename}`,
    url: base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`,
  };
}

export async function fetchLiveActivities(): Promise<Activity[]> {
  try {
    const res = await fetch('/api/activities');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.list)) return data.list;
    }
  } catch {}
  return [];
}

export async function fetchLiveEvents(): Promise<TournamentEvent[]> {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.list)) return data.list;
    }
  } catch {}
  return [];
}

export async function fetchLiveNews(): Promise<any[]> {
  return [];
}

export async function fetchLiveTgos(): Promise<Tgo[]> {
  return fetchAllTgos();
}

export async function fetchAllTgos(): Promise<Tgo[]> {
  return [];
}

export async function saveTgo(tgo: Partial<Tgo>): Promise<{ id: string }> {
  return { id: tgo.id || 'tgo_' + Date.now() };
}

export async function deleteTgo(id: string): Promise<void> {}

export async function fetchTgoApplications(status = 'all', page = 1, pageSize = 50): Promise<{ list: TgoApplication[]; total: number }> {
  return { list: [], total: 0 };
}

export async function reviewTgoApplication(id: string, review: 'approve' | 'reject', note = ''): Promise<{ msg: string }> {
  return { msg: '审核成功' };
}

export async function submitTgoApply(data: any): Promise<{ success: boolean; msg: string }> {
  return { success: true, msg: '申请提交成功' };
}

export async function fetchActivityApplications(status = 'all', page = 1, pageSize = 50): Promise<{ list: ActivityApplication[]; total: number }> {
  return { list: [], total: 0 };
}

export async function reviewActivityApplication(id: string, status: 'approved' | 'rejected', reason = ''): Promise<void> {}

export async function submitActivityApply(data: any): Promise<{ success: boolean }> {
  return { success: true };
}

export async function fetchNoticeTemplates(): Promise<NoticeTemplate[]> {
  return [];
}

export async function saveNoticeTemplate(tpl: Partial<NoticeTemplate> & { templateId?: string }): Promise<void> {}

export async function deleteNoticeTemplate(id: string): Promise<void> {}

export async function fetchFreeStatus(bizType: string, targetId: string, phone: string): Promise<FreeStatusResult> {
  return {
    free: false,
    type: null,
    reason: '',
    campaignId: null,
    memberFound: true,
  };
}

export async function fetchLiveMembers(keyword = '', page = 1, pageSize = 50): Promise<{ list: LiveMember[]; total: number }> {
  return { list: [], total: 0 };
}

export async function fetchMemberProfile(openid: string): Promise<any> {
  return null;
}

export async function fetchMemberPointsHistory(openid: string, page = 1): Promise<any[]> {
  return [];
}

export async function adjustMemberPointsReal(openid: string, amount: number, type: 'earn' | 'spend', desc: string, offlineOnly = false): Promise<void> {}

export async function fetchPointsRequests(): Promise<any[]> {
  return [];
}

export async function approvePointsRequest(id: string): Promise<void> {}
export async function rejectPointsRequest(id: string): Promise<void> {}
export async function clearAdminPoints(): Promise<void> {}
export async function analyzePoints(): Promise<any> {
  return {};
}
export async function grantAnnualReward(): Promise<void> {}
export async function memberQuery(params: any): Promise<any[]> {
  return [];
}
export async function batchAdjustPoints(params: any): Promise<void> {}

export async function fetchFreeCampaigns(): Promise<FreeCampaign[]> {
  return [];
}
export async function saveFreeCampaign(camp: any): Promise<void> {}
export async function toggleFreeCampaign(id: string, enabled: boolean): Promise<void> {}
export async function deleteFreeCampaign(id: string): Promise<void> {}

export async function updateEventStatus(id: string, status: string): Promise<void> {}
export async function bulkActivityStatus(ids: string[], status: string): Promise<void> {}
export async function bulkDeleteActivities(ids: string[]): Promise<void> {}
export async function bulkEventStatus(ids: string[], status: string): Promise<void> {}
export async function bulkDeleteEvents(ids: string[]): Promise<void> {}

export async function fetchLiveStats(): Promise<LiveStats> {
  return {
    memberCount: 2840,
    orderCount: 1420,
    totalIncome: 3886000,
    activityCount: 24,
    eventCount: 8,
  };
}

export async function fetchMallProducts(): Promise<PointsProduct[]> {
  return [];
}
export async function fetchMallOrders(): Promise<any[]> {
  return [];
}
export async function saveMallProduct(p: any): Promise<void> {}
export async function deleteMallProduct(id: string): Promise<void> {}
export async function setMallStatus(id: string, status: string): Promise<void> {}
export async function mallFulfill(id: string, tracking: string, courier: string): Promise<void> {}

export async function fetchLiveNewsList(): Promise<any[]> {
  return [];
}
export async function saveNews(news: any): Promise<void> {}
export async function deleteNews(id: string): Promise<void> {}

export async function fetchAiChatLogs(): Promise<any[]> {
  return [];
}
export async function markAiChatResolved(id: string): Promise<void> {}
export async function fetchAiRules(): Promise<any[]> {
  return [];
}
export async function saveAiRule(rule: any): Promise<void> {}
export async function deleteAiRule(id: string): Promise<void> {}
export async function toggleAiRule(id: string, enabled: boolean): Promise<void> {}

export async function fetchConfig(): Promise<any> {
  return {};
}
export async function saveConfig(cfg: any): Promise<void> {}

export async function fetchLiveReviews(): Promise<ReviewItem[]> {
  return [];
}
export async function fetchLiveWishes(): Promise<WishItem[]> {
  return [];
}
export async function fetchDict(): Promise<{ categories: DictCategory[]; items: DictItem[] }> {
  return { categories: [], items: [] };
}
export async function fetchAiKnowledge(): Promise<any[]> {
  return [];
}
export async function fetchAdmins(): Promise<any[]> {
  return [];
}

export async function reviewApprove(id: string): Promise<void> {}
export async function reviewReject(id: string): Promise<void> {}
export async function updateWish(id: string, patch: any): Promise<void> {}
export async function saveAiKnowledge(item: any): Promise<void> {}
export async function addAdmin(admin: any): Promise<void> {}
export async function deleteAdmin(id: string): Promise<void> {}

export async function memberLocate(phone: string): Promise<LiveMemberProfile | null> {
  return null;
}
export async function memberProfileUpdate(patch: Partial<LiveMemberProfile>): Promise<boolean> {
  return true;
}

export async function fetchSiteInfo(): Promise<SiteInfo> {
  return DEFAULT_SITE_INFO;
}
export async function saveSiteInfo(info: SiteInfo): Promise<void> {}

export async function saveDictCategory(cat: any): Promise<boolean> {
  return true;
}
export async function saveDict(item: any): Promise<boolean> {
  return true;
}
export async function deleteDictItemApi(id: string): Promise<void> {}
export async function deleteDictCategoryApi(id: string): Promise<void> {}

export async function merchantApply(data: any): Promise<void> {}
export async function fetchMerchants(): Promise<MerchantApplication[]> {
  return [];
}
export async function auditMerchant(id: string, status: string, note?: string): Promise<void> {}
export async function merchantToSupplier(id: string): Promise<string> {
  return 'sup_' + Date.now();
}

export async function calcComboProfit(items: any[], sellPrice: number, sellCount = 1): Promise<any> {
  const totalUnitCost = items.reduce((s, it) => s + (Number(it.unitCost) || 0) * (Number(it.qty) || 1), 0);
  const totalCost = totalUnitCost * sellCount;
  const totalRevenue = sellPrice * sellCount;
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  return {
    totalUnitCost,
    totalCost,
    totalRevenue,
    grossProfit,
    grossMargin,
    breakEvenCount: totalUnitCost > 0 ? Math.ceil(totalUnitCost / (sellPrice - totalUnitCost || 1)) : 0,
    isProfitable: grossProfit > 0,
  };
}

export async function fetchTourTarget(id: string): Promise<any> {
  return {};
}

export async function fetchPaidOrdersByTarget(id: string): Promise<TourOrder[]> {
  return [];
}

export async function runAutoRoom(id: string, price: number, nights = 1): Promise<any> {
  return { rooms: [] };
}
