-- =========================
-- PROFILES TABLE
-- =========================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamp default now()
);

alter table profiles enable row level security;

-- Profiles: user can read their own profile
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);

-- =========================
-- TASKS TABLE
-- =========================

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null check (status in ('pending', 'in_progress', 'completed')),
  assigned_to uuid references auth.users(id) on delete cascade,
  due_date timestamp,
  created_at timestamp default now()
);

alter table tasks enable row level security;

-- =========================
-- STAFF POLICIES
-- =========================

-- Staff can view their own tasks
create policy "Staff can view assigned tasks"
on tasks
for select
using (auth.uid() = assigned_to);

-- Staff can update their own tasks
create policy "Staff can update assigned tasks"
on tasks
for update
using (auth.uid() = assigned_to);

-- =========================
-- ADMIN POLICIES
-- =========================

-- Admin full access (select)
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
