#!/bin/bash

# Скрипт для инициализации базы данных PostgreSQL
# Использование: ./init_database.sh [имя_базы] [имя_пользователя] [пароль]

# Значения по умолчанию
DB_NAME=${1:-"hr_system"}
DB_USER=${2:-"postgres"}
DB_PASS=${3:-"postgres"}

# Создание базы данных и пользователя
echo "Создание базы данных $DB_NAME и пользователя $DB_USER..."

# Создаем пользователя и базу данных
psql -U postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "База данных и пользователь созданы."

# Импорт данных из SQL-файла
echo "Импорт данных из full_database_dump_inserts.sql..."
psql -U $DB_USER -d $DB_NAME -f full_database_dump_inserts.sql

echo "Инициализация базы данных завершена."