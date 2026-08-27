import React, { useState } from 'react';
import { calcComboProfit } from '../../api/gateway';
import { X, Calculator, Plus, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CostRow {
  name: string;
  supplierName: string;
  unitCost: string;
  qty: number;
}

interface Props {
  onClose: () => void;
  preset?: {
    costBreakdown?: { name?: string; supplierName?: string; unitCost?: number; qty?: number }[];
    costPerHead?: number;
    sellPrice?: number;
  };
}

const emptyRow = (): CostRow => ({ name: '', supplierName: '', unitCost: '', qty: 1 });

export const ComboProfitModal: React.FC<Props> = ({ onClose, preset }) => {
  const [rows, setRows] = useState<CostRow[]>(() => {
    const p = preset?.costBreakdown;
    if (p && p.length) {
      return p.map((r) => ({
        name: r.name || '',
        supplierName: r.supplierName || '',
        unitCost: r.unitCost != null ? String(r.unitCost) : '',
        qty: r.qty || 1,
      }));
    }
    return [
      { name: '五星级园林酒店双人房(2晚)', supplierName: '苏州太湖国宾馆', unitCost: '480', qty: 1 },
      { name: '拙政园/耦园专场学术导赏门票', supplierName: '苏州文博集团', unitCost: '220', qty: 1 },
      { name: '2+1航空座椅无障碍大巴(5天)', supplierName: '金龙安捷车队', unitCost: '350', qty: 1 },
      { name: '复旦大学名家学者讲学及陪同费', supplierName: '中华古籍保护研究院', unitCost: '600', qty: 1 },
      { name: '随团红十字急救医护及保额100万意外险', supplierName: '太平洋乐龄险专线', unitCost: '95', qty: 1 },
    ];
  });
  const [sellPrice, setSellPrice] = useState(preset?.sellPrice != null ? String(preset.sellPrice) : '3980');
  const [sellCount, setSellCount] = useState(20);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateRow = (i: number, patch: Partial<CostRow>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const calc = async () => {
    setError('');
    const items = rows
      .map((r) => ({
        name: r.name,
        supplierName: r.supplierName,
        unitCost: Number(r.unitCost) || 0,
        qty: Math.max(1, Number(r.qty) || 1),
      }))
      .filter((r) => r.name || r.unitCost > 0);
    if (!items.length) {
      setError('请至少添加一个成本项目');
      return;
    }
    const sp = Number(sellPrice) || 0;
    if (sp <= 0) {
      setError('请填写产品售价（元/人）');
      return;
    }
    setLoading(true);
    try {
      const r = await calcComboProfit(items, sp, Math.max(1, Number(sellCount) || 1));
      setResult(r);
    } catch (e: any) {
      setError(e?.message || '测算失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8F4EE] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-serif text-slate-900">
                OTA 级组合成本与毛利测算引擎
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                将酒店、车辆、名师讲座、门票、保险打包组合，智能核算保本人数与毛利率
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* 成本行 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>采购成本组成项：</span>
              <span className="text-slate-400 font-normal">单人均摊成本计算</span>
            </div>
            <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-500 font-semibold px-1">
              <span className="col-span-4">服务项名称</span>
              <span className="col-span-4">供应商/协议单位</span>
              <span className="col-span-2">单价(元)</span>
              <span className="col-span-1 text-center">数量</span>
              <span className="col-span-1" />
            </div>

            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  value={r.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                  placeholder="如：酒店住宿"
                  className="col-span-4 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <input
                  value={r.supplierName}
                  onChange={(e) => updateRow(i, { supplierName: e.target.value })}
                  placeholder="供应商名称"
                  className="col-span-4 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={r.unitCost}
                  onChange={(e) => updateRow(i, { unitCost: e.target.value })}
                  placeholder="0.00"
                  className="col-span-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={r.qty}
                  onChange={(e) =>
                    updateRow(i, { qty: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="col-span-1 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 text-center focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) =>
                      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [emptyRow()]
                    )
                  }
                  className="col-span-1 p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer flex justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> 追加采购成本项
            </button>
          </div>

          {/* 售价与预估成团人数 */}
          <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EAE6DF]">
            <label className="space-y-1">
              <span className="font-bold text-slate-700">产品对外售价（元/人）：</span>
              <input
                type="number"
                min={0}
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900"
              />
            </label>
            <label className="space-y-1">
              <span className="font-bold text-slate-700">预估成团人数（人）：</span>
              <input
                type="number"
                min={1}
                value={sellCount}
                onChange={(e) => setSellCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900"
              />
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* 测算结果 */}
          {result && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <div className="font-serif font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>组合收益测算结论</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">单人采购总成本</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    ¥{result.totalUnitCost.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">成团预计毛利</div>
                  <div className={`text-sm font-bold mt-0.5 ${result.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ¥{result.grossProfit.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">预估综合毛利率</div>
                  <div className="text-sm font-bold text-[#85660d] mt-0.5">
                    {result.grossMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                📌 保本成团门槛：<strong>至少需要 {result.breakEvenCount} 人报名</strong>即可覆盖整体采购成本；
                当前按 {sellCount} 人核算，{result.isProfitable ? '盈利空间健康，符合乐龄产品30%毛利底线标准。' : '当前处于亏损风险，建议提升单价或与供应商核定团量折扣。'}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={calc}
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? '正在测算...' : '开始利润测算'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
