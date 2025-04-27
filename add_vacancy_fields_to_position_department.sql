-- Добавляем новые поля в таблицу position_department
ALTER TABLE position_department 
ADD COLUMN IF NOT EXISTS staff_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vacancies INTEGER DEFAULT 0;

-- Перенос данных из positions в position_department
UPDATE position_department pd
SET 
  staff_units = p.staff_units,
  current_count = p.current_count,
  vacancies = p.vacancies
FROM positions p
WHERE pd.position_id = p.position_id;