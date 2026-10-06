import { Member } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loadData, saveData } from '../utils/storage';

export async function getMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadData().members;
  }

  try {
    // Busca os membros e o total de pontos diretamente da VIEW members_ranking
    const { data, error } = await supabase
      .from('members_ranking')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Erro ao buscar membros no Supabase, usando fallback local:', error.message);
      return loadData().members;
    }

    if (!data || data.length === 0) {
      // Se o banco foi recém-criado sem seed, busca da tabela members diretamente
      const { data: rawMembers } = await supabase.from('members').select('*').order('name');
      if (rawMembers && rawMembers.length > 0) {
        return rawMembers.map(m => ({
          id: m.id,
          name: m.name,
          department: m.department,
          role: m.role,
          phone: m.phone || '',
          email: m.email || '',
          active: m.active ?? true,
          avatarColor: m.avatar_color || '#18288A',
          points: 0,
          createdAt: m.created_at,
        }));
      }
      return loadData().members;
    }

    return data.map(m => ({
      id: m.id,
      name: m.name,
      department: m.department,
      role: m.role,
      phone: m.phone || '',
      email: m.email || '',
      active: m.active ?? true,
      avatarColor: m.avatar_color || '#18288A',
      points: Number(m.total_points) || 0,
      createdAt: m.created_at,
    }));
  } catch (err) {
    console.warn('Exceção ao conectar com Supabase, usando localStorage:', err);
    return loadData().members;
  }
}

export async function upsertMember(member: Member): Promise<Member> {
  // Atualiza localmente sempre para garantir cache offline
  const localData = loadData();
  const existingIdx = localData.members.findIndex(m => m.id === member.id);
  let updatedLocal: Member[];
  if (existingIdx >= 0) {
    updatedLocal = [...localData.members];
    updatedLocal[existingIdx] = member;
  } else {
    updatedLocal = [...localData.members, member];
  }
  saveData({ members: updatedLocal });

  if (!isSupabaseConfigured() || !supabase) {
    return member;
  }

  try {
    const payload = {
      name: member.name,
      department: member.department,
      role: member.role,
      phone: member.phone || null,
      email: member.email || null,
      active: member.active,
      avatar_color: member.avatarColor || '#18288A',
      updated_at: new Date().toISOString(),
    };

    // Verifica se id é um UUID válido do Supabase ou gerado localmente
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(member.id);

    if (isUuid) {
      const { data, error } = await supabase
        .from('members')
        .upsert({ id: member.id, ...payload })
        .select()
        .single();
      if (!error && data) {
        return { ...member, id: data.id };
      }
    } else {
      // Cria novo membro no Supabase
      const { data, error } = await supabase
        .from('members')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        return { ...member, id: data.id };
      }
    }
  } catch (e) {
    console.error('Erro ao sincronizar membro no Supabase:', e);
  }

  return member;
}

export async function removeMember(memberId: string): Promise<boolean> {
  const localData = loadData();
  saveData({ members: localData.members.filter(m => m.id !== memberId) });

  if (!isSupabaseConfigured() || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    return !error;
  } catch {
    return false;
  }
}
