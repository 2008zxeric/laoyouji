/**
 * iCalendar (RFC 5545) System Calendar Generator & Exporter
 * Supports single event and batch multiple trips sync to Apple Calendar, Android/Huawei/Xiaomi/OPPO/vivo Calendar, and Google Calendar.
 */

export interface CalendarEventData {
  id: string;
  title: string;
  startDate: string; // 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm'
  endDate: string; // 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm'
  startTime?: string; // e.g. '08:30'
  endTime?: string; // e.g. '17:30'
  location: string;
  description: string;
  url?: string;
  organizer?: string;
}

/**
 * Clean & escape text for iCalendar standard
 */
function escapeIcsText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Format Date into ICS timestamp: YYYYMMDDTHHMMSS or YYYYMMDD
 */
function formatIcsDateTime(dateStr: string, timeStr = '08:30'): string {
  try {
    const cleanDate = dateStr.split(' ')[0].replace(/-/g, '');
    const cleanTime = (timeStr || '08:30').replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime.padEnd(6, '0')}`;
  } catch {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

/**
 * Generate standard .ics string for a single or multiple events
 */
export function buildIcsContent(events: CalendarEventData[], calendarName = '老友记·乐龄出行日程'): string {
  const nowFormatted = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const eventsBlock = events
    .map((evt) => {
      const dtStart = formatIcsDateTime(evt.startDate, evt.startTime || '08:30');
      const dtEnd = formatIcsDateTime(evt.endDate || evt.startDate, evt.endTime || '18:00');
      const uid = `laoyouji-${evt.id}-${Date.now()}@laoyouji.travel`;

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowFormatted}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeIcsText(evt.title)}`,
        `DESCRIPTION:${escapeIcsText(evt.description)}`,
        `LOCATION:${escapeIcsText(evt.location)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:【老友记行前提醒】${escapeIcsText(evt.title)} 明天启程，请备好慢病常用药与有效身份证件！`,
        'TRIGGER:-P1D',
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:【老友记集合提醒】距集合出发还有2小时，TGO伴游管家已在集合点恭候！`,
        'TRIGGER:-PT2H',
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Laoyouji Travel//Senior Itinerary Calendar//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Shanghai',
    eventsBlock,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers native mobile download or direct open for .ics file
 */
export function downloadIcsFile(filename: string, content: string): boolean {
  try {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('Failed to export calendar file:', err);
    return false;
  }
}

/**
 * Mobile-friendly smart export (uses Web Share File if supported, otherwise direct download)
 */
export async function shareOrDownloadIcs(
  filename: string,
  content: string,
  title: string
): Promise<boolean> {
  const safeFilename = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });

  // If Web Share API supports file sharing on iOS / Android
  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], safeFilename, { type: 'text/calendar' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `老友记行程日历 · ${title}`,
          text: `这是为您安排的【${title}】行程日程，已设置行前提前1天及出发前2小时闹钟提醒。`,
        });
        return true;
      }
    } catch (shareErr) {
      console.log('Web share canceled or unsupported, falling back to download:', shareErr);
    }
  }

  return downloadIcsFile(safeFilename, content);
}
