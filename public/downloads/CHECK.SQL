--
-- Полный дамп базы данных для локального использования
--

-- Очистка таблиц, если они существуют
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS employeeprojects CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS position_department CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Создание таблиц
CREATE TABLE departments (
                             department_id SERIAL PRIMARY KEY,
                             name TEXT NOT NULL,
                             parent_department_id INTEGER,
                             parent_position_id INTEGER
);

CREATE TABLE positions (
                           position_id SERIAL PRIMARY KEY,
                           name TEXT NOT NULL,
                           department_id INTEGER,
                           staff_units INTEGER DEFAULT 0,
                           current_count INTEGER DEFAULT 0,
                           vacancies INTEGER DEFAULT 0,
                           parent_position_id INTEGER,
                           sort INTEGER DEFAULT 0
);

CREATE TABLE position_department (
                                     position_link_id SERIAL PRIMARY KEY,
                                     position_id INTEGER,
                                     department_id INTEGER,
                                     sort INTEGER DEFAULT 0
);

CREATE TABLE employees (
                           employee_id SERIAL PRIMARY KEY,
                           full_name TEXT NOT NULL,
                           position_id INTEGER,
                           phone TEXT,
                           email TEXT,
                           manager_id INTEGER,
                           department_id INTEGER
);

CREATE TABLE projects (
                          project_id SERIAL PRIMARY KEY,
                          name TEXT NOT NULL,
                          department_id INTEGER
);

CREATE TABLE employeeprojects (
                                  employee_id INTEGER NOT NULL,
                                  project_id INTEGER NOT NULL,
                                  role TEXT NOT NULL,
                                  PRIMARY KEY (employee_id, project_id)
);

CREATE TABLE leaves (
                        leave_id SERIAL PRIMARY KEY,
                        employee_id INTEGER,
                        start_date DATE NOT NULL,
                        end_date DATE,
                        type TEXT NOT NULL
);

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username TEXT NOT NULL UNIQUE,
                       email TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление внешних ключей
ALTER TABLE departments
    ADD CONSTRAINT departments_parent_department_id_fkey
        FOREIGN KEY (parent_department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE departments
    ADD CONSTRAINT departments_parent_position_id_fkey
        FOREIGN KEY (parent_position_id) REFERENCES positions(position_id);

ALTER TABLE positions
    ADD CONSTRAINT positions_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE positions
    ADD CONSTRAINT fk_parent_position
        FOREIGN KEY (parent_position_id) REFERENCES positions(position_id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE position_department
    ADD CONSTRAINT position_department_position_id_fkey
        FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE;

ALTER TABLE position_department
    ADD CONSTRAINT position_department_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE;

ALTER TABLE employees
    ADD CONSTRAINT employees_position_id_fkey
        FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL;

ALTER TABLE employees
    ADD CONSTRAINT employees_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE employees
    ADD CONSTRAINT employees_manager_id_fkey
        FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

ALTER TABLE projects
    ADD CONSTRAINT projects_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE employeeprojects
    ADD CONSTRAINT employeeprojects_employee_id_fkey
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE;

ALTER TABLE employeeprojects
    ADD CONSTRAINT employeeprojects_project_id_fkey
        FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

ALTER TABLE leaves
    ADD CONSTRAINT leaves_employee_id_fkey
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE;

-- Вставка данных
-- Пользователи
INSERT INTO users (id, username, email, password, created_at) VALUES
    (1, 'admin', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '2025-04-24 07:52:25.855195');

-- Отделы - сначала только верхний уровень
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
    (1, 'Администрация', NULL, NULL);

-- Должности верхнего уровня
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
                                                                                                                              (1, 'ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА', 1, 1, 1, 0, NULL, 1),
                                                                                                                              (2, 'Главный эксперт', NULL, 0, 0, 0, NULL, 2),
                                                                                                                              (3, 'Главный специалист', NULL, 0, 0, 0, NULL, 3);

-- Подотделы
INSERT INTO departments (department_id, name, parent_department_id, parent_position_id) VALUES
                                                                                            (2, 'Управление цифровизации и градостроительных данных', 1, NULL),
                                                                                            (3, 'Управление цифрового развития', 1, NULL);

-- Должности второго уровня
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
    (5, 'Генеральный директор', NULL, 0, 0, 0, 1, 5);

-- Должности третьего уровня
INSERT INTO positions (position_id, name, department_id, staff_units, current_count, vacancies, parent_position_id, sort) VALUES
                                                                                                                              (4, 'Исполнительный директор', NULL, 0, 0, 0, 5, 4),
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

-- Проекты
INSERT INTO projects (project_id, name, department_id) VALUES
                                                           (1, 'Городской портал цифровизации', 2),
                                                           (2, 'Система аналитики градостроительных данных', 2),
                                                           (3, 'Разработка API градостроительных данных', 3);

-- Сотрудники в проектах
INSERT INTO employeeprojects (employee_id, project_id, role) VALUES
                                                                 (1, 1, 'Руководитель проекта'),
                                                                 (2, 1, 'Архитектор системы'),
                                                                 (3, 1, 'Технический директор'),
                                                                 (4, 2, 'Руководитель проекта'),
                                                                 (5, 2, 'Аналитик'),
                                                                 (3, 3, 'Руководитель проекта'),
                                                                 (5, 3, 'Разработчик API');

-- Сброс последовательностей
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('departments_department_id_seq', (SELECT MAX(department_id) FROM departments));
SELECT setval('positions_position_id_seq', (SELECT MAX(position_id) FROM positions));
SELECT setval('position_department_position_link_id_seq', COALESCE((SELECT MAX(position_link_id) FROM position_department), 1));
SELECT setval('employees_employee_id_seq', (SELECT MAX(employee_id) FROM employees));
SELECT setval('projects_project_id_seq', (SELECT MAX(project_id) FROM projects));
SELECT setval('leaves_leave_id_seq', COALESCE((SELECT MAX(leave_id) FROM leaves), 1));