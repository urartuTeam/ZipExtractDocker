-- Временно отключаем все триггеры и ограничения
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Отключаем все триггеры
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    END LOOP;
    
    -- Сохраняем таблицу users
    CREATE TEMPORARY TABLE temp_users AS SELECT * FROM users;
    
    -- Очищаем все таблицы кроме users
    EXECUTE 'TRUNCATE employeeprojects, leaves, employees, position_department, position_position, projects, positions, departments, settings RESTART IDENTITY;';
    
    -- Устанавливаем значения последовательностей
    PERFORM setval('positions_position_id_seq', 1000, false);
    PERFORM setval('departments_department_id_seq', 1000, false);
    PERFORM setval('employees_employee_id_seq', 1000, false);
    PERFORM setval('projects_project_id_seq', 1000, false);
    
    -- Включаем все триггеры
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL;';
    END LOOP;
END $$;