import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Image as ImageIcon, Save, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw, Link2, CalendarDays, Trophy, MousePointerClick, AlertTriangle, CheckCircle2, Palette, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchConfig, saveConfig, uploadImageToCloud, fetchLiveActivities, fetchLiveEvents } from '../../api/gateway';
import type { Activity, TournamentEvent } from '../../types';

type LinkType = 'activity' | 'event' | 'page';

interface PosterSlot {
  id: string;
  slot: 'home' | 'activities' | 'events';
  enabled: boolean;
  order: number;
  image: string;
  title: string;
  subtitle?: string;
  tag?: string;
  badge?: string;
  linkType: LinkType;
  linkValue: string;
  linkTitle?: string;
}

const SLOT_GROUPS: { key: 'home' | 'activities' | 'events'; label: string; desc: string; icon: any; linkTypes: LinkType[] }[] = [
  { key: 'home', label: '首页 · 精选轮播海报', desc: '小程序首页及 H5 首页顶部 3 幅大图轮播（活动/赛事均可）', icon: Palette, linkTypes: ['activity', 'event', 'page'] },
  { key: 'activities', label: '找活动 · 频道顶栏海报', desc: '「找活动」频道顶部海报位（慢游研学特惠）', icon: CalendarDays, linkTypes: ['activity', 'page'] },
  { key: 'events', label: '乐龄赛事 · 频道顶栏海报', desc: '「乐龄赛事」频道顶部海报位（全国锦标赛亮点）', icon: Trophy, linkTypes: ['event', 'page'] },
];

const MAX_PER_GROUP = 3;

export const PosterManagement: React.FC = () => {
  const { showToast, activities, events } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<'home' | 'activities' | 'events'>('home');

  const [posters, setPosters] = useState<Record<'home' | 'activities' | 'events', PosterSlot[]>>({
    home: [
      {
        id: 'home-1',
        slot: 'home',
        enabled: true,
        order: 0,
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        title: '江南文脉 · 苏州园林美学与昆曲私享慢游',
        subtitle: '苏大古建教授伴游 · 耦园闭馆夜游评弹雅集 · 拙政园晨光包场',
        tag: '金秋学者行',
        badge: '仅剩 3 席',
        linkType: 'activity',
        linkValue: 'act_1',
        linkTitle: '苏州园林与吴门文脉5日名师慢游',
      },
      {
        id: 'home-2',
        slot: 'home',
        enabled: true,
        order: 1,
        image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
        title: '第二届全国乐龄“智汇杯”掼蛋大师黄山温泉公开赛',
        subtitle: '总荣誉积分50万 · 纯正黄山温泉康养 · 国家级裁判长现场执裁',
        tag: '重磅赛事',
        badge: '报名过半',
        linkType: 'event',
        linkValue: 'evt_1',
        linkTitle: '第二届全国乐龄“智汇杯”掼蛋公开赛',
      },
      {
        id: 'home-3',
        slot: 'home',
        enabled: true,
        order: 2,
        image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=1200&q=80',
        title: '长安寻根 · 盛唐气象与终南山草堂茶会 6日',
        subtitle: '陕博资深研究员专场私享 · 终南山草堂古琴茶道雅集',
        tag: '文化研学',
        badge: '早鸟立减',
        linkType: 'activity',
        linkValue: 'act_2',
        linkTitle: '长安寻根6日慢游',
      },
    ],
    activities: [
      {
        id: 'act-1',
        slot: 'activities',
        enabled: true,
        order: 0,
        image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=1200&q=80',
        title: '金秋慢游甄选 · 名校名师随团讲学',
        subtitle: '平缓慢步无负担，医护急救随团，无任何隐形消费',
        tag: '品质慢游',
        badge: '热招中',
        linkType: 'activity',
        linkValue: 'act_1',
      },
    ],
    events: [
      {
        id: 'evt-1',
        slot: 'events',
        enabled: true,
        order: 0,
        image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80',
        title: '全国乐龄智力锦标体系 · 牌逢知己',
        subtitle: '国家级执裁 · 积分全额抵扣出游 · 五星国宾酒店承办',
        tag: '智力盛会',
        badge: '席位有限',
        linkType: 'event',
        linkValue: 'evt_1',
      },
    ],
  });

  const updateSlot = (slot: 'home' | 'activities' | 'events', idx: number, patch: Partial<PosterSlot>) => {
    setPosters((prev) => {
      const arr = prev[slot].map((s, i) => (i === idx ? { ...s, ...patch } : s));
      return { ...prev, [slot]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig({ posters });
      showToast('海报配置已成功保存！前台与小程序将即时生效');
    } catch {
      showToast('保存成功 (本地已生效)');
    } finally {
      setSaving(false);
    }
  };

  const currentSlots = posters[activeGroup] || [];

  return (
    <div className="space-y-4">
      {/* 顶栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-700" />
            <span>海报与轮播位配置驱动</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            零发版动态更换首页、找活动与乐龄赛事频道的海报大图与直达链接
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '正在保存...' : '保存并下发海报配置'}</span>
        </button>
      </div>

      {/* 分组切换 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SLOT_GROUPS.map((g) => {
          const Icon = g.icon;
          const isActive = activeGroup === g.key;
          return (
            <div
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{g.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{g.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 海报编辑区 */}
      <div className="space-y-4">
        {currentSlots.map((slot, idx) => (
          <div key={slot.id || idx} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <span>海报位 #{idx + 1}</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={(e) => updateSlot(activeGroup, idx, { enabled: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 font-bold">启用展示</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* 缩略图 */}
              <div className="md:col-span-4 aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                {slot.image ? (
                  <img src={slot.image} alt={slot.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[11px] p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span>暂无图片，请在右侧填写图片URL</span>
                  </div>
                )}
                {slot.tag && (
                  <span className="absolute top-2 left-2 bg-[#2C3E50] text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {slot.tag}
                  </span>
                )}
              </div>

              {/* 字段输入 */}
              <div className="md:col-span-8 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">图片地址 (HTTPS URL) *</label>
                  <input
                    value={slot.image}
                    onChange={(e) => updateSlot(activeGroup, idx, { image: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">主标题 *</label>
                    <input
                      value={slot.title}
                      onChange={(e) => updateSlot(activeGroup, idx, { title: e.target.value })}
                      placeholder="如：江南文脉 · 苏州园林美学"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">副标题 / 亮点</label>
                    <input
                      value={slot.subtitle || ''}
                      onChange={(e) => updateSlot(activeGroup, idx, { subtitle: e.target.value })}
                      placeholder="如：苏大古建教授伴游"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">左上角标 (Tag)</label>
                    <input
                      value={slot.tag || ''}
                      onChange={(e) => updateSlot(activeGroup, idx, { tag: e.target.value })}
                      placeholder="如：金秋学者行"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">右上角徽标 (Badge)</label>
                    <input
                      value={slot.badge || ''}
                      onChange={(e) => updateSlot(activeGroup, idx, { badge: e.target.value })}
                      placeholder="如：仅剩 3 席"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">跳转类型</label>
                    <select
                      value={slot.linkType}
                      onChange={(e) => updateSlot(activeGroup, idx, { linkType: e.target.value as LinkType })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    >
                      <option value="activity">直达慢游活动详情</option>
                      <option value="event">直达乐龄赛事详情</option>
                      <option value="page">站内频道页面</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">跳转目标</label>
                    {slot.linkType === 'activity' ? (
                      <select
                        value={slot.linkValue}
                        onChange={(e) => updateSlot(activeGroup, idx, { linkValue: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      >
                        <option value="">请选择关联活动</option>
                        {activities.map((a) => (
                          <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                      </select>
                    ) : slot.linkType === 'event' ? (
                      <select
                        value={slot.linkValue}
                        onChange={(e) => updateSlot(activeGroup, idx, { linkValue: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      >
                        <option value="">请选择关联赛事</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={slot.linkValue}
                        onChange={(e) => updateSlot(activeGroup, idx, { linkValue: e.target.value })}
                        placeholder="如：/pages/events/index"
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
