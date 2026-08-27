import React, { useMemo, useState } from 'react';
import { Compass, X, Crown, Star, Handshake, Users, Building2, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TgoDetailModal } from './TgoDetailModal';
import { useTgoAvatars, tgoAvatarUrl } from '../hooks/useTgoAvatars';
import { submitTgoApply } from '../api/gateway';
import type { Tgo } from '../api/gateway';

const TIER_META = {
  gold: { label: '金旅伴', cls: 'bg-amber-400 text-stone-950', icon: Crown },
  silver: { label: '银旅伴', cls: 'bg-slate-300 text-stone-900', icon: Star },
  bronze: { label: '铜旅伴', cls: 'bg-orange-300 text-stone-900', icon: Star },
} as const;

const SOURCE_META = {
  hire: { label: '聘请 TGO', desc: '行业意见领袖 · 特邀名家', icon: Handshake },
  own: { label: '老友记TGO', desc: '四季游金牌领队', icon: Building2 },
  partner: { label: '合作 TGO', desc: '合作伙伴资深领队', icon: Users },
} as const;

export const TgoChannelModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tgos, showToast } = useApp();
  const [tier, setTier] = useState<'all' | 'gold' | 'silver' | 'bronze'>('all');
  const [source, setSource] = useState<'all' | 'hire' | 'own' | 'partner'>('all');
  const [selected, setSelected] = useState<Tgo | null>(null);
  const [showApply, setShowApply] = useState(false);
  const avatars = useTgoAvatars();

  // 申请表单状态
  const [applyName, setApplyName] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyAge, setApplyAge] = useState('50-59岁');
  const [applySpecialty, setApplySpecialty] = useState('文博讲解');
  const [applySubmitting, setApplySubmitting] = useState(false);

  const list = useMemo(
    () =>
      tgos.filter(
        (t) => (tier === 'all' || t.tier === tier) && (source === 'all' || t.source === source)
      ),
    [tgos, tier, source]
  );

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyName.trim()) { showToast('请输入您的姓名'); return; }
    if (!/^1[3-9]\d{9}$/.test(applyPhone.trim())) { showToast('请输入有效的11位手机号码'); return; }
    setApplySubmitting(true);
    try {
      await submitTgoApply({
        name: applyName.trim(),
        phone: applyPhone.trim(),
        age: applyAge,
        specialty: [applySpecialty],
      });
      showToast('TGO 旅伴申请已提交！我们将在 2 个工作日内电话联系您');
      setShowApply(false);
      setApplyName('');
      setApplyPhone('');
    } catch {
      showToast('提交失败，请稍后重试');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden relative">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 z-10">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
            <span>TGO 旅伴 · 旅行金钥匙体系</span>
            <span className="text-[10px] font-sans text-stone-300 font-normal ml-1">
              ({tgos.length} 位认证管家)
            </span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* 频道简介 */}
          <div className="bg-gradient-to-r from-[#2C3E50] to-[#1a252f] rounded-3xl p-5 text-amber-50 border border-[#D4AF37]/30 shadow-sm">
            <div className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>旅行金钥匙 · 如侍父母</span>
            </div>
            <p className="text-[11px] text-stone-300 mt-1.5 leading-relaxed">
              TGO（Travel Golden Organizer）旅伴是专属于老友的长者同行管家：懂文化深度导赏、懂慢行防跌节奏、持有急救资格、单反摄影随行。分为金/银/铜三级考核，提供尊崇保障。
            </p>
          </div>

          {/* 分级筛选 */}
          <div className="flex gap-2">
            {([
              ['all', '全部级别'],
              ['gold', '金旅伴 (导师)'],
              ['silver', '银旅伴 (金牌)'],
              ['bronze', '铜旅伴 (认证)'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTier(id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tier === id
                    ? 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 来源分类 */}
          <div className="grid grid-cols-3 gap-2">
            {([
              ['all', '全部来源', Handshake],
              ['hire', '聘请名家 TGO', Handshake],
              ['own', '自有金牌 TGO', Building2],
              ['partner', '合作资深 TGO', Users],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setSource(id)}
                className={`py-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  source === id
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#85660d] font-bold shadow-xs'
                    : 'bg-white border-[#EAE6DF] text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>

          {/* 申请加入 TGO 入口 */}
          <button
            onClick={() => setShowApply(true)}
            className="w-full flex items-center justify-between gap-2 bg-white rounded-2xl p-3.5 text-[#2C3E50] border border-[#EAE6DF] hover:border-[#D4AF37] shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#2C3E50]/10 flex items-center justify-center text-[#2C3E50]">
                <UserPlus className="w-4 h-4 text-[#2C3E50]" />
              </span>
              <div className="text-left">
                <div className="text-xs font-bold text-[#2C3E50]">申请加入 TGO 旅伴大家庭</div>
                <div className="text-[10px] text-stone-500">具备文化、医护、摄影特长的退休老友或专业领队均可申请</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* TGO 卡片列表 */}
          <div className="space-y-3">
            {list.map((t) => {
              const tierMeta = TIER_META[t.tier] || TIER_META.bronze;
              const isInactive = t.status === 'inactive';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`bg-white rounded-2xl border p-4 transition-all hover:shadow-md cursor-pointer flex items-center justify-between gap-3 ${
                    isInactive ? 'border-stone-200 opacity-80' : 'border-[#EAE6DF] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={tgoAvatarUrl(avatars, t.id, t.avatar)}
                      alt={t.name}
                      className="w-13 h-13 rounded-full object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#2C3E50]">{t.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${tierMeta.cls}`}>
                          {tierMeta.label}
                        </span>
                        {isInactive && (
                          <span className="text-[9px] text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-md">未上架</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400">
                        <span>⭐ {t.rating ? t.rating.toFixed(1) : '5.0'}</span>
                        <span>·</span>
                        <span>带团 {t.trips || 10}+ 场</span>
                        <span>·</span>
                        <span>好评率 {t.praiseRate || 99}%</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EAE6DF] text-xs font-bold text-[#2C3E50] hover:bg-[#2C3E50] hover:text-[#D4AF37] transition-colors shrink-0">
                    查看档案
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 申请弹窗 */}
        {showApply && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#2C3E50] text-white">
              <h4 className="font-serif font-bold text-sm text-amber-50">申请加入老友记 TGO 旅伴</h4>
              <button onClick={() => setShowApply(false)} className="text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">您的姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={applyName}
                  onChange={(e) => setApplyName(e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">联系手机 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={applyPhone}
                  onChange={(e) => setApplyPhone(e.target.value)}
                  placeholder="11位手机号"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">年龄段</label>
                <select
                  value={applyAge}
                  onChange={(e) => setApplyAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                >
                  <option value="50-59岁">50-59 岁 (低龄活力长者)</option>
                  <option value="60-69岁">60-69 岁 (适老经验丰富)</option>
                  <option value="70岁以上">70 岁以上 (德高望重学者)</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">核心特长</label>
                <select
                  value={applySpecialty}
                  onChange={(e) => setApplySpecialty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                >
                  <option value="文博讲解">文博历史与古建精讲</option>
                  <option value="医疗急救">三甲退休医护 / 红十字急救员</option>
                  <option value="单反摄影">单反摄影随团跟拍</option>
                  <option value="棋牌赛事">掼蛋 / 桥牌国家级执裁</option>
                  <option value="茶道太极">茶道养生 / 八段锦功法</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={applySubmitting}
                className="w-full py-3 rounded-2xl bg-[#2C3E50] text-[#D4AF37] font-bold text-xs shadow-md mt-4 cursor-pointer"
              >
                {applySubmitting ? '正在提交...' : '提交加盟申请'}
              </button>
            </form>
          </div>
        )}

        {/* 详情弹窗 */}
        {selected && (
          <TgoDetailModal tgo={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
};
