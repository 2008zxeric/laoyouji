import React, { useState } from 'react';
import {
  X,
  Footprints,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  Heart,
  Award,
  Sparkles,
  ChevronRight,
  Clock,
  Mountain,
} from 'lucide-react';
import { Activity, UserHikingProfile } from '../../types';
import { UserProfile } from '../../context/AppContext';

interface HikingQuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  userProfile: UserProfile;
  userHikingProfile: UserHikingProfile;
  onConfirmBooking: (activity: Activity) => void;
  onCallButler: () => void;
}

export const HikingQuickApplyModal: React.FC<HikingQuickApplyModalProps> = ({
  isOpen,
  onClose,
  activities,
  userProfile,
  userHikingProfile,
  onConfirmBooking,
  onCallButler,
}) => {
  if (!isOpen) return null;

  // Filter valid hiking activities
  const hikingRoutes = activities.filter((a) => a.isHiking || a.category === '徒步');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    hikingRoutes[0]?.id || ''
  );

  const currentRoute = hikingRoutes.find((r) => r.id === selectedRouteId) || hikingRoutes[0];
  const meta = currentRoute?.hikingMeta;

  // Compute 3 core metrics for current selected route
  const difficultyTag =
    meta?.stageRequired === 1
      ? '🟢 散步平路级 (0台阶)'
      : meta?.stageRequired === 2
      ? '🟡 缓坡微汗级 (林荫缓坡)'
      : '🟠 访古登高级 (适老名山)';

  const estDuration =
    (meta?.distanceKm || 4.5) <= 4.5
      ? '约 1.5 小时'
      : (meta?.distanceKm || 4.5) <= 7
      ? '约 2.5 小时'
      : '约 3.5 小时';

  const elevationText = `爬升 ${meta?.elevationGainM || 45}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/60 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] p-5 sm:p-6 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Footprints className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#FBF9F5]">
                  长者一键极速报名徒步
                </h3>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-serif">
                  绿色快速通道
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                管家一对一协助 · 免复杂填表 · 专车接驳与医护双杖随行
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4.5 max-h-[78vh] overflow-y-auto">
          {/* User Traveler Health Card (Pre-verified) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#D4AF37]/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    出行人：{userProfile.name}
                  </h4>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-serif font-bold">
                    健康档案已核验
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  联系电话：{userProfile.phone} · 护照号：{userHikingProfile.passportNumber}
                </p>
              </div>
            </div>

            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-serif shrink-0">
              第{userHikingProfile.currentStage}段会员
            </span>
          </div>

          {/* Route Selection */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-bold text-stone-800 flex items-center justify-between">
              <span>选择您心仪的适老徒步路线：</span>
              <span className="text-stone-400 font-normal">点击切换</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {hikingRoutes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                const rMeta = route.hikingMeta;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/90 border-[#D4AF37] shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={route.cover}
                        alt={route.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-serif font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 shrink-0">
                            {route.destination}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {route.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="text-emerald-700 font-medium">
                            {rMeta?.distanceKm || 4.5}km
                          </span>
                          <span>·</span>
                          <span>{rMeta?.stageRequiredName || '平缓'}</span>
                          <span>·</span>
                          <span className="font-serif font-bold text-amber-800">
                            ¥{route.priceGroup}/位
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-stone-900 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Metrics Preview of Selected Route */}
          {currentRoute && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-serif font-bold text-stone-800">该路线适老核心指标速查：</span>
                <span className="text-amber-800 font-serif font-bold">
                  长者专享价：¥{currentRoute.priceGroup} / 位
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block">步程难度</span>
                  <span className="font-serif font-bold text-xs text-emerald-800 block mt-0.5 truncate">
                    {difficultyTag}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block">预计时长</span>
                  <span className="font-serif font-bold text-xs text-stone-800 block mt-0.5">
                    {estDuration}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block">海拔高度/爬升</span>
                  <span className="font-serif font-bold text-xs text-amber-900 block mt-0.5">
                    {elevationText}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4 Senior Care Promises Included */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-serif font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>本专线尊享 4 重适老安心保障全包：</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-700 pt-0.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>领队50步/分慢速控压</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>免费备发德国避震双杖</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>25分钟软椅茶歇罗汉果汤</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>随团红十字急救护士随行</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                if (currentRoute) {
                  onClose();
                  onConfirmBooking(currentRoute);
                }
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2C3E50] via-[#1E293B] to-[#2C3E50] hover:from-[#1E293B] hover:to-[#0F172A] text-[#FBF9F5] border border-[#D4AF37] font-serif font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>确认预约该专线 · 前往挑选出行排期</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                onClose();
                onCallButler();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-serif font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>不太确定是否适合？一键电话管家代订与体能评估 (138 0574 8899)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
