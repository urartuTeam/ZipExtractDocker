-- Отключение ограничений внешних ключей
SET session_replication_role = 'replica';

-- Удаление данных из таблиц
TRUNCATE TABLE position_position CASCADE;
TRUNCATE TABLE position_department CASCADE;
TRUNCATE TABLE positions CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE organizations CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE employee_project CASCADE;
TRUNCATE TABLE leaves CASCADE;
TRUNCATE TABLE settings CASCADE;
TRUNCATE TABLE users CASCADE;

-- Сброс последовательностей
ALTER SEQUENCE position_relation_id_seq RESTART WITH 1;
ALTER SEQUENCE position_link_id_seq RESTART WITH 1;
ALTER SEQUENCE position_id_seq RESTART WITH 1;
ALTER SEQUENCE department_id_seq RESTART WITH 1;
ALTER SEQUENCE employee_id_seq RESTART WITH 1;
ALTER SEQUENCE project_id_seq RESTART WITH 1;
ALTER SEQUENCE employee_project_id_seq RESTART WITH 1;
ALTER SEQUENCE leave_id_seq RESTART WITH 1;

-- Включение ограничений внешних ключей
SET session_replication_role = 'origin';