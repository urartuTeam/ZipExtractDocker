#!/bin/bash

# Скрипт для полного сброса и восстановления базы данных
# ВНИМАНИЕ! Этот скрипт удалит ВСЕ данные из базы данных и восстановит их из дампа

echo "ВНИМАНИЕ! Этот скрипт удалит ВСЕ данные из базы данных."
echo "Вы уверены, что хотите продолжить? (y/n)"
read confirmation

if [[ $confirmation != "y" && $confirmation != "Y" ]]; then
  echo "Операция отменена."
  exit 0
fi

echo "Начинаем сброс и восстановление базы данных..."

# Удаляем все таблицы, если они существуют
echo "1. Удаление существующих таблиц..."
psql "$DATABASE_URL" << EOF
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS employeeprojects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS position_department CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS set_deleted_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_vacancy_count() CASCADE;
EOF

# Создаем структуру базы данных заново
echo "2. Создание структуры базы данных..."
psql "$DATABASE_URL" -f database_init.sql

# Восстанавливаем данные
echo "3. Вставка начальных данных..."
psql "$DATABASE_URL" -f database_insert_data.sql

# Добавляем механизм soft delete
echo "4. Настройка механизма soft delete..."
psql "$DATABASE_URL" -f add_soft_delete.sql

# Добавляем поля для вакансий
echo "5. Настройка полей вакансий..."
psql "$DATABASE_URL" -f add_vacancy_fields_to_position_department.sql

# Исправляем последовательности
echo "6. Обновление последовательностей..."
psql "$DATABASE_URL" -f fix_sequences.sql

echo "Сброс и восстановление базы данных завершены успешно!"