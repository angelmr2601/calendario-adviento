-- =====================================================================
-- Calendario de Adviento · configuración de Supabase
-- Pégalo entero en Supabase > SQL Editor > New query > Run.
-- Se puede ejecutar más de una vez sin romper nada.
--
-- Seguridad: las tablas tienen RLS activado y SIN políticas para el
-- público, así que solo el servidor de la web (con la clave secreta)
-- puede leerlas o escribirlas. Desde el navegador no se puede tocar nada.
-- =====================================================================

-- 1. Sorpresas -------------------------------------------------------
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

alter table public.advent_surprises enable row level security;

-- 2. Progreso (una fila por día) ------------------------------------
create table if not exists public.advent_progress (
  day integer primary key check (day between 1 and 24),
  opened_at timestamptz,
  redeemed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.advent_progress enable row level security;
revoke all on table public.advent_progress from anon, authenticated;

-- 3. Función que usa la web para registrar acciones ------------------
create or replace function public.advent_progress_set(p_day integer, p_action text)
returns void
language plpgsql
set search_path = public
as $$
begin
  if p_day is null or p_day < 1 or p_day > 24 then
    raise exception 'día inválido';
  end if;

  insert into advent_progress (day) values (p_day)
  on conflict (day) do nothing;

  if p_action = 'open' then
    update advent_progress
       set opened_at = coalesce(opened_at, now()), updated_at = now()
     where day = p_day;
  elsif p_action = 'redeem' then
    update advent_progress
       set opened_at = coalesce(opened_at, now()),
           redeemed_at = coalesce(redeemed_at, now()),
           updated_at = now()
     where day = p_day;
  elsif p_action = 'unredeem' then
    update advent_progress
       set redeemed_at = null, updated_at = now()
     where day = p_day;
  else
    raise exception 'acción inválida';
  end if;
end;
$$;

revoke all on function public.advent_progress_set(integer, text) from public, anon, authenticated;
grant execute on function public.advent_progress_set(integer, text) to service_role;

-- 4. Vista para que tú veas el resumen en Table Editor ---------------
create or replace view public.advent_resumen
with (security_invoker = true) as
select s.day,
       s.type,
       s.title,
       s.reward,
       p.opened_at   at time zone 'Europe/Madrid' as abierta_el,
       p.redeemed_at at time zone 'Europe/Madrid' as vale_canjeado_el
  from public.advent_surprises s
  left join public.advent_progress p using (day)
 order by s.day;

-- 5. Bucket privado para las fotografías -----------------------------
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('memories', 'memories', false)
    on conflict (id) do nothing;
  end if;
end;
$$;
