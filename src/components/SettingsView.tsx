import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { AthleticaConfig, Member, Meeting, AttendanceRecord } from '../types';
import { exportBackupJSON } from '../utils/export';

interface SettingsViewProps {
  config: AthleticaConfig;
  members: Member[];
  meetings: Meeting[];
  attendance: AttendanceRecord[];
  onSaveConfig: (newConfig: AthleticaConfig) => void;
  onResetDemo: () => void;
  onRestoreBackup: (data: {
    members: Member[];
    meetings: Meeting[];
    attendance: AttendanceRecord[];
    config: AthleticaConfig;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  members,
  meetings,
  attendance,
  onSaveConfig,
  onResetDemo,
  onRestoreBackup,
}) => {
  const [formData, setFormData] = useState<AthleticaConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupDownload = () => {
    exportBackupJSON({
      members,
      meetings,
      attendance,
      config: formData,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.members && json.meetings && json.attendance) {
          onRestoreBackup(json);
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch {
        alert('Erro ao ler o arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Configurações da Atlética</h2>
            <p className="text-xs text-slate-400">
              Personalize a identidade da sua atlética, regra de frequência e faça backup.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Atlética:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Atlética Soberana / Engenharia"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sigla Oficial:
            </label>
            <input
              type="text"
              value={formData.acronym}
              onChange={e => setFormData({ ...formData, acronym: e.target.value })}
              placeholder="Ex: A.A.A.S. ou AAAENG"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Universidade / Campus:
            </label>
            <input
              type="text"
              value={formData.university || ''}
              onChange={e => setFormData({ ...formData, university: e.target.value })}
              placeholder="Ex: USP, UFRJ, UFMG, FGV, PUC"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mascote:
            </label>
            <input
              type="text"
              value={formData.mascot || ''}
              onChange={e => setFormData({ ...formData, mascot: e.target.value })}
              placeholder="Ex: Touro, Tubarão, Lobo, Tigre"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Presença Mínima Obrigatória (%):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="50"
                max="100"
                value={formData.minAttendancePercent}
                onChange={e =>
                  setFormData({ ...formData, minAttendancePercent: Number(e.target.value) })
                }
                className="w-24 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <span className="text-xs text-slate-400">
                Gatilho para marcar diretores com baixa frequência (Alerta).
              </span>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Configurações salvas com sucesso!
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Identidade
          </button>
        </div>
      </form>

      {/* Backup and Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          Backup e Restauração de Dados
        </h3>
        <p className="text-xs text-slate-400">
          Você pode baixar uma cópia completa dos seus dados em JSON para guardar em segurança ou restaurar em outro navegador/dispositivo.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackupDownload}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Baixar Backup Completo (.JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-400" />
            Restaurar de Arquivo JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-slate-900/60 border border-red-900/30 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-red-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-400" />
            Restaurar Dados de Exemplo
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Restaura o sistema para a base inicial de demonstração da diretoria.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Tem certeza? Isso substituirá os dados atuais pelos dados de demonstração padrão.')) {
              onResetDemo();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Demo
        </button>
      </div>
    </div>
  );
};
