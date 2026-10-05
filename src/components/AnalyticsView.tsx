import React from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Phone,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { Member, Meeting, AttendanceRecord, AthleticaConfig } from '../types';

interface AnalyticsViewProps {
  members: Member[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  config: AthleticaConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  members,
  meetings,
  attendance,
  config,
}) => {
  const activeMembers = members.filter(m => m.active);

  // 1. Department Ranking
  const departments = Array.from(new Set(activeMembers.map(m => m.department)));
  const deptStats = departments.map(dept => {
    const deptMembers = activeMembers.filter(m => m.department === dept);
    let totalPresent = 0;
    let totalPossible = 0;

    deptMembers.forEach(mem => {
      const records = attendance.filter(a => a.memberId === mem.id);
      const attended = records.filter(r => r.status === 'present' || r.status === 'late').length;
      totalPresent += attended;
      totalPossible += records.length;
    });

    const rate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 100;
    return {
      department: dept,
      membersCount: deptMembers.length,
      rate,
      totalPresent,
      totalPossible,
    };
  }).sort((a, b) => b.rate - a.rate);

  // 2. Members at risk (< minAttendancePercent)
  const atRiskMembers = activeMembers.map(mem => {
    const memRecords = attendance.filter(a => a.memberId === mem.id);
    const present = memRecords.filter(r => r.status === 'present').length;
    const late = memRecords.filter(r => r.status === 'late').length;
    const justified = memRecords.filter(r => r.status === 'justified').length;
    const absent = memRecords.filter(r => r.status === 'absent').length;
    const total = meetings.length;

    const rate = total > 0 ? Math.round(((present + late * 0.8 + justified * 0.7) / total) * 100) : 100;

    // Consecutive absences at end of sorted meetings
    const sortedMeetings = [...meetings].sort((a, b) => a.date.localeCompare(b.date));
    let consecutiveAbsences = 0;
    for (let i = sortedMeetings.length - 1; i >= 0; i--) {
      const meet = sortedMeetings[i];
      const rec = attendance.find(a => a.memberId === mem.id && a.meetingId === meet.id);
      if (!rec || rec.status === 'absent') {
        consecutiveAbsences++;
      } else {
        break;
      }
    }

    return {
      member: mem,
      present,
      late,
      justified,
      absent,
      rate,
      consecutiveAbsences,
      isAlert: rate < config.minAttendancePercent,
    };
  }).filter(m => m.isAlert).sort((a, b) => a.rate - b.rate);

  // 3. Global Stats
  const totalRecords = attendance.length;
  const totalPresent = attendance.filter(r => r.status === 'present').length;
  const totalLate = attendance.filter(r => r.status === 'late').length;
  const totalJustified = attendance.filter(r => r.status === 'justified').length;
  const totalAbsent = attendance.filter(r => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Desempenho e Alertas da Gestão</h2>
            <p className="text-xs text-slate-400">
              Acompanhamento de quórum por diretoria e identificação precoce de faltas.
            </p>
          </div>
        </div>
      </div>

      {/* Global Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Presenças</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalPresent}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0}% de todas chamadas
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Faltas Justificadas</span>
            <HelpCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{totalJustified}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Com atestado / justificativa
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Atrasos</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalLate}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Chegadas pós-início
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Faltas Não Justificadas</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{totalAbsent}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Ausências sem aviso prévio
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Engagement Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Ranking de Engajamento por Diretoria
            </h3>
            <span className="text-[11px] text-slate-400">Meta: {config.minAttendancePercent}%</span>
          </div>

          <div className="space-y-3">
            {deptStats.map((dept, index) => {
              const isBelow = dept.rate < config.minAttendancePercent;

              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">#{index + 1}</span>
                      {dept.department}
                      <span className="text-slate-500 text-[10px]">({dept.membersCount} membros)</span>
                    </span>
                    <span
                      className={`font-bold ${
                        isBelow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {dept.rate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isBelow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, dept.rate))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Attention / Low Attendance Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Membros em Alerta (&lt;{config.minAttendancePercent}% de presença)
            </h3>
            <span className="text-xs text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              {atRiskMembers.length} em risco
            </span>
          </div>

          {atRiskMembers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-semibold">Parabéns! Nenhum membro está em risco.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Todos os membros ativos estão com presença acima de {config.minAttendancePercent}%.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {atRiskMembers.map(({ member, rate, absent, consecutiveAbsences }) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {member.name}
                      <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800">
                        {rate}% Freq.
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {member.department} · {member.role}
                    </div>
                    <div className="text-[11px] text-amber-300/80 mt-1">
                      ⚠️ {absent} faltas totais
                      {consecutiveAbsences > 1 && ` · ${consecutiveAbsences} faltas consecutivas`}
                    </div>
                  </div>

                  {member.phone && (
                    <a
                      href={`https://wa.me/55${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá ${member.name}, tudo bem? Sou da presidência da Atlética. Notamos que sua frequência está em ${rate}% e gostaríamos de saber se está precisando de apoio com a rotina da gestão.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                      title="Enviar mensagem amigável no WhatsApp"
                    >
                      <Phone className="w-3 h-3" />
                      Cobrar
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
