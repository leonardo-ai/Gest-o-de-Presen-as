import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Meeting, MeetingType } from '../types';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeeting: (meeting: Meeting) => void;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onAddMeeting,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('treino');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('20:00');
  const [location, setLocation] = useState('Quadra / Sede');
  const [pointsValue, setPointsValue] = useState(5);

  if (!isOpen) return null;

  const handleTypeChange = (newType: MeetingType) => {
    setType(newType);
    if (newType === 'jogo') setPointsValue(10);
    else if (newType === 'treino') setPointsValue(5);
    else if (newType === 'evento') setPointsValue(5);
    else if (newType === 'reuniao_geral') setPointsValue(5);
    else setPointsValue(5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: title.trim(),
      type,
      pointsValue,
      justifiedPointsValue: 4,
      date,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      mandatory: true,
    };

    onAddMeeting(newMeeting);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#090a56] border border-[#18288A] rounded-xl max-w-sm w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#18288A]">
          <h3 className="font-condensed text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#AAD2FF]" />
            NOVA ATIVIDADE
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              Nome da Atividade *:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Treino de Futsal ou Jogo JUCS"
              className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#AAD2FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
                Tipo:
              </label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as MeetingType)}
                className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white font-bold"
              >
                <option value="treino">Treino (+5 pts)</option>
                <option value="jogo">Jogo (+10 pts)</option>
                <option value="evento">Evento (+5 pts)</option>
                <option value="reuniao_geral">Reunião (+5 pts)</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
                Pontos de Presença:
              </label>
              <input
                type="number"
                value={pointsValue}
                onChange={e => setPointsValue(Number(e.target.value))}
                className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
                Data *:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
                Horário:
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              Local:
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Ginásio, Arena ou Meet"
              className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-[#18288A] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#040148] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#18288A] hover:bg-[#2036ba] border border-[#AAD2FF]/40 rounded-lg cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
