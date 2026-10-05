import React from 'react';
import { ClipboardCheck, Trophy, Users } from 'lucide-react';

export type TabKey = 'attendance' | 'ranking' | 'members';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'attendance' as TabKey, label: 'Chamada', icon: ClipboardCheck },
    { id: 'ranking' as TabKey, label: 'Ranking', icon: Trophy },
    { id: 'members' as TabKey, label: 'Membros', icon: Users },
  ];

  return (
    <nav className="bg-[#040148] border-b border-[#18288A] sticky top-0 z-30 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-2 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#18288A] text-white border border-[#AAD2FF]/40 shadow-sm font-bold'
                    : 'text-[#E4E2DD]/70 hover:text-white hover:bg-[#090a56] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#AAD2FF]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
