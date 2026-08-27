import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Gift,
  Users,
  Award,
  Sparkles,
  QrCode,
  Check,
  ChevronRight,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InviteModal: React.FC = () => {
  const {
    isInviteModalOpen,
    setIsInviteModalOpen,
    invites,
    simulateFriendJoinAndTrip,
    showToast,
    userProfile,
    isLargeFont,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [selectedShareType, setSelectedShareType] = useState<'wechat' | 'poster' | 'text'>('wechat');

  if (!isInviteModalOpen) return null;

  const shareText = `【老友记·老好玩儿】您的好友${userProfile.name}邀请您加入乐龄慢游俱乐部！新人注册立送50积分，名师慢游、医护随团、掼蛋雅集，点此开启品质慢生活：${invites.shareUrl} （邀请码：${invites.code}）`;

  const copyCode = (textToCopy: string, tip: string) => {
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    showToast(tip);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-stone-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-4 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-medium mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>老友同游 · 积分双享</span>
            </div>
            <h2 className={`font-serif font-bold text-amber-200 ${isLargeFont ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              邀请老友同行，立享 1,000 积分
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1">
              每成功邀请一位老朋友完成首次出游，您即可获得 1,000 积分（可直接抵扣 10 元现金）
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 bg-amber-50/80 border-b border-amber-200/80 p-3 sm:p-4 text-center divide-x divide-amber-200 shrink-0">
            <div>
              <div className="text-xs text-stone-500">已成功邀请</div>
              <div className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                {invites.totalInvited} <span className="text-xs font-normal">位老友</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-500">已完成出游</div>
              <div className="text-lg sm:text-xl font-bold text-amber-700 mt-0.5">
                {invites.totalTripped} <span className="text-xs font-normal">人次</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-500">累计赚取积分</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
                +{invites.totalPointsEarned.toLocaleString()} <span className="text-xs font-normal">分</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
            {/* Invite Code Box */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="text-xs text-stone-500 font-medium">您的专属老友邀请码</div>
              <div className="flex items-center justify-between bg-stone-100 p-3.5 rounded-xl border border-stone-200">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-stone-900">
                  {invites.code}
                </span>
                <button
                  onClick={() => copyCode(invites.code, '邀请码已复制')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '已复制' : '复制口令'}</span>
                </button>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => copyCode(shareText, '已复制邀请文案，可直接发到微信群或老友朋友圈！')}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>微信群/朋友圈邀请</span>
                </button>
                <button
                  onClick={() => {
                    simulateFriendJoinAndTrip();
                  }}
                  className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>模拟好友出游 (+1000分)</span>
                </button>
              </div>
            </div>

            {/* Referral Record List */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>我的邀请好友明细</span>
                </h3>
                <span className="text-xs text-stone-500">共 {invites.records.length} 条记录</span>
              </div>

              {invites.records.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs sm:text-sm">
                  暂无邀请记录，快去邀请老朋友一起出游吧！
                </div>
              ) : (
                <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto">
                  {invites.records.map((rec) => (
                    <div key={rec.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.friendAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                          alt={rec.friendName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-stone-900 flex items-center gap-1.5">
                            <span>{rec.friendName}</span>
                            <span className="text-[10px] text-stone-400 font-mono">({rec.friendPhone})</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">{rec.date}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {rec.status === 'completed_trip' ? (
                          <>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              已首游出游
                            </span>
                            <div className="text-xs font-bold text-amber-700 mt-0.5">
                              +{rec.pointsEarned} 分
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600">
                            已注册·待出游
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referral Step Explanations */}
            <div className="bg-stone-100 p-4 rounded-2xl space-y-2 text-xs text-stone-600">
              <div className="font-bold text-stone-800">邀请赚分三步走：</div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>分享您的专属邀请口令或微信链接给退休老朋友、老同事或牌友。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>好友完成注册即可获得新人 50 积分名仕礼包。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>好友首次报名并完成任意一场慢游活动，系统自动向您发放 1,000 积分大礼！</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              关闭
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
