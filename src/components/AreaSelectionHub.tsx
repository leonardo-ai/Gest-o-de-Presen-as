import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { OfficialArea, OFFICIAL_AREAS } from '../types';

interface AreaSelectionHubProps {
  onSelectArea: (area: OfficialArea | 'Todas as Áreas') => void;
  onOpenImport?: () => void;
  onOpenSettings?: () => void;
}

export const AreaSelectionHub: React.FC<AreaSelectionHubProps> = ({
  onSelectArea,
}) => {
  const [selected, setSelected] = useState<string>('');

  const handleSelectChange = (value: string) => {
    if (!value) return;
    onSelectArea(value as OfficialArea | 'Todas as Áreas');
  };

  return (
    <div className="min-h-screen bg-[#040148] text-white flex flex-col justify-center items-center p-6 select-none">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Cabeçalho */}
        <div>
          <h1 className="font-condensed text-4xl sm:text-5xl font-black tracking-wide text-white leading-tight">
            Controle de presença
          </h1>
        </div>

        {/* Pergunta e Menu Suspenso */}
        <div className="space-y-3 pt-2 text-left">
          <label 
            htmlFor="area-select"
            className="block text-sm sm:text-base text-[#E4E2DD]/90 font-medium text-center"
          >
            Qual area deseja ver?
          </label>

          <div className="relative">
            <select
              id="area-select"
              value={selected}
              onChange={e => {
                setSelected(e.target.value);
                handleSelectChange(e.target.value);
              }}
              className="w-full appearance-none bg-[#090a56] hover:bg-[#10146e] border border-[#18288A] focus:border-[#AAD2FF] text-white rounded-xl px-4 py-3.5 text-base font-semibold focus:outline-none transition-colors cursor-pointer pr-10"
            >
              <option value="" disabled className="bg-[#040148] text-slate-400">
                Selecione uma área...
              </option>
              <option value="Todas as Áreas" className="bg-[#040148] text-white font-bold">
                Todas as áreas
              </option>
              {OFFICIAL_AREAS.map(area => (
                <option key={area} value={area} className="bg-[#040148] text-white">
                  {area}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#AAD2FF]">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {selected && (
            <button
              onClick={() => handleSelectChange(selected)}
              className="w-full mt-2 py-3 rounded-xl bg-[#18288A] hover:bg-[#2036ba] text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Acessar</span>
              <ArrowRight className="w-4 h-4 text-[#AAD2FF]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
