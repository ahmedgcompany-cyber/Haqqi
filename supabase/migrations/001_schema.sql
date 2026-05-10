-- Enable necessary extensions
-- (UUID already available via pgcrypto which is enabled by default in Supabase)

-- ============================================
-- Profiles (extends auth.users)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  "fullName" text,
  "avatarUrl" text,
  "subscriptionTier" text default 'free',
  "subscriptionStatus" text default 'inactive',
  "subscriptionProvider" text,
  "subscriptionExpiresAt" timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, "fullName", "avatarUrl")
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Companies
-- ============================================
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  "tradeLicense" text,
  country text not null,
  "bankCode" text,
  "wpsEstablishmentId" text,
  email text,
  "contactName" text,
  "createdAt" timestamptz default now()
);

alter table public.companies enable row level security;

drop policy if exists "Users can CRUD own companies" on public.companies;
create policy "Users can CRUD own companies"
  on public.companies for all using (auth.uid() = "userId");

-- ============================================
-- Employees
-- ============================================
create table if not exists public.employees (
  id uuid default gen_random_uuid() primary key,
  "companyId" uuid references public.companies(id) on delete cascade not null,
  "userId" uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  nationality text,
  salary numeric,
  "basicSalary" numeric,
  "startDate" date,
  "contractType" text,
  country text,
  iban text,
  "employeeNumber" text,
  status text default 'active',
  "unusedLeaveDays" integer default 0,
  "createdAt" timestamptz default now()
);

alter table public.employees enable row level security;

drop policy if exists "Users can CRUD own employees" on public.employees;
create policy "Users can CRUD own employees"
  on public.employees for all using (auth.uid() = "userId");

-- ============================================
-- Usage Logs
-- ============================================
create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid references public.profiles(id) on delete cascade not null,
  feature text not null,
  quantity integer default 1,
  "createdAt" timestamptz default now()
);

alter table public.usage_logs enable row level security;

drop policy if exists "Users can view own usage" on public.usage_logs;
create policy "Users can view own usage"
  on public.usage_logs for select using (auth.uid() = "userId");

drop policy if exists "Users can insert own usage" on public.usage_logs;
create policy "Users can insert own usage"
  on public.usage_logs for insert with check (auth.uid() = "userId");

-- ============================================
-- Audit Events
-- ============================================
create table if not exists public.audit_events (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid references public.profiles(id) on delete cascade not null,
  actor text not null,
  action text not null,
  entity text not null,
  "createdAt" timestamptz default now()
);

alter table public.audit_events enable row level security;

drop policy if exists "Users can view own audit events" on public.audit_events;
create policy "Users can view own audit events"
  on public.audit_events for select using (auth.uid() = "userId");

drop policy if exists "Users can insert own audit events" on public.audit_events;
create policy "Users can insert own audit events"
  on public.audit_events for insert with check (auth.uid() = "userId");

-- ============================================
-- Subscription Plans (seeded manually)
-- ============================================
create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  "priceMonthly" integer,
  "priceYearly" integer,
  limits jsonb default '{}'
);

alter table public.subscription_plans enable row level security;

drop policy if exists "Anyone can view plans" on public.subscription_plans;
create policy "Anyone can view plans"
  on public.subscription_plans for select using (true);

-- Seed plans
insert into public.subscription_plans (id, name, "priceMonthly", "priceYearly", limits)
values
  ('free', 'Free', 0, 0, '{"gratuityCalcs":5,"companies":1,"employees":10,"wpsExports":2,"settlementPdfs":2}'),
  ('growth', 'Growth', 2900, 29000, '{"gratuityCalcs":100,"companies":5,"employees":100,"wpsExports":9999,"settlementPdfs":9999}'),
  ('scale', 'Scale', 9900, 99000, '{"gratuityCalcs":999999,"companies":999,"employees":9999,"wpsExports":999999,"settlementPdfs":999999}')
on conflict (id) do update set
  name = excluded.name,
  "priceMonthly" = excluded."priceMonthly",
  "priceYearly" = excluded."priceYearly",
  limits = excluded.limits;

-- ============================================
-- Indexes
-- ============================================
create index if not exists idx_companies_user on public.companies("userId");
create index if not exists idx_employees_company on public.employees("companyId");
create index if not exists idx_employees_user on public.employees("userId");
create index if not exists idx_usage_logs_user_feature on public.usage_logs("userId", feature);
create index if not exists idx_audit_events_user on public.audit_events("userId");
