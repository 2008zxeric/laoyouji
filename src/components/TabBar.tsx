import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Compass, Trophy, Users, Bot, User } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useApp();

  // Count active pending orders
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending_pay' || o.status === 'paid'
  ).length;

  const tabs = [
    {
      id: 'home' as const,
      label: '精选',
      sublabel: '金秋精选',
      icon: Sparkles,
    },
    {
      id: 'activities' as const,
      label: '找慢游',
      sublabel: '文旅研学',
      icon: Compass,
    },
    {
      id: 'ai' as const,
      label: '伴游AI',
      sublabel: '智能管家',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'events' as const,
      label: '乐龄赛事',
      sublabel: '掼蛋·桥牌',
      icon: Trophy,
      badge: '奖金',
    },
    {
      id: 'profile' as const,
      label: '我的',
      sublabel: '名仕会员',
      icon: User,
      badgeCount: activeOrdersCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#EAE6DF] shadow-[0_-4px_20px_rgba(44,62,80,0.05)] select-none">
      <div className="max-w-md md:max-w-2xl mx-auto px-3 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#2C3E50] to-[#1a252f] text-[#D4AF37] scale-105 ring-4 ring-[#D4AF37]/30'
                      : 'bg-gradient-to-br from-[#2C3E50] to-[#34495e] text-white hover:scale-105'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <Sparkles className="w-3 h-3 text-[#D4AF37] absolute top-2 right-2 animate-spin duration-3000" />
                </div>
                <span
                  className={`text-[11px] font-bold mt-0.5 tracking-tight transition-colors ${
                    isActive ? 'text-[#2C3E50]' : 'text-stone-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[58px] min-h-[48px] active:scale-95 ${
                isActive ? 'text-[#2C3E50]' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4] text-[#2C3E50]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge text */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 bg-[#D4AF37] text-stone-950 text-[9px] font-bold px-1 rounded-full scale-90 shadow-2xs">
                    {tab.badge}
                  </span>
                )}

                {/* Badge count */}
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#D4AF37] text-stone-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                    {tab.badgeCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'font-bold text-[#2C3E50]' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <div className="w-3.5 h-0.5 bg-[#D4AF37] rounded-full mt-0.5 animate-fadeIn"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
