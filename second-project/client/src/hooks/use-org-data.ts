import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrgUnit, OrgUnitWithChildren, Employee } from '@shared/schema';

export function useOrgData() {
  const queryClient = useQueryClient();
  
  // Fetch all org units
  const { 
    data: orgUnits = [], 
    isLoading: isLoadingOrgUnits,
    isError: isErrorOrgUnits,
    refetch: refetchOrgUnits
  } = useQuery({
    queryKey: ['/api/org-units'],
  });
  
  // Fetch all employees
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    isError: isErrorEmployees,
    refetch: refetchEmployees
  } = useQuery({
    queryKey: ['/api/employees'],
  });
  
  // Build tree structure from flat array
  const orgTree = useMemo(() => {
    if (!orgUnits.length) return [];
    
    const buildTree = (): OrgUnitWithChildren[] => {
      const orgUnitMap = new Map<number, OrgUnitWithChildren>();
      
      // Create mapping of id to orgUnit with children array
      orgUnits.forEach((unit: OrgUnit) => {
        orgUnitMap.set(unit.id, { ...unit, children: [] });
      });
      
      // Add employees to positions
      if (employees.length) {
        employees.forEach((employee: Employee) => {
          if (employee.positionId && orgUnitMap.has(employee.positionId)) {
            const position = orgUnitMap.get(employee.positionId)!;
            if (!position.employees) position.employees = [];
            position.employees.push(employee);
          }
        });
      }
      
      // Build the tree by adding children to their parents
      const rootUnits: OrgUnitWithChildren[] = [];
      
      orgUnits.forEach((unit: OrgUnit) => {
        const currentUnit = orgUnitMap.get(unit.id);
        if (currentUnit) {
          if (unit.parentId === null) {
            rootUnits.push(currentUnit);
          } else {
            const parentUnit = orgUnitMap.get(unit.parentId);
            if (parentUnit) {
              parentUnit.children.push(currentUnit);
            }
          }
        }
      });
      
      return rootUnits;
    };
    
    return buildTree();
  }, [orgUnits, employees]);
  
  const isLoading = isLoadingOrgUnits || isLoadingEmployees;
  const isError = isErrorOrgUnits || isErrorEmployees;
  
  const refetch = () => {
    refetchOrgUnits();
    refetchEmployees();
  };
  
  return {
    orgUnits,
    employees,
    orgTree,
    isLoading,
    isError,
    refetch
  };
}
