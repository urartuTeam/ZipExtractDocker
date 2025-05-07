-- Удаляем старые данные
DROP TABLE IF EXISTS leaves CASCADE;
DROP TABLE IF EXISTS employeeprojects CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS position_department CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS _dummy_position_references CASCADE;

-- Запускаем миграцию базы данных, она восстановит схему
SELECT 'Таблицы удалены. Выполните миграцию базы данных с помощью npm run db:push';