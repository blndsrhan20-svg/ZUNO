-- ZUNO AI foundation. Additive migration: does not modify or delete existing social tables.
create extension if not exists pgcrypto;

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'محادثة جديدة',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_conversations_user_updated_idx on public.ai_conversations(user_id, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null default '',
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages(conversation_id, created_at);

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null default (timezone('utc', now()))::date,
  used integer not null default 0 check (used >= 0),
  limit_value integer not null default 20 check (limit_value >= 0),
  image_used integer not null default 0 check (image_used >= 0),
  image_limit integer not null default 5 check (image_limit >= 0),
  updated_at timestamptz not null default now(),
  primary key(user_id, usage_day)
);

create table if not exists public.ai_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.ai_settings(key,value) values
 ('daily_message_limit','20'::jsonb),
 ('daily_image_limit','5'::jsonb),
 ('guest_message_limit','3'::jsonb),
 ('max_input_chars','2000'::jsonb),
 ('max_output_tokens','800'::jsonb),
 ('max_saved_conversations','30'::jsonb),
 ('daily_cost_cap_usd','0'::jsonb),
 ('service_paused','false'::jsonb)
on conflict(key) do nothing;

create table if not exists public.ai_cost_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12,6) not null default 0 check (cost_usd >= 0),
  created_at timestamptz not null default now()
);
create index if not exists ai_cost_log_created_idx on public.ai_cost_log(created_at desc);

create table if not exists public.ai_shared_links (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null,
  excerpt text not null default '',
  decision text not null default 'review',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.ai_admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check(role in ('admin','moderator')),
  created_at timestamptz not null default now()
);
create table if not exists public.ai_user_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  excerpt text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.ai_user_bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.ai_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  custom_instructions text not null default '',
  language text not null default 'auto' check(language in ('auto','ar','en')),
  theme text not null default 'dark' check(theme in ('dark','light','system')),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_cost_log enable row level security;
alter table public.ai_shared_links enable row level security;
alter table public.ai_moderation_logs enable row level security;
alter table public.ai_admin_roles enable row level security;
alter table public.ai_user_warnings enable row level security;
alter table public.ai_user_bans enable row level security;
alter table public.ai_user_settings enable row level security;

drop policy if exists "ai conversations own select" on public.ai_conversations;
create policy "ai conversations own select" on public.ai_conversations for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai conversations own insert" on public.ai_conversations;
create policy "ai conversations own insert" on public.ai_conversations for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "ai conversations own update" on public.ai_conversations;
create policy "ai conversations own update" on public.ai_conversations for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ai conversations own delete" on public.ai_conversations;
create policy "ai conversations own delete" on public.ai_conversations for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "ai messages own select" on public.ai_messages;
create policy "ai messages own select" on public.ai_messages for select to authenticated using (auth.uid() = user_id);
-- Messages are inserted by the trusted API only; no client insert/update/delete policies.

drop policy if exists "ai usage own select" on public.ai_usage;
create policy "ai usage own select" on public.ai_usage for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai settings public read" on public.ai_settings;
create policy "ai settings public read" on public.ai_settings for select to authenticated using (true);
drop policy if exists "ai cost own select" on public.ai_cost_log;
create policy "ai cost own select" on public.ai_cost_log for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai shared own select" on public.ai_shared_links;
create policy "ai shared own select" on public.ai_shared_links for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai admin role own select" on public.ai_admin_roles;
create policy "ai admin role own select" on public.ai_admin_roles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai warnings own select" on public.ai_user_warnings;
create policy "ai warnings own select" on public.ai_user_warnings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai bans own select" on public.ai_user_bans;
create policy "ai bans own select" on public.ai_user_bans for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ai user settings own all" on public.ai_user_settings;
create policy "ai user settings own all" on public.ai_user_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic quota reservation. Service-role only; clients cannot call it.
create or replace function public.ai_reserve_message(p_user_id uuid)
returns table(used integer, limit_value integer)
language plpgsql security definer set search_path = public
as $$
declare v_limit integer;
begin
  if coalesce((select (value #>> '{}')::boolean from public.ai_settings where key='service_paused'), false) then
    raise exception 'SERVICE_PAUSED' using errcode='P0001';
  end if;
  select coalesce((value #>> '{}')::integer,20) into v_limit from public.ai_settings where key='daily_message_limit';
  v_limit := coalesce(v_limit,20);
  insert into public.ai_usage(user_id,usage_day,used,limit_value)
  values(p_user_id,(timezone('utc',now()))::date,0,v_limit)
  on conflict(user_id,usage_day) do update set limit_value=excluded.limit_value;
  return query update public.ai_usage u set used=u.used+1,updated_at=now()
    where u.user_id=p_user_id and u.usage_day=(timezone('utc',now()))::date and u.used<u.limit_value
    returning u.used,u.limit_value;
end; $$;

create or replace function public.ai_refund_message(p_user_id uuid)
returns void language sql security definer set search_path=public
as $$ update public.ai_usage set used=greatest(used-1,0),updated_at=now()
where user_id=p_user_id and usage_day=(timezone('utc',now()))::date; $$;

revoke all on function public.ai_reserve_message(uuid) from public, anon, authenticated;
revoke all on function public.ai_refund_message(uuid) from public, anon, authenticated;
grant execute on function public.ai_reserve_message(uuid) to service_role;
grant execute on function public.ai_refund_message(uuid) to service_role;

-- No client-side writes to moderation, cost, bans, warnings, admin roles or shared links.
