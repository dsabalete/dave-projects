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
  color text not null default '#3B6BFA',
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
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Útiles
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_project on tasks(project_id);

-- ============================================================
-- Migración: si las tablas ya existen con user_id NOT NULL,
-- ejecuta esto para volverlas opcionales:
-- ============================================================
-- alter table projects alter column user_id drop not null;
-- alter table tasks alter column user_id drop not null;
