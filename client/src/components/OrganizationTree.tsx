import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";

// Типы данных для организационной структуры
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

type Position = {
  position_id: number;
  name: string;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  department_id: number;
}

// Структура ветви организации
type OrgBranch = {
  department: Department;
  positions: Position[];
  employees: Employee[];
  children: OrgBranch[];
}

// Карточка должности с сотрудниками
const PositionCard = ({ 
  position, 
  employees 
}: { 
  position: Position, 
  employees: Employee[] 
}) => {
  return (
    <div className="position-card">
      <div className="position-title">{position.name}</div>
      <div className="position-divider"></div>
      {employees.length > 0 ? (
        employees.map(employee => (
          <div key={employee.employee_id} className="position-name">
            {employee.full_name}
          </div>
        ))
      ) : (
        <div className="position-name empty">Вакантная должность</div>
      )}
    </div>
  );
};

// Компонент отдела с должностями
const DepartmentBox = ({ 
  department, 
  positions, 
  employees 
}: { 
  department: Department, 
  positions: Position[], 
  employees: Employee[]
}) => {
  const departmentEmployees = employees.filter(
    emp => emp.department_id === department.department_id
  );
  
  // Группируем сотрудников по должностям
  const positionEmployees = new Map<number, Employee[]>();
  
  // Инициализируем Map пустыми массивами для всех позиций
  positions.forEach(pos => {
    positionEmployees.set(pos.position_id, []);
  });
  
  // Заполняем Map сотрудниками
  departmentEmployees.forEach(emp => {
    const employees = positionEmployees.get(emp.position_id) || [];
    employees.push(emp);
    positionEmployees.set(emp.position_id, employees);
  });
  
  return (
    <div className="department-box">
      <div className="department-title">{department.name}</div>
      
      <div className="positions-container">
        {positions.map(position => (
          <PositionCard 
            key={position.position_id}
            position={position}
            employees={positionEmployees.get(position.position_id) || []}
          />
        ))}
      </div>
    </div>
  );
};

// Компонент для рекурсивного отображения отделов
const DepartmentBranch = ({ 
  departments, 
  allPositions,
  allEmployees,
  parentId = null,
  level = 0
}: { 
  departments: Department[],
  allPositions: Position[],
  allEmployees: Employee[],
  parentId?: number | null,
  level?: number
}) => {
  // Загрузка связей должность-отдел
  const { data: positionDepartmentsResponse } = useQuery<{
    status: string, 
    data: { position_link_id: number, position_id: number, department_id: number }[]
  }>({
    queryKey: ['/api/positiondepartments'],
  });
  const positionDepartments = positionDepartmentsResponse?.data || [];
  
  // Отделы на текущем уровне
  const currentLevelDepartments = departments.filter(
    dept => dept.parent_department_id === parentId
  );
  
  if (currentLevelDepartments.length === 0) {
    return null;
  }
  
  return (
    <div className={`department-level level-${level}`}>
      <div className="department-row">
        {currentLevelDepartments.map(department => {
          // Получаем позиции, привязанные к этому отделу через связи position_department
          const departmentPositionIds = positionDepartments
            .filter(link => link.department_id === department.department_id)
            .map(link => link.position_id);
          
          // Находим соответствующие объекты Position
          const departmentPositions = allPositions.filter(
            pos => departmentPositionIds.includes(pos.position_id)
          );
          
          // Дочерние отделы для текущего отдела
          const childDepartments = departments.filter(
            dept => dept.parent_department_id === department.department_id
          );
          
          // Рассчитываем ширину отдела в зависимости от количества дочерних элементов
          // Минимальная ширина 300px, остальное пропорционально
          const minWidth = 300;
          const childWidth = childDepartments.length * minWidth;
          const width = Math.max(minWidth, childWidth);
          
          return (
            <div 
              key={department.department_id} 
              className="department-branch"
              style={{ 
                minWidth: `${minWidth}px`,
                width: childDepartments.length > 0 ? `${width}px` : `${minWidth}px`
              }}
            >
              <DepartmentBox 
                department={department} 
                positions={departmentPositions}
                employees={allEmployees}
              />
              
              {childDepartments.length > 0 && (
                <div className="department-children">
                  <DepartmentBranch 
                    departments={departments}
                    allPositions={allPositions}
                    allEmployees={allEmployees}
                    parentId={department.department_id}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrganizationTree: React.FC = () => {
  // Загрузка данных из API
  const { data: departmentsResponse, isLoading: isDepartmentsLoading } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  const departments = departmentsResponse?.data || [];

  const { data: positionsResponse, isLoading: isPositionsLoading } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  const positions = positionsResponse?.data || [];

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  const employees = employeesResponse?.data || [];

  // Если данные еще не загружены, показываем загрузку
  if (isDepartmentsLoading || isPositionsLoading || isEmployeesLoading) {
    return <div className="loading-message">Загрузка организационной структуры...</div>;
  }

  return (
    <div className="org-tree-container">
      <div className="org-tree-view">
        <DepartmentBranch 
          departments={departments}
          allPositions={positions}
          allEmployees={employees}
        />
      </div>
    </div>
  );
};

export default OrganizationTree;