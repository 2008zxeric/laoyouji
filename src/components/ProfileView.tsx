import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, Traveler } from '../types';
import {
  Crown,
  Sparkles,
  Gift,
  Calendar,
  CreditCard,
  PhoneCall,
  FileText,
  Heart,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  MapPin,
  X,
  HeartPulse,
  Activity as ActivityIcon,
  Stethoscope,
  Pill,
  Edit3,
  Bot,
  Phone,
  Bell,
  BellRing,
  Volume2,
  CalendarCheck,
  Check,
} from 'lucide-react';
import { HealthProfileModal } from './HealthProfileModal';
import { TripReminderModal } from './TripReminderModal';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    currentTier,
    orders,
    payOrder,
    cancelOrder,
    requestRefund,
    travelers,
    removeTraveler,
    favorites,
    activities,
    events,
    setSelectedActivity,
    setSelectedEvent,
    setIsCheckinOpen,
    setIsPointsMallOpen,
    setIsMembershipModalOpen,
    setIsPointsGuideOpen,
    setIsInviteModalOpen,
    openGlobalAiWithPrompt,
    isHealthModalOpen,
    setIsHealthModalOpen,
    setViewMode,
    showToast,
    isCareMode,
    toggleCareMode,
    isLargeFont,
    setIsLargeFont,
    isTripReminderEnabled,
    toggleTripReminder,
    tripReminderLeadHours,
    setTripReminderLeadHours,
    activeTripReminderNotice,
    isTripReminderModalOpen,
    setIsTripReminderModalOpen,
    triggerTripReminderCheck,
  } = useApp();

  const [orderTab, setOrderTab] = useState<'all' | 'paid' | 'pending_pay' | 'completed' | 'refund'>('all');
  const [viewingOrderNotice, setViewingOrderNotice] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderTab === 'all') return true;
    if (orderTab === 'paid') return o.status === 'paid';
    if (orderTab === 'pending_pay') return o.status === 'pending_pay';
    if (orderTab === 'completed') return o.status === 'completed';
    if (orderTab === 'refund') return o.status === 'refund_requested' || o.status === 'refunded';
    return true;
  });

  // Favorite items resolved
  const favoriteActivities = activities.filter((a) => favorites.includes(a.id));
  const favoriteEvents = events.filter((e) => favorites.includes(e.id));

  return (
    <div className="space-y-5 pb-14 animate-fadeIn">
      {/* 1. VIP Prestige Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2C3E50] via-[#34495e] to-[#1a252f] text-amber-50 shadow-sm border border-[#D4AF37]/30 p-5 md:p-6">
        {/* Decorative Golden Pattern */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37] shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif italic font-bold text-base md:text-lg text-[#FAF9F6]">
                    {userProfile.name}
                  </h3>
                  <button
                    onClick={() => setIsMembershipModalOpen(true)}
                    className="bg-[#D4AF37] text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3 text-stone-950" />
                    <span>{currentTier.name}</span>
                  </button>
                </div>
                <div className="text-xs text-amber-200/80 mt-0.5">{userProfile.title}</div>
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  会员号：{userProfile.memberNo}
                </div>
              </div>
            </div>

            {/* Points pill */}
            <button
              onClick={() => setIsPointsMallOpen(true)}
              className="text-right bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#D4AF37]/40 transition-transform active:scale-95"
            >
              <div className="text-[10px] text-gray-300">名仕积分</div>
              <div className="text-xl font-serif font-bold text-[#D4AF37]">
                {userProfile.points}
              </div>
            </button>
          </div>

          {/* Member Privileges Snippet */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-[#D4AF37]/20 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-gray-300">出游积分返还</div>
              <div className="font-bold text-[#D4AF37] mt-0.5">{currentTier.multiplier}x 尊享</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-300">年度免费慢游</div>
              <div className="font-bold text-[#D4AF37] mt-0.5">
                余 {userProfile.annualFreeQuota - userProfile.freeQuotaUsed} 次
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-300">单房差权益</div>
              <div className="font-bold text-[#D4AF37] mt-0.5">
                {currentTier.singleSupplementDiscount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Activity / Event Starting Reminder High-Visibility Active Banner */}
      {isTripReminderEnabled && activeTripReminderNotice && (
        <div className="bg-gradient-to-r from-[#2C3E50] via-[#1a252f] to-[#2C3E50] rounded-3xl p-4 md:p-5 border-2 border-amber-400/80 shadow-md text-white space-y-3 relative overflow-hidden animate-scaleUp">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start justify-between relative z-10 gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-stone-950" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                    🔔 24小时行前提醒
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    {activeTripReminderNotice.bizType === 'event' ? '赛事明日开赛' : '行程明日启程'}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm md:text-base text-[#FAF9F6] mt-0.5 line-clamp-1">
                  {activeTripReminderNotice.title}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setIsTripReminderModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              查看备忘凭据
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs text-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">集合：{activeTripReminderNotice.gatheringTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">地点：{activeTripReminderNotice.gatheringPlace.split('（')[0]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">管家：{activeTripReminderNotice.contactGuideName}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fast Actions Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={() => setIsCheckinOpen(true)}
          className="bg-white rounded-2xl p-3 border border-[#EAE6DF] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center space-y-1 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FAF9F6] text-[#2C3E50] border border-[#2C3E50]/20 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#2C3E50]">每日签到</span>
          <span className="text-[10px] text-[#85660d] font-medium">+50分</span>
        </button>

        <button
          onClick={() => setIsPointsMallOpen(true)}
          className="bg-white rounded-2xl p-3 border border-[#EAE6DF] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center space-y-1 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#85660d] border border-[#D4AF37]/30 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#2C3E50]">积分商城</span>
          <span className="text-[10px] text-[#85660d] font-medium">好礼兑换</span>
        </button>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-white rounded-2xl p-3 border border-amber-300 bg-amber-50/40 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center space-y-1 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-amber-900">邀请同行</span>
          <span className="text-[10px] text-amber-700 font-bold">+1000分</span>
        </button>

        <button
          onClick={() => setIsMembershipModalOpen(true)}
          className="bg-white rounded-2xl p-3 border border-[#EAE6DF] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-center space-y-1 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-[#2C3E50]/10 text-[#2C3E50] border border-[#2C3E50]/20 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#2C3E50]">名仕六级</span>
          <span className="text-[10px] text-stone-600 font-medium">尊享特权</span>
        </button>
      </div>

      {/* 2026-08 Points Guide Promo Banner */}
      <div
        onClick={() => setIsPointsGuideOpen(true)}
        className="cursor-pointer bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-4 text-amber-100 flex items-center justify-between shadow-sm border border-amber-500/30 hover:border-amber-400 transition-all group"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">2026-08 官方新版</span>
            <span className="font-serif font-bold text-sm text-amber-200">会员积分快乐指南</span>
          </div>
          <p className="text-xs text-stone-300">
            实付 1 元 = 10 积分 × 等级倍数 × 品类系数 · 100 分抵 1 元
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
          <span>立即查阅</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* 3. My Orders Section */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-5 rounded-full bg-[#2C3E50]"></span>
            <h3 className="font-serif font-bold text-[#2C3E50] text-base">
              我的慢游与赛事订单
            </h3>
          </div>
          <span className="text-xs text-stone-400">共 {orders.length} 笔订单</span>
        </div>

        {/* Order Sub-tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs font-medium text-stone-600">
          {[
            { id: 'all', label: '全部' },
            { id: 'paid', label: '待出行 / 已确认' },
            { id: 'pending_pay', label: '待支付' },
            { id: 'completed', label: '已完成' },
            { id: 'refund', label: '退款/售后' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOrderTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                orderTab === tab.id
                  ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3.5">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 space-y-1">
              <div>暂无相关订单记录</div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] space-y-3"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between text-xs border-b border-stone-200/60 pb-2">
                  <div className="text-stone-500 font-mono">单号：{order.orderNo}</div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      order.status === 'paid'
                        ? 'bg-[#D4AF37]/20 text-[#85660d] border border-[#D4AF37]/40'
                        : order.status === 'pending_pay'
                        ? 'bg-amber-100 text-amber-900'
                        : order.status === 'refund_requested'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {order.status === 'paid'
                      ? '✓ 出行已锁定'
                      : order.status === 'pending_pay'
                      ? '⏳ 待支付'
                      : order.status === 'refund_requested'
                      ? '退款审核中'
                      : order.status === 'completed'
                      ? '已成行'
                      : '已取消'}
                  </span>
                </div>

                {/* Order Product */}
                <div className="flex space-x-3">
                  <img
                    src={order.targetCover}
                    alt={order.targetTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs md:text-sm text-[#2C3E50] line-clamp-1">
                      {order.targetTitle}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap gap-2">
                      <span>出发：{order.departureDate}</span>
                      <span>老友：{order.travelers.map((t) => t.name).join('、')}</span>
                    </div>
                  </div>
                </div>

                {/* Price summary & actions */}
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-stone-500">实付：</span>
                    <span className="text-base font-serif font-bold text-red-600">
                      ¥{order.payAmount}
                    </span>
                    {order.pointsUsed > 0 && (
                      <span className="text-[10px] text-stone-400 ml-1">
                        (已抵{order.pointsUsed}积分)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {order.status === 'pending_pay' && (
                      <>
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-600 text-xs hover:bg-stone-100"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => payOrder(order.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2C3E50] text-amber-100 text-xs font-bold shadow-2xs border border-[#D4AF37]/30"
                        >
                          立即支付
                        </button>
                      </>
                    )}

                    {order.status === 'paid' && (
                      <>
                        <button
                          onClick={() => requestRefund(order.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-stone-500 text-xs hover:text-stone-800"
                        >
                          申请退款
                        </button>
                        <button
                          onClick={() => setViewingOrderNotice(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2C3E50] text-amber-100 text-xs font-bold shadow-2xs flex items-center gap-1 border border-[#D4AF37]/30"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>电子出团通知书</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Senior Health Profile (健康档案申报与安全守护) */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#2C3E50] text-base flex items-center gap-2">
                <span>乐龄健康档案</span>
                {userProfile.healthProfile?.isDeclared ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> 已申报守护中
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    未申报
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-500">
                出游强度安全智能预警 · 随团医护与管家定制照护依据
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#2C3E50] bg-stone-100 hover:bg-[#FAF9F6] border border-stone-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{userProfile.healthProfile?.isDeclared ? '修改档案' : '去申报'}</span>
          </button>
        </div>

        {userProfile.healthProfile?.isDeclared ? (
          <div className="space-y-3">
            {/* Vital Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] text-stone-400 block">舒适日行步数</span>
                <span className="font-bold text-[#2C3E50] text-sm font-serif">
                  约 {userProfile.healthProfile.maxDailyStepsComfort.toLocaleString()} 步
                </span>
              </div>
              <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] text-stone-400 block">常规血压状况</span>
                <span className="font-bold text-emerald-700">
                  {userProfile.healthProfile.bloodPressureStatus === 'normal'
                    ? '正常'
                    : userProfile.healthProfile.bloodPressureStatus === 'controlled_hypertension'
                    ? '高血压(平稳)'
                    : '偏高波动'}
                </span>
              </div>
              <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] text-stone-400 block">关节与步态</span>
                <span className="font-bold text-[#2C3E50]">
                  {userProfile.healthProfile.mobilityLevel === 'independent'
                    ? '步履轻健'
                    : userProfile.healthProfile.mobilityLevel === 'gentle_walker'
                    ? '平缓慢行'
                    : userProfile.healthProfile.mobilityLevel === 'cane_assisted'
                    ? '手杖辅助'
                    : '无障碍'}
                </span>
              </div>
              <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] text-stone-400 block">高原适应</span>
                <span className="font-bold text-amber-700">
                  {userProfile.healthProfile.altitudeSensitivity === 'normal'
                    ? '耐受良好'
                    : userProfile.healthProfile.altitudeSensitivity === 'sensitive'
                    ? '敏感需配氧'
                    : '禁入高原'}
                </span>
              </div>
            </div>

            {/* Chronic tags and Meds */}
            <div className="bg-[#FAF9F6] rounded-2xl p-3 border border-[#EAE6DF] text-xs space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-stone-500 text-[11px]">基础情况：</span>
                {userProfile.healthProfile.chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md text-[11px]"
                  >
                    {cond}
                  </span>
                ))}
                {userProfile.healthProfile.allergies.length > 0 && (
                  <span className="bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-md text-[11px]">
                    忌口：{userProfile.healthProfile.allergies.join('、')}
                  </span>
                )}
              </div>

              {userProfile.healthProfile.dailyMedications.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-900 border-t border-stone-200/60 pt-2">
                  <Pill className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    常备自备药：{userProfile.healthProfile.dailyMedications.join('；')}
                  </span>
                </div>
              )}

              {userProfile.healthProfile.emergencyContactName && (
                <div className="flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/60 pt-2">
                  <span>
                    紧急联络：{userProfile.healthProfile.emergencyContactName} (
                    {userProfile.healthProfile.emergencyContactRelation || '亲属'}) ·{' '}
                    {userProfile.healthProfile.emergencyContactPhone}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    档案更新于：{userProfile.healthProfile.lastUpdated}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-2 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>申报健康档案，开启活动强度智能安全卫士</span>
              </div>
              <p className="text-[11px] text-stone-600">
                只需 1 分钟在线勾选血压、步态及高原敏感度，报名活动时智能核验防范风险。
              </p>
            </div>
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-4 py-2 rounded-xl shrink-0 shadow-xs border border-[#D4AF37]/30 active:scale-95"
            >
              立即申报
            </button>
          </div>
        )}
      </div>

      {/* 5. Saved Travelers (常用出行人档案) */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EAE6DF] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#2C3E50]" />
            <h3 className="font-serif font-bold text-[#2C3E50] text-base">
              常用老友与家人档案 ({travelers.length} 位)
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
          {travelers.map((tr) => (
            <div
              key={tr.id}
              className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#EAE6DF] flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs md:text-sm text-[#2C3E50]">{tr.name}</span>
                  <span className="bg-[#D4AF37]/15 text-[#85660d] text-[10px] px-1.5 py-0.2 rounded font-medium border border-[#D4AF37]/30">
                    乐龄名仕
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 flex flex-wrap gap-2">
                  <span>身份证：{tr.idCard.slice(0, 6)}********{tr.idCard.slice(-4)}</span>
                  <span>电话：{tr.phone}</span>
                </div>
                {tr.dietaryNote && (
                  <div className="text-[11px] text-[#85660d]">
                    偏好备忘：{tr.dietaryNote}
                  </div>
                )}
              </div>

              {travelers.length > 1 && (
                <button
                  onClick={() => removeTraveler(tr.id)}
                  className="text-stone-400 hover:text-rose-500 p-2"
                  title="删除档案"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Global Settings & Care Mode (全局设置与关怀模式) */}
      <div className="bg-white rounded-3xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2 text-[#2C3E50] font-serif font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>全局设置 · 适老关怀与智能提醒</span>
          </div>
          <span className="text-xs text-stone-500 font-medium">无障碍与适老守护规范</span>
        </div>

        {/* 5.1 Main Care Mode Switch Card */}
        <div
          onClick={toggleCareMode}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
            isCareMode
              ? 'bg-amber-50/80 border-amber-500 shadow-xs'
              : 'bg-stone-50 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C3E50] text-sm md:text-base">
                ❤️ 关怀模式 (长辈友好 · 极简高对比)
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isCareMode
                    ? 'bg-amber-500 text-stone-950 shadow-2xs'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {isCareMode ? '已开启' : '已关闭'}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              字号调大至 1.2 倍、大幅提升所有操作按钮对比度、简化所有列表卡片以减少视觉眩晕与干扰。
            </p>
          </div>

          {/* Toggle Button Graphic */}
          <div
            className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
              isCareMode ? 'bg-amber-500' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                isCareMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </div>
        </div>

        {/* 5.2 Activity Starting & Trip 24-Hour Reminder Switch Card (活动开赛/研学提醒) */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
            isTripReminderEnabled
              ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 border-amber-400 shadow-xs'
              : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div
            onClick={() => toggleTripReminder()}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2C3E50] text-sm md:text-base flex items-center gap-1.5">
                  <BellRing className={`w-4 h-4 ${isTripReminderEnabled ? 'text-amber-600 animate-bounce' : 'text-stone-400'}`} />
                  <span>活动开赛 / 研学出团 24小时行前提醒</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isTripReminderEnabled
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isTripReminderEnabled ? '已开启 · 24h前提醒' : '已关闭'}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                开启后，在已报名的活动或乐龄赛事<strong className="text-stone-900 font-bold">开始前24小时</strong>，通过页面内高亮 Toast、专属红点与行前备忘录提醒您集合地点、自备药品与管家电话，确保不遗漏重要行程。
              </p>
            </div>

            {/* Toggle Button Graphic */}
            <div
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                isTripReminderEnabled ? 'bg-amber-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  isTripReminderEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </div>
          </div>

          {/* Reminder Feature Highlights & Quick Test Button */}
          <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-600">
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200 text-stone-700">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>提前 24 小时推送</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>页面红点 & 顶部 Toast 强提醒</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-md border border-stone-200 text-stone-700">
                <Pill className="w-3 h-3 text-emerald-600" />
                <span>长辈随身药品清单备忘</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerTripReminderCheck(true, true);
                setIsTripReminderModalOpen(true);
              }}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 border border-[#D4AF37]/30 whitespace-nowrap cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>🛎️ 模拟测试 24小时行前提醒</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center space-y-0.5">
            <div className="font-bold text-[#2C3E50]">🔍 1.2x 全局大字</div>
            <div className="text-[11px] text-stone-500">正文放大 不费眼神</div>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center space-y-0.5">
            <div className="font-bold text-[#2C3E50]">🎨 高对比度按钮</div>
            <div className="text-[11px] text-stone-500">清晰显眼 杜绝误触</div>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center space-y-0.5">
            <div className="font-bold text-[#2C3E50]">✨ 极简列表防眩</div>
            <div className="text-[11px] text-stone-500">突出核心 过滤杂乱</div>
          </div>
        </div>
      </div>

      {/* 6. Senior Butler Hotline & AI Assistant Card */}
      <div className="bg-gradient-to-r from-[#2C3E50]/5 to-[#D4AF37]/10 rounded-3xl p-5 border border-[#D4AF37]/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#2C3E50] font-serif font-bold text-base">
            <PhoneCall className="w-5 h-5 text-[#2C3E50]" />
            <span>乐龄专属管家热线 & 在线客服</span>
          </div>
          <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
            9:00-21:00 专人
          </span>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed">
          有任何关于路线安排、健康状况评估、发票开具、退改保障或特殊陪同需求，AI 管家与真人管家随时为您服务。
        </p>

        <div className="bg-white/90 rounded-2xl p-3.5 border border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-stone-500">全国老友服务专线</div>
            <div className="text-xl font-serif font-bold text-[#2C3E50]">18100129722</div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:18100129722"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>一键直拨</span>
            </a>
            <button
              onClick={() => openGlobalAiWithPrompt ? openGlobalAiWithPrompt() : null}
              className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 border border-[#D4AF37]/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>问AI管家</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-MODAL: Electronic Travel Notice */}
      {viewingOrderNotice && (
        <div className="fixed inset-0 z-70 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-1.5 text-[#2C3E50] font-serif font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#2C3E50]" />
                <span>电子出团通知书 & 集合凭据</span>
              </div>
              <button
                onClick={() => setViewingOrderNotice(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] space-y-2.5 text-xs text-stone-700">
              <div className="font-bold text-[#2C3E50] text-sm">
                {viewingOrderNotice.targetTitle}
              </div>
              <div className="flex justify-between border-t border-stone-200/60 pt-2">
                <span className="text-stone-500">出发集合日期：</span>
                <span className="font-bold text-stone-900">{viewingOrderNotice.departureDate} 09:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">集合地点：</span>
                <span className="font-medium text-stone-900">苏州园区高铁站 VIP 贵宾出站厅</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">随团总管家：</span>
                <span className="text-[#2C3E50] font-bold">陈明珠 (138 0000 8822)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">随团保健医护：</span>
                <span className="text-[#2C3E50] font-bold">刘建华 医师</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">入住酒店：</span>
                <span className="text-stone-900 font-medium">苏州金鸡湖国宾馆 (双床已锁房)</span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast('出团凭据已保存！');
                setViewingOrderNotice(null);
              }}
              className="w-full py-3 rounded-2xl bg-[#2C3E50] text-amber-100 font-bold text-xs shadow-xs border border-[#D4AF37]/30"
            >
              我知道了 · 已保存凭据
            </button>
          </div>
        </div>
      )}

      {/* Health Profile Declaration Modal */}
      <HealthProfileModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />

      {/* 24-Hour Trip & Event Departure Reminder Modal */}
      <TripReminderModal
        isOpen={isTripReminderModalOpen}
        onClose={() => setIsTripReminderModalOpen(false)}
      />
    </div>
  );
};
