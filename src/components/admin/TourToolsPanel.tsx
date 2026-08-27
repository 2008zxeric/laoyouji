import React, { useEffect, useState } from 'react';
import { fetchTourTarget, fetchPaidOrdersByTarget, runAutoRoom, TourOrder } from '../../api/gateway';
import { ttCsv, ttDownload, ttFmtDay, maskId, maskPhone, openPrintHTML } from '../../utils/export';
import { X, Download, ShieldCheck, Home, ClipboardList, Stethoscope, Copy, RefreshCw, AlertTriangle, Loader2, FileText, BedDouble, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  targetId: string;
  title: string;
  kind?: 'activity' | 'event';
  onClose: () => void;
}

export const TourToolsPanel: React.FC<Props> = ({ targetId, title, kind = 'activity', onClose }) => {
  const { activities, events, orders: allOrders } = useApp();
  const [act, setAct] = useState<any>(null);
  const [orders, setOrders] = useState<TourOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    // Look up in local app state or gateway
    const foundAct = activities.find((a) => a.id === targetId || (a as any)._id === targetId);
    const foundEvt = events.find((e) => e.id === targetId || (e as any)._id === targetId);
    const targetData = foundAct || foundEvt || { title, destination: '苏州·太湖', date: '2026-09-15' };
    setAct(targetData);

    const relatedOrders = allOrders
      .filter((o) => o.status === 'paid' || o.status === 'confirmed' || o.status === 'completed')
      .map((o) => ({
        _id: o.id,
        orderNo: o.orderNo,
        contactName: o.travelers?.[0]?.name || '老友',
        contactPhone: o.travelers?.[0]?.phone || '13800000000',
        idCard: o.travelers?.[0]?.idCard || '330203195608151234',
        emergencyName: o.travelers?.[0]?.emergencyName || '家属',
        emergencyPhone: o.travelers?.[0]?.emergencyPhone || '13900000000',
        roomPref: '双人标间',
        specialNeed: o.specialNeeds || o.travelers?.[0]?.dietaryRequirement || '低盐少油，需备温开水',
        activityTitle: targetData.title,
        activityDate: targetData.date || '2026-09-15',
        count: o.travelers?.length || 1,
        travelers: o.travelers || [],
      }));

    setOrders(relatedOrders.length > 0 ? relatedOrders : [
      {
        _id: 'ord_demo_1',
        orderNo: 'ORD88201',
        contactName: '赵元博 教授',
        contactPhone: '13801236688',
        idCard: '330203195508151234',
        emergencyName: '赵明 (长子)',
        emergencyPhone: '13901112222',
        roomPref: '双床房 (与陈教授同住)',
        specialNeed: '轻度高血压，自备降压药，需温开水',
        activityTitle: targetData.title,
        activityDate: targetData.date || '2026-09-15',
        count: 2,
        travelers: [{ name: '赵元博', phone: '13801236688', idCard: '330203195508151234' }],
      },
      {
        _id: 'ord_demo_2',
        orderNo: 'ORD88202',
        contactName: '钱惠芳 老师',
        contactPhone: '13700119988',
        idCard: '330204195810204321',
        emergencyName: '孙建 (女儿)',
        emergencyPhone: '13899887766',
        roomPref: '大床房 (单房差已免)',
        specialNeed: '低糖少盐饮食，行动无障碍',
        activityTitle: targetData.title,
        activityDate: targetData.date || '2026-09-15',
        count: 1,
        travelers: [{ name: '钱惠芳', phone: '13700119988', idCard: '330204195810204321' }],
      },
    ]);
  }, [targetId, title, activities, events, allOrders]);

  const exportInsurance = (masked: boolean) => {
    if (!orders.length) return;
    if (!masked && !window.confirm('⚠️ 投保名单含身份证号。请确认仅用于保险报备！')) return;
    const rows: (string | number)[][] = [['序号', '姓名', '身份证号', '手机号', '紧急联系人', '紧急电话', '报名活动', '出行日期', '投保份数']];
    orders.forEach((o, i) => {
      rows.push([
        i + 1,
        o.contactName || '',
        masked ? maskId(o.idCard) : (o.idCard || ''),
        o.contactPhone || o.phone || '',
        o.emergencyName || '',
        o.emergencyPhone || '',
        o.activityTitle || '',
        ttFmtDay(o.activityDate || o.createdAt),
        Math.max(1, Number(o.count) || 1),
      ]);
    });
    ttDownload((masked ? '投保名单(脱敏)_' : '投保名单_') + (act?.title || title) + '.csv', ttCsv(rows));
  };

  const exportRoomBase = () => {
    if (!orders.length) return;
    const rows: (string | number)[][] = [['序号', '联系人', '身份证号', '手机号', '人数', '活动名称', '出行日期', '房型需求', '特殊备注']];
    orders.forEach((o, i) => {
      rows.push([
        i + 1,
        o.contactName || '',
        maskId(o.idCard),
        o.contactPhone || o.phone || '',
        Math.max(1, Number(o.count) || 1),
        o.activityTitle || '',
        ttFmtDay(o.activityDate || o.createdAt),
        o.roomPref || '双床房',
        o.specialNeed || o.roomNote || o.note || '',
      ]);
    });
    ttDownload('分房与接驳表_' + (act?.title || title) + '.csv', ttCsv(rows));
  };

  const exportTripNotice = () => {
    const name = act?.title || title;
    const body = `
      <h1>出团通知书</h1>
      <div class="sub">老友记文旅社区 · 雅趣同行 · 随团医护保障</div>
      <h2>一、团组与集合信息</h2>
      <table>
        <tr><th>行程名称</th><td colspan="3"><b>${name}</b></td></tr>
        <tr><th>出团日期</th><td>${act?.date || '2026-09-15'}</td><th>出行人数</th><td>${orders.reduce((s, o) => s + (o.count || 1), 0)} 位老友</td></tr>
        <tr><th>集合地点</th><td>${act?.destination || '上海人民广场 / 专车接送'}</td><th>服务管家</th><td>TGO 金钥匙团队</td></tr>
      </table>
      <h2>二、出游长者名单及健康备注</h2>
      <table>
        <tr><th>序号</th><th>姓名</th><th>联系电话</th><th>证件号 (脱敏)</th><th>特殊照护需求</th></tr>
        ${orders
          .map(
            (o, i) =>
              `<tr><td>${i + 1}</td><td><b>${o.contactName}</b></td><td>${maskPhone(o.contactPhone)}</td><td>${maskId(o.idCard)}</td><td>${o.specialNeed}</td></tr>`
          )
          .join('')}
      </table>
      <h2>三、乐龄出行温馨提示</h2>
      <table>
        <tr><td>1. 全程配有红十字资质急救员与便携 AED 医疗包；<br/>2. 请随身携带本人二代身份证原件及个人常用降压/降糖药物；<br/>3. 每日平缓慢步控制在4000步以内，如感疲累随时向随团管家示意。</td></tr>
      </table>
      <div class="foot">浙江四季游文旅集团 · 客服热线：18100129722 · 出团通知生成时间：${new Date().toLocaleString('zh-CN')}</div>
    `;
    openPrintHTML(`出团通知_${name}`, body);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#F8F4EE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                出团运营工具箱 · {act?.title || title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                已成团 {orders.length} 笔订单 ({orders.reduce((s, o) => s + (o.count || 1), 0)} 位出行老友)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* 工具卡片 1：出团通知书 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>生成品牌化《出团通知书》(Word / PDF 打印)</span>
              </h4>
              <p className="text-slate-500 mt-1">包含集合时间地点、行程安排、出行人名单及适老用药注意事项，一键调起浏览器打印或另存为 PDF/Word</p>
            </div>
            <button
              onClick={exportTripNotice}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer shrink-0"
            >
              打印/导出通知
            </button>
          </div>

          {/* 工具卡片 2：投保名单 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>保险公司批量投保名单 (CSV)</span>
              </h4>
              <p className="text-slate-500 mt-1">导出符合保险公司格式要求的长者投保名单（含身份证、手机、紧急联系人）</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => exportInsurance(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                脱敏版导出
              </button>
              <button
                onClick={() => exportInsurance(false)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-bold shadow-xs cursor-pointer"
              >
                完整版导出
              </button>
            </div>
          </div>

          {/* 工具卡片 3：分房与健康备注 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-emerald-700" />
                <span>酒店分房表与随团健康急救底册 (CSV)</span>
              </h4>
              <p className="text-slate-500 mt-1">按同住需求、单房差减免及饮食忌口自动汇总，直接对接酒店前台与领队医护</p>
            </div>
            <button
              onClick={exportRoomBase}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer shrink-0"
            >
              导出分房表
            </button>
          </div>

          {/* 实时成团名单速览 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-700">成团老友名单速览：</div>
            <div className="space-y-1.5">
              {orders.map((o, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{o.contactName}</span>
                    <span className="text-slate-500 ml-2">{maskPhone(o.contactPhone)}</span>
                    <span className="text-emerald-700 ml-3">{o.roomPref}</span>
                  </div>
                  <span className="text-slate-400">{o.specialNeed}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
