-- ============================================================
-- Esquema de Supabase para el Gestor de Proyectos (Kanban)
-- Copia y pega esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- Tabla de proyectos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#3B6BFA', -- color hex para el badge del proyecto
  created_at timestamptz not null default now()
);

-- Tabla de tareas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'media' check (priority in ('baja', 'media', 'alta')),
  due_date date,
  position integer not null default 0, -- orden dentro de la columna
  created_at timestamptz not null default now()
);

-- Índices útiles
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_project on tasks(project_id);

-- ============================================================
-- Seguridad (RLS)
-- Esta app está pensada para un solo usuario, sin login.
-- Se habilita RLS y se crea una política abierta con la clave
-- pública "anon". IMPORTANTE: cualquier persona con tu URL y clave
-- anon podrá leer/escribir estos datos. Es aceptable para un
-- proyecto personal, pero no publiques la URL de la app.
-- Si más adelante quieres restringirlo, añade autenticación de
-- Supabase y cambia estas políticas para exigir auth.uid().
-- ============================================================

alter table projects enable row level security;
alter table tasks enable row level security;

create policy "Acceso abierto a projects" on projects
  for all using (true) with check (true);

create policy "Acceso abierto a tasks" on tasks
  for all using (true) with check (true);

-- ============================================================
-- Datos de ejemplo (opcional, puedes borrarlos luego)
-- ============================================================

insert into projects (name, color) values
  ('Diseño', '#3B6BFA'),
  ('Backend', '#17A36C'),
  ('Contenido', '#D98C0F')
on conflict do nothing;
