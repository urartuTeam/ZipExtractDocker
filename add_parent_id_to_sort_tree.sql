ALTER TABLE sort_tree ADD COLUMN parent_id INTEGER;
DROP INDEX IF EXISTS sort_tree_type_type_id_unique;
CREATE UNIQUE INDEX sort_tree_type_type_id_parent_id_unique ON sort_tree(type, type_id, parent_id);
