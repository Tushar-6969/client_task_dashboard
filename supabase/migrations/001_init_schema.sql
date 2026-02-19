-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES TABLE
-- =========================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff'
    check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

-- Admin can view all profiles
create policy "Admin can view all profiles"
on profiles
for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- =========================
-- AUTO PROFILE CREATION
-- =========================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'staff');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================
-- TASKS TABLE
-- =========================

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),
  assigned_to uuid references auth.users(id) on delete cascade,
  due_date timestamptz,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

-- =========================
-- STAFF POLICIES
-- =========================

create policy "Staff can view assigned tasks"
on tasks
for select
using (auth.uid() = assigned_to);

create policy "Staff can update assigned tasks"
on tasks
for update
using (auth.uid() = assigned_to);

-- =========================
-- ADMIN POLICIES
-- =========================

-- Admin full select
create policy "Admin can view all tasks"
on tasks
for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Admin update
create policy "Admin can update all tasks"
on tasks
for update
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Admin delete
create policy "Admin can delete all tasks"
on tasks
for delete
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Admin insert
create policy "Admin can insert tasks"
on tasks
for insert
with check (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
