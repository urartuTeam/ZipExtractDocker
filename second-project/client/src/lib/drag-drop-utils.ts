import { Employee, OrgUnit } from '@shared/schema';

export interface DropResult {
  success: boolean;
  message?: string;
}

/**
 * Validate if an employee can be dropped on a specific org unit
 */
export function canEmployeeDropOnUnit(employee: Employee, unit: OrgUnit): boolean {
  // Check if unit is a position - only positions can have employees
  if (!unit.isPosition) {
    return false;
  }
  
  // You could add additional checks here:
  // - Check if position already has max staff count
  // - Check if employee has required skills for position
  // - Check for any other business rules
  
  return true;
}

/**
 * Validate if an org unit can be dropped on another org unit (for restructuring)
 */
export function canUnitDropOnUnit(sourceUnit: OrgUnit, targetUnit: OrgUnit): boolean {
  // Prevent circular references
  if (sourceUnit.id === targetUnit.id) {
    return false;
  }
  
  // Check for valid parent-child relationships based on business rules
  // For example, a position can't be parent of a department
  
  if (sourceUnit.isPosition && (targetUnit.isDepartment || targetUnit.isManagement || targetUnit.isOrganization)) {
    return true;
  }
  
  if (sourceUnit.isDepartment && (targetUnit.isManagement || targetUnit.isOrganization)) {
    return true;
  }
  
  if (sourceUnit.isManagement && targetUnit.isOrganization) {
    return true;
  }
  
  // By default, don't allow drops
  return false;
}
