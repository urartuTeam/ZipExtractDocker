#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

OUTPUT_FILE="full_database_dump.sql"

echo "Создание полного дампа базы данных..."

# Создаем временный файл для дампа
pg_dump -h $PGHOST -U $PGUSER -p $PGPORT -d $PGDATABASE > "$OUTPUT_FILE"

echo "Полный дамп базы данных создан в файле: $OUTPUT_FILE"
