import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { HIKING_STAGES, HIKING_ACTIVITIES } from '../../data/hikingData';
import { Activity } from '../../types';
import { HikingPassportModal } from './HikingPassportModal';
import { HikingStampsWallModal } from './HikingStampsWallModal';
import { HikingMapModal } from './HikingMapModal';
import {
  Compass,
  Footprints,
  Mountain,
  Heart,
  Shield,
  Coffee,
  Sparkles,
  Award,
  ChevronRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Users,
  MapPin,
  ExternalLink,
  Search,
  BookOpen,
  Package,
  Layers,
  Leaf,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HikingChannelView: React.FC = () => {
  const {
    activities,
    setSelectedActivity,
    openBooking,
    userProfile,
    userHikingProfile,
    hikingStamps,
    applyPhysicalPassport,
    setActivitySubChannel,
    showToast,
  } = useApp();

  const [selectedStageTab, setSelectedStageTab] = useState<number | 'all'>('all');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isStampsWallOpen, setIsStampsWallOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeStageDetail, setActiveStageDetail] = useState<number>(userHikingProfile.currentStage);

  // Extract all hiking activities from activities list or fallback to HIKING_ACTIVITIES
  const allHikingList: Activity[] = useMemo(() => {
    const list = activities.filter((a) => a.isHiking || a.category === '徒步');
    return list.length > 0 ? list : HIKING_ACTIVITIES;
  }, [activities]);

  const destinations = ['all', '宁波', '余姚/四明山', '杭州', '徽州/绩溪', '黄山/休宁', '温州/雁荡山'];

  // Filtered hiking routes
  const filteredHikingActivities = useMemo(() => {
    return allHikingList.filter((act) => {
      // Stage filter
      if (selectedStageTab !== 'all' && act.hikingMeta?.stageRequired !== selectedStageTab) {
        return false;
      }
      // Destination filter
      if (selectedDestinationFilter !== 'all' && !act.destination.includes(selectedDestinationFilter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchSubtitle = act.subtitle.toLowerCase().includes(q);
        const matchDest = act.destination.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchDest) return false;
      }
      return true;
    });
  }, [allHikingList, selectedStageTab, selectedDestinationFilter, searchQuery]);

  const currentStageInfo = HIKING_STAGES.find((s) => s.stage === userHikingProfile.currentStage) || HIKING_STAGES[0];
  const nextStageInfo = HIKING_STAGES.find((s) => s.stage === userHikingProfile.currentStage + 1);

  const handleBooking = (act: Activity) => {
    // Elder caution check if required stage is higher than user's stage
    if (act.hikingMeta && act.hikingMeta.stageRequired && act.hikingMeta.stageRequired > userHikingProfile.currentStage) {
      showToast(
        `温馨提示：该路线适合【${act.hikingMeta.stageRequiredName || '进阶'}】长者。我们已为您开通适老健康测评通道，伴游管家将全程关照。`
      );
    }
    openBooking('activity', act);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Sub-channel Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#1E293B] via-[#243342] to-[#1E293B] text-white">
        {/* Subtle patterned overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              'radial-gradient(#D4AF37 1.5px, transparent 1.5px), radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative p-6 sm:p-8 lg:p-10 z-10">
          {/* Back button to all activities */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActivitySubChannel('all')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-serif transition-colors cursor-pointer border border-white/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回全部文旅慢游</span>
            </button>

            <span className="text-[11px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 rounded-full font-serif">
              老友记官方 · 乐龄健步专线
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-inner">
                <Footprints className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide text-[#FBF9F5]">
                  老友徒步 · 银发慢行，丈量山海
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-serif mt-1">
                  适老五段位进阶 · 50步/分节奏控速 · 25分钟软椅茶歇 · 德国避震双杖免费配发
                </p>
              </div>
            </div>
          </div>

          {/* Quick interactive buttons row */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPassportOpen(true)}
              className="bg-[#D4AF37] hover:bg-[#C29D26] text-stone-900 px-4 py-2.5 rounded-xl font-serif font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 text-stone-900" />
              <span>翻开我的《乐龄徒步护照》</span>
            </button>

            <button
              onClick={() => setIsStampsWallOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-stone-100 border border-white/20 px-4 py-2.5 rounded-xl font-serif font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>荣誉印迹墙 ({hikingStamps.filter((s) => s.isUnlocked).length}枚)</span>
            </button>

            <button
              onClick={() => setIsMapModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-stone-100 border border-white/20 px-4 py-2.5 rounded-xl font-serif font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>老友足迹全景地图</span>
            </button>

            <button
              onClick={applyPhysicalPassport}
              className="bg-white/10 hover:bg-white/20 text-stone-100 border border-white/20 px-4 py-2.5 rounded-xl font-serif font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-300" />
              <span>
                {userHikingProfile.physicalPassportApplied ? '✓ 实体护照已申领' : '免费申领实体烫金护照'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Senior Care 5-Fold Health & Safety Guarantee Bar */}
      <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DDD5] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-stone-200/70 pb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h3 className="font-serif font-bold text-sm text-stone-900">
              老友记 · 适老化科学徒步五大安心保障
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 hidden sm:inline-block">
            让每一位长者走得安心、走得舒服、走得有体面
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-stone-900">1. 50步/分科学控速</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                专业领队压步带队，平稳微汗不喘，严禁快步与超车。
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-stone-900">2. 25分钟适老茶歇</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                行进间随身携带便携轻便软椅，配备热饮罗汉果茶与润喉生津汤。
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-stone-900">3. 德国避震双杖免借</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                免费配备 LEKI 双手杖与减压护膝，减轻膝关节30%承重。
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 flex flex-col justify-between">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-stone-900">4. 随团急救护士+AED</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                红十字应急救护员伴游，配备便携式AED与属地三甲医院绿色通道。
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/70 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-stone-900">5. 单反旅拍跟拍冲印</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                随团摄影师跟拍老友山野欢笑，免费精修冲印装裱寄送长者府上。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User Hiking Growth Card (My Stage & Progression) */}
      <div className="bg-gradient-to-r from-amber-50/90 via-white to-stone-50 p-6 rounded-3xl border border-[#D4AF37]/50 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: User badge & info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/60 shadow-sm"
              />
              <div className="absolute -bottom-2 -right-1 w-6 h-6 rounded-full bg-[#D4AF37] text-stone-900 font-bold text-[10px] flex items-center justify-center shadow-xs">
                L{userHikingProfile.currentStage}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-stone-900">{userProfile.name} 的徒步档案</h3>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-serif font-bold border border-amber-300">
                  第{userHikingProfile.currentStage}段 · {currentStageInfo.name}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {currentStageInfo.targetTrailType} · 护照号：<span className="font-mono text-stone-700">{userHikingProfile.passportNumber}</span>
              </p>
            </div>
          </div>

          {/* Middle: Stats grid */}
          <div className="grid grid-cols-4 gap-4 py-2 px-4 bg-white/80 rounded-2xl border border-stone-200/70 text-center w-full lg:w-auto">
            <div>
              <span className="text-[11px] text-stone-400 block">累计慢行</span>
              <span className="font-serif font-bold text-base text-stone-800">{userHikingProfile.totalDistanceKm}</span>
              <span className="text-[10px] text-stone-500"> km</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">累计爬升</span>
              <span className="font-serif font-bold text-base text-stone-800">{userHikingProfile.totalElevationM}</span>
              <span className="text-[10px] text-stone-500"> m</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">完赛路线</span>
              <span className="font-serif font-bold text-base text-stone-800">{userHikingProfile.completedTripsCount}</span>
              <span className="text-[10px] text-stone-500"> 条</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block">点亮印迹</span>
              <span className="font-serif font-bold text-base text-amber-700">{userHikingProfile.unlockedStampIds.length}</span>
              <span className="text-[10px] text-stone-500"> 枚</span>
            </div>
          </div>

          {/* Right: Next Stage Promotion Hint */}
          <div className="w-full lg:w-72 bg-white/90 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">下一段位晋升：</span>
              <span className="font-serif font-bold text-[#2C3E50]">
                {nextStageInfo ? `第${nextStageInfo.stage}段 · ${nextStageInfo.name}` : '已登顶最高段位'}
              </span>
            </div>

            {nextStageInfo && (
              <>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (userHikingProfile.unlockedStampIds.length / nextStageInfo.requiredStampsCount) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  目标：需集满 {nextStageInfo.requiredStampsCount} 枚印记 ({nextStageInfo.requiredCondition})
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Five-Stage Ladder Interactive Showcase */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-emerald-700" />
              <h3 className="font-serif font-bold text-lg text-stone-900">
                老友徒步 · 银发五段位进阶体系
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              由中华老年保健协会健步专业指导，从平缓亲水绿道逐步过渡至山野避暑漫游
            </p>
          </div>
          <span className="text-xs text-[#D4AF37] font-medium font-serif bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            段位永久有效 · 每一阶皆有专属礼遇
          </span>
        </div>

        {/* Stage selection tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {HIKING_STAGES.map((stg) => {
            const isUserCurrent = userHikingProfile.currentStage === stg.stage;
            const isSelected = activeStageDetail === stg.stage;
            return (
              <button
                key={stg.stage}
                onClick={() => setActiveStageDetail(stg.stage)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-md scale-[1.02]'
                    : 'bg-[#FAF8F5] text-stone-800 border-stone-200 hover:border-[#D4AF37]'
                }`}
              >
                {isUserCurrent && (
                  <span className="absolute top-2 right-2 text-[9px] bg-[#D4AF37] text-stone-900 font-bold px-1.5 py-0.5 rounded-full">
                    当前
                  </span>
                )}
                <div className="text-[10px] font-mono tracking-wider opacity-70">
                  {stg.difficultyLevel}
                </div>
                <div className="font-serif font-bold text-sm mt-0.5">
                  第{stg.stage}段 · {stg.name}
                </div>
                <div className="text-[11px] opacity-80 mt-1 line-clamp-1">
                  {stg.targetTrailType}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed view of currently inspected stage */}
        {(() => {
          const detail = HIKING_STAGES.find((s) => s.stage === activeStageDetail) || HIKING_STAGES[0];
          return (
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#D4AF37] text-stone-900 font-serif font-bold px-2 py-0.5 rounded-full">
                      {detail.difficultyLevel}
                    </span>
                    <h4 className="font-serif font-bold text-base text-stone-900">
                      第{detail.stage}段 · 【{detail.name}】核心标准
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    {detail.description}
                  </p>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-600 shrink-0">
                  <span className="text-stone-400">所需印记：</span>
                  <b className="text-stone-800 font-bold font-serif">{detail.requiredStampsCount} 枚</b>
                  <span className="mx-2 text-stone-300">|</span>
                  <span className="text-stone-400">硬性要求：</span>
                  <b className="text-emerald-700">{detail.requiredCondition}</b>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-200/70">
                {/* Privileges */}
                <div>
                  <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>该段位专属老友礼遇权益：</span>
                  </span>
                  <ul className="space-y-1.5">
                    {detail.privileges.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Elder caution */}
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-serif">
                    <Heart className="w-3.5 h-3.5 text-amber-700" />
                    <span>适老化健康出行指导：</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    该段位对应心肺负荷平稳，出发前请确保随身服药稳定；我们已在沿途设置适老静音茶歇点与红十字救护员定点巡视。
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 5. Hiking Routes Explorer (The Catalog) */}
      <div className="space-y-4">
        {/* Section title & filter tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              <span>精选适老徒步路线库</span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-sans font-normal">
                共 {filteredHikingActivities.length} 条专线
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              全线经适老化实地复测，杜绝危险绝壁与陡峭石阶，配齐双杖与急救
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索古道、目的地或领队..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Filter bars: By Stage & By Destination */}
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
          {/* Stage filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-stone-500 whitespace-nowrap">段位筛选：</span>
            <button
              onClick={() => setSelectedStageTab('all')}
              className={`px-3 py-1 rounded-xl text-xs font-serif transition-colors cursor-pointer ${
                selectedStageTab === 'all'
                  ? 'bg-[#2C3E50] text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              全部
            </button>
            {HIKING_STAGES.map((s) => (
              <button
                key={s.stage}
                onClick={() => setSelectedStageTab(s.stage)}
                className={`px-3 py-1 rounded-xl text-xs font-serif transition-colors cursor-pointer whitespace-nowrap ${
                  selectedStageTab === s.stage
                    ? 'bg-[#2C3E50] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                }`}
              >
                第{s.stage}段 · {s.name}
              </button>
            ))}
          </div>

          {/* Destination filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-stone-500 whitespace-nowrap">地区：</span>
            {destinations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDestinationFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  selectedDestinationFilter === d
                    ? 'bg-[#D4AF37] text-stone-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {d === 'all' ? '全部' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Hiking Activities Grid */}
        {filteredHikingActivities.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
            <Footprints className="w-12 h-12 text-stone-300 mx-auto" />
            <h4 className="font-serif font-bold text-stone-700">暂无符合条件的徒步专线</h4>
            <p className="text-xs text-stone-400">请尝试调整段位或目的地筛选条件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHikingActivities.map((act) => {
              const meta = act.hikingMeta;
              return (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
                >
                  {/* Top Cover */}
                  <div className="relative aspect-16/10 overflow-hidden">
                    <img
                      src={act.cover}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Stage & Destination Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-[#1E293B]/85 backdrop-blur-xs text-[#D4AF37] text-[11px] font-serif font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs">
                        {meta?.stageRequiredName || '适老徒步'}
                      </span>
                      <span className="bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-medium px-2 py-0.5 rounded-full shadow-xs">
                        {act.destination}
                      </span>
                    </div>

                    {/* Associated Stamp Tag */}
                    {meta?.associatedStampName && (
                      <div className="absolute bottom-3 right-3 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-serif px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <span>🎖️ 完赛盖章: {meta.associatedStampName}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                        {act.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {act.subtitle}
                      </p>

                      {/* Technical Specs: 里程、爬升、路况、步频 */}
                      <div className="grid grid-cols-2 gap-2 mt-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-100 text-xs">
                        <div>
                          <span className="text-stone-400 text-[10px] block">慢行距离 / 爬升</span>
                          <span className="font-serif font-bold text-stone-800">
                            {meta?.distanceKm || 4.5} km · ↑{meta?.elevationGainM || 50} m
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 text-[10px] block">路况地貌</span>
                          <span className="font-medium text-stone-800 line-clamp-1">
                            {meta?.trailType || '平缓青石/木栈道'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 text-[10px] block">步频节奏控制</span>
                          <span className="font-medium text-emerald-700">
                            {meta?.paceCadence || '50步/分慢步'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 text-[10px] block">适老茶歇间隔</span>
                          <span className="font-medium text-amber-700">
                            每 {meta?.restIntervalMinutes || 25} 分钟一次
                          </span>
                        </div>
                      </div>

                      {/* Guide & Medical tags */}
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>领队: {act.tgo?.name || '资深TGO管家'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Shield className="w-3.5 h-3.5" />
                          <span>随团红十字急救员</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Price & Action */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400">会员尊享价</span>
                        <div className="text-lg font-bold font-serif text-amber-700">
                          ¥{act.priceGroup}
                          <span className="text-xs text-stone-500 font-normal"> /位</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedActivity(act)}
                          className="px-3 py-2 text-xs rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => handleBooking(act)}
                          className="px-4 py-2 text-xs rounded-xl bg-[#2C3E50] hover:bg-[#1E293B] text-white font-serif font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                        >
                          一键报名
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Scientific Walking Guide & Elder Gear Box */}
      <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E2DDD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-serif font-bold text-base text-stone-900">
              老友记 · 适老科学健步知识库
            </h4>
          </div>
          <span className="text-xs text-stone-500">科学慢行，越走越年轻</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/70 space-y-1.5">
            <h5 className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <span>🥢 双手杖使用黄金守则</span>
            </h5>
            <p className="text-stone-500 leading-relaxed">
              行走时肘关节呈90度角，杖尖落于脚后跟外侧15-20厘米，手臂与脚步同频自然摆动，下坡时手杖先于身体落地，分担膝关节冲击。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/70 space-y-1.5">
            <h5 className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <span>💧 少量多次补水法</span>
            </h5>
            <p className="text-stone-500 leading-relaxed">
              慢行中每15-20分钟补充50-100毫升温水，管家随团备有金银花温茶与罗汉果汤，切忌大口饮用冰凉饮品，保持口腔湿润即可。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/70 space-y-1.5">
            <h5 className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
              <span>👣 脚跟过渡至前掌步态</span>
            </h5>
            <p className="text-stone-500 leading-relaxed">
              足跟着地，平稳过渡至足弓外侧，再由大脚趾蹬离地面。步幅不宜过大，保持在平时步幅的70%-80%，以小步高频换取极致稳定。
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <HikingPassportModal isOpen={isPassportOpen} onClose={() => setIsPassportOpen(false)} />
      <HikingStampsWallModal isOpen={isStampsWallOpen} onClose={() => setIsStampsWallOpen(false)} />
      <HikingMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
    </div>
  );
};
