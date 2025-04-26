-- Сначала создаем временные таблицы для хранения данных
CREATE TABLE positions_temp AS SELECT * FROM positions;
CREATE TABLE departments_temp AS SELECT * FROM departments;
CREATE TABLE position_department_temp AS SELECT * FROM position_department;
CREATE TABLE employees_temp AS SELECT * FROM employees;

-- Удаляем таблицы с зависимостями
DROP TABLE IF EXISTS position_department CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS positions CASCADE;

-- Создаем новые таблицы без ограничений первичного ключа
CREATE TABLE positions (
  position_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  staff_units INTEGER DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  vacancies INTEGER DEFAULT 0,
  parent_position_id INTEGER,
  sort INTEGER DEFAULT 0
);

CREATE TABLE departments (
  department_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  parent_position_id INTEGER
);

CREATE TABLE position_department (
  position_link_id INTEGER NOT NULL,
  position_id INTEGER,
  department_id INTEGER,
  sort INTEGER DEFAULT 0
);

CREATE TABLE employees (
  employee_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  position_id INTEGER,
  phone TEXT,
  email TEXT,
  manager_id INTEGER,
  department_id INTEGER
);

-- Восстанавливаем данные
INSERT INTO positions SELECT * FROM positions_temp;
INSERT INTO departments SELECT * FROM departments_temp;
INSERT INTO position_department SELECT * FROM position_department_temp;
INSERT INTO employees SELECT * FROM employees_temp;

-- Удаляем временные таблицы
DROP TABLE positions_temp;
DROP TABLE departments_temp;
DROP TABLE position_department_temp;
DROP TABLE employees_temp;

-- Создаем индексы для оптимизации производительности
CREATE INDEX idx_positions_id ON positions (position_id);
CREATE INDEX idx_departments_id ON departments (department_id);
CREATE INDEX idx_position_department_id ON position_department (position_link_id);
CREATE INDEX idx_employees_id ON employees (employee_id);

-- Создаем ограничения внешних ключей
ALTER TABLE departments ADD CONSTRAINT fk_departments_parent_position 
  FOREIGN KEY (parent_position_id) REFERENCES positions (position_id) ON DELETE SET NULL;

ALTER TABLE position_department ADD CONSTRAINT fk_position_department_position 
  FOREIGN KEY (position_id) REFERENCES positions (position_id) ON DELETE SET NULL;

ALTER TABLE position_department ADD CONSTRAINT fk_position_department_department 
  FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE SET NULL;

ALTER TABLE employees ADD CONSTRAINT fk_employees_position 
  FOREIGN KEY (position_id) REFERENCES positions (position_id) ON DELETE SET NULL;

ALTER TABLE employees ADD CONSTRAINT fk_employees_department 
  FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE SET NULL;

ALTER TABLE employees ADD CONSTRAINT fk_employees_manager 
  FOREIGN KEY (manager_id) REFERENCES employees (employee_id) ON DELETE SET NULL;