import { PointTransaction, PointCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loadData, saveData } from '../utils/storage';

export interface SyncWeeklyPointItem {
  category: PointCategory;
  points: number;
  description: string;
  referenceId: string; // Ex: 'att-memId-2026-08-w1-treino'
  month: string;
  week: number;
}

/**
 * Sincroniza de forma estritamente idempotente as transações de pontos de uma semana para um membro.
 * - Se points > 0: insere ou atualiza a transação com a constraint única (member_id, reference_id, category)
 * - Se points <= 0: remove a transação correspondente (caso tenha sido desmarcado)
 */
export async function syncMemberWeeklyPoints(
  memberId: string,
  items: SyncWeeklyPointItem[]
): Promise<void> {
  // 1. Atualiza cache local (localStorage)
  const localData = loadData();
  let localTxs = [...(localData.transactions || [])];

  for (const item of items) {
    // Remove transação anterior correspondente
    localTxs = localTxs.filter(
      t => !(t.memberId === memberId && (t.referenceId === item.referenceId || (t.month === item.month && t.week === item.week && t.category === item.category)))
    );

    if (item.points > 0) {
      localTxs.unshift({
        id: `tx-${Date.now()}-${item.referenceId}`,
        memberId,
        points: item.points,
        category: item.category,
        description: item.description,
        reason: item.description,
        referenceId: item.referenceId,
        month: item.month,
        week: item.week,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveData({ transactions: localTxs });

  // 2. Se o Supabase estiver configurado, executa no banco com garantia de unicidade via função RPC
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId);
    if (!isUuid) {
      return;
    }

    for (const item of items) {
      // Chama explicitamente a função RPC sync_weekly_point_transaction criada no PostgreSQL
      const { error: rpcError } = await supabase.rpc('sync_weekly_point_transaction', {
        p_member_id: memberId,
        p_category: item.category,
        p_points: item.points,
        p_description: item.description,
        p_reference_id: item.referenceId,
        p_month: item.month,
        p_week: item.week,
      });

      if (rpcError) {
        console.warn('Aviso na execução da RPC, aplicando sincronização direta:', rpcError.message);
        if (item.points > 0) {
          await supabase
            .from('point_transactions')
            .upsert(
              {
                member_id: memberId,
                points: item.points,
                category: item.category,
                description: item.description,
                reference_id: item.referenceId,
                month: item.month,
                week: item.week,
                created_at: new Date().toISOString(),
              },
              { onConflict: 'member_id,reference_id,category' }
            );
        } else {
          await supabase
            .from('point_transactions')
            .delete()
            .match({
              member_id: memberId,
              reference_id: item.referenceId,
              category: item.category,
            });
        }
      }
    }
  } catch (err) {
    console.error('Exceção ao sincronizar pontos com Supabase via RPC:', err);
  }
}

/**
 * Busca o histórico de transações de pontos de um membro (para extrato e auditoria)
 */
export async function getMemberTransactions(memberId: string): Promise<PointTransaction[]> {
  if (!isSupabaseConfigured() || !supabase) {
    const local = loadData();
    return (local.transactions || [])
      .filter(t => t.memberId === memberId)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      const local = loadData();
      return (local.transactions || []).filter(t => t.memberId === memberId);
    }

    return data.map(t => ({
      id: t.id,
      memberId: t.member_id,
      points: t.points,
      category: t.category,
      description: t.description,
      reason: t.description,
      referenceId: t.reference_id,
      month: t.month,
      week: t.week,
      createdAt: t.created_at,
      date: t.created_at ? t.created_at.split('T')[0] : '',
    }));
  } catch {
    const local = loadData();
    return (local.transactions || []).filter(t => t.memberId === memberId);
  }
}

/**
 * Ajuste manual de pontos (para Presidência ou carga futura de histórico)
 */
export async function addPointAdjustment(
  memberId: string,
  points: number,
  category: PointCategory,
  description: string,
  referenceId?: string
): Promise<boolean> {
  const ref = referenceId || `adj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Atualiza localmente
  const local = loadData();
  const newTx: PointTransaction = {
    id: `tx-${ref}`,
    memberId,
    points,
    category,
    description,
    reason: description,
    referenceId: ref,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  saveData({ transactions: [newTx, ...(local.transactions || [])] });

  if (!isSupabaseConfigured() || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase.from('point_transactions').insert({
      member_id: memberId,
      points,
      category,
      description,
      reference_id: ref,
      created_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}
