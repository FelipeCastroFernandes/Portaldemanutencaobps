-- Execute este SQL no SQL Editor do Supabase Dashboard (https://supabase.com/dashboard)
-- Isso irá:
-- 1. Adicionar os novos valores ao enum profile_level
-- 2. Atualizar todos os registros existentes
-- 3. Remover os valores antigos do enum

BEGIN;

-- 1. Adicionar os novos valores ao enum existente
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'Gestor';
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'Planejador';
ALTER TYPE public.profile_level ADD VALUE IF NOT EXISTS 'visualização';

-- 2. Atualizar registros existentes
UPDATE public.users SET profile = 'Gestor' WHERE profile = 'gestao';
UPDATE public.users SET profile = 'visualização' WHERE profile = 'visualizacao';

-- 3. Verificar se há registros com 'Solicitante' (caso existam)
UPDATE public.users SET profile = 'visualização' WHERE profile = 'Solicitante';

-- 4. Recriar o enum removendo valores antigos e Solicitante
ALTER TYPE public.profile_level RENAME TO profile_level_old;

CREATE TYPE public.profile_level AS ENUM ('Gestor', 'Planejador', 'visualização');

ALTER TABLE public.users 
  ALTER COLUMN profile TYPE public.profile_level 
  USING profile::text::public.profile_level;

DROP TYPE IF EXISTS profile_level_old;

COMMIT;