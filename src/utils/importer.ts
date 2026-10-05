import { Member, Meeting, AttendanceRecord, ParsedSheetPreview, AttendanceStatus } from '../types';

export function parseDelimitedText(text: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return [];

  // Determine delimiter: tab (\t), semicolon (;), comma (,)
  const firstLine = lines[0];
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  let delimiter = ',';
  if (tabCount >= 1 && tabCount >= semiCount && tabCount >= commaCount) {
    delimiter = '\t';
  } else if (semiCount >= commaCount && semiCount >= 1) {
    delimiter = ';';
  } else if (commaCount >= 1) {
    delimiter = ',';
  }

  return lines.map(line => {
    // Robust delimiter splitting
    const regex = new RegExp(`(?:^|${delimiter === '\\t' ? '\t' : delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter === '\\t' ? '\t' : delimiter}]*))`, 'g');
    const row: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let cell = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      if (cell === undefined) cell = '';
      row.push(cell.trim());
      if (regex.lastIndex === match.index) regex.lastIndex++;
    }
    return row.length > 0 ? row : line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
  });
}

export function analyzeSpreadsheet(rows: string[][]): ParsedSheetPreview | null {
  if (!rows || rows.length < 2) return null;

  const headers = rows[0].map(h => h.trim());
  const bodyRows = rows.slice(1);

  let nameIndex = -1;
  let deptIndex = -1;
  let roleIndex = -1;
  let phoneIndex = -1;
  let pointsIndex = -1;

  const dateColumns: { index: number; dateStr: string }[] = [];
  const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}([\/\-\.]\d{2,4})?|\d{4}-\d{2}-\d{2}|reuni[aã]o|meet|chamada)/i;

  headers.forEach((header, index) => {
    const clean = header.toLowerCase();

    if (nameIndex === -1 && (clean.includes('nome') || clean.includes('membro') || clean.includes('diretor') || clean.includes('pessoa') || clean === 'aluno')) {
      nameIndex = index;
    } else if (pointsIndex === -1 && (clean.includes('ponto') || clean.includes('pts') || clean.includes('score') || clean.includes('pontua'))) {
      pointsIndex = index;
    } else if (deptIndex === -1 && (clean.includes('diretoria') || clean.includes('departamento') || clean.includes('setor') || clean.includes('área') || clean.includes('area'))) {
      deptIndex = index;
    } else if (roleIndex === -1 && (clean.includes('cargo') || clean.includes('função') || clean.includes('funcao') || clean.includes('posição'))) {
      roleIndex = index;
    } else if (phoneIndex === -1 && (clean.includes('telefone') || clean.includes('whatsapp') || clean.includes('celular') || clean.includes('fone') || clean.includes('contato'))) {
      phoneIndex = index;
    } else if (dateRegex.test(clean) || /\d{1,2}\/\d{1,2}/.test(clean)) {
      dateColumns.push({ index, dateStr: header });
    }
  });

  // Fallbacks
  if (nameIndex === -1 && headers.length > 0) {
    nameIndex = 0;
  }
  if (pointsIndex === -1 && headers.length > 1 && headers[1].toLowerCase().includes('ponto')) {
    pointsIndex = 1;
  }
  if (deptIndex === -1 && headers.length > 2 && nameIndex !== 2 && pointsIndex !== 2) {
    deptIndex = 2;
  }

  const isMatrix = dateColumns.length >= 2;
  const isPointsRanking = pointsIndex >= 0;

  return {
    headers,
    rows: bodyRows,
    mode: isMatrix ? 'attendance_matrix' : isPointsRanking ? 'points_ranking' : 'members_only',
    dateColumns,
    detectedColumns: {
      nameIndex,
      deptIndex,
      roleIndex,
      phoneIndex,
      pointsIndex: pointsIndex >= 0 ? pointsIndex : undefined,
    },
  };
}

export function parseStatusValue(rawVal: string): AttendanceStatus {
  const v = rawVal.trim().toUpperCase();
  if (['P', '1', 'SIM', 'PRESENTE', 'OK', 'V', 'X', 'TRUE', 'S'].includes(v)) {
    return 'present';
  }
  if (['FJ', 'J', 'JUSTIFICADA', 'JUSTIFICADO', 'ATESTADO'].includes(v)) {
    return 'justified';
  }
  if (['A', 'ATRASO', 'ATRASADO', 'ATR'].includes(v)) {
    return 'late';
  }
  return 'absent';
}

const AVATAR_COLORS = [
  '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6',
  '#ef4444', '#3b82f6', '#14b8a6', '#84cc16', '#6366f1', '#f97316'
];

export function convertParsedToEntities(
  preview: ParsedSheetPreview,
  mappings: {
    nameIndex: number;
    deptIndex: number;
    roleIndex: number;
    phoneIndex: number;
    pointsIndex?: number;
    includeAttendanceDates: boolean;
  }
): {
  newMembers: Member[];
  newMeetings: Meeting[];
  newAttendance: AttendanceRecord[];
} {
  const newMembers: Member[] = [];
  const newMeetings: Meeting[] = [];
  const newAttendance: AttendanceRecord[] = [];
  const createdMemberIds: string[] = [];

  preview.rows.forEach((row, rIdx) => {
    const name = row[mappings.nameIndex]?.trim();
    if (!name || name.length < 2) return;

    let points = 0;
    if (mappings.pointsIndex !== undefined && mappings.pointsIndex >= 0 && row[mappings.pointsIndex]) {
      const parsedPts = parseInt(row[mappings.pointsIndex].replace(/\D/g, ''), 10);
      if (!isNaN(parsedPts)) points = parsedPts;
    }

    const department = mappings.deptIndex >= 0 && row[mappings.deptIndex]
      ? row[mappings.deptIndex].trim()
      : 'Geral';

    const role = mappings.roleIndex >= 0 && row[mappings.roleIndex]
      ? row[mappings.roleIndex].trim()
      : 'Membro';

    const phone = mappings.phoneIndex >= 0 && row[mappings.phoneIndex]
      ? row[mappings.phoneIndex].trim()
      : '';

    const memberId = `mem-imp-${rIdx + 1}-${Date.now()}`;
    createdMemberIds.push(memberId);

    newMembers.push({
      id: memberId,
      name,
      points,
      initialPoints: points,
      department: department || 'Geral',
      role: role || 'Membro',
      phone,
      active: true,
      avatarColor: AVATAR_COLORS[rIdx % AVATAR_COLORS.length],
      createdAt: new Date().toISOString(),
    });
  });

  return { newMembers, newMeetings, newAttendance };
}
