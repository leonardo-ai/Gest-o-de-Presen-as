import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Member } from '../types';

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Member) => void;
  existingDepartments: string[];
}

export const NewMemberModal: React.FC<NewMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingDepartments,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Presidência');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      points: 0,
      initialPoints: 0,
      department: department.trim() || 'Presidência',
      role: role.trim() || 'Membro da Diretoria',
      phone: phone.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    onAddMember(newMember);
    setName('');
    setRole('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#090a56] border border-[#18288A] rounded-xl max-w-sm w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#18288A]">
          <h3 className="font-condensed text-2xl font-black text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#AAD2FF]" />
            NOVO MEMBRO
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              Nome Completo *:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Bernardo Silva"
              className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#AAD2FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              Área Oficial:
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full bg-[#040148] border border-[#18288A] text-xs text-white rounded-lg p-2 font-bold"
            >
              {[
                'Presidência',
                'Esportes',
                'Marketing',
                'Produção',
                'Financeiro',
                'Conteúdo',
                'Criação',
                'Bateria',
              ].map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              Cargo / Função:
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Ex: Diretor(a), Assessor(a), Trainee"
              className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#AAD2FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#AAD2FF] mb-1">
              WhatsApp:
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(21) 99999-9999"
              className="w-full bg-[#040148] border border-[#18288A] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#AAD2FF]"
            />
          </div>

          <div className="pt-3 border-t border-[#18288A] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#040148] rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#18288A] hover:bg-[#2036ba] border border-[#AAD2FF]/40 rounded-lg cursor-pointer shadow-sm"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
