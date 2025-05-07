#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

echo "Очистка и пересоздание схемы..."
psql $DATABASE_URL << SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Создание базовой структуры таблиц..."
psql $DATABASE_URL << SQL
-- Функция для отметки времени удаления
CREATE FUNCTION public.set_deleted_timestamp() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.deleted = TRUE AND OLD.deleted = FALSE THEN
        NEW.deleted_at = NOW();
    ELSIF NEW.deleted = FALSE THEN
        NEW.deleted_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- Таблица отделов
CREATE TABLE public.departments (
    department_id SERIAL PRIMARY KEY,
    name text NOT NULL,
    parent_department_id integer REFERENCES public.departments(department_id),
    parent_position_id integer,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

-- Таблица должностей
CREATE TABLE public.positions (
    position_id SERIAL PRIMARY KEY,
    name text NOT NULL,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0,
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    is_category boolean DEFAULT false
);

-- Таблица сотрудников
CREATE TABLE public.employees (
    employee_id SERIAL PRIMARY KEY,
    full_name text NOT NULL,
    position_id integer REFERENCES public.positions(position_id),
    phone text,
    email text,
    manager_id integer REFERENCES public.employees(employee_id),
    department_id integer REFERENCES public.departments(department_id),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    category_parent_id integer
);

-- Таблица связи должность-отдел
CREATE TABLE public.position_department (
    position_link_id SERIAL PRIMARY KEY,
    position_id integer REFERENCES public.positions(position_id),
    department_id integer REFERENCES public.departments(department_id),
    sort integer DEFAULT 0,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    staff_units integer DEFAULT 0,
    current_count integer DEFAULT 0,
    vacancies integer DEFAULT 0
);

-- Таблица иерархии должностей
CREATE TABLE public.position_position (
    position_relation_id SERIAL PRIMARY KEY,
    position_id integer NOT NULL REFERENCES public.positions(position_id),
    parent_position_id integer NOT NULL REFERENCES public.positions(position_id),
    department_id integer REFERENCES public.departments(department_id),
    sort integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted boolean DEFAULT false,
    deleted_at timestamp with time zone
);

-- Таблица проектов
CREATE TABLE public.projects (
    project_id SERIAL PRIMARY KEY,
    name text NOT NULL,
    description text,
    department_id integer REFERENCES public.departments(department_id),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

-- Таблица связи сотрудник-проект
CREATE TABLE public.employeeprojects (
    employee_id integer REFERENCES public.employees(employee_id),
    project_id integer REFERENCES public.projects(project_id),
    role text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    PRIMARY KEY (employee_id, project_id)
);

-- Таблица отпусков
CREATE TABLE public.leaves (
    leave_id SERIAL PRIMARY KEY,
    employee_id integer REFERENCES public.employees(employee_id),
    start_date date NOT NULL,
    end_date date,
    type text NOT NULL,
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

-- Таблица настроек
CREATE TABLE public.settings (
    id SERIAL PRIMARY KEY,
    data_key text NOT NULL,
    data_value text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Таблица для иерархичной сортировки
CREATE TABLE public.sort_tree (
    id SERIAL PRIMARY KEY,
    sort integer NOT NULL,
    type character varying(20) NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    CONSTRAINT sort_tree_type_check CHECK (type::text = ANY (ARRAY[('department'::character varying)::text, ('position'::character varying)::text]))
);

-- Временная таблица для ссылок на должности
CREATE TABLE public._dummy_position_references (
    id SERIAL PRIMARY KEY,
    position_id integer
);

-- Создание пользователя
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

-- Активные представления 
CREATE VIEW public.active_departments AS
SELECT * FROM public.departments WHERE deleted = false;

CREATE VIEW public.active_positions AS
SELECT * FROM public.positions WHERE deleted = false;

CREATE VIEW public.active_employees AS
SELECT * FROM public.employees WHERE deleted = false;

CREATE VIEW public.active_position_department AS
SELECT * FROM public.position_department WHERE deleted = false;

CREATE VIEW public.active_projects AS
SELECT * FROM public.projects WHERE deleted = false;

CREATE VIEW public.active_employeeprojects AS
SELECT * FROM public.employeeprojects WHERE deleted = false;

CREATE VIEW public.active_leaves AS
SELECT * FROM public.leaves WHERE deleted = false;

CREATE VIEW public.active_users AS
SELECT * FROM public.users WHERE deleted = false;

-- Обновление внешних ключей для предварительно созданных таблиц
ALTER TABLE public.departments ADD CONSTRAINT departments_parent_position_id_fkey 
  FOREIGN KEY (parent_position_id) REFERENCES public.positions(position_id);

SQL

echo "Импорт данных из inserts.sql..."
psql $DATABASE_URL < inserts.sql

echo "Обновляем AUTO_INCREMENT для всех таблиц..."
psql $DATABASE_URL << SQL
SELECT setval('public.departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 1) FROM public.departments), true);
SELECT setval('public.employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 1) FROM public.employees), true);
SELECT setval('public.leaves_leave_id_seq', (SELECT COALESCE(MAX(leave_id), 1) FROM public.leaves), true);
SELECT setval('public.position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 1) FROM public.position_department), true);
SELECT setval('public.position_position_position_relation_id_seq', (SELECT COALESCE(MAX(position_relation_id), 1) FROM public.position_position), true);
SELECT setval('public.positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 1) FROM public.positions), true);
SELECT setval('public.projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 1) FROM public.projects), true);
SQL

echo "Импорт завершен!"