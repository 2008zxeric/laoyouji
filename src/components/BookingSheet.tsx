import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, TournamentEvent, GroupType, Traveler } from '../types';
import {
  X,
  Check,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  HeartPulse,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { assessActivityHealthCompatibility } from '../utils/healthAdvisor';

export const BookingSheet: React.FC = () => {
  const {
    isBookingOpen,
    closeBooking,
    bookingTarget,
    travelers,
    addTraveler,
    userProfile,
    currentTier,
    createOrder,
    payOrder,
    showToast,
    calculateMaxPointsDeduction,
    calculatePointsEarned,
    setIsPointsGuideOpen,
    checkFreeEligibility,
    setIsHealthModalOpen,
  } = useApp();

  if (!isBookingOpen || !bookingTarget) return null;

  const isActivity = bookingTarget.type === 'activity';
  const activityData = isActivity ? (bookingTarget.data as Activity) : null;
  const eventData = !isActivity ? (bookingTarget.data as TournamentEvent) : null;
  const tripCategory = activityData?.tripCategory || 'domestic';

  // Check marketing subsequent free eligibility
  const freeEligibility = checkFreeEligibility(bookingTarget.data.id);

  // Health Safety Assessment Check
  const healthAssessment = assessActivityHealthCompatibility(
    bookingTarget.data,
    userProfile.healthProfile
  );

  // Health Warning confirmation modal state
  const [showHealthWarningModal, setShowHealthWarningModal] = useState(false);
  const [hasAcknowledgedHealthWarning, setHasAcknowledgedHealthWarning] = useState(false);

  // Selected state
  const [selectedGroupType, setSelectedGroupType] = useState<GroupType>('small');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (activityData && activityData.departureDates.length > 0) {
      return activityData.departureDates[0].date;
    }
    if (eventData) {
      return eventData.startDate;
    }
    return '';
  });

  // Selected traveler IDs
  const [selectedTravelerIds, setSelectedTravelerIds] = useState<string[]>([
    travelers[0]?.id || '',
  ]);

  // Room Preference
  const [roomPreference, setRoomPreference] = useState<'twin' | 'king' | 'single_supplement'>('twin');

  // Points deduction
  const [usePoints, setUsePoints] = useState<boolean>(true);

  // Use Annual Free Loyalty Quota (if eligible)
  const [useFreeQuota, setUseFreeQuota] = useState<boolean>(false);

  // New Traveler Modal State
  const [isAddTravelerOpen, setIsAddTravelerOpen] = useState(false);
  const [newTrName, setNewTrName] = useState('');
  const [newTrIdCard, setNewTrIdCard] = useState('');
  const [newTrPhone, setNewTrPhone] = useState('');
  const [newTrDiet, setNewTrDiet] = useState('');

  // Payment Confirmation Modal
  const [paymentModalData, setPaymentModalData] = useState<{
    orderId: string;
    orderNo: string;
    payAmount: number;
    title: string;
  } | null>(null);

  // Price calculations
  let unitPrice = 0;
  if (isActivity && activityData) {
    const dateObj = activityData.departureDates.find((d) => d.date === selectedDate) || activityData.departureDates[0];
    unitPrice = selectedGroupType === 'large' ? dateObj.largePrice : dateObj.smallPrice;
  } else if (eventData) {
    unitPrice = eventData.registrationFee;
  }

  const travelerCount = Math.max(1, selectedTravelerIds.length);
  const baseTotal = unitPrice * travelerCount;

  // 2026-08 Points deduction rule: 100 积分 = 1 元，每单上限 15%，封顶 (本地30元 / 国内100元 / 出境300元)
  const deductionLimits = calculateMaxPointsDeduction(baseTotal, tripCategory);
  const actualPointsToUse = usePoints ? deductionLimits.maxPoints : 0;
  const pointsDeductedAmount = usePoints ? deductionLimits.maxYuan : 0;

  // Annual Free Quota or Marketing Free Campaign check
  const hasFreeEligibility = freeEligibility.isEligible || (userProfile.annualFreeQuota > userProfile.freeQuotaUsed);
  const freeQuotaDiscount = useFreeQuota && hasFreeEligibility ? unitPrice : 0;

  const finalPayAmount = Math.max(0, baseTotal - pointsDeductedAmount - freeQuotaDiscount);
  // 2026-08 Points Earning: 实付 1 元 = 10 积分 × 等级倍数 × 品类系数
  const earnedPoints = calculatePointsEarned(finalPayAmount, tripCategory);

  const toggleTraveler = (id: string) => {
    setSelectedTravelerIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          showToast('至少需选择一位出行老友');
          return prev;
        }
        return prev.filter((t) => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddNewTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrName.trim() || !newTrIdCard.trim() || !newTrPhone.trim()) {
      showToast('请完整填写姓名、身份证与手机号');
      return;
    }
    addTraveler({
      name: newTrName.trim(),
      idCard: newTrIdCard.trim(),
      phone: newTrPhone.trim(),
      isSenior: true,
      dietaryNote: newTrDiet.trim() || '无特殊偏好',
    });
    setNewTrName('');
    setNewTrIdCard('');
    setNewTrPhone('');
    setNewTrDiet('');
    setIsAddTravelerOpen(false);
  };

  const handleSubmitOrder = () => {
    // If health safety assessment found a risk warning and user hasn't acknowledged yet, prompt warning confirmation modal
    if (healthAssessment.riskLevel === 'warning' && !hasAcknowledgedHealthWarning) {
      setShowHealthWarningModal(true);
      return;
    }

    const selectedTravelersList = travelers.filter((t) => selectedTravelerIds.includes(t.id));

    const newOrder = createOrder({
      bizType: isActivity ? 'activity' : 'event',
      targetId: bookingTarget.data.id,
      targetTitle: bookingTarget.data.title,
      targetCover: bookingTarget.data.cover,
      departureDate: selectedDate,
      groupType: selectedGroupType,
      unitPrice,
      travelers: selectedTravelersList,
      totalPrice: baseTotal,
      pointsUsed: actualPointsToUse,
      pointsDeductedAmount,
      payAmount: finalPayAmount,
      earnedPoints,
      contactName: userProfile.name,
      contactPhone: userProfile.phone,
      roomPreference,
      hasFreeQuotaUsed: useFreeQuota && freeQuotaDiscount > 0,
    });

    setPaymentModalData({
      orderId: newOrder.id,
      orderNo: newOrder.orderNo,
      payAmount: finalPayAmount,
      title: bookingTarget.data.title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fadeIn p-0 sm:p-4">
      <div className="relative w-full max-w-xl bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#EAE6DF]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 rounded-full bg-[#2C3E50]"></span>
            <h3 className="font-serif italic font-bold text-[#2C3E50] text-lg">
              {isActivity ? '文旅慢游 · 在线预订' : '乐龄赛事 · 组队报名'}
            </h3>
          </div>
          <button
            onClick={closeBooking}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-transform active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Card Snippet */}
        <div className="p-4 bg-white border-b border-[#EAE6DF] flex space-x-3 items-center">
          <img
            src={bookingTarget.data.cover}
            alt={bookingTarget.data.title}
            className="w-16 h-16 rounded-xl object-cover border border-[#EAE6DF] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-serif italic font-bold text-[#2C3E50] text-sm truncate">
              {bookingTarget.data.title}
            </h4>
            <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <span>编号：{bookingTarget.data.code}</span>
              <span className="text-[#85660d] font-semibold">适老五星保障</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6 flex-1 text-stone-800">
          {/* Smart Health Safety Guardian Card */}
          <div
            className={`rounded-2xl p-4 border transition-all text-xs space-y-2.5 ${
              healthAssessment.riskLevel === 'warning'
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : healthAssessment.riskLevel === 'caution'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    healthAssessment.riskLevel === 'warning'
                      ? 'bg-rose-600 text-white'
                      : healthAssessment.riskLevel === 'caution'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif">{healthAssessment.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        healthAssessment.riskLevel === 'warning'
                          ? 'bg-rose-200 text-rose-900'
                          : healthAssessment.riskLevel === 'caution'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      安全匹配指数 {healthAssessment.safeScore}分
                    </span>
                  </div>
                  <div className="text-[11px] font-normal opacity-85 mt-0.5">
                    基于您申报的健康档案（血压、日行舒适步数、高原耐受度）智能比对
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="text-[11px] font-bold text-[#2C3E50] underline shrink-0 hover:opacity-80 flex items-center gap-0.5"
              >
                <span>{userProfile.healthProfile?.isDeclared ? '修改健康档案' : '去申报档案'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Assessment Details */}
            <div className="space-y-1.5 pl-9">
              {healthAssessment.reasons.map((r, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="shrink-0">•</span>
                  <span>{r}</span>
                </div>
              ))}
              {healthAssessment.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-1.5 font-medium text-stone-700 leading-relaxed bg-white/70 p-2 rounded-xl border border-stone-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>管家保障建议：{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Package selection for Activity */}
          {isActivity && activityData && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wide">
                1. 选择出游团型
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedGroupType('small')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedGroupType === 'small'
                      ? 'border-[#D4AF37] bg-white ring-2 ring-[#D4AF37]/20 shadow-xs'
                      : 'border-[#EAE6DF] bg-white hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="font-bold text-xs text-[#2C3E50] flex items-center justify-between">
                    <span className="font-serif italic">拼小团 · 名仕团</span>
                    {selectedGroupType === 'small' && <Check className="w-4 h-4 text-[#D4AF37]" />}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{activityData.premium.size}</div>
                  <div className="text-sm font-serif font-bold text-red-600 mt-2">
                    ¥{activityData.departureDates[0]?.smallPrice || activityData.pricePremium}
                    <span className="text-xs font-sans text-stone-400">/人</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedGroupType('large')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedGroupType === 'large'
                      ? 'border-[#2C3E50] bg-white ring-2 ring-[#2C3E50]/20 shadow-xs'
                      : 'border-[#EAE6DF] bg-white hover:border-[#2C3E50]/30'
                  }`}
                >
                  <div className="font-bold text-xs text-[#2C3E50] flex items-center justify-between">
                    <span className="font-serif italic">大团体验 · 经典团</span>
                    {selectedGroupType === 'large' && <Check className="w-4 h-4 text-[#2C3E50]" />}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{activityData.group.size}</div>
                  <div className="text-sm font-serif font-bold text-red-600 mt-2">
                    ¥{activityData.departureDates[0]?.largePrice || activityData.priceGroup}
                    <span className="text-xs font-sans text-stone-400">/人</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Departure Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2C3E50]" />
              <span>{isActivity ? '2. 选择出发日期' : '比赛日期'}</span>
            </label>

            {isActivity && activityData ? (
              <div className="grid grid-cols-2 gap-2">
                {activityData.departureDates.map((d) => (
                  <div
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedDate === d.date
                        ? 'border-[#2C3E50] bg-white font-bold text-[#2C3E50] shadow-xs'
                        : 'border-[#EAE6DF] bg-white hover:border-stone-300'
                    }`}
                  >
                    <span>{d.date}</span>
                    <span className="text-[10px] text-[#85660d] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      余{d.remainingSlots}位
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#EAE6DF] text-xs font-semibold text-[#2C3E50]">
                {eventData?.startDate} 至 {eventData?.endDate} (共4天3晚)
              </div>
            )}
          </div>

          {/* STEP 3: Travelers Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wide">
                {isActivity ? '3. 选择出行老友' : '参赛选手信息'} (已选 {selectedTravelerIds.length} 人)
              </label>
              <button
                onClick={() => setIsAddTravelerOpen(true)}
                className="text-xs text-[#2C3E50] font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加新老友</span>
              </button>
            </div>

            <div className="space-y-2">
              {travelers.map((tr) => {
                const isChecked = selectedTravelerIds.includes(tr.id);
                return (
                  <div
                    key={tr.id}
                    onClick={() => toggleTraveler(tr.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-[#2C3E50] bg-white ring-1 ring-[#2C3E50]/30 shadow-xs'
                        : 'border-[#EAE6DF] bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-[#2C3E50] text-[#D4AF37]' : 'border border-stone-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif italic font-bold text-xs md:text-sm text-[#2C3E50]">
                            {tr.name}
                          </span>
                          <span className="bg-[#FAF9F6] text-stone-600 text-[10px] px-1.5 py-0.2 rounded font-sans border border-[#EAE6DF]">
                            {tr.idCard.slice(0, 6)}********{tr.idCard.slice(-4)}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>📞 {tr.phone}</span>
                          {tr.dietaryNote && <span>· 🥢 {tr.dietaryNote}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Room & Health Preferences */}
          {isActivity && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wide">
                4. 房型与住宿偏好
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'twin', label: '标准双床房', desc: '老友同住' },
                  { id: 'king', label: '大床房', desc: '夫妻出行' },
                  { id: 'single_supplement', label: '单人独住', desc: '补单房差' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setRoomPreference(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      roomPreference === item.id
                        ? 'border-[#2C3E50] bg-white font-bold text-[#2C3E50] shadow-xs'
                        : 'border-[#EAE6DF] hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Points & Privilege Deductions */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#2C3E50]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>会员积分与礼遇抵现 (2026年8月版)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPointsGuideOpen(true)}
                className="text-amber-800 hover:underline font-normal text-[11px]"
              >
                查看积分规则指南 &gt;
              </button>
            </div>

            {/* Points Toggle */}
            <div className="flex items-center justify-between text-xs bg-[#FAF9F6] rounded-xl p-3 border border-[#EAE6DF]">
              <div>
                <div className="font-semibold text-[#2C3E50] flex items-center gap-1">
                  <span>用积分抵扣现金</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-normal">
                    100分抵1元 · 封顶15%
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  现有 {userProfile.points} 分，本次使用 {actualPointsToUse} 积分 (直接抵扣 ¥{pointsDeductedAmount} 元)
                </div>
              </div>
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-5 h-5 accent-[#2C3E50] cursor-pointer"
              />
            </div>

            {/* Marketing Free Campaign / Annual Free Quota check */}
            {hasFreeEligibility && isActivity && (
              <div className="flex items-start justify-between text-xs bg-amber-50/80 rounded-xl p-3.5 border border-[#D4AF37]/50 shadow-xs">
                <div className="space-y-1 pr-2">
                  <div className="font-bold text-[#85660d] flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>👑 点亮【全额免单参加】出游礼遇</span>
                  </div>
                  <div className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    {freeEligibility.reason || '享有年度名仕免费慢游资格，可全额免除 1 位出行人全部费用！'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    ✓ 勾选后立即减免本场团费 ¥{unitPrice}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useFreeQuota}
                  onChange={(e) => setUseFreeQuota(e.target.checked)}
                  className="w-5 h-5 accent-[#2C3E50] cursor-pointer mt-0.5"
                />
              </div>
            )}
          </div>

          {/* STEP 6: Fee Summary Table */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-2 text-xs shadow-xs">
            <div className="flex justify-between text-stone-600">
              <span>出游人数费用 ({unitPrice} × {travelerCount}人)</span>
              <span>¥{baseTotal}</span>
            </div>
            {pointsDeductedAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>积分抵扣现金 ({actualPointsToUse} 积分)</span>
                <span>- ¥{pointsDeductedAmount}</span>
              </div>
            )}
            {freeQuotaDiscount > 0 && (
              <div className="flex justify-between text-[#85660d] font-bold">
                <span>年度会员免费名额礼遇</span>
                <span>- ¥{freeQuotaDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-amber-900 bg-amber-50/60 p-2 rounded-lg font-medium">
              <span>本单出行立得积分 ({currentTier.multiplier}x 等级 × 品类系数)</span>
              <span className="font-bold text-amber-800">+{earnedPoints.toLocaleString()} 积分 (抵 ¥{Math.floor(earnedPoints / 100)})</span>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
              <span className="font-bold text-[#2C3E50] text-sm">应付总额</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-red-600 font-bold">¥</span>
                <span className="text-2xl font-serif font-bold text-red-600">
                  {finalPayAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-t border-[#EAE6DF] flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-stone-500">共 {travelerCount} 位老友出行</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-red-600 font-bold">¥</span>
              <span className="text-2xl font-serif font-bold text-red-600">
                {finalPayAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            className="bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30 px-7 py-3.5 rounded-2xl font-bold text-base shadow-xs transition-all active:scale-95 flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            <span>提交订单并支付</span>
          </button>
        </div>

        {/* SUB-MODAL: Add New Traveler */}
        {isAddTravelerOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn border border-[#EAE6DF]">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="font-serif italic font-bold text-[#2C3E50] text-base">
                  新增出行老友档案
                </h4>
                <button
                  onClick={() => setIsAddTravelerOpen(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewTraveler} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#2C3E50] font-bold mb-1">真实姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="如：张建国"
                    value={newTrName}
                    onChange={(e) => setNewTrName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#2C3E50] font-bold mb-1">
                    身份证号 (购买100万意外险及博物馆特约通道)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="18位二代身份证号码"
                    value={newTrIdCard}
                    onChange={(e) => setNewTrIdCard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#2C3E50] font-bold mb-1">联系手机号</label>
                  <input
                    type="tel"
                    required
                    placeholder="11位手机号码"
                    value={newTrPhone}
                    onChange={(e) => setNewTrPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#2C3E50] font-bold mb-1">
                    膳食偏好 / 健康备忘
                  </label>
                  <input
                    type="text"
                    placeholder="如：清淡少盐、常年吃素、高血压等"
                    value={newTrDiet}
                    onChange={(e) => setNewTrDiet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2C3E50] text-sm"
                  />
                </div>

                <div className="pt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddTravelerOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 font-bold hover:bg-[#1a252f]"
                  >
                    确认保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Simulated WeChat Pay */}
        {paymentModalData && (
          <div className="fixed inset-0 z-70 bg-black/75 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl border border-[#EAE6DF]">
              <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#D4AF37]/40 text-[#2C3E50] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
              </div>

              <div>
                <div className="text-xs text-stone-500">微信支付 · 四季游文旅</div>
                <div className="text-3xl font-serif font-bold text-[#2C3E50] mt-1">
                  ¥{paymentModalData.payAmount}
                </div>
                <div className="text-xs text-stone-600 mt-1 truncate">
                  {paymentModalData.title}
                </div>
                <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                  单号：{paymentModalData.orderNo}
                </div>
              </div>

              {/* QR / Security Note */}
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] text-xs text-stone-600 space-y-2">
                <div className="flex items-center justify-center gap-1 text-[#2C3E50] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>国家文旅部资金存管 · 官方保障</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  支付后将自动锁定名额，并为您生成电子出团行程通知单与发票凭据。
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    payOrder(paymentModalData.orderId);
                    setPaymentModalData(null);
                    closeBooking();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-base shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>立即模拟确认支付</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentModalData(null);
                    closeBooking();
                  }}
                  className="w-full py-2.5 rounded-xl text-stone-500 text-xs hover:text-stone-800"
                >
                  稍后在“我的订单”中支付
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Health Risk Warning & Informed Consent Confirmation Dialog */}
        {showHealthWarningModal && (
          <div className="fixed inset-0 z-80 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-rose-200">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-rose-950 text-base">
                    乐龄出游 · 健康与强度重要安全提醒
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    智能系统检测到活动负荷与您的健康档案存在需关注项
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-xs text-rose-950 space-y-2">
                <div className="font-bold">{healthAssessment.title}</div>
                <div className="space-y-1 text-stone-700">
                  {healthAssessment.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
                {healthAssessment.recommendations.length > 0 && (
                  <div className="bg-white/80 p-2.5 rounded-xl border border-rose-200/60 text-stone-800 text-[11px] space-y-1">
                    <span className="font-bold text-[#2C3E50]">随团照护建议：</span>
                    {healthAssessment.recommendations.map((rec, i) => (
                      <p key={i}>• {rec}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-stone-500 leading-relaxed">
                四季游文旅全程配备专属管家与持证急救医护团队。若您已了解上述身体负荷并在医师建议或家人知情下出游，可点击下方确认继续。
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setHasAcknowledgedHealthWarning(true);
                    setShowHealthWarningModal(false);
                    // trigger submit order
                    setTimeout(() => {
                      const selectedTravelersList = travelers.filter((t) => selectedTravelerIds.includes(t.id));
                      const newOrder = createOrder({
                        bizType: isActivity ? 'activity' : 'event',
                        targetId: bookingTarget.data.id,
                        targetTitle: bookingTarget.data.title,
                        targetCover: bookingTarget.data.cover,
                        departureDate: selectedDate,
                        groupType: selectedGroupType,
                        unitPrice,
                        travelers: selectedTravelersList,
                        totalPrice: baseTotal,
                        pointsUsed: actualPointsToUse,
                        pointsDeductedAmount,
                        payAmount: finalPayAmount,
                        earnedPoints,
                        contactName: userProfile.name,
                        contactPhone: userProfile.phone,
                        roomPreference,
                        hasFreeQuotaUsed: useFreeQuota && freeQuotaDiscount > 0,
                      });
                      setPaymentModalData({
                        orderId: newOrder.id,
                        orderNo: newOrder.orderNo,
                        payAmount: finalPayAmount,
                        title: bookingTarget.data.title,
                      });
                    }, 100);
                  }}
                  className="w-full py-3 rounded-xl bg-[#2C3E50] text-[#D4AF37] font-bold text-xs hover:bg-[#1a252f] shadow-xs border border-[#D4AF37]/30"
                >
                  我已知悉健康状况 · 确认继续报名
                </button>

                <button
                  onClick={() => setShowHealthWarningModal(false)}
                  className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  返回重新选择其他平缓线路
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
