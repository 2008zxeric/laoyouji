import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Wallet, Ban, ArrowRight, Search, ChevronRight, CalendarDays, Clock, FileText, AlertTriangle, Landmark } from 'lucide-react';
import { callGateway } from '../../api/gateway';
import { useApp } from '../../context/AppContext';

interface ROrder {
  _id: string;
  orderNo: string;
  status: string;
  refundStatus: string;
  refundReason: string;
  refundAmount: number;
  refundDiff: number;
  payAmount: number;
  totalPrice: number;
  contactName: string;
  contactPhone: string;
  activityTitle: string;
  bizType: string;
  activityDate: string;
  createdAt: string;
}

type FilterTab = 'requested' | 'fin_pending' | 'approved' | 'rejected' | 'all';

const TABS: { key: FilterTab; label: string; cls: string }[] = [
  { key: 'requested', label: '待客服初审', cls: 'bg-rose-50 text-rose-700 border-rose-300' },
  { key: 'fin_pending', label: '待财务打款', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  { key: 'approved', label: '已原路退款', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'rejected', label: '已驳回退款', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  { key: 'all', label: '全部退款单', cls: 'bg-white text-slate-600 border-slate-200' },
];

const REFUND_STAGE: Record<string, { label: string; desc: string; cls: string }> = {
  requested: { label: '待客服初审', desc: '用户/客服发起退款申请，等待客服核定应退金额', cls: 'bg-rose-50 text-rose-700 border-rose-300' },
  fin_pending: { label: '待财务打款', desc: '客服已核定退款金额，等待财务主管最终审批打款', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  approved: { label: '已原路退款', desc: '微信支付原路退款已成功到账', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '已驳回', desc: '不符合退订规则已驳回申请', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const RefundCenterPanel: React.FC = () => {
  const { orders, showToast } = useApp();
  const [list, setList] = useState<ROrder[]>([
    {
      _id: 'ref_1',
      orderNo: 'ORD882019',
      status: 'refund_requested',
      refundStatus: 'requested',
      refundReason: '家中有突发紧急事务，无法如期前往苏州出游',
      refundAmount: 3980,
      refundDiff: 0,
      payAmount: 3980,
      totalPrice: 3980,
      contactName: '李建国 (退休干部)',
      contactPhone: '13812348899',
      activityTitle: '苏州园林与吴门文脉5日名师慢游',
      bizType: 'activity',
      activityDate: '2026-09-15',
      createdAt: '2026-08-25',
    },
    {
      _id: 'ref_2',
      orderNo: 'ORD882020',
      status: 'refund_requested',
      refundStatus: 'fin_pending',
      refundReason: '膝关节不适医嘱静养',
      refundAmount: 2280,
      refundDiff: 0,
      payAmount: 2280,
      totalPrice: 2280,
      contactName: '王桂芳 (退休教师)',
      contactPhone: '13900112233',
      activityTitle: '第二届乐龄智汇杯掼蛋大师公开赛',
      bizType: 'event',
      activityDate: '2026-10-22',
      createdAt: '2026-08-24',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<FilterTab>('requested');
  const [keyword, setKeyword] = useState('');
  const [reviewing, setReviewing] = useState<ROrder | null>(null);
  const [reviewAmount, setReviewAmount] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const filtered = useMemo(() => {
    let res = tab === 'all' ? list : list.filter((o) => o.refundStatus === tab);
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      res = res.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(k) ||
          o.contactName.toLowerCase().includes(k) ||
          o.contactPhone.includes(k) ||
          o.activityTitle.toLowerCase().includes(k)
      );
    }
    return res;
  }, [list, tab, keyword]);

  const openReview = (o: ROrder) => {
    setReviewing(o);
    setReviewAmount(String(o.refundAmount || o.payAmount || 0));
    setReviewNote('');
  };

  const submitReview = () => {
    if (!reviewing) return;
    const amt = parseFloat(reviewAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('请输入有效退款金额');
      return;
    }
    setList((prev) =>
      prev.map((o) =>
        o._id === reviewing._id
          ? { ...o, refundStatus: 'fin_pending', refundAmount: amt }
          : o
      )
    );
    showToast(`已完成初审！核定退款金额 ¥${amt}，已提交财务最终打款`);
    setReviewing(null);
  };

  const finApprove = (o: ROrder) => {
    if (!window.confirm(`确定执行原路退款 ¥${o.refundAmount} 给用户 ${o.contactName} 吗？`)) return;
    setList((prev) =>
      prev.map((item) =>
        item._id === o._id ? { ...item, refundStatus: 'approved', status: 'refunded' } : item
      )
    );
    showToast(`退款成功！¥${o.refundAmount} 已原路退回用户账户`);
  };

  const rejectRefund = (o: ROrder) => {
    const reason = window.prompt('请输入驳回退款的原因：', '不符合发团前3天免费退改政策') || '';
    if (!reason.trim()) return;
    setList((prev) =>
      prev.map((item) =>
        item._id === o._id ? { ...item, refundStatus: 'rejected', status: 'paid' } : item
      )
    );
    showToast('已驳回该退款申请并通知用户');
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题与说明 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-700" />
            <span>退款中心 · 客服核定与财务专款专付</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            严格区分客服核定与财务原路打款两大环节，防止资金误退与多退
          </p>
        </div>
      </div>

      {/* 状态 Tab */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-[#1A7A6B] text-white border-[#1A7A6B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索订单号/联系人/行程..."
            className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 w-52"
          />
        </div>
      </div>

      {/* 退款列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            当前筛选条件下暂无退款申请单
          </div>
        ) : (
          filtered.map((o) => {
            const st = REFUND_STAGE[o.refundStatus] || REFUND_STAGE.requested;
            return (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 text-sm">{o.orderNo}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                      {st.label}
                    </span>
                    <span className="font-bold text-slate-900">{o.contactName} ({o.contactPhone})</span>
                  </div>
                  <div className="text-slate-600">
                    <strong>退款行程：</strong>{o.activityTitle} (出发日期：{o.activityDate})
                  </div>
                  <div className="text-rose-700 bg-rose-50/70 p-2 rounded-xl border border-rose-100 text-[11px] leading-relaxed">
                    <strong>退订诉求与原因：</strong>{o.refundReason}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">实付 ¥{o.payAmount}</div>
                    <div className="text-base font-serif font-bold text-rose-600">
                      申请退款 ¥{o.refundAmount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {o.refundStatus === 'requested' && (
                      <>
                        <button
                          onClick={() => openReview(o)}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                        >
                          客服核定金额
                        </button>
                        <button
                          onClick={() => rejectRefund(o)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                        >
                          驳回
                        </button>
                      </>
                    )}
                    {o.refundStatus === 'fin_pending' && (
                      <button
                        onClick={() => finApprove(o)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>财务确认打款</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 客服初审弹窗 */}
      {reviewing && (
        <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <h3 className="font-serif font-bold text-base text-slate-900">
              客服退款初审 · 核定退款金额
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
              <div>订单号：{reviewing.orderNo}</div>
              <div>出行人：{reviewing.contactName}</div>
              <div>订单实付：¥{reviewing.payAmount}</div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">核定退款金额 (元) *</label>
              <input
                type="number"
                value={reviewAmount}
                onChange={(e) => setReviewAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-serif font-bold text-base text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">客服审核备注</label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="按发团前4天扣除车位定金后核定退还..."
                className="w-full p-2.5 rounded-xl border border-slate-300 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewing(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submitReview}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                提交财务审核
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
