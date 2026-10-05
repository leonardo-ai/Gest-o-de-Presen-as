import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Info,
  Edit3,
  Check
} from 'lucide-react';
import { Member, OfficialArea, MonthKey, WeekKey, WeekScheduleLegend, WeeklyMemberAttendance } from '../types';
import { 
  ATTENDANCE_MONTHS, 
  getWeeksForMonth,
  getLegendFor, 
  saveWeekLegend,
  loadWeeklyRecords, 
  saveWeeklyRecords,
  calculateWeeklyPoints,
  isMemberAlreadyCountedAssociateInMonth
} from '../utils/weeklyAttendance';

interface QuickAttendanceProps {
  members: Member[];
  currentArea?: OfficialArea | 'Todas as Áreas';
  onRefreshAllPoints?: (updatedMembers: Member[]) => void;
}

export const QuickAttendance: React.FC<QuickAttendanceProps> = ({
  members,
  currentArea,
  onRefreshAllPoints,
}) => {
  const isPresidency = currentArea === 'Presidência';

  // Cabeçalho: apenas 2 menus suspensos (Mês e Semana)
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>('2026-08');
  const [selectedWeek, setSelectedWeek] = useState<WeekKey>(1);

  // Semanas disponíveis para o mês selecionado
  const availableWeeks = getWeeksForMonth(selectedMonth);

  // Garantir que a semana selecionada exista no mês
  useEffect(() => {
    const exists = availableWeeks.some(w => w.week === selectedWeek);
    if (!exists) {
      setSelectedWeek(1);
    }
  }, [selectedMonth, availableWeeks, selectedWeek]);

  // Legenda da semana atual
  const [legend, setLegend] = useState<WeekScheduleLegend>(() =>
    getLegendFor('2026-08', 1)
  );

  // Estado de edição da legenda (apenas Presidência)
  const [isEditingLegend, setIsEditingLegend] = useState(false);
  const [editDateRange, setEditDateRange] = useState('');
  const [editHadTraining, setEditHadTraining] = useState(true);
  const [editTrainingLocation, setEditTrainingLocation] = useState('Orsina');
  const [editGamesCount, setEditGamesCount] = useState(0);
  const [editGamesDescription, setEditGamesDescription] = useState('');
  const [editEventsCount, setEditEventsCount] = useState(0);
  const [editEventsDescription, setEditEventsDescription] = useState('');

  // Registros semanais armazenados
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyMemberAttendance[]>(() =>
    loadWeeklyRecords()
  );

  // Membro atualmente aberto para preenchimento
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Atualizar a legenda ao mudar de mês ou semana
  useEffect(() => {
    const l = getLegendFor(selectedMonth, selectedWeek);
    setLegend(l);
    setEditDateRange(l.dateRange);
    setEditHadTraining(l.hadTraining);
    setEditTrainingLocation(l.trainingLocation || 'Orsina');
    setEditGamesCount(l.gamesCount);
    setEditGamesDescription(l.gamesDescription || '');
    setEditEventsCount(l.eventsCount);
    setEditEventsDescription(l.eventsDescription || '');
    setIsEditingLegend(false);
  }, [selectedMonth, selectedWeek]);

  const handleSaveLegend = () => {
    const updated: WeekScheduleLegend = {
      ...legend,
      dateRange: editDateRange.trim() || legend.dateRange,
      hadTraining: editHadTraining,
      trainingLocation: editHadTraining ? (editTrainingLocation.trim() || undefined) : undefined,
      gamesCount: Math.max(0, editGamesCount),
      gamesDescription: editGamesCount > 0 ? editGamesDescription.trim() : undefined,
      eventsCount: Math.max(0, editEventsCount),
      eventsDescription: editEventsCount > 0 ? editEventsDescription.trim() : undefined,
    };
    setLegend(updated);
    saveWeekLegend(updated);
    setIsEditingLegend(false);
  };

  // Filtragem dos membros:
  // Se for Presidência: APENAS membros da Presidência e Diretores de todas as áreas!
  // Se for outra área: membros daquela área.
  let displayedMembers: Member[] = [];
  if (isPresidency) {
    displayedMembers = members.filter(m => {
      const isPres = m.department.toLowerCase().includes('presidência') || m.department.toLowerCase().includes('presidencia');
      const isDirector = m.role.toLowerCase().includes('diretor') || m.role.toLowerCase().includes('diretora') || m.role.toLowerCase().includes('presidente');
      return isPres || isDirector;
    });
  } else if (currentArea && currentArea !== 'Todas as Áreas') {
    displayedMembers = members.filter(m => m.department === currentArea);
  } else {
    displayedMembers = members;
  }

  // Obter ou criar registro semanal do membro
  const getRecordForMember = (memberId: string): WeeklyMemberAttendance => {
    const existing = weeklyRecords.find(
      r => r.memberId === memberId && r.month === selectedMonth && r.week === selectedWeek
    );
    if (existing) return existing;

    return {
      id: `rec-${memberId}-${selectedMonth}-w${selectedWeek}`,
      memberId,
      month: selectedMonth,
      week: selectedWeek,
      attendedTraining: undefined,
      trainingJustified: undefined,
      gamesAttended: 0,
      gamesJustified: undefined,
      eventsAttended: 0,
      eventsJustified: undefined,
      isAssociate: undefined,
      extraPoints: 0,
      extraReason: '',
      monthlyHighlightBonus: false,
    };
  };

  // Salvar alterações e recalcular pontos totais
  const updateRecord = (updated: WeeklyMemberAttendance) => {
    const otherRecords = weeklyRecords.filter(
      r => !(r.memberId === updated.memberId && r.month === updated.month && r.week === updated.week)
    );
    const newRecords = [...otherRecords, updated];
    setWeeklyRecords(newRecords);
    saveWeeklyRecords(newRecords);

    // Recalcular pontuação total de todos os membros a partir dos registros semanais + base inicial
    if (onRefreshAllPoints) {
      const updatedMembers = members.map(m => {
        const memRecords = newRecords.filter(r => r.memberId === m.id);
        let totalWeeklyPoints = 0;

        memRecords.forEach(rec => {
          const recLegend = getLegendFor(rec.month, rec.week);
          const alreadyAssociate = isMemberAlreadyCountedAssociateInMonth(
            rec.memberId,
            rec.month,
            rec.week,
            newRecords
          );
          totalWeeklyPoints += calculateWeeklyPoints(rec, recLegend, alreadyAssociate);
        });

        const initialBase = m.initialPoints ?? 0;
        return {
          ...m,
          points: initialBase + totalWeeklyPoints,
        };
      });

      onRefreshAllPoints(updatedMembers);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Cabeçalho: APENAS 2 Menus Suspensos (Mês e Semana) */}
      <div className="bg-[#090a56] border border-[#18288A] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Menu Suspenso 1: Mês (Agosto 2026 até Abril 2027) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAD2FF]">
              Mês:
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value as MonthKey)}
                className="w-full appearance-none bg-[#040148] border border-[#18288A] focus:border-[#AAD2FF] text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none transition-colors cursor-pointer pr-10"
              >
                {ATTENDANCE_MONTHS.map(m => (
                  <option key={m.key} value={m.key} className="bg-[#040148] text-white">
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#AAD2FF]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Menu Suspenso 2: Semana (Semana 1, 2, 3 ou 4) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAD2FF]">
              Semana:
            </label>
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={e => setSelectedWeek(Number(e.target.value) as WeekKey)}
                className="w-full appearance-none bg-[#040148] border border-[#18288A] focus:border-[#AAD2FF] text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none transition-colors cursor-pointer pr-10"
              >
                {availableWeeks.map(w => (
                  <option key={w.week} value={w.week} className="bg-[#040148] text-white">
                    {w.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#AAD2FF]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda da Semana (Editável pela Presidência) */}
      <div className="bg-[#090a56]/80 border border-[#18288A] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#AAD2FF]" />
            <h3 className="font-condensed text-xl sm:text-2xl font-black text-white tracking-wide">
              LEGENDA DA SEMANA
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#AAD2FF]">
              {legend.dateRange}
            </span>

            {/* Botão de Editar Legenda (Apenas Presidência) */}
            {isPresidency && (
              <button
                type="button"
                onClick={() => {
                  if (isEditingLegend) {
                    handleSaveLegend();
                  } else {
                    setIsEditingLegend(true);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isEditingLegend
                    ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                    : 'bg-[#040148] text-[#AAD2FF] hover:text-white border border-[#18288A]'
                }`}
              >
                {isEditingLegend ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Legenda</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Legenda</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Modo de Edição da Legenda (Presidência) */}
        {isEditingLegend ? (
          <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                Intervalo de Datas:
              </label>
              <input
                type="text"
                value={editDateRange}
                onChange={e => setEditDateRange(e.target.value)}
                className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Teve Treino:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditHadTraining(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      editHadTraining ? 'bg-[#18288A] text-white border border-[#AAD2FF]' : 'bg-[#090a56] text-slate-400'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditHadTraining(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      !editHadTraining ? 'bg-rose-950 text-rose-300 border border-rose-500' : 'bg-[#090a56] text-slate-400'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {editHadTraining && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                    Local do Treino:
                  </label>
                  <input
                    type="text"
                    value={editTrainingLocation}
                    onChange={e => setEditTrainingLocation(e.target.value)}
                    placeholder="Ex: Orsina"
                    className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Jogos na Semana:
                </label>
                <input
                  type="number"
                  min={0}
                  value={editGamesCount}
                  onChange={e => setEditGamesCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Eventos na Semana:
                </label>
                <input
                  type="number"
                  min={0}
                  value={editEventsCount}
                  onChange={e => setEditEventsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>
            </div>

            {/* Caixas de Descrição quando houver jogos ou eventos */}
            {editGamesCount > 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-[#AAD2FF]">
                  Quais foram os jogos:
                </label>
                <input
                  type="text"
                  placeholder="Ex: BM e HM, Futsal Masc..."
                  value={editGamesDescription}
                  onChange={e => setEditGamesDescription(e.target.value)}
                  className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>
            )}

            {editEventsCount > 0 && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-[#AAD2FF]">
                  Qual foi o evento / Quais foram os eventos:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Atlética Day, ESPM Parque, Reunião Geral..."
                  value={editEventsDescription}
                  onChange={e => setEditEventsDescription(e.target.value)}
                  className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveLegend}
                className="px-4 py-1.5 bg-[#18288A] hover:bg-[#2036ba] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                Concluir e Salvar
              </button>
            </div>
          </div>
        ) : (
          /* Visualização Normal da Legenda (Visível para todas as áreas) */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Treino */}
            <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Teve treino:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  legend.hadTraining ? 'bg-[#18288A] text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {legend.hadTraining ? 'Sim (1 treino)' : 'Não'}
                </span>
              </div>
              {legend.hadTraining && legend.trainingLocation && (
                <div className="text-[11px] text-[#AAD2FF] font-medium pt-1 border-t border-[#18288A]/50 leading-snug">
                  {legend.trainingLocation}
                </div>
              )}
            </div>

            {/* Jogos */}
            <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Jogos na semana:</span>
                <span className="font-bold text-white">
                  {legend.gamesCount === 0 ? 'Nenhum jogo' : `${legend.gamesCount} ${legend.gamesCount === 1 ? 'jogo' : 'jogos'}`}
                </span>
              </div>
              {legend.gamesCount > 0 && legend.gamesDescription && (
                <div className="text-[11px] text-[#AAD2FF] font-medium pt-1 border-t border-[#18288A]/50 leading-snug">
                  {legend.gamesDescription}
                </div>
              )}
            </div>

            {/* Eventos */}
            <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3 flex flex-col justify-between gap-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Eventos na semana:</span>
                <span className="font-bold text-white">
                  {legend.eventsCount === 0 ? 'Nenhum evento' : `${legend.eventsCount} ${legend.eventsCount === 1 ? 'evento' : 'eventos'}`}
                </span>
              </div>
              {legend.eventsCount > 0 && legend.eventsDescription && (
                <div className="text-[11px] text-[#AAD2FF] font-medium pt-1 border-t border-[#18288A]/50 leading-snug">
                  {legend.eventsDescription}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Membros (Na Presidência: APENAS Presidência e Diretores) */}
      <div className="space-y-2.5">
        {displayedMembers.map(member => {
          const isExpanded = expandedMemberId === member.id;
          const record = getRecordForMember(member.id);

          return (
            <div
              key={member.id}
              className={`bg-[#090a56] border rounded-2xl transition-all overflow-hidden ${
                isExpanded ? 'border-[#AAD2FF] shadow-lg shadow-[#18288A]/30' : 'border-[#18288A] hover:border-[#AAD2FF]/50'
              }`}
            >
              {/* Botão Clicável com Nome do Membro */}
              <button
                type="button"
                onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base truncate">
                      {member.name}
                    </h4>
                    {isPresidency && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#040148] text-[#AAD2FF] border border-[#18288A]">
                        {member.department}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#AAD2FF] font-medium mt-0.5">
                    {member.role || 'Membro'}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-black text-white">
                    {member.points} pts
                  </span>
                  <div className="p-1 rounded-lg bg-[#040148] text-[#AAD2FF]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Opções Expandidas do Membro (SEM LEGENDAS DE EXPLICAÇÃO) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#18288A] bg-[#040148]/60 space-y-3.5 animate-in fade-in duration-200">
                  {/* 1. Treino */}
                  <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Treino</span>

                      {legend.hadTraining ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              attendedTraining: true,
                              trainingJustified: undefined,
                            })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.attendedTraining === true
                                ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              attendedTraining: false,
                            })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.attendedTraining === false
                                ? 'bg-rose-950 text-rose-300 border border-rose-500'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Sem treino</span>
                      )}
                    </div>

                    {/* Caso aperte o Não: Justificou? Sim ou Não */}
                    {record.attendedTraining === false && legend.hadTraining && (
                      <div className="pt-2 border-t border-[#18288A]/60 flex items-center justify-between">
                        <span className="text-xs text-white font-semibold">
                          Justificou?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              trainingJustified: true,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.trainingJustified === true
                                ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              trainingJustified: false,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.trainingJustified === false
                                ? 'bg-rose-950 text-rose-300 border border-rose-500'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Jogos */}
                  <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-white">Jogos</span>

                      <input
                        type="number"
                        min={0}
                        max={Math.max(legend.gamesCount, 10)}
                        value={record.gamesAttended || 0}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          updateRecord({
                            ...record,
                            gamesAttended: val,
                          });
                        }}
                        className="w-16 text-center bg-[#090a56] border border-[#18288A] rounded-lg p-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#AAD2FF]"
                      />
                    </div>

                    {/* Caso o número seja inferior ao de jogos da legenda: Justificou? Sim ou Não */}
                    {legend.gamesCount > (record.gamesAttended || 0) && (
                      <div className="pt-2 border-t border-[#18288A]/60 flex items-center justify-between">
                        <span className="text-xs text-white font-semibold">
                          Justificou?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              gamesJustified: true,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.gamesJustified === true
                                ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              gamesJustified: false,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.gamesJustified === false
                                ? 'bg-rose-950 text-rose-300 border border-rose-500'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Eventos */}
                  <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-white">Eventos</span>

                      <input
                        type="number"
                        min={0}
                        max={Math.max(legend.eventsCount, 10)}
                        value={record.eventsAttended || 0}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          updateRecord({
                            ...record,
                            eventsAttended: val,
                          });
                        }}
                        className="w-16 text-center bg-[#090a56] border border-[#18288A] rounded-lg p-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#AAD2FF]"
                      />
                    </div>

                    {/* Caso o número seja inferior ao de eventos da legenda: Justificou? Sim ou Não */}
                    {legend.eventsCount > (record.eventsAttended || 0) && (
                      <div className="pt-2 border-t border-[#18288A]/60 flex items-center justify-between">
                        <span className="text-xs text-white font-semibold">
                          Justificou?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              eventsJustified: true,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.eventsJustified === true
                                ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRecord({
                              ...record,
                              eventsJustified: false,
                            })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              record.eventsJustified === false
                                ? 'bg-rose-950 text-rose-300 border border-rose-500'
                                : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Associado */}
                  <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <span className="font-bold text-sm text-white">Associado</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateRecord({
                          ...record,
                          isAssociate: true,
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          record.isAssociate === true
                            ? 'bg-[#18288A] text-white border border-[#AAD2FF]'
                            : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRecord({
                          ...record,
                          isAssociate: false,
                        })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          record.isAssociate === false
                            ? 'bg-rose-950 text-rose-300 border border-rose-500'
                            : 'bg-[#090a56] text-slate-300 hover:text-white border border-[#18288A]'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>

                  {/* 5. Extras */}
                  <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-white">Extras</span>

                      <input
                        type="number"
                        min={0}
                        value={record.extraPoints || 0}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          updateRecord({
                            ...record,
                            extraPoints: val,
                          });
                        }}
                        className="w-16 text-center bg-[#090a56] border border-[#18288A] rounded-lg p-1.5 text-sm font-bold text-white focus:outline-none focus:border-[#AAD2FF]"
                      />
                    </div>

                    {/* Caixa de Descrição aberta caso seja dado valor > 0 */}
                    {record.extraPoints > 0 && (
                      <div className="pt-2 border-t border-[#18288A]/60 space-y-1">
                        <label className="block text-xs font-bold text-[#AAD2FF]">
                          Descrição:
                        </label>
                        <input
                          type="text"
                          value={record.extraReason || ''}
                          onChange={e => updateRecord({
                            ...record,
                            extraReason: e.target.value,
                          })}
                          placeholder="Explicação do motivo..."
                          className="w-full bg-[#090a56] border border-[#18288A] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#AAD2FF]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 6. Bônus (apenas nas semanas 4 ou finais de cada mês) */}
                  {(selectedWeek === 4 || selectedWeek === 5) && (
                    <div className="bg-[#040148] border border-[#18288A] rounded-xl p-3.5 flex items-center justify-between gap-3">
                      <span className="font-bold text-sm text-white">Bônus</span>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={record.monthlyHighlightBonus || false}
                          onChange={e => updateRecord({
                            ...record,
                            monthlyHighlightBonus: e.target.checked,
                          })}
                          className="w-5 h-5 rounded text-[#18288A] focus:ring-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
