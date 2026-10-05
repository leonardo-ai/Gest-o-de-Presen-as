import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Member, OfficialArea } from '../types';

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
        <h2 className="font-condensed text-3xl sm:text-4xl font-black tracking-wide text-white leading-none">
          Ranking
        </h2>
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
                  className={`transition-colors ${
                    isNonCompeting
                      ? 'bg-red-950/40 hover:bg-red-950/60 text-red-200'
                      : 'hover:bg-[#18288A]/20 text-white'
                  }`}
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
    </div>
  );
};
