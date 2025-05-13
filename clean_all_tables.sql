-- Отключение ограничений внешних ключей для облегчения удаления
ALTER TABLE IF EXISTS position_position DROP CONSTRAINT IF EXISTS position_position_position_id_fkey;
ALTER TABLE IF EXISTS position_position DROP CONSTRAINT IF EXISTS position_position_parent_position_id_fkey;
ALTER TABLE IF EXISTS position_position DROP CONSTRAINT IF EXISTS position_position_department_id_fkey;

ALTER TABLE IF EXISTS position_department DROP CONSTRAINT IF EXISTS position_department_position_id_fkey;
ALTER TABLE IF EXISTS position_department DROP CONSTRAINT IF EXISTS position_department_department_id_fkey;

ALTER TABLE IF EXISTS employees DROP CONSTRAINT IF EXISTS employees_position_id_fkey;
ALTER TABLE IF EXISTS employees DROP CONSTRAINT IF EXISTS employees_department_id_fkey;
ALTER TABLE IF EXISTS employees DROP CONSTRAINT IF EXISTS employees_manager_id_fkey;

-- Очистка всех таблиц
TRUNCATE TABLE position_position CASCADE;
TRUNCATE TABLE position_department CASCADE;
TRUNCATE TABLE positions CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE leaves CASCADE;
TRUNCATE TABLE employeeprojects CASCADE;
TRUNCATE TABLE settings CASCADE;

-- Восстановление ограничений внешних ключей
ALTER TABLE IF EXISTS position_position ADD CONSTRAINT position_position_position_id_fkey FOREIGN KEY (position_id) REFERENCES positions(position_id);
ALTER TABLE IF EXISTS position_position ADD CONSTRAINT position_position_parent_position_id_fkey FOREIGN KEY (parent_position_id) REFERENCES positions(position_id);
ALTER TABLE IF EXISTS position_position ADD CONSTRAINT position_position_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(department_id);

ALTER TABLE IF EXISTS position_department ADD CONSTRAINT position_department_position_id_fkey FOREIGN KEY (position_id) REFERENCES positions(position_id);
ALTER TABLE IF EXISTS position_department ADD CONSTRAINT position_department_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(department_id);

ALTER TABLE IF EXISTS employees ADD CONSTRAINT employees_position_id_fkey FOREIGN KEY (position_id) REFERENCES positions(position_id);
ALTER TABLE IF EXISTS employees ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(department_id);
ALTER TABLE IF EXISTS employees ADD CONSTRAINT employees_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES employees(employee_id);