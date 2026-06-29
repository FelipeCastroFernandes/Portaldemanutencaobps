-- Rename profile 'Solicitante' to 'visualização' in data and enum
BEGIN;

-- Update all existing records
UPDATE public.users SET profile = 'visualização' WHERE profile = 'Solicitante';

-- Change the column default
ALTER TABLE public.users ALTER COLUMN profile SET DEFAULT 'visualização';

-- Migrate the enum type to remove 'Solicitante'
ALTER TYPE profile_level RENAME TO profile_level_old;

CREATE TYPE profile_level AS ENUM ('Gestor', 'Planejador', 'visualização');

ALTER TABLE public.users 
  ALTER COLUMN profile TYPE profile_level 
  USING profile::text::profile_level;

DROP TYPE profile_level_old;

COMMIT;