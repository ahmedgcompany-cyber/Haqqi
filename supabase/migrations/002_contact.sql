-- ============================================
-- Contact Submissions
-- ============================================
create table if not exists public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  "createdAt" timestamptz default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "Anyone can insert contact submissions" on public.contact_submissions;
create policy "Anyone can insert contact submissions"
  on public.contact_submissions for insert with check (true);

drop policy if exists "Users can view own contact submissions" on public.contact_submissions;
create policy "Users can view own contact submissions"
  on public.contact_submissions for select using (auth.uid() is not null);
