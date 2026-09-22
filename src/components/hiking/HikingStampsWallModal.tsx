import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HikingStamp, HikingStampCategory } from '../../types';
import {
  X,
  Sparkles,
  Footprints,
  CheckCircle2,
  Lock,
  Compass,
  Award,
  Calendar,
  Filter,
  Users,
  Leaf,
} from 'lucide-react';

interface HikingStampsWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HikingStampsWallModal: React.FC<HikingStampsWallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { hikingStamps, unlockHikingStamp } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUnlocked, setFilterUnlocked] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedStamp, setSelectedStamp] = useState<HikingStamp | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: '全部印迹' },
    { id: 'route', label: '名山古道路线' },
    { id: 'difficulty', label: '里程难度' },
    { id: 'season', label: '四季节令' },
    { id: 'companion', label: '老友同袍' },
    { id: 'behavior', label: '山野品行' },
  ];

  const filteredStamps = hikingStamps.filter((stamp) => {
    if (selectedCategory !== 'all' && stamp.category !== selectedCategory) {
      return false;
    }
    if (filterUnlocked === 'unlocked' && !stamp.isUnlocked) return false;
    if (filterUnlocked === 'locked' && stamp.isUnlocked) return false;
    return true;
  });

  const totalUnlocked = hikingStamps.filter((s) => s.isUnlocked).length;

  const handleTestUnlock = (stamp: HikingStamp) => {
    unlockHikingStamp(stamp.id);
    setSelectedStamp({ ...stamp, isUnlocked: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#2C3E50] to-[#1E293B] px-5 py-4 text-white flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#FBF9F5]">老友记 · 徒步荣誉印迹墙</h3>
              <p className="text-xs text-stone-300">
                已点亮 <b className="text-[#D4AF37] font-semibold">{totalUnlocked}</b> 枚 / 共 {hikingStamps.length} 枚专属慢行印记
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

        {/* Filter bar */}
        <div className="bg-[#EFECE6] px-4 py-2.5 border-b border-[#E2DDD5] space-y-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#2C3E50] text-[#FBF9F5] shadow-xs'
                    : 'bg-white/70 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>印迹分类筛选：{filteredStamps.length} 枚</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterUnlocked('all')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  filterUnlocked === 'all' ? 'bg-[#D4AF37] text-stone-900 font-bold' : 'text-stone-600'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterUnlocked('unlocked')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  filterUnlocked === 'unlocked' ? 'bg-[#D4AF37] text-stone-900 font-bold' : 'text-stone-600'
                }`}
              >
                仅看已点亮
              </button>
              <button
                onClick={() => setFilterUnlocked('locked')}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  filterUnlocked === 'locked' ? 'bg-[#D4AF37] text-stone-900 font-bold' : 'text-stone-600'
                }`}
              >
                待解锁
              </button>
            </div>
          </div>
        </div>

        {/* Stamp Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredStamps.map((stamp) => (
              <div
                key={stamp.id}
                onClick={() => setSelectedStamp(stamp)}
                className={`relative p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer ${
                  stamp.isUnlocked
                    ? 'bg-white border-[#E2DDD5] shadow-xs hover:border-[#D4AF37] hover:shadow-md'
                    : 'bg-stone-100/80 border-dashed border-stone-300 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Stamp Icon / Seal */}
                <div className="relative my-2">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform ${
                      stamp.isUnlocked
                        ? 'bg-amber-50 text-amber-900 border-2 border-amber-300 shadow-inner rotate-[-3deg]'
                        : 'bg-stone-200 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {stamp.isUnlocked ? '🥾' : <Lock className="w-5 h-5 text-stone-400" />}
                  </div>

                  {stamp.isUnlocked && (
                    <div className="absolute -bottom-1 -right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white shadow-xs rotate-[12deg]">
                      <span className="text-[8px] font-serif font-black">印</span>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <h4 className="font-serif font-bold text-xs text-stone-800 line-clamp-1">
                    {stamp.name}
                  </h4>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {stamp.categoryName}
                  </span>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug">
                    {stamp.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 w-full flex items-center justify-between text-[10px]">
                  <span className="text-amber-700 font-medium">+{stamp.pointsBonus || 100} 积分</span>
                  {stamp.isUnlocked ? (
                    <span className="text-emerald-700 font-medium">已获得</span>
                  ) : (
                    <span className="text-stone-400">点按了解</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Stamp Detail Sub-drawer / Popup */}
        {selectedStamp && (
          <div className="p-4 bg-white border-t border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  selectedStamp.isUnlocked
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {selectedStamp.isUnlocked ? '🎖️' : '🔒'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">{selectedStamp.name}</h4>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {selectedStamp.categoryName}
                  </span>
                  {selectedStamp.isUnlocked ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      ✓ 已点亮盖印
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                      待挑战解锁
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">{selectedStamp.requirement || selectedStamp.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!selectedStamp.isUnlocked && (
                <button
                  onClick={() => handleTestUnlock(selectedStamp)}
                  className="flex-1 sm:flex-none text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>模拟点亮盖印</span>
                </button>
              )}
              <button
                onClick={() => setSelectedStamp(null)}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                收起
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#FAF8F5] px-5 py-3 border-t border-[#E2DDD5] flex items-center justify-between text-xs text-stone-500">
          <span>印迹将永久同步至您的《老友记徒步护照》与个人中心档案</span>
          <button
            onClick={onClose}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-1.5 rounded-xl font-medium cursor-pointer transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};
