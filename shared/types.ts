// Типы данных для организационной структуры
export type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization?: boolean;
  logo_path?: string | null;
  deleted?: boolean;
  deleted_at?: string | null;
};

export type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
  is_category?: boolean;
  deleted?: boolean;
  sort?: number | null;
  deleted_at?: string | null;
};

export type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null; // Поле manager_id для отслеживания подчиненности
  category_parent_id: number | null; // Поле category_parent_id для связи с родительской должностью категории
  deleted?: boolean;
  deleted_at?: string | null;
};

// Тип для построения позиций с сотрудниками
export type PositionWithEmployees = Position & {
  employees: Employee[];
};

// Тип для представления отдела как должности (для структуры дерева)
export type DepartmentAsPosition = {
  position_id: number; // Используем уникальный ID, например department_id * 1000
  name: string;
  isDepartment: true;
  department_id: number;
};

// Тип для построения дерева отделов
export type DepartmentNode = Department & {
  positions: Position[];
  children: DepartmentNode[];
  width: number; // ширина в процентах
  childCount: number; // общее количество дочерних элементов
};

// Тип для построения иерархии позиций
export type PositionHierarchyNode = {
  position: Position;
  employees: Employee[]; // Массив сотрудников на этой должности
  subordinates: PositionHierarchyNode[];
  childDepartments: Department[]; // Дочерние отделы, связанные с этой должностью
  department?: Department; // Информация об отделе, если это карточка отдела
};