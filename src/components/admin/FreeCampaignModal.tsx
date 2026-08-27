import React, { useState } from 'react';
import { X, Gift, Calendar, Users, Sparkles, CheckCircle2, Clock, Layers } from 'lucide-react';
import { FreeCampaign } from '../../types';
import { useApp } from '../../context/AppContext';
import { MEMBER_TIERS } from '../../data/mockData';

interface FreeCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampaign?: FreeCampaign | null;
}

export const FreeCampaignModal: React.FC<FreeCampaignModalProps> = ({
  isOpen,
  onClose,
  initialCampaign,
}) => {
  const { activities, addFreeCampaign, updateFreeCampaign, showToast } = useApp();

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    initialCampaign?.activityId || (activities[0]?.id || '')
  );
  const [ruleType, setRuleType] = useState<'subsequentFree' | 'annualLoyalty' | 'paidOnce'>(
    (initialCampaign?.ruleType as any) || 'subsequentFree'
  );
  const [startDate, setStartDate] = useState<string>(initialCampaign?.startDate || '2026-08-01');
  const [endDate, setEndDate] = useState<string>(initialCampaign?.endDate || '2026-12-31');

  // Member Scope
  const [memberScope, setMemberScope] = useState<'all' | 'specific_tiers' | 'custom_list'>(
    initialCampaign?.memberScope || 'all'
  );
  const [selectedTiers, setSelectedTiers] = useState<(string | number)[]>(
    initialCampaign?.targetMemberTierIds || [2, 3, 4, 5, 6]
  );

  // Paid times required before subsequent free
  const [paidTimesRequired, setPaidTimesRequired] = useState<number>(
    initialCampaign?.paidTimesRequired || 1
  );

  // Subsequent free target: same activity OR any activity
  const [freeScopeType, setFreeScopeType] = useState<'same' | 'all_local' | 'selected'>(
    'same'
  );

  const [totalQuota, setTotalQuota] = useState<number>(initialCampaign?.totalQuota || 50);

  if (!isOpen) return null;

  const targetActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];

  const handleToggleTier = (tierId: string | number) => {
    setSelectedTiers((prev) =>
      prev.includes(tierId) ? prev.filter((id) => id !== tierId) : [...prev, tierId]
    );
  };

  const handleSave = () => {
    if (!targetActivity) {
      showToast('请选择关联活动');
      return;
    }

    // Build human readable rule description
    let scopeDesc = memberScope === 'all' ? '全体会员' : `指定等级会员(${selectedTiers.join('/')})`;
    let ruleDesc = '';

    if (ruleType === 'subsequentFree') {
      ruleDesc = `【${scopeDesc}专享】在 ${startDate} 至 ${endDate} 期间，会员首次付款参加《${targetActivity.title}》后，后续再次参加该活动（或同系列慢游）可享全额免单！`;
    } else if (ruleType === 'annualLoyalty') {
      ruleDesc = `【高阶名仕特权】契友/盟友会员每年享 1 次慢游全额免费名额。`;
    } else {
      ruleDesc = `【出游返利特惠】近1年内出游累计达标的老友，本场活动享特权全额免单。`;
    }

    const campaignData: FreeCampaign = {
      id: initialCampaign?.id || `camp-${Date.now()}`,
      activityId: targetActivity.id,
      activityTitle: targetActivity.title,
      ruleType: ruleType,
      ruleDesc: ruleDesc,
      startDate: startDate,
      endDate: endDate,
      memberScope: memberScope,
      targetMemberTierIds: memberScope === 'specific_tiers' ? selectedTiers : undefined,
      paidTimesRequired: Number(paidTimesRequired),
      subsequentFreeActivityIds: [targetActivity.id],
      totalQuota: Number(totalQuota),
      remainingQuota: Number(totalQuota),
      enabled: true,
    };

    if (initialCampaign) {
      updateFreeCampaign(initialCampaign.id, campaignData);
      showToast('免费出游营销规则已更新！');
    } else {
      addFreeCampaign(campaignData);
      showToast('【首购后后续免费】营销活动规则已成功创建并生效！');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white text-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">
                配置【付款后后续免费】营销规则
              </h3>
              <p className="text-xs text-slate-500">
                支持选定活动、时段与目标会员群体，实现“首购后后续免单参加”营销闭环
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Step 1: Select Target Activity */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>1. 选择营销关联的慢游/赛事活动：</span>
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
            >
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.destination} · ¥{a.priceGroup}起)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Time Range */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>2. 选定时段范围 (在此时间窗口内报名有效)：</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block mb-1 text-[11px]">活动开始日期：</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <span className="text-slate-500 block mb-1 text-[11px]">活动截止日期：</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Member Scope */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>3. 适用会员范围：</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMemberScope('all')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  memberScope === 'all'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                全部注册老友会员
              </button>

              <button
                type="button"
                onClick={() => setMemberScope('specific_tiers')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  memberScope === 'specific_tiers'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                选定会员等级 (如密友/挚友)
              </button>

              <button
                type="button"
                onClick={() => setMemberScope('custom_list')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  memberScope === 'custom_list'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                特定 VIP 长辈名单
              </button>
            </div>

            {memberScope === 'specific_tiers' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                <div className="text-[11px] text-slate-500">勾选享受该免单政策的会员等级：</div>
                <div className="flex flex-wrap gap-2">
                  {MEMBER_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleToggleTier(tier.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedTiers.includes(tier.id)
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {tier.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Rule Trigger & Condition */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>4. 免单机制与触发门槛：</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px]">付款触发条件：</span>
                <select
                  value={paidTimesRequired}
                  onChange={(e) => setPaidTimesRequired(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value={1}>第 1 次付款参加后 (首购即赠后续免单)</option>
                  <option value={2}>第 2 次付款参加后 (累计2次后免单)</option>
                  <option value={3}>第 3 次付款参加后 (累计3次后免单)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block text-[11px]">后续免费活动名额上限：</span>
                <input
                  type="number"
                  value={totalQuota}
                  onChange={(e) => setTotalQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-emerald-700 font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Preview Banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed mt-2">
              💡 规则生效效果：在 <span className="font-bold text-amber-950">{startDate} ~ {endDate}</span> 时段内，
              {memberScope === 'all' ? '全体会员' : '指定会员'} 在完成 <span className="font-bold text-emerald-800">{paidTimesRequired} 次</span> 付款出游后，后续报名将自动点亮 <span className="font-bold text-emerald-700">“全额免费出游资格”</span>，免除全部团费！
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            点击保存后立即生效并同步至用户端预约与结算流程
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
            >
              取消
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>保存并启用营销规则</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
