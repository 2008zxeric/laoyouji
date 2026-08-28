import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Award,
  Star,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Search,
  Sparkles,
  Heart,
  UserCheck,
  Phone,
  Clock,
  Compass,
} from 'lucide-react';
import type { Tgo } from '../api/gateway';

export const TgoListModal: React.FC = () => {
  const {
    isTgoListOpen,
    setIsTgoListOpen,
    tgos,
    setSelectedTgo,
    activities,
    events,
    openBooking,
    showToast,
  } = useApp();

  const [tierFilter, setTierFilter] = useState<'all' | 'gold' | 'silver' | 'bronze'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isTgoListOpen) return null;

  const filteredTgos = tgos.filter((t) => {
    if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchSpec = t.specialty?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchSpec) return false;
    }
    return true;
  });

  // Handle direct booking from TGO card's next schedule
  const handleQuickBook = (t: Tgo, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCal = t.calendar?.[0];
    if (!nextCal) {
      setSelectedTgo(t);
      return;
    }

    const isEvent = nextCal.type === '赛事' || nextCal.type === 'event';
    const pool = isEvent ? events : activities;
    const hit =
      pool.find((p) => p.id === nextCal.activityId || p.title.includes(nextCal.title.slice(0, 4))) ||
      activities[0];

    if (hit) {
      openBooking(isEvent ? 'event' : 'activity', hit);
      showToast(`已为您调起 ${t.name} 带队的「${hit.title}」预约通道`);
    } else {
      setSelectedTgo(t);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#2C3E50] text-[#FAF9F6] px-5 py-4 border-b border-[#D4AF37]/30 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-bold text-lg text-[#FAF9F6]">
                  四季游 · 认证 TGO 伴游管家团队
                </h3>
                <span className="bg-[#D4AF37] text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  严选认证 · {tgos.length} 位名家
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                特聘国家研学导师、急救红十字认证员与文化学者，全程慢调如侍父母
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTgoListOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border-b border-[#EAE6DF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: '全部管家' },
              { id: 'gold', label: '🥇 金旅伴 (学者名师)' },
              { id: 'silver', label: '🥈 银旅伴 (资深金牌)' },
              { id: 'bronze', label: '🥉 铜旅伴 (认证管家)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  tierFilter === tab.id
                    ? 'bg-[#2C3E50] text-[#D4AF37] shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="按姓名或专长搜索 (如：急救、古建)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F6] border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#2C3E50]"
            />
          </div>
        </div>

        {/* TGO Card Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTgos.map((t) => {
              const nextTrip = t.calendar?.[0];
              const isGold = t.tier === 'gold';
              const isSilver = t.tier === 'silver';

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTgo(t)}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-[#D4AF37] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3 relative overflow-hidden"
                >
                  {/* Top badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-14 h-14 rounded-full object-cover border-2 shadow-xs"
                          style={{ borderColor: t.color || '#D4AF37' }}
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs text-white ${
                            isGold
                              ? 'bg-amber-600'
                              : isSilver
                              ? 'bg-slate-600'
                              : 'bg-amber-800'
                          }`}
                        >
                          {t.badge || (isGold ? '金牌' : isSilver ? '银牌' : '铜牌')}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#2C3E50] group-hover:text-[#D4AF37] transition-colors">
                            {t.name}
                          </h4>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: `${t.color || '#D4AF37'}20`,
                              color: t.color || '#85660d',
                            }}
                          >
                            {isGold ? '金牌学者旅伴' : isSilver ? '资深金牌管家' : '认证伴游管家'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                          {t.title}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{t.rating || '5.0'}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        好评率 {t.praiseRate || 99}%
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {(t.specialty || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Motto & Track Record */}
                  <div className="p-2.5 bg-[#FAF9F6] rounded-xl border border-stone-100 text-xs space-y-1 text-stone-600">
                    <p className="italic text-stone-700 font-serif">
                      "{t.motto || '慢游随心，如侍父母'}"
                    </p>
                    <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-200">
                      <span>累计安全带团：<strong className="text-[#2C3E50]">{t.trips || 12}</strong> 场</span>
                      <span>未来已排期：<strong className="text-emerald-700">{t.calendar?.length || 0}</strong> 场</span>
                    </div>
                  </div>

                  {/* Next upcoming tour */}
                  {nextTrip && (
                    <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] mb-0.5">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" />
                          <span>近期带团：{nextTrip.date}</span>
                        </div>
                        <div className="text-stone-800 font-medium truncate text-xs">
                          {nextTrip.title}
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shrink-0 border border-emerald-200">
                        余 {nextTrip.remaining} 席
                      </span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTgo(t);
                      }}
                      className="text-[#85660d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>查看个人档案与排期</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleQuickBook(t, e)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2C3E50] hover:bg-[#1f2d3a] text-[#D4AF37] font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>预约TA带队</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTgos.length === 0 && (
            <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
              未找到符合条件的伴游管家档案
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t border-[#EAE6DF] text-center text-xs text-stone-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>持证上岗 · 100% 实名认证</span>
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>三甲医院医护随队</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>无购物无强制自费</span>
          </span>
        </div>
      </div>
    </div>
  );
};
