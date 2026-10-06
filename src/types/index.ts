export type AttendanceStatus = 'present' | 'absent' | 'justified' | 'late';

export type ActivityType = 
  | 'treino' 
  | 'jogo' 
  | 'evento' 
  | 'reuniao'
  | 'plantao'
  | 'outro';

export type OfficialArea = 
  | 'Presidência' 
  | 'Esportes' 
  | 'Marketing' 
  | 'Produção' 
  | 'Financeiro' 
  | 'Conteúdo' 
  | 'Criação' 
  | 'Bateria';

export const OFFICIAL_AREAS: OfficialArea[] = [
  'Presidência',
  'Esportes',
  'Marketing',
  'Produção',
  'Financeiro',
  'Conteúdo',
  'Criação',
  'Bateria',
];

export type MeetingType = 
  | 'reuniao_geral' 
  | 'reuniao_diretoria' 
  | 'plantao' 
  | 'evento' 
  | 'treino' 
  | 'jogo' 
  | 'outro';

export interface ScoreRule {
  id: string;
  name: string;
  points: number;
  description?: string;
  icon?: string;
}

export type PointCategory = 
  | 'treino'
  | 'jogo'
  | 'evento'
  | 'associado'
  | 'destaque'
  | 'extra'
  | 'ajuste_manual'
  | 'carga_inicial';

export interface PointTransaction {
  id: string;
  memberId: string;
  points: number;
  category?: PointCategory;
  description?: string;
  reason?: string;
  referenceId?: string;
  date?: string;
  month?: string;
  week?: number;
  meetingId?: string;
  ruleId?: string;
  createdAt?: string;
}

export interface Member {
  id: string;
  name: string;
  points: number;
  initialPoints?: number;
  department: string;
  role: string;
  phone?: string;
  email?: string;
  active: boolean;
  avatarColor?: string;
  createdAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  activityType?: ActivityType;
  pointsValue?: number; // points given on presence
  justifiedPointsValue?: number; // points given on justified absence (default 4 from user sheet)
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  description?: string;
  mandatory?: boolean;
}

export interface AttendanceRecord {
  memberId: string;
  meetingId: string;
  status: AttendanceStatus;
  justificationReason?: string;
  pointsAwarded?: number;
  updatedAt?: string;
}

export interface AthleticaConfig {
  name: string;
  acronym: string;
  university?: string;
  mascot?: string;
  minAttendancePercent: number; // default 75%
  themeColor: string;
  scoreRules: ScoreRule[];
}

export type MonthKey = 
  | '2026-08'
  | '2026-09'
  | '2026-10'
  | '2026-11'
  | '2026-12'
  | '2027-01'
  | '2027-02'
  | '2027-03'
  | '2027-04';

export type WeekKey = 1 | 2 | 3 | 4 | 5;

export interface WeekScheduleLegend {
  id: string; // e.g. "2026-10-w1"
  month: MonthKey;
  week: WeekKey;
  dateRange: string; // e.g. "01/10 a 07/10/2026"
  hadTraining: boolean; // Se teve treino na semana
  trainingLocation?: string; // Local/detalhe do treino (ex: Orsina)
  gamesCount: number; // Quantos jogos teve na semana (0 = não teve)
  gamesDescription?: string; // Quais foram os jogos
  eventsCount: number; // Quantos eventos tiveram na semana (0 = não teve)
  eventsDescription?: string; // Quais foram os eventos
}

export interface WeeklyMemberAttendance {
  id: string; // e.g. "rec-memId-2026-10-w1"
  memberId: string;
  month: MonthKey;
  week: WeekKey;
  // Treino
  attendedTraining?: boolean; // Sim ou Não
  trainingJustified?: boolean; // Justificou? Sim ou Não
  // Jogos
  gamesAttended: number; // número de jogos que o membro foi
  gamesJustified?: boolean; // caso inferior ao da legenda: Justificou?
  // Eventos
  eventsAttended: number; // número de eventos que o membro foi
  eventsJustified?: boolean; // caso inferior ao da legenda: Justificou?
  // Associado (mensal)
  isAssociate?: boolean;
  // Extras
  extraPoints: number;
  extraReason?: string;
  // Bônus Destaque do Mês (apenas semana 4)
  monthlyHighlightBonus?: boolean;
  updatedAt?: string;
}

export interface ParsedSheetPreview {
  headers: string[];
  rows: string[][];
  mode: 'members_only' | 'attendance_matrix' | 'points_ranking';
  dateColumns?: { index: number; dateStr: string }[];
  detectedColumns: {
    nameIndex: number;
    deptIndex: number;
    roleIndex: number;
    phoneIndex: number;
    pointsIndex?: number;
  };
}

