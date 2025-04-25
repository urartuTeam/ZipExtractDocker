-- Миграция для изменения структуры отделов
-- Меняем parent_department_id на parent_position_id

-- 1. Добавляем новый столбец parent_position_id
ALTER TABLE departments ADD COLUMN parent_position_id INTEGER;

-- 2. Добавляем внешний ключ на таблицу positions
ALTER TABLE departments
ADD CONSTRAINT fk_department_parent_position
FOREIGN KEY (parent_position_id) REFERENCES positions (position_id)
ON DELETE SET NULL;

-- 3. Обновляем существующие данные (примерный запрос, адаптируйте под вашу структуру)
-- Предположим, что в вашей базе есть следующая иерархия:
-- Администрация (id=1) -> Директор (position_id=1)
-- Отдел разработки (id=2) parent_department_id=1 -> перевязываем на должность "Директор" (position_id=1)
-- ИТ отдел (id=3) parent_department_id=2 -> перевязываем на должность "Руководитель отдела разработки" (position_id=2)
-- и т.д.

-- Пример обновления:
UPDATE departments SET parent_position_id = 1 WHERE department_id = 2;
UPDATE departments SET parent_position_id = 2 WHERE department_id = 3;
-- ... и так далее для всех отделов

-- 4. Удаляем внешний ключ parent_department_id (если он существует)
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_department_parent_department;

-- 5. Удаляем старый столбец parent_department_id
-- Закомментируйте эту строку, если хотите сохранить старые данные для сравнения
-- ALTER TABLE departments DROP COLUMN parent_department_id;

-- 6. Обновляем индексы
CREATE INDEX IF NOT EXISTS idx_department_parent_position ON departments (parent_position_id);
DROP INDEX IF EXISTS idx_department_parent_department;