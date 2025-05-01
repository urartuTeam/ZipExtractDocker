-- Создание таблицы position_position для хранения иерархии должностей
CREATE TABLE IF NOT EXISTS position_position (
    position_relation_id SERIAL PRIMARY KEY,
    position_id INTEGER NOT NULL,
    parent_position_id INTEGER NOT NULL,
    department_id INTEGER, -- Отдел, в котором действительна эта связь
    sort INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Связи для referential integrity
    CONSTRAINT fk_position
        FOREIGN KEY (position_id)
        REFERENCES positions (position_id),
    
    CONSTRAINT fk_parent_position
        FOREIGN KEY (parent_position_id)
        REFERENCES positions (position_id),
    
    CONSTRAINT fk_department
        FOREIGN KEY (department_id)
        REFERENCES departments (department_id)
);

-- Индексы для улучшения производительности запросов
CREATE INDEX IF NOT EXISTS idx_position_position_position_id
    ON position_position (position_id);

CREATE INDEX IF NOT EXISTS idx_position_position_parent_position_id
    ON position_position (parent_position_id);

CREATE INDEX IF NOT EXISTS idx_position_position_department_id
    ON position_position (department_id);

-- Составной индекс для уникальности связи в рамках отдела
CREATE UNIQUE INDEX IF NOT EXISTS idx_position_position_unique_relation
    ON position_position (position_id, parent_position_id, department_id)
    WHERE deleted = FALSE;

-- Комментарии для документации
COMMENT ON TABLE position_position IS 'Таблица для хранения иерархических связей между должностями в контексте отделов';
COMMENT ON COLUMN position_position.position_relation_id IS 'Уникальный идентификатор связи';
COMMENT ON COLUMN position_position.position_id IS 'ID подчиненной должности';
COMMENT ON COLUMN position_position.parent_position_id IS 'ID родительской должности';
COMMENT ON COLUMN position_position.department_id IS 'ID отдела, в котором действует связь (опционально)';
COMMENT ON COLUMN position_position.sort IS 'Порядок сортировки';
COMMENT ON COLUMN position_position.deleted IS 'Флаг удаления (мягкое удаление)';