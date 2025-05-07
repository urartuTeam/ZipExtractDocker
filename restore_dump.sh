#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

if [ -z "$1" ]; then
  echo "Использование: $0 <путь_к_дампу.sql>"
  exit 1
fi

DUMP_FILE="$1"

if [ ! -f "$DUMP_FILE" ]; then
  echo "Ошибка: Файл дампа '$DUMP_FILE' не найден"
  exit 1
fi

echo "Восстановление базы данных из файла: $DUMP_FILE"
echo "Удаление существующих таблиц..."

# Удаление существующих таблиц
psql $DATABASE_URL << SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Восстановление структуры и данных из дампа..."

# Импорт данных из файла
psql $DATABASE_URL < "$DUMP_FILE"

echo "База данных успешно восстановлена из файла: $DUMP_FILE"
