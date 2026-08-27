import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, CheckCircle2, XCircle, Pencil, AlertTriangle, ClipboardCheck, Wallet, Receipt, Users, MapPin, CalendarDays, CreditCard, Building2, ArrowLeft, Layers, IdCard, Download, BedDouble, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TourToolsPanel } from './TourToolsPanel';
import { ttCsv, ttDownload, ttFmtDay, maskId, maskPhone, fmtNum, stamp } from '../../utils/export';
import { Order } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  pending_pay: '待支付',
  paid: '已支付',
  confirmed: '已确认出团',
  completed: '已完成',
  cancelled: '已取消',
  refund_requested: '申请退款中',
  refunded: '已退款',
};

const STATUS_CLASS: Record<string, string> = {
  pending_pay: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
  refund_requested: 'bg-rose-50 text-rose-700 border-rose-300',
  refunded: 'bg-slate-100 text-slate-400 border-slate-200',
};

export const OrderOpsPanel: React.FC = () => {
  const { orders, activities, events, showToast, payOrder, cancelOrder, requestRefund } = useApp();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTour, setSelectedTour] = useState<{ id: string; title: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 按出团班期/产品聚合
  const tourGroups = useMemo(() => {
    const map = new Map<string, { title: string; targetId: string; date: string; orders: Order[]; totalAmount: number; travelersCount: number }>();

    orders.forEach((o) => {
      const key = `${o.targetId}_${o.departureDate || '待定'}`;
      if (!map.has(key)) {
        map.set(key, {
          title: o.targetTitle,
          targetId: o.targetId,
          date: o.departureDate || '2026-09-15',
          orders: [],
          totalAmount: 0,
          travelersCount: 0,
        });
      }
      const g = map.get(key)!;
      g.orders.push(o);
      g.totalAmount += o.payAmount || o.totalPrice || 0;
      g.travelersCount += o.travelers?.length || 1;
    });

    return Array.from(map.values());
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        return (
          o.orderNo.toLowerCase().includes(k) ||
          o.targetTitle.toLowerCase().includes(k) ||
          (o.travelers || []).some((t) => t.name.toLowerCase().includes(k) || t.phone.includes(k))
        );
      }
      return true;
    });
  }, [orders, statusFilter, keyword]);

  const exportAllOrders = () => {
    if (!filteredOrders.length) {
      showToast('无订单可导出');
      return;
    }
    const head = ['订单号', '产品名称', '出行人姓名', '出行人电话', '身份证号', '出发日期', '团型', '实付金额', '积分抵扣', '状态', '下单时间'];
    const rows = filteredOrders.map((o) => [
      o.orderNo,
      o.targetTitle,
      o.travelers?.[0]?.name || '—',
      o.travelers?.[0]?.phone || '—',
      maskId(o.travelers?.[0]?.idCard || ''),
      o.departureDate || '',
      o.groupType === 'small' ? '精品小团' : '经典大团',
      fmtNum(o.payAmount || o.totalPrice || 0),
      o.pointsDeductedAmount || 0,
      STATUS_LABEL[o.status] || o.status,
      o.createdAt ? String(o.createdAt).slice(0, 19).replace('T', ' ') : '',
    ]);
    ttDownload(`全量订单台账_${stamp()}.csv`, ttCsv([head, ...rows]));
    showToast(`已成功导出 ${filteredOrders.length} 笔订单！`);
  };

  return (
    <div className="space-y-5">
      {/* 顶部标题与导出 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-700" />
            <span>订单运营与班期出团工作台</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            以「出团班期」为核心调度，支持长者投保名单、分房接驳表、出团通知书一体化生成
          </p>
        </div>
        <button
          onClick={exportAllOrders}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>导出订单台账 (CSV)</span>
        </button>
      </div>

      {/* 第一层：按出团班期概览卡片 */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-700" />
          <span>近期发团班期概览 ({tourGroups.length} 个班次成团中)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tourGroups.map((g, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    📅 {g.date} 发班
                  </span>
                  <span className="text-[11px] text-slate-500">成团 {g.orders.length} 单</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 line-clamp-1">{g.title}</h3>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                  <span>出行老友：<strong className="text-slate-900">{g.travelersCount} 人</strong></span>
                  <span>实收流水：<strong className="text-emerald-700">¥{g.totalAmount.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedTour({ id: g.targetId, title: g.title })}
                  className="w-full py-2 bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>出团工具箱 (通知/分房/投保)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 第二层：全量订单明细列表 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">全部订单明细台账</span>
            <div className="flex gap-1">
              {[
                { id: 'all', label: '全部' },
                { id: 'paid', label: '已支付' },
                { id: 'confirmed', label: '已确认' },
                { id: 'completed', label: '已完成' },
                { id: 'refund_requested', label: '退款待处理' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#1A7A6B] text-white border-[#1A7A6B]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索订单号/姓名/手机..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white w-48"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredOrders.map((o) => {
            const tr = o.travelers?.[0] || { name: '赵元博 教授', phone: '13801236688', idCard: '330203195508151234' };
            return (
              <div
                key={o.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-900">{o.orderNo}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_CLASS[o.status] || STATUS_CLASS.paid}`}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                    <span className="font-bold text-slate-900">{tr.name} ({tr.phone})</span>
                  </div>
                  <div className="text-slate-600 truncate">
                    <strong>{o.targetTitle}</strong> · 发团：{o.departureDate || '2026-09-15'} · {o.groupType === 'small' ? '3-5人精品小团' : '经典大团'}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    出行人：{o.travelers?.map((t) => t.name).join('、') || tr.name} · 证件：{maskId(tr.idCard)}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-serif font-bold text-slate-900">¥{o.payAmount || o.totalPrice}</div>
                    {o.pointsDeductedAmount ? (
                      <div className="text-[10px] text-amber-700">积分抵扣 -¥{o.pointsDeductedAmount}</div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 订单详情抽屉 */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">订单详细档案</h3>
                <div className="font-mono text-slate-400 text-[11px] mt-0.5">{selectedOrder.orderNo}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-slate-500 font-bold">预订项目：</div>
                <div className="font-bold text-slate-900 text-sm">{selectedOrder.targetTitle}</div>
                <div className="text-slate-600 text-[11px]">发团日期：{selectedOrder.departureDate || '2026-09-15'}</div>
              </div>

              <div className="border border-slate-200 p-3.5 rounded-2xl space-y-2">
                <div className="font-bold text-slate-800">出行长者档案与特殊需求：</div>
                {(selectedOrder.travelers || []).map((t, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">{t.name} ({t.phone})</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">身份证：{t.idCard}</div>
                    {t.emergencyName && <div className="text-slate-500 text-[11px]">紧急联系人：{t.emergencyName} ({t.emergencyPhone})</div>}
                    {t.dietaryRequirement && <div className="text-emerald-700 text-[11px]">特殊需求：{t.dietaryRequirement}</div>}
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                <span>实收结算总额：</span>
                <span className="font-serif font-bold text-base text-emerald-800">¥{selectedOrder.payAmount || selectedOrder.totalPrice}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 出团工具箱弹窗 */}
      {selectedTour && (
        <TourToolsPanel
          targetId={selectedTour.id}
          title={selectedTour.title}
          onClose={() => setSelectedTour(null)}
        />
      )}
    </div>
  );
};
