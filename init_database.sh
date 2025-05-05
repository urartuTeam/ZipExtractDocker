#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

echo "Инициализация базы данных..."
echo "Удаление существующих таблиц (если есть)..."

# Удаление существующих таблиц (если есть)
psql $DATABASE_URL << SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Восстановление структуры и данных из файла..."

# Импорт структуры и данных
psql $DATABASE_URL < full_database_dump.sql

echo "База данных успешно инициализирована!"
