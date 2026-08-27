import React, { useMemo, useState } from 'react';
import { X, CalendarDays, CheckCircle2, Star, ChevronRight, Award, Footprints, ShieldCheck, Heart, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_REVIEWS } from '../data/mockData';
import { useTgoAvatars, tgoAvatarUrl } from '../hooks/useTgoAvatars';
import { TgoSchedulePicker } from './TgoSchedulePicker';
import type { Tgo } from '../api/gateway';

interface TgoLike extends Tgo {}

const TYPE_FILTERS = [
  { id: 'all', label: '全部' },
  { id: '慢游', label: '文化慢游' },
  { id: '赛事', label: '乐龄赛事' },
];

function timeKey(date: string): 'thisMonth' | 'nextMonth' | 'later' {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const [yy, mm] = date.split('-').map(Number);
  if (yy === y && mm === m + 1) return 'thisMonth';
  if (yy === y && mm === m + 2) return 'nextMonth';
  return 'later';
}

export const TgoDetailModal: React.FC<{ tgo: TgoLike; onClose: () => void }> = ({ tgo, onClose }) => {
  const { activities, events, setSelectedActivity, setSelectedEvent, showToast } = useApp();
  const avatars = useTgoAvatars();
  const [calType, setCalType] = useState('all');
  const [calTime, setCalTime] = useState('all');
  const [calExpanded, setCalExpanded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const REVIEWS_FALLBACK = [
    { id: 'r1', author: '陈伯年 (退休教授)', rating: 5, content: '带队特别细心，拙政园的私享讲解生动有趣，一路照顾我们的腿脚，像自家晚辈一样贴心。', activityTitle: '苏州园林与吴门文脉5日名师慢游', date: '2026-08-20' },
    { id: 'r2', author: '赵玉珍 (退休医生)', rating: 5, content: '随车急救箱和血压监测准备得非常充分，每天步数合理不疲劳，体验极佳。', activityTitle: '千岛湖太极养生五日营', date: '2026-08-15' },
  ];

  const normTitle = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/[··/｜|、\s\-—–（）()]/g, '');

  const openTarget = (item: { type: string; activityId: string; title: string }) => {
    const isEvent =
      item.type === '赛事' || item.type === 'event' || item.type === 'events';
    const pool: any[] = isEvent ? events : activities;
    const nt = normTitle(item.title);
    const hit =
      pool.find(
        (p) =>
          (item.activityId && (p.id === item.activityId || p.code === item.activityId || (p as any)._id === item.activityId)) ||
          (nt && (normTitle(p.title) === nt || (nt.length >= 4 && normTitle(p.title).includes(nt)) || (nt.length >= 4 && nt.includes(normTitle(p.title)))))
      ) || null;
    if (hit) {
      onClose();
      if (isEvent) setSelectedEvent(hit);
      else setSelectedActivity(hit);
      return;
    }
    showToast('已为您定位到「' + (item.title || '该场次') + '」相关研学行程');
  };

  const calFiltered = useMemo(() => {
    return [...(tgo.calendar || [])]
      .filter((it) => calType === 'all' || it.type === calType)
      .filter((it) => calTime === 'all' || timeKey(it.date) === calTime)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tgo.calendar, calType, calTime]);

  const avatarSrc = tgoAvatarUrl(avatars, tgo.id, tgo.avatar);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden relative">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/30 z-10">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" /> TGO 旅伴管家档案
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs pb-24">
          {/* 头部档案卡 */}
          <div className="bg-gradient-to-br from-[#2C3E50] via-[#34495e] to-[#1a252f] text-white rounded-3xl p-5 border border-[#D4AF37]/30 shadow-md flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={avatarSrc}
                alt={tgo.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#2C3E50] text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                {tgo.badge || '金牌'}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-amber-100">{tgo.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {tgo.tier === 'gold' ? '金旅伴' : tgo.tier === 'silver' ? '银旅伴' : '铜旅伴'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-1">{tgo.title}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-amber-200">
                <span>⭐ 综合评分 5.0</span>
                <span>·</span>
                <span>带团 {tgo.trips || 12}+ 场</span>
                <span>·</span>
                <span>好评率 99.8%</span>
              </div>
            </div>
          </div>

          {/* 个人理念 */}
          {tgo.motto && (
            <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs text-center">
              <div className="font-serif italic font-bold text-sm text-[#2C3E50]">
                “ {tgo.motto} ”
              </div>
            </div>
          )}

          {/* 擅长领域 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-2">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>管家特长与资质认证</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(tgo.specialty || ['名胜古建精讲', '适老慢行照护', '国家高级急救员', '单反摄影随行']).map((sp, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-50 text-[#85660d] border border-amber-200/80 font-medium">
                  {sp}
                </span>
              ))}
            </div>
          </div>

          {/* 职业经历 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-2">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-[#D4AF37]" />
              <span>管家经历与服务理念</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              {tgo.intro || `${tgo.name} 专注乐龄高净值知青文旅慢游服务逾8年，精通江南文脉与非遗研学，具备红十字急救员资格，以“如侍父母”的温情照护与学者同行的深度导赏著称。`}
            </p>
          </div>

          {/* 带团日历 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                <span>TA 的近期带团排期 ({calFiltered.length})</span>
              </div>
              <button
                onClick={() => setShowPicker(true)}
                className="text-[11px] text-[#85660d] font-bold hover:underline cursor-pointer"
              >
                全部排班日历 →
              </button>
            </div>

            <div className="space-y-2">
              {calFiltered.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  onClick={() => openTarget(c)}
                  className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200 hover:border-[#D4AF37] transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-[#D4AF37]">{c.date}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2C3E50]/10 text-[#2C3E50] font-bold">{c.type}</span>
                    </div>
                    <div className="font-serif font-bold text-xs text-[#2C3E50]">{c.title}</div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-1">
                    <span className="text-[11px] text-emerald-700 font-medium">余 {c.remaining} 席</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 老友评价 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>老友真实点评 ({REVIEWS_FALLBACK.length})</span>
            </div>
            <div className="space-y-2.5">
              {REVIEWS_FALLBACK.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-100 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#2C3E50]">{r.author}</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EAE6DF] p-3 flex items-center gap-3">
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 py-3 rounded-2xl bg-[#2C3E50] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>跟着 {tgo.name} 去慢游（选择出行场次）</span>
          </button>
        </div>

        {/* 日历选择弹窗 */}
        {showPicker && (
          <TgoSchedulePicker
            tgoName={tgo.name}
            tgoColor={tgo.color}
            calendar={tgo.calendar || []}
            onOpen={(item) => {
              setShowPicker(false);
              openTarget(item);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
};
