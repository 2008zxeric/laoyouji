import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, TournamentEvent } from '../types';
import { X, Download, Share2, QrCode, MapPin, Copy, Check, Sparkles, Gift } from 'lucide-react';

export const PosterGeneratorModal: React.FC = () => {
  const { isPosterOpen, closePoster, posterData, userProfile, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isPosterOpen || !posterData) return null;

  const isActivity = 'durationDays' in posterData;
  const activityData = isActivity ? (posterData as Activity) : null;
  const eventData = !isActivity ? (posterData as TournamentEvent) : null;
  const inviteCode = userProfile.memberNo || 'LYJ-882069';

  const handleDownload = () => {
    showToast('海报已生成并成功保存至手机相册！');
  };

  const handleCopyInviteCode = () => {
    const textToCopy = `【老友记 · 诚邀同游】您的好友 ${userProfile.name} 邀请您参加《${posterData.title}》！微信扫码或在报名时填写专属邀请码【${inviteCode}】，首次参加双方均可立得 1,000 积分大礼包！详情点击：https://lyj.4strip.com/?invite=${inviteCode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('邀请码与推荐文案已复制到剪贴板，可直接发送微信好友！');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWeChat = () => {
    handleCopyInviteCode();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative border border-[#EAE6DF] max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closePoster}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-transform active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Poster Canvas Preview */}
        <div className="bg-[#FAF9F6] p-3.5 text-stone-900 border-b border-[#EAE6DF] relative">
          {/* Traditional Cultural Border Styling */}
          <div className="border-2 border-[#D4AF37]/40 rounded-2xl p-3.5 bg-white shadow-xs space-y-2.5 relative overflow-hidden">
            {/* Top Seal Stamp & Header */}
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 font-serif italic font-bold text-sm flex items-center justify-center">
                  老
                </div>
                <div>
                  <div className="font-serif italic font-bold text-xs text-[#2C3E50]">老友记 · 老好玩儿</div>
                  <div className="text-[9px] text-stone-400">乐龄名仕慢游与智力赛事</div>
                </div>
              </div>

              {/* Chinese Seal Stamp */}
              <div className="w-9 h-9 border border-red-700 text-red-700 rounded p-0.5 flex flex-col items-center justify-center font-serif text-[8px] leading-tight font-bold rotate-6 bg-red-50/50">
                <span>知青</span>
                <span>雅集</span>
              </div>
            </div>

            {/* Poster Main Photo */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-100">
              <img
                src={posterData.cover}
                alt={posterData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#2C3E50]/90 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] px-2 py-0.5 rounded-full font-serif font-bold">
                {isActivity ? activityData?.category : eventData?.category}
              </div>
              {isActivity && (
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full">
                  {activityData?.durationDays}天{activityData?.durationNights}晚 · {activityData?.level}
                </div>
              )}
            </div>

            {/* Title & Key Highlights */}
            <div className="space-y-0.5">
              <h3 className="font-serif italic font-bold text-sm text-[#2C3E50] leading-snug">
                {posterData.title}
              </h3>
              <p className="text-[11px] text-stone-500 line-clamp-2">
                {posterData.subtitle}
              </p>
            </div>

            {/* Destination & Master / Referee / Price */}
            <div className="bg-[#FAF9F6] rounded-xl p-2.5 text-xs text-stone-700 space-y-1.5 border border-[#EAE6DF]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-[#2C3E50]">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  {isActivity ? activityData?.destination : eventData?.city}
                </span>
                <span className="text-red-600 font-serif font-bold text-xs">
                  ¥{isActivity ? activityData?.priceGroup : eventData?.registrationFee} 起/人
                </span>
              </div>

              {isActivity && activityData?.tgo && (
                <div className="text-[10px] text-stone-600 flex items-center gap-1">
                  <span className="bg-[#2C3E50] text-[#D4AF37] px-1 py-0.2 rounded text-[9px] font-bold">TGO管家</span>
                  <span>{activityData.tgo.name}（1:8适老照护比·配急救箱）</span>
                </div>
              )}

              {isActivity && activityData?.master && (
                <div className="text-[10px] text-[#85660d] font-medium">
                  🌟 {activityData.master.badge}：{activityData.master.name} 随团讲学
                </div>
              )}

              {!isActivity && eventData && (
                <div className="text-[10px] text-[#85660d] font-medium">
                  🏆 优胜礼遇：{eventData.prizePool.first}
                </div>
              )}
            </div>

            {/* Referral Points Highlight Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-2 border border-amber-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#2C3E50] flex items-center gap-1">
                    <span>邀请首游立得</span>
                    <span className="text-red-600 font-serif font-bold">+1,000 积分</span>
                  </div>
                  <div className="text-[9px] text-stone-500">新老好友双方均享千分大礼</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[8px] text-stone-400">专属邀请码</div>
                <div className="font-mono font-bold text-xs text-[#2C3E50] bg-white px-1.5 py-0.5 rounded border border-amber-200 shadow-2xs">
                  {inviteCode}
                </div>
              </div>
            </div>

            {/* Inviter Badge & QR Code */}
            <div className="pt-2 border-t border-[#EAE6DF] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
                />
                <div>
                  <div className="font-serif italic font-bold text-xs text-[#2C3E50]">{userProfile.name}</div>
                  <div className="text-[9px] text-[#85660d] font-medium">老友记认证名仕会员</div>
                  <div className="text-[9px] text-stone-400">诚邀老友同行品茗对弈</div>
                </div>
              </div>

              {/* QR Code & Scan Prompt */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white p-1 rounded-xl border border-stone-300 shadow-2xs flex items-center justify-center relative">
                  <QrCode className="w-10 h-10 text-[#2C3E50]" />
                  <div className="absolute -bottom-1 bg-[#2C3E50] text-[#D4AF37] text-[7px] px-1 rounded-full scale-90">
                    扫码立减
                  </div>
                </div>
                <span className="text-[8px] text-stone-400 mt-1">微信扫码慢品</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-white space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl border border-[#2C3E50] text-[#2C3E50] text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 hover:bg-[#FAF9F6] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>保存海报到相册</span>
            </button>

            <button
              onClick={handleCopyInviteCode}
              className="flex-1 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#85660d] border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制邀请码' : '复制邀请文案'}</span>
            </button>
          </div>

          <button
            onClick={handleShareWeChat}
            className="w-full py-3 rounded-2xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
            <span>发微信老友群 / 朋友圈赚积分</span>
          </button>
        </div>
      </div>
    </div>
  );
};
