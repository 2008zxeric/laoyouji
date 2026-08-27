import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HealthProfile } from '../types';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Stethoscope,
  Pill,
  Compass,
  Footprints,
  Phone,
  Sparkles,
} from 'lucide-react';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CHRONIC_CONDITIONS = [
  '高血压 (平稳控制)',
  '2型糖尿病 (规律用药)',
  '膝关节微酸/退行性改变',
  '腰椎间盘微突',
  '轻度脂肪肝',
  '痛风 (非发作期)',
  '冠心病 (支架术后稳定>1年)',
  '颈椎病 (易头晕)',
  '骨质疏松',
  '慢性胃炎',
];

const COMMON_ALLERGIES = [
  '海鲜/甲壳类',
  '花生/坚果类',
  '青霉素/磺胺类药物',
  '芒果/菠萝',
  '花粉/柳絮',
  '羊肉/辛辣刺激',
];

const COMMON_MEDICATIONS = [
  '降压药 (每日晨起1次)',
  '降糖药 / 胰岛素',
  '阿司匹林 / 脑心通',
  '硝酸甘油 / 速效救心丸 (随身应急)',
  '降尿酸药 (别嘌醇等)',
  '助消化 / 护胃药',
  '眼药水 / 人工泪液',
];

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateHealthProfile, showToast } = useApp();

  const currentHp: HealthProfile = userProfile.healthProfile || {
    bloodPressureStatus: 'controlled_hypertension',
    heartCondition: 'normal',
    mobilityLevel: 'gentle_walker',
    altitudeSensitivity: 'sensitive',
    chronicConditions: ['高血压 (平稳控制)'],
    allergies: ['海鲜/甲壳类'],
    dailyMedications: ['降压药 (每日晨起1次)', '硝酸甘油 / 速效救心丸 (随身应急)'],
    maxDailyStepsComfort: 5000,
    emergencyContactName: userProfile.emergencyContactName || '赵晓琳',
    emergencyContactPhone: userProfile.emergencyContactPhone || '139 1888 9966',
    emergencyContactRelation: '女儿',
    specialDietary: '低盐少油、少糖清淡，不食重辣与海鲜',
    medicalNotes: '平时晨起活动半小时，午后需小憩30分钟；随身常备温水杯与降压药。',
    lastUpdated: '2026-08-20',
    isDeclared: true,
  };

  const [formData, setFormData] = useState<HealthProfile>(currentHp);
  const [customCondition, setCustomCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customMed, setCustomMed] = useState('');

  if (!isOpen) return null;

  const toggleArrayItem = (key: 'chronicConditions' | 'allergies' | 'dailyMedications', item: string) => {
    setFormData((prev) => {
      const list = prev[key] || [];
      const nextList = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
      return { ...prev, [key]: nextList };
    });
  };

  const handleAddCustom = (key: 'chronicConditions' | 'allergies' | 'dailyMedications', val: string, setVal: (v: string) => void) => {
    if (!val.trim()) return;
    if (!formData[key].includes(val.trim())) {
      setFormData((prev) => ({
        ...prev,
        [key]: [...prev[key], val.trim()],
      }));
    }
    setVal('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      showToast('请完整填写紧急联系人及电话');
      return;
    }

    const updated: HealthProfile = {
      ...formData,
      isDeclared: true,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    updateHealthProfile(updated);
    showToast('健康档案已保存！系统将在您报名时自动守护出行安全');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#EAE6DF]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-[#2C3E50] text-base md:text-lg">
                乐龄会员 · 健康档案申报
              </h3>
              <p className="text-[11px] text-stone-500">
                专为银发出行安全定制 · 数据加密仅随团医护与TGO管家可见
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-transform active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            申报后，系统将在您选报活动时<strong>智能比对线路步数、海拔与地形</strong>，超负荷即时温馨提醒。
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-6 text-xs text-stone-800 flex-1">
          {/* Section 1: Mobility & Daily Steps */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                <Footprints className="w-4 h-4 text-[#85660d]" />
                <span>1. 行动能力与舒适日行步数</span>
              </div>
              <span className="text-[11px] text-stone-400">智能匹配活动强度</span>
            </div>

            <div className="space-y-2">
              <label className="text-stone-600 font-semibold block">日常步态与关节活动度：</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'independent', label: '步履轻健', desc: '爬山漫步皆自如' },
                  { id: 'gentle_walker', label: '平缓慢行', desc: '偏好平路少台阶' },
                  { id: 'cane_assisted', label: '手杖辅助', desc: '随身需登山杖' },
                  { id: 'wheelchair', label: '轮椅无障碍', desc: '需无障碍通道' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, mobilityLevel: item.id as any })}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.mobilityLevel === item.id
                        ? 'border-[#2C3E50] bg-[#FAF9F6] font-bold text-[#2C3E50] ring-1 ring-[#2C3E50]'
                        : 'border-[#EAE6DF] hover:border-stone-300'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-600 font-semibold">适宜每日最大连续步数：</span>
                <span className="font-bold text-amber-800 text-sm font-serif">
                  约 {formData.maxDailyStepsComfort.toLocaleString()} 步
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="12000"
                step="1000"
                value={formData.maxDailyStepsComfort}
                onChange={(e) => setFormData({ ...formData, maxDailyStepsComfort: Number(e.target.value) })}
                className="w-full accent-[#2C3E50] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>2,000步 (极舒缓)</span>
                <span>5,000步 (适老黄金)</span>
                <span>8,000步 (中度健步)</span>
                <span>12,000步 (登山强体)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Blood Pressure & Heart & Altitude */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <span>2. 血压、心脑血管与海拔耐受</span>
              </div>
              <span className="text-[11px] text-stone-400">高原线路与气候安全</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* BP */}
              <div className="space-y-1.5">
                <label className="text-stone-600 font-semibold block">常规血压状况：</label>
                <select
                  value={formData.bloodPressureStatus}
                  onChange={(e) => setFormData({ ...formData, bloodPressureStatus: e.target.value as any })}
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#2C3E50]"
                >
                  <option value="normal">血压完全正常 (收缩压&lt;120)</option>
                  <option value="controlled_hypertension">高血压 (用药平稳控制中)</option>
                  <option value="high">血压偏高 / 偶有波动</option>
                  <option value="unknown">未定期测量 / 不清楚</option>
                </select>
              </div>

              {/* Heart */}
              <div className="space-y-1.5">
                <label className="text-stone-600 font-semibold block">心脏与心血管情况：</label>
                <select
                  value={formData.heartCondition}
                  onChange={(e) => setFormData({ ...formData, heartCondition: e.target.value as any })}
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#2C3E50]"
                >
                  <option value="normal">无心脑血管异常</option>
                  <option value="arrhythmia">轻度心律不齐 / 早搏</option>
                  <option value="coronary_stent">冠状动脉支架术后 (恢复良好&gt;1年)</option>
                  <option value="severe">心功能较弱 (需极平缓照护)</option>
                </select>
              </div>
            </div>

            {/* Altitude */}
            <div className="space-y-1.5 pt-1">
              <label className="text-stone-600 font-semibold block">高原环境耐受度 (如西藏/青海/云南高海拔)：</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: '耐受良好', desc: '曾去过高海拔地区' },
                  { id: 'sensitive', label: '敏感体质', desc: '需提前配氧与慢适应' },
                  { id: 'forbidden', label: '遵医嘱禁往', desc: '严禁报高海拔行程' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, altitudeSensitivity: item.id as any })}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.altitudeSensitivity === item.id
                        ? 'border-[#2C3E50] bg-[#FAF9F6] font-bold text-[#2C3E50] ring-1 ring-[#2C3E50]'
                        : 'border-[#EAE6DF] hover:border-stone-300'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Chronic Conditions & Allergies */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>3. 常见基础病与过敏史</span>
              </div>
              <span className="text-[11px] text-stone-400">已选 {formData.chronicConditions.length} 项</span>
            </div>

            {/* Chronic Conditions Multi-Select */}
            <div className="space-y-2">
              <label className="text-stone-600 font-semibold block">基础慢病标签 (点击切换)：</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_CHRONIC_CONDITIONS.map((cond) => {
                  const isSelected = formData.chronicConditions.includes(cond);
                  return (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => toggleArrayItem('chronicConditions', cond)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#2C3E50] text-[#FAF9F6] font-bold shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span>{cond}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="其他基础健康情况 (如: 腰椎滑脱、痛风等)"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  className="flex-1 bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-3 py-1.5 text-xs text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom('chronicConditions', customCondition, setCustomCondition)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#2C3E50] font-bold rounded-xl text-xs"
                >
                  添加
                </button>
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-stone-600 font-semibold block">过敏史与忌口源：</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGIES.map((allg) => {
                  const isSelected = formData.allergies.includes(allg);
                  return (
                    <button
                      type="button"
                      key={allg}
                      onClick={() => toggleArrayItem('allergies', allg)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-rose-700 text-white font-bold shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span>{allg}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="其他过敏食物或药物 (如: 芒果、蚕豆等)"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  className="flex-1 bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-3 py-1.5 text-xs text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom('allergies', customAllergy, setCustomAllergy)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#2C3E50] font-bold rounded-xl text-xs"
                >
                  添加
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Daily Medications & Special Dietary */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                <Pill className="w-4 h-4 text-amber-600" />
                <span>4. 常备随身药品与餐饮定制偏好</span>
              </div>
              <span className="text-[11px] text-stone-400">出游贴心提醒</span>
            </div>

            <div className="space-y-2">
              <label className="text-stone-600 font-semibold block">出游自备药品清单：</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MEDICATIONS.map((med) => {
                  const isSelected = formData.dailyMedications.includes(med);
                  return (
                    <button
                      type="button"
                      key={med}
                      onClick={() => toggleArrayItem('dailyMedications', med)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-700 text-white font-bold shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span>{med}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="补充其他随身自备药品名称"
                  value={customMed}
                  onChange={(e) => setCustomMed(e.target.value)}
                  className="flex-1 bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-3 py-1.5 text-xs text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom('dailyMedications', customMed, setCustomMed)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#2C3E50] font-bold rounded-xl text-xs"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label className="text-stone-600 font-semibold block">膳食个性化偏好 (如无糖、低盐、素食)：</label>
              <input
                type="text"
                value={formData.specialDietary}
                onChange={(e) => setFormData({ ...formData, specialDietary: e.target.value })}
                placeholder="例如：低盐少油、少糖清淡，不食重辣与海鲜"
                className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
              />
            </div>
          </div>

          {/* Section 5: Emergency Contact & Notes */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>5. 紧急联系人与照护特别嘱托</span>
              </div>
              <span className="text-[11px] text-rose-500 font-bold">* 必填项</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-stone-600 font-semibold block mb-1">联系人姓名</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="如: 赵晓琳"
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
                />
              </div>
              <div>
                <label className="text-stone-600 font-semibold block mb-1">亲友关系</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  placeholder="如: 女儿 / 儿子 / 配偶"
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
                />
              </div>
              <div>
                <label className="text-stone-600 font-semibold block mb-1">联系电话</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="如: 139 1888 9966"
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-stone-600 font-semibold block">给管家与随团医护的特别照护留言：</label>
              <textarea
                rows={2}
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="例如：平时晨起活动半小时，午后需小憩30分钟；随身常备温水杯与降压药。"
                className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 -mb-5 p-4 border-t border-[#EAE6DF] flex items-center justify-between">
            <div className="text-[11px] text-stone-500">
              最后更新于：{formData.lastUpdated || '今日'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>确认并保存健康档案</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
