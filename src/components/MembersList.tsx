import React, { useState } from 'react';
import { Search, Edit2, Plus, Trash2, ChevronDown, UserPlus } from 'lucide-react';
import { Member, OfficialArea, OFFICIAL_AREAS } from '../types';

interface MembersListProps {
  members: Member[];
  currentArea?: OfficialArea | 'Todas as Áreas';
  onSaveMember: (member: Member) => void;
  onAddMember?: (member: Member) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  currentArea,
  onSaveMember,
  onAddMember,
  onDeleteMember,
}) => {
  const isPresidency = currentArea === 'Presidência';

  // Na presidência, o diretor pode alternar a área no menu suspenso
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('Todas as Áreas');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Formulário de novo membro
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDept, setNewMemberDept] = useState<OfficialArea>('Presidência');
  const [newMemberRole, setNewMemberRole] = useState('Coordenador');

  // Filtragem
  let areaMembers: Member[] = [];
  if (isPresidency) {
    if (selectedDeptFilter === 'Todas as Áreas') {
      areaMembers = members;
    } else {
      areaMembers = members.filter(m => m.department === selectedDeptFilter);
    }
  } else if (currentArea && currentArea !== 'Todas as Áreas') {
    areaMembers = members.filter(m => m.department === currentArea);
  } else {
    areaMembers = members;
  }

  const filteredMembers = areaMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !onAddMember) return;

    const newMem: Member = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      department: newMemberDept,
      role: newMemberRole.trim() || 'Coordenador',
      points: 0,
      initialPoints: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onAddMember(newMem);
    setNewMemberName('');
    setIsAddingMember(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Controles da Presidência */}
      {isPresidency && (
        <div className="bg-[#090a56] border border-[#18288A] rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Menu Suspenso de Áreas da Presidência */}
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AAD2FF] mb-1">
                Administrar Área:
              </label>
              <div className="relative">
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="w-full appearance-none bg-[#040148] border border-[#18288A] focus:border-[#AAD2FF] text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none transition-colors cursor-pointer pr-10"
                >
                  <option value="Todas as Áreas">Todas as Áreas</option>
                  {OFFICIAL_AREAS.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#AAD2FF]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Botão de Adicionar Membro */}
            <div className="sm:self-end">
              <button
                type="button"
                onClick={() => setIsAddingMember(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#18288A] hover:bg-[#2036ba] text-white font-bold text-sm flex items-center justify-center gap-2 border border-[#AAD2FF]/40 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#AAD2FF]" />
                <span>+ Novo Membro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar membro..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-[#090a56] border border-[#18288A] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#AAD2FF]"
        />
      </div>

      {/* Lista de Membros */}
      <div className="space-y-2">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="bg-[#090a56] border border-[#18288A] rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            {/* Nome e Descrição / Cargo / Área */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-tight truncate">
                  {member.name}
                </h3>
                {isPresidency && (
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#040148] text-[#AAD2FF] border border-[#18288A]">
                    {member.department}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#AAD2FF] font-medium mt-0.5 truncate">
                {member.role || 'Membro'}
              </div>
            </div>

            {/* Pontuação e Ações */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="font-mono text-base font-black text-white">
                {member.points} <span className="text-xs text-[#AAD2FF] font-sans font-normal">pts</span>
              </span>

              {/* Lápis de Edição */}
              <button
                type="button"
                onClick={() => setEditingMember(member)}
                className="p-2 text-slate-300 hover:text-white bg-[#040148] hover:bg-[#18288A] border border-[#18288A] rounded-lg cursor-pointer transition-colors"
                title="Editar membro"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Lixeira de Exclusão (Apenas na Presidência) */}
              {isPresidency && onDeleteMember && (
                <button
                  type="button"
                  onClick={() => onDeleteMember(member.id)}
                  className="p-2 text-rose-400 hover:text-rose-200 bg-[#040148] hover:bg-rose-950 border border-rose-900/50 rounded-lg cursor-pointer transition-colors"
                  title="Excluir membro da gestão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Novo Membro (Presidência) */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateMember}
            className="bg-[#090a56] border border-[#18288A] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4"
          >
            <h3 className="font-condensed text-2xl font-black text-white">
              ADICIONAR MEMBRO
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Nome Completo *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do membro"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Área *:
                </label>
                <select
                  value={newMemberDept}
                  onChange={e => setNewMemberDept(e.target.value as OfficialArea)}
                  className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                >
                  {OFFICIAL_AREAS.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Cargo / Descrição *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coordenador, Diretor, Assessor..."
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#040148] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#18288A] hover:bg-[#2036ba] border border-[#AAD2FF]/40 rounded-lg cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Edição de Membro */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#090a56] border border-[#18288A] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-condensed text-2xl font-black text-white">
              EDITAR MEMBRO
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Nome:
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>

              {isPresidency && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                    Área:
                  </label>
                  <select
                    value={editingMember.department}
                    onChange={e => setEditingMember({ ...editingMember, department: e.target.value })}
                    className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                  >
                    {OFFICIAL_AREAS.map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-[#AAD2FF] mb-1">
                  Descrição (Cargo):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coordenador, Diretor, Trainee, Assessor..."
                  value={editingMember.role}
                  onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                  className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#AAD2FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#040148] rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveMember(editingMember);
                  setEditingMember(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#18288A] hover:bg-[#2036ba] border border-[#AAD2FF]/40 rounded-lg cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
