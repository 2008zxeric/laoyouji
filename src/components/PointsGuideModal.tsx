import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  HelpCircle,
  Calculator,
  Gift,
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MEMBER_TIERS, POINTS_CONFIG_2026 } from '../data/mockData';
import { TripCategoryType } from '../types';

export const PointsGuideModal: React.FC = () => {
  const { isPointsGuideOpen, setIsPointsGuideOpen, setIsInviteModalOpen, isLargeFont, userProfile, currentTier } = useApp();

  // Interactive points calculator
  const [calcAmount, setCalcAmount] = useState<number>(3880);
  const [calcLevelId, setCalcLevelId] = useState<number>(userProfile.levelId);
  const [calcCategory, setCalcCategory] = useState<TripCategoryType>('domestic');

  if (!isPointsGuideOpen) return null;

  const selectedTier = MEMBER_TIERS.find((t) => t.id === calcLevelId) || currentTier;
  const catConfig = POINTS_CONFIG_2026.categoryCoefficients[calcCategory];

  // 1元 = 10 积分 × 等级倍数 × 品类系数
  const estimatedEarnPoints = Math.floor(calcAmount * POINTS_CONFIG_2026.baseEarnRate * selectedTier.multiplier * catConfig.multiplier);
  const worthYuan = Math.floor(estimatedEarnPoints / POINTS_CONFIG_2026.pointsToYuanRate);

  // Max deduction for this order
  const ratioCap = Math.floor(calcAmount * POINTS_CONFIG_2026.maxDeductionRatio);
  const maxDeductYuan = Math.min(ratioCap, catConfig.maxDeductionYuan);
  const maxDeductPts = maxDeductYuan * POINTS_CONFIG_2026.pointsToYuanRate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-stone-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-4 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setIsPointsGuideOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{POINTS_CONFIG_2026.version}</span>
            </div>
            <h2 className={`font-serif font-bold text-amber-200 tracking-wide ${isLargeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              会员积分快乐指南
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-1">
              参加活动，攒积分、抵现金 —— 玩得开心，更划算
            </p>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-stone-800">
            {/* Section 1: 积分怎么攒 */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg sm:text-xl border-b border-stone-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                  一
                </span>
                <h3>积分怎么攒 · 花得越多，攒得越多</h3>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                您每实付 <span className="font-bold text-stone-900">1 元</span>，就可得 <span className="font-bold text-amber-700">10 个积分</span>，再乘上<span className="font-semibold text-stone-900">会员等级倍数</span>和<span className="font-semibold text-stone-900">活动品类系数</span>。
              </p>

              {/* Formula Callout */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-amber-800 font-medium mb-1">积分累积官方公式</div>
                <div className="font-serif font-bold text-base sm:text-lg text-amber-950">
                  实付 1 元 = 10 积分 × 等级倍数 × 品类系数
                </div>
                <div className="text-xs text-amber-800/80 mt-1">等级越高、活动越远，攒得越多！</div>
              </div>

              {/* Table of Examples */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-stone-100/80 text-stone-700 border-b border-stone-200">
                      <th className="p-2.5 rounded-l-lg font-medium">会员等级</th>
                      <th className="p-2.5 font-medium">等级倍数</th>
                      <th className="p-2.5 rounded-r-lg font-medium text-right">花 100 元可得</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-600">
                    <tr>
                      <td className="p-2.5 font-medium text-stone-900">初始会员 / 暖友</td>
                      <td className="p-2.5">x1.0</td>
                      <td className="p-2.5 text-right font-semibold text-amber-800">1,000 分</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-stone-900">密友</td>
                      <td className="p-2.5">x1.2</td>
                      <td className="p-2.5 text-right font-semibold text-amber-800">1,200 分</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-2.5 font-bold text-amber-950 flex items-center gap-1">
                        <span>挚友</span>
                        {userProfile.levelId === 4 && <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">您的等级</span>}
                      </td>
                      <td className="p-2.5 font-bold text-amber-900">x1.5</td>
                      <td className="p-2.5 text-right font-bold text-amber-900">1,500 分</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-stone-900">契友</td>
                      <td className="p-2.5">x1.8</td>
                      <td className="p-2.5 text-right font-semibold text-amber-800">1,800 分</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-stone-900">盟友 (最高)</td>
                      <td className="p-2.5">x2.0</td>
                      <td className="p-2.5 text-right font-semibold text-amber-800">2,000 分</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Category Multiplier Note */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                  <div className="text-stone-500">同城/本地</div>
                  <div className="font-bold text-stone-800 mt-0.5">系数 1.0</div>
                </div>
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                  <div className="text-stone-500">国内/跨省</div>
                  <div className="font-bold text-amber-800 mt-0.5">系数 1.5</div>
                </div>
                <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                  <div className="text-stone-500">出境/大额</div>
                  <div className="font-bold text-emerald-800 mt-0.5">系数 1.6</div>
                </div>
              </div>
            </div>

            {/* Interactive Calculator */}
            <div className="bg-gradient-to-br from-amber-500/10 via-stone-100 to-amber-500/5 p-5 rounded-2xl border border-amber-200/70 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base sm:text-lg">
                <Calculator className="w-5 h-5 text-amber-700" />
                <span>实付积分收益与抵扣智能试算器</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">预计实付金额 (元)</label>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                    placeholder="输入金额"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">您的会员等级</label>
                  <select
                    value={calcLevelId}
                    onChange={(e) => setCalcLevelId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                  >
                    {MEMBER_TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (x{t.multiplier}倍)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">活动出游品类</label>
                  <select
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value as TripCategoryType)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-amber-600"
                  >
                    <option value="local">同城/本地活动 (1.0x)</option>
                    <option value="domestic">国内/跨省慢游 (1.5x)</option>
                    <option value="outbound">出境/大额慢游 (1.6x)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-amber-200">
                <div>
                  <div className="text-xs text-stone-500">本单立得积分</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-700">
                    +{estimatedEarnPoints.toLocaleString()} <span className="text-xs font-normal">分</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-500">下次可抵现金</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">
                    ≈ ¥{worthYuan.toLocaleString()} <span className="text-xs font-normal">元</span>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-xs text-stone-500">本单抵扣上限 (15%封顶)</div>
                  <div className="text-lg sm:text-xl font-bold text-stone-800">
                    最多抵 ¥{maxDeductYuan} <span className="text-xs font-normal">({maxDeductPts}分)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 积分怎么花 */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg sm:text-xl border-b border-stone-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                  二
                </span>
                <h3>积分怎么花 · 100 分抵 1 元</h3>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                报名下一场活动时，勾选「用积分抵扣」，就能直接少付现金：
              </p>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-center">
                <div className="font-serif font-bold text-emerald-950 text-base sm:text-lg">
                  100 积分 = 直接抵扣 1 元现金
                </div>
                <div className="text-xs text-emerald-800/80 mt-0.5">每单抵扣上限为订单总额的 15%，保障老友名额人人有份</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-800">同城 / 本地活动</div>
                  <div className="text-stone-500 mt-1">每单最多可抵：</div>
                  <div className="text-base font-bold text-amber-800 mt-0.5">30 元 (3,000分)</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-800">国内 / 跨省活动</div>
                  <div className="text-stone-500 mt-1">每单最多可抵：</div>
                  <div className="text-base font-bold text-amber-800 mt-0.5">100 元 (10,000分)</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-800">出境 / 大额活动</div>
                  <div className="text-stone-500 mt-1">每单最多可抵：</div>
                  <div className="text-base font-bold text-amber-800 mt-0.5">300 元 (30,000分)</div>
                </div>
              </div>
            </div>

            {/* Section 3: 不花钱也能攒 */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg sm:text-xl border-b border-stone-100 pb-2">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold">
                  三
                </span>
                <h3>不花钱也能攒 · 轻松得积分</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POINTS_CONFIG_2026.freePointsActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{action.title}</span>
                        <span className="font-bold text-sm text-amber-700">+{action.points} 分</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{action.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setIsPointsGuideOpen(false);
                    setIsInviteModalOpen(true);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>立即邀请好友，立得 1,000 积分</span>
                </button>
              </div>
            </div>

            {/* Section 4: 积分有效期与温馨提示 */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-stone-700 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>积分有效期温馨提示</span>
              </div>
              <p className="leading-relaxed text-stone-600">
                {POINTS_CONFIG_2026.expiryRule}
              </p>
              <div className="text-[11px] text-stone-500 pt-1">
                本规则自 2026 年 8 月起生效，解释权归浙江四季游文旅集团所有。
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-stone-500">
              您当前积分余额：<span className="font-bold text-amber-700 text-sm">{userProfile.points.toLocaleString()}</span> 分 (可抵 ¥{Math.floor(userProfile.points / 100)} 元)
            </div>
            <button
              onClick={() => setIsPointsGuideOpen(false)}
              className="py-2 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors"
            >
              我知道了
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
