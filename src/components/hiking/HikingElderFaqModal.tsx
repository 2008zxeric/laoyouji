import React from 'react';
import {
  X,
  HelpCircle,
  ShieldCheck,
  Heart,
  Bot,
  CheckCircle2,
  Phone,
  Footprints,
} from 'lucide-react';
import { Activity } from '../../types';

interface HikingElderFaqModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onAskAi: (activity: Activity) => void;
  onContactButler: () => void;
}

export const HikingElderFaqModal: React.FC<HikingElderFaqModalProps> = ({
  isOpen,
  activity,
  onClose,
  onAskAi,
  onContactButler,
}) => {
  if (!isOpen || !activity) return null;

  const meta = activity.hikingMeta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] p-5 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FBF9F5]">
                长者出行专属答疑 · 适合我吗？
              </h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                专线：《{activity.title}》
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Route Overview Pill */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-serif font-bold text-stone-800">
                适老里程：{meta?.distanceKm || 4.5}公里
              </span>
            </div>
            <span className="text-stone-500">
              路况：{meta?.trailType || '平缓青石木栈道'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-serif font-bold text-[11px]">
              {meta?.stageRequiredName || '平缓起步'}
            </span>
          </div>

          {/* Q&A Accordion/List */}
          <div className="space-y-3 text-xs text-stone-700">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1.5">
              <h4 className="font-serif font-bold text-stone-900 flex items-center gap-2 text-sm text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>问：平时膝盖偶尔酸痛，能去这条路线吗？</span>
              </h4>
              <p className="text-stone-600 leading-relaxed pl-6">
                <b>答：完全可以！</b>老友记随团免费配发德国进口 LEKI 避震双手杖与加厚减压护膝，行走时可由手臂分担下肢与膝关节 30% 以上重量，坡度极为平缓，绝不勉强。
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1.5">
              <h4 className="font-serif font-bold text-stone-900 flex items-center gap-2 text-sm text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>问：怕自己体力较弱、跟不上大家怎么办？</span>
              </h4>
              <p className="text-stone-600 leading-relaxed pl-6">
                <b>答：请绝对放宽心！</b>我们严格由专职领队在队伍前方以 50步/分慢速压阵，严禁快走和超车；每走 25 分钟领队便在绿荫处撑开轻便软椅，坐歇喝热罗汉果茶，更有随团接应保障车随时待命。
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1.5">
              <h4 className="font-serif font-bold text-stone-900 flex items-center gap-2 text-sm text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>问：参加活动需要自己准备特殊装备吗？</span>
              </h4>
              <p className="text-stone-600 leading-relaxed pl-6">
                <b>答：无需繁琐装备！</b>您只需穿一双日常舒适、抓地防滑的运动鞋即可。双杖、护膝、温水杯补给、应急医疗包与 AED 均由老友记统一免费备齐。
              </p>
            </div>
          </div>

          {/* AI Health Evaluation & Butler Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                onClose();
                onAskAi(activity);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>让 AI 管家结合赵教授健康档案进行单独评估</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onContactButler();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-serif font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>电话咨询专属管家林雅婷（138 0574 8899）</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
