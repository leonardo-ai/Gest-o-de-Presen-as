-- ==============================================================================
-- SCHEMA SUPABASE: GESTÃO DE PRESENÇAS & RANKING DA ATLÉTICA
-- ==============================================================================
-- Este script cria todas as tabelas, índices, constraints de unicidade,
-- funções de sincronização atômica de pontos, views de ranking e carga inicial
-- dos 44 membros (com 0 pontos) e legendas de 2026.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELAS PRINCIPAIS
-- ==============================================================================

-- Configuração da Atlética
CREATE TABLE IF NOT EXISTS athletica_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Atlética ESPM Rio',
  acronym TEXT NOT NULL DEFAULT 'ESPM RIO',
  university TEXT DEFAULT 'ESPM Rio - Período 26.2',
  mascot TEXT DEFAULT 'Jacaré',
  min_attendance_percent INTEGER DEFAULT 70,
  theme_color TEXT DEFAULT '#18288A',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfis e Permissões (para controle futuro de acessos)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin_presidencia', 'diretor', 'coordenador', 'membro')),
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membros da Atlética (SEM coluna mutável de pontos: pontos são derivados de transações)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  avatar_color TEXT DEFAULT '#18288A',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Legendas Semanais (Definições de cada semana: treinos, jogos, eventos e detalhes)
CREATE TABLE IF NOT EXISTS week_legends (
  id TEXT PRIMARY KEY, -- formato: 'YYYY-MM-wN' (ex: '2026-08-w1')
  month TEXT NOT NULL, -- formato: 'YYYY-MM'
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 5),
  date_range TEXT NOT NULL,
  had_training BOOLEAN NOT NULL DEFAULT true,
  training_location TEXT DEFAULT 'Orsina',
  games_count INTEGER NOT NULL DEFAULT 0,
  games_description TEXT,
  events_count INTEGER NOT NULL DEFAULT 0,
  events_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matriz de Presença Semanal dos Membros
CREATE TABLE IF NOT EXISTS weekly_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 5),
  attended_training BOOLEAN,
  training_justified BOOLEAN,
  games_attended INTEGER NOT NULL DEFAULT 0,
  games_justified BOOLEAN,
  events_attended INTEGER NOT NULL DEFAULT 0,
  events_justified BOOLEAN,
  is_associate BOOLEAN,
  extra_points INTEGER NOT NULL DEFAULT 0,
  extra_reason TEXT,
  monthly_highlight_bonus BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  -- CONSTRAINT DE UNICIDADE: Apenas 1 registro por membro em cada semana
  CONSTRAINT unique_member_month_week UNIQUE (member_id, month, week)
);

-- Transações de Pontos (LIVRO-RAZÃO / LEDGER)
-- Toda alteração de pontos gera ou atualiza uma linha rastreável.
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('treino', 'jogo', 'evento', 'associado', 'destaque', 'extra', 'ajuste_manual', 'carga_inicial')
  ),
  description TEXT NOT NULL,
  reference_id TEXT NOT NULL, -- id do evento/semana (ex: 'att-memId-2026-08-w1-treino')
  month TEXT,
  week INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  -- CONSTRAINT DE IDEMPOTÊNCIA: Impede absolutamente duplicação de transação para o mesmo evento
  CONSTRAINT unique_member_reference_category UNIQUE (member_id, reference_id, category)
);

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
CREATE INDEX IF NOT EXISTS idx_weekly_attendance_month_week ON weekly_attendance(month, week);
CREATE INDEX IF NOT EXISTS idx_weekly_attendance_member ON weekly_attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_member ON point_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_month_week ON point_transactions(month, week);
CREATE INDEX IF NOT EXISTS idx_point_transactions_reference ON point_transactions(reference_id);

-- ==============================================================================
-- 4. VIEW DO RANKING (TOTAL DE PONTOS DERIVADO DO LEDGER)
-- ==============================================================================
CREATE OR REPLACE VIEW members_ranking AS
SELECT 
  m.id,
  m.name,
  m.department,
  m.role,
  m.phone,
  m.email,
  m.active,
  m.avatar_color,
  m.created_at,
  COALESCE(SUM(pt.points), 0)::integer AS total_points,
  COUNT(pt.id)::integer AS total_transactions
FROM members m
LEFT JOIN point_transactions pt ON pt.member_id = m.id
GROUP BY m.id;

-- ==============================================================================
-- 5. FUNÇÃO DE SINCRONIZAÇÃO ATÔMICA / IDEMPOTENTE DE PONTOS
-- ==============================================================================
-- Esta função atualiza ou insere transações com idempotência garantida.
-- Se points > 0: grava/atualiza. Se points <= 0: remove a transação para não poluir o histórico.
CREATE OR REPLACE FUNCTION sync_weekly_point_transaction(
  p_member_id UUID,
  p_category TEXT,
  p_points INTEGER,
  p_description TEXT,
  p_reference_id TEXT,
  p_month TEXT,
  p_week INTEGER
) RETURNS VOID AS $$
BEGIN
  IF p_points > 0 THEN
    INSERT INTO point_transactions (
      member_id, category, points, description, reference_id, month, week, created_at
    )
    VALUES (
      p_member_id, p_category, p_points, p_description, p_reference_id, p_month, p_week, now()
    )
    ON CONFLICT (member_id, reference_id, category)
    DO UPDATE SET 
      points = EXCLUDED.points,
      description = EXCLUDED.description,
      created_at = now();
  ELSE
    -- Se pontuação passou a ser 0 (ex: presença desmarcada), remove a transação daquele evento
    DELETE FROM point_transactions
    WHERE member_id = p_member_id
      AND reference_id = p_reference_id
      AND category = p_category;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 6. SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE athletica_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_legends ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura: Qualquer usuário (público ou autenticado) pode visualizar
CREATE POLICY "Public read on config" ON athletica_config FOR SELECT USING (true);
CREATE POLICY "Public read on members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read on week_legends" ON week_legends FOR SELECT USING (true);
CREATE POLICY "Public read on weekly_attendance" ON weekly_attendance FOR SELECT USING (true);
CREATE POLICY "Public read on point_transactions" ON point_transactions FOR SELECT USING (true);
CREATE POLICY "Self read on user_roles" ON user_roles FOR SELECT USING (true);

-- Políticas de Escrita (Inicialmente abertas com chave anon da Vercel;
-- preparadas para serem restritas via Supabase Auth / Roles futuramente)
CREATE POLICY "Allow anon insert on members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on members" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on members" ON members FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on week_legends" ON week_legends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on week_legends" ON week_legends FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert on weekly_attendance" ON weekly_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on weekly_attendance" ON weekly_attendance FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on weekly_attendance" ON weekly_attendance FOR DELETE USING (true);

CREATE POLICY "Allow anon insert on point_transactions" ON point_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update on point_transactions" ON point_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete on point_transactions" ON point_transactions FOR DELETE USING (true);

-- ==============================================================================
-- 7. CARGA INICIAL: CONFIGURAÇÃO PADRÃO
-- ==============================================================================
INSERT INTO athletica_config (name, acronym, university, mascot, min_attendance_percent, theme_color)
VALUES ('Atlética ESPM Rio', 'ESPM RIO', 'ESPM Rio - Período 26.2', 'Jacaré', 70, '#18288A')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 8. CARGA INICIAL: OS 44 MEMBROS OFICIAIS (TODOS COM 0 PONTOS)
-- ==============================================================================
INSERT INTO members (name, department, role, avatar_color) VALUES
('Angelo Raphael', 'Produção', 'Coordenador', '#10b981'),
('Anne Furtado', 'Marketing', 'Coordenador', '#06b6d4'),
('Bernardo Flores', 'Esportes', 'Coordenador', '#f59e0b'),
('Bianca Lourenço', 'Presidência', 'Vice-Presidente', '#ec4899'),
('Bruno Porter', 'Esportes', 'Coordenador', '#8b5cf6'),
('Carol Jordão', 'Financeiro', 'Diretor', '#ef4444'),
('Carol Paes', 'Financeiro', 'Diretor', '#3b82f6'),
('Catarina Mayrink', 'Criação', 'Coordenador', '#14b8a6'),
('Clara Medina', 'Produção', 'Coordenador', '#84cc16'),
('Dominique Poyastro', 'Produção', 'Coordenador', '#6366f1'),
('Esther Nunes', 'Esportes', 'Coordenador', '#f97316'),
('Giovanna Akemi', 'Produção', 'Coordenador', '#10b981'),
('Giovanna Motta', 'Esportes', 'Coordenador', '#06b6d4'),
('Guilherme Martins', 'Bateria', 'Diretor', '#f59e0b'),
('Hugo Bard', 'Esportes', 'Coordenador', '#ec4899'),
('Isabella Bugallo', 'Criação', 'Coordenador', '#8b5cf6'),
('Jasmyn Rodrigues', 'Marketing', 'Coordenador', '#ef4444'),
('Julia Carvalho', 'Produção', 'Coordenador', '#3b82f6'),
('Julia Nascimento', 'Produção', 'Diretor', '#14b8a6'),
('Kayque', 'Produção', 'Coordenador', '#84cc16'),
('Laura Esteves', 'Produção', 'Coordenador', '#6366f1'),
('Leonardo Kurtz', 'Presidência', 'Presidente', '#f97316'),
('Leticia Guimarães', 'Conteúdo', 'Diretor', '#10b981'),
('Lucas Queiroz', 'Esportes', 'Coordenador', '#06b6d4'),
('Luisa Boa', 'Criação', 'Diretor', '#f59e0b'),
('Luisa Petry', 'Marketing', 'Diretor', '#ec4899'),
('Manu Vasil', 'Conteúdo', 'Coordenador', '#8b5cf6'),
('Maria Clara de Mello', 'Produção', 'Coordenador', '#ef4444'),
('Mariana Collyer', 'Marketing', 'Coordenador', '#3b82f6'),
('Mariana Quintes', 'Esportes', 'Coordenador', '#14b8a6'),
('Matheus', 'Conteúdo', 'Coordenador', '#84cc16'),
('Miguel Nogueira', 'Esportes', 'Coordenador', '#6366f1'),
('Myrela Marins', 'Financeiro', 'Coordenador', '#f97316'),
('Natalia', 'Financeiro', 'Coordenador', '#10b981'),
('Pedro Martins', 'Conteúdo', 'Coordenador', '#06b6d4'),
('Rafael', 'Criação', 'Coordenador', '#f59e0b'),
('Rafaela Rodrigues', 'Conteúdo', 'Coordenador', '#ec4899'),
('Sara Queiroz', 'Produção', 'Coordenador', '#8b5cf6'),
('Sara Rota', 'Esportes', 'Diretor', '#ef4444'),
('Sarah Dutra', 'Conteúdo', 'Coordenador', '#3b82f6'),
('Sarah Verissímo', 'Produção', 'Coordenador', '#14b8a6'),
('Sophia Vilhena', 'Conteúdo', 'Coordenador', '#84cc16'),
('Valentina Araújo', 'Produção', 'Coordenador', '#6366f1'),
('Valentina Nepomuceno', 'Marketing', 'Coordenador', '#f97316')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 9. CARGA INICIAL: LEGENDAS SEMANAIS OFICIAIS (AGOSTO, SETEMBRO, OUTUBRO)
-- ==============================================================================
INSERT INTO week_legends (id, month, week, date_range, had_training, training_location, games_count, games_description, events_count, events_description)
VALUES
-- Agosto
('2026-08-w1', '2026-08', 1, '02 a 09/08/2026', true, 'Orsina', 0, '', 1, 'Atlética Day'),
('2026-08-w2', '2026-08', 2, '10 a 16/08/2026', true, 'Orsina', 2, 'BM e HM', 1, 'ESPM Parque'),
('2026-08-w3', '2026-08', 3, '17 a 23/08/2026', true, 'Orsina', 1, 'Futsal Masc.', 1, 'Evento da semana'),
('2026-08-w4', '2026-08', 4, '24 a 30/08/2026', true, 'Orsina', 2, 'BM e FM', 1, 'Evento da semana'),
-- Setembro
('2026-09-w1', '2026-09', 1, '31/08 a 06/09/2026', true, 'Orsina', 0, '', 2, 'Reunião Geral'),
('2026-09-w2', '2026-09', 2, '07 a 13/09/2026', true, 'Orsina', 1, 'Hand. Masc.', 0, ''),
('2026-09-w3', '2026-09', 3, '14 a 20/09/2026', true, 'Orsina', 2, 'VF e HM', 1, 'Resenha'),
('2026-09-w4', '2026-09', 4, '21 a 28/09/2026', true, 'Orsina', 2, 'FM e VF', 0, ''),
-- Outubro
('2026-10-w1', '2026-10', 1, '29/09 a 04/10/2026', true, 'Orsina', 0, '', 2, 'Reunião Geral'),
('2026-10-w2', '2026-10', 2, '05 a 11/10/2026', true, 'Orsina', 1, 'Hand. Masc.', 0, ''),
('2026-10-w3', '2026-10', 3, '12 a 18/10/2026', true, 'Orsina', 2, 'VF e HM', 1, 'Resenha'),
('2026-10-w4', '2026-10', 4, '19 a 28/10/2026', true, 'Orsina', 2, 'FM e VF', 0, '')
ON CONFLICT (id) DO UPDATE SET
  date_range = EXCLUDED.date_range,
  had_training = EXCLUDED.had_training,
  training_location = EXCLUDED.training_location,
  games_count = EXCLUDED.games_count,
  games_description = EXCLUDED.games_description,
  events_count = EXCLUDED.events_count,
  events_description = EXCLUDED.events_description,
  updated_at = now();
