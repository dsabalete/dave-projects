-- ============================================================
-- Esquema de Supabase para el Gestor de Proyectos (Kanban)
-- Copia y pega esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- Tabla de proyectos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#3B6BFA',
  created_at timestamptz not null default now()
);

-- Tabla de tareas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Índices útiles
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_projects_user on projects(user_id);

-- ============================================================
-- Seguridad (RLS)
-- ============================================================

alter table projects enable row level security;
alter table tasks enable row level security;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- ============================================================
-- Deshabilitar registro público (recomendado)
-- Authentication → Providers → Email → desmarca "Enable Sign ups"
-- ============================================================
