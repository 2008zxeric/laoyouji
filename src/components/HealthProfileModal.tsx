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
  Bot,
  Zap,
  Calendar,
  Check,
  FileSpreadsheet,
  RotateCcw,
  Scale,
  Gauge,
  Droplets,
  Wind,
} from 'lucide-react';

interface HealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'biometrics' | 'conditions' | 'contacts';
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

export const HealthProfileModal: React.FC<HealthProfileModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'biometrics',
}) => {
  const { userProfile, updateHealthProfile, showToast, isCareMode } = useApp();

  const currentHp: HealthProfile = userProfile.healthProfile || {
    systolicBp: 128,
    diastolicBp: 82,
    restingHeartRate: 72,
    fastingBloodSugar: 5.6,
    bloodOxygen: 98,
    height: 172,
    weight: 68,
    bmi: 23.0,
    lastCheckupDate: '2026-08-25',
    syncToAiConcierge: true,
    aiHealthAdvice: '血压及心率平稳可控。AI管家已自动开启适老节奏保护：限制日行步数在5,000步内，上午核心游览推迟至早餐服药后半小时，避开陡长台阶，严选中医低盐少油养生药膳，午间保障2小时静卧午休。',
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
    lastUpdated: '2026-08-25',
    isDeclared: true,
  };

  const [activeTab, setActiveTab] = useState<'biometrics' | 'conditions' | 'contacts'>(defaultTab);
  const [formData, setFormData] = useState<HealthProfile>({
    ...currentHp,
    systolicBp: currentHp.systolicBp ?? 128,
    diastolicBp: currentHp.diastolicBp ?? 82,
    restingHeartRate: currentHp.restingHeartRate ?? 72,
    fastingBloodSugar: currentHp.fastingBloodSugar ?? 5.6,
    bloodOxygen: currentHp.bloodOxygen ?? 98,
    height: currentHp.height ?? 172,
    weight: currentHp.weight ?? 68,
    bmi: currentHp.bmi ?? 23.0,
    lastCheckupDate: currentHp.lastCheckupDate ?? '2026-08-25',
    syncToAiConcierge: currentHp.syncToAiConcierge ?? true,
  });

  const [customCondition, setCustomCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customMed, setCustomMed] = useState('');

  if (!isOpen) return null;

  // Compute BMI automatically when height or weight change
  const handleHeightWeightChange = (newHeight?: number, newWeight?: number) => {
    const h = newHeight ?? formData.height ?? 170;
    const w = newWeight ?? formData.weight ?? 65;
    let computedBmi = 22.0;
    if (h > 50 && w > 20) {
      computedBmi = Number((w / ((h / 100) * (h / 100))).toFixed(1));
    }
    setFormData((prev) => ({
      ...prev,
      height: h,
      weight: w,
      bmi: computedBmi,
    }));
  };

  // Helper to assess blood pressure level
  const getBpAssessment = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) {
      return { status: '标准理想', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', tag: '理想' };
    }
    if (sys <= 139 && dia <= 89) {
      return { status: '平稳正常高值', color: 'text-teal-700 bg-teal-50 border-teal-200', tag: '平稳' };
    }
    if (sys <= 159 || dia <= 99) {
      return { status: '1级轻度高压', color: 'text-amber-700 bg-amber-50 border-amber-200', tag: '轻度' };
    }
    return { status: '需特别关注/就医', color: 'text-rose-700 bg-rose-50 border-rose-200', tag: '偏高' };
  };

  // Helper to assess heart rate
  const getHeartRateAssessment = (hr: number) => {
    if (hr < 55) return { status: '心率偏缓', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (hr <= 80) return { status: '静息平稳适中', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (hr <= 100) return { status: '稍快 (建议舒缓)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { status: '心动过速 (需注意)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  // Generate dynamic AI itinerary adaptation advice
  const generateAiAdvice = (hp: HealthProfile): string => {
    const sBp = hp.systolicBp || 128;
    const dBp = hp.diastolicBp || 82;
    const hr = hp.restingHeartRate || 72;
    const steps = hp.maxDailyStepsComfort || 5000;

    const parts: string[] = [];
    if (sBp >= 140 || dBp >= 90) {
      parts.push(`【血压关照】：血压测得${sBp}/${dBp} mmHg（偏高），管家将在行程中避开>15°陡坡长梯，核心导赏推迟至餐后服药半小时，每走25分钟配软椅歇脚`);
    } else {
      parts.push(`【血压关照】：血压测得${sBp}/${dBp} mmHg（平稳），适老慢游行程全程配备温开水，平缓石板路自由观赏`);
    }

    if (hr > 85) {
      parts.push(`【心率节奏】：静息心率${hr}次/分，行程严格限速，漫步建议50~60步/分，全天步数严控在${steps}步内，午间保底2小时静卧午休`);
    } else {
      parts.push(`【心率节奏】：静息心率${hr}次/分（优良），结合名师特窟精讲，单日步数上限智能锚定在${steps}步`);
    }

    if (hp.fastingBloodSugar && hp.fastingBloodSugar > 6.1) {
      parts.push(`【饮食温控】：空腹血糖${hp.fastingBloodSugar} mmol/L，随行正餐定时开餐，严选少盐少糖软烂药膳`);
    }

    parts.push(`【安全卫士】：随团TGO配备三甲护士随行与AED急救箱，守护长辈从容出行`);
    return parts.join('；') + '。';
  };

  // Quick Preset Importers
  const applyPreset = (type: 'normal' | 'controlled' | 'senior_care') => {
    if (type === 'normal') {
      setFormData((prev) => ({
        ...prev,
        systolicBp: 118,
        diastolicBp: 78,
        restingHeartRate: 68,
        fastingBloodSugar: 5.2,
        bloodOxygen: 99,
        height: 172,
        weight: 66,
        bmi: 22.3,
        bloodPressureStatus: 'normal',
        heartCondition: 'normal',
        maxDailyStepsComfort: 6000,
        syncToAiConcierge: true,
        lastCheckupDate: '2026-09-01',
      }));
      showToast('已载入【标准正常体征指标 (118/78 mmHg · 心率68)】');
    } else if (type === 'controlled') {
      setFormData((prev) => ({
        ...prev,
        systolicBp: 128,
        diastolicBp: 82,
        restingHeartRate: 72,
        fastingBloodSugar: 5.6,
        bloodOxygen: 98,
        height: 172,
        weight: 68,
        bmi: 23.0,
        bloodPressureStatus: 'controlled_hypertension',
        heartCondition: 'normal',
        maxDailyStepsComfort: 5000,
        syncToAiConcierge: true,
        lastCheckupDate: '2026-08-25',
      }));
      showToast('已载入【平稳控制体征指标 (128/82 mmHg · 心率72)】');
    } else {
      setFormData((prev) => ({
        ...prev,
        systolicBp: 138,
        diastolicBp: 86,
        restingHeartRate: 78,
        fastingBloodSugar: 6.4,
        bloodOxygen: 97,
        height: 170,
        weight: 71,
        bmi: 24.6,
        bloodPressureStatus: 'controlled_hypertension',
        heartCondition: 'arrhythmia',
        maxDailyStepsComfort: 4000,
        syncToAiConcierge: true,
        lastCheckupDate: '2026-08-15',
      }));
      showToast('已载入【老年慢病综合管理体征 (138/86 mmHg · 心率78)】');
    }
  };

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
      setActiveTab('contacts');
      return;
    }

    const calculatedAdvice = generateAiAdvice(formData);

    const updated: HealthProfile = {
      ...formData,
      aiHealthAdvice: calculatedAdvice,
      isDeclared: true,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    updateHealthProfile(updated);
    showToast('🎉 体检指标与健康档案已成功保存！已实时同步至 AI 伴游管家进行行程适老化考量');
    onClose();
  };

  const bpEval = getBpAssessment(formData.systolicBp || 128, formData.diastolicBp || 82);
  const hrEval = getHeartRateAssessment(formData.restingHeartRate || 72);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#EAE6DF]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-2xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-bold text-[#2C3E50] text-base md:text-lg">
                  乐龄健康档案与体检指标
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Bot className="w-3 h-3 text-emerald-700" />
                  <span>AI 管家联动</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                记录血压、心率与体检数据 · 自动同步 AI 管家为出行做适老化考量
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-100/90 p-1.5 mx-5 mt-4 rounded-2xl flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('biometrics')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'biometrics'
                ? 'bg-white text-[#2C3E50] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            <span>基础体检指标 & AI同步</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'conditions'
                ? 'bg-white text-[#2C3E50] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-amber-600" />
            <span>慢病·步数·用药偏好</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-white text-[#2C3E50] shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>紧急联系人</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 text-xs text-stone-800 flex-1">
          {/* ================= TAB 1: BIOMETRICS & AI CONCIERGE SYNC ================= */}
          {activeTab === 'biometrics' && (
            <div className="space-y-4 animate-fadeIn">
              {/* AI Concierge Sync Feature Banner */}
              <div className="bg-gradient-to-r from-[#2C3E50] via-[#1a252f] to-[#2C3E50] rounded-2xl p-4 text-amber-50 border border-amber-400/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#D4AF37] text-stone-950 flex items-center justify-center font-bold shadow-xs">
                      <Bot className="w-4 h-4 text-stone-950" />
                    </span>
                    <div>
                      <div className="font-serif font-bold text-sm text-[#FAF9F6] flex items-center gap-2">
                        <span>AI 慢游管家 · 适老化行程考量守护</span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] px-1.5 py-0.2 rounded font-sans">
                          实时联动
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        开启后，AI在为您规划研学慢游路线时，将严格基于您的体检数值定制强度
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.syncToAiConcierge}
                      onChange={(e) => setFormData({ ...formData, syncToAiConcierge: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                  </label>
                </div>

                {formData.syncToAiConcierge && (
                  <div className="bg-black/30 rounded-xl p-3 border border-amber-300/20 text-[11px] text-stone-300 space-y-1.5 leading-relaxed">
                    <div className="text-amber-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>已启用适老化考量规则：</span>
                    </div>
                    <p className="text-stone-200">{generateAiAdvice(formData)}</p>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#85660d]" />
                    <span>快捷导入示范体检指标：</span>
                  </span>
                  <span className="text-[10px] text-stone-400">点击一键填入</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('normal')}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-stone-800 text-xs">标准正常体征</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">118/78 mmHg · 心率68</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('controlled')}
                    className="p-2 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-amber-900 text-xs">平稳控制体征 (推荐)</div>
                    <div className="text-[10px] text-stone-600 mt-0.5">128/82 mmHg · 心率72</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('senior_care')}
                    className="p-2 rounded-xl bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-stone-800 text-xs">老干部慢病调控</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">138/86 mmHg · 心率78</div>
                  </button>
                </div>
              </div>

              {/* Physical Exam Input Fields */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                    <Gauge className="w-4 h-4 text-rose-600" />
                    <span>核心生命体征与体检指标</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>最近测量：</span>
                    <input
                      type="date"
                      value={formData.lastCheckupDate || '2026-08-25'}
                      onChange={(e) => setFormData({ ...formData, lastCheckupDate: e.target.value })}
                      className="bg-stone-50 border border-stone-200 rounded-md px-1.5 py-0.5 text-[11px] text-stone-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Blood Pressure (血压) */}
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                        <span>血压指标 (mmHg)</span>
                      </label>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${bpEval.color}`}>
                        {bpEval.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 block mb-0.5">收缩压 (高压)</span>
                        <div className="relative">
                          <input
                            type="number"
                            min="80"
                            max="220"
                            value={formData.systolicBp || 128}
                            onChange={(e) => setFormData({ ...formData, systolicBp: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#2C3E50]"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] text-stone-400">mmHg</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block mb-0.5">舒张压 (低压)</span>
                        <div className="relative">
                          <input
                            type="number"
                            min="50"
                            max="140"
                            value={formData.diastolicBp || 82}
                            onChange={(e) => setFormData({ ...formData, diastolicBp: Number(e.target.value) })}
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#2C3E50]"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] text-stone-400">mmHg</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      💡 适老慢游标准建议：收缩压控制在 120~139 mmHg 之间最为适宜游赏。
                    </div>
                  </div>

                  {/* Heart Rate (静息心率) */}
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" />
                        <span>静息心率 (次/分)</span>
                      </label>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${hrEval.color}`}>
                        {hrEval.status}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="40"
                        max="160"
                        value={formData.restingHeartRate || 72}
                        onChange={(e) => setFormData({ ...formData, restingHeartRate: Number(e.target.value) })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#2C3E50]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-stone-400">次/分钟</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      💡 正常静息心率在 60~80 次/分之间，活动中管家将根据心率提醒放缓步频。
                    </div>
                  </div>

                  {/* Fasting Blood Sugar (空腹血糖) */}
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-amber-600" />
                        <span>空腹血糖 (mmol/L)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border text-emerald-700 bg-emerald-50 border-emerald-200">
                        正常 3.9 ~ 6.1
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="2.0"
                        max="25.0"
                        value={formData.fastingBloodSugar || 5.6}
                        onChange={(e) => setFormData({ ...formData, fastingBloodSugar: Number(e.target.value) })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#2C3E50]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-stone-400">mmol/L</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      💡 餐饮将自动规避高升糖指数食物，随团配备低糖饼干预防低血糖。
                    </div>
                  </div>

                  {/* Blood Oxygen (血氧饱和度) */}
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-cyan-600" />
                        <span>静息血氧饱和度 (SpO2)</span>
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border text-teal-700 bg-teal-50 border-teal-200">
                        标准 ≥ 95%
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min="70"
                        max="100"
                        value={formData.bloodOxygen || 98}
                        onChange={(e) => setFormData({ ...formData, bloodOxygen: Number(e.target.value) })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#2C3E50]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-stone-400">%</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      💡 血氧&lt;95% 时前往高海拔或剧烈登山活动将触发安全熔断预警。
                    </div>
                  </div>

                  {/* Height & Weight & BMI */}
                  <div className="sm:col-span-2 p-3 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-stone-600" />
                        <span>体质身体指标 (身高、体重与 BMI)</span>
                      </label>
                      <span className="text-xs font-serif font-bold text-[#85660d] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        BMI 指数：{formData.bmi || 23.0} ({formData.bmi && formData.bmi >= 24 ? '微重' : '标准健硕'})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-stone-400 block mb-0.5">身高 (cm)</span>
                        <input
                          type="number"
                          min="120"
                          max="220"
                          value={formData.height || 172}
                          onChange={(e) => handleHeightWeightChange(Number(e.target.value), formData.weight)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block mb-0.5">体重 (kg)</span>
                        <input
                          type="number"
                          min="30"
                          max="150"
                          value={formData.weight || 68}
                          onChange={(e) => handleHeightWeightChange(formData.height, Number(e.target.value))}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: MOBILITY & CHRONIC CONDITIONS ================= */}
          {activeTab === 'conditions' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Mobility & Daily Steps */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                    <Footprints className="w-4 h-4 text-[#85660d]" />
                    <span>行动步态与舒适日行步数</span>
                  </div>
                  <span className="text-[11px] text-stone-400">智能限定路线步数上限</span>
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
                    <span>8,000步 (健步达人)</span>
                    <span>12,000步 (登山强体)</span>
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>慢病标签与日常自备药</span>
                  </div>
                  <span className="text-[11px] text-stone-400">已选 {formData.chronicConditions.length} 项</span>
                </div>

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
                          className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer ${
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
                </div>

                {/* Medications */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="text-stone-600 font-semibold block">出游常备随身药品清单：</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_MEDICATIONS.map((med) => {
                      const isSelected = formData.dailyMedications.includes(med);
                      return (
                        <button
                          type="button"
                          key={med}
                          onClick={() => toggleArrayItem('dailyMedications', med)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer ${
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
                </div>

                {/* Dietary */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-stone-600 font-semibold block">膳食个性化偏好 (如少盐无糖软烂)：</label>
                  <input
                    type="text"
                    value={formData.specialDietary}
                    onChange={(e) => setFormData({ ...formData, specialDietary: e.target.value })}
                    placeholder="例如：低盐少油、少糖清淡，不食重辣与海鲜"
                    className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: CONTACTS & MEDICAL NOTES ================= */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-bold text-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>紧急联系人与就医嘱托</span>
                  </div>
                  <span className="text-[11px] text-rose-500 font-bold">* 出行必备</span>
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
                  <label className="text-stone-600 font-semibold block">给随行管家与医护的特别照护留言：</label>
                  <textarea
                    rows={3}
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder="例如：平时晨起活动半小时，午后需小憩30分钟；随身常备温水杯与降压药，如遇头晕先坐下饮水测压。"
                    className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl p-2.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md -mx-5 -mb-5 p-4 border-t border-[#EAE6DF] flex items-center justify-between">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {formData.syncToAiConcierge ? 'AI管家适老考量已连接' : '仅保存在本地'} · 更新：{formData.lastUpdated || '今日'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>保存指标并同步AI管家</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
