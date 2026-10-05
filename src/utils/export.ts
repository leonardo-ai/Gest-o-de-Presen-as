import { Member, Meeting, AttendanceRecord, AthleticaConfig } from '../types';

export function exportAttendanceToCSV(
  members: Member[],
  meetings: Meeting[],
  attendance: AttendanceRecord[]
): void {
  // Sort meetings by date
  const sortedMeetings = [...meetings].sort((a, b) => a.date.localeCompare(b.date));

  // Headers: Nome, Diretoria, Cargo, Telefone, [Meeting Dates...], Total Presenças, Total Faltas, % Frequência
  const headerRow = [
    'Nome',
    'Diretoria',
    'Cargo',
    'Telefone',
    ...sortedMeetings.map(m => `"${m.date} - ${m.title.replace(/"/g, '""')}"`),
    'Presenças',
    'Justificadas',
    'Atrasos',
    'Faltas',
    '% Frequência',
  ];

  const rows: string[] = [headerRow.join(';')];

  members.forEach(member => {
    let presentCount = 0;
    let justifiedCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const meetingStatuses = sortedMeetings.map(m => {
      const rec = attendance.find(a => a.memberId === member.id && a.meetingId === m.id);
      if (!rec) {
        absentCount++;
        return 'F';
      }
      if (rec.status === 'present') {
        presentCount++;
        return 'P';
      }
      if (rec.status === 'justified') {
        justifiedCount++;
        return 'FJ';
      }
      if (rec.status === 'late') {
        lateCount++;
        return 'A';
      }
      absentCount++;
      return 'F';
    });

    const total = sortedMeetings.length;
    // Weighted attendance: present (1), late (0.8), justified (0.5 or not counted against)
    const effectiveAttended = presentCount + (lateCount * 0.8) + (justifiedCount * 0.7);
    const percent = total > 0 ? Math.round((effectiveAttended / total) * 100) : 100;

    const row = [
      `"${member.name.replace(/"/g, '""')}"`,
      `"${member.department.replace(/"/g, '""')}"`,
      `"${member.role.replace(/"/g, '""')}"`,
      `"${member.phone || ''}"`,
      ...meetingStatuses,
      presentCount,
      justifiedCount,
      lateCount,
      absentCount,
      `${percent}%`,
    ];

    rows.push(row.join(';'));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n'); // Add BOM for Excel UTF-8 recognition
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `presenca_atletica_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(data: {
  members: Member[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  config: AthleticaConfig;
}): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_atletica_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
