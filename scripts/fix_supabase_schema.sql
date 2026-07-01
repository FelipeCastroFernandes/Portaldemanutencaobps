-- ================================================================
-- CORREÇÃO COMPLETA DO SCHEMA SUPABASE
-- ================================================================
-- Executar no Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ================================================================
-- PROBLEMA 1: Criar tabela tasks (migration nunca executada)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hours NUMERIC(6,1) NOT NULL DEFAULT 0,
  impact TEXT NOT NULL DEFAULT 'medium',
  urgency TEXT NOT NULL DEFAULT 'planned',
  responsible TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'backlog',
  collaborator TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.tasks;
CREATE POLICY "Enable insert access for all users" ON public.tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.tasks;
CREATE POLICY "Enable update access for all users" ON public.tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON public.tasks;
CREATE POLICY "Enable delete access for all users" ON public.tasks FOR DELETE USING (true);

-- ================================================================
-- PROBLEMA 2: Adicionar colunas faltando na tabela occurrences
-- ================================================================
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS causa_parada TEXT;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS is_equipment_stopped BOOLEAN;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS status_history JSONB;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS extra_scope_approval_ms BIGINT;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS closed_by TEXT;

-- ================================================================
-- VERIFICAÇÃO: Confirmar que tudo foi criado
-- ================================================================
SELECT 'tasks' AS table_name, COUNT(*) AS columns
FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks'
UNION ALL
SELECT 'occurrences', COUNT(*)
FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'occurrences';