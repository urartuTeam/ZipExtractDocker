-- Миграция схемы: переход от parent_department_id к parent_position_id
-- Версия 1.0, Апрель 2025

-- 1. Добавляем столбец parent_position_id, если он еще не существует
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'departments' AND column_name = 'parent_position_id') THEN
        ALTER TABLE departments ADD COLUMN parent_position_id INTEGER;
    END IF;
END $$;

-- 2. Добавляем внешний ключ на таблицу positions
ALTER TABLE departments
    DROP CONSTRAINT IF EXISTS fk_department_parent_position;

ALTER TABLE departments
    ADD CONSTRAINT fk_department_parent_position
    FOREIGN KEY (parent_position_id) REFERENCES positions(position_id)
    ON DELETE SET NULL;

-- 3. Обновляем существующие данные
-- Предположим, что отделы верхнего уровня привязаны к должности "ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА" (ID = 1)
UPDATE departments SET parent_position_id = 1 WHERE parent_department_id = 1 AND parent_position_id IS NULL;

-- 4. Создаем индекс для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_department_parent_position ON departments(parent_position_id);

-- 5. Не удаляем parent_department_id сразу для обратной совместимости и возможности отката
-- Когда миграция будет подтверждена и проверена, можно удалить этот столбец
-- ALTER TABLE departments DROP COLUMN parent_department_id;

-- 6. Эта миграция не затрагивает другие таблицы, так как все отношения определены через внешние ключи
-- и будут обновлены автоматически