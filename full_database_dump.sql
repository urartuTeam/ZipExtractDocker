-- Полный дамп базы данных
-- Дата создания: 27 апреля 2025 г.

-- Отключаем ограничения и проверки
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- Структура таблицы departments
CREATE TABLE IF NOT EXISTS public.departments (
  department_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  parent_department_id integer,
  parent_position_id integer,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

-- Структура таблицы positions
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

-- Структура таблицы position_department
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

-- Структура таблицы employees
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

-- Структура таблицы projects
CREATE TABLE IF NOT EXISTS public.projects (
  project_id SERIAL PRIMARY KEY,
  name text NOT NULL,
  description text,
  department_id integer REFERENCES departments(department_id),
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

-- Структура таблицы employeeprojects
CREATE TABLE IF NOT EXISTS public.employeeprojects (
  employee_id integer REFERENCES employees(employee_id),
  project_id integer REFERENCES projects(project_id),
  role text NOT NULL,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone,
  PRIMARY KEY (employee_id, project_id)
);

-- Структура таблицы leaves
CREATE TABLE IF NOT EXISTS public.leaves (
  leave_id SERIAL PRIMARY KEY,
  employee_id integer REFERENCES employees(employee_id),
  start_date date NOT NULL,
  end_date date,
  type text NOT NULL,
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

-- Структура таблицы settings
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  data_key text NOT NULL UNIQUE,
  data_value text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- Структура таблицы users
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  deleted boolean DEFAULT false,
  deleted_at timestamp without time zone
);

-- Отключаем триггеры для ускорения импорта
ALTER TABLE departments DISABLE TRIGGER ALL;
ALTER TABLE positions DISABLE TRIGGER ALL;
ALTER TABLE position_department DISABLE TRIGGER ALL;
ALTER TABLE employees DISABLE TRIGGER ALL;
ALTER TABLE projects DISABLE TRIGGER ALL;
ALTER TABLE employeeprojects DISABLE TRIGGER ALL;
ALTER TABLE leaves DISABLE TRIGGER ALL;
ALTER TABLE settings DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- Очистка таблиц перед заполнением
TRUNCATE TABLE employeeprojects CASCADE;
TRUNCATE TABLE leaves CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE position_department CASCADE;
TRUNCATE TABLE positions CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE settings CASCADE;
TRUNCATE TABLE users CASCADE;