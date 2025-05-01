-- Скрипт миграции для удаления дублирования связей должностей с отделами
-- 1. Сначала создаем связи в position_department для тех должностей, где есть department_id,
--    но нет соответствующей записи в position_department

INSERT INTO position_department (position_id, department_id, staff_units, current_count, vacancies, sort)
SELECT 
    p.position_id, 
    p.department_id, 
    p.staff_units, 
    p.current_count, 
    p.vacancies, 
    0 as sort
FROM 
    positions p
WHERE 
    p.department_id IS NOT NULL 
    AND NOT EXISTS (
        SELECT 1 
        FROM position_department pd 
        WHERE pd.position_id = p.position_id 
        AND pd.department_id = p.department_id
        AND pd.deleted = false
    )
    AND p.deleted = false;

-- 2. Теперь удаляем столбец department_id из таблицы positions
ALTER TABLE positions DROP COLUMN IF EXISTS department_id;

-- 3. Обновляем связанные объекты, если они есть
-- Удаляем связь из positionsRelations в схеме TypeScript (но это нужно сделать отдельно в коде)