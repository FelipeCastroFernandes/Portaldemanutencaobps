-- PASSO 1: Adicionar novos valores ao enum (commit necessário antes de usar)
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'Gestor';
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'Planejador';
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'visualização';
-- Execute este bloco sozinho primeiro, depois o PASSO 2

-- PASSO 2: Atualizar registros (execute após o PASSO 1)
BEGIN;
UPDATE public.users SET profile = 'Gestor' WHERE profile = 'gestao';
UPDATE public.users SET profile = 'visualização' WHERE profile = 'visualizacao';
COMMIT;
-- Execute este bloco sozinho, depois o PASSO 3

-- PASSO 3: Recriar enum removendo valores antigos (execute após o PASSO 2)
BEGIN;
ALTER TABLE public.users ALTER COLUMN profile DROP DEFAULT;
ALTER TYPE public.profile_level RENAME TO profile_level_old;
CREATE TYPE public.profile_level AS ENUM ('Gestor', 'Planejador', 'visualização');
ALTER TABLE public.users ALTER COLUMN profile TYPE public.profile_level USING profile::text::public.profile_level;
ALTER TABLE public.users ALTER COLUMN profile SET DEFAULT 'visualização';
DROP TYPE IF EXISTS profile_level_old;
COMMIT;