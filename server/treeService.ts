import { db } from "./db";
import { departments, positions, position_department, position_position, employees, sort_tree } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Структура сотрудника для вывода в дерево
export type EmployeeInfo = {
  id: number;
  fullName: string;
};

export type TreeNode = {
  id: string;
  name: string;
  type: "department" | "position";
  children: TreeNode[];
  // Информация о сотруднике (только для должностей)
  employee?: EmployeeInfo;
  // Значение сортировки для элемента
  sort: number;
  // Поля для диагностики и облегчения поиска
  positionId?: number;
  departmentId?: number;
};

export async function fetchTree(): Promise<TreeNode[]> {
  // Получаем все необходимые данные из базы
  const depts = await db.select().from(departments).where(eq(departments.deleted, false));
  const poses = await db.select().from(positions).where(eq(positions.deleted, false));
  const pd = await db.select().from(position_department).where(eq(position_department.deleted, false));
  const pp = await db.select().from(position_position).where(eq(position_position.deleted, false));
  
  // Загружаем данные сотрудников и значения сортировки
  const emps = await db.select().from(employees).where(eq(employees.deleted, false));
  const sorts = await db.select().from(sort_tree);

  console.log(`Загружено ${depts.length} отделов, ${poses.length} должностей, ${emps.length} сотрудников`);
  console.log(`Загружено ${pd.length} связей должность-отдел, ${pp.length} связей должность-должность, ${sorts.length} записей сортировки`);

  // Создаем результирующее дерево и различные отображения
  const tree: TreeNode[] = [];
  
  // Временное хранилище узлов для быстрого поиска
  const nodesByPositionId = new Map<number, TreeNode>();
  const nodesByDepartmentId = new Map<number, TreeNode>();
  
  // Создаем отображения для быстрого доступа к данным
  const employeesByPositionId = new Map<number, EmployeeInfo>();
  const sortByTypeAndId = new Map<string, number>(); // Ключ: "тип:id"
  
  // Заполняем отображение сотрудников
  emps.forEach(emp => {
    if (emp.position_id) {
      employeesByPositionId.set(emp.position_id, {
        id: emp.employee_id,
        fullName: emp.full_name
      });
    }
  });
  
  // Заполняем отображение значений сортировки
  sorts.forEach(s => {
    const key = `${s.type}:${s.type_id}`;
    sortByTypeAndId.set(key, s.sort);
  });
  
  // Функция для получения значения сортировки
  const getSortValue = (type: "department" | "position", id: number): number => {
    const key = `${type}:${id}`;
    return sortByTypeAndId.get(key) || 0;
  };
  
  // Сначала создаем все узлы для отделов
  depts.forEach(dept => {
    const deptNode: TreeNode = {
      id: `d${dept.department_id}`,
      name: dept.name, 
      type: "department",
      children: [],
      departmentId: dept.department_id,
      sort: getSortValue("department", dept.department_id)
    };
    nodesByDepartmentId.set(dept.department_id, deptNode);
  });
  
  // Затем создаем все узлы для должностей
  poses.forEach(pos => {
    if (pos.position_id !== null) {
      // Находим сотрудника для данной должности, если есть
      const employee = employeesByPositionId.get(pos.position_id);
      
      const posNode: TreeNode = {
        id: `p${pos.position_id}`,
        name: pos.name,
        type: "position",
        children: [],
        positionId: pos.position_id,
        sort: getSortValue("position", pos.position_id),
        employee // Добавляем информацию о сотруднике
      };
      nodesByPositionId.set(pos.position_id, posNode);
    }
  });
  
  // Устанавливаем отношения между отделами и должностями
  pd.forEach(relation => {
    // Проверяем, что position_id и department_id не null и приводим их к требуемому типу 
    const positionId = relation.position_id as number; // TypeScript принимает это утверждение
    const departmentId = relation.department_id as number; // TypeScript принимает это утверждение
    
    if (positionId && departmentId) {
      const posNode = nodesByPositionId.get(positionId);
      const deptNode = nodesByDepartmentId.get(departmentId);
      
      if (posNode && deptNode) {
        // Проверяем, есть ли у должности родительская должность через pp
        const hasParentPosition = pp.some(r => r.position_id === positionId);
        
        // Если должность не имеет родительской должности, добавляем её как дочернюю к отделу
        if (!hasParentPosition) {
          console.log(`Добавляем должность "${posNode.name}" в отдел "${deptNode.name}"`);
          deptNode.children.push(posNode);
        }
      }
    }
  });
  
  // Устанавливаем иерархию между должностями
  pp.forEach(relation => {
    if (relation.parent_position_id && relation.position_id) {
      const childNode = nodesByPositionId.get(relation.position_id);
      const parentNode = nodesByPositionId.get(relation.parent_position_id);
      
      if (childNode && parentNode) {
        console.log(`Добавляем должность "${childNode.name}" как дочернюю к "${parentNode.name}"`);
        parentNode.children.push(childNode);
      }
    }
  });
  
  // Устанавливаем отношения между отделами
  depts.forEach(dept => {
    const deptNode = nodesByDepartmentId.get(dept.department_id);
    
    // Отдел связан с родительским отделом
    if (dept.parent_department_id && deptNode) {
      const parentDeptNode = nodesByDepartmentId.get(dept.parent_department_id);
      if (parentDeptNode) {
        console.log(`Добавляем отдел "${deptNode.name}" как дочерний к отделу "${parentDeptNode.name}"`);
        parentDeptNode.children.push(deptNode);
      }
    }
    // Отдел связан с родительской должностью
    else if (dept.parent_position_id && deptNode) {
      const parentPosNode = nodesByPositionId.get(dept.parent_position_id);
      if (parentPosNode) {
        console.log(`Добавляем отдел "${deptNode.name}" как дочерний к должности "${parentPosNode.name}"`);
        parentPosNode.children.push(deptNode);
      }
    }
    // Корневой отдел
    else if (deptNode) {
      console.log(`Добавляем корневой отдел "${deptNode.name}"`);
      tree.push(deptNode);
    }
  });
  
  // Явная проверка на наличие отдела "Управление" в дереве
  const managementDept = depts.find(d => d.name === "Управление");
  if (managementDept) {
    console.log(`Проверка отдела "Управление" (ID=${managementDept.department_id})`);
    
    if (managementDept.parent_position_id) {
      const parentPosNode = nodesByPositionId.get(managementDept.parent_position_id);
      const managementNode = nodesByDepartmentId.get(managementDept.department_id);
      
      if (parentPosNode && managementNode) {
        console.log(`Отдел "Управление" должен быть дочерним элементом должности "${parentPosNode.name}"`);
        
        // Проверяем, есть ли уже этот отдел в дочерних элементах должности
        const alreadyAdded = parentPosNode.children.some(child => 
          child.type === "department" && child.departmentId === managementDept.department_id
        );
        
        if (!alreadyAdded) {
          console.log(`Принудительно добавляем отдел "Управление" в должность "${parentPosNode.name}"`);
          parentPosNode.children.push(managementNode);
        }
      }
    }
  }
  
  // Сортируем дочерние элементы по полю sort перед возвратом
  const sortNodesRecursively = (nodes: TreeNode[]) => {
    // Сортируем текущий уровень
    nodes.sort((a, b) => a.sort - b.sort);
    
    // Рекурсивно сортируем все дочерние уровни
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodesRecursively(node.children);
      }
    });
    
    return nodes;
  };
  
  // Сортируем корневые узлы и все дочерние элементы
  sortNodesRecursively(tree);
  
  console.log(`Построено дерево с ${tree.length} корневыми узлами`);
  return tree;
}