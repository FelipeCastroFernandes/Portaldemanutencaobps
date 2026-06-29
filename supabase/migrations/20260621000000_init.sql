-- Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
        CREATE TYPE equipment_type AS ENUM ('escadas', 'elevadores');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_level') THEN
        CREATE TYPE profile_level AS ENUM ('Gestor', 'Planejador', 'visualização');
    END IF;
END $$;

ALTER TYPE profile_level ADD VALUE IF NOT EXISTS 'Gestor';
ALTER TYPE profile_level ADD VALUE IF NOT EXISTS 'Planejador';
ALTER TYPE profile_level ADD VALUE IF NOT EXISTS 'visualização';

-- Table: public.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  photo TEXT,
  team TEXT NOT NULL,
  role TEXT NOT NULL,
  profile profile_level NOT NULL DEFAULT 'visualização',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: public.occurrences
CREATE TABLE IF NOT EXISTS public.occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type equipment_type NOT NULL,
  equip TEXT NOT NULL,
  call_number TEXT NOT NULL,
  attendant TEXT NOT NULL,
  created_by TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  technician TEXT,
  reason TEXT,
  causa_parada TEXT,
  is_equipment_stopped BOOLEAN,
  status_history JSONB,
  extra_scope_approval_ms BIGINT,
  closed_by TEXT
);

ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS causa_parada TEXT;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS is_equipment_stopped BOOLEAN;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS status_history JSONB;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS extra_scope_approval_ms BIGINT;

-- Table: public.maintenance_records
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type equipment_type NOT NULL,
  equip TEXT NOT NULL,
  mes TEXT NOT NULL,
  chamados INTEGER NOT NULL DEFAULT 0,
  disp NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  mtbf TEXT NOT NULL DEFAULT '00:00:00',
  mttr TEXT NOT NULL DEFAULT '00:00:00',
  UNIQUE (type, equip, mes)
);

-- Basic RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

-- Creating policies (Since Supabase Auth is not implemented yet, allowing anon for all)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.users;
CREATE POLICY "Enable insert access for all users" ON public.users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON public.users;
CREATE POLICY "Enable update access for all users" ON public.users FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.users;
CREATE POLICY "Enable delete access for all users" ON public.users FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.occurrences;
CREATE POLICY "Enable read access for all users" ON public.occurrences FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.occurrences;
CREATE POLICY "Enable insert access for all users" ON public.occurrences FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON public.occurrences;
CREATE POLICY "Enable update access for all users" ON public.occurrences FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.occurrences;
CREATE POLICY "Enable delete access for all users" ON public.occurrences FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.maintenance_records;
CREATE POLICY "Enable read access for all users" ON public.maintenance_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.maintenance_records;
CREATE POLICY "Enable insert access for all users" ON public.maintenance_records FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update access for all users" ON public.maintenance_records;
CREATE POLICY "Enable update access for all users" ON public.maintenance_records FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.maintenance_records;
CREATE POLICY "Enable delete access for all users" ON public.maintenance_records FOR DELETE USING (true);
