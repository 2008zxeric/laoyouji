// ─────────────────────────────────────────────────────────────
// 已过期活动 / 已结束赛事 判定
// 规则（与后端 enrichListStats 口径对齐）：
//   活动：后端聚合 upcomingDates = period[]/date/startDate 中 >= 今天 的日期
//         · upcomingDates 非空 → 仍有未来班期，未过期
//         · upcomingDates 空 且 从未填过出团日期（period 空 && date 空）→
//           长期滚动产品（如「宁波一日游」常态发团），不判过期
//         · upcomingDates 空 且 填过日期 → 所有班期均已过 → 过期（进往期回顾）
//   赛事：endDate < 今天 → 已结束（进往期回顾）
// ─────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function validDate(s: string): string {
  const v = String(s || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
}

export function isActivityExpired(act: {
  upcomingDates?: string[];
  date?: string;
  period?: { date?: string }[];
  departureDates?: { date: string }[];
}): boolean {
  if (!act) return false;
  if (Array.isArray(act.upcomingDates) && act.upcomingDates.length > 0) return false;
  const today = todayStr();
  const dates: string[] = [];
  if (Array.isArray(act.period)) {
    act.period.forEach((p) => {
      const v = validDate((p && p.date) || '');
      if (v) dates.push(v);
    });
  }
  if (Array.isArray(act.departureDates)) {
    act.departureDates.forEach((p) => {
      const v = validDate((p && p.date) || '');
      if (v) dates.push(v);
    });
  }
  const d = validDate(act.date || '');
  if (d) dates.push(d);
  if (!dates.length) return false;
  return dates.every((x) => x < today);
}

export function isEventEnded(evt: {
  endDate?: string;
  startDate?: string;
  date?: string;
  dates?: string[];
}): boolean {
  if (!evt) return false;
  if (Array.isArray(evt.dates) && evt.dates.length > 0) {
    const last = [...evt.dates].sort().pop() || '';
    const v = validDate(last);
    if (v) return v < todayStr();
  }
  const end = validDate(evt.endDate || evt.startDate || evt.date || '');
  if (!end) return false;
  return end < todayStr();
}
