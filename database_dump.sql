--
-- Полный дамп базы данных для локального использования
--

-- Отключаем внешние ключи на время импорта
SET FOREIGN_KEY_CHECKS = 0;

--
-- Создание таблиц
--

-- Таблица: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица: positions
CREATE TABLE IF NOT EXISTS positions (
    position_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER,
    staff_units INTEGER DEFAULT 0,
    current_count INTEGER DEFAULT 0,
    vacancies INTEGER DEFAULT 0,
    parent_position_id INTEGER,
    sort INTEGER DEFAULT 0
);

-- Таблица: departments
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    parent_department_id INTEGER,
    parent_position_id INTEGER
);

-- Таблица: position_department
CREATE TABLE IF NOT EXISTS position_department (
    position_link_id SERIAL PRIMARY KEY,
    position_id INTEGER,
    department_id INTEGER,
    sort INTEGER DEFAULT 0
);

-- Таблица: employees
CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    position_id INTEGER,
    phone TEXT,
    email TEXT,
    manager_id INTEGER,
    department_id INTEGER
);

-- Таблица: projects
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER
);

-- Таблица: employeeprojects
CREATE TABLE IF NOT EXISTS employeeprojects (
    employee_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    PRIMARY KEY (employee_id, project_id)
);

-- Таблица: leaves
CREATE TABLE IF NOT EXISTS leaves (
    leave_id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    type TEXT NOT NULL
);

--
-- Добавление внешних ключей
--

-- Внешние ключи для positions
ALTER TABLE positions
    ADD CONSTRAINT fk_positions_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE positions
    ADD CONSTRAINT fk_positions_parent_position
    FOREIGN KEY (parent_position_id) REFERENCES positions(position_id) ON DELETE SET NULL;

-- Внешние ключи для departments
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_parent_department
    FOREIGN KEY (parent_department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE departments
    ADD CONSTRAINT fk_departments_parent_position
    FOREIGN KEY (parent_position_id) REFERENCES positions(position_id) ON DELETE SET NULL;

-- Внешние ключи для position_department
ALTER TABLE position_department
    ADD CONSTRAINT fk_position_department_position
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE;

ALTER TABLE position_department
    ADD CONSTRAINT fk_position_department_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE;

-- Внешние ключи для employees
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_position
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL;

ALTER TABLE employees
    ADD CONSTRAINT fk_employees_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE employees
    ADD CONSTRAINT fk_employees_manager
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- Внешние ключи для projects
ALTER TABLE projects
    ADD CONSTRAINT fk_projects_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

-- Внешние ключи для employeeprojects
ALTER TABLE employeeprojects
    ADD CONSTRAINT fk_employeeprojects_employee
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE;

ALTER TABLE employeeprojects
    ADD CONSTRAINT fk_employeeprojects_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Внешние ключи для leaves
ALTER TABLE leaves
    ADD CONSTRAINT fk_leaves_employee
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE;

--
-- Заполнение таблиц данными
--

-- Пользователи
INSERT INTO users (id, username, email, password, created_at) VALUES
(1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195');

-- Отделы (сначала создаем отдел верхнего уровня)
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
(1, 'Администрация', NULL, NULL);

-- Должности (сначала создаем должности верхнего уровня)
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
(1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 1, 0, NULL, 1),
(2, 'Главный эксперт', NULL, 0, 0, 0, NULL, 2),
(3, 'Главный специалист', NULL, 0, 0, 0, NULL, 3);

-- Добавляем зависимые должности
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
(5, 'Генеральный директор', NULL, 0, 0, 0, 1, 5);

-- Добавляем остальные должности
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
(4, 'Исполнительный директор', NULL, 0, 0, 0, 5, 4),
(6, 'Начальник управления', NULL, 0, 0, 0, 1, 6),
(7, 'Заместитель генерального директора по координации реализации планов ОИВ', NULL, 0, 0, 0, 5, 7),
(8, 'Заместитель генерального директора по координации аналитики', NULL, 0, 0, 0, 5, 8),
(9, 'Заместитель генерального директора по координации разработки', NULL, 0, 0, 0, 5, 9),
(10, 'Директор по развитию', 1, 1, 0, 1, 5, 10);

-- Добавляем подотделы
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
(2, 'Управление цифровизации и градостроительных данных', 1, 1),
(3, 'Управление цифрового развития', 1, 1);

-- Сотрудники
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES
(1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1);

-- Добавляем подчиненных сотрудников
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES
(2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1),
(3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1),
(4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1),
(5, 'Иванов Иван Иванович', 10, '+7 (222) 222-22-22', 'ivanov@example.com', 1, 1);

-- Проекты
INSERT INTO projects (project_id, name, department_id) VALUES
(1, 'Городской портал цифровизации', 2),
(2, 'Система аналитики градостроительных данных', 2),
(3, 'Разработка API градостроительных данных', 3);

-- Назначаем сотрудников на проекты
INSERT INTO employeeprojects (employee_id, project_id, role) VALUES
(1, 1, 'Руководитель проекта'),
(2, 1, 'Архитектор системы'),
(3, 1, 'Технический директор'),
(4, 2, 'Руководитель проекта'),
(5, 2, 'Аналитик'),
(3, 3, 'Руководитель проекта'),
(5, 3, 'Разработчик API');

-- Отпуска
INSERT INTO leaves (leave_id, employee_id, start_date, end_date, type) VALUES
(1, 1, '2025-05-15', '2025-05-30', 'Ежегодный оплачиваемый отпуск'),
(2, 3, '2025-06-01', '2025-06-14', 'Ежегодный оплачиваемый отпуск'),
(3, 5, '2025-07-10', '2025-07-17', 'Отпуск без сохранения заработной платы');

-- Включаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 1;