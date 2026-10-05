import { MonthKey, WeekKey, WeekScheduleLegend, WeeklyMemberAttendance } from '../types';

export const ATTENDANCE_MONTHS: { key: MonthKey; label: string }[] = [
  { key: '2026-08', label: 'Agosto de 2026' },
  { key: '2026-09', label: 'Setembro de 2026' },
  { key: '2026-10', label: 'Outubro de 2026' },
  { key: '2026-11', label: 'Novembro de 2026' },
  { key: '2026-12', label: 'Dezembro de 2026' },
  { key: '2027-01', label: 'Janeiro de 2027' },
  { key: '2027-02', label: 'Fevereiro de 2027' },
  { key: '2027-03', label: 'Março de 2027' },
  { key: '2027-04', label: 'Abril de 2027' },
];

export interface WeekDefinition {
  week: WeekKey;
  label: string;
  dateRange: string;
  hadTraining: boolean;
  trainingLocation?: string;
  gamesCount: number;
  gamesDescription?: string;
  eventsCount: number;
  eventsDescription?: string;
}

export const MONTH_SCHEDULES: Record<MonthKey, { label: string; weeks: WeekDefinition[] }> = {
  '2026-08': {
    label: 'Agosto de 2026',
    weeks: [
      { 
        week: 1, 
        label: 'Semana 1', 
        dateRange: '02 a 09/08/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 0, 
        gamesDescription: '', 
        eventsCount: 1, 
        eventsDescription: 'Atlética Day' 
      },
      { 
        week: 2, 
        label: 'Semana 2', 
        dateRange: '10 a 16/08/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'BM e HM', 
        eventsCount: 1, 
        eventsDescription: 'ESPM Parque' 
      },
      { 
        week: 3, 
        label: 'Semana 3', 
        dateRange: '17 a 23/08/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 1, 
        gamesDescription: 'Futsal Masc.', 
        eventsCount: 1, 
        eventsDescription: 'Evento da semana' 
      },
      { 
        week: 4, 
        label: 'Semana 4', 
        dateRange: '24 a 30/08/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'BM e FM', 
        eventsCount: 1, 
        eventsDescription: 'Evento da semana' 
      },
    ],
  },
  '2026-09': {
    label: 'Setembro de 2026',
    weeks: [
      { 
        week: 1, 
        label: 'Semana 1', 
        dateRange: '31/08 a 06/09/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 0, 
        gamesDescription: '', 
        eventsCount: 2, 
        eventsDescription: 'Reunião Geral' 
      },
      { 
        week: 2, 
        label: 'Semana 2', 
        dateRange: '07 a 13/09/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 1, 
        gamesDescription: 'Hand. Masc.', 
        eventsCount: 0, 
        eventsDescription: '' 
      },
      { 
        week: 3, 
        label: 'Semana 3', 
        dateRange: '14 a 20/09/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'VF e HM', 
        eventsCount: 1, 
        eventsDescription: 'Resenha' 
      },
      { 
        week: 4, 
        label: 'Semana 4', 
        dateRange: '21 a 28/09/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'FM e VF', 
        eventsCount: 0, 
        eventsDescription: '' 
      },
    ],
  },
  '2026-10': {
    label: 'Outubro de 2026',
    weeks: [
      { 
        week: 1, 
        label: 'Semana 1', 
        dateRange: '29/09 a 04/10/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 0, 
        gamesDescription: '', 
        eventsCount: 2, 
        eventsDescription: 'Reunião Geral' 
      },
      { 
        week: 2, 
        label: 'Semana 2', 
        dateRange: '05 a 11/10/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 1, 
        gamesDescription: 'Hand. Masc.', 
        eventsCount: 0, 
        eventsDescription: '' 
      },
      { 
        week: 3, 
        label: 'Semana 3', 
        dateRange: '12 a 18/10/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'VF e HM', 
        eventsCount: 1, 
        eventsDescription: 'Resenha' 
      },
      { 
        week: 4, 
        label: 'Semana 4', 
        dateRange: '19 a 28/10/2026', 
        hadTraining: true, 
        trainingLocation: 'Orsina', 
        gamesCount: 2, 
        gamesDescription: 'FM e VF', 
        eventsCount: 0, 
        eventsDescription: '' 
      },
    ],
  },
  '2026-11': {
    label: 'Novembro de 2026',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '02 a 08/11/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, gamesDescription: 'Futsal', eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '09 a 15/11/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, gamesDescription: 'Handebol e Basquete', eventsCount: 1, eventsDescription: 'Torneio Interno' },
      { week: 3, label: 'Semana 3', dateRange: '16 a 22/11/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 0, eventsCount: 0 },
      { week: 4, label: 'Semana 4', dateRange: '23 a 30/11/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, gamesDescription: 'Vôlei', eventsCount: 1, eventsDescription: 'Cervejada da Gestão' },
    ],
  },
  '2026-12': {
    label: 'Dezembro de 2026',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '01 a 07/12/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '08 a 14/12/2026', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 1, eventsDescription: 'Confraternização de Fim de Período' },
      { week: 3, label: 'Semana 3', dateRange: '15 a 21/12/2026', hadTraining: false, gamesCount: 0, eventsCount: 0 },
      { week: 4, label: 'Semana 4', dateRange: '22 a 31/12/2026', hadTraining: false, gamesCount: 0, eventsCount: 0 },
    ],
  },
  '2027-01': {
    label: 'Janeiro de 2027',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '04 a 10/01/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 0, eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '11 a 17/01/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 3, label: 'Semana 3', dateRange: '18 a 24/01/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 1 },
      { week: 4, label: 'Semana 4', dateRange: '25 a 31/01/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, eventsCount: 1 },
    ],
  },
  '2027-02': {
    label: 'Fevereiro de 2027',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '01 a 07/02/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '08 a 14/02/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, eventsCount: 1 },
      { week: 3, label: 'Semana 3', dateRange: '15 a 21/02/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 4, label: 'Semana 4', dateRange: '22 a 28/02/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 1 },
    ],
  },
  '2027-03': {
    label: 'Março de 2027',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '01 a 07/03/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '08 a 14/03/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, eventsCount: 1 },
      { week: 3, label: 'Semana 3', dateRange: '15 a 21/03/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 4, label: 'Semana 4', dateRange: '22 a 31/03/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 1 },
    ],
  },
  '2027-04': {
    label: 'Abril de 2027',
    weeks: [
      { week: 1, label: 'Semana 1', dateRange: '01 a 07/04/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 2, label: 'Semana 2', dateRange: '08 a 14/04/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, eventsCount: 1 },
      { week: 3, label: 'Semana 3', dateRange: '15 a 21/04/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 1, eventsCount: 0 },
      { week: 4, label: 'Semana 4', dateRange: '22 a 30/04/2027', hadTraining: true, trainingLocation: 'Orsina', gamesCount: 2, eventsCount: 1 },
    ],
  },
};

const LEGENDS_STORAGE_KEY = 'atletica_weekly_legends_v5';
const WEEKLY_RECORDS_STORAGE_KEY = 'atletica_weekly_records_v5';

export function getWeeksForMonth(month: MonthKey): WeekDefinition[] {
  return MONTH_SCHEDULES[month]?.weeks || MONTH_SCHEDULES['2026-08'].weeks;
}

export function getDefaultLegend(month: MonthKey, week: WeekKey): WeekScheduleLegend {
  const weeks = getWeeksForMonth(month);
  const found = weeks.find(w => w.week === week) || weeks[0];

  return {
    id: `${month}-w${week}`,
    month,
    week,
    dateRange: found.dateRange,
    hadTraining: found.hadTraining,
    trainingLocation: found.trainingLocation,
    gamesCount: found.gamesCount,
    gamesDescription: found.gamesDescription,
    eventsCount: found.eventsCount,
    eventsDescription: found.eventsDescription,
  };
}

export function loadWeekLegends(): Record<string, WeekScheduleLegend> {
  try {
    const raw = localStorage.getItem(LEGENDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWeekLegend(legend: WeekScheduleLegend) {
  const all = loadWeekLegends();
  all[legend.id] = legend;
  localStorage.setItem(LEGENDS_STORAGE_KEY, JSON.stringify(all));
}

export function getLegendFor(month: MonthKey, week: WeekKey): WeekScheduleLegend {
  const all = loadWeekLegends();
  const id = `${month}-w${week}`;
  return all[id] || getDefaultLegend(month, week);
}

export function loadWeeklyRecords(): WeeklyMemberAttendance[] {
  try {
    const raw = localStorage.getItem(WEEKLY_RECORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWeeklyRecords(records: WeeklyMemberAttendance[]) {
  localStorage.setItem(WEEKLY_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function isMemberAlreadyCountedAssociateInMonth(
  memberId: string,
  month: MonthKey,
  currentWeek: WeekKey,
  allRecords: WeeklyMemberAttendance[]
): boolean {
  return allRecords.some(
    r => r.memberId === memberId &&
         r.month === month &&
         r.week < currentWeek &&
         r.isAssociate === true
  );
}

export function calculateWeeklyPoints(
  record: WeeklyMemberAttendance,
  legend: WeekScheduleLegend,
  isAlreadyAssociateThisMonth: boolean
): number {
  let pts = 0;

  // 1. Treino
  if (legend.hadTraining) {
    if (record.attendedTraining === true) {
      pts += 5;
    } else if (record.attendedTraining === false && record.trainingJustified === true) {
      pts += 4;
    }
  }

  // 2. Jogos
  const gamesWent = Math.max(0, record.gamesAttended || 0);
  const validGames = Math.min(gamesWent, legend.gamesCount);
  pts += validGames * 10;
  if (legend.gamesCount > validGames && record.gamesJustified) {
    pts += (legend.gamesCount - validGames) * 4;
  }

  // 3. Eventos
  const eventsWent = Math.max(0, record.eventsAttended || 0);
  const validEvents = Math.min(eventsWent, legend.eventsCount);
  pts += validEvents * 5;
  if (legend.eventsCount > validEvents && record.eventsJustified) {
    pts += (legend.eventsCount - validEvents) * 4;
  }

  // 4. Associado (Mensal - 1x no mês)
  if (record.isAssociate && !isAlreadyAssociateThisMonth) {
    pts += 15;
  }

  // 5. Extras
  if (record.extraPoints && record.extraPoints > 0) {
    pts += Number(record.extraPoints);
  }

  // 6. Bônus Destaque do Mês (Semana 4 ou última semana)
  if ((record.week === 4 || record.week === 5) && record.monthlyHighlightBonus) {
    pts += 15;
  }

  return pts;
}
