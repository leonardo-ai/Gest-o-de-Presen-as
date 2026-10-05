import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { OfficialArea } from '../types';

interface HeaderProps {
  currentArea: OfficialArea | 'Todas as Áreas';
  onBackToAreas: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentArea,
  onBackToAreas,
}) => {
  return (
    <header className="bg-[#040148] border-b border-[#18288A] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToAreas}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090a56] hover:bg-[#18288A] text-[#AAD2FF] hover:text-white border border-[#18288A] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0"
            title="Voltar para a seleção de áreas"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Áreas</span>
          </button>

          <div className="h-5 w-px bg-[#18288A]" />

          <h1 className="font-condensed text-2xl sm:text-3xl font-black tracking-wide text-white leading-none uppercase">
            {currentArea}
          </h1>
        </div>
      </div>
    </header>
  );
};
