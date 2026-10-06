import { 
  WeeklyMemberAttendance, 
  WeekScheduleLegend, 
  MonthKey, 
  WeekKey 
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  loadWeekLegends, 
  saveWeekLegend as saveLocalLegend, 
  getDefaultLegend,
  loadWeeklyRecords,
  saveWeeklyRecords as saveLocalRecords,
  isMemberAlreadyCountedAssociateInMonth
} from '../utils/weeklyAttendance';
import { syncMemberWeeklyPoints, SyncWeeklyPointItem } from './pointsService';

/**
 * Busca todas as legendas semanais configuradas
 */
export async function getLegends(): Promise<Record<string, WeekScheduleLegend>> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadWeekLegends();
  }

  try {
    const { data, error } = await supabase.from('week_legends').select('*');
    if (error || !data || data.length === 0) {
      return loadWeekLegends();
    }

    const result: Record<string, WeekScheduleLegend> = {};
    data.forEach(row => {
      result[row.id] = {
        id: row.id,
        month: row.month as MonthKey,
        week: row.week as WeekKey,
        dateRange: row.date_range,
        hadTraining: row.had_training,
        trainingLocation: row.training_location,
        gamesCount: row.games_count,
        gamesDescription: row.games_description,
        eventsCount: row.events_count,
        eventsDescription: row.events_description,
      };
    });

    return result;
  } catch {
    return loadWeekLegends();
  }
}

/**
 * Salva a legenda de uma semana (apenas Presidência)
 */
export async function upsertLegend(legend: WeekScheduleLegend): Promise<void> {
  // Salva no cache local
  saveLocalLegend(legend);

  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  try {
    await supabase.from('week_legends').upsert({
      id: legend.id,
      month: legend.month,
      week: legend.week,
      date_range: legend.dateRange,
      had_training: legend.hadTraining,
      training_location: legend.trainingLocation || 'Orsina',
      games_count: legend.gamesCount,
      games_description: legend.gamesDescription || null,
      events_count: legend.eventsCount,
      events_description: legend.eventsDescription || null,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Erro ao salvar legenda no Supabase:', e);
  }
}

/**
 * Busca todos os registros de presença semanal
 */
export async function getWeeklyRecords(): Promise<WeeklyMemberAttendance[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadWeeklyRecords();
  }

  try {
    const { data, error } = await supabase
      .from('weekly_attendance')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return loadWeeklyRecords();
    }

    return data.map(r => ({
      id: r.id,
      memberId: r.member_id,
      month: r.month as MonthKey,
      week: r.week as WeekKey,
      attendedTraining: r.attended_training,
      trainingJustified: r.training_justified,
      gamesAttended: r.games_attended ?? 0,
      gamesJustified: r.games_justified,
      eventsAttended: r.events_attended ?? 0,
      eventsJustified: r.events_justified,
      isAssociate: r.is_associate,
      extraPoints: r.extra_points ?? 0,
      extraReason: r.extra_reason || '',
      monthlyHighlightBonus: r.monthly_highlight_bonus ?? false,
      updatedAt: r.updated_at,
    }));
  } catch {
    return loadWeeklyRecords();
  }
}

/**
 * Salva o preenchimento da chamada de um membro em uma semana,
 * sincronizando de forma idempotente as transações de pontos correspondentes.
 */
export async function saveMemberAttendance(
  record: WeeklyMemberAttendance,
  legend: WeekScheduleLegend,
  allRecords: WeeklyMemberAttendance[]
): Promise<WeeklyMemberAttendance> {
  // 1. Atualiza no cache local
  const otherLocal = allRecords.filter(
    r => !(r.memberId === record.memberId && r.month === record.month && r.week === record.week)
  );
  const updatedAll = [...otherLocal, record];
  saveLocalRecords(updatedAll);

  // 2. Calcula as transações atômicas de pontos daquela semana
  const isAlreadyAssociate = isMemberAlreadyCountedAssociateInMonth(
    record.memberId,
    record.month,
    record.week,
    allRecords
  );

  const syncItems: SyncWeeklyPointItem[] = [];
  const baseRef = `att-${record.memberId}-${record.month}-w${record.week}`;

  // 2.1 Treino
  let treinoPoints = 0;
  let treinoDesc = `Treino (${legend.trainingLocation || 'Orsina'}) — Sem. ${record.week}`;
  if (legend.hadTraining) {
    if (record.attendedTraining === true) {
      treinoPoints = 5;
    } else if (record.attendedTraining === false && record.trainingJustified === true) {
      treinoPoints = 4;
      treinoDesc = `Treino Justificado — Sem. ${record.week}`;
    }
  }
  syncItems.push({
    category: 'treino',
    points: treinoPoints,
    description: treinoDesc,
    referenceId: `${baseRef}-treino`,
    month: record.month,
    week: record.week,
  });

  // 2.2 Jogos
  let jogoPoints = 0;
  const validGames = Math.min(record.gamesAttended || 0, legend.gamesCount);
  jogoPoints += validGames * 10;
  if (legend.gamesCount > validGames && record.gamesJustified) {
    jogoPoints += (legend.gamesCount - validGames) * 4;
  }
  syncItems.push({
    category: 'jogo',
    points: jogoPoints,
    description: `Jogos (${validGames}/${legend.gamesCount}) ${legend.gamesDescription ? `- ${legend.gamesDescription}` : ''} — Sem. ${record.week}`,
    referenceId: `${baseRef}-jogo`,
    month: record.month,
    week: record.week,
  });

  // 2.3 Eventos
  let eventoPoints = 0;
  const validEvents = Math.min(record.eventsAttended || 0, legend.eventsCount);
  eventoPoints += validEvents * 5;
  if (legend.eventsCount > validEvents && record.eventsJustified) {
    eventoPoints += (legend.eventsCount - validEvents) * 4;
  }
  syncItems.push({
    category: 'evento',
    points: eventoPoints,
    description: `Eventos (${validEvents}/${legend.eventsCount}) ${legend.eventsDescription ? `- ${legend.eventsDescription}` : ''} — Sem. ${record.week}`,
    referenceId: `${baseRef}-evento`,
    month: record.month,
    week: record.week,
  });

  // 2.4 Associado (Mensal - 1x no mês)
  let assocPoints = 0;
  if (record.isAssociate && !isAlreadyAssociate) {
    assocPoints = 15;
  }
  syncItems.push({
    category: 'associado',
    points: assocPoints,
    description: `Bônus de Sócio/Associado — ${record.month}`,
    referenceId: `${baseRef}-associado`,
    month: record.month,
    week: record.week,
  });

  // 2.5 Pontos Extras
  syncItems.push({
    category: 'extra',
    points: Math.max(0, record.extraPoints || 0),
    description: `Pontos Extras: ${record.extraReason || 'Atividade da Gestão'} — Sem. ${record.week}`,
    referenceId: `${baseRef}-extra`,
    month: record.month,
    week: record.week,
  });

  // 2.6 Bônus Destaque do Mês (Semana 4 ou 5)
  let destaquePoints = 0;
  if ((record.week === 4 || record.week === 5) && record.monthlyHighlightBonus) {
    destaquePoints = 15;
  }
  syncItems.push({
    category: 'destaque',
    points: destaquePoints,
    description: `Bônus Destaque do Mês — ${record.month}`,
    referenceId: `${baseRef}-destaque`,
    month: record.month,
    week: record.week,
  });

  // 3. Sincroniza as transações de forma estritamente idempotente
  await syncMemberWeeklyPoints(record.memberId, syncItems);

  // 4. Se o Supabase estiver ativo, salva na tabela weekly_attendance
  if (isSupabaseConfigured() && supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(record.memberId);
      if (isUuid) {
        await supabase.from('weekly_attendance').upsert(
          {
            member_id: record.memberId,
            month: record.month,
            week: record.week,
            attended_training: record.attendedTraining,
            training_justified: record.trainingJustified,
            games_attended: record.gamesAttended,
            games_justified: record.gamesJustified,
            events_attended: record.eventsAttended,
            events_justified: record.eventsJustified,
            is_associate: record.isAssociate,
            extra_points: record.extraPoints,
            extra_reason: record.extraReason,
            monthly_highlight_bonus: record.monthlyHighlightBonus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'member_id,month,week' }
        );
      }
    } catch (err) {
      console.error('Erro ao salvar presença no Supabase:', err);
    }
  }

  return record;
}
