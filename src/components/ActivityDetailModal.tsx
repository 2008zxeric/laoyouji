import React, { useState } from 'react';
import { Activity, GroupType } from '../types';
import { useApp } from '../context/AppContext';
import { DEFAULT_TGO_PROFILE, DEFAULT_FEE_EXCLUDES, DEFAULT_BOOKING_NOTICES } from '../data/mockData';
import {
  X,
  Heart,
  Share2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Footprints,
  ShieldCheck,
  Award,
  Sparkles,
  Bot,
  UserCheck,
  ChevronRight,
  ThumbsUp,
  Clock,
  Car,
  Phone,
  BadgeCheck,
  Camera,
  FileText,
  AlertCircle,
  Users,
  BedDouble,
  HeartHandshake,
  Stethoscope,
  Compass,
} from 'lucide-react';

interface ActivityDetailModalProps {
  activity: Activity;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
}) => {
  const { toggleFavorite, isFavorited, openPoster, openBooking, setActiveTab, openWriteReview } = useApp();
  const isFav = isFavorited(activity.id);

  // Group Type Selection (大团 vs 拼小团)
  const [selectedGroupType, setSelectedGroupType] = useState<GroupType>('small');
  // Selected Departure Date
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  // Active Tab within Detail Page
  const [detailTab, setDetailTab] = useState<'itinerary' | 'fees' | 'notices' | 'tgo_master' | 'reviews'>('itinerary');

  const currentDateObj = activity.departureDates[selectedDateIndex] || activity.departureDates[0];
  const displayPrice = selectedGroupType === 'large' ? currentDateObj.largePrice : currentDateObj.smallPrice;
  const currentGroupInfo = selectedGroupType === 'large' ? activity.group : activity.premium;

  const tgo = activity.tgo || DEFAULT_TGO_PROFILE;
  const feeExcludesList = activity.feeExcludes && activity.feeExcludes.length > 0 ? activity.feeExcludes : DEFAULT_FEE_EXCLUDES;
  const noticeList = activity.notice && activity.notice.length > 0 ? activity.notice : DEFAULT_BOOKING_NOTICES;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-center items-center p-0 sm:p-3 md:p-4 animate-fadeIn">
      {/* Modal Card with Fixed Top, Scrollable Middle, and Fixed Bottom Bar */}
      <div className="relative w-full max-w-2xl bg-white h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* 1. STICKY HEADER NAV BAR */}
        <div className="shrink-0 z-30 bg-white/98 backdrop-blur-md px-4 py-3 border-b border-[#EAE6DF] flex items-center justify-between shadow-2xs">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-transform active:scale-95 cursor-pointer"
            title="返回上一页"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="font-serif italic font-bold text-[#2C3E50] text-sm md:text-base truncate max-w-[200px] md:max-w-xs text-center">
            {activity.title}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openPoster(activity)}
              className="w-9 h-9 rounded-full bg-[#FAF9F6] hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-transform active:scale-95 border border-[#EAE6DF] cursor-pointer"
              title="生成老友海报"
            >
              <Share2 className="w-4 h-4 text-[#2C3E50]" />
            </button>
            <button
              onClick={() => toggleFavorite(activity.id)}
              className={`w-9 h-9 rounded-full bg-[#FAF9F6] hover:bg-stone-100 flex items-center justify-center transition-transform active:scale-95 border border-[#EAE6DF] cursor-pointer ${
                isFav ? 'text-rose-500' : 'text-stone-600'
              }`}
              title="收藏活动"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-stone-50/40">
          {/* Hero Gallery Banner */}
          <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
            <img
              src={activity.cover}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

            {/* Badges on hero */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-[#2C3E50] text-[#D4AF37] text-xs font-bold px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-xs">
                {activity.category}
              </span>
              <span className="bg-stone-900/80 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                {activity.durationDays}天{activity.durationNights}晚
              </span>
              <span className="bg-[#D4AF37] text-stone-950 text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                {activity.level}
              </span>
            </div>

            {/* Bottom Title on Hero */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 text-xs text-stone-200 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{activity.destination}</span>
                <span>·</span>
                <span>{activity.departureCity}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-serif italic font-bold leading-snug drop-shadow-md text-[#FAF9F6]">
                {activity.title}
              </h1>
              <p className="text-xs text-amber-100/90 mt-1 line-clamp-1">
                {activity.subtitle}
              </p>
            </div>
          </div>

          {/* Product Highlights Bar */}
          <div className="bg-[#FAF9F6] px-4 py-3 border-b border-[#EAE6DF] flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-1.5 text-[#2C3E50] font-medium">
              <Footprints className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span className="line-clamp-1">{activity.fitnessDesc}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 shrink-0">
              <span>浏览 {activity.viewCount.toLocaleString()}</span>
              <span>·</span>
              <span>评分 {activity.rating} ({activity.reviewsCount}条)</span>
            </div>
          </div>

          {/* Package Selector (大团体验 vs 拼小团·名仕精品团) */}
          <div className="p-4 bg-white border-b border-stone-100">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#2C3E50]" />
                <span>选择出游团型套餐</span>
              </span>
              <span className="text-[#85660d] font-normal">点击切换团型与起价</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Small Boutique Group */}
              <div
                onClick={() => setSelectedGroupType('small')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedGroupType === 'small'
                    ? 'border-[#D4AF37] bg-[#FAF9F6] shadow-sm ring-1 ring-[#D4AF37]/50'
                    : 'border-stone-200 bg-stone-50/70 hover:border-stone-300'
                }`}
              >
                {selectedGroupType === 'small' && (
                  <div className="absolute -top-2.5 right-3 bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    当前已选
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#2C3E50]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>拼小团 · 名仕精品团</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">{activity.premium.size}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{activity.premium.hotelType}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-[#D4AF37]/30 flex items-baseline gap-1">
                  <span className="text-xs text-red-600 font-bold">¥</span>
                  <span className="text-xl font-bold font-serif text-red-600">{currentDateObj.smallPrice}</span>
                  <span className="text-xs text-stone-500">/人</span>
                </div>
              </div>

              {/* Large Classic Group */}
              <div
                onClick={() => setSelectedGroupType('large')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedGroupType === 'large'
                    ? 'border-[#2C3E50] bg-[#FAF9F6] shadow-sm ring-1 ring-[#2C3E50]/40'
                    : 'border-stone-200 bg-stone-50/70 hover:border-stone-300'
                }`}
              >
                {selectedGroupType === 'large' && (
                  <div className="absolute -top-2.5 right-3 bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    当前已选
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#2C3E50]">
                    <Car className="w-3.5 h-3.5 text-[#2C3E50]" />
                    <span>大团体验 · 经典文化团</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">{activity.group.size}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{activity.group.hotelType}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 flex items-baseline gap-1">
                  <span className="text-xs text-red-600 font-bold">¥</span>
                  <span className="text-xl font-bold font-serif text-red-600">{currentDateObj.largePrice}</span>
                  <span className="text-xs text-stone-500">/人</span>
                </div>
              </div>
            </div>

            {/* Current Package Specs */}
            <div className="mt-3 bg-[#FAF9F6] rounded-xl p-3 text-xs text-stone-700 border border-[#EAE6DF] space-y-1">
              <div className="font-semibold text-[#2C3E50] mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>当前已选团型包含标准：</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {currentGroupInfo.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-stone-600">
                    <CheckCircle2 className="w-3 h-3 text-[#2C3E50] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Departure Dates Selector */}
          <div className="p-4 bg-white border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#2C3E50]" />
                <span>选择出发团期（实时余位）</span>
              </span>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-stone-400" />
                <span>单房差 ¥{currentDateObj.singleSupplement}/人</span>
              </span>
            </div>

            {/* Departure Rule Banner */}
            {activity.departureRule?.ruleSummary && (
              <div className="mb-3 px-3 py-2 bg-[#FAF9F6] rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#85660d] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8843E]" />
                  <span>发班规律：{activity.departureRule.ruleSummary}</span>
                </div>
                <span className="text-[11px] text-stone-500">
                  共 {activity.departureDates.length} 个可选排期
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activity.departureDates.map((d, index) => {
                const isSelected = selectedDateIndex === index;
                const price = selectedGroupType === 'large' ? d.largePrice : d.smallPrice;
                return (
                  <div
                    key={d.date}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                      isSelected
                        ? 'border-[#2C3E50] bg-[#2C3E50]/5 ring-2 ring-[#2C3E50]/30 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {d.tag && (
                      <span className="absolute -top-2 left-2 bg-[#2C3E50] text-[#D4AF37] text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#D4AF37]/40 shadow-2xs">
                        {d.tag}
                      </span>
                    )}
                    <div className="text-xs font-bold text-stone-900 mt-1">{d.date}</div>
                    <div className="text-xs font-serif font-bold text-red-600 mt-0.5">¥{price}</div>
                    <div className="text-[10px] text-[#85660d] bg-[#D4AF37]/15 rounded px-1.5 py-0.5 mt-1 inline-block border border-[#D4AF37]/30">
                      仅余 {d.remainingSlots} 位
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⭐ PROMINENT TRAVEL LEADER: TGO 领队管家介绍 (放在前面重要位置) */}
          <div className="p-4 bg-gradient-to-br from-[#FAF9F6] via-white to-[#F5F2EB] border-b border-[#EAE6DF]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#2C3E50]" />
                <span className="text-xs font-bold text-[#2C3E50] tracking-wide uppercase">
                  本行程专属 TGO 慢游管家 / 随团领队
                </span>
              </div>
              <span className="bg-[#2C3E50] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                1:8 适老贴心照护
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <img
                  src={tgo.avatar}
                  alt={tgo.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/70 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#2C3E50] text-[#D4AF37] p-1 rounded-full shadow-xs">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex-1 w-full text-left">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic font-bold text-[#2C3E50] text-base">
                      {tgo.name}
                    </span>
                    <span className="bg-[#FAF9F6] text-[#85660d] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                      {tgo.roleTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                    <span>★ {tgo.serviceRating}</span>
                    <span className="text-stone-400">|</span>
                    <span>带队 {tgo.tripsLed} 次</span>
                  </div>
                </div>

                <div className="text-xs text-stone-600 font-medium mt-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{tgo.badge}（{tgo.experienceYears}年适老带团资历）</span>
                </div>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tgo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-50 text-stone-700 text-[10px] px-2 py-0.5 rounded-md border border-stone-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#2C3E50]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                {/* Motto */}
                {tgo.motto && (
                  <div className="text-[11px] text-stone-500 italic mt-2 bg-[#FAF9F6] p-2 rounded-xl border border-[#EAE6DF]/70">
                    {tgo.motto}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Master / Lecturer Banner (文化名师) */}
          {activity.master && (
            <div className="p-4 bg-white border-b border-[#EAE6DF] flex items-start space-x-3.5">
              <img
                src={activity.master.avatar}
                alt={activity.master.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2C3E50]/30 shadow-2xs shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-bold text-[#2C3E50] text-sm md:text-base">
                    {activity.master.name}
                  </span>
                  <span className="bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    {activity.master.badge}
                  </span>
                </div>
                <div className="text-xs text-[#85660d] font-medium mt-0.5">
                  {activity.master.title}
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                  {activity.master.intro}
                </p>
              </div>
            </div>
          )}

          {/* Section Tabs (每日行程 / 费用包含与不含 / 报名须知与注意事项 / 领队与保障 / 真实老友评价) */}
          <div className="sticky top-0 z-20 bg-white border-b border-stone-200 flex text-xs md:text-sm font-semibold text-stone-600 shadow-2xs">
            <button
              onClick={() => setDetailTab('itinerary')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                detailTab === 'itinerary'
                  ? 'border-[#2C3E50] text-[#2C3E50] font-bold bg-[#FAF9F6]/60'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              每日行程
            </button>
            <button
              onClick={() => setDetailTab('fees')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                detailTab === 'fees'
                  ? 'border-[#2C3E50] text-[#2C3E50] font-bold bg-[#FAF9F6]/60'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              费用包含/不含
            </button>
            <button
              onClick={() => setDetailTab('notices')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                detailTab === 'notices'
                  ? 'border-[#2C3E50] text-[#2C3E50] font-bold bg-[#FAF9F6]/60'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              报名须知
            </button>
            <button
              onClick={() => setDetailTab('tgo_master')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                detailTab === 'tgo_master'
                  ? 'border-[#2C3E50] text-[#2C3E50] font-bold bg-[#FAF9F6]/60'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              适老保障
            </button>
            <button
              onClick={() => setDetailTab('reviews')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                detailTab === 'reviews'
                  ? 'border-[#2C3E50] text-[#2C3E50] font-bold bg-[#FAF9F6]/60'
                  : 'border-transparent hover:text-stone-900'
              }`}
            >
              评价({activity.reviewsCount})
            </button>
          </div>

          {/* TAB CONTENT SECTIONS */}
          <div className="p-4 space-y-6">

            {/* TAB 1: ITINERARY (每日慢步行程) */}
            {detailTab === 'itinerary' && (
              <div className="space-y-5">
                <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#EAE6DF] text-xs text-stone-700 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2C3E50]" />
                    <span>行程节奏：慢调细品 · 每日车程 ≤1.5小时</span>
                  </div>
                  <span className="text-[#85660d] font-semibold">适老平缓 · 无催促</span>
                </div>

                {activity.itinerary.map((day) => (
                  <div
                    key={day.day}
                    className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3 relative"
                  >
                    {/* Day Header Badge */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 h-8 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 font-serif font-bold text-sm flex items-center justify-center shadow-2xs">
                          D{day.day}
                        </span>
                        <div>
                          <h4 className="font-serif italic font-bold text-[#2C3E50] text-sm md:text-base">
                            {day.title}
                          </h4>
                          <div className="text-xs text-[#85660d] font-medium">{day.theme}</div>
                        </div>
                      </div>

                      <span className="bg-[#FAF9F6] text-[#2C3E50] text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#EAE6DF]">
                        👣 {day.stepsEstimated}
                      </span>
                    </div>

                    {/* Day Timeline */}
                    <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed pl-2 border-l-2 border-[#2C3E50]/20 ml-2">
                      <div>
                        <span className="font-bold text-[#2C3E50] bg-[#FAF9F6] border border-[#EAE6DF] px-1.5 py-0.5 rounded mr-1.5">
                          上午
                        </span>
                        <span>{day.morning}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#85660d] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-1.5 py-0.5 rounded mr-1.5">
                          下午
                        </span>
                        <span>{day.afternoon}</span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded mr-1.5">
                          晚间
                        </span>
                        <span>{day.evening}</span>
                      </div>
                    </div>

                    {/* Dining & Hotel Card */}
                    <div className="bg-[#FAF9F6] rounded-xl p-3 text-xs space-y-1.5 border border-[#EAE6DF]">
                      <div className="flex items-center text-stone-600 gap-1.5">
                        <span className="font-medium text-stone-800 shrink-0">🥢 膳食安排：</span>
                        <span className="text-stone-600 truncate">
                          早: {day.dining.breakfast} | 午: {day.dining.lunch} | 晚: {day.dining.dinner}
                        </span>
                      </div>
                      <div className="flex items-center text-stone-600 gap-1.5">
                        <span className="font-medium text-stone-800 shrink-0">🏨 甄选入住：</span>
                        <span className="text-[#2C3E50] font-semibold truncate">{day.hotel}</span>
                      </div>
                      {day.tips && (
                        <div className="text-[11px] text-[#85660d] bg-[#D4AF37]/10 rounded p-1.5 mt-1 border border-[#D4AF37]/20">
                          💡 贴心提醒：{day.tips}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: FEES (费用包含 / 费用不含) */}
            {detailTab === 'fees' && (
              <div className="space-y-6">
                {/* 费用包含 (Fee Includes) */}
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>费用包含（品质慢游·一价全包）</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      9大品质保障
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activity.feeIncludes.map((inc, i) => (
                      <div key={i} className="flex items-start text-xs space-x-2.5 p-2 rounded-xl bg-stone-50/70 border border-stone-100">
                        <span className="bg-[#2C3E50] text-[#D4AF37] font-bold px-2 py-0.5 rounded shrink-0 shadow-2xs">
                          {inc.category}
                        </span>
                        <span className="text-stone-700 leading-relaxed flex-1">{inc.detail}</span>
                      </div>
                    ))}

                    {/* TGO Leader Service Inclusion */}
                    <div className="flex items-start text-xs space-x-2.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60">
                      <span className="bg-amber-700 text-white font-bold px-2 py-0.5 rounded shrink-0 shadow-2xs">
                        管家服务
                      </span>
                      <span className="text-stone-700 leading-relaxed flex-1">
                        四季游专职金牌 TGO 慢游管家全程陪伴，随团摄影旅拍、血压监测、行前提醒与行程起居照料。
                      </span>
                    </div>
                  </div>
                </div>

                {/* 费用不含 (Fee Excludes) */}
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span>费用不含（透明公开·无隐形消费）</span>
                    </div>
                    <span className="text-[11px] text-rose-700 bg-rose-50 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                      0 隐形消费承诺
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {feeExcludesList.map((exc, i) => (
                      <div key={i} className="flex items-start text-xs text-stone-700 space-x-2.5 p-2 rounded-xl bg-stone-50/50 border border-stone-100">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed flex-1">{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 退改保障承诺卡片 */}
                <div className="bg-gradient-to-br from-[#FAF9F6] to-[#F5F2EB] rounded-2xl p-4 border border-[#D4AF37]/30 text-xs text-stone-700 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#2C3E50]">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>四季游安心退改保障承诺</span>
                  </div>
                  <p className="leading-relaxed text-stone-600">
                    出发前 7 天（含）以上申请取消，平台承诺 100% 全额原路退还；若因突发急性疾病无法出行（出具二级甲等以上医院证明），平台全额免除退订手续费。
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: BOOKING NOTICES & PRECAUTIONS (报名须知及注意事项) */}
            {detailTab === 'notices' && (
              <div className="space-y-6">
                {/* 报名须知核心条款 */}
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                      <FileText className="w-5 h-5 text-[#2C3E50]" />
                      <span>报名须知与适老说明</span>
                    </div>
                    <span className="text-[11px] text-stone-500">旅游合同法定条款</span>
                  </div>

                  <div className="space-y-3">
                    {noticeList.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-stone-700 p-2.5 rounded-xl bg-stone-50/70 border border-stone-100 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-[#2C3E50] text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {i + 1}
                        </span>
                        <span className="flex-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 行前物品准备与注意事项 (Packing Tips) */}
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2C3E50] text-sm md:text-base border-b border-stone-100 pb-2">
                    <AlertCircle className="w-4 h-4 text-[#85660d]" />
                    <span>行前贴心准备建议与注意事项</span>
                  </div>
                  <div className="space-y-2 text-xs text-stone-700">
                    {activity.packingTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50/60">
                        <span className="text-[#D4AF37] font-bold text-sm leading-none">•</span>
                        <span className="leading-relaxed flex-1">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 优待证件退费说明 */}
                <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] text-xs text-stone-600 space-y-2">
                  <h5 className="font-bold text-[#2C3E50] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>老年优待证与门票退差说明</span>
                  </h5>
                  <p className="leading-relaxed">
                    持有老年优待证、军官证、残疾证等有效证件的长者，如景区产生门票免票或半价优惠，TGO 领队将在行程最后一天按旅行社团队采购折扣差价现退还给您。
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: TGO & MASTER & SENIOR HEALTH CARE (适老保障与领队师资) */}
            {detailTab === 'tgo_master' && (
              <div className="space-y-6">
                {/* TGO Leader Profile Detailed Card */}
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                      <Compass className="w-5 h-5 text-[#2C3E50]" />
                      <span>专属 TGO 领队管家档案</span>
                    </div>
                    <span className="text-[11px] text-[#85660d] bg-amber-50 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      金牌慢游管家
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-xl bg-stone-50/60 border border-stone-100">
                    <img
                      src={tgo.avatar}
                      alt={tgo.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]/70 shadow-xs shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-base">{tgo.name}</span>
                        <span className="bg-[#2C3E50] text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {tgo.roleTitle}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        {tgo.badge} · 累计带队 {tgo.tripsLed} 次 · 评分 {tgo.serviceRating}
                      </div>
                      {tgo.motto && (
                        <div className="text-[11px] text-stone-500 italic mt-1.5">
                          {tgo.motto}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] text-center">
                      <div className="text-stone-500 text-[11px]">随团服务热线</div>
                      <div className="font-bold text-[#2C3E50] mt-0.5">{tgo.phone || '400-880-9966'}</div>
                    </div>
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] text-center">
                      <div className="text-stone-500 text-[11px]">照护比例</div>
                      <div className="font-bold text-emerald-700 mt-0.5">1:8 专属贴身服务</div>
                    </div>
                  </div>
                </div>

                {/* Medical & Packing Guarantee */}
                <div className="bg-gradient-to-br from-[#2C3E50]/5 to-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/30 space-y-3">
                  <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                    <ShieldCheck className="w-5 h-5 text-[#2C3E50]" />
                    <span>老友专属适老健康护航体系</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    每团均配备持证随团医护人员，携带便携式 AED 除颤仪、指夹式血氧仪、电子血压计与常用急救外用药箱。每日早晚提供免费血压血氧测量记录，让您与家人倍感踏实。
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-stone-200">
                      <Stethoscope className="w-4 h-4 text-red-600 shrink-0" />
                      <span>早晚例行血压/血氧健康检测</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-stone-200">
                      <Camera className="w-4 h-4 text-[#2C3E50] shrink-0" />
                      <span>随团单反摄影赠精装老友相册</span>
                    </div>
                  </div>
                </div>

                {/* Master profile if present */}
                {activity.master && (
                  <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
                    <div className="flex items-center gap-2 font-serif font-bold text-[#2C3E50] text-sm md:text-base border-b border-stone-100 pb-2">
                      <Award className="w-4 h-4 text-[#D4AF37]" />
                      <span>随团研学文化名师</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src={activity.master.avatar}
                        alt={activity.master.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-stone-900 text-sm">{activity.master.name}</div>
                        <div className="text-[#85660d] font-medium">{activity.master.title}</div>
                        <p className="text-stone-600 mt-1 leading-relaxed">{activity.master.intro}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: REVIEWS (真实老友评价) */}
            {detailTab === 'reviews' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-2xl font-serif italic font-bold text-[#2C3E50] flex items-baseline gap-1">
                      <span>{activity.rating}</span>
                      <span className="text-xs text-stone-400 font-sans">/ 5.0 满分</span>
                    </div>
                    <div className="text-xs text-[#85660d] font-medium">99% 老友出游后推荐给好友</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-stone-500 bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#EAE6DF] text-center hidden sm:block">
                      累计出行评价
                      <div className="font-bold text-[#2C3E50]">{activity.reviewsCount} 条真切心声</div>
                    </div>
                    <button
                      onClick={() => openWriteReview(activity)}
                      className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>写点评赚100分</span>
                    </button>
                  </div>
                </div>

                {activity.reviews && activity.reviews.length > 0 ? (
                  activity.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#2C3E50]">{rev.author}</span>
                              <span className="bg-[#D4AF37]/20 text-[#85660d] border border-[#D4AF37]/40 text-[10px] px-1.5 py-0.2 rounded font-medium">
                                {rev.memberLevel}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-400">{rev.date} 出游点评</div>
                          </div>
                        </div>

                        <div className="flex text-[#D4AF37] text-xs">
                          {'★'.repeat(rev.rating)}
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-stone-700 leading-relaxed">{rev.content}</p>

                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2">
                          {rev.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="review photo"
                              className="w-20 h-20 rounded-xl object-cover border border-stone-200"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end text-xs text-stone-500 space-x-1">
                        <button className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>点赞 ({rev.likes})</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-[#EAE6DF] text-center space-y-2">
                    <div className="text-3xl">🌸</div>
                    <div className="text-sm font-bold text-stone-700">全新精品慢游路线</div>
                    <div className="text-xs text-stone-500">
                      本线路已通过四季游五星适老研学标准认证，欢迎首批老友报名体验！
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. ⭐ GUARANTEED FIXED BOTTOM ACTION BAR (永远固定在最下方，不再悬浮在中间) */}
        <div className="shrink-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#EAE6DF] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            {/* Left AI / Consult buttons */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('ai');
                }}
                className="flex flex-col items-center text-stone-600 hover:text-[#2C3E50] text-[11px] cursor-pointer"
                title="AI伴游管家答疑"
              >
                <Bot className="w-5 h-5 text-[#2C3E50]" />
                <span className="mt-0.5 font-medium">管家答疑</span>
              </button>
              <button
                onClick={() => toggleFavorite(activity.id)}
                className="flex flex-col items-center text-stone-600 hover:text-rose-500 text-[11px] cursor-pointer"
                title="收藏"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span className="mt-0.5">{isFav ? '已收藏' : '收藏'}</span>
              </button>
            </div>

            {/* Price Preview & Instant Booking Button */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-stone-500">
                  已选：{selectedGroupType === 'small' ? '名仕精品小团' : '经典文化大团'}
                </div>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-xs text-red-600 font-bold">¥</span>
                  <span className="text-2xl font-bold font-serif text-red-600">{displayPrice}</span>
                  <span className="text-xs text-stone-500">/人</span>
                </div>
              </div>

              <button
                onClick={() => {
                  openBooking('activity', {
                    ...activity,
                    priceGroup: currentDateObj.largePrice,
                    pricePremium: currentDateObj.smallPrice,
                  });
                }}
                className="bg-[#2C3E50] hover:bg-[#1a252f] text-amber-100 px-6 py-3 rounded-2xl font-bold text-sm md:text-base shadow-md transition-all active:scale-95 flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer"
              >
                <span>立即预订</span>
                <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
