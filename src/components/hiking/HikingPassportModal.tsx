import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HIKING_STAGES } from '../../data/hikingData';
import {
  X,
  Award,
  Calendar,
  Footprints,
  Mountain,
  Share2,
  Package,
  CheckCircle2,
  Stamp,
  Sparkles,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HikingPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HikingPassportModal: React.FC<HikingPassportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, userHikingProfile, hikingStamps, applyPhysicalPassport, showToast } = useApp();
  const [activePage, setActivePage] = useState<'info' | 'stamps'>('stamps');
  const [isPosterGenerated, setIsPosterGenerated] = useState(false);

  if (!isOpen) return null;

  const currentStageInfo = HIKING_STAGES.find((s) => s.stage === userHikingProfile.currentStage) || HIKING_STAGES[0];
  const unlockedStamps = hikingStamps.filter((s) => s.isUnlocked);

  const handleSharePoster = () => {
    setIsPosterGenerated(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast('✨ 徒步荣誉护照海报已生成！支持长按保存或分享给老友');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] px-5 py-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#FBF9F5] tracking-wide">老友记 · 乐龄徒步护照</h3>
                <span className="text-[10px] bg-[#D4AF37] text-stone-900 font-semibold px-2 py-0.5 rounded-full">
                  专属编号
                </span>
              </div>
              <p className="text-xs text-stone-300 font-mono tracking-wider">
                {userHikingProfile.passportNumber}
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

        {/* Tab switch inside passport: 护照资料页 vs 印记盖章簿 */}
        <div className="bg-[#EFECE6] px-5 py-2.5 flex items-center justify-between border-b border-[#E2DDD5]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('stamps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activePage === 'stamps'
                  ? 'bg-white text-[#2C3E50] shadow-sm border border-[#DCD6CA]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Stamp className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>印迹盖章页 ({unlockedStamps.length}枚)</span>
            </button>
            <button
              onClick={() => setActivePage('info')}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activePage === 'info'
                  ? 'bg-white text-[#2C3E50] shadow-sm border border-[#DCD6CA]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>长者档案与权益</span>
            </button>
          </div>

          <span className="text-[11px] text-stone-500 hidden sm:inline-block">
            全国步道统一防伪核验
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activePage === 'stamps' ? (
            <div className="space-y-4">
              {/* Passport Header Visual */}
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-4 rounded-2xl border border-amber-200/70 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">持有者：</span>
                    <span className="font-serif font-bold text-stone-800 text-base">{userProfile.name}</span>
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-serif border border-blue-200">
                      第{userHikingProfile.currentStage}段 · {currentStageInfo.name}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    累计慢行：<b className="text-stone-800">{userHikingProfile.totalDistanceKm} km</b> · 累计爬升：<b className="text-stone-800">{userHikingProfile.totalElevationM} m</b> · 完赛：<b className="text-stone-800">{userHikingProfile.completedTripsCount} 次</b>
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500/80 flex items-center justify-center p-1 rotate-[-12deg] bg-red-50/50">
                    <div className="w-full h-full rounded-full border border-red-400 flex flex-col items-center justify-center text-center">
                      <span className="text-[7px] text-red-600 font-serif leading-none font-bold">老友记</span>
                      <span className="text-[8px] text-red-700 font-serif font-black leading-tight">验讫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stamps Collection Grid (Paper Stamp Effect) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="font-serif font-bold text-sm text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>已盖验印迹 ({unlockedStamps.length} / {hikingStamps.length})</span>
                  </h4>
                  <span className="text-xs text-stone-500">点按印章查看详注</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hikingStamps.map((stamp) => (
                    <div
                      key={stamp.id}
                      className={`relative p-3.5 rounded-2xl border transition-all ${
                        stamp.isUnlocked
                          ? 'bg-white border-[#E2DDD5] shadow-xs hover:shadow-md'
                          : 'bg-stone-100/70 border-dashed border-stone-300 opacity-60'
                      }`}
                    >
                      {/* Stamp Seal Graphic */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            stamp.isUnlocked
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          <Footprints className="w-5 h-5" />
                        </div>

                        {stamp.isUnlocked ? (
                          <div className="w-9 h-9 rounded-full border border-red-500/70 flex flex-col items-center justify-center text-center rotate-[-8deg] bg-red-50/40">
                            <span className="text-[7px] text-red-600 font-serif font-bold leading-none">慢步</span>
                            <span className="text-[7px] text-red-700 font-serif font-black leading-tight">认证</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">待解锁</span>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <h5 className="font-serif font-bold text-xs text-stone-800 line-clamp-1">
                          {stamp.name}
                        </h5>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                          {stamp.description}
                        </p>
                      </div>

                      {stamp.isUnlocked && stamp.unlockedAt && (
                        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                          <span>{stamp.categoryName}</span>
                          <span>{stamp.unlockedAt}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Information Page */
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-sm"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-lg text-stone-900">{userProfile.name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">会员身份：{userProfile.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        当前段位：第{userHikingProfile.currentStage}段 · {currentStageInfo.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
                  <div>
                    <span className="text-stone-400">护照注册编号：</span>
                    <p className="font-mono font-medium text-stone-800 mt-0.5">{userHikingProfile.passportNumber}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">紧急联络人：</span>
                    <p className="font-medium text-stone-800 mt-0.5">{userProfile.emergencyContactName || '已备案（直系亲属）'}</p>
                  </div>
                  <div>
                    <span className="text-stone-400">适老健康考量：</span>
                    <p className="font-medium text-stone-800 mt-0.5">血压监测稳定 · 建议50步/分节奏</p>
                  </div>
                  <div>
                    <span className="text-stone-400">官方领队评定：</span>
                    <p className="font-medium text-emerald-700 mt-0.5">双杖使用优良 · 步态稳健</p>
                  </div>
                </div>
              </div>

              {/* Current Stage Privileges */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-xs">
                <h5 className="font-serif font-bold text-sm text-stone-800 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>当前段位【{currentStageInfo.name}】专享礼遇权益</span>
                </h5>
                <ul className="space-y-2">
                  {currentStageInfo.privileges.map((priv, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{priv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Physical Passport Applied Status Banner */}
          {userHikingProfile.physicalPassportApplied && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">实体烫金硬壳护照与荣誉徽章已申请成功！</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">TGO管家正在为您加盖实体火漆印章，将在出团时亲自递呈给您。</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bg-[#FAF8F5] px-5 py-3.5 border-t border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={applyPhysicalPassport}
            disabled={userHikingProfile.physicalPassportApplied}
            className={`w-full sm:w-auto text-xs px-4 py-2.5 rounded-xl font-serif font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              userHikingProfile.physicalPassportApplied
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-white hover:bg-stone-50 text-stone-800 border border-[#DCD6CA] shadow-xs hover:border-[#D4AF37]'
            }`}
          >
            <Package className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {userHikingProfile.physicalPassportApplied ? '已申请实体护照礼盒' : '免费申领实体硬壳护照'}
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSharePoster}
              className="flex-1 sm:flex-none text-xs bg-[#2C3E50] hover:bg-[#1E293B] text-[#FAF8F5] px-4 py-2.5 rounded-xl font-serif font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
              <span>生成荣誉护照海报</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
