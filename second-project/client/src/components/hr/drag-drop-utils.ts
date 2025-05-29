import { Employee, OrgUnit } from '@shared/schema';

export interface DropResult {
  success: boolean;
  message?: string;
}

/**
 * Validate if an employee can be dropped on a specific org unit
 */
export function canEmployeeDropOnUnit(employee: Employee, unit: OrgUnit): boolean {
  // Сотрудников можно перемещать только на должности (позиции)
  if (!unit.isPosition) {
    return false;
  }
  
  // Проверка, не перемещаем ли мы сотрудника на ту же должность
  if (employee.positionId === unit.id) {
    return false;
  }
  
  return true;
}

/**
 * Validate if an org unit can be dropped on another org unit (for restructuring)
 */
export function canUnitDropOnUnit(sourceUnit: OrgUnit, targetUnit: OrgUnit): boolean {
  // Запрещаем перемещение узла на самого себя
  if (sourceUnit.id === targetUnit.id) {
    return false;
  }
  
  // Запрещаем создание циклических зависимостей
  // (нельзя перемещать родительский узел в его дочерний)
  if (isParentOf(sourceUnit.id, targetUnit, [])) {
    return false;
  }
  
  // Организации могут быть только корневыми элементами
  if (sourceUnit.isOrganization && targetUnit) {
    return false;
  }
  
  // Управление может быть только внутри организации или другого управления
  if (sourceUnit.isManagement && !(targetUnit.isOrganization || targetUnit.isManagement)) {
    return false;
  }
  
  // Отделы могут быть только внутри организации, управления или другого отдела
  if (sourceUnit.isDepartment && 
      !(targetUnit.isOrganization || targetUnit.isManagement || targetUnit.isDepartment)) {
    return false;
  }
  
  // Должности могут быть только внутри отделов или управлений, 
  // но не внутри других должностей или организаций
  if (sourceUnit.isPosition && 
      !(targetUnit.isDepartment || targetUnit.isManagement)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a unit is a parent of another unit
 */
function isParentOf(unitId: number, possibleChild: OrgUnit, checked: number[]): boolean {
  // Если мы уже проверяли этот узел, избегаем циклического обхода
  if (checked.includes(possibleChild.id)) {
    return false;
  }
  
  // Добавляем текущий узел в список проверенных
  checked.push(possibleChild.id);
  
  // Если родительский узел совпадает с искомым, то это родитель
  if (possibleChild.parentId === unitId) {
    return true;
  }
  
  // Если у проверяемого узла нет родителя, то искомый узел не может быть его родителем
  if (!possibleChild.parentId) {
    return false;
  }
  
  // Иначе нужно найти родителя проверяемого узла и выполнить проверку для него
  // Это рекурсивная проверка, которая для реальной системы будет выполняться через API
  return false; // Упрощенная логика для демо-версии
}