import React, { useMemo, useState } from 'react';
import { Trophy, X, Medal, Award, Flame, UserCheck, ChevronRight } from 'lucide-react';
import { MOCK_EVENT_RANKINGS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface Props {
  onClose: () => void;
  eventId?: string;
}

export const RankingModal: React.FC<Props> = ({ onClose, eventId: initialEventId }) => {
  const { events } = useApp();
  const [selEventId, setSelEventId] = useState(initialEventId || '');
  const boards = MOCK_EVENT_RANKINGS;
  const current = boards.find((b) => b.eventId === selEventId);

  // 赛季总榜（跨场累计积分）
  const SEASON = useMemo(
    () => [
      { rank: 1, name: '陈伯年', city: '宁波', points: 12860, wins: 6, tier: '金旅伴', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      { rank: 2, name: '沈芝兰', city: '杭州', points: 11420, wins: 5, tier: '金旅伴', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { rank: 3, name: '王守仁', city: '苏州', points: 9890, wins: 4, tier: '金旅伴', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
      { rank: 4, name: '赵玉珍', city: '上海', points: 8760, wins: 4, tier: '银旅伴', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
      { rank: 5, name: '钱惠芳', city: '无锡', points: 7640, wins: 3, tier: '银旅伴', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
      { rank: 6, name: '孙国梁', city: '绍兴', points: 6530, wins: 3, tier: '银旅伴', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
    ],
    []
  );

  const medal = (r: number) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `${r}`);
  const tierCls = (t: string) =>
    t === '金旅伴'
      ? 'bg-amber-100 text-amber-800'
      : t === '银旅伴'
      ? 'bg-slate-100 text-slate-600'
      : 'bg-orange-50 text-orange-700';

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4AF37]" /> 乐龄赛事 · 全国荣誉与排行榜
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* 引导 banner */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] rounded-2xl p-4 border border-[#D4AF37]/30 text-white flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-serif font-bold text-amber-100 flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-[#D4AF37]" />
                <span>乐龄益智 · 牌逢知己 · 赛出风采</span>
              </div>
              <div className="text-[11px] text-stone-300 mt-1">
                国家级执裁标准，赛季积分可全额抵扣文旅研学并兑换文创好礼
              </div>
            </div>
            <Award className="w-8 h-8 text-[#D4AF37] shrink-0 opacity-80" />
          </div>

          {/* 场次切换器 */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelEventId('')}
              className={`shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
                selEventId === ''
                  ? 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
              }`}
            >
              🏆 赛季总积分榜
            </button>
            {boards.map((b) => (
              <button
                key={b.eventId}
                onClick={() => setSelEventId(b.eventId)}
                className={`shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
                  selEventId === b.eventId
                    ? 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {b.eventTitle.slice(0, 10)}...
              </button>
            ))}
          </div>

          {/* 赛季总榜 */}
          {!current && (
            <>
              {/* 前三名领奖台 */}
              <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
                {[1, 0, 2].map((i) => {
                  const p = SEASON[i];
                  return (
                    <div
                      key={p.rank}
                      className={`bg-white rounded-2xl border border-[#EAE6DF] p-3 text-center shadow-xs flex flex-col items-center justify-between ${
                        i === 1 ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 pb-5 bg-gradient-to-b from-amber-50/50 to-white' : ''
                      }`}
                    >
                      <div className="text-2xl">{medal(p.rank)}</div>
                      <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full object-cover my-1.5 border border-[#D4AF37]/50" />
                      <div className="font-serif font-bold text-[#2C3E50] text-sm truncate max-w-full">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-stone-400">{p.city} · 胜{p.wins}场</div>
                      <div className="text-[#85660d] font-serif font-bold text-xs mt-1">
                        {p.points.toLocaleString()} 分
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 列表排名 */}
              <div className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-xs">
                {SEASON.map((p) => (
                  <div
                    key={p.rank}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-[#EAE6DF] last:border-0 ${
                      p.rank <= 3 ? 'bg-[#D4AF37]/5' : ''
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        p.rank <= 3
                          ? 'bg-[#D4AF37]/20 text-[#85660d]'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {p.rank}
                    </span>
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#2C3E50] truncate">{p.name}</div>
                      <div className="text-[10px] text-stone-400">{p.city} · 胜场 {p.wins}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${tierCls(p.tier)}`}>
                      {p.tier}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#85660d] shrink-0">
                      {p.points.toLocaleString()} 分
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 单场成绩单 */}
          {current && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs">
                <div className="text-sm font-serif font-bold text-[#2C3E50] mb-2">{current.eventTitle}</div>
                <div className="space-y-2">
                  {(current.rankings || []).map((b: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{medal(idx + 1)}</span>
                        <span className="font-bold text-[#2C3E50] text-xs">{b.team || b.name || '老友队'}</span>
                        {b.players && (
                          <span className="text-[10px] text-stone-500">({b.players.join('、')})</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[#85660d] font-bold text-xs">{b.score || b.points} 胜分</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
