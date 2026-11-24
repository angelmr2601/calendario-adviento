-- Ejecutar en Supabase SQL Editor. No ejecutar sobre tablas con el mismo nombre ya personalizadas.
create table if not exists public.advent_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.advent_surprises (
  day integer primary key check (day between 1 and 24),
  type text not null check (type in ('letter', 'photo', 'quiz', 'voucher', 'special')),
  title text not null default '',
  message text not null default '',
  emoji text not null default '🎁',
  image text,
  question text,
  options jsonb,
  correct_answer integer,
  reward text,
  song_url text,
  updated_at timestamptz not null default now()
);

alter table public.advent_admins enable row level security;
alter table public.advent_surprises enable row level security;

-- Nadie puede asignarse privilegios de admin desde la aplicación.
-- La cuenta administradora se inserta manualmente desde SQL Editor.
drop policy if exists "admins_can_read_self" on public.advent_admins;
create policy "admins_can_read_self"
on public.advent_admins for select to authenticated
using ((select auth.uid()) = user_id);

-- Las sorpresas son privadas por defecto; solo admins pueden leer o modificar.
drop policy if exists "admins_can_read_surprises" on public.advent_surprises;
create policy "admins_can_read_surprises"
on public.advent_surprises for select to authenticated
using (exists (select 1 from public.advent_admins where user_id = (select auth.uid())));

drop policy if exists "admins_can_insert_surprises" on public.advent_surprises;
create policy "admins_can_insert_surprises"
on public.advent_surprises for insert to authenticated
with check (exists (select 1 from public.advent_admins where user_id = (select auth.uid())));

drop policy if exists "admins_can_update_surprises" on public.advent_surprises;
create policy "admins_can_update_surprises"
on public.advent_surprises for update to authenticated
using (exists (select 1 from public.advent_admins where user_id = (select auth.uid())))
with check (exists (select 1 from public.advent_admins where user_id = (select auth.uid())));

-- Permitir el acceso a la API, limitado por las políticas RLS anteriores.
grant usage on schema public to authenticated;
grant select on public.advent_admins to authenticated;
grant select, insert, update on public.advent_surprises to authenticated;

-- DESPUÉS de crear un usuario en Authentication > Users, ejecutar en SQL Editor:
-- insert into public.advent_admins (user_id) values ('PEGA_AQUI_SU_UUID');
