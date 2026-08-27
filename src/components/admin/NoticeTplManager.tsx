import React, { useState, useEffect } from 'react';
import { fetchNoticeTemplates, saveNoticeTemplate, deleteNoticeTemplate, type NoticeTemplate } from '../../api/gateway';
import { X, Plus, Trash2, Edit2, BookOpen, Layers, Check } from 'lucide-react';

export const NoticeTplManager: React.FC<{
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
}> = ({ open, onClose, onChanged }) => {
  const [tpls, setTpls] = useState<NoticeTemplate[]>([
    {
      _id: 'tpl_general',
      name: '乐龄国内研学通用须知',
      category: '国内慢游',
      cancelPolicy: [
        '出团前7天以上取消，全额退款并原路返还积分',
        '出团前3-6天取消，扣除30%订金及机票/高铁退票费',
        '出团前1-2天取消，扣除50%预订房费与车位损失',
        '出团当天取消或未按时抵达，视为违约不予退款',
      ],
      notes: [
        '长者须身体健康状况良好，无严重突发性心脏病或重度行动障碍',
        '随团配备红十字资质急救员与便携 AED 医疗应急包',
        '全程乐龄平缓慢步，每日步数控制在4000步以内',
        '全程入驻五星级或高端特色园林酒店，单人报名享受单房差会员减免',
      ],
    },
    {
      _id: 'tpl_guandan',
      name: '乐龄掼蛋/棋牌赛事参赛须知与对弈公约',
      category: '乐龄赛事',
      cancelPolicy: [
        '比赛前3天以上取消，全额退还参赛费',
        '比赛前1-2天取消，退还50%场地及会务成本',
        '比赛当日弃权，参赛费全额扣除不予退还',
      ],
      notes: [
        '比赛坚持健康文娱、益智交流，严禁任何形式的涉赌行为',
        '赛场全场配备国家级裁判执裁，佩戴静音耳机与便携除颤仪',
        '提供温热枸杞参茶与草本茶歇，每日赛程不超过2.5小时',
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [editor, setEditor] = useState<NoticeTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('');
  const [cp, setCp] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchNoticeTemplates()
      .then((r) => {
        if (r && r.length) setTpls(r);
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const openEditor = (t?: NoticeTemplate) => {
    setEditor(t || null);
    setIsNew(!t);
    setName(t?.name || '');
    setCat(t?.category || '');
    setCp((t?.cancelPolicy || []).join('\n'));
    setNotes((t?.notes || []).join('\n'));
  };

  const submit = async () => {
    if (!name.trim()) {
      alert('请填写模板名称');
      return;
    }
    const cpArr = cp.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!cpArr.length) {
      alert('请至少填写一条取消政策');
      return;
    }
    setSaving(true);
    try {
      const newTpl: NoticeTemplate = {
        _id: editor?._id || 'tpl_' + Date.now(),
        name: name.trim(),
        category: cat.trim() || '通用',
        cancelPolicy: cpArr,
        notes: notes.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      await saveNoticeTemplate({
        templateId: editor?._id || '',
        ...newTpl,
      });
      setTpls((prev) => {
        const idx = prev.findIndex((p) => p._id === newTpl._id);
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = newTpl;
          return arr;
        }
        return [newTpl, ...prev];
      });
      setEditor(null);
      setIsNew(false);
      onChanged?.();
    } catch (e: any) {
      alert(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, n: string) => {
    if (!window.confirm(`确定删除模板「${n}」？`)) return;
    try {
      await deleteNoticeTemplate(id);
      setTpls((prev) => prev.filter((t) => t._id !== id));
      onChanged?.();
    } catch (e: any) {
      alert(e?.message || '删除失败');
    }
  };

  const list = filter.trim() ? tpls.filter((x) => x.category === filter.trim() || x.name.includes(filter)) : tpls;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>报名须知与适老出游注意事项模板库</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="按分类或标题检索..."
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500 w-48"
          />
          <button
            onClick={() => openEditor()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> 新增模板
          </button>
          <span className="text-slate-500 ml-auto font-medium">共 {list.length} 个规范模板</span>
        </div>

        <div className="overflow-y-auto flex-1 bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {list.length === 0 ? (
            <div className="text-xs text-slate-400 py-12 text-center">暂无模板，点击上方「新增模板」进行创建</div>
          ) : (
            list.map((t) => (
              <div key={t._id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                      {t.category || '通用'}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <strong className="text-slate-700">退改政策：</strong>
                    {(t.cancelPolicy || []).slice(0, 2).join('；')}...
                  </div>
                  <div className="text-slate-500">
                    <strong className="text-slate-700">乐龄须知：</strong>
                    {(t.notes || []).slice(0, 2).join('；')}...
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditor(t)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(t._id, t.name)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            完成并关闭
          </button>
        </div>
      </div>

      {/* 新增/编辑 表单 */}
      {(editor || isNew) && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h4 className="font-serif font-bold text-slate-900 text-base">
              {isNew ? '新增须知模板' : `编辑模板：${editor?.name}`}
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">模板名称 *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：华东五市名师慢游统一报名须知"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">适用分类</label>
                <input
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  placeholder="如：国内慢游 / 乐龄赛事 / 短途康养"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">退订及取消政策 (每行一条) *</label>
                <textarea
                  rows={4}
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  placeholder="出团前7天取消全额退款..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-600 resize-none font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">乐龄注意事项 (每行一条)</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="配随车医护包，每日步数控制在4000步..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-600 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setEditor(null); setIsNew(false); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? '正在保存...' : '保存模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
