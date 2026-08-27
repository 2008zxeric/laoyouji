import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Award, Calendar, Phone, Star, ShieldCheck, Sparkles, Check } from 'lucide-react';
import type { Tgo } from '../../api/gateway';

export const TgoAdminPanel: React.FC = () => {
  const { tgos, setTgos, showToast } = useApp();
  const [editing, setEditing] = useState<Tgo | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`确定从认证旅伴库中移除「${name}」？`)) return;
    setTgos((prev) => prev.filter((t) => t.id !== id));
    showToast(`已成功移除 ${name} 的 TGO 档案`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) { showToast('请输入姓名'); return; }

    setTgos((prev) => {
      const idx = prev.findIndex((t) => t.id === editing.id);
      if (idx >= 0) {
        const arr = [...prev];
        arr[idx] = editing;
        return arr;
      }
      return [{ ...editing, id: 'tgo_' + Date.now() }, ...prev];
    });

    showToast(`已成功保存 ${editing.name} 的 TGO 档案！`);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>TGO 旅伴管家档案与排期管理</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            维护金/银/铜三级认证长者旅伴档案、服务专长、带团履历与近期带团日历
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              id: 'tgo_' + Date.now(),
              name: '',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
              tier: 'gold',
              badge: '金牌',
              color: '#D4AF37',
              source: 'own',
              title: '国家级研学导师 · 红十字急救员',
              specialty: ['文化导赏', '急救医护'],
              trips: 10,
              rating: 5.0,
              praiseRate: 99.5,
              motto: '慢游随心，如侍父母',
              intro: '',
              experience: [],
              calendar: [],
              fee: '按团次核算',
              certified: ['国家红十字急救员'],
              status: 'active',
            })
          }
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>新建 TGO 档案</span>
        </button>
      </div>

      {/* 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tgos.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-emerald-400 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${t.tier === 'gold' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
                      {t.tier === 'gold' ? '金旅伴' : t.tier === 'silver' ? '银旅伴' : '铜旅伴'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.title}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {(t.specialty || []).map((s, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
              </div>

              <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-0.5">
                <div>带团场次：{t.trips || 0} 场 · 好评率 {t.praiseRate || 99}%</div>
                <div>排期日历：共配置 {t.calendar?.length || 0} 场未来带团安排</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditing({ ...t })}
                className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                编辑档案
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-slate-900">
              {editing.id.startsWith('tgo_') ? '新建 TGO 档案' : `编辑 TGO：${editing.name}`}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">姓名 *</label>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">级别</label>
                  <select
                    value={editing.tier}
                    onChange={(e) => setEditing({ ...editing, tier: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  >
                    <option value="gold">金旅伴 (特聘导师)</option>
                    <option value="silver">银旅伴 (资深金牌)</option>
                    <option value="bronze">铜旅伴 (认证管家)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">一句话头衔/称号</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="如：国家级文博讲解员 · 红十字急救员"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">头像图片链接 (HTTPS)</label>
                <input
                  value={editing.avatar}
                  onChange={(e) => setEditing({ ...editing, avatar: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">服务座右铭</label>
                <input
                  value={editing.motto}
                  onChange={(e) => setEditing({ ...editing, motto: e.target.value })}
                  placeholder="如：慢行随心，如侍父母"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">个人简介与慢游服务经历</label>
                <textarea
                  rows={3}
                  value={editing.intro}
                  onChange={(e) => setEditing({ ...editing, intro: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  保存档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
