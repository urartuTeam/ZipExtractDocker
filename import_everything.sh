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
AS \$\$
BEGIN
    IF NEW.deleted = TRUE AND OLD.deleted = FALSE THEN
        NEW.deleted_at = NOW();
    ELSIF NEW.deleted = FALSE THEN
        NEW.deleted_at = NULL;
    END IF;
    RETURN NEW;
END;
\$\$;

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

-- Таблица отделов
CREATE TABLE public.departments (
    department_id SERIAL PRIMARY KEY,
    name text NOT NULL,
    parent_department_id integer REFERENCES public.departments(department_id),
    parent_position_id integer REFERENCES public.positions(position_id),
    deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
SQL

echo "Импорт позиций (должностей)..."
psql $DATABASE_URL << SQL
-- Сначала импортируем позиции (должности)
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (39, 'Заместитель руководителя департамента', 0, 0, 0, 1, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (43, 'Генеральный директор', 0, 0, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (50, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (51, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (52, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (53, 'Исполнительный директор', 0, 0, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (54, 'Начальник Отдела координации реализации планов ОИВ', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (55, 'Начальник Отдела координации аналитики ПО Строительство', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (56, 'Начальник Отдела координации аналитики ПО Земля', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (57, 'Начальник Отдела координации аналитики ПО Градрешения', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (58, 'Начальник Отдела координации аналитики ПО Аналитики и Мониторинга', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (59, 'Начальник Отдела координации разработки', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (60, 'Начальник Отдела инженерного обеспечения', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (61, 'Начальник Отдела тестирования', 1, 1, 0, 0, false, null, false);
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES (62, 'Начальник Отдела координации деятельности', 1, 1, 0, 0, false, null, false);
SQL

echo "Импорт отделов..."
psql $DATABASE_URL << SQL
-- Затем импортируем отделы
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (21, 'Администрация', null, null, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (22, 'Управление', null, 39, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (23, 'Управление цифровизации и градостроительных данных', 22, null, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (24, 'Управление цифрового развития', 22, null, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (25, 'Отдел координации реализации планов ОИВ', null, 50, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (26, 'Отдел координации аналитики ПО Строительство', null, 51, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (27, 'Отдел координации аналитики ПО Земля', null, 51, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (28, 'Отдел координации аналитики ПО Градрешения', null, 51, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (29, 'Отдел координации аналитики ПО Аналитики и Мониторинга', null, 51, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (30, 'Отдел координации разработки', null, 52, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (31, 'Отдел инженерного обеспечения', null, 52, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (33, 'Отдел координации деятельности', null, 53, false, null);
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES (32, 'Отдел тестирования', null, 52, false, null);
SQL

echo "Импорт сотрудников..."
psql $DATABASE_URL << SQL
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (82, 'Иванов Иван Иванович', 43, '+7 (929) 123-45-67', 'ivanov@example.com', null, 21, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (83, 'Петров Петр Петрович', 50, '+7 (929) 234-56-78', 'petrov@example.com', 82, 25, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (84, 'Сидоров Сидор Сидорович', 51, '+7 (929) 345-67-89', 'sidorov@example.com', 82, 26, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (85, 'Александров Александр Александрович', 52, '+7 (929) 456-78-90', 'alexandrov@example.com', 82, 30, false, null, null);
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES (86, 'Владимиров Владимир Владимирович', 53, '+7 (929) 567-89-01', 'vladimirov@example.com', 82, 33, false, null, null);
SQL

echo "Импорт позиция-отдел связей..."
psql $DATABASE_URL << SQL
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (51, 39, 21, 0, false, null, 1, 0, 1);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (52, 43, 21, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (53, 50, 21, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (54, 51, 21, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (55, 52, 21, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (56, 53, 21, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (57, 54, 25, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (58, 55, 26, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (59, 56, 27, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (60, 57, 28, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (61, 58, 29, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (62, 59, 30, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (63, 60, 31, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (64, 61, 32, 0, false, null, 1, 1, 0);
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES (65, 62, 33, 0, false, null, 1, 1, 0);
SQL

echo "Импорт иерархии должностей..."
psql $DATABASE_URL << SQL
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (1, 50, 43, 21, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (2, 51, 43, 21, 1, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (3, 52, 43, 21, 2, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (4, 53, 43, 21, 3, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (5, 54, 50, 25, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (6, 55, 51, 26, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (7, 56, 51, 27, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (8, 57, 51, 28, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (9, 58, 51, 29, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (10, 59, 52, 30, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (11, 60, 52, 31, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (12, 61, 52, 32, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES (13, 62, 53, 33, 0, '2025-05-07 08:00:00', '2025-05-07 08:00:00', false, null);
SQL

echo "Создание пользователя админа..."
psql $DATABASE_URL << SQL
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) 
VALUES (1, 'admin', 'admin@example.com', '\$2b\$10\$KdPboGGDG4YiXtESt5X3euZxNpUm0Wpj25cRMG01Vj/p9NXMTCk4S', '2025-05-07 08:00:00', false, null);
SQL

echo "Обновляем AUTO_INCREMENT для всех таблиц..."
psql $DATABASE_URL << SQL
SELECT setval('public.departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 1) FROM public.departments), true);
SELECT setval('public.employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 1) FROM public.employees), true);
SELECT setval('public.leaves_leave_id_seq', (SELECT COALESCE(MAX(leave_id), 1) FROM public.leaves), true);
SELECT setval('public.position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 1) FROM public.position_department), true);
SELECT setval('public.position_position_position_relation_id_seq', (SELECT COALESCE(MAX(position_relation_id), 1) FROM public.position_position), true);
SELECT setval('public.positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 1) FROM public.positions), true);
SELECT setval('public.projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 1) FROM public.projects), true);
SELECT setval('public.users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.users), true);
SQL

echo "Импорт завершен!"