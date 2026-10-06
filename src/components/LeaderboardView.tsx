import React, { useState, useEffect } from 'react';
import { Search, History, X } from 'lucide-react';
import { Member, OfficialArea, PointTransaction } from '../types';
import { getMemberTransactions } from '../services/pointsService';

interface LeaderboardViewProps {
  members: Member[];
  currentArea?: OfficialArea | 'Todas as Áreas';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  members,
  currentArea,
}) => {
  const isPresidency = currentArea === 'Presidência';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<Member | null>(null);
  const [memberTransactions, setMemberTransactions] = useState<PointTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Carregar histórico de transações quando selecionar um membro
  useEffect(() => {
    if (selectedMemberForHistory) {
      setIsLoadingHistory(true);
      getMemberTransactions(selectedMemberForHistory.id).then(txs => {
        setMemberTransactions(txs);
        setIsLoadingHistory(false);
      });
    } else {
      setMemberTransactions([]);
    }
  }, [selectedMemberForHistory]);

  // Identificar se o membro é diretor ou da presidência (não disputa)
  const isExcludedFromCompetition = (m: Member) => {
    const isPresidencyDept = m.department.toLowerCase().includes('presidência') || m.department.toLowerCase().includes('presidencia');
    const isDirectorRole = m.role.toLowerCase().includes('diretor') || m.role.toLowerCase().includes('diretora') || m.role.toLowerCase().includes('presidente');
    return isPresidencyDept || isDirectorRole;
  };

  // Se for na Presidência, aparecem TODOS. Nas outras áreas, exclui diretoria e presidência.
  const displayMembers = isPresidency
    ? members
    : members.filter(m => !isExcludedFromCompetition(m));

  // Ordenar por pontos em ordem decrescente
  const sortedMembers = [...displayMembers].sort((a, b) => b.points - a.points);

  const filteredMembers = sortedMembers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-condensed text-3xl sm:text-4xl font-black tracking-wide text-white leading-none">
            Ranking
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clique em qualquer membro para ver o extrato auditável de pontuação.
          </p>
        </div>
        {isPresidency && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300">
            Vermelho = Presidência & Diretores (Sem pontuar)
          </span>
        )}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar membro no ranking..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-[#090a56] border border-[#18288A] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#AAD2FF]"
        />
      </div>

      {/* Tabela do Ranking: Apenas Posição, Nome e Pontuação */}
      <div className="bg-[#090a56] border border-[#18288A] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#040148] text-[#AAD2FF] font-bold text-xs uppercase tracking-wider border-b border-[#18288A]">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Posição</th>
              <th className="py-3 px-4">Nome</th>
              <th className="py-3 px-4 text-right">Pontos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18288A]/60">
            {filteredMembers.map((member) => {
              const rank = sortedMembers.findIndex(m => m.id === member.id) + 1;
              const isNonCompeting = isPresidency && isExcludedFromCompetition(member);

              return (
                <tr 
                  key={member.id} 
                  onClick={() => setSelectedMemberForHistory(member)}
                  className={`transition-colors cursor-pointer ${
                    isNonCompeting
                      ? 'bg-red-950/40 hover:bg-red-950/60 text-red-200'
                      : 'hover:bg-[#18288A]/30 text-white'
                  }`}
                  title="Clique para ver o extrato de pontos deste membro"
                >
                  <td className="py-3 px-4 text-center font-bold font-mono">
                    <span className={isNonCompeting ? 'text-red-400' : 'text-slate-300'}>
                      {rank === 1 && !isNonCompeting ? '🥇 1º' : rank === 2 && !isNonCompeting ? '🥈 2º' : rank === 3 && !isNonCompeting ? '🥉 3º' : `${rank}º`}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isNonCompeting ? 'text-red-300' : 'text-white'}`}>
                        {member.name}
                      </span>
                      {isNonCompeting && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-red-200">
                          {member.role || 'Diretoria'}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-black text-base">
                    <span className={isNonCompeting ? 'text-red-300' : 'text-white'}>
                      {member.points}
                    </span>{' '}
                    <span className={`text-xs font-sans font-normal ${isNonCompeting ? 'text-red-400' : 'text-[#AAD2FF]'}`}>
                      pts
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal / Extrato Auditável de Transações de Pontos */}
      {selectedMemberForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#040148] border border-[#18288A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Cabeçalho do Modal */}
            <div className="p-4 bg-[#090a56] border-b border-[#18288A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#AAD2FF]" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Extrato de Pontos: {selectedMemberForHistory.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedMemberForHistory.department} • {selectedMemberForHistory.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberForHistory(null)}
                className="p-1 rounded-lg hover:bg-[#18288A] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Extrato */}
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              <div className="p-3 bg-[#090a56] rounded-xl border border-[#18288A] flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase">Pontuação Total Auditada:</span>
                <span className="text-xl font-mono font-black text-white">
                  {selectedMemberForHistory.points} <span className="text-xs text-[#AAD2FF]">pts</span>
                </span>
              </div>

              {isLoadingHistory ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Carregando extrato de transações...
                </div>
              ) : memberTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-[#090a56]/50 rounded-xl border border-dashed border-[#18288A]">
                  Nenhuma pontuação registrada ainda para este membro.
                  <br />
                  <span className="text-[11px] text-slate-500">
                    (Início do novo sistema com 0 pontos)
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {memberTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-2.5 bg-[#090a56] rounded-lg border border-[#18288A]/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">
                          {tx.description || tx.reason || 'Atividade'}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-[#18288A]/50 text-[#AAD2FF]">
                            {tx.category || 'Atividade'}
                          </span>
                          {tx.date && <span>{tx.date}</span>}
                        </div>
                      </div>
                      <div className={`font-mono font-bold text-sm ${
                        tx.points > 0 ? 'text-emerald-400' : tx.points < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-3 bg-[#090a56] border-t border-[#18288A] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMemberForHistory(null)}
                className="px-4 py-1.5 bg-[#18288A] hover:bg-[#2036ba] text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
