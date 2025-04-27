-- Файл для добавления soft delete ко всем таблицам
-- Этот файл содержит SQL-запросы для обеспечения реализации механизма soft delete

-- Проверка наличия колонок soft delete и добавление их при необходимости

-- Функция для работы с soft delete
-- Создаем функцию, которая будет автоматически заполнять deleted_at при установке deleted=true
CREATE OR REPLACE FUNCTION set_deleted_timestamp() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted = TRUE AND OLD.deleted = FALSE THEN
    NEW.deleted_at = NOW();
  ELSIF NEW.deleted = FALSE THEN
    NEW.deleted_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем или обновляем триггеры для всех таблиц с поддержкой soft delete
-- departments
DROP TRIGGER IF EXISTS set_departments_deleted_timestamp ON departments;
CREATE TRIGGER set_departments_deleted_timestamp
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- positions
DROP TRIGGER IF EXISTS set_positions_deleted_timestamp ON positions;
CREATE TRIGGER set_positions_deleted_timestamp
BEFORE UPDATE ON positions
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- position_department
DROP TRIGGER IF EXISTS set_position_department_deleted_timestamp ON position_department;
CREATE TRIGGER set_position_department_deleted_timestamp
BEFORE UPDATE ON position_department
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- employees
DROP TRIGGER IF EXISTS set_employees_deleted_timestamp ON employees;
CREATE TRIGGER set_employees_deleted_timestamp
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- projects
DROP TRIGGER IF EXISTS set_projects_deleted_timestamp ON projects;
CREATE TRIGGER set_projects_deleted_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- employeeprojects
DROP TRIGGER IF EXISTS set_employeeprojects_deleted_timestamp ON employeeprojects;
CREATE TRIGGER set_employeeprojects_deleted_timestamp
BEFORE UPDATE ON employeeprojects
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- leaves
DROP TRIGGER IF EXISTS set_leaves_deleted_timestamp ON leaves;
CREATE TRIGGER set_leaves_deleted_timestamp
BEFORE UPDATE ON leaves
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- users
DROP TRIGGER IF EXISTS set_users_deleted_timestamp ON users;
CREATE TRIGGER set_users_deleted_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_deleted_timestamp();

-- Создаем представления (views), которые будут фильтровать только не удаленные записи
-- Это позволит легко получать только активные данные без необходимости постоянно добавлять WHERE deleted = FALSE

-- departments
CREATE OR REPLACE VIEW active_departments AS
  SELECT * FROM departments WHERE deleted = FALSE;

-- positions
CREATE OR REPLACE VIEW active_positions AS
  SELECT * FROM positions WHERE deleted = FALSE;

-- position_department
CREATE OR REPLACE VIEW active_position_department AS
  SELECT * FROM position_department WHERE deleted = FALSE;

-- employees
CREATE OR REPLACE VIEW active_employees AS
  SELECT * FROM employees WHERE deleted = FALSE;

-- projects
CREATE OR REPLACE VIEW active_projects AS
  SELECT * FROM projects WHERE deleted = FALSE;

-- employeeprojects
CREATE OR REPLACE VIEW active_employeeprojects AS
  SELECT * FROM employeeprojects WHERE deleted = FALSE;

-- leaves
CREATE OR REPLACE VIEW active_leaves AS
  SELECT * FROM leaves WHERE deleted = FALSE;

-- users
CREATE OR REPLACE VIEW active_users AS
  SELECT * FROM users WHERE deleted = FALSE;