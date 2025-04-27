-- Файл для исправления последовательностей в базе данных
-- Выполняем сброс значений для всех последовательностей, чтобы они соответствовали максимальным ID в таблицах

-- Отделы
SELECT setval('departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 0) FROM departments), true);

-- Сотрудники
SELECT setval('employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 0) FROM employees), true);

-- Должности
SELECT setval('positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 0) FROM positions), true);

-- Связи должностей с отделами
SELECT setval('position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 0) FROM position_department), true);

-- Проекты
SELECT setval('projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 0) FROM projects), true);

-- Отпуска (если таблица пустая, устанавливаем значение 1 без текущего использования)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM leaves) = 0 THEN
    PERFORM setval('leaves_leave_id_seq', 1, false);
  ELSE
    PERFORM setval('leaves_leave_id_seq', (SELECT MAX(leave_id) FROM leaves), true);
  END IF;
END $$;

-- Настройки
SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) FROM settings), true);

-- Пользователи
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true);