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
                                                          position_id integer,
                                                          department_id integer,
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
                                                position_id integer,
                                                phone text,
                                                email text,
                                                manager_id integer,
                                                department_id integer,
                                                deleted boolean DEFAULT false,
                                                deleted_at timestamp without time zone
);

-- Структура таблицы projects
CREATE TABLE IF NOT EXISTS public.projects (
                                               project_id SERIAL PRIMARY KEY,
                                               name text NOT NULL,
                                               description text,
                                               department_id integer,
                                               deleted boolean DEFAULT false,
                                               deleted_at timestamp without time zone
);

-- Структура таблицы employeeprojects
CREATE TABLE IF NOT EXISTS public.employeeprojects (
                                                       employee_id integer,
                                                       project_id integer,
                                                       role text NOT NULL,
                                                       deleted boolean DEFAULT false,
                                                       deleted_at timestamp without time zone,
                                                       PRIMARY KEY (employee_id, project_id)
);

-- Структура таблицы leaves
CREATE TABLE IF NOT EXISTS public.leaves (
                                             leave_id SERIAL PRIMARY KEY,
                                             employee_id integer,
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

-- Данные для таблицы departments
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
                                                                                                                        (1, 'Администрация', NULL, NULL, false, NULL),
                                                                                                                        (2, 'Управление цифровизации и градостроительных данных', 1, 6, false, NULL),
                                                                                                                        (3, 'Управление цифрового развития', 1, 6, false, NULL),
                                                                                                                        (5, 'тестовая должность', NULL, 6, true, '2025-04-26 11:51:46.653'),
                                                                                                                        (6, 'тестовый отдел', NULL, 6, false, NULL),
                                                                                                                        (7, 'ОТДЕЛ КООРДИНАЦИИ   РАЗРАБОТКИ', NULL, 9, false, NULL);

-- Данные для таблицы positions
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort, department_id, deleted, deleted_at) VALUES
                                                                                                                                                          (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, false, NULL),
                                                                                                                                                          (2, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, false, NULL),
                                                                                                                                                          (3, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, false, NULL),
                                                                                                                                                          (4, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, false, NULL),
                                                                                                                                                          (5, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, false, NULL),
                                                                                                                                                          (6, 'Начальник управления', 0, 0, 0, 1, 6, NULL, false, NULL),
                                                                                                                                                          (7, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, false, NULL),
                                                                                                                                                          (8, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, false, NULL),
                                                                                                                                                          (9, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, false, NULL);

-- Данные для таблицы position_department
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES
                                                                                                                                                            (1, 1, 1, 0, false, NULL, 1, 1, 0),
                                                                                                                                                            (2, 2, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (3, 3, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (4, 5, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (5, 6, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (6, 4, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (7, 7, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (8, 8, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (9, 9, 1, 0, false, NULL, 0, 0, 0);

-- Данные для таблицы employees
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES
                                                                                                                                     (1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, false, NULL),
                                                                                                                                     (2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, false, NULL),
                                                                                                                                     (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, false, NULL),
                                                                                                                                     (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, false, NULL);

-- Данные для таблицы projects
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at) VALUES
                                                                                                    (1, 'Городской портал цифровизации', NULL, 2, false, NULL),
                                                                                                    (2, 'Система аналитики градостроительных данных', NULL, 2, false, NULL),
                                                                                                    (3, 'Разработка API градостроительных данных', NULL, 3, false, NULL);

-- Данные для таблицы employeeprojects
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES
                                                                                             (1, 1, 'Руководитель проекта', false, NULL),
                                                                                             (2, 1, 'Архитектор системы', false, NULL),
                                                                                             (3, 1, 'Технический директор', false, NULL),
                                                                                             (4, 2, 'Руководитель проекта', false, NULL),
                                                                                             (3, 3, 'Руководитель проекта', false, NULL);

-- Данные для таблицы settings
INSERT INTO public.settings (id, data_key, data_value, created_at, updated_at) VALUES
    (1, 'hierarchy_initial_levels', '3', '2025-04-27 10:36:15.699481', '2025-04-27 22:45:46.164128');

-- Данные для таблицы users
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) VALUES
    (1, 'admin', 'admin@example.com', '4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade', '2025-04-24 07:52:25.855195', false, NULL);

-- Включаем триггеры обратно
ALTER TABLE departments ENABLE TRIGGER ALL;
ALTER TABLE positions ENABLE TRIGGER ALL;
ALTER TABLE position_department ENABLE TRIGGER ALL;
ALTER TABLE employees ENABLE TRIGGER ALL;
ALTER TABLE projects ENABLE TRIGGER ALL;
ALTER TABLE employeeprojects ENABLE TRIGGER ALL;
ALTER TABLE leaves ENABLE TRIGGER ALL;
ALTER TABLE settings ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- Установка значений последовательностей на основе максимальных ID
SELECT setval('departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 0) + 1 FROM departments), false);
SELECT setval('positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 0) + 1 FROM positions), false);
SELECT setval('position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 0) + 1 FROM position_department), false);
SELECT setval('employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 0) + 1 FROM employees), false);
SELECT setval('projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 0) + 1 FROM projects), false);
SELECT setval('leaves_leave_id_seq', (SELECT COALESCE(MAX(leave_id), 0) + 1 FROM leaves), false);
SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM settings), false);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);

-- Вставка данных в таблицу departments
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
                                                                                                                        (1, 'Администрация', NULL, NULL, false, NULL),
                                                                                                                        (2, 'Управление цифровизации и градостроительных данных', 1, 6, false, NULL),
                                                                                                                        (3, 'Управление цифрового развития', 1, 6, false, NULL),
                                                                                                                        (5, 'тестовая должность', NULL, 6, true, '2025-04-26 11:51:46.653'),
                                                                                                                        (6, 'тестовый отдел', NULL, 6, false, NULL),
                                                                                                                        (7, 'ОТДЕЛ КООРДИНАЦИИ   РАЗРАБОТКИ', NULL, 9, false, NULL),
                                                                                                                        (8, 'Управление', 1, NULL, false, NULL),
                                                                                                                        (9, 'Тестовый отдел создан через API', 1, NULL, true, '2025-04-27 22:17:38.782'),
                                                                                                                        (10, 'Обновленный тестовый отдел', 1, NULL, true, '2025-04-27 22:45:45.44'),
                                                                                                                        (11, 'Администрация', NULL, NULL, false, NULL),
                                                                                                                        (12, 'Управление цифровизации и градостроительных данных', 1, 6, false, NULL),
                                                                                                                        (13, 'Управление цифрового развития', 1, 6, false, NULL),
                                                                                                                        (14, 'тестовый отдел', NULL, 6, false, NULL),
                                                                                                                        (15, 'ОТДЕЛ КООРДИНАЦИИ РАЗРАБОТКИ', NULL, 9, false, NULL),
                                                                                                                        (16, 'Управление 1', NULL, 1, false, NULL);

-- Вставка данных в таблицу positions
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort, department_id, deleted, deleted_at) VALUES
                                                                                                                                                          (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, false, NULL),
                                                                                                                                                          (2, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, false, NULL),
                                                                                                                                                          (3, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, false, NULL),
                                                                                                                                                          (5, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, false, NULL),
                                                                                                                                                          (6, 'Начальник управления', 0, 0, 0, 1, 6, NULL, false, NULL),
                                                                                                                                                          (4, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, false, NULL),
                                                                                                                                                          (7, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, false, NULL),
                                                                                                                                                          (8, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, false, NULL),
                                                                                                                                                          (9, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, false, NULL),
                                                                                                                                                          (10, 'Директор по развитию', 1, 0, 1, 5, 10, 1, false, NULL),
                                                                                                                                                          (11, 'Обновленная тестовая должность', 3, 1, 1, 1, 100, NULL, true, '2025-04-27 22:45:45.385'),
                                                                                                                                                          (12, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, false, NULL),
                                                                                                                                                          (13, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL, false, NULL),
                                                                                                                                                          (14, 'Главный специалист', 0, 0, 0, NULL, 3, NULL, false, NULL),
                                                                                                                                                          (15, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL, false, NULL),
                                                                                                                                                          (16, 'Генеральный директор', 0, 0, 0, 1, 5, NULL, false, NULL),
                                                                                                                                                          (17, 'Начальник управления', 0, 0, 0, 1, 6, NULL, false, NULL),
                                                                                                                                                          (18, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, false, NULL),
                                                                                                                                                          (19, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, false, NULL),
                                                                                                                                                          (20, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, false, NULL),
                                                                                                                                                          (21, 'Директор по развитию', 1, 0, 1, 5, 10, 1, false, NULL);

-- Вставка данных в таблицу position_department
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES
                                                                                                                                                            (1, 1, 1, 0, false, NULL, 1, 1, 0),
                                                                                                                                                            (2, 2, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (3, 3, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (4, 5, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (5, 6, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (6, 4, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (7, 7, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (8, 8, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (9, 9, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (10, 10, 1, 0, false, NULL, 1, 0, 1),
                                                                                                                                                            (11, 1, 1, 0, false, NULL, 1, 1, 0),
                                                                                                                                                            (12, 2, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (13, 3, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (14, 5, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (15, 6, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (16, 4, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (17, 7, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (18, 8, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (19, 9, 1, 0, false, NULL, 0, 0, 0),
                                                                                                                                                            (20, 10, 1, 0, false, NULL, 1, 0, 1);

-- Вставка данных в таблицу employees
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES
                                                                                                                                     (1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, false, NULL),
                                                                                                                                     (2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, false, NULL),
                                                                                                                                     (3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, false, NULL),
                                                                                                                                     (4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, false, NULL),
                                                                                                                                     (5, 'Обновленный Тестовый Сотрудник', 11, '+7 (999) 987-65-43', 'test@example.com', NULL, 10, true, '2025-04-27 22:45:45.315'),
                                                                                                                                     (6, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, false, NULL),
                                                                                                                                     (7, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, false, NULL),
                                                                                                                                     (8, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, false, NULL),
                                                                                                                                     (9, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, false, NULL);

-- Вставка данных в таблицу projects
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at) VALUES
                                                                                                    (1, 'Городской портал цифровизации', NULL, 2, false, NULL),
                                                                                                    (2, 'Система аналитики градостроительных данных', NULL, 2, false, NULL),
                                                                                                    (3, 'Разработка API градостроительных данных', NULL, 3, false, NULL),
                                                                                                    (4, 'Городской портал цифровизации', NULL, 2, false, NULL),
                                                                                                    (5, 'Система аналитики градостроительных данных', NULL, 2, false, NULL),
                                                                                                    (6, 'Разработка API градостроительных данных', NULL, 3, false, NULL);

-- Вставка данных в таблицу employeeprojects
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES
                                                                                             (1, 1, 'Руководитель проекта', false, NULL),
                                                                                             (2, 1, 'Архитектор системы', false, NULL),
                                                                                             (3, 1, 'Технический директор', false, NULL),
                                                                                             (4, 2, 'Руководитель проекта', false, NULL),
                                                                                             (3, 3, 'Руководитель проекта', false, NULL);

-- Вставка данных в таблицу settings
INSERT INTO public.settings (id, data_key, data_value, created_at, updated_at) VALUES
    (1, 'hierarchy_initial_levels', '3', '2025-04-27 10:36:15.699481', '2025-04-27 22:45:46.164128');

-- Вставка данных в таблицу users
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) VALUES
    (1, 'admin', 'admin@example.com', '4ec86d813dc530a40745900a6439209e6c1f6357b8ade99cb85f5e4dda8fc0d4927b840f8ae5710ef1ce55b7b4b8b9cf2a8c832d3be46a15a9082a4fb4e9751b.3c30567107e13e47c160c7456b9acade', '2025-04-24 07:52:25.855195', false, NULL);

-- Обновляем последовательности, чтобы они соответствовали максимальным ID
SELECT setval('departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 0) FROM departments), true);
SELECT setval('positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 0) FROM positions), true);
SELECT setval('position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 0) FROM position_department), true);
SELECT setval('employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 0) FROM employees), true);
SELECT setval('projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 0) FROM projects), true);
SELECT setval('leaves_leave_id_seq', 1, false);
SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) FROM settings), true);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true);

-- Включаем триггеры обратно
ALTER TABLE departments ENABLE TRIGGER ALL;
ALTER TABLE positions ENABLE TRIGGER ALL;
ALTER TABLE position_department ENABLE TRIGGER ALL;
ALTER TABLE employees ENABLE TRIGGER ALL;
ALTER TABLE projects ENABLE TRIGGER ALL;
ALTER TABLE employeeprojects ENABLE TRIGGER ALL;
ALTER TABLE leaves ENABLE TRIGGER ALL;
ALTER TABLE settings ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;