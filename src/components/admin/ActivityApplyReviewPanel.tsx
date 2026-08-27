import React, { useState, useCallback, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, Search, RefreshCw, Eye, Building2, MapPin, Calendar, Clock, Phone } from 'lucide-react';
import { fetchActivityApplications, reviewActivityApplication, ActivityApplication } from '../../api/gateway';
import { useApp } from '../../context/AppContext';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '已通过', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '已驳回', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
  published: { label: '已转正式活动', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export const ActivityApplyReviewPanel: React.FC = () => {
  const { showToast } = useApp();
  const [list, setList] = useState<ActivityApplication[]>([
    {
      _id: 'app_1',
      title: '宁波天一阁古籍修复一日研学体验',
      organizer: '宁波古籍保护促进会',
      description: '由资深古籍修复师带领退休学者，体验宣纸手工装裱与宋版书修缮技艺。',
      date: '2026-09-18',
      time: '09:00 - 16:30',
      location: '宁波市海曙区天一街10号',
      duration: '全天（6-8小时）',
      price: 268,
      scale: '精品小团（10-15人）',
      contactName: '陈秘书长',
      contactPhone: '13812345678',
      status: 'pending',
      createdAt: '2026-08-25',
    },
  ]);
  const [total, setTotal] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchActivityApplications(filterStatus, 1, 100);
      if (r && r.list && r.list.length) {
        setList(r.list);
        setTotal(r.total || r.list.length);
      }
    } catch (e) {
      // Keep local sample
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const doReview = async (app: ActivityApplication, status: 'approved' | 'rejected') => {
    const reason =
      status === 'rejected'
        ? (window.prompt('请填写驳回原因（申请人可见）：', '资料不完整或不符合乐龄安全标准') || '')
        : '';
    if (status === 'rejected' && !reason.trim()) {
      alert('驳回需填写原因');
      return;
    }
    if (!window.confirm(`确定${status === 'approved' ? '通过' : '驳回'}申请「${app.title}」吗？`)) return;
    try {
      await reviewActivityApplication(app._id, status, reason.trim());
      setList((prev) =>
        prev.map((item) => (item._id === app._id ? { ...item, status } : item))
      );
      showToast(status === 'approved' ? '已审核通过！请在活动管理中转为正式活动' : '已驳回该申请');
    } catch (e: any) {
      alert('操作失败：' + (e?.message || '网关错误'));
    }
  };

  const filtered = searchTerm.trim()
    ? list.filter((a) =>
        [a.title, a.organizer, a.contactName, a.location]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : list;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>活动发布申请审核</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            前台「我要发布活动」提交的合作申请（共 {total} 条）。通过后可在「慢游活动管理」中补全行程并一键发布上线。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索标题/机构/联系人..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
          <button
            onClick={load}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400 text-sm">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          暂无{filterStatus !== 'all' ? '该状态下的' : ''}活动发布申请
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((a) => {
          const meta = STATUS_META[a.status] || STATUS_META.pending;
          const expanded = expandedId === a._id;
          return (
            <div
              key={a._id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                a.status === 'pending' ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{a.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${meta.cls}`}>
                      {meta.label}
                    </span>
                    {a.status === 'pending' && (
                      <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                        需 2 个工作日内完成审核
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {a.organizer}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {a.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {a.date} {a.time}</span>
                    <span className="font-bold text-emerald-800">¥{a.price} /人</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expanded ? null : a._id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    {expanded ? '收起详情' : '查看完整内容'}
                  </button>
                  {a.status === 'pending' && (
                    <>
                      <button
                        onClick={() => doReview(a, 'approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> 通过
                      </button>
                      <button
                        onClick={() => doReview(a, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer"
                      >
                        驳回
                      </button>
                    </>
                  )}
                </div>
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600 bg-slate-50/70 p-3.5 rounded-xl">
                  <div><strong className="text-slate-800">活动描述：</strong>{a.description}</div>
                  {a.priceDescription && <div><strong className="text-slate-800">费用说明：</strong>{a.priceDescription}</div>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                    <div><strong>联系人：</strong>{a.contactName}</div>
                    <div><strong>联系电话：</strong>{a.contactPhone}</div>
                    {a.contactWechat && <div><strong>微信号：</strong>{a.contactWechat}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
