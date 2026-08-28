import React, { useMemo, useState } from 'react';
import { X, CalendarDays, ChevronLeft, ChevronRight, List, Grid } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activities, events, setSelectedActivity, setSelectedEvent } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(now.getDate());
  const [typeFilter, setTypeFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // 全部场次（活动 departureDates + 赛事日期）
  const allItems = useMemo(() => {
    const items: { date: string; title: string; type: string; id: string; price?: number; destination?: string }[] = [];
    activities.forEach((a) => {
      (a.departureDates || []).forEach((d) =>
        items.push({
          date: d.date,
          title: a.title,
          type: '慢游',
          id: a.id,
          price: a.priceGroup,
          destination: a.destination,
        })
      );
    });
    events.forEach((e) =>
      items.push({
        date: e.startDate,
        title: e.title,
        type: '赛事',
        id: e.id,
        price: e.registrationFee || (e as any).price || 0,
        destination: e.city,
      })
    );
    return items
      .filter((it) => typeFilter === 'all' || it.type === typeFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activities, events, typeFilter]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const key = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dayItems = allItems.filter((it) => it.date === key(sel));
  const has = (d: number) => allItems.some((it) => it.date === key(d));
  const monthItems = allItems.filter((it) => it.date.slice(0, 7) === key(1).slice(0, 7));

  const move = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    }
    if (m > 11) {
      m = 0;
      y++;
    }
    setYear(y);
    setMonth(m);
  };

  const openItem = (it: { type: string; id: string }) => {
    onClose();
    if (it.type === '赛事') {
      const evt = events.find((e) => e.id === it.id);
      if (evt) setSelectedEvent(evt);
    } else {
      const act = activities.find((a) => a.id === it.id);
      if (act) setSelectedActivity(act);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#D4AF37]" /> 老友文旅 · 活动与赛事日历
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="p-1.5 rounded-lg border border-white/20 bg-white/10 text-amber-200 hover:bg-white/20 cursor-pointer"
              title="切换视图"
            >
              {view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 类型筛选 */}
          <div className="flex gap-2">
            {[
              ['all', '全部活动与赛事'],
              ['慢游', '文化研学慢游'],
              ['赛事', '乐龄棋牌赛事'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTypeFilter(id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  typeFilter === id
                    ? 'bg-[#2C3E50] text-amber-100 border border-[#D4AF37]/30 shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {view === 'grid' ? (
            <>
              {/* 月历控制器 */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => move(-1)}
                    className="w-8 h-8 rounded-full border border-[#EAE6DF] bg-[#FAF9F6] flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="font-serif font-bold text-[#2C3E50] text-base">
                    {year} 年 {month + 1} 月
                  </div>
                  <button
                    onClick={() => move(1)}
                    className="w-8 h-8 rounded-full border border-[#EAE6DF] bg-[#FAF9F6] flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center mb-1">
                  {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
                    <div key={w} className="text-xs text-stone-400 py-1 font-medium">{w}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const k = key(d);
                    const h = has(d);
                    const isSel = sel === d;
                    return (
                      <div
                        key={k}
                        onClick={() => setSel(d)}
                        className={`relative h-10 flex flex-col items-center justify-center text-xs rounded-xl border cursor-pointer transition-all ${
                          isSel
                            ? 'bg-[#2C3E50] text-amber-100 border-[#2C3E50] font-bold shadow-xs'
                            : h
                            ? 'border-[#D4AF37]/50 text-[#2C3E50] font-semibold bg-[#D4AF37]/10 hover:border-[#D4AF37]'
                            : 'border-transparent text-stone-400'
                        }`}
                      >
                        <span>{d}</span>
                        {h && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                              isSel ? 'bg-amber-100' : 'bg-[#D4AF37]'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 选中日期当天的活动 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#2C3E50] flex items-center justify-between">
                  <span>📅 {key(sel)} 安排 ({dayItems.length})</span>
                  {dayItems.length > 0 && <span className="text-emerald-700">可直接点击直达预订</span>}
                </div>
                {dayItems.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center text-stone-400 text-xs border border-[#EAE6DF]">
                    当天暂无发班安排，请点击带金色圆点的日期查看
                  </div>
                ) : (
                  dayItems.map((it, idx) => (
                    <div
                      key={idx}
                      onClick={() => openItem(it)}
                      className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] hover:border-[#D4AF37] shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${it.type === '慢游' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                            {it.type}
                          </span>
                          {it.destination && (
                            <span className="text-[11px] text-stone-400">📍 {it.destination}</span>
                          )}
                        </div>
                        <div className="font-serif font-bold text-sm text-[#2C3E50] line-clamp-1 group-hover:text-[#85660d]">
                          {it.title}
                        </div>
                      </div>
                      {it.price !== undefined && (
                        <div className="text-right shrink-0">
                          <div className="text-xs font-serif font-bold text-[#2C3E50]">¥{it.price}起</div>
                          <div className="text-[10px] text-stone-400">查看详情 →</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* 列表视图 */
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-500">本月全部发班与赛事 ({monthItems.length})</div>
              {monthItems.map((it, idx) => (
                <div
                  key={idx}
                  onClick={() => openItem(it)}
                  className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] hover:border-[#D4AF37] shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-[#D4AF37]">{it.date}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${it.type === '慢游' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {it.type}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-sm text-[#2C3E50]">{it.title}</div>
                  </div>
                  <div className="text-xs text-stone-400">查看 ›</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
