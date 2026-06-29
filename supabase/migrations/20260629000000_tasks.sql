-- Table: public.tasks (Gestão de Tarefas)
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