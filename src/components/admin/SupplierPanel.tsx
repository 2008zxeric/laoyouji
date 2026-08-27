import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Building2, ShieldCheck, ShieldOff, Ban, RefreshCw, CalendarRange, Boxes, CircleDollarSign, Edit2, Trash2 } from 'lucide-react';
import { callGateway } from '../../api/gateway';
import { useApp } from '../../context/AppContext';

export interface SupplierProduct {
  name: string;
  price: number;
  unit: string;
  validFrom?: string;
  validUntil?: string;
}

export interface SettleStat {
  productName: string;
  orderCount: number;
  headCount: number;
  amount: number;
  activities?: string[];
}

export interface Supplier {
  _id?: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  region: string;
  commissionRate: number;
  note?: string;
  products: SupplierProduct[];
  status: string;
  productCount?: number;
  settleStats?: SettleStat[];
  settleTotal?: number;
  settleOrderCount?: number;
  createdAt?: string;
}

const TYPE_OPTIONS = [
  { value: 'hotel', label: '五星酒店与高端民宿' },
  { value: 'ticket', label: '景区门票与特窟特批' },
  { value: 'transport', label: '无障碍大巴与游轮' },
  { value: 'catering', label: '特色养生低盐餐饮' },
  { value: 'guide', label: '名师大家与特邀学者' },
  { value: 'insurance', label: '长者专项旅行意外险' },
  { value: 'other', label: '其他综合配套供应商' },
];

const STATUS_LABEL: Record<string, string> = { active: '合作中', pending: '待审核', paused: '已暂停' };
const STATUS_CLASS: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paused: 'bg-slate-100 text-slate-400 border-slate-200',
};

const blankSupplier = (): Supplier => ({
  name: '',
  type: 'hotel',
  contact: '',
  phone: '',
  region: '',
  commissionRate: 0,
  note: '',
  products: [],
  status: 'active',
});

export const SupplierPanel: React.FC = () => {
  const { showToast } = useApp();
  const [list, setList] = useState<Supplier[]>([
    {
      _id: 'sup_1',
      name: '苏州太湖国宾馆度假酒店',
      type: 'hotel',
      contact: '周总监',
      phone: '13901234567',
      region: '江苏·苏州',
      commissionRate: 8,
      status: 'active',
      products: [
        { name: '湖景双人标房(含双早)', price: 480, unit: '间/晚' },
        { name: '太湖养生低盐私房桌餐', price: 120, unit: '位' },
      ],
      settleTotal: 148600,
      settleOrderCount: 42,
    },
    {
      _id: 'sup_2',
      name: '金龙安捷乐龄旅游车队',
      type: 'transport',
      contact: '李队长',
      phone: '13888889999',
      region: '华东区域',
      commissionRate: 5,
      status: 'active',
      products: [
        { name: '2+1航空座椅37座豪华大巴', price: 2800, unit: '天' },
      ],
      settleTotal: 86400,
      settleOrderCount: 28,
    },
    {
      _id: 'sup_3',
      name: '黄山国际温泉会务度假中心',
      type: 'hotel',
      contact: '陈经理',
      phone: '13700112233',
      region: '安徽·黄山',
      commissionRate: 10,
      status: 'active',
      products: [
        { name: '温泉大师赛专属展厅与茶歇', price: 6000, unit: '场' },
      ],
      settleTotal: 220000,
      settleOrderCount: 18,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('人/份');

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return list.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!k) return true;
      return (
        s.name.toLowerCase().includes(k) ||
        (s.contact || '').toLowerCase().includes(k) ||
        (s.phone || '').includes(k) ||
        (s.region || '').toLowerCase().includes(k)
      );
    });
  }, [list, keyword, typeFilter, statusFilter]);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) { showToast('请输入供应商名称'); return; }
    if (!editing.contact.trim() || !editing.phone.trim()) { showToast('请填写联系人与手机号'); return; }

    setList((prev) => {
      const idx = prev.findIndex((s) => s._id === editing._id);
      if (idx >= 0) {
        const arr = [...prev];
        arr[idx] = editing;
        return arr;
      }
      return [{ ...editing, _id: 'sup_' + Date.now() }, ...prev];
    });

    showToast('供应商档案已成功保存！');
    setEditing(null);
  };

  const handleAddProduct = () => {
    if (!editing || !newProdName.trim() || !newProdPrice) return;
    const prod: SupplierProduct = {
      name: newProdName.trim(),
      price: parseFloat(newProdPrice) || 0,
      unit: newProdUnit.trim() || '份',
    };
    setEditing({
      ...editing,
      products: [...(editing.products || []), prod],
    });
    setNewProdName('');
    setNewProdPrice('');
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题与操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>OTA 级供应商台账与采购产品库</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            维护酒店、车队、门票、名师、医护等合作机构档案及协议采购底价，支持一键组合至慢游行程测算
          </p>
        </div>
        <button
          onClick={() => setEditing(blankSupplier())}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>录入新供应商</span>
        </button>
      </div>

      {/* 搜索与筛选 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索供应商名称、联系人、城市..."
              className="bg-transparent text-xs text-slate-800 outline-none w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">全部类别</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">全部合作状态</option>
            <option value="active">合作中</option>
            <option value="pending">待审核</option>
            <option value="paused">已暂停</option>
          </select>
        </div>
      </div>

      {/* 供应商列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.region} · 佣金返点 {s.commissionRate}%</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_CLASS[s.status] || STATUS_CLASS.active}`}>
                  {STATUS_LABEL[s.status] || '合作中'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                <div>联系人：{s.contact} ({s.phone})</div>
                <div>产品库：包含 {s.products?.length || 0} 项采购协议服务</div>
                {s.settleTotal ? (
                  <div className="text-emerald-700 font-bold">
                    历史结算流水：¥{s.settleTotal.toLocaleString()} ({s.settleOrderCount} 笔)
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditing(s)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                编辑/管理产品
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新增/编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900">
              {editing._id ? `编辑供应商：${editing.name}` : '录入新合作供应商'}
            </h3>
            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">机构/供应商名称 *</label>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="如：苏州太湖国宾馆"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">供应商类别</label>
                  <select
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">联系人 *</label>
                  <input
                    required
                    value={editing.contact}
                    onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="如：周总监"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">联系电话 *</label>
                  <input
                    required
                    value={editing.phone}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="11位手机号"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">所在城市/区域</label>
                  <input
                    value={editing.region}
                    onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                    placeholder="如：江苏·苏州"
                  />
                </div>
              </div>

              {/* 协议产品库 */}
              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2.5 bg-slate-50/60">
                <label className="block font-bold text-slate-800">协议采购产品库 (可多项)：</label>
                <div className="space-y-1.5">
                  {(editing.products || []).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-emerald-800">¥{p.price} /{p.unit}</span>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, products: editing.products.filter((_, i) => i !== idx) })}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-2 pt-1">
                  <input
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="新服务项名称"
                    className="col-span-5 p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="采购单价(元)"
                    className="col-span-4 p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="单位"
                    className="col-span-2 p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="col-span-1 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                >
                  保存供应商
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
