#!/bin/bash
# Сохраняем DATABASE_URL и другие важные переменные окружения
DB_URL=$DATABASE_URL

# Сохраняем import_everything.sh во временную директорию
cp import_everything.sh /tmp/import_everything.sh

# Останавливаем текущие процессы
pkill -f "node|npm|tsx"

# Удаляем все файлы и папки (кроме .git и скрытых файлов)
find . -mindepth 1 -not -path "*/\.*" -delete

# Выполняем git pull
git pull

# Восстанавливаем import_everything.sh
cp /tmp/import_everything.sh ./import_everything.sh
chmod +x import_everything.sh

echo "Проект очищен и обновлен через git pull. Файл import_everything.sh восстановлен."

