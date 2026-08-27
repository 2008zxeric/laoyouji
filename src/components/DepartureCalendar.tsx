import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ActivityDepartureDate } from '../types';

interface Props {
  dates: ActivityDepartureDate[];
  ruleSummary?: string;
  value?: string;
  onChange?: (date: string) => void;
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

export const DepartureCalendar: React.FC<Props> = ({ dates, ruleSummary, value, onChange }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(value || dates[0]?.date || '');
  const [showAll, setShowAll] = useState(false);

  const dateMap = new Map(dates.map((d) => [d.date, d]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const selDate = (sel && dateMap.get(sel)) as ActivityDepartureDate | undefined;

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

  const pick = (d: string) => {
    setSel(d);
    onChange && onChange(d);
  };

  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const visible = showAll ? sorted : sorted.slice(0, 6);

  return (
    <div className="dep-cal">
      {/* 发班规律 */}
      {ruleSummary && (
        <div className="mb-3 px-3 py-2 bg-[#FAF9F6] rounded-xl border border-[#D4AF37]/30 flex items-center gap-1.5 text-xs text-[#85660d] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#B8843E]" />
          <span>✨ {ruleSummary}</span>
          <span className="ml-auto text-[10px] text-stone-500 font-normal">共 {dates.length} 期</span>
        </div>
      )}

      {/* 月历 */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => move(-1)}
          className="w-8 h-8 rounded-full border border-[#EAE6DF] bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="font-serif font-bold text-[#2C3E50] text-sm">{year} 年 {month + 1} 月</div>
        <button
          type="button"
          onClick={() => move(1)}
          className="w-8 h-8 rounded-full border border-[#EAE6DF] bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center mb-1">
        {WEEK.map((w) => (
          <div key={w} className="text-[11px] text-stone-400 py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const has = dateMap.has(key);
          const isSel = sel === key;
          const isToday = todayKey === key;
          return (
            <div
              key={key}
              onClick={() => has && pick(key)}
              className={`relative h-9 flex items-center justify-center text-xs rounded-lg border cursor-pointer transition-all ${
                isSel
                  ? 'bg-[#2C3E50] text-amber-100 border-[#2C3E50] font-bold shadow-xs'
                  : has
                  ? 'border-[#D4AF37]/50 text-[#2C3E50] font-semibold bg-[#D4AF37]/10 hover:border-[#D4AF37]'
                  : 'border-transparent text-stone-400'
              }`}
            >
              <span className={isToday && !isSel ? 'text-[#B8843E] font-bold' : ''}>{d}</span>
              {has && (
                <span
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSel ? 'bg-amber-100' : 'bg-[#D4AF37]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 选中班次信息 */}
      {selDate ? (
        <div className="mt-3 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-xl p-3">
          <div className="text-xs font-serif font-bold text-[#2C3E50]">📅 {selDate.date} 发班</div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-stone-500">大团</span>
            <span className="text-[#D96C5A] font-serif font-bold text-base">¥{selDate.largePrice}</span>
            {selDate.smallPrice > selDate.largePrice && (
              <>
                <span className="text-[11px] text-stone-500 ml-2">小团</span>
                <span className="text-[#B8843E] font-serif font-bold text-base">¥{selDate.smallPrice}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500">
            {selDate.singleSupplement > 0 && <span>单房差 ¥{selDate.singleSupplement}/晚</span>}
            <span className={selDate.remainingSlots <= 5 ? 'text-red-500 font-bold' : ''}>
              余 {selDate.remainingSlots} 席
            </span>
            {selDate.tag && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#2C3E50]/10 text-[#2C3E50]">
                {selDate.tag}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-center text-[11px] text-stone-400 bg-[#FAF9F6] border border-dashed border-[#E3D9C4] rounded-xl py-3">
          本活动暂无 {year} 年 {month + 1} 月班次，请切换月份或查看近期班次
        </div>
      )}

      {/* 近期班次快速点选 */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#2C3E50]">近期班次（共 {sorted.length} 期）</span>
          {!showAll && sorted.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-[11px] text-[#85660d] font-bold hover:underline"
            >
              查看全部 ({sorted.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visible.map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => pick(d.date)}
              className={`p-2 rounded-xl text-left border text-xs transition-all ${
                sel === d.date
                  ? 'bg-[#2C3E50] text-amber-100 border-[#2C3E50] shadow-xs'
                  : 'bg-white text-stone-800 border-[#EAE6DF] hover:border-[#D4AF37]'
              }`}
            >
              <div className="font-bold">{d.date}</div>
              <div className="text-[11px] mt-0.5 opacity-90">¥{d.largePrice} 起 · 余{d.remainingSlots}席</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
