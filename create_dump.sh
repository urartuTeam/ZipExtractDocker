#!/bin/bash

# Скрипт для создания полного дампа базы данных
# Создает файл dump_backup_YYYY-MM-DD_HHMMSS.sql с текущим дампом базы

# Получаем текущую дату и время для имени файла
CURRENT_DATE=$(date +"%Y-%m-%d_%H%M%S")
DUMP_FILENAME="dump_backup_${CURRENT_DATE}.sql"

echo "Начинаем создание полного дампа базы данных..."

# Создаем директорию backup, если она не существует
mkdir -p backup

# Выполняем дамп структуры и данных без внешних ключей
echo "CREATE TABLE IF NOT EXISTS" > "backup/${DUMP_FILENAME}"

# Заголовок дампа
cat <<EOF >> "backup/${DUMP_FILENAME}"
-- Полный дамп базы данных
-- Дата создания: $(date +"%d %B %Y г.")

-- Отключаем ограничения и проверки
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

EOF

# Экспортируем структуру таблиц
pg_dump --no-owner --no-acl --schema-only --dbname="$DATABASE_URL" >> "backup/${DUMP_FILENAME}"

# Добавляем команды для отключения триггеров
cat <<EOF >> "backup/${DUMP_FILENAME}"

-- Отключаем триггеры для ускорения импорта
ALTER TABLE departments DISABLE TRIGGER ALL;
ALTER TABLE positions DISABLE TRIGGER ALL;
ALTER TABLE position_department DISABLE TRIGGER ALL;
ALTER TABLE employees DISABLE TRIGGER ALL;
ALTER TABLE projects DISABLE TRIGGER ALL;
ALTER TABLE employeeprojects DISABLE TRIGGER ALL;
ALTER TABLE leaves DISABLE TRIGGER ALL;
ALTER TABLE settings DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- Очистка таблиц перед заполнением
TRUNCATE TABLE employeeprojects CASCADE;
TRUNCATE TABLE leaves CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE position_department CASCADE;
TRUNCATE TABLE positions CASCADE;
TRUNCATE TABLE departments CASCADE;
TRUNCATE TABLE settings CASCADE;
TRUNCATE TABLE users CASCADE;

EOF

# Экспортируем данные для каждой таблицы отдельно и добавляем в дамп
for table in departments positions position_department employees projects employeeprojects leaves settings users; do
  echo "-- Данные для таблицы ${table}" >> "backup/${DUMP_FILENAME}"
  pg_dump --no-owner --no-acl --data-only --table="public.${table}" --dbname="$DATABASE_URL" | grep -v "^SET " | grep -v "^--" >> "backup/${DUMP_FILENAME}"
  echo "" >> "backup/${DUMP_FILENAME}"
done

# Добавляем команды для включения триггеров и обновления последовательностей
cat <<EOF >> "backup/${DUMP_FILENAME}"
-- Включаем триггеры обратно
ALTER TABLE departments ENABLE TRIGGER ALL;
ALTER TABLE positions ENABLE TRIGGER ALL;
ALTER TABLE position_department ENABLE TRIGGER ALL;
ALTER TABLE employees ENABLE TRIGGER ALL;
ALTER TABLE projects ENABLE TRIGGER ALL;
ALTER TABLE employeeprojects ENABLE TRIGGER ALL;
ALTER TABLE leaves ENABLE TRIGGER ALL;
ALTER TABLE settings ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- Установка значений последовательностей на основе максимальных ID
SELECT setval('departments_department_id_seq', (SELECT COALESCE(MAX(department_id), 0) + 1 FROM departments), false);
SELECT setval('positions_position_id_seq', (SELECT COALESCE(MAX(position_id), 0) + 1 FROM positions), false);
SELECT setval('position_department_position_link_id_seq', (SELECT COALESCE(MAX(position_link_id), 0) + 1 FROM position_department), false);
SELECT setval('employees_employee_id_seq', (SELECT COALESCE(MAX(employee_id), 0) + 1 FROM employees), false);
SELECT setval('projects_project_id_seq', (SELECT COALESCE(MAX(project_id), 0) + 1 FROM projects), false);
SELECT setval('leaves_leave_id_seq', 1, false);
SELECT setval('settings_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM settings), false);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false);
EOF

echo "Полный дамп базы данных успешно создан: backup/${DUMP_FILENAME}"
echo "Скопируйте этот файл при необходимости для восстановления базы данных."