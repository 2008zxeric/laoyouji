import React, { useCallback, useEffect, useState } from 'react';
import { fetchTgoApplications, reviewTgoApplication, TgoApplication } from '../../api/gateway';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Phone, Inbox, UserCheck, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: '已通过', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: '已驳回', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};
const TABS = [
  ['pending', '待审核'],
  ['approved', '已通过'],
  ['rejected', '已驳回'],
  ['all', '全部申请'],
] as const;

export const TgoApplicationReviewPanel: React.FC = () => {
  const { showToast } = useApp();
  const [tab, setTab] = useState<string>('pending');
  const [list, setList] = useState<TgoApplication[]>([
    {
      _id: 'tgo_app_1',
      name: '顾文远 (退休副教授)',
      phone: '13901112233',
      age: '62岁',
      gender: '男',
      specialty: ['江南园林文脉精讲', '书法雅集指导'],
      certs: ['导游证', '国家级红十字急救员'],
      time: ['每周二、四', '周末可出团'],
      remark: '原上海师大文学院副教授，退休后常年组织老同事文化漫游，热心长者公益。',
      status: 'pending',
      createdAt: '2026-08-25',
    },
  ]);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);

  const doReview = async (app: TgoApplication, review: 'approve' | 'reject') => {
    const note = review === 'reject' ? window.prompt('请输入驳回原因（可选）', '') ?? '' : '';
    setList((prev) =>
      prev.map((item) =>
        item._id === app._id
          ? { ...item, status: review === 'approve' ? 'approved' : 'rejected' }
          : item
      )
    );
    showToast(review === 'approve' ? `已通过 ${app.name} 的加盟申请！请电话联系` : '已驳回申请');
  };

  const filtered = tab === 'all' ? list : list.filter((a) => a.status === tab);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4 animate-fadeIn">
      {/* 头部 */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>TGO 旅伴招募与加盟申请审核</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            前台「申请加入 TGO」提交的意向长者与领队名单，审核通过后可直接录入 TGO 认证档案
          </p>
        </div>
      </div>

      {/* 状态 tab */}
      <div className="flex gap-2 flex-wrap text-xs">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3.5 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
              tab === k
                ? 'bg-[#1A7A6B] text-white border-[#1A7A6B] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          当前状态下暂无申请记录
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const st = STATUS_META[app.status] || STATUS_META.pending;
            return (
              <div
                key={app._id}
                className="border border-slate-200 rounded-2xl p-4 hover:border-emerald-400 transition-colors bg-[#FAF9F6] text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{app.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>
                      {st.label}
                    </span>
                    <span className="text-slate-500">年龄：{app.age} · 性别：{app.gender}</span>
                  </div>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {app.phone}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(app.specialty || []).map((s) => (
                    <span key={s} className="text-[10px] bg-[#D4AF37]/15 text-[#85660d] font-bold px-2 py-0.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                  {(app.certs || []).map((c) => (
                    <span key={c} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      ✓ {c}
                    </span>
                  ))}
                </div>

                {app.remark && (
                  <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                    💬 {app.remark}
                  </p>
                )}

                {app.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => doReview(app, 'reject')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      驳回
                    </button>
                    <button
                      onClick={() => doReview(app, 'approve')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>审核通过 · 电话邀约</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
