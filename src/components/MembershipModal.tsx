import React from 'react';
import { useApp } from '../context/AppContext';
import { MEMBER_TIERS } from '../data/mockData';
import { X, Crown, Sparkles, CheckCircle2, Gift, ShieldCheck } from 'lucide-react';

export const MembershipModal: React.FC = () => {
  const {
    isMembershipModalOpen,
    setIsMembershipModalOpen,
    userProfile,
    currentTier,
    setIsPointsMallOpen,
    setIsCheckinOpen,
  } = useApp();

  if (!isMembershipModalOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#EAE6DF]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#2C3E50] text-[#FAF9F6] px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-2.5">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif italic font-bold text-base md:text-lg text-amber-50">
                名仕知青 · 六级礼遇尊荣体系
              </h3>
              <div className="text-xs text-[#D4AF37]/80">为知识分子量身定制的尊崇慢游权益</div>
            </div>
          </div>

          <button
            onClick={() => setIsMembershipModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-amber-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Tier VIP Card */}
        <div className="p-5 bg-[#2C3E50] text-amber-50 relative overflow-hidden border-b border-[#D4AF37]/20">
          {/* Subtle watermarked emblem */}
          <div className="absolute -right-6 -bottom-6 text-white/5 font-serif italic font-bold text-9xl pointer-events-none select-none">
            雅
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic font-bold text-base text-amber-100">
                      {userProfile.name}
                    </span>
                    <span className="bg-[#D4AF37] text-[#2C3E50] text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {currentTier.name}
                    </span>
                  </div>
                  <div className="text-xs text-[#D4AF37]/80 font-mono mt-0.5">
                    会员号：{userProfile.memberNo}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-stone-300">名仕积分</div>
                <div className="text-2xl font-serif font-bold text-[#D4AF37]">
                  {userProfile.points}
                </div>
              </div>
            </div>

            {/* Privilege Highlights for Current Tier */}
            <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3.5 border border-[#D4AF37]/30 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>积分返现：{currentTier.multiplier}x 倍数</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>免费慢游名额：每年{currentTier.annualFreeTrips}次</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>单房差权益：{currentTier.singleSupplementDiscount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>生日礼遇：{currentTier.birthdayGift}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Tiers Breakdown */}
        <div className="p-5 space-y-4 flex-1">
          <h4 className="font-serif italic font-bold text-[#2C3E50] text-sm md:text-base flex items-center gap-2">
            <span className="w-2.5 h-5 rounded-full bg-[#2C3E50]"></span>
            <span>六级名仕会员升级梯队</span>
          </h4>

          <div className="space-y-3">
            {MEMBER_TIERS.map((tier) => {
              const isCurrent = tier.id === currentTier.id;

              return (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-[#D4AF37] bg-white ring-2 ring-[#D4AF37]/30 shadow-xs'
                      : 'border-[#EAE6DF] bg-white hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-[#FAF9F6] text-[#2C3E50] border border-[#EAE6DF] text-xs font-bold flex items-center justify-center">
                        V{tier.id}
                      </span>
                      <span className="font-serif italic font-bold text-sm text-[#2C3E50]">
                        {tier.name}
                      </span>
                      {isCurrent && (
                        <span className="bg-[#2C3E50] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                          当前身份
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#85660d] font-serif font-bold">
                      门槛：{tier.minPoints.toLocaleString()} 分
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 mt-2.5">
                    {tier.perks.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2C3E50] shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3 border-t border-[#EAE6DF] flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setIsMembershipModalOpen(false);
              useApp().setIsPointsGuideOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>查看 2026年8月 会员积分快乐指南</span>
          </button>
          <div className="flex space-x-2 flex-1">
            <button
              onClick={() => {
                setIsMembershipModalOpen(false);
                setIsCheckinOpen(true);
              }}
              className="flex-1 py-2.5 rounded-xl border border-[#2C3E50] text-[#2C3E50] text-xs font-bold hover:bg-[#FAF9F6]"
            >
              每日签到赚积分
            </button>
            <button
              onClick={() => {
                setIsMembershipModalOpen(false);
                setIsPointsMallOpen(true);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-xs hover:bg-[#1a252f]"
            >
              积分商城
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
