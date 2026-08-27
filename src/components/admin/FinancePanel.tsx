import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Wallet, Receipt, CheckCircle2, FileText, CircleDollarSign, AlertTriangle, RefreshCw, XCircle, Banknote, Download } from 'lucide-react';
import { callGateway } from '../../api/gateway';
import { useApp } from '../../context/AppContext';
import { ttCsv, ttDownload, ttFmtDay, fmtNum, stamp } from '../../utils/export';

interface SettleRow {
  productName: string;
  orderCount: number;
  headCount: number;
  amount: number;
}

interface Settlement {
  _id?: string;
  settleId?: string;
  supplierId: string;
  supplierName: string;
  periodStart?: string;
  periodEnd?: string;
  orderCount: number;
  headCount?: number;
  totalAmount?: number;
  status: string; // requested | biz_passed | fin_passed | paid | rejected
  invoiceNo?: string;
  paidAt?: string;
  createdAt?: string;
}

const ST_MAP: Record<string, string> = {
  requested: '待业务审核',
  biz_passed: '待财务审核',
  fin_passed: '待付款执行',
  paid: '已付款',
  rejected: '已驳回',
};

const ST_CLASS: Record<string, string> = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  biz_passed: 'bg-amber-100 text-amber-800 border-amber-300',
  fin_passed: 'bg-sky-50 text-sky-700 border-sky-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-600 border-rose-200',
};

export const FinancePanel: React.FC = () => {
  const { showToast } = useApp();
  const [list, setList] = useState<Settlement[]>([
    {
      _id: 'set_1',
      settleId: 'SET2026082501',
      supplierId: 'sup_1',
      supplierName: '苏州太湖国宾馆度假酒店',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-25',
      orderCount: 18,
      headCount: 36,
      totalAmount: 34560,
      status: 'fin_passed',
      createdAt: '2026-08-25',
    },
    {
      _id: 'set_2',
      settleId: 'SET2026082001',
      supplierId: 'sup_2',
      supplierName: '金龙安捷乐龄旅游车队',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-20',
      orderCount: 12,
      headCount: 120,
      totalAmount: 28000,
      status: 'paid',
      paidAt: '2026-08-22',
      createdAt: '2026-08-20',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const exportSettlements = () => {
    if (!list.length) {
      showToast('当前无结算单可导出');
      return;
    }
    const head = ['结算单号', '供应商', '周期开始', '周期结束', '订单数', '人数', '金额(元)', '状态', '发票号', '付款时间', '创建时间'];
    const rows = list.map((s) => [
      s.settleId || s._id || '',
      s.supplierName || '',
      s.periodStart || '',
      s.periodEnd || '',
      s.orderCount ?? 0,
      s.headCount ?? '',
      fmtNum(s.totalAmount ?? 0),
      ST_MAP[s.status] || s.status,
      s.invoiceNo || '',
      ttFmtDay(s.paidAt),
      ttFmtDay(s.createdAt),
    ]);
    ttDownload(`结算清单_${statusFilter || '全部'}_${stamp()}.csv`, ttCsv([head, ...rows]));
    showToast(`已导出 ${list.length} 张结算单`);
  };

  const auditSettle = (id: string, nextStatus: string) => {
    setList((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: nextStatus, paidAt: nextStatus === 'paid' ? new Date().toISOString() : s.paidAt } : s))
    );
    showToast(`结算单状态已更新为：${ST_MAP[nextStatus] || nextStatus}`);
  };

  const summary = useMemo(() => {
    const payable = list.filter((s) => s.status === 'fin_passed').reduce((a, s) => a + (Number(s.totalAmount) || 0), 0);
    const paid = list.filter((s) => s.status === 'paid').reduce((a, s) => a + (Number(s.totalAmount) || 0), 0);
    const reviewing = list.filter((s) => ['requested', 'biz_passed'].includes(s.status)).length;
    return { payable, paid, reviewing };
  }, [list]);

  const filtered = statusFilter ? list.filter((s) => s.status === statusFilter) : list;

  return (
    <div className="space-y-4">
      {/* 顶部标题与导出 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-700" />
            <span>财务结算与付款三级审批中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            业务初审 → 财务复核 → 出纳付款执行，严格遵守 OTA 财务合规结算与对账标准
          </p>
        </div>
        <button
          onClick={exportSettlements}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>导出结算账单 (CSV)</span>
        </button>
      </div>

      {/* 财务统计概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-bold">待付款执行金额</div>
          <div className="text-xl font-serif font-bold text-sky-700 mt-1">¥{summary.payable.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-bold">已累计付款结算</div>
          <div className="text-xl font-serif font-bold text-emerald-700 mt-1">¥{summary.paid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-bold">待审核流程单数</div>
          <div className="text-xl font-serif font-bold text-amber-700 mt-1">{summary.reviewing} 笔</div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="flex gap-2 flex-wrap text-xs">
        {[
          { key: '', label: '全部状态' },
          { key: 'requested', label: '待业务审核' },
          { key: 'biz_passed', label: '待财务审核' },
          { key: 'fin_passed', label: '待出纳打款' },
          { key: 'paid', label: '已完成付款' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#1A7A6B] text-white border-[#1A7A6B]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 结算单列表 */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-slate-900 text-sm">{s.settleId}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${ST_CLASS[s.status] || ST_CLASS.requested}`}>
                  {ST_MAP[s.status] || s.status}
                </span>
                <span className="font-bold text-slate-800">{s.supplierName}</span>
              </div>
              <div className="text-slate-500 text-[11px] flex items-center gap-3">
                <span>结算周期：{s.periodStart} ~ {s.periodEnd}</span>
                <span>包含订单：{s.orderCount} 笔 ({s.headCount} 人次)</span>
                <span>申请时间：{s.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400">应结总额</div>
                <div className="text-base font-serif font-bold text-emerald-800">¥{(s.totalAmount || 0).toLocaleString()}</div>
              </div>

              {s.status === 'requested' && (
                <button
                  onClick={() => auditSettle(s._id!, 'biz_passed')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  业务初审通过
                </button>
              )}
              {s.status === 'biz_passed' && (
                <button
                  onClick={() => auditSettle(s._id!, 'fin_passed')}
                  className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  财务复核通过
                </button>
              )}
              {s.status === 'fin_passed' && (
                <button
                  onClick={() => auditSettle(s._id!, 'paid')}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 确认已打款
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
