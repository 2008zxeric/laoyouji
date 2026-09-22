import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HIKING_ACTIVITIES } from '../../data/hikingData';
import {
  X,
  MapPin,
  Mountain,
  Compass,
  Heart,
  Coffee,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HikingMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActivity?: (activityId: string) => void;
}

export const HikingMapModal: React.FC<HikingMapModalProps> = ({
  isOpen,
  onClose,
  onSelectActivity,
}) => {
  const { setSelectedActivity } = useApp();
  const [selectedPin, setSelectedPin] = useState<typeof HIKING_ACTIVITIES[0]>(HIKING_ACTIVITIES[0]);

  if (!isOpen) return null;

  const mapSpots = [
    {
      id: 'hk-1',
      title: '东钱湖·韩岭古村水岸步道',
      level: 'L1 起步者',
      lat: 29.76,
      lng: 121.68,
      xPercent: 62,
      yPercent: 55,
      isUnlocked: true,
      data: HIKING_ACTIVITIES[0],
    },
    {
      id: 'hk-2',
      title: '四明山·香榧古道',
      level: 'L1 行路者',
      lat: 29.82,
      lng: 121.15,
      xPercent: 48,
      yPercent: 46,
      isUnlocked: true,
      data: HIKING_ACTIVITIES[1],
    },
    {
      id: 'hk-3',
      title: '杭州·九溪烟树御道',
      level: 'L1 起步者',
      lat: 30.20,
      lng: 120.12,
      xPercent: 32,
      yPercent: 36,
      isUnlocked: true,
      data: HIKING_ACTIVITIES[2],
    },
    {
      id: 'hk-4',
      title: '徽杭古道·江南第一关',
      level: 'L2 翻山者',
      lat: 30.15,
      lng: 119.02,
      xPercent: 20,
      yPercent: 42,
      isUnlocked: false,
      data: HIKING_ACTIVITIES[3],
    },
    {
      id: 'hk-5',
      title: '黄山·齐云山丹霞古道',
      level: 'L2 翻山者',
      lat: 29.80,
      lng: 118.05,
      xPercent: 12,
      yPercent: 65,
      isUnlocked: false,
      data: HIKING_ACTIVITIES[4],
    },
  ];

  const handleOpenDetail = (act: typeof HIKING_ACTIVITIES[0]) => {
    setSelectedActivity(act);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] px-5 py-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#FBF9F5]">老友足迹 · 长三角与华东适老步道地图</h3>
              <p className="text-xs text-stone-300">
                科学标注路况、救护站分布、适老静音茶歇点与名师慢步打卡点
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#DCD6CA] bg-[#EAE6DF] shadow-inner">
            {/* Background Map Stylization */}
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#2C3E50 1px, #FAF8F5 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Left Compass Legend */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-xl border border-stone-200 shadow-xs text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-serif font-bold text-stone-800">
                <Mountain className="w-3.5 h-3.5 text-emerald-700" />
                <span>华东老友慢行网络</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 已点亮足迹
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 待探访路线
                </span>
              </div>
            </div>

            {/* Pins on Map */}
            {mapSpots.map((spot) => {
              const isSelected = selectedPin.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedPin(spot.data)}
                  style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-transform ${
                        isSelected
                          ? 'bg-[#D4AF37] text-stone-900 scale-125 ring-4 ring-[#D4AF37]/30'
                          : spot.isUnlocked
                          ? 'bg-emerald-700 text-white hover:scale-110'
                          : 'bg-[#2C3E50] text-stone-200 hover:scale-110'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div
                      className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-medium whitespace-nowrap shadow-xs transition-colors ${
                        isSelected
                          ? 'bg-stone-900 text-amber-300'
                          : 'bg-white/90 text-stone-800 border border-stone-200'
                      }`}
                    >
                      {spot.title.split('·')[0]}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Floating Safe Guarantee */}
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs text-[11px] text-emerald-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>全图步道均已通过适老坡度与救护车可及性实地测试</span>
            </div>
          </div>

          {/* Selected Pin Details Card */}
          {selectedPin && (
            <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-4 w-full">
                <img
                  src={selectedPin.cover}
                  alt={selectedPin.title}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-stone-200"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-amber-100 text-amber-900 font-serif px-2.5 py-0.5 rounded-full font-bold">
                      {selectedPin.hikingMeta?.stageRequiredName || 'L1 起步者'}
                    </span>
                    <span className="text-xs text-stone-500">{selectedPin.destination}</span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      里程 {selectedPin.hikingMeta?.distanceKm} km · 爬升 {selectedPin.hikingMeta?.elevationGainM} m
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900">
                    {selectedPin.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-1">
                    {selectedPin.subtitle}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-amber-700" />
                      {selectedPin.hikingMeta?.restIntervalMinutes || 25}分钟茶歇
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500" />
                      {selectedPin.hikingMeta?.paceCadence || '50步/分节奏'}
                    </span>
                    <span className="font-serif text-stone-800">
                      带队：{selectedPin.tgo?.name || '资深领队'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                <div className="text-left md:text-right">
                  <span className="text-xs text-stone-400">会员优享价</span>
                  <div className="text-lg font-bold text-amber-700 font-serif">
                    ¥{selectedPin.priceGroup}
                    <span className="text-xs text-stone-500 font-normal"> /位起</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDetail(selectedPin)}
                  className="bg-[#2C3E50] hover:bg-[#1E293B] text-[#FAF8F5] px-4 py-2 rounded-xl text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>查看路线详情</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] px-5 py-3 border-t border-[#E2DDD5] flex items-center justify-between text-xs text-stone-500">
          <span>完成任意路线线下慢行，即可在护照中点亮对应步道印迹</span>
          <button
            onClick={onClose}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-1.5 rounded-xl font-medium cursor-pointer transition-colors"
          >
            关闭地图
          </button>
        </div>
      </div>
    </div>
  );
};
