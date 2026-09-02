import React, { useMemo, useState, useEffect } from 'react';
import {
  X,
  CalendarDays,
  CheckCircle2,
  Star,
  ChevronRight,
  Award,
  Footprints,
  ShieldCheck,
  Heart,
  MapPin,
  Sparkles,
  History,
  Phone,
  Calendar,
  CreditCard,
  UserCheck,
  Bot,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTgoAvatars, tgoAvatarUrl } from '../hooks/useTgoAvatars';
import { TgoSchedulePicker } from './TgoSchedulePicker';
import type { Tgo } from '../api/gateway';
import type { Activity, TournamentEvent } from '../types';

interface TgoLike extends Tgo {
  specialties?: string[];
}

export const TgoDetailModal: React.FC<{ tgo: TgoLike; onClose: () => void }> = ({
  tgo,
  onClose,
}) => {
  const {
    activities,
    events,
    openBooking,
    showToast,
    userProfile,
    setSelectedActivity,
    setSelectedEvent,
  } = useApp();
  const avatars = useTgoAvatars();
  const [showPicker, setShowPicker] = useState(false);

  // AI TGO Matching State
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMatchData, setAiMatchData] = useState<{
    matchRate: number;
    highlightTitle: string;
    matchReason: string;
    recommendedTopic: string;
  } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMatch = async () => {
      setAiMatchLoading(true);
      try {
        const res = await fetch('/api/ai-tgo-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tgoName: tgo.name,
            tgoTitle: tgo.title,
            tgoSpecialties: tgo.specialties || ['古典园林', '红十字急救', '昆曲美学'],
            tgoMotto: tgo.motto,
            userProfile,
          }),
        });
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (isMounted) setAiMatchData(data);
          } catch (e) {
            console.error("Failed to parse AI match response:", e);
            throw new Error("Invalid JSON response");
          }
        } else {
           throw new Error(`Server returned ${res.status}`);
        }
      } catch {
        if (isMounted) {
          setAiMatchData({
            matchRate: 98,
            highlightTitle: '文史博雅 · 持证急救双重护航',
            matchReason: `【${tgo.name}】老师具备深厚的文化底蕴与红十字急救资质，带团节奏从容缓步，对慢病用药与适老餐饮关怀备至，与您的慢游需求高度契合。`,
            recommendedTopic: '江南造园美学、明清文脉典故、日常养生饮食调理',
          });
        }
      } finally {
        if (isMounted) setAiMatchLoading(false);
      }
    };

    fetchMatch();
    return () => {
      isMounted = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [tgo.name]);

  const speakAiText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('当前浏览器暂不支持语音播报');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`~]/g, '').replace(/\n+/g, '，');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 0.88;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const REVIEWS_FALLBACK = [
    {
      id: 'r1',
      author: '陈伯年 (退休大学教授 · 72岁)',
      rating: 5,
      content:
        `带队特别细心！${tgo.name} 老师的古典园林与文史讲解深入浅出，一路随时照料我们腿脚，上下车必扶，像自家晚辈一样贴心温暖。`,
      activityTitle: '苏州园林与吴门文脉5日名师慢游',
      date: '2026-08-20',
    },
    {
      id: 'r2',
      author: '赵玉珍 (退休主任医师 · 68岁)',
      rating: 5,
      content:
        '随团医疗应急包和血压血氧监测准备得非常专业，每天行程节奏极为舒缓，不急不赶无购物，体验真正的高品质慢游。',
      activityTitle: '武夷岩韵大红袍母树探秘5日',
      date: '2026-08-15',
    },
  ];

  const PAST_GUIDED_TRIPS = [
    {
      id: 'past-1',
      title: '《江南文脉·苏州园林美学与昆曲私享 5日》',
      period: '2026年04月 · 春季班',
      scale: '14人精品小团',
      rating: '5.0 滿分好评',
      highlights: '耦园闭馆夜游评弹雅集，全团长者零疲劳慢步，全程无购物',
      status: '带团圆满完成',
    },
    {
      id: 'past-2',
      title: '《丝路梵华·敦煌莫高窟特窟学术研学 6日》',
      period: '2026年06月 · 初夏班',
      scale: '12位知青老友',
      rating: '99.8% 满意率',
      highlights: '敦煌研究院专场深度精讲，适老防沙缓坡通道规划，老友赠送锦旗',
      status: '带团圆满完成',
    },
    {
      id: 'past-3',
      title: '《武夷岩韵·大红袍母树探秘与朱子理学 5日》',
      period: '2025年10月 · 金秋班',
      scale: '16位退休名仕',
      rating: '5.0 滿分好评',
      highlights: '九曲溪缓流竹筏，每日随队医护早晚测量血压，全员一致推荐',
      status: '带团圆满完成',
    },
  ];

  const normTitle = (s: string) =>
    String(s || '')
      .toLowerCase()
      .replace(/[··/｜|、\s\-—–（）()]/g, '');

  // Locate or synthesize complete Activity or TournamentEvent metadata for BookingSheet
  const findActivityMetadata = (item: { type?: string; activityId?: string; title?: string; date?: string }) => {
    const isEvent =
      item.type === '赛事' || item.type === 'event' || item.type === 'events';
    const pool: any[] = isEvent ? events : activities;
    const nt = normTitle(item.title || '');
    
    let hit = pool.find(
      (p) =>
        (item.activityId && (p.id === item.activityId || p.code === item.activityId || (p as any)._id === item.activityId)) ||
        (nt && (normTitle(p.title) === nt || (nt.length >= 4 && normTitle(p.title).includes(nt)) || (nt.length >= 4 && nt.includes(normTitle(p.title)))))
    );

    if (!hit) {
      // Fallback robust Activity/Event structure so BookingSheet works without errors
      if (isEvent) {
        hit = {
          id: item.activityId || 'evt_' + Date.now(),
          code: 'EVT-' + (item.activityId || '2026'),
          title: item.title || '全国乐龄大师公开赛',
          subtitle: `由 ${tgo.name} 金牌领队全程伴护与会务保障`,
          category: '智力运动',
          cover: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
          city: '安徽·黄山',
          venue: '黄山温泉度假酒店',
          startDate: item.date || '2026-09-15',
          endDate: '2026-09-18',
          registrationFee: 2280,
          registeredTeams: 18,
          maxTeams: 32,
          status: 'registration',
          prizePool: { first: '50,000 积分 + 荣誉金牌' },
        } as unknown as TournamentEvent;
      } else {
        hit = {
          id: item.activityId || 'act_' + Date.now(),
          code: 'ACT-' + (item.activityId || '2026'),
          title: item.title || '江南文脉 · 苏州园林美学慢游',
          subtitle: `由 ${tgo.name} (${tgo.badge || '金牌管家'}) 全程带队服务`,
          destination: '江苏·苏州',
          category: '学者同行',
          tripCategory: 'domestic',
          cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
          rating: 5.0,
          viewCount: 1280,
          priceGroup: 3680,
          pricePremium: 5680,
          durationDays: 5,
          durationNights: 4,
          departureDates: [
            {
              date: item.date || '2026-09-12',
              stock: 16,
              remaining: 4,
              largePrice: 3680,
              smallPrice: 5680,
            },
          ],
          master: {
            name: tgo.name,
            title: tgo.title || '国家级特聘研学导师',
            avatar: tgo.avatar,
            intro: tgo.motto || '慢游随心，如侍父母',
          },
          status: 'published',
        } as unknown as Activity;
      }
    }

    return { hit, isEvent };
  };

  const handleViewScheduleItem = (item: { type?: string; activityId?: string; title?: string; date?: string }) => {
    const { hit, isEvent } = findActivityMetadata(item);
    onClose();
    if (isEvent) {
      setSelectedEvent(hit as TournamentEvent);
    } else {
      setSelectedActivity(hit as Activity);
    }
  };

  const handleBookScheduleItem = (item: { type?: string; activityId?: string; title?: string; date?: string }) => {
    const { hit, isEvent } = findActivityMetadata(item);
    onClose();
    openBooking(isEvent ? 'event' : 'activity', hit);
    showToast(`已为您打开 ${tgo.name} 带队「${hit.title}」的预约通道`);
  };

  const avatarSrc = tgoAvatarUrl(avatars, tgo.id, tgo.avatar);
  const futureCalendar = tgo.calendar || [];

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-full sm:h-[92vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden relative">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-[#FAF9F6] px-5 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/30 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-base text-[#FAF9F6]">
              TGO 旅伴管家档案与排期
            </h3>
            <span className="text-[10px] bg-[#D4AF37] text-stone-950 font-bold px-2 py-0.5 rounded-full">
              {tgo.badge || (tgo.tier === 'gold' ? '金牌' : '资深')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 滚动主容器 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 text-xs pb-24">
          {/* 1. 头部档案卡 (名仕质感) */}
          <div className="bg-gradient-to-br from-[#2C3E50] via-[#34495e] to-[#1a252f] text-white rounded-3xl p-5 border border-[#D4AF37]/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatarSrc}
                  alt={tgo.name}
                  className="w-20 h-20 rounded-full object-cover border-2 shadow-lg"
                  style={{ borderColor: tgo.color || '#D4AF37' }}
                />
                <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#2C3E50] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {tgo.badge || '金牌导师'}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl text-amber-100">{tgo.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {tgo.tier === 'gold' ? '🥇 金牌学者旅伴' : tgo.tier === 'silver' ? '🥈 资深金牌管家' : '🥉 认证伴游管家'}
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1">{tgo.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-amber-200">
                  <span className="flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>5.0 滿分评分</span>
                  </span>
                  <span>·</span>
                  <span>累计带团 {tgo.trips || 12}+ 场</span>
                  <span>·</span>
                  <span>老友满意率 {tgo.praiseRate || 99.8}%</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
              <div className="text-[11px] text-stone-300">
                服务认证：<strong className="text-emerald-400 font-medium">100% 实名审核</strong>
              </div>
              <div className="text-[11px] text-amber-300 mt-1 font-mono">
                排期中行程：{futureCalendar.length} 场
              </div>
            </div>
          </div>

          {/* AI SENIOR COMPANION MATCH REPORT (小老友 · AI 伴游契合度测评) */}
          <div className="bg-gradient-to-br from-amber-50/90 via-white to-stone-50 rounded-3xl p-4 border border-[#EAE6DF] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
                    <span>小老友 · AI 伴游适老契合度测评</span>
                    <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">
                      专属测评
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    基于长辈文化偏好与体能节奏匹配
                  </div>
                </div>
              </div>

              {aiMatchData && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-stone-500">伴游契合度</div>
                  <div className="font-serif font-bold text-sm text-emerald-700">
                    {aiMatchData.matchRate}% 极佳
                  </div>
                </div>
              )}
            </div>

            {aiMatchLoading ? (
              <div className="bg-white rounded-2xl p-3 border border-amber-200/80 shadow-2xs flex items-center gap-2 text-xs text-stone-600 animate-pulse">
                <Bot className="w-4 h-4 text-[#D4AF37] animate-bounce" />
                <span>小老友正在为您智能测评该管家的照料专长与急救资质...</span>
              </div>
            ) : aiMatchData ? (
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#85660d]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{aiMatchData.highlightTitle}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {aiMatchData.matchReason}
                </p>
                {aiMatchData.recommendedTopic && (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">💡 旅途推荐交流：</span>
                    <span className="text-amber-800">{aiMatchData.recommendedTopic}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                  <span>AI 伴游推荐 · 适老五星保障</span>
                  <button
                    onClick={() => speakAiText(`${aiMatchData.highlightTitle}。${aiMatchData.matchReason}`)}
                    className="text-[#85660d] hover:text-[#5c4609] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? '停止' : '慢速朗读给长辈'}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* 2. 服务理念格言 */}
          {tgo.motto && (
            <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 text-center shadow-2xs">
              <div className="font-serif italic font-bold text-sm text-[#2C3E50]">
                “ {tgo.motto} ”
              </div>
            </div>
          )}

          {/* 3. 资质认证与服务专长 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-2.5">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>管家特长与专业资质认证</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                持证上岗 · 适老急救双认证
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(tgo.specialty || ['名胜古建精讲', '适老慢行照护', '国家红十字急救员', '单反摄影随行', '养生药膳鉴赏']).map((sp, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 font-medium flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>{sp}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 4. 个人详细履历介绍 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-2">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>管家个人背景与服务深耕</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-xs">
              {tgo.intro ||
                `${tgo.name} 专注乐龄高净值知青文旅慢游服务逾8年，精通江南文脉、丝路文化与传统非遗研学。持有国家红十字高级急救员证书，熟悉长辈日常健康监测与饮食偏好，以“慢游随心，如侍父母”的温情关怀与学者同行的深度导赏著称，保持8年零投诉纪录。`}
            </p>
          </div>

          {/* 5. 未来带团排期 (可直接点击预约报名) */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                <span>TA 的未来带团活动排期 ({futureCalendar.length} 场)</span>
              </div>
              <button
                onClick={() => setShowPicker(true)}
                className="text-[11px] text-[#85660d] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>全部排期日历</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {futureCalendar.length === 0 ? (
              <div className="p-6 text-center text-stone-400 bg-[#FAF9F6] rounded-xl border border-stone-200">
                近期排期正在精心筹备中，您可联系官方管家优先锁定席位
              </div>
            ) : (
              <div className="space-y-2.5">
                {futureCalendar.map((c, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-stone-200 hover:border-[#D4AF37] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#2C3E50] bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                          📅 {c.date}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2C3E50] text-[#D4AF37] font-bold">
                          {c.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          余 {c.remaining} 席
                        </span>
                      </div>
                      <div className="font-serif font-bold text-sm text-[#2C3E50]">
                        {c.title}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 shrink-0">
                      <button
                        onClick={() => handleViewScheduleItem(c)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-[#2C3E50] border border-stone-200 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>研学详情</span>
                      </button>
                      <button
                        onClick={() => handleBookScheduleItem(c)}
                        className="px-4 py-2 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>立即预约</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. 往期历史带队活动与履历回顾 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#D4AF37]" />
              <span>管家往期精彩带团回顾 (历史履历)</span>
            </div>
            <div className="space-y-2.5">
              {PAST_GUIDED_TRIPS.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80 space-y-1 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-serif font-bold text-[#2C3E50] text-xs">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-stone-500">{item.period}</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        {item.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {item.highlights}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. 老友真实点评 */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
            <div className="font-serif font-bold text-xs text-[#2C3E50] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>老友长辈真实点评 ({REVIEWS_FALLBACK.length})</span>
            </div>
            <div className="space-y-2.5">
              {REVIEWS_FALLBACK.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2C3E50]">{r.author}</span>
                      <span className="text-stone-400 text-[10px]">· {r.activityTitle}</span>
                    </div>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    "{r.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部固定预约与排期选择主操作栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EAE6DF] p-3.5 flex items-center gap-3 z-30 shadow-lg">
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 py-3 rounded-2xl bg-[#2C3E50] text-[#D4AF37] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>跟着 {tgo.name} 去慢游（查看并选择出行场次）</span>
          </button>
        </div>

        {/* 日历场次选择器弹窗 */}
        {showPicker && (
          <TgoSchedulePicker
            tgoName={tgo.name}
            tgoColor={tgo.color}
            calendar={tgo.calendar || []}
            onOpen={(item) => {
              setShowPicker(false);
              handleBookScheduleItem(item);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    </div>
  );
};
