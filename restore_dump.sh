#!/bin/bash

# Скрипт для восстановления дампа базы данных
# Использование: ./restore_dump.sh [имя_базы] [имя_пользователя]

# Значения по умолчанию
DB_NAME=${1:-"hr_system"}
DB_USER=${2:-"postgres"}

echo "Восстановление базы данных $DB_NAME из файла full_database_dump_inserts.sql..."

# Очистка базы данных перед восстановлением
psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $DB_USER; GRANT ALL ON SCHEMA public TO public;"

# Импорт данных из SQL-файла
psql -U $DB_USER -d $DB_NAME -f full_database_dump_inserts.sql

echo "Восстановление базы данных завершено."