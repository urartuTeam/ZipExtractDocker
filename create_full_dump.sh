#!/bin/bash

# Скрипт для создания полного дампа базы данных
# Сохраняет данные в формате SQL с INSERT INTO операторами

echo "Создание полного дампа базы данных..."

# Параметры для pg_dump
# --inserts: использовать INSERT вместо COPY для более универсального формата
# --disable-triggers: отключить триггеры при загрузке данных
# --no-owner: не включать команды, устанавливающие владельца объектов
# --no-acl: не включать права доступа (GRANT/REVOKE)
# --clean: добавить DROP TABLE перед созданием
# --if-exists: использовать IF EXISTS в DROP командах

pg_dump "$DATABASE_URL" \
  --inserts \
  --disable-triggers \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --schema-only > full_database_dump_auto.sql

# Экспортируем только данные без определения схемы
pg_dump "$DATABASE_URL" \
  --inserts \
  --disable-triggers \
  --no-owner \
  --no-acl \
  --data-only >> full_database_dump_auto.sql

# Скрипт для установки последовательностей на основе данных
cat << 'EOF' >> full_database_dump_auto.sql

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

echo "Создание полного дампа базы данных завершено. Результат сохранен в файл: full_database_dump_auto.sql"