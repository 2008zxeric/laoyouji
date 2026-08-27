import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Sparkles, CheckCircle2, Gift, Award } from 'lucide-react';

export const CheckinModal: React.FC = () => {
  const { isCheckinOpen, setIsCheckinOpen, doCheckin, checkedInToday, checkinStreak, userProfile } = useApp();

  if (!isCheckinOpen) return null;

  const days = [
    { day: 1, points: 30 },
    { day: 2, points: 35 },
    { day: 3, points: 40 },
    { day: 4, points: 45 },
    { day: 5, points: 50 },
    { day: 6, points: 60 },
    { day: 7, points: 100, isBig: true },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col border border-[#EAE6DF]">
        {/* Header Graphic */}
        <div className="bg-[#2C3E50] text-amber-100 p-6 text-center relative border-b border-[#D4AF37]/30">
          <button
            onClick={() => setIsCheckinOpen(false)}
            className="absolute top-4 right-4 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>

          <h3 className="font-serif italic font-bold text-xl text-amber-50">名仕每日雅聚签到</h3>
          <p className="text-xs text-stone-300 mt-1">
            已连续签到 <span className="text-[#D4AF37] font-bold text-base">{checkinStreak}</span> 天
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs text-amber-200 border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>当前积分余额：{userProfile.points} 分</span>
          </div>
        </div>

        {/* 7-Day Matrix */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((item) => {
              const isPassed = item.day <= checkinStreak;
              const isToday = item.day === checkinStreak + (checkedInToday ? 0 : 1);

              return (
                <div
                  key={item.day}
                  className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                    isPassed
                      ? 'bg-white border border-[#2C3E50]/30 text-[#2C3E50]'
                      : isToday
                      ? 'bg-white border-2 border-[#D4AF37] text-[#2C3E50] shadow-xs scale-105'
                      : 'bg-stone-50 border border-[#EAE6DF] text-stone-400'
                  }`}
                >
                  <span className="text-[10px] font-medium">第{item.day}天</span>
                  <div className="my-1">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2C3E50]" />
                    ) : item.isBig ? (
                      <Gift className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                    ) : (
                      <Award className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${isPassed ? 'text-[#2C3E50]' : 'text-stone-700'}`}>
                    +{item.points}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Senior Cultural Quote */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] text-center space-y-1">
            <div className="text-xs font-serif italic font-bold text-[#2C3E50]">
              “莫道桑榆晚，为霞尚满天”
            </div>
            <p className="text-[11px] text-stone-500">
              老友雅聚，乐享时光。坚持签到领积分，可全额抵扣慢游及兑换文创好礼。
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (!checkedInToday) {
                doCheckin();
              }
            }}
            disabled={checkedInToday}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
              checkedInToday
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30'
            }`}
          >
            {checkedInToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>今日已签到</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>立即签到领取今日积分</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
