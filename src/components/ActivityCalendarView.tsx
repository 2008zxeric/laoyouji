import React, { useState, useMemo } from 'react';
import { Activity, ActivityDepartureDate } from '../types';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Footprints,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ActivityCalendarViewProps {
  activities: Activity[];
  selectedMonth: string; // e.g. 'all', '2026-08', '2026-09', '2026-10', '2026-11'
  onSelectMonth: (month: string) => void;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

interface AggregatedDepartureItem {
  activity: Activity;
  departure: ActivityDepartureDate;
}

export const ActivityCalendarView: React.FC<ActivityCalendarViewProps> = ({
  activities,
  selectedMonth,
  onSelectMonth,
}) => {
  const { setSelectedActivity, openBooking, isCareMode } = useApp();

  // Current calendar view year & month state
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (selectedMonth && selectedMonth !== 'all') {
      const [y] = selectedMonth.split('-').map(Number);
      return y || 2026;
    }
    return 2026;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (selectedMonth && selectedMonth !== 'all') {
      const [, m] = selectedMonth.split('-').map(Number);
      return m ? m - 1 : 8; // default to September (index 8) or August
    }
    return 8; // September 2026 (index 8)
  });

  // Selected date in format YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');

  // Month String for current calendar page
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // When selectedMonth prop changes, update internal month
  React.useEffect(() => {
    if (selectedMonth && selectedMonth !== 'all') {
      const [y, m] = selectedMonth.split('-').map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
    }
  }, [selectedMonth]);

  // Aggregate all departures by date for the current filtered activities
  const departuresByDateMap = useMemo(() => {
    const map = new Map<string, AggregatedDepartureItem[]>();

    activities.forEach((act) => {
      act.departureDates?.forEach((dep) => {
        const list = map.get(dep.date) || [];
        list.push({ activity: act, departure: dep });
        map.set(dep.date, list);
      });
    });

    return map;
  }, [activities]);

  // List of all departures in the current viewed month, sorted by date
  const monthlyDepartures = useMemo(() => {
    const result: AggregatedDepartureItem[] = [];
    departuresByDateMap.forEach((items, dateStr) => {
      if (dateStr.startsWith(currentMonthKey)) {
        result.push(...items);
      }
    });
    return result.sort((a, b) => a.departure.date.localeCompare(b.departure.date));
  }, [departuresByDateMap, currentMonthKey]);

  // Calendar matrix calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Departures for the currently selected date
  const selectedDateDepartures = useMemo(() => {
    return departuresByDateMap.get(selectedDate) || [];
  }, [departuresByDateMap, selectedDate]);

  const handlePrevMonth = () => {
    let nextM = currentMonth - 1;
    let nextY = currentYear;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    }
    setCurrentYear(nextY);
    setCurrentMonth(nextM);
    const key = `${nextY}-${String(nextM + 1).padStart(2, '0')}`;
    onSelectMonth(key);
  };

  const handleNextMonth = () => {
    let nextM = currentMonth + 1;
    let nextY = currentYear;
    if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    setCurrentYear(nextY);
    setCurrentMonth(nextM);
    const key = `${nextY}-${String(nextM + 1).padStart(2, '0')}`;
    onSelectMonth(key);
  };

  const handleQuickJump = (monthStr: string) => {
    onSelectMonth(monthStr);
    if (monthStr !== 'all') {
      const [y, m] = monthStr.split('-').map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
      // Pick first available departure date in that month
      const firstDep = (Array.from(departuresByDateMap.keys()) as string[])
        .filter((d) => d.startsWith(monthStr))
        .sort()[0];
      if (firstDep) {
        setSelectedDate(firstDep);
      }
    }
  };

  // Month season labels for 50-75 age group
  const getMonthThemeLabel = (y: number, m: number) => {
    if (y === 2026) {
      if (m === 7) return '盛夏避暑 · 园林避热慢品';
      if (m === 8) return '初秋金桂 · 学者带队首发季';
      if (m === 9) return '金秋国庆 · 赏秋品蟹特辑';
      if (m === 10) return '初冬暖阳 · 银杏私汤康养';
      if (m === 11) return '候鸟暖冬 · 海滨旅居品鲜';
    }
    return '乐龄慢调研学班期';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Quick Month Jump Tabs */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EAE6DF] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif font-bold text-sm sm:text-base text-[#2C3E50]">
              快捷月份直达（点击快速切换）
            </span>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline">
            共找到 <strong className="text-[#2C3E50]">{monthlyDepartures.length}</strong> 个出发班期
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* August 2026 (本月) */}
          <button
            onClick={() => handleQuickJump('2026-08')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              currentMonthKey === '2026-08'
                ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm ring-2 ring-[#D4AF37]/50'
                : 'bg-[#FAF9F6] text-stone-700 border-[#EAE6DF] hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm">2026年 8月</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  currentMonthKey === '2026-08'
                    ? 'bg-[#D4AF37] text-stone-950'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                本月出游
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1 truncate">盛夏避暑 · 园林清凉</p>
          </button>

          {/* September 2026 (下个月) */}
          <button
            onClick={() => handleQuickJump('2026-09')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              currentMonthKey === '2026-09'
                ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm ring-2 ring-[#D4AF37]/50'
                : 'bg-[#FAF9F6] text-stone-700 border-[#EAE6DF] hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm">2026年 9月</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                  currentMonthKey === '2026-09'
                    ? 'bg-[#D4AF37] text-stone-950'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <Flame className="w-2.5 h-2.5 text-amber-700 fill-amber-700" />
                下月热选
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1 truncate">初秋金桂 · 学者带队</p>
          </button>

          {/* October 2026 (金秋国庆) */}
          <button
            onClick={() => handleQuickJump('2026-10')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              currentMonthKey === '2026-10'
                ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm ring-2 ring-[#D4AF37]/50'
                : 'bg-[#FAF9F6] text-stone-700 border-[#EAE6DF] hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm">2026年 10月</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  currentMonthKey === '2026-10'
                    ? 'bg-[#D4AF37] text-stone-950'
                    : 'bg-orange-100 text-orange-900'
                }`}
              >
                金秋国庆
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1 truncate">赏秋品蟹 · 莫高特窟</p>
          </button>

          {/* November 2026 (暖冬康养) */}
          <button
            onClick={() => handleQuickJump('2026-11')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              currentMonthKey === '2026-11'
                ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-sm ring-2 ring-[#D4AF37]/50'
                : 'bg-[#FAF9F6] text-stone-700 border-[#EAE6DF] hover:border-[#D4AF37]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm">2026年 11月</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  currentMonthKey === '2026-11'
                    ? 'bg-[#D4AF37] text-stone-950'
                    : 'bg-teal-100 text-teal-900'
                }`}
              >
                银杏温泉
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-1 truncate">腾冲私汤 · 青城道医</p>
          </button>
        </div>
      </div>

      {/* Main Calendar Panel */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EAE6DF] shadow-sm">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
              title="上一月"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-2xl text-[#2C3E50]">
                  {currentYear} 年 {currentMonth + 1} 月
                </h3>
                <span className="bg-[#D4AF37]/20 text-[#85660d] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40">
                  {getMonthThemeLabel(currentYear, currentMonth)}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl border border-stone-200 bg-[#FAF9F6] hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
              title="下一月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-stone-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] inline-block"></span>
              有发班活动
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50] inline-block"></span>
              当前选中日期
            </span>
          </div>
        </div>

        {/* Calendar Weekday Header */}
        <div className="grid grid-cols-7 text-center pt-3 pb-2">
          {WEEKDAYS.map((w, idx) => (
            <div
              key={w}
              className={`text-xs sm:text-sm font-bold py-1 ${
                idx === 0 || idx === 6 ? 'text-amber-700' : 'text-stone-500'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Blank spaces before day 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="h-16 sm:h-20 bg-stone-50/50 rounded-xl border border-transparent"
            />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const departuresOnDate = departuresByDateMap.get(dateStr) || [];
            const hasDepartures = departuresOnDate.length > 0;
            const isSelected = selectedDate === dateStr;
            const minPrice = hasDepartures
              ? Math.min(...departuresOnDate.map((d) => d.departure.largePrice))
              : null;
            const hasFewSlots = departuresOnDate.some((d) => d.departure.remainingSlots <= 3);

            return (
              <div
                key={dateStr}
                onClick={() => {
                  if (hasDepartures) {
                    setSelectedDate(dateStr);
                  }
                }}
                className={`relative h-16 sm:h-20 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                  hasDepartures
                    ? 'cursor-pointer hover:shadow-md hover:border-[#D4AF37]'
                    : 'bg-stone-50/40 border-stone-100 text-stone-300'
                } ${
                  isSelected
                    ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-md ring-2 ring-[#D4AF37]'
                    : hasDepartures
                    ? 'bg-white border-[#D4AF37]/40 text-stone-800'
                    : ''
                }`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-serif text-xs sm:text-base font-bold ${
                      isSelected
                        ? 'text-amber-200'
                        : hasDepartures
                        ? 'text-[#2C3E50]'
                        : 'text-stone-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasDepartures && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded-md font-bold ${
                        isSelected
                          ? 'bg-[#D4AF37] text-stone-950'
                          : hasFewSlots
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-[#85660d]'
                      }`}
                    >
                      {departuresOnDate.length}团
                    </span>
                  )}
                </div>

                {/* Date Content / Price Badge */}
                {hasDepartures ? (
                  <div className="space-y-0.5">
                    <div
                      className={`text-[10px] sm:text-xs font-bold leading-tight ${
                        isSelected ? 'text-amber-100' : 'text-[#85660d]'
                      }`}
                    >
                      ¥{minPrice}
                      <span className="text-[9px] font-normal opacity-80">起</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1">
                      {hasFewSlots ? (
                        <span
                          className={`text-[9px] truncate px-1 rounded ${
                            isSelected ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          余位告急
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] truncate px-1 rounded ${
                            isSelected ? 'bg-white/10 text-stone-200' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          名师随团
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-stone-300 text-center">-</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details Panel */}
      {selectedDate && selectedDateDepartures.length > 0 ? (
        <div className="bg-[#FAF9F6] rounded-3xl p-4 sm:p-6 border-2 border-[#D4AF37]/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#2C3E50] text-[#D4AF37] text-xs sm:text-sm font-bold px-3 py-1 rounded-xl">
                📅 {selectedDate}
              </span>
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50]">
                当日发班路线（共 {selectedDateDepartures.length} 条）
              </h4>
            </div>
            <span className="text-xs text-stone-500">
              全程配备适老医疗保障 · 慢步调不赶路
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDateDepartures.map(({ activity, departure }) => (
              <div
                key={`${activity.id}-${departure.date}`}
                onClick={() => setSelectedActivity(activity)}
                className="bg-white rounded-2xl p-4 border border-[#EAE6DF] hover:border-[#D4AF37] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="flex gap-3">
                  <img
                    src={activity.cover}
                    alt={activity.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#2C3E50] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {activity.category}
                      </span>
                      <span className="bg-stone-100 text-stone-700 text-[10px] px-1.5 py-0.5 rounded-md">
                        {activity.durationDays}天{activity.durationNights}晚
                      </span>
                      {departure.tag && (
                        <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-[#D4AF37]/30">
                          {departure.tag}
                        </span>
                      )}
                    </div>

                    <h5 className="font-serif font-bold text-sm sm:text-base text-[#2C3E50] line-clamp-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {activity.title}
                    </h5>

                    <div className="text-xs text-stone-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span>{activity.destination}</span>
                    </div>

                    {activity.master && (
                      <div className="text-[11px] text-[#85660d] flex items-center gap-1 font-medium truncate">
                        <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span>随团名师：{activity.master.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Elder Fitness & Slots */}
                <div className="bg-[#F8F9FA] rounded-xl p-2.5 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Footprints className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span className="truncate">{activity.fitnessDesc}</span>
                  </div>

                  <div className="shrink-0 font-bold ml-2">
                    {departure.remainingSlots <= 3 ? (
                      <span className="text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <Flame className="w-3 h-3 fill-rose-600" />
                        余位仅剩 {departure.remainingSlots} 席
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        余位充足 ({departure.remainingSlots}席)
                      </span>
                    )}
                  </div>
                </div>

                {/* Price and CTA Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-500">慢游体验价</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-[#2C3E50]">¥</span>
                      <span className="text-xl font-bold font-serif text-[#2C3E50]">
                        {departure.largePrice}
                      </span>
                      <span className="text-xs text-stone-500">/人</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivity(activity);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>查看行程</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBooking('activity', activity);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-100 bg-[#2C3E50] hover:bg-[#1a252f] transition-all shadow-xs flex items-center gap-1.5 border border-[#D4AF37]/30"
                    >
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>立即预订</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF9F6] rounded-2xl p-6 text-center border border-dashed border-stone-300 text-stone-500 text-sm">
          💡 点击日历上有金色标记的日期，即可查看当日发班的研学路线详情与余位信息。
        </div>
      )}

      {/* Monthly Timeline: Chronological List of All Departures in the Month */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#2C3E50]">
              {currentYear}年 {currentMonth + 1}月 全部出团排期总览（按日期先后）
            </h4>
          </div>
          <span className="text-xs text-stone-500">
            共 {monthlyDepartures.length} 个班次
          </span>
        </div>

        {monthlyDepartures.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            本月暂无排期活动，请切换至 8月(本月)、9月(下月) 或 10月(金秋) 查看
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {monthlyDepartures.map(({ activity, departure }) => (
              <div
                key={`timeline-${activity.id}-${departure.date}`}
                onClick={() => setSelectedActivity(activity)}
                className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] rounded-xl px-2 sm:px-3 transition-colors cursor-pointer"
              >
                {/* Date Pill & Weekday */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-[#2C3E50] text-white text-center rounded-xl p-2 min-w-[70px]">
                    <div className="text-[10px] text-amber-300 font-bold">
                      {departure.date.slice(5, 7)}月
                    </div>
                    <div className="text-base font-serif font-bold leading-none my-0.5">
                      {departure.date.slice(8, 10)}日
                    </div>
                    <div className="text-[10px] text-stone-300">
                      {(() => {
                        const d = new Date(departure.date);
                        return WEEKDAYS[d.getDay()];
                      })()}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#D4AF37]/30">
                        {activity.category}
                      </span>
                      <span className="text-xs text-stone-500">
                        {activity.durationDays}天{activity.durationNights}晚 · 📍 {activity.destination}
                      </span>
                    </div>

                    <h5 className="font-serif font-bold text-sm sm:text-base text-[#2C3E50] mt-1 hover:text-[#D4AF37] transition-colors">
                      {activity.title}
                    </h5>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {activity.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Side: Status, Price & CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-14 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-stone-400">¥</span>
                      <span className="text-lg font-serif font-bold text-[#2C3E50]">
                        {departure.largePrice}
                      </span>
                      <span className="text-xs text-stone-500">/人起</span>
                    </div>

                    <div className="text-[11px] font-medium">
                      {departure.remainingSlots <= 3 ? (
                        <span className="text-rose-600 font-bold">
                          仅剩 {departure.remainingSlots} 席
                        </span>
                      ) : (
                        <span className="text-emerald-700">
                          余 {departure.remainingSlots} 席 · 可预订
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBooking('activity', activity);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-100 bg-[#2C3E50] hover:bg-black transition-all shadow-xs flex items-center gap-1 border border-[#D4AF37]/30"
                  >
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>预订</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
