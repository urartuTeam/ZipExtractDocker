import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

interface Position {
  position_id: number;
  name: string;
  department_id: number;
}

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  position_id: number;
  department_id: number;
}

interface Project {
  project_id: number;
  name: string;
  department_id: number;
}

const OrganizationTree: React.FC = () => {
  // Get departments
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/departments'],
  });

  // Get positions
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positions'],
  });

  // Get employees
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/employees'],
  });

  // Get projects
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/projects'],
  });

  const isLoading = isLoadingDepartments || isLoadingPositions || isLoadingEmployees || isLoadingProjects;

  if (isLoading) {
    return (
      <div className="h-40 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-border mr-2" />
        <span>Загрузка структуры организации...</span>
      </div>
    );
  }

  const departments = departmentsResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];

  // Находим корневые отделы (без parent_id)
  const rootDepartments = departments.filter(
    (dept: any) => !dept.parent_department_id
  );

  // Группируем отделы по parent_id
  const deptsByParent = departments.reduce((acc: any, dept: any) => {
    if (dept.parent_department_id) {
      if (!acc[dept.parent_department_id]) {
        acc[dept.parent_department_id] = [];
      }
      acc[dept.parent_department_id].push(dept);
    }
    return acc;
  }, {});

  // Группируем должности по отделам
  const positionsByDept = positions.reduce((acc: any, pos: any) => {
    if (!acc[pos.department_id]) {
      acc[pos.department_id] = [];
    }
    acc[pos.department_id].push(pos);
    return acc;
  }, {});

  // Группируем сотрудников по должности
  const employeesByPosition = employees.reduce((acc: any, emp: any) => {
    if (!acc[emp.position_id]) {
      acc[emp.position_id] = [];
    }
    acc[emp.position_id].push(emp);
    return acc;
  }, {});

  // Определяем количество проектов по отделам
  const projectsByDept = projects.reduce((acc: any, proj: any) => {
    if (!acc[proj.department_id]) {
      acc[proj.department_id] = [];
    }
    acc[proj.department_id].push(proj);
    return acc;
  }, {});

  // Вычисляем общее количество сотрудников в отделе и его подотделах
  const getTotalEmployees = (deptId: number) => {
    let total = 0;
    
    // Сотрудники в текущем отделе
    const deptPositions = positionsByDept[deptId] || [];
    deptPositions.forEach((pos: any) => {
      total += (employeesByPosition[pos.position_id] || []).length;
    });
    
    // Сотрудники в подотделах (рекурсивно)
    const childDepts = deptsByParent[deptId] || [];
    childDepts.forEach((childDept: any) => {
      total += getTotalEmployees(childDept.department_id);
    });
    
    return total;
  };

  // Рендерим отдел
  const renderDepartment = (dept: any, level = 0) => {
    const childDepts = deptsByParent[dept.department_id] || [];
    const deptPositions = positionsByDept[dept.department_id] || [];
    const projectsCount = (projectsByDept[dept.department_id] || []).length;
    const employeesCount = getTotalEmployees(dept.department_id);
    
    // Определение цвета фона в зависимости от уровня
    const bgColorClass = level <= 1 
      ? "rgb(171, 13, 13)" 
      : "rgb(220, 107, 107)";

    return (
      <div key={dept.department_id} className={`department-level-${level} mb-4`}>
        <div 
          className="org-node-header"
          style={{ backgroundColor: bgColorClass }}
        >
          {dept.name}
          <div className="position-counter-top">{projectsCount}</div>
          <div className="position-counter-bottom">{employeesCount}</div>
        </div>
        <div className="org-node-content">
          {deptPositions.length > 0 && (
            <div className="org-positions-list">
              {deptPositions.map((pos: any) => {
                const posEmployees = employeesByPosition[pos.position_id] || [];
                return (
                  <div key={pos.position_id} className="org-position">
                    <div className="org-position-header">
                      {pos.name}
                      <div className="position-counter-top">{posEmployees.length}</div>
                    </div>
                    {posEmployees.length > 0 && (
                      <div className="org-employees-list">
                        {posEmployees.map((emp: any) => (
                          <div key={emp.employee_id} className="org-employee">
                            {emp.full_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {childDepts.length > 0 && (
            <div className="mt-4">
              {childDepts.map((childDept: any) => renderDepartment(childDept, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (rootDepartments.length === 0) {
    return <div className="p-4 text-center text-gray-500">Структура организации не найдена</div>;
  }

  return (
    <div className="org-chart">
      <div className="tree-container">
        {rootDepartments.map((dept: any) => renderDepartment(dept))}
      </div>
    </div>
  );
};

export default OrganizationTree;