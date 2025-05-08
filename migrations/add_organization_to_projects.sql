-- Добавление столбца id_organization в таблицу projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS id_organization INTEGER;

-- Добавление внешнего ключа
ALTER TABLE projects ADD CONSTRAINT fk_organization FOREIGN KEY (id_organization) REFERENCES departments(department_id);