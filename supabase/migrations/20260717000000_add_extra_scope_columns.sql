-- Add missing extra scope columns to occurrences
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS extra_scope_start TIMESTAMPTZ;
ALTER TABLE public.occurrences ADD COLUMN IF NOT EXISTS extra_scope_end TIMESTAMPTZ;
