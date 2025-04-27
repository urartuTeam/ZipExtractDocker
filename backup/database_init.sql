-- Файл инициализации базы данных
-- Используется для создания таблиц и установки первоначальных данных

-- Удаляем все существующие таблицы (если нужно)
-- DROP TABLE IF EXISTS leaves, employeeprojects, employees, projects, position_department, positions, departments, settings, users CASCADE;

-- Создаем таблицы
CREATE TABLE IF NOT EXISTS public.departments (
  department_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  parent_department_id integer,
  parent_position_id integer,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.positions (
  position_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  staff_units integer DEFAULT 0,
  current_count integer DEFAULT 0,
  vacancies integer DEFAULT 0,
  parent_position_id integer,
  sort integer DEFAULT 0,
  department_id integer,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.position_department (
  position_link_id SERIAL PRIMARY KEY,
  position_id integer REFERENCES positions(position_id),
  department_id integer REFERENCES departments(department_id),
  sort integer DEFAULT 0,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone,
  staff_units integer DEFAULT 0,
  current_count integer DEFAULT 0,
  vacancies integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.employees (
  employee_id SERIAL PRIMARY KEY,
  full_name text NOT NULL,
  position_id integer REFERENCES positions(position_id),
  phone text,
  email text,
  manager_id integer,
  department_id integer REFERENCES departments(department_id),
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.projects (
  project_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,
  department_id integer REFERENCES departments(department_id),
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.employeeprojects (
  employee_id integer REFERENCES employees(employee_id),
  project_id integer REFERENCES projects(project_id),
  role text NOT NULL,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone,
  PRIMARY KEY (employee_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.leaves (
  leave_id SERIAL PRIMARY KEY,
  employee_id integer REFERENCES employees(employee_id),
  start_date date NOT NULL,
  end_date date,
  type text NOT NULL,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  data_key text NOT NULL UNIQUE,
  data_value text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

-- Вставка начальных данных (если нужно)
-- Добавьте сюда INSERT запросы из 02-inserts.sql в случае необходимости