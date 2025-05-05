-- Преобразованные из COPY в INSERT INTO запросы для dump.sql

-- _dummy_position_references
INSERT INTO public._dummy_position_references (id, position_id) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных, если они есть

-- departments
INSERT INTO public.departments (department_id, name, parent_department_id, parent_position_id, deleted, deleted_at) VALUES
(21, 'Администрация', NULL, NULL, false, NULL),
(22, 'Управление', NULL, 39, false, NULL),
(23, 'Управление цифровизации и градостроительных данных', 22, NULL, false, NULL),
(24, 'Управление цифрового развития', 22, NULL, false, NULL),
(25, 'Отдел координации реализации планов ОИВ', NULL, 50, false, NULL),
(26, 'Отдел координации аналитики ПО Строительство', NULL, 51, false, NULL),
(27, 'Отдел координации аналитики ПО Земля', NULL, 51, false, NULL),
(28, 'Отдел координации аналитики ПО Градрешения', NULL, 51, false, NULL),
(29, 'Отдел координации аналитики ПО Аналитики и Мониторинга', NULL, 51, false, NULL),
(30, 'Отдел координации разработки', NULL, 52, false, NULL),
(31, 'Отдел инженерного обеспечения', NULL, 52, false, NULL),
(32, 'Отдел инженерного тестирования', NULL, 52, false, NULL),
(33, 'Отдел координации деятельности', NULL, 53, false, NULL);

-- Заглушка для employeeprojects
INSERT INTO public.employeeprojects (employee_id, project_id, role, deleted, deleted_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для employees
INSERT INTO public.employees (employee_id, full_name, position_id, phone, email, manager_id, department_id, deleted, deleted_at, category_parent_id) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для leaves
INSERT INTO public.leaves (leave_id, employee_id, start_date, end_date, type, deleted, deleted_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для position_department
INSERT INTO public.position_department (position_link_id, position_id, department_id, sort, deleted, deleted_at, staff_units, current_count, vacancies) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для position_position
INSERT INTO public.position_position (position_relation_id, position_id, parent_position_id, department_id, sort, created_at, updated_at, deleted, deleted_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для positions
INSERT INTO public.positions (position_id, name, staff_units, current_count, vacancies, sort, deleted, deleted_at, is_category) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для projects
INSERT INTO public.projects (project_id, name, description, department_id, deleted, deleted_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для settings
INSERT INTO public.settings (id, data_key, data_value, created_at, updated_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для sort_tree
INSERT INTO public.sort_tree (id, sort, type, type_id, parent_id) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных

-- Заглушка для users
INSERT INTO public.users (id, username, email, password, created_at, deleted, deleted_at) VALUES
-- Здесь должны быть добавлены значения из оригинальных данных