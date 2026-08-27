import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, FileText, Send, Building2, MapPin, Phone, Calendar } from 'lucide-react';
import { submitActivityApply } from '../api/gateway';
import { useApp } from '../context/AppContext';

const DURATION_OPTIONS = [
  { value: 'half-day', label: '半天（3-4小时）' },
  { value: 'full-day', label: '全天（6-8小时）' },
  { value: 'two-days', label: '两天一夜' },
  { value: 'multi-days', label: '多日行程（3天以上）' },
];

const SCALE_OPTIONS = [
  { value: 'small', label: '精品小团（10人以内）' },
  { value: 'medium', label: '中型团队（10-30人）' },
  { value: 'large', label: '大型活动（30人以上）' },
];

const EMPTY = {
  title: '',
  organizer: '',
  description: '',
  date: '',
  time: '',
  location: '',
  duration: 'half-day',
  price: '',
  scale: 'small',
  priceDescription: '',
  contactName: '',
  contactPhone: '',
  contactWechat: '',
  agreed: false,
};

export const ActivityApplyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { showToast } = useApp();
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.title.trim()) { setErr('请输入活动名称'); return; }
    if (!form.organizer.trim()) { setErr('请输入主办方或机构名称'); return; }
    if (!form.contactName.trim()) { setErr('请输入联系人姓名'); return; }
    if (!/^1[3-9]\d{9}$/.test(form.contactPhone.trim())) {
      setErr('请输入正确的11位手机号码');
      return;
    }
    const price = parseFloat(String(form.price));
    if (isNaN(price) || price <= 0) {
      setErr('请输入有效的每人费用预算（元）');
      return;
    }
    if (!form.agreed) {
      setErr('请阅读并同意合作发布协议');
      return;
    }

    setSubmitting(true);
    try {
      await submitActivityApply({
        title: form.title.trim(),
        organizer: form.organizer.trim(),
        description: form.description.trim(),
        date: form.date,
        time: form.time,
        location: form.location.trim(),
        duration: form.duration,
        price,
        scale: form.scale,
        priceDescription: form.priceDescription.trim(),
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactWechat: form.contactWechat.trim(),
      });
      setDone(true);
      showToast('活动发布申请已提交成功');
    } catch (e2: any) {
      setErr(e2?.message || '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE6DF] relative">
        {done ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#2C3E50]">活动发布申请已提交！</h3>
            <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
              您的活动申请已进入后台审核队列，<strong>1-2 个工作日内</strong>我们的运营团队将完成适老标准与安全审核，并与您致电确认排期与上线细节。
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-[#2C3E50] text-[#D4AF37] text-sm font-bold shadow-md cursor-pointer"
            >
              我知道了
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-[#2C3E50] text-white px-6 py-4 flex items-center justify-between rounded-t-3xl border-b border-[#D4AF37]/30 z-10">
              <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> 我要发布活动 · 机构与老友共创
              </h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3">
                <div className="text-xs font-bold text-[#2C3E50] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span>活动基本信息</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">活动名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="如：天一阁古籍修复体验与阳明心学漫谈"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">主办方 / 机构 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.organizer}
                      onChange={(e) => set('organizer', e.target.value)}
                      placeholder="如：宁波古籍保护促进会"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">活动地点 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => set('location', e.target.value)}
                      placeholder="如：宁波市海曙区天一街10号"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">拟定活动日期</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => set('date', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">预计时长</label>
                    <select
                      value={form.duration}
                      onChange={(e) => set('duration', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    >
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">活动详情描述 <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="请详细描述活动内容、名师讲解、特色体验以及适合人群..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50] resize-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-3">
                <div className="text-xs font-bold text-[#2C3E50] flex items-center gap-1.5 border-b border-stone-100 pb-2">
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>费用与联系人</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">预计每人费用 (元) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder="如：298"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">预计规模</label>
                    <select
                      value={form.scale}
                      onChange={(e) => set('scale', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    >
                      {SCALE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">联系人姓名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={(e) => set('contactName', e.target.value)}
                      placeholder="如：张老师"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">联系人手机 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={form.contactPhone}
                      onChange={(e) => set('contactPhone', e.target.value)}
                      placeholder="11位手机号码"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-900 focus:outline-none focus:border-[#2C3E50]"
                    />
                  </div>
                </div>
              </div>

              {err && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  ⚠️ {err}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeApply"
                  checked={form.agreed}
                  onChange={(e) => set('agreed', e.target.checked)}
                  className="rounded border-stone-300 text-[#2C3E50] focus:ring-[#2C3E50]"
                />
                <label htmlFor="agreeApply" className="text-stone-600 text-[11px] cursor-pointer">
                  我已阅读并同意《老友记文旅活动合作发布与安全保障协议》
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white border border-stone-200 text-stone-600 font-bold cursor-pointer hover:bg-stone-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-[#2C3E50] text-[#D4AF37] font-bold shadow-md cursor-pointer hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? '正在提交...' : '提交活动发布申请'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
