-- Добавление колонок deleted и deleted_at в таблицу employeeprojects
ALTER TABLE employeeprojects 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Добавление колонок deleted и deleted_at в таблицу leaves
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;