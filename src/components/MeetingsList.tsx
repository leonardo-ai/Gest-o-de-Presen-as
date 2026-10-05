import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Trash2, 
  ClipboardCheck
} from 'lucide-react';
import { Meeting, AttendanceRecord, Member, MeetingType } from '../types';

interface MeetingsListProps {
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  members: Member[];
  onOpenNewMeetingModal: () => void;
  onGoToAttendance: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  attendance,
  members,
  onOpenNewMeetingModal,
  onGoToAttendance,
  onDeleteMeeting,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const sortedMeetings = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  const filteredMeetings = sortedMeetings.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const getMeetingStats = (meetingId: string) => {
    const records = attendance.filter(a => a.meetingId === meetingId);
    const present = records.filter(r => r.status === 'present').length;
    const total = members.filter(m => m.active).length;
    const quorum = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, total, quorum };
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-condensed text-3xl font-black text-white tracking-wide leading-none">
            ATIVIDADES & CALENDÁRIO
          </h2>
          <div className="text-xs text-[#AAD2FF] font-semibold mt-0.5">
            Treinos, jogos oficiais e reuniões
          </div>
        </div>

        <button
          onClick={onOpenNewMeetingModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#18288A] hover:bg-[#2036ba] text-white border border-[#AAD2FF]/40 cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#AAD2FF]" />
          <span>Nova Atividade</span>
        </button>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: 'TODAS' },
          { id: 'treino', label: 'TREINOS' },
          { id: 'jogo', label: 'JOGOS' },
          { id: 'evento', label: 'EVENTOS' },
          { id: 'reuniao_geral', label: 'REUNIÕES' },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id)}
            className={`px-3 py-1 text-xs font-condensed tracking-wider rounded-lg cursor-pointer transition-colors ${
              filterType === type.id
                ? 'bg-[#18288A] text-white font-bold border border-[#AAD2FF]/40'
                : 'bg-[#090a56] text-[#E4E2DD]/70 hover:text-white border border-[#18288A]'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-2.5">
        {filteredMeetings.map(meeting => {
          const stats = getMeetingStats(meeting.id);

          return (
            <div
              key={meeting.id}
              className="bg-[#090a56] border border-[#18288A] hover:border-[#AAD2FF]/60 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-[#AAD2FF]">
                    {meeting.date}
                  </span>
                  {meeting.time && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#AAD2FF]" />
                      {meeting.time}
                    </span>
                  )}
                  {meeting.location && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#AAD2FF]" />
                      {meeting.location}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base leading-snug">
                  {meeting.title}
                </h3>
              </div>

              {/* Actions & Quorum */}
              <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#18288A]">
                <div className="text-right text-xs font-mono">
                  <span className="font-bold text-[#AAD2FF]">{stats.present} P</span>
                  <span className="text-slate-400 ml-1">({stats.quorum}%)</span>
                </div>

                <button
                  onClick={() => onGoToAttendance(meeting.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#18288A] hover:bg-[#2036ba] text-white border border-[#AAD2FF]/40 cursor-pointer transition-colors"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 text-[#AAD2FF]" />
                  <span>Chamada</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Excluir "${meeting.title}"?`)) {
                      onDeleteMeeting(meeting.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
