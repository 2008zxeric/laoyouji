import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { EventCard } from './EventCard';
import { Trophy, Award, Calendar, Sparkles, Filter, ShieldCheck, Flame } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, setIsMembershipModalOpen } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '全部赛事' },
    { id: '智力掼蛋', label: '🀄 乐龄掼蛋大师赛' },
    { id: '竞技桥牌', label: '♠️ 名仕桥牌邀请赛' },
    { id: '摄影大赛', label: '📷 金秋山海摄影大赛' },
    { id: '太极养生', label: '🧘 太极养生名家汇' },
  ];

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Tournament Spotlight Gold Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-[#2C3E50] via-[#34495e] to-[#1a252f] border border-[#D4AF37]/30 text-amber-50">
        <div className="p-5 md:p-6 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="bg-[#D4AF37] text-stone-950 text-xs font-bold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 border border-[#D4AF37]/40">
              <Trophy className="w-3.5 h-3.5 text-stone-950" />
              乐龄全国锦标体系
            </span>

            <button
              onClick={() => setIsMembershipModalOpen(true)}
              className="bg-white/15 hover:bg-white/25 text-amber-200 text-xs px-2.5 py-1 rounded-full border border-[#D4AF37]/40 backdrop-blur-md transition-colors"
            >
              名仕参赛直通权益
            </button>
          </div>

          <div>
            <h2 className="font-serif italic font-semibold text-xl md:text-2xl text-[#FAF9F6] leading-tight">
              智汇桑榆 · 牌逢知己 · 赛出风采
            </h2>
            <p className="text-xs md:text-sm text-stone-200 mt-1 max-w-lg leading-relaxed">
              以棋牌雅会老友，以山水颐养身心。国家级裁判执裁，五星国宾温泉酒店承办，全额奖金积分双重荣耀。
            </p>
          </div>

          {/* Quick Stat Bar */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-[#D4AF37]/25 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-gray-300">益智积分礼遇</div>
              <div className="font-serif font-bold text-[#D4AF37] text-sm md:text-base">
                100,000+ 积分
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-300">已办赛事</div>
              <div className="font-serif font-bold text-[#D4AF37] text-sm md:text-base">
                18 届全国巡回
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-300">裁判认证</div>
              <div className="font-serif font-bold text-[#D4AF37] text-sm md:text-base">
                国家级执裁
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-[#2C3E50] text-[#D4AF37] shadow-2xs border border-[#D4AF37]/30'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>共开放 <strong className="text-[#2C3E50]">{filteredEvents.length}</strong> 场乐龄赛事报名</span>
          <span className="text-[#2C3E50] font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
            支持双人搭档或单人智能配对
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};
