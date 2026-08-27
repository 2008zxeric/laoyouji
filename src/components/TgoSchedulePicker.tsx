import React, { useMemo, useState } from 'react';
import { X, ChevronRight, CalendarDays, Filter } from 'lucide-react';

interface CalendarItem {
  date: string;
  activityId: string;
  title: string;
  type: string;
  remaining: number;
}

interface Props {
  tgoName: string;
  tgoColor: string;
  calendar: CalendarItem[];
  onOpen: (item: CalendarItem) => void;
  onClose: () => void;
}

const TYPE_FILTERS = [
  { id: 'all', label: '全部' },
  { id: '慢游', label: '文化研学' },
  { id: '赛事', label: '乐龄赛事' },
];

const TIME_FILTERS = [
  { id: 'all', label: '全部时间' },
  { id: 'thisMonth', label: '本月' },
  { id: 'nextMonth', label: '下月' },
  { id: 'later', label: '未来排期' },
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

export const TgoSchedulePicker: React.FC<Props> = ({
  tgoName,
  tgoColor,
  calendar,
  onOpen,
  onClose,
}) => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    return calendar
      .filter((it) => typeFilter === 'all' || it.type === typeFilter)
      .filter((it) => timeFilter === 'all' || timeKey(it.date) === timeFilter)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [calendar, typeFilter, timeFilter]);

  // 月份分组
  const groups = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    filtered.forEach((it) => {
      const key = it.date.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const visibleCount = expanded ? Infinity : 3;
  const total = filtered.length;
  const hidden = Math.max(0, total - visibleCount);

  const shownGroups = useMemo(() => {
    let shown = 0;
    const out: [string, CalendarItem[]][] = [];
    for (const [k, items] of groups) {
      if (shown >= visibleCount) break;
      const take = items.slice(0, visibleCount - shown);
      out.push([k, take]);
      shown += take.length;
    }
    return out;
  }, [groups, visibleCount]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" style={{ color: tgoColor || '#D4AF37' }} />
            <span>选择出行场次 · 跟着 {tgoName} 出游</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
          {/* 引导语 */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] rounded-2xl p-4 border border-[#D4AF37]/25 text-white">
            <div className="text-sm font-bold text-amber-100">
              与 {tgoName} 结伴慢游
            </div>
            <div className="text-[11px] text-stone-300 mt-1 leading-relaxed">
              专享 1:8 适老黄金服务比，全程医护防跌、随团摄影、深度文脉讲解（共 {total} 期班次）
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <div className="flex gap-1.5 flex-1">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTypeFilter(f.id)}
                    className={`flex-1 text-[11px] py-1.5 rounded-xl font-semibold cursor-pointer transition-all ${
                      typeFilter === f.id
                        ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <div className="flex gap-1.5 flex-1">
                {TIME_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTimeFilter(f.id)}
                    className={`flex-1 text-[11px] py-1.5 rounded-xl font-semibold cursor-pointer transition-all ${
                      timeFilter === f.id
                        ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 分组列表 */}
          {shownGroups.length === 0 ? (
            <div className="text-center text-xs text-stone-400 py-12 bg-white rounded-2xl border border-[#EAE6DF]">
              该筛选条件下暂无排团记录
            </div>
          ) : (
            shownGroups.map(([month, items]) => (
              <div key={month} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#2C3E50]">
                    📅 {month.slice(0, 4)} 年 {Number(month.slice(5, 7))} 月
                  </span>
                  <span className="text-[10px] text-stone-400">{items.length} 场可报</span>
                </div>
                <div className="bg-white rounded-2xl border border-[#EAE6DF] divide-y divide-stone-100 overflow-hidden shadow-xs">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => onOpen(item)}
                      className="p-3 hover:bg-amber-50/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono font-bold text-[#D4AF37] text-xs">{item.date}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                            item.type === '赛事' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-xs text-[#2C3E50]">{item.title}</div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <span className="text-[11px] text-emerald-700 font-medium">余 {item.remaining} 席</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {hidden > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer shadow-xs"
            >
              展开查看其余 {hidden} 场班期 ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
