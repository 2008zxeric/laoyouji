import React from 'react';
import {
  X,
  Phone,
  MessageCircle,
  ShieldCheck,
  Heart,
  Clock,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';

interface HikingButlerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallSuccess?: (phone: string) => void;
}

export const HikingButlerContactModal: React.FC<HikingButlerContactModalProps> = ({
  isOpen,
  onClose,
  onCallSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] p-5 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#FBF9F5]">
                老友徒步 · 专属管家 1对1 咨询
              </h3>
              <p className="text-xs text-stone-300">
                专为长者解答路线难度、关节适老保障与接送安排
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

        {/* Butler Info Card */}
        <div className="p-6 space-y-5">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
              alt="林雅婷 管家"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-base text-stone-900">
                  林雅婷（金牌徒步TGO）
                </h4>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-serif font-semibold">
                  红十字急救员
                </span>
              </div>
              <p className="text-xs text-stone-500">
                服务 120+ 场银发健步慢游 · 擅长适老体能配速与路况甄别
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>长者好评率 99.8% · 24小时随候服务</span>
              </div>
            </div>
          </div>

          {/* Reassuring Common Senior Questions */}
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/60 space-y-2.5">
            <span className="font-serif font-bold text-xs text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>长者常问放心答疑：</span>
            </span>
            <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>怕走太慢掉队？</b> 我们由专人严格压步（50步/分），走得慢是最基本要求，严禁超车与快走。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>需要准备什么？</b> 只要穿一双日常防滑舒服鞋子即可，双杖、护膝、温热茶水领队全包。
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>走累了如何处理？</b> 每25分钟在阴凉处架设折叠软椅喝茶休整，沿途配随团接应车。
                </span>
              </div>
            </div>
          </div>

          {/* Contact Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <a
              href="tel:13805748899"
              onClick={() => {
                if (onCallSuccess) onCallSuccess('138 0574 8899');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29D26] hover:from-[#C29D26] hover:to-[#D4AF37] text-stone-950 font-serif font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>立即一键拨通管家专线：138 0574 8899</span>
            </a>

            <button
              onClick={() => {
                navigator.clipboard?.writeText('laoyouji_tgo_walking');
                alert('已复制管家微信客服号【laoyouji_tgo_walking】，可打开微信添加好友沟通');
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-serif font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>添加管家微信咨询（微信号：laoyouji_tgo_walking）</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
