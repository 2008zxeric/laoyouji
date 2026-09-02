import React, { useState } from 'react';
import { X, User, Award, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TgoDetailModal } from './TgoDetailModal';

export const CompanionPickerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { tgos, selectedTgo, setSelectedTgo, favorites, toggleFavorite } = useApp();
  const [activeType, setActiveType] = useState<'tgo' | 'teacher' | 'referee'>('tgo');
  const [detailTgo, setDetailTgo] = useState<any>(null);

  if (!isOpen) return null;

  // Filter based on explicit category mapping
  const filtered = tgos.filter(c => {
    // TGO: roleTitle often contains TGO
    if (activeType === 'tgo') return c.roleTitle?.includes('TGO') || c.source === 'own' || c.source === 'hire';
    // Teacher: roleTitle contains 导师/学者/教授
    if (activeType === 'teacher') return c.roleTitle?.includes('导师') || c.roleTitle?.includes('学者') || c.roleTitle?.includes('教授');
    // Referee: roleTitle contains 裁判
    if (activeType === 'referee') return c.roleTitle?.includes('裁判');
    return false;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF9F6] animate-fadeIn">
      <div className="w-full flex-1 flex flex-col mx-auto max-w-2xl h-full">
        <div className="p-6 flex items-center justify-between shrink-0">
          <h2 className="font-serif font-semibold text-xl text-[#3A3F44]">寻找同伴</h2>
          <button onClick={onClose} className="p-2 bg-[#E4E0D9]/50 rounded-full cursor-pointer hover:bg-[#E4E0D9] transition-colors">
            <X className="w-5 h-5 text-[#5D666E]" />
          </button>
        </div>

          <div className="flex shrink-0 bg-[#E4E0D9] mx-4 rounded-xl p-1">
            {[
              { id: 'tgo', label: 'TGO管家', icon: User },
              { id: 'teacher', label: '名师导师', icon: User },
              { id: 'referee', label: '赛事裁判', icon: Award },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveType(item.id as any)}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg transition-all ${
                  activeType === item.id 
                    ? 'text-[#3A3F44] bg-[#FAF9F6] shadow-sm' 
                    : 'text-[#8B939A] hover:text-[#5D666E]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF9F6]">
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map(c => {
                  const isFav = favorites.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      className={`bg-white p-5 rounded-2xl flex items-center gap-5 cursor-pointer hover:shadow-sm transition-all border ${
                        selectedTgo?.id === c.id ? 'border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]' : 'border-[#EAE6DF]/50'
                      }`}
                      onClick={() => setSelectedTgo(c)}
                    >
                      <img src={c.avatar} className="w-16 h-16 rounded-full object-cover shrink-0" alt={c.name} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base text-[#3A3F44] truncate">{c.name}</div>
                        <div className="text-xs text-[#A68F6C] font-medium truncate mt-1">{c.roleTitle}</div>
                        <div className="text-xs text-[#8B939A] mt-1.5 line-clamp-1 leading-relaxed">{c.motto}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button 
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                            isFav 
                              ? 'bg-[#2C3E50] text-[#D4AF37]' 
                              : 'bg-[#E4E0D9] text-[#5D666E] hover:bg-[#DCDAD7]'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(c.id);
                          }}
                        >
                          {isFav ? '已关注' : '关注/联系'}
                        </button>
                        <button 
                          className="px-4 py-2 bg-[#FAF9F6] text-[#A68F6C] text-xs font-semibold rounded-lg border border-[#EAE6DF] hover:bg-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailTgo(c);
                          }}
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-[#8B939A] text-sm">暂无该类同伴信息</div>
              )}
            </div>
          </div>
        </div>
      {detailTgo && (
        <TgoDetailModal tgo={detailTgo} onClose={() => setDetailTgo(null)} />
      )}
    </div>
  );
};
