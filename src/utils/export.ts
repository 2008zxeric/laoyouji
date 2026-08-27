/* ════════════════════════════════════════════════════════════════════
 * 导出公共工具层（2026-08-27）
 *   统一 CSV/下载/日期/脱敏 工具，供订单导出、产品列表导出、
 *   出团通知等全部导出能力复用。与 web-admin 同款工具链。
 * ════════════════════════════════════════════════════════════════════ */

/** 二维数组 → CSV 文本（自动处理逗号/引号/换行） */
export function ttCsv(arr: (string | number | null | undefined)[][]): string {
  return arr
    .map((row) =>
      row
        .map((c) => {
          const s = String(c == null ? '' : c);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        })
        .join(',')
    )
    .join('\r\n');
}

/** 下载 CSV 文件（含 UTF-8 BOM，避免 Excel 中文乱码） */
export function ttDownload(
  filename: string,
  content: string,
  mime: string = 'text/csv;charset=utf-8'
) {
  const blob = new Blob(['\ufeff' + content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/** 解析 $date 包装 / 字符串 / 时间戳 → YYYY-MM-DD（解析失败回退原始串前 10 位） */
export function ttFmtDay(v: any): string {
  if (!v) return '';
  if (typeof v === 'object' && v.$date) v = v.$date;
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v).slice(0, 10);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

/** 证件号脱敏：≥10 位 → 前6 + ******** + 后4；短号 → 前3 + **** */
export function maskId(idc: any): string {
  const t = String(idc || '');
  if (t.length >= 10) return t.slice(0, 6) + '********' + t.slice(-4);
  return t ? t.slice(0, 3) + '****' : '';
}

/** 手机号脱敏：138****8000 */
export function maskPhone(p: any): string {
  const t = String(p || '').trim();
  if (t.length === 11) return t.slice(0, 3) + '****' + t.slice(7);
  return t ? t.slice(0, 3) + '****' : '';
}

/** 金额格式化：1,234.50 */
export function fmtNum(n: any): string {
  const v = Number(n || 0);
  return v.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 当前时间戳用于导出文件名：20260827_1523 */
export function stamp(): string {
  const d = new Date();
  return (
    '' +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    '_' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0')
  );
}

/** 数组 → 合并为顿号分隔（去空） */
export function joinCn(arr: any[] | undefined | null): string {
  if (!Array.isArray(arr)) return '';
  return arr.filter(Boolean).join('、');
}

/** 打开独立打印窗口渲染 HTML 内容（出团通知 Word/PDF 用）：
 *   window.print() 后用户在打印对话框选择「另存为 PDF」或导出 Word */
export function openPrintHTML(title: string, bodyHtml: string, css?: string) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    alert('浏览器拦截了打印窗口，请允许弹窗后重试');
    return;
  }
  w.document.write(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: "PingFang SC","Microsoft YaHei",sans-serif; color:#222; padding:32px; max-width:760px; margin:0 auto; }
  h1 { font-size:22px; text-align:center; color:#1A7A6B; margin:0 0 4px; }
  h2 { font-size:17px; border-left:4px solid #1A7A6B; padding-left:8px; margin:22px 0 10px; color:#134E46; }
  .sub { text-align:center; color:#888; font-size:12px; margin-bottom:18px; }
  table { width:100%; border-collapse:collapse; font-size:13px; margin:8px 0 14px; }
  th,td { border:1px solid #ccc; padding:6px 8px; text-align:left; }
  th { background:#F3F7F6; color:#134E46; }
  .foot { margin-top:28px; font-size:12px; color:#999; border-top:1px dashed #ccc; padding-top:10px; }
  @media print { body { padding:16px; } }
  ${css || ''}
</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}

export default {
  ttCsv,
  ttDownload,
  ttFmtDay,
  maskId,
  maskPhone,
  fmtNum,
  stamp,
  joinCn,
  openPrintHTML,
};
