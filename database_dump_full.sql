-- Дамп базы данных с использованием INSERT INTO

-- Очистка таблиц (если нужна)
TRUNCATE users, departments, positions, employees, position_department, projects, employeeprojects, leaves CASCADE;

-- Сбросить последовательности
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_department_id_seq RESTART WITH 1;
ALTER SEQUENCE positions_position_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_employee_id_seq RESTART WITH 1;
ALTER SEQUENCE position_department_position_link_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_project_id_seq RESTART WITH 1;
ALTER SEQUENCE leaves_leave_id_seq RESTART WITH 1;

-- Пользователи
INSERT INTO users (id, username, email, password, created_at) VALUES
(1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195');

-- Отделы
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
(1, 'Администрация', NULL, NULL),
(2, 'Управление цифровизации и градостроительных данных', 1, NULL),
(3, 'Управление цифрового развития', 1, NULL);

-- Должности
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
(1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 1, 0, NULL, 1),
(2, 'Главный эксперт', NULL, 0, 0, 0, NULL, 2),
(3, 'Главный специалист', NULL, 0, 0, 0, NULL, 3),
(4, 'Исполнительный директор', NULL, 0, 0, 0, 5, 4),
(5, 'Генеральный директор', NULL, 0, 0, 0, 1, 5),
(6, 'Начальник управления', NULL, 0, 0, 0, 1, 6),
(7, 'Заместитель генерального директора по координации реализации планов ОИВ', NULL, 0, 0, 0, 5, 7),
(8, 'Заместитель генерального директора по координации аналитики', NULL, 0, 0, 0, 5, 8),
(9, 'Заместитель генерального директора по координации разработки', NULL, 0, 0, 0, 5, 9),
(10, 'Директор по развитию', 1, 1, 0, 1, 5, 10);

-- Сотрудники
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES
(1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1),
(2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1),
(3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1),
(4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1),
(5, 'Иванов Иван Иванович', 10, '+7 (222) 222-22-22', 'ivanov@example.com', 1, 1);

-- Связь должностей и отделов
-- В таблице position_department нет данных

-- Проекты
-- В таблице projects нет данных

-- Связь сотрудников и проектов
-- В таблице employeeprojects нет данных

-- Отпуска
-- В таблице leaves нет данных

-- Добавим тестовые проекты для демонстрации
INSERT INTO projects (project_id, name, department_id) VALUES
(1, 'Городской портал цифровизации', 2),
(2, 'Система аналитики градостроительных данных', 2),
(3, 'Разработка API градостроительных данных', 3);

-- Назначим сотрудников на проекты
INSERT INTO employeeprojects (employee_id, project_id, role) VALUES
(1, 1, 'Руководитель проекта'),
(2, 1, 'Архитектор системы'),
(3, 1, 'Технический директор'),
(4, 2, 'Руководитель проекта'),
(5, 2, 'Аналитик'),
(3, 3, 'Руководитель проекта'),
(5, 3, 'Разработчик API');

-- Обновляем parent_position_id в таблице departments
UPDATE departments SET parent_position_id = 1 WHERE department_id = 2;
UPDATE departments SET parent_position_id = 1 WHERE department_id = 3;

-- Заполняем таблицу отпусков тестовыми данными
INSERT INTO leaves (leave_id, employee_id, start_date, end_date, type) VALUES
(1, 1, '2025-05-15', '2025-05-30', 'Ежегодный оплачиваемый отпуск'),
(2, 3, '2025-06-01', '2025-06-14', 'Ежегодный оплачиваемый отпуск'),
(3, 5, '2025-07-10', '2025-07-17', 'Отпуск без сохранения заработной платы');