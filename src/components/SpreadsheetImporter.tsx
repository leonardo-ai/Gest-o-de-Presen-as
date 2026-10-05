import React, { useState, useId } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Check, 
  Info, 
  RefreshCw,
  Table
} from 'lucide-react';
import { Member, Meeting, AttendanceRecord, ParsedSheetPreview } from '../types';
import { parseDelimitedText, analyzeSpreadsheet, convertParsedToEntities } from '../utils/importer';

interface SpreadsheetImporterProps {
  onImportComplete: (data: {
    members: Member[];
    meetings: Meeting[];
    attendance: AttendanceRecord[];
    mode: 'replace' | 'merge';
  }) => void;
  currentMembers: Member[];
  currentMeetings: Meeting[];
  currentAttendance: AttendanceRecord[];
}

export const SpreadsheetImporter: React.FC<SpreadsheetImporterProps> = ({
  onImportComplete,
  currentMembers,
  currentMeetings,
  currentAttendance,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedSheetPreview | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  // Mapping selections
  const [nameCol, setNameCol] = useState<number>(0);
  const [pointsCol, setPointsCol] = useState<number>(1);
  const [deptCol, setDeptCol] = useState<number>(2);
  const [roleCol, setRoleCol] = useState<number>(-1);
  const [phoneCol, setPhoneCol] = useState<number>(-1);
  const [includeDates, setIncludeDates] = useState<boolean>(true);

  const [notification, setNotification] = useState<string | null>(null);

  const nameSelectId = useId();
  const deptSelectId = useId();
  const roleSelectId = useId();
  const phoneSelectId = useId();
  const fileInputId = useId();

  // Process text change
  const handleParse = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    const rows = parseDelimitedText(text);
    const analysis = analyzeSpreadsheet(rows);
    if (analysis) {
      setParsedPreview(analysis);
      setNameCol(analysis.detectedColumns.nameIndex >= 0 ? analysis.detectedColumns.nameIndex : 0);
      setPointsCol(analysis.detectedColumns.pointsIndex !== undefined ? analysis.detectedColumns.pointsIndex : -1);
      setDeptCol(analysis.detectedColumns.deptIndex >= 0 ? analysis.detectedColumns.deptIndex : -1);
      setRoleCol(analysis.detectedColumns.roleIndex >= 0 ? analysis.detectedColumns.roleIndex : -1);
      setPhoneCol(analysis.detectedColumns.phoneIndex >= 0 ? analysis.detectedColumns.phoneIndex : -1);
    } else {
      setParsedPreview(null);
    }
  };

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  // Load sample data preset
  const handleLoadPreset = (type: 'matrix' | 'list') => {
    if (type === 'matrix') {
      const sample = [
        'Nome\tDiretoria\tCargo\tTelefone\t05/09\t12/09\t19/09\t26/09',
        'Leonardo Kurtz\tPresidência\tPresidente\t(11) 99999-1111\tP\tP\tP\tP',
        'Ana Clara Silva\tPresidência\tVice-Presidente\t(11) 98888-2222\tP\tP\tFJ\tP',
        'Pedro Henrique\tEsportes\tDiretor de Esportes\t(11) 97777-3333\tP\tF\tP\tP',
        'Carolina Ramos\tEsportes\tAssessora de Quadra\t(11) 96666-4444\tP\tP\tP\tP',
        'Matheus Oliveira\tEventos\tDiretor de Eventos\t(11) 95555-5555\tP\tP\tP\tA',
        'Gabriela Fontes\tEventos\tAssessora de Produção\t(11) 94444-6666\tFJ\tP\tP\tP',
        'Lucas Martins\tMarketing\tDiretor de Comunicação\t(11) 93333-7777\tP\tP\tP\tP',
        'Mariana Santos\tFinanceiro\tDiretora Financeira\t(11) 92222-8888\tP\tP\tP\tF',
        'João Vitor\tPatrimônio\tDiretor de Produtos\t(11) 91111-9999\tF\tF\tP\tP',
      ].join('\n');
      handleParse(sample);
    } else {
      const sample = [
        'Nome\tDiretoria\tCargo\tTelefone',
        'Arthur Bernardes\tPresidência\tPresidente\t(11) 99888-1010',
        'Fernanda Paiva\tEsportes\tCoordenadora de Vôlei\t(11) 99777-2020',
        'Renato Carioca\tMarketing\tRedator / Redes\t(11) 99666-3030',
        'Bruna Vasconcelos\tEventos\tAssessora de Bar\t(11) 99555-4040',
        'Felipe Barreto\tFinanceiro\tTesoureiro\t(11) 99444-5050',
      ].join('\n');
      handleParse(sample);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;

    const { newMembers, newMeetings, newAttendance } = convertParsedToEntities(
      parsedPreview,
      {
        nameIndex: nameCol,
        pointsIndex: pointsCol >= 0 ? pointsCol : undefined,
        deptIndex: deptCol,
        roleIndex: roleCol,
        phoneIndex: phoneCol,
        includeAttendanceDates: includeDates,
      }
    );

    if (newMembers.length === 0) {
      alert('Nenhum membro válido foi detectado. Verifique as colunas selecionadas.');
      return;
    }

    if (importMode === 'replace') {
      onImportComplete({
        members: newMembers,
        meetings: newMeetings.length > 0 ? newMeetings : currentMeetings,
        attendance: newAttendance,
        mode: 'replace',
      });
    } else {
      // Merge with existing
      const combinedMembers = [...currentMembers];
      newMembers.forEach(nm => {
        if (!combinedMembers.some(m => m.name.toLowerCase() === nm.name.toLowerCase())) {
          combinedMembers.push(nm);
        }
      });

      const combinedMeetings = [...currentMeetings];
      newMeetings.forEach(nm => {
        if (!combinedMeetings.some(m => m.title.toLowerCase() === nm.title.toLowerCase() && m.date === nm.date)) {
          combinedMeetings.push(nm);
        }
      });

      const combinedAttendance = [...currentAttendance, ...newAttendance];

      onImportComplete({
        members: combinedMembers,
        meetings: combinedMeetings,
        attendance: combinedAttendance,
        mode: 'merge',
      });
    }

    setNotification(
      `Sucesso! ${newMembers.length} membros ${
        newMeetings.length > 0 ? `e ${newMeetings.length} reuniões ` : ''
      }foram importados com êxito.`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Guidance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Importar Planilha da Atlética
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cole os dados direto da sua planilha do <strong>Google Sheets</strong> ou <strong>Excel</strong> (Ctrl+C na planilha e Ctrl+V aqui), ou faça o upload de um arquivo CSV.
            </p>
          </div>
        </div>

        {/* Tip / Tutorial Card */}
        <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Como funciona?</strong> O sistema aceita tanto uma <em>lista simples de diretores/membros</em> (com Nome, Diretoria, Cargo, Telefone) quanto uma <em>matriz completa com datas</em> (com P = Presente, F = Falta, FJ = Falta Justificada, A = Atraso).
          </div>
        </div>

        {/* Sample buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Testar com exemplos:</span>
          <button
            onClick={() => handleLoadPreset('matrix')}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 cursor-pointer"
          >
            📋 Exemplo: Matriz com Datas e Presenças
          </button>
          <button
            onClick={() => handleLoadPreset('list')}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            👥 Exemplo: Lista de Membros da Diretoria
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Área de Colagem (Copie e Cole as células aqui):
          </label>
          <label htmlFor={fileInputId} className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">
            <UploadCloud className="w-3.5 h-3.5" />
            Ou carregar arquivo CSV / TSV
            <input
              id={fileInputId}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          rows={6}
          value={rawText}
          onChange={e => handleParse(e.target.value)}
          placeholder="Cole aqui as linhas da sua planilha (ex: Nome	Diretoria	Cargo	Telefone	05/09	12/09...)"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {notification && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            {notification}
          </div>
        )}
      </div>

      {/* Preview & Mapping Section */}
      {parsedPreview && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" />
                Mapeamento de Colunas Detectadas
              </h3>
              <p className="text-xs text-slate-400">
                Detectamos {parsedPreview.rows.length} linhas de membros{' '}
                {parsedPreview.dateColumns && parsedPreview.dateColumns.length > 0 && (
                  <span className="text-emerald-400 font-semibold">
                    e {parsedPreview.dateColumns.length} datas de reunião ({parsedPreview.dateColumns.map(d => d.dateStr).join(', ')})
                  </span>
                )}
                .
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Modo de importação:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-emerald-500 focus:ring-emerald-400"
                />
                Substituir dados atuais
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-emerald-500 focus:ring-emerald-400"
                />
                Mesclar com existentes
              </label>
            </div>
          </div>

          {/* Selectors for columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label htmlFor={nameSelectId} className="block text-xs font-semibold text-slate-300 mb-1">
                Coluna de Nome *:
              </label>
              <select
                id={nameSelectId}
                value={nameCol}
                onChange={e => setNameCol(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                {parsedPreview.headers.map((h, idx) => (
                  <option key={idx} value={idx}>
                    Coluna {idx + 1}: {h || `(Vazio)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                Coluna de Pontos:
              </label>
              <select
                value={pointsCol}
                onChange={e => setPointsCol(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
              >
                <option value={-1}>-- Sem Pontos --</option>
                {parsedPreview.headers.map((h, idx) => (
                  <option key={idx} value={idx}>
                    Coluna {idx + 1}: {h || `(Vazio)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={deptSelectId} className="block text-xs font-semibold text-slate-300 mb-1">
                Coluna Diretoria:
              </label>
              <select
                id={deptSelectId}
                value={deptCol}
                onChange={e => setDeptCol(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={-1}>-- Nenhuma (Usar 'Geral') --</option>
                {parsedPreview.headers.map((h, idx) => (
                  <option key={idx} value={idx}>
                    Coluna {idx + 1}: {h || `(Vazio)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={roleSelectId} className="block text-xs font-semibold text-slate-300 mb-1">
                Coluna Cargo / Função:
              </label>
              <select
                id={roleSelectId}
                value={roleCol}
                onChange={e => setRoleCol(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={-1}>-- Nenhuma (Usar 'Membro') --</option>
                {parsedPreview.headers.map((h, idx) => (
                  <option key={idx} value={idx}>
                    Coluna {idx + 1}: {h || `(Vazio)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={phoneSelectId} className="block text-xs font-semibold text-slate-300 mb-1">
                Coluna Telefone / WhatsApp:
              </label>
              <select
                id={phoneSelectId}
                value={phoneCol}
                onChange={e => setPhoneCol(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={-1}>-- Não importar telefone --</option>
                {parsedPreview.headers.map((h, idx) => (
                  <option key={idx} value={idx}>
                    Coluna {idx + 1}: {h || `(Vazio)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {parsedPreview.dateColumns && parsedPreview.dateColumns.length > 0 && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                <strong>Importar presenças das datas?</strong> Encontramos {parsedPreview.dateColumns.length} colunas com datas/reuniões.
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-400">
                <input
                  type="checkbox"
                  checked={includeDates}
                  onChange={e => setIncludeDates(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                Sim, importar reuniões e histórico de presença
              </label>
            </div>
          )}

          {/* Table Preview */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-2.5">#</th>
                  {parsedPreview.headers.map((h, i) => (
                    <th key={i} className="p-2.5 whitespace-nowrap">
                      {h || `Col ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300 font-mono text-[11px]">
                {parsedPreview.rows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-slate-500 font-sans">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 whitespace-nowrap">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedPreview.rows.length > 5 && (
            <p className="text-[11px] text-slate-500 italic">
              Mostrando as 5 primeiras de {parsedPreview.rows.length} linhas importadas.
            </p>
          )}

          {/* Confirm Button */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => {
                setParsedPreview(null);
                setRawText('');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              Processar e Atualizar App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
