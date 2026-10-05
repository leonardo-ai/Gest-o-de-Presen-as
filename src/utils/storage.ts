import { Member, Meeting, AttendanceRecord, AthleticaConfig, ScoreRule, PointTransaction } from '../types';

export const DEFAULT_SCORE_RULES: ScoreRule[] = [
  { id: 'rule-treino', name: 'Treino', points: 5, description: 'Presença em treino oficial da atlética', icon: 'Dumbbell' },
  { id: 'rule-jogo', name: 'Jogo', points: 10, description: 'Participação/apoio em partida oficial ou amistoso', icon: 'Trophy' },
  { id: 'rule-evento', name: 'Eventos', points: 5, description: 'Ajuda ou presença em eventos e festas', icon: 'PartyPopper' },
  { id: 'rule-justificou', name: 'Justificou', points: 4, description: 'Falta com justificativa prévia aceita', icon: 'CheckSquare' },
  { id: 'rule-associado', name: 'Associado', points: 15, description: 'Bônus de sócio/associado ativo da atlética', icon: 'CreditCard' },
  { id: 'rule-bonus-area', name: 'Bônus Área', points: 10, description: 'Bônus por entrega ou destaque de diretoria/área', icon: 'Star' },
  { id: 'rule-reuniao', name: 'Reunião Geral', points: 5, description: 'Presença em Reunião Geral de Gestão', icon: 'Users' },
];

export const DEFAULT_CONFIG: AthleticaConfig = {
  name: 'Atlética ESPM Rio',
  acronym: 'ESPM RIO',
  university: 'ESPM Rio - Período 26.2',
  mascot: 'Jacaré',
  minAttendancePercent: 70,
  themeColor: '#18288A',
  scoreRules: DEFAULT_SCORE_RULES,
};

// Exact data from user's spreadsheet mapped to the 8 official areas:
const RAW_MEMBERS_DATA = [
  { name: 'Angelo Raphael', dept: 'Produção', role: 'Coordenador', points: 49 },
  { name: 'Anne Furtado', dept: 'Marketing', role: 'Coordenador', points: 43 },
  { name: 'Bernardo Flores', dept: 'Esportes', role: 'Coordenador', points: 10 },
  { name: 'Bianca Lourenço', dept: 'Presidência', role: 'Vice-Presidente', points: 79 },
  { name: 'Bruno Porter', dept: 'Esportes', role: 'Coordenador', points: 89 },
  { name: 'Carol Jordão', dept: 'Financeiro', role: 'Diretor', points: 83 },
  { name: 'Carol Paes', dept: 'Financeiro', role: 'Diretor', points: 58 },
  { name: 'Catarina Mayrink', dept: 'Criação', role: 'Coordenador', points: 74 },
  { name: 'Clara Medina', dept: 'Produção', role: 'Coordenador', points: 54 },
  { name: 'Dominique Poyastro', dept: 'Produção', role: 'Coordenador', points: 38 },
  { name: 'Esther Nunes', dept: 'Esportes', role: 'Coordenador', points: 73 },
  { name: 'Giovanna Akemi', dept: 'Produção', role: 'Coordenador', points: 79 },
  { name: 'Giovanna Motta', dept: 'Esportes', role: 'Coordenador', points: 35 },
  { name: 'Guilherme Martins', dept: 'Bateria', role: 'Diretor', points: 89 },
  { name: 'Hugo Bard', dept: 'Esportes', role: 'Coordenador', points: 20 },
  { name: 'Isabella Bugallo', dept: 'Criação', role: 'Coordenador', points: 55 },
  { name: 'Jasmyn Rodrigues', dept: 'Marketing', role: 'Coordenador', points: 0 },
  { name: 'Julia Carvalho', dept: 'Produção', role: 'Coordenador', points: 0 },
  { name: 'Julia Nascimento', dept: 'Produção', role: 'Diretor', points: 14 },
  { name: 'Kayque', dept: 'Produção', role: 'Coordenador', points: 4 },
  { name: 'Laura Esteves', dept: 'Produção', role: 'Coordenador', points: 44 },
  { name: 'Leonardo Kurtz', dept: 'Presidência', role: 'Presidente', points: 164 },
  { name: 'Leticia Guimarães', dept: 'Conteúdo', role: 'Diretor', points: 154 },
  { name: 'Lucas Queiroz', dept: 'Esportes', role: 'Coordenador', points: 50 },
  { name: 'Luisa Boa', dept: 'Criação', role: 'Diretor', points: 128 },
  { name: 'Luisa Petry', dept: 'Marketing', role: 'Diretor', points: 94 },
  { name: 'Manu Vasil', dept: 'Conteúdo', role: 'Coordenador', points: 9 },
  { name: 'Maria Clara de Mello', dept: 'Produção', role: 'Coordenador', points: 0 },
  { name: 'Mariana Collyer', dept: 'Marketing', role: 'Coordenador', points: 0 },
  { name: 'Mariana Quintes', dept: 'Esportes', role: 'Coordenador', points: 42 },
  { name: 'Matheus', dept: 'Conteúdo', role: 'Coordenador', points: 88 },
  { name: 'Miguel Nogueira', dept: 'Esportes', role: 'Coordenador', points: 70 },
  { name: 'Myrela Marins', dept: 'Financeiro', role: 'Coordenador', points: 34 },
  { name: 'Natalia', dept: 'Financeiro', role: 'Coordenador', points: 30 },
  { name: 'Pedro Martins', dept: 'Conteúdo', role: 'Coordenador', points: 35 },
  { name: 'Rafael', dept: 'Criação', role: 'Coordenador', points: 59 },
  { name: 'Rafaela Rodrigues', dept: 'Conteúdo', role: 'Coordenador', points: 34 },
  { name: 'Sara Queiroz', dept: 'Produção', role: 'Coordenador', points: 0 },
  { name: 'Sara Rota', dept: 'Esportes', role: 'Diretor', points: 117 },
  { name: 'Sarah Dutra', dept: 'Conteúdo', role: 'Coordenador', points: 9 },
  { name: 'Sarah Verissímo', dept: 'Produção', role: 'Coordenador', points: 12 },
  { name: 'Sophia Vilhena', dept: 'Conteúdo', role: 'Coordenador', points: 116 },
  { name: 'Valentina Araújo', dept: 'Produção', role: 'Coordenador', points: 4 },
  { name: 'Valentina Nepomuceno', dept: 'Marketing', role: 'Coordenador', points: 4 },
];

const AVATAR_COLORS = [
  '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6',
  '#ef4444', '#3b82f6', '#14b8a6', '#84cc16', '#6366f1', '#f97316'
];

export const INITIAL_MEMBERS: Member[] = RAW_MEMBERS_DATA.map((item, idx) => ({
  id: `mem-${idx + 1}`,
  name: item.name,
  points: item.points,
  initialPoints: item.points,
  department: item.dept,
  role: item.role,
  phone: '(11) 9' + Math.floor(10000000 + Math.random() * 90000000),
  active: true,
  avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
  createdAt: new Date().toISOString(),
}));

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Treino Oficial de Futsal & Handebol',
    type: 'treino',
    activityType: 'treino',
    pointsValue: 5,
    justifiedPointsValue: 4,
    date: '2026-09-28',
    time: '20:00',
    location: 'Ginásio Poliesportivo',
    description: 'Treino preparatório para os jogos universitários (+5 pts presença, +4 pts justificada).',
    mandatory: true,
  },
  {
    id: 'meet-2',
    title: 'Jogo Oficial Interatéticas: Atlética vs Economia',
    type: 'jogo',
    activityType: 'jogo',
    pointsValue: 10,
    justifiedPointsValue: 4,
    date: '2026-10-01',
    time: '14:30',
    location: 'Arena Central / Torcida da Bateria',
    description: 'Partida decisiva! Presença e apoio à torcida valem +10 pts!',
    mandatory: true,
  },
  {
    id: 'meet-3',
    title: 'Reunião Geral de Alinhamento da Gestão',
    type: 'reuniao_geral',
    activityType: 'reuniao',
    pointsValue: 5,
    justifiedPointsValue: 4,
    date: '2026-10-04',
    time: '19:30',
    location: 'Auditório / Google Meet',
    description: 'Apresentação das metas do mês e balanço das vendas.',
    mandatory: true,
  },
  {
    id: 'meet-4',
    title: 'Evento & Festa dos Calouros',
    type: 'evento',
    activityType: 'evento',
    pointsValue: 5,
    justifiedPointsValue: 4,
    date: '2026-10-10',
    time: '22:00',
    location: 'Espaço de Eventos Universitário',
    description: 'Trabalho de bar, portaria e suporte geral (+5 pontos).',
    mandatory: false,
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Sample records for meet-1 (Treino = 5 pts, Just = 4 pts)
  { memberId: 'mem-1', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },
  { memberId: 'mem-2', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },
  { memberId: 'mem-3', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },
  { memberId: 'mem-4', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },
  { memberId: 'mem-5', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },
  { memberId: 'mem-6', meetingId: 'meet-1', status: 'justified', pointsAwarded: 4, justificationReason: 'Aula de laboratório' },
  { memberId: 'mem-7', meetingId: 'meet-1', status: 'present', pointsAwarded: 5 },

  // Sample records for meet-2 (Jogo = 10 pts)
  { memberId: 'mem-1', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
  { memberId: 'mem-2', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
  { memberId: 'mem-3', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
  { memberId: 'mem-8', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
  { memberId: 'mem-9', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
  { memberId: 'mem-10', meetingId: 'meet-2', status: 'present', pointsAwarded: 10 },
];

export const INITIAL_TRANSACTIONS: PointTransaction[] = [
  { id: 'tx-1', memberId: 'mem-1', points: 15, reason: 'Bônus de Associado', date: '2026-09-15', ruleId: 'rule-associado' },
  { id: 'tx-2', memberId: 'mem-2', points: 15, reason: 'Bônus de Associado', date: '2026-09-15', ruleId: 'rule-associado' },
  { id: 'tx-3', memberId: 'mem-3', points: 10, reason: 'Bônus Área - Destaque Quadra', date: '2026-09-20', ruleId: 'rule-bonus-area' },
  { id: 'tx-4', memberId: 'mem-1', points: 10, reason: 'Jogo vs Economia', date: '2026-10-01', meetingId: 'meet-2' },
];

const STORAGE_KEYS = {
  MEMBERS: 'atletica_presenca_members_v4',
  MEETINGS: 'atletica_presenca_meetings_v4',
  ATTENDANCE: 'atletica_presenca_attendance_v4',
  CONFIG: 'atletica_presenca_config_v4',
  TRANSACTIONS: 'atletica_presenca_transactions_v4',
  SELECTED_AREA: 'atletica_selected_area_v4',
};

export function loadData() {
  try {
    const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const rawMeetings = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    const rawAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const rawTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    const members: Member[] = rawMembers ? JSON.parse(rawMembers) : INITIAL_MEMBERS;
    const meetings: Meeting[] = rawMeetings ? JSON.parse(rawMeetings) : INITIAL_MEETINGS;
    const attendance: AttendanceRecord[] = rawAttendance ? JSON.parse(rawAttendance) : INITIAL_ATTENDANCE;
    const config: AthleticaConfig = rawConfig ? JSON.parse(rawConfig) : DEFAULT_CONFIG;
    const transactions: PointTransaction[] = rawTransactions ? JSON.parse(rawTransactions) : INITIAL_TRANSACTIONS;

    return { members, meetings, attendance, config, transactions };
  } catch (e) {
    console.error('Error loading stored data:', e);
    return {
      members: INITIAL_MEMBERS,
      meetings: INITIAL_MEETINGS,
      attendance: INITIAL_ATTENDANCE,
      config: DEFAULT_CONFIG,
      transactions: INITIAL_TRANSACTIONS,
    };
  }
}

export function saveData(data: {
  members?: Member[];
  meetings?: Meeting[];
  attendance?: AttendanceRecord[];
  config?: AthleticaConfig;
  transactions?: PointTransaction[];
}) {
  try {
    if (data.members) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
    if (data.meetings) localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(data.meetings));
    if (data.attendance) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
    if (data.config) localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
    if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
  } catch (e) {
    console.error('Error saving data to localStorage:', e);
  }
}

export function loadSelectedArea(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_AREA);
  } catch {
    return null;
  }
}

export function saveSelectedArea(area: string | null) {
  try {
    if (area) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_AREA, area);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_AREA);
    }
  } catch (e) {
    console.error('Error saving selected area:', e);
  }
}

export function resetToDemoData() {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.removeItem(STORAGE_KEYS.SELECTED_AREA);
  return {
    members: INITIAL_MEMBERS,
    meetings: INITIAL_MEETINGS,
    attendance: INITIAL_ATTENDANCE,
    config: DEFAULT_CONFIG,
    transactions: INITIAL_TRANSACTIONS,
  };
}
