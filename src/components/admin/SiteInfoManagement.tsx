import React, { useState, useEffect } from 'react';
import { Info, Save, Building2, MessageCircle, FileText, MapPin, Phone, Globe, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { SiteInfo } from '../../api/gateway';

const FIELDS: {
  key: keyof SiteInfo;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  hint?: string;
}[] = [
  { key: 'brand', label: '品牌名称', placeholder: '老友记 老好玩儿', type: 'text' },
  { key: 'slogan', label: '品牌口号', placeholder: '老好玩儿了 · 雅趣同行', type: 'text' },
  { key: 'company', label: '公司全称', placeholder: '浙江四季游文旅集团有限公司', type: 'text' },
  { key: 'serviceWechat', label: '客服微信号', placeholder: 'laoyouji_service', type: 'text' },
  { key: 'servicePhone', label: '客服服务热线', placeholder: '18100129722', type: 'text' },
  { key: 'serviceTime', label: '客服服务时间', placeholder: '每日 9:00 - 21:00', type: 'text' },
  { key: 'hotline', label: '长者紧急出行热线', placeholder: '400-880-9966', type: 'text' },
  { key: 'address', label: '公司地址', placeholder: '浙江省宁波市海曙区天一阁文创中心4楼', type: 'text' },
  { key: 'icp', label: 'ICP备案号', placeholder: '浙ICP备20260827号-1', type: 'text' },
  { key: 'intro', label: '一句话简介', placeholder: '面向 50-75 岁高净值知青学者的乐龄文化慢游与文体赛事社区', type: 'textarea', hint: '首页与分享卡片展示，建议 60 字内' },
  { key: 'about', label: '关于我们（正文）', placeholder: '老友记文旅社区以老友相聚、适老慢游为核心……', type: 'textarea', hint: '前台关于页正文展示，支持多段落' },
  { key: 'agreement', label: '用户服务协议与隐私声明', placeholder: '用户协议正文……', type: 'textarea', hint: '注册/报名页合规引用' },
];

const FIELD_ICON: Partial<Record<keyof SiteInfo, React.FC<{ className?: string }>>> = {
  serviceWechat: MessageCircle,
  servicePhone: Phone,
  serviceTime: MessageCircle,
  hotline: Phone,
  company: Building2,
  address: MapPin,
  icp: Globe,
  agreement: FileText,
  intro: Info,
  about: Info,
  slogan: Info,
  brand: Info,
};

const FieldIcon: React.FC<{ k: keyof SiteInfo }> = ({ k }) => {
  const Icon = FIELD_ICON[k];
  return Icon ? <Icon className="w-3.5 h-3.5 text-emerald-600" /> : null;
};

export const SiteInfoManagement: React.FC = () => {
  const { siteInfo, updateSiteInfo, showToast } = useApp();
  const [form, setForm] = useState<SiteInfo>(siteInfo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteInfo) setForm(siteInfo);
  }, [siteInfo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteInfo({ ...form });
      showToast('站点基础配置已成功保存并同步云端！');
    } catch {
      showToast('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 顶部说明卡 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
              <Info className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">站点基础信息与合规配置</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              三端唯一源
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
            集中维护品牌、客服电话、公司地址、简介与用户协议。保存后自动下发，小程序端与 H5 端前台「关于我们 / 客服 / 协议」均保持统一。
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          {saving ? '正在同步云端…' : '保存并同步云端'}
        </button>
      </div>

      {/* 表单区 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className={f.type === 'textarea' ? 'md:col-span-2' : ''}
            >
              <label className="block font-bold text-slate-700 mb-1.5 text-xs flex items-center gap-1.5">
                <FieldIcon k={f.key} />
                <span>{f.label}</span>
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={f.key === 'about' || f.key === 'agreement' ? 6 : 2}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none text-xs resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none text-xs"
                />
              )}
              {f.hint && <p className="text-[10px] text-slate-400 mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-100">
          <button
            onClick={() => setForm(siteInfo)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            撤销所有修改
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中…' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  );
};
