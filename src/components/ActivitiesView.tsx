import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityCard } from './ActivityCard';
import { ActivityCalendarView } from './ActivityCalendarView';
import { ActivityApplyModal } from './ActivityApplyModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Sparkles,
  MapPin,
  Footprints,
  Calendar,
  FilePlus,
  Building2,
  LayoutGrid,
  CalendarDays,
  Flame,
  X,
} from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const { activities, setIsCheckinOpen, setIsPointsMallOpen, isCareMode } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' | '2026-08' | '2026-09' | '2026-10' | '2026-11'
  const [viewLayout, setViewLayout] = useState<'cards' | 'calendar'>('cards');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'rating'>('recommended');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const months = [
    { id: 'all', label: '全部月份', badge: '' },
    { id: '2026-08', label: '8月 (本月)', badge: '本月出游', season: '盛夏清凉' },
    { id: '2026-09', label: '9月 (下月)', badge: '火热报名', season: '初秋金桂' },
    { id: '2026-10', label: '10月', badge: '金秋国庆', season: '赏秋品蟹' },
    { id: '2026-11', label: '11月', badge: '暖冬康养', season: '银杏温泉' },
  ];

  const categories = [
    { id: 'all', label: '全部主题' },
    { id: '学者同行', label: '名师学者同行' },
    { id: '慢游雅居', label: '园林雅居慢游' },
    { id: '茶道文博', label: '茶道文博品鉴' },
    { id: '康养山海', label: '山海康养旅居' },
  ];

  const destinations = ['all', '苏州', '敦煌', '武夷山', '青岛', '大理', '潮汕'];

  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = act.title.toLowerCase().includes(q);
          const matchDest = act.destination.toLowerCase().includes(q);
          const matchMaster = act.master?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchDest && !matchMaster) return false;
        }

        // Month Filter
        if (selectedMonth !== 'all') {
          const hasDepartureInMonth = act.departureDates?.some((dep) =>
            dep.date.startsWith(selectedMonth)
          );
          if (!hasDepartureInMonth) return false;
        }

        // Category
        if (selectedCategory !== 'all' && act.category !== selectedCategory) {
          return false;
        }

        // Destination
        if (selectedDestination !== 'all' && !act.destination.includes(selectedDestination)) {
          return false;
        }

        // Group Filter
        if (selectedGroupFilter === 'small' && !act.premium) return false;
        if (selectedGroupFilter === 'large' && !act.group) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') {
          return a.priceGroup - b.priceGroup;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return b.viewCount - a.viewCount;
      });
  }, [
    activities,
    searchQuery,
    selectedMonth,
    selectedCategory,
    selectedDestination,
    selectedGroupFilter,
    sortBy,
  ]);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Hero Banner with Featured Master Tour in Artistic Flair Navy & Gold */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-[#2C3E50] border border-[#EAE6DF]">
        <img
          src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
          alt="Banner"
          className="w-full h-48 md:h-64 object-cover opacity-65 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] via-[#2C3E50]/70 to-transparent"></div>

        <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <span className="bg-[#D4AF37] text-stone-950 text-xs font-bold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              金秋特选 · 慢调雅集
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCheckinOpen(true)}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-amber-200 text-xs px-2.5 py-1 rounded-full border border-[#D4AF37]/30 transition-colors"
              >
                每日签到 +50分
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-serif italic font-semibold text-xl md:text-2xl text-[#FAF9F6] leading-tight">
              读万卷书 · 行万里路 · 遇知音同伴
            </h2>
            <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-lg leading-relaxed">
              专为50-75岁知识分子定制：名师随团讲学，平缓慢步不催促，三餐精细无隐形消费。
            </p>
          </div>
        </div>
      </div>

      {/* Month Filter Bar (乐龄月份快捷筛选器) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EAE6DF] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50]">
              按出游月份筛选 (快速定位本月与下月活动)
            </span>
          </div>

          {/* View Mode Switcher (列表模式 vs 日历排期) */}
          <div className="flex items-center bg-[#F1F3F5] p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-white text-[#2C3E50] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>图文列表</span>
            </button>
            <button
              onClick={() => setViewLayout('calendar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewLayout === 'calendar'
                  ? 'bg-[#2C3E50] text-[#D4AF37] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>日历排期</span>
            </button>
          </div>
        </div>

        {/* Month Selector Pills with Elder-friendly Large Touch Targets */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {months.map((m) => {
            const isSelected = selectedMonth === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMonth(m.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#2C3E50] text-amber-100 border-[#2C3E50] shadow-xs ring-2 ring-[#D4AF37]/50'
                    : 'bg-[#FAF9F6] text-stone-700 border-[#EAE6DF] hover:border-[#D4AF37]'
                }`}
              >
                <span>{m.label}</span>
                {m.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#D4AF37] text-stone-950'
                        : m.id === '2026-09'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Month Alert Banner */}
        {selectedMonth !== 'all' && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-[#85660d] bg-[#FAF9F6] px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B8843E]" />
              <span>
                正在浏览{' '}
                <strong>
                  {months.find((m) => m.id === selectedMonth)?.label}
                </strong>{' '}
                发班的研学路线（共找到 {filteredActivities.length} 条）
              </span>
            </span>
            <button
              onClick={() => setSelectedMonth('all')}
              className="text-stone-500 hover:text-stone-800 flex items-center gap-0.5 text-[11px] font-bold"
            >
              <X className="w-3 h-3" />
              <span>查看全部月份</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Category Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索目的地、名师学者或慢游主题 (如：苏州、敦煌、昆曲...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-stone-200 text-xs md:text-sm focus:outline-none focus:border-[#2C3E50] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              清空
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#2C3E50] text-[#D4AF37] font-bold shadow-2xs'
                  : 'bg-[#F1F3F5] text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sub-Filters (Destinations & Sort) */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
          {/* Destination Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            {destinations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDestination(d)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedDestination === d
                    ? 'text-[#2C3E50] font-bold bg-[#FAF9F6] border border-[#2C3E50]/20'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {d === 'all' ? '全部城市' : d}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F8F9FA] border border-stone-200 rounded px-2 py-0.5 text-xs text-stone-700 focus:outline-none"
            >
              <option value="recommended">综合推荐</option>
              <option value="priceAsc">价格从低到高</option>
              <option value="rating">同伴评分最高</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area: Switch between Calendar and Card List */}
      {viewLayout === 'calendar' ? (
        <ActivityCalendarView
          activities={filteredActivities}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
      ) : (
        /* Card Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              共找到 <strong className="text-[#2C3E50]">{filteredActivities.length}</strong> 条慢游路线
            </span>
            <span className="text-[#2C3E50] font-medium flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#D4AF37]" />
              全线配备随团医护与慢调步速
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-3">
              <Compass className="w-12 h-12 text-stone-300 mx-auto" />
              <div className="text-stone-600 font-medium">暂无匹配的慢游路线</div>
              <p className="text-xs text-stone-400">您可以尝试清空搜索词或切换月份/主题</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMonth('all');
                  setSelectedCategory('all');
                  setSelectedDestination('all');
                }}
                className="bg-[#2C3E50] text-amber-100 text-xs px-4 py-2 rounded-xl font-semibold"
              >
                重置全部筛选条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 合作办学 / 我要发布活动申请入口卡片 */}
      <div className="bg-gradient-to-r from-[#2C3E50] to-[#1A252F] rounded-3xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#D4AF37]/30 mt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#FAF9F6]">
              名家名师 · 协会高校 · 合作定制慢游
            </h4>
          </div>
          <p className="text-xs text-stone-300">
            面向学者大家、退休协会、校友会及专业文博机构，开放联合研发与活动发布审核通道
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#bfa030] text-stone-950 rounded-2xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>提交活动发布合作</span>
        </button>
      </div>

      {/* 合作办学/活动发布申请弹窗 */}
      {isApplyModalOpen && (
        <ActivityApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
};
