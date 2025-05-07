#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

echo "Инициализация базы данных из файла 01.sql..."
echo "Удаление существующих таблиц (если есть)..."

# Удаление существующих таблиц (если есть)
psql $DATABASE_URL << SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Восстановление структуры и данных из файла..."

# Обработка SQL-файла и замена ссылок на postgres на текущего пользователя
sed "s/OWNER TO postgres;/OWNER TO current_user;/g" new_dump.sql > fixed_dump.sql

# Импорт структуры и данных
psql $DATABASE_URL < fixed_dump.sql

echo "База данных успешно инициализирована из файла 01.sql!"