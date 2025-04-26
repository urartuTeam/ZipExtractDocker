-- Дамп базы данных с использованием INSERT INTO
-- Создано: 2025-04-26

-- ТАБЛИЦА: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы users
INSERT INTO users (id, username, email, password, created_at) VALUES
(1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195');

-- ТАБЛИЦА: departments
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_department_id INTEGER REFERENCES departments(department_id),
    parent_position_id INTEGER,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы departments
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
(1, 'Администрация', NULL, NULL),
(2, 'Управление цифровизации и градостроительных данных', 1, 6),
(3, 'Управление цифрового развития', 1, 6);

-- ТАБЛИЦА: positions
CREATE TABLE IF NOT EXISTS positions (
    position_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    staff_units INTEGER,
    current_count INTEGER,
    vacancies INTEGER,
    parent_position_id INTEGER,
    sort INTEGER,
    department_id INTEGER,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы positions
INSERT INTO positions (position_id, name, staff_units, current_count, vacancies, parent_position_id, sort, department_id) VALUES
(1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 0, NULL, 1, 1),
(2, 'Главный эксперт', 0, 0, 0, NULL, 2, NULL),
(3, 'Главный специалист', 0, 0, 0, NULL, 3, NULL),
(5, 'Генеральный директор', 0, 0, 0, 1, 5, NULL),
(6, 'Начальник управления', 0, 0, 0, 1, 6, NULL),
(4, 'Исполнительный директор', 0, 0, 0, 5, 4, NULL),
(7, 'Заместитель генерального директора по координации реализации планов ОИВ', 0, 0, 0, 5, 7, NULL),
(8, 'Заместитель генерального директора по координации аналитики', 0, 0, 0, 5, 8, NULL),
(9, 'Заместитель генерального директора по координации разработки', 0, 0, 0, 5, 9, NULL),
(10, 'Директор по развитию', 1, 0, 1, 5, 10, 1);

-- ТАБЛИЦА: employees
CREATE TABLE IF NOT EXISTS employees (
    employee_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    position_id INTEGER REFERENCES positions(position_id),
    phone VARCHAR(255),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES employees(employee_id),
    department_id INTEGER REFERENCES departments(department_id),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы employees
INSERT INTO employees (employee_id, full_name, position_id, phone, email, manager_id, department_id) VALUES
(1, 'Степанова Дарья Владимировна', 1, '+7 (111) 111-11-11', 'mail@example.com', NULL, 1),
(2, 'Герц Владимир Андреевич', 6, NULL, NULL, 1, 1),
(3, 'Терновский Андрей Викторович', 9, NULL, NULL, NULL, 1),
(4, 'Подгорный Александр Владимирович', 4, NULL, NULL, NULL, 1);

-- ТАБЛИЦА: projects
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES departments(department_id),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы projects
INSERT INTO projects (project_id, name, description, department_id) VALUES
(1, 'Городской портал цифровизации', NULL, 2),
(2, 'Система аналитики градостроительных данных', NULL, 2),
(3, 'Разработка API градостроительных данных', NULL, 3);

-- ТАБЛИЦА: employeeprojects
CREATE TABLE IF NOT EXISTS employeeprojects (
    employee_id INTEGER REFERENCES employees(employee_id),
    project_id INTEGER REFERENCES projects(project_id),
    role VARCHAR(255),
    PRIMARY KEY (employee_id, project_id),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы employeeprojects
INSERT INTO employeeprojects (employee_id, project_id, role) VALUES
(1, 1, 'Руководитель проекта'),
(2, 1, 'Архитектор системы'),
(3, 1, 'Технический директор'),
(4, 2, 'Руководитель проекта'),
(3, 3, 'Руководитель проекта');

-- ТАБЛИЦА: position_department
CREATE TABLE IF NOT EXISTS position_department (
    position_link_id SERIAL PRIMARY KEY,
    position_id INTEGER REFERENCES positions(position_id),
    department_id INTEGER REFERENCES departments(department_id),
    sort INTEGER,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Данные для таблицы position_department
INSERT INTO position_department (position_link_id, position_id, department_id, sort) VALUES
(1, 1, 1, 0),
(2, 2, 1, 0),
(3, 3, 1, 0),
(4, 5, 1, 0),
(5, 6, 1, 0),
(6, 4, 1, 0),
(7, 7, 1, 0),
(8, 8, 1, 0),
(9, 9, 1, 0),
(10, 10, 1, 0);

-- ТАБЛИЦА: leaves
CREATE TABLE IF NOT EXISTS leaves (
    leave_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Дополнительная таблица для хранения первичных ключей
CREATE TABLE IF NOT EXISTS _dummy_position_references (
    id SERIAL PRIMARY KEY,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);