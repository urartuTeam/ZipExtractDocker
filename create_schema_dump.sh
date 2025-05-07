#!/bin/bash

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
  echo "Ошибка: переменная DATABASE_URL не установлена"
  exit 1
fi

OUTPUT_FILE="schema_only.sql"

echo "Создание дампа только структуры базы данных (без данных)..."
pg_dump -h $PGHOST -U $PGUSER -p $PGPORT -d $PGDATABASE --schema-only > "$OUTPUT_FILE"

echo "Дамп структуры базы данных создан в файле: $OUTPUT_FILE"
