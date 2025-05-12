// Типы данных для организационной структуры

export interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization?: boolean;
  logo_path?: string | null;
  sort?: number;
  deleted?: boolean;
  deleted_at?: string | null;
}

export interface Position {
  position_id: number;
  name: string;
  sort?: number;
  is_category?: boolean;
  deleted?: boolean;
  deleted_at?: string | null;
  departments?: any[];
  parent_positions?: any[];
  children_positions?: any[];
  is_subordinate?: boolean;
}

export interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
  category_parent_id?: number | null;
  deleted?: boolean;
  deleted_at?: string | null;
}

export interface PositionDepartmentRelation {
  id: number;
  position_id: number;
  department_id: number;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
}

export interface PositionPositionRelation {
  id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
}

export interface PositionHierarchyNode {
  position: Position;
  employees: Employee[];
  subordinates: PositionHierarchyNode[];
  department?: Department;
  childDepartments?: Department[];
}

export interface NavigationHistoryItem {
  positionId: number;
  departmentId: number | null;
}

export interface DepartmentNode {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  children: DepartmentNode[];
  positions?: Position[];
  is_organization?: boolean;
  logo_path?: string | null;
  width?: number;
  top_position?: any;
}