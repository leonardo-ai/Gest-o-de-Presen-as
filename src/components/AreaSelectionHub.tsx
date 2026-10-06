import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowRight, Lock, X } from 'lucide-react';
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
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Foca no input quando o modal de PIN abre
  useEffect(() => {
    if (showPinModal) {
      setPin('');
      setPinError('');
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 50);
    }
  }, [showPinModal]);

  const handleSelectChange = (value: string) => {
    if (!value) return;

    if (value === 'Presidência') {
      setSelected('Presidência');
      setShowPinModal(true);
      return;
    }

    onSelectArea(value as OfficialArea | 'Todas as Áreas');
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin === '2025') {
      setShowPinModal(false);
      setPin('');
      setPinError('');
      onSelectArea('Presidência');
    } else {
      setPinError('PIN incorreto. Tente novamente.');
      setPin('');
      pinInputRef.current?.focus();
    }
  };

  const handleClosePinModal = () => {
    setShowPinModal(false);
    setPin('');
    setPinError('');
    setSelected('');
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

      {/* Modal de PIN da Presidência */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#040148] border border-[#18288A] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={handleClosePinModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#18288A]"
              title="Cancelar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#18288A]/50 border border-[#AAD2FF]/40 flex items-center justify-center text-[#AAD2FF]">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Acesso da Presidência
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Digite o PIN de 4 dígitos para acessar a área da Presidência:
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="w-full space-y-4">
                <div>
                  <input
                    ref={pinInputRef}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPin(val);
                      if (pinError) setPinError('');
                    }}
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-[#090a56] border border-[#18288A] focus:border-[#AAD2FF] text-white rounded-xl focus:outline-none"
                    autoComplete="off"
                  />

                  {pinError && (
                    <p className="text-rose-400 text-xs font-semibold mt-2 animate-in fade-in">
                      {pinError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClosePinModal}
                    className="flex-1 py-2.5 rounded-xl bg-[#090a56] hover:bg-[#10146e] border border-[#18288A] text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#18288A] hover:bg-[#2036ba] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
