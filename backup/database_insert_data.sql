-- Файл для вставки начальных данных
-- Используется для заполнения таблиц начальными данными

-- Отделы
INSERT INTO public.departments (name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
('Администрация', NULL, NULL, FALSE, NULL),
('Управление цифровизации и градостроительных данных', 1, 6, FALSE, NULL),
('Управление цифрового развития', 1, 6, FALSE, NULL),
('тестовый отдел', NULL, 6, FALSE, NULL),
('ОТДЕЛ КООРДИНАЦИИ РАЗРАБОТКИ', NULL, 9, FALSE, NULL)
ON CONFLICT (department_id) DO NOTHING;

-- Должности
INSERT INTO public.positions (name, staff_units, current_count, vacancies, parent_position_id, sort, department_id, deleted, deleted_at) VALUES
('ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1, FALSE, NULL),
('Главный эксперт', 0, 0, 0, NULL, 2, NULL, FALSE, NULL),
('Главный специалист', 0, 0, 0, NULL, 3, NULL, FALSE, NULL),
('Исполнительный директор', 0, 0, 0, 5, 4, NULL, FALSE, NULL),
('Генеральный директор', 0, 0, 0, 1, 5, NULL, FALSE, NULL),
('Начальник управления', 0, 0, 0, 1, 6, NULL, FALSE, NULL),
('Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL, FALSE, NULL),
('Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL, FALSE, NULL),
('Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL, FALSE, NULL),
('Директор по развитию', 1, 0, 1, 5, 10, 1, FALSE, NULL)
ON CONFLICT (position_id) DO NOTHING;

-- Связи должностей с отделами
INSERT INTO public.position_department (position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES
(1, 1, 0, FALSE, NULL, 1, 1, 0),
(2, 1, 0, FALSE, NULL, 0, 0, 0),
(3, 1, 0, FALSE, NULL, 0, 0, 0),
(5, 1, 0, FALSE, NULL, 0, 0, 0),
(6, 1, 0, FALSE, NULL, 0, 0, 0),
(4, 1, 0, FALSE, NULL, 0, 0, 0),
(7, 1, 0, FALSE, NULL, 0, 0, 0),
(8, 1, 0, FALSE, NULL, 0, 0, 0),
(9, 1, 0, FALSE, NULL, 0, 0, 0),
(10, 1, 0, FALSE, NULL, 1, 0, 1)
ON CONFLICT DO NOTHING;

-- Сотрудники
INSERT INTO public.employees (full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at) VALUES
('Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1, FALSE, NULL),
('Герц Владимир Андреевич', 6, NULL, NULL, 1, 1, FALSE, NULL),
('Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1, FALSE, NULL),
('Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1, FALSE, NULL)
ON CONFLICT (employee_id) DO NOTHING;

-- Проекты
INSERT INTO public.projects (name, description, department_id, deleted, deleted_at) VALUES
('Городской портал цифровизации', NULL, 2, FALSE, NULL),
('Система аналитики градостроительных данных', NULL, 2, FALSE, NULL),
('Разработка API градостроительных данных', NULL, 3, FALSE, NULL)
ON CONFLICT (project_id) DO NOTHING;

-- Связи сотрудников с проектами
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES
(1, 1, 'Руководитель проекта', FALSE, NULL),
(2, 1, 'Архитектор системы', FALSE, NULL),
(3, 1, 'Технический директор', FALSE, NULL),
(4, 2, 'Руководитель проекта', FALSE, NULL),
(3, 3, 'Руководитель проекта', FALSE, NULL)
ON CONFLICT DO NOTHING;

-- Настройки
INSERT INTO public.settings (data_key, data_value, created_at, updated_at) VALUES
('hierarchy_initial_levels', '3', NOW(), NOW())
ON CONFLICT (data_key) DO UPDATE SET data_value = EXCLUDED.data_value, updated_at = NOW();

-- Пользователи
INSERT INTO public.users (username, email, password, created_at, deleted, deleted_at) VALUES
('admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', NOW(), FALSE, NULL)
ON CONFLICT (username) DO NOTHING;