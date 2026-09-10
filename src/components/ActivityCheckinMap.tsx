import React, { useState, useMemo } from 'react';
import { Activity, CheckinSpot } from '../types';
import { useApp } from '../context/AppContext';
import { MOCK_ACTIVITY_CHECKIN_SPOTS } from '../data/mockData';
import {
  MapPin,
  CheckCircle2,
  Sparkles,
  Award,
  Footprints,
  Clock,
  Compass,
  Navigation,
  Camera,
  Share2,
  Heart,
  ChevronRight,
  Info,
  Calendar,
  ShieldCheck,
  Flame,
  Check,
  AlertCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityCheckinMapProps {
  activity: Activity;
  onCheckinSuccess?: (spot: CheckinSpot) => void;
}

export const ActivityCheckinMap: React.FC<ActivityCheckinMapProps> = ({
  activity,
  onCheckinSuccess,
}) => {
  const {
    userProfile,
    activityCheckins,
    doActivitySpotCheckin,
    isSpotCheckedIn,
    showToast,
  } = useApp();

  // Get checkin spots for this activity, or generate from activity itinerary if not explicitly preset
  const spots: CheckinSpot[] = useMemo(() => {
    const matched = MOCK_ACTIVITY_CHECKIN_SPOTS.filter((s) => s.activityId === activity.id);
    if (matched.length > 0) return matched;

    // Fallback: automatically construct meaningful check-in spots from activity itinerary
    if (activity.itinerary && activity.itinerary.length > 0) {
      return activity.itinerary.map((item, idx) => {
        // Base center roughly in destination (e.g. Suzhou, Xi'an, Wuyi, etc.)
        const baseLat = 31.30 + idx * 0.04;
        const baseLng = 120.61 + idx * 0.03;
        const stampNames = ['姑苏文脉雅仕印', '盛唐长安博雅印', '岩茶问道静心印', '巴蜀青城养生印', '金秋摄影名仕印'];
        return {
          id: `spot-${activity.id}-${idx + 1}`,
          activityId: activity.id,
          day: item.day,
          name: item.title.split('·')[0].trim() || `第${item.day}天文化研学点`,
          theme: item.theme || item.title,
          locationName: `${activity.destination.split('·')[0]} · ${item.title.split('·')[0].trim()}`,
          address: `${activity.destination}研学示范区`,
          lat: baseLat,
          lng: baseLng,
          category: (idx % 2 === 0 ? 'heritage' : 'museum') as CheckinSpot['category'],
          categoryLabel: idx % 2 === 0 ? '文脉古迹' : '非遗博览',
          icon: idx % 2 === 0 ? '🏛️' : '🏮',
          rewardPoints: 50,
          culturalQuote: `“漫步${item.title.split('·')[0].trim()}，寻绎文人雅韵，品味岁月静好。”`,
          seniorTip: item.tips || '步道平缓舒适，备有休息茶歇与医护随行包。',
          stampBadge: stampNames[idx % stampNames.length],
          photoUrl: activity.cover,
        };
      });
    }

    // Default single spot
    return [
      {
        id: `spot-${activity.id}-1`,
        activityId: activity.id,
        day: 1,
        name: `${activity.destination} · 研学启程站`,
        theme: '文化开营 · 线下相聚',
        locationName: activity.destination,
        address: `${activity.destination}文化研学接待中心`,
        lat: 31.31,
        lng: 120.62,
        category: 'heritage',
        categoryLabel: '研学启程',
        icon: '🏛️',
        rewardPoints: 50,
        culturalQuote: '“读万卷书，行万里路；同好知己，乐在其中。”',
        seniorTip: '专属头等舱大巴接驳，适老缓步无阶梯。',
        stampBadge: '乐龄研学第一印',
        photoUrl: activity.cover,
      },
    ];
  }, [activity]);

  // Selected spot on the map
  const [selectedSpotId, setSelectedSpotId] = useState<string>(spots[0]?.id || '');
  // Custom reflection input
  const [reflectionInput, setReflectionInput] = useState<string>('');
  // Checkin modal or confirming state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState<boolean>(false);
  // Simulating live GPS location coordinates
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userCoord, setUserCoord] = useState<{ lat: number; lng: number } | null>(null);

  const activeSpot = spots.find((s) => s.id === selectedSpotId) || spots[0];
  const checkedInCount = spots.filter((s) => isSpotCheckedIn(s.id)).length;
  const isAllCompleted = checkedInCount === spots.length && spots.length > 0;

  // Simulate locating
  const handleLocateMe = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      if (activeSpot) {
        // Offset very close to current active spot to simulate senior is on-site
        setUserCoord({
          lat: activeSpot.lat + (Math.random() - 0.5) * 0.002,
          lng: activeSpot.lng + (Math.random() - 0.5) * 0.002,
        });
        showToast(`📍 GPS 定位已校准！距离「${activeSpot.name}」约 35 米，满足打卡要求`);
      }
    }, 600);
  };

  // Perform Checkin
  const handleConfirmCheckin = () => {
    if (!activeSpot) return;
    const res = doActivitySpotCheckin(activeSpot, activity.title, reflectionInput);
    if (res.success) {
      setIsCheckinModalOpen(false);
      setReflectionInput('');
      if (onCheckinSuccess) {
        onCheckinSuccess(activeSpot);
      }
    }
  };

  // Calculate coordinates bounds for svg map visualization
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    let minLt = 999;
    let maxLt = -999;
    let minLg = 999;
    let maxLg = -999;
    spots.forEach((s) => {
      if (s.lat < minLt) minLt = s.lat;
      if (s.lat > maxLt) maxLt = s.lat;
      if (s.lng < minLg) minLg = s.lng;
      if (s.lng > maxLg) maxLg = s.lng;
    });
    // Add margin
    const latSpan = Math.max(maxLt - minLt, 0.06);
    const lngSpan = Math.max(maxLg - minLg, 0.06);
    return {
      minLat: minLt - latSpan * 0.25,
      maxLat: maxLt + latSpan * 0.25,
      minLng: minLg - lngSpan * 0.25,
      maxLng: maxLg + lngSpan * 0.25,
    };
  }, [spots]);

  // Map projection helpers to percentage within SVG 600x380 view
  const projectPoint = (lat: number, lng: number) => {
    const width = 600;
    const height = 360;
    const paddingX = 60;
    const paddingY = 50;

    const x = paddingX + ((lng - minLng) / (maxLng - minLng || 1)) * (width - paddingX * 2);
    // Invert Y because latitude goes north
    const y = height - paddingY - ((lat - minLat) / (maxLat - minLat || 1)) * (height - paddingY * 2);
    return { x, y };
  };

  const projectedSpots = useMemo(() => {
    return spots.map((s) => {
      const pos = projectPoint(s.lat, s.lng);
      return {
        ...s,
        svgX: pos.x,
        svgY: pos.y,
        isChecked: isSpotCheckedIn(s.id),
      };
    });
  }, [spots, minLat, maxLat, minLng, maxLng, activityCheckins]);

  // Path polyline connecting spots in chronological order
  const pathD = useMemo(() => {
    if (projectedSpots.length <= 1) return '';
    return projectedSpots
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.svgX} ${p.svgY}`)
      .join(' ');
  }, [projectedSpots]);

  return (
    <div className="space-y-4">
      {/* 1. Header Card: Title, Progress Bar, & Elder Guidance */}
      <div className="bg-gradient-to-r from-[#FAF8F5] via-white to-amber-50/40 rounded-3xl p-4 sm:p-5 border border-[#D4AF37]/40 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold shadow-2xs">
                <MapPin className="w-4 h-4 text-amber-300" />
              </span>
              <div>
                <h3 className="font-serif italic font-bold text-base md:text-lg text-[#2C3E50] flex items-center gap-2">
                  <span>线下研学签到打卡地图</span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-sans font-bold px-2 py-0.5 rounded-full">
                    定点认证 · 点亮印章
                  </span>
                </h3>
              </div>
            </div>
            <p className="text-xs text-stone-600 ml-10">
              与名师同行慢游，抵达指定研学地标即可感应定点打卡，积攒【研学印章】与专属文旅积分。
            </p>
          </div>

          {/* Progress & Stats Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-white px-3.5 py-2 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="text-right">
              <div className="text-[11px] text-stone-500 font-medium">打卡收集进度</div>
              <div className="text-sm font-serif font-bold text-[#2C3E50]">
                {checkedInCount} / {spots.length} 站
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D4AF37]">
              {isAllCompleted ? (
                <Award className="w-5 h-5 text-amber-600 animate-bounce" />
              ) : (
                <Footprints className="w-5 h-5 text-[#85660d]" />
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="mt-3 pt-3 border-t border-stone-200/70 flex items-center gap-3">
          <div className="flex-1 bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#D4AF37] to-amber-500 h-full rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${(checkedInCount / (spots.length || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-900 shrink-0">
            {Math.round((checkedInCount / (spots.length || 1)) * 100)}% 完成
          </span>
          {isAllCompleted && (
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-300">
              <Check className="w-3 h-3" />
              已荣获全套研学纪念勋章
            </span>
          )}
        </div>
      </div>

      {/* 2. Interactive Graphical Map Canvas */}
      <div className="relative bg-[#F9F7F2] rounded-3xl border border-[#E6E1D8] shadow-sm overflow-hidden p-3 sm:p-4">
        {/* Top Overlay Controls: GPS Calibrate & Map Legend */}
        <div className="flex items-center justify-between gap-2 mb-2 z-10 relative">
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-stone-200">
            <Compass className="w-3.5 h-3.5 text-[#2C3E50]" />
            <span className="font-medium text-[11px]">
              {activity.destination}研学全境 · 点击点位可定点打卡
            </span>
          </div>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 text-[#2C3E50] border border-stone-200 hover:border-[#D4AF37] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            title="模拟现场卫星 GPS 定位"
          >
            <Navigation
              className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`}
            />
            <span>{isLocating ? '定位校验中...' : '校准当前定位'}</span>
          </button>
        </div>

        {/* SVG Map Projection Area */}
        <div className="relative w-full h-[280px] sm:h-[340px] bg-gradient-to-b from-[#F2EFE9] to-[#EBE5DA] rounded-2xl border border-stone-200/80 overflow-hidden">
          {/* Subtle Aesthetic Map Grid & Topographic lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2C3E50" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
          </svg>

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 600 360"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Route connecting line glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Gradient for route path */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2C3E50" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#C5A028" />
              </linearGradient>
            </defs>

            {/* Connecting Route Line (Dashed & Solid) */}
            {pathD && (
              <>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="6"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Simulated Live User Position (if calibrated) */}
            {userCoord && (
              (() => {
                const uPos = projectPoint(userCoord.lat, userCoord.lng);
                return (
                  <g transform={`translate(${uPos.x}, ${uPos.y})`}>
                    <circle r="16" fill="#3B82F6" fillOpacity="0.2" className="animate-ping" />
                    <circle r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" />
                    <text
                      y="-12"
                      textAnchor="middle"
                      className="fill-blue-900 font-bold text-[10px]"
                    >
                      您当前位置
                    </text>
                  </g>
                );
              })()
            )}

            {/* Map Waypoints / Checkin Spots */}
            {projectedSpots.map((spot) => {
              const isSelected = spot.id === selectedSpotId;
              const isDone = spot.isChecked;

              return (
                <g
                  key={spot.id}
                  transform={`translate(${spot.svgX}, ${spot.svgY})`}
                  onClick={() => setSelectedSpotId(spot.id)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    r={isSelected ? '15' : '13'}
                    fill={isDone ? '#059669' : isSelected ? '#2C3E50' : '#FAF9F6'}
                    stroke={isDone ? '#10B981' : isSelected ? '#D4AF37' : '#B8B2A7'}
                    strokeWidth={isSelected ? '3' : '2'}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                  />

                  {/* Icon / Status inside */}
                  {isDone ? (
                    <text
                      y="4"
                      textAnchor="middle"
                      className="fill-white font-bold text-[11px]"
                    >
                      ✓
                    </text>
                  ) : (
                    <text
                      y="4"
                      textAnchor="middle"
                      className={`font-bold text-[10px] ${
                        isSelected ? 'fill-amber-300' : 'fill-[#2C3E50]'
                      }`}
                    >
                      D{spot.day}
                    </text>
                  )}

                  {/* Point Label Pill */}
                  <g transform="translate(0, 24)">
                    <rect
                      x="-55"
                      y="-11"
                      width="110"
                      height="18"
                      rx="9"
                      fill={isSelected ? '#2C3E50' : '#FFFFFF'}
                      fillOpacity="0.95"
                      stroke={isSelected ? '#D4AF37' : '#E0DBD3'}
                      strokeWidth="1"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.08))"
                    />
                    <text
                      y="2"
                      textAnchor="middle"
                      className={`text-[9.5px] font-bold ${
                        isSelected ? 'fill-amber-200' : 'fill-[#2C3E50]'
                      }`}
                    >
                      {spot.name.length > 7 ? `${spot.name.slice(0, 7)}...` : spot.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Bottom Floating Tip on Map */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-stone-600 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200/80">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>绿色：已打卡点亮</span>
              <span className="w-2 h-2 rounded-full bg-[#2C3E50] ml-2"></span>
              <span>深色：当前选定打卡点</span>
            </span>
            <span className="text-amber-800 font-bold hidden sm:inline">
              每站签到赠送 50~60 积分
            </span>
          </div>
        </div>
      </div>

      {/* 3. Selected Spot Detail & Action Box */}
      {activeSpot && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
            {/* Spot identity */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#2C3E50] text-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  第 {activeSpot.day} 天
                </span>
                <span className="bg-stone-100 text-stone-700 text-xs font-medium px-2 py-0.5 rounded-md border border-stone-200">
                  {activeSpot.categoryLabel}
                </span>
                {isSpotCheckedIn(activeSpot.id) ? (
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    已打卡点亮
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    待签到打卡
                  </span>
                )}
              </div>

              <h4 className="font-serif font-bold text-base md:text-lg text-[#2C3E50]">
                {activeSpot.name}
              </h4>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span>{activeSpot.address}</span>
              </p>
            </div>

            {/* Stamp Badge Preview */}
            <div className="flex items-center gap-2.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-2.5 self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-white flex items-center justify-center font-serif text-lg font-bold shadow-2xs border border-amber-300/50">
                印
              </div>
              <div>
                <div className="text-[10px] text-amber-800 font-medium">专属打卡纪念章</div>
                <div className="text-xs font-serif font-bold text-[#2C3E50]">
                  {activeSpot.stampBadge}
                </div>
                <div className="text-[10px] text-amber-700 font-bold">
                  +{activeSpot.rewardPoints} 积分
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Quote & Senior Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#FAF9F6] rounded-2xl p-3 border border-stone-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-[#85660d] font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>研学文化寄语</span>
              </div>
              <p className="text-stone-700 leading-relaxed italic font-serif">
                {activeSpot.culturalQuote}
              </p>
            </div>

            <div className="bg-emerald-50/40 rounded-2xl p-3 border border-emerald-200/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>乐龄慢行与无障碍提示</span>
              </div>
              <p className="text-stone-700 leading-relaxed">
                {activeSpot.seniorTip}
              </p>
            </div>
          </div>

          {/* Checkin Action or Already Checked details */}
          {isSpotCheckedIn(activeSpot.id) ? (
            (() => {
              const record = activityCheckins.find((r) => r.spotId === activeSpot.id);
              return (
                <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">
                        您已于 {record?.timestamp || '近期'} 成功打卡本站
                      </div>
                      <p className="text-emerald-800 text-[11px] mt-0.5 line-clamp-1">
                        随笔感言：{record?.reflection || activeSpot.culturalQuote}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="bg-white text-emerald-800 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl">
                      已得 +{record?.pointsEarned || activeSpot.rewardPoints} 积分
                    </span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-xs text-stone-500">
                到站后点击打卡，记录您的慢游学术研学足迹
              </span>

              <button
                onClick={() => setIsCheckinModalOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#c29e2e] hover:to-[#b38f20] text-stone-950 font-bold text-sm px-6 py-2.5 rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>立即定点签到打卡</span>
                <span className="text-xs bg-black/15 text-stone-950 px-1.5 py-0.5 rounded font-mono">
                  +{activeSpot.rewardPoints}分
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. Checkin Action Confirmation Modal */}
      {isCheckinModalOpen && activeSpot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 border border-amber-200 shadow-2xl space-y-4 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-[#D4AF37] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2C3E50]">
                    研学定点签到打卡
                  </h4>
                  <p className="text-[11px] text-stone-500">线下活动现场认证</p>
                </div>
              </div>

              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Spot Preview Card */}
            <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-[#2C3E50] text-amber-200 font-bold px-2 py-0.5 rounded">
                    第 {activeSpot.day} 天 · {activeSpot.categoryLabel}
                  </span>
                  <div className="font-serif font-bold text-base text-[#2C3E50] mt-1">
                    {activeSpot.name}
                  </div>
                  <div className="text-xs text-stone-500">{activeSpot.address}</div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    +{activeSpot.rewardPoints} 积分
                  </span>
                  <div className="text-[10px] text-stone-400 mt-1">
                    解锁【{activeSpot.stampBadge}】
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>现场 GPS 地理经纬度校验已就绪 · TGO 领队随时盖章认证</span>
              </div>
            </div>

            {/* Reflection / Senior thought input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>老友随笔感言（选填）：</span>
                <span className="text-[11px] text-stone-400 font-normal">记录游学所见所感</span>
              </label>
              <textarea
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder={activeSpot.culturalQuote || '例如：初冬暖阳，听钱教授解读园林理水之妙，令人心旷神怡...'}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-[#2C3E50] focus:bg-white resize-none"
              />
            </div>

            {/* Confirmation CTA */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckinModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                稍后再打
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckin}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#c29e2e] hover:to-[#b38f20] text-stone-950 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                确认打卡并领积分
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Historical Checkin Stamp Collection Card for this activity */}
      <div className="bg-[#FAF9F6] rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="font-serif font-bold text-sm text-[#2C3E50]">
              本行程已点亮研学印章册
            </h4>
          </div>
          <span className="text-xs text-stone-500">
            已集齐 <strong className="text-[#85660d]">{checkedInCount}</strong> / {spots.length} 枚
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {spots.map((spot) => {
            const isDone = isSpotCheckedIn(spot.id);
            return (
              <div
                key={spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isDone
                    ? 'bg-white border-[#D4AF37]/60 shadow-xs ring-1 ring-[#D4AF37]/30'
                    : 'bg-stone-100/70 border-stone-200/60 opacity-60 hover:opacity-80'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-serif text-lg font-bold border ${
                    isDone
                      ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-2xs'
                      : 'bg-stone-200 text-stone-400 border-stone-300'
                  }`}
                >
                  {isDone ? '印' : '未'}
                </div>
                <div className="mt-2 font-serif font-bold text-xs text-[#2C3E50] truncate">
                  {spot.stampBadge}
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5">
                  D{spot.day} · {spot.name.split('·')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
