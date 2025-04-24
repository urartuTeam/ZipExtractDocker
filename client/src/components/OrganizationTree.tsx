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

  // Группируем должности по отделам через сотрудников
  const positionsByDept = employees.reduce((acc: any, emp: any) => {
    const dept_id = emp.department_id;
    const position_id = emp.position_id;
    const position = positions.find(pos => pos.position_id === position_id);
    
    if (position && dept_id) {
      if (!acc[dept_id]) {
        acc[dept_id] = [];
      }
      
      // Проверяем, нет ли уже такой должности в массиве
      if (!acc[dept_id].some((pos: any) => pos.position_id === position_id)) {
        acc[dept_id].push(position);
      }
    }
    
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

  // Группируем сотрудников по отделам
  const employeesByDept = employees.reduce((acc: any, emp: any) => {
    if (!acc[emp.department_id]) {
      acc[emp.department_id] = [];
    }
    acc[emp.department_id].push(emp);
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
    const deptEmployees = employeesByDept[deptId] || [];
    total += deptEmployees.length;
    
    // Сотрудники в подотделах (рекурсивно)
    const childDepts = deptsByParent[deptId] || [];
    childDepts.forEach((childDept: any) => {
      total += getTotalEmployees(childDept.department_id);
    });
    
    return total;
  };

  // Создаем настоящее древовидное отображение всей организации
  const buildOrgTree = () => {
    // Отсортируем отделы для правильного отображения
    const sortedDepartments = [...rootDepartments].sort((a, b) => a.department_id - b.department_id);
    
    return (
      <div className="org-chart">
        <div className="tree-container">
          {/* Отображаем все корневые департаменты в первом уровне */}
          <div className="root-departments">
            {sortedDepartments.map(dept => (
              <div key={dept.department_id} className="root-department-item">
                {renderTopDepartment(dept)}
                {renderChildrenTree(dept)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Рендерим верхний (корневой) департамент
  const renderTopDepartment = (dept: any) => {
    const projectsCount = (projectsByDept[dept.department_id] || []).length;
    const employeesCount = getTotalEmployees(dept.department_id);
    const deptPositions = positionsByDept[dept.department_id] || [];
    
    return (
      <div className="top-department">
        {/* Блок департамента */}
        <div className="org-node-header" style={{ backgroundColor: "rgb(171, 13, 13)" }}>
          {dept.name}
          <div className="position-counter-top">{projectsCount}</div>
          <div className="position-counter-bottom">{employeesCount}</div>
        </div>
        
        {/* Должности и сотрудники департамента */}
        {deptPositions.length > 0 && (
          <div className="org-node-content">
            <div className="org-positions-list">
              {deptPositions.map((pos: any) => {
                const posEmployees = employeesByPosition[pos.position_id] || [];
                
                return (
                  <div key={pos.position_id} className="org-position">
                    <div className="org-position-header">
                      {pos.name}
                      <div className="position-counter-top">{posEmployees.length}</div>
                    </div>
                    
                    {/* Сотрудники на должности */}
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
          </div>
        )}
      </div>
    );
  };
  
  // Рендерим дочерние департаменты в виде дерева
  const renderChildrenTree = (dept: any) => {
    const childDepts = deptsByParent[dept.department_id] || [];
    
    if (childDepts.length === 0) return null;
    
    return (
      <div className="horizontal-tree">
        <div className="org-level">
          <div className="org-horizontal-branches">
            {childDepts.map((childDept: any) => renderHorizontalBranch(childDept, 1))}
          </div>
        </div>
      </div>
    );
  };
  
  // Рендер дочернего департамента как горизонтальной ветви (рекурсивно)
  const renderHorizontalBranch = (dept: any, level: number) => {
    const projectsCount = (projectsByDept[dept.department_id] || []).length;
    const employeesCount = getTotalEmployees(dept.department_id);
    const deptPositions = positionsByDept[dept.department_id] || [];
    const childDepts = deptsByParent[dept.department_id] || [];
    
    // Определение цвета фона в зависимости от уровня
    const bgColor = level <= 1 ? "rgb(171, 13, 13)" : "rgb(220, 107, 107)";
    
    return (
      <div key={dept.department_id} className="org-branch">
        <div className="branch-connector"></div>
        <div className="org-node-header" style={{ backgroundColor: bgColor }}>
          {dept.name}
          <div className="position-counter-top">{projectsCount}</div>
          <div className="position-counter-bottom">{employeesCount}</div>
        </div>
        
        {/* Должности департамента и их сотрудники */}
        {deptPositions.length > 0 && (
          <div className="org-node-content">
            <div className="org-positions-list">
              {deptPositions.map((pos: any) => {
                const posEmployees = employeesByPosition[pos.position_id] || [];
                
                return (
                  <div key={pos.position_id} className="org-position">
                    <div className="org-position-header">
                      {pos.name}
                      <div className="position-counter-top">{posEmployees.length}</div>
                    </div>
                    
                    {/* Сотрудники на должности */}
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
          </div>
        )}
        
        {/* Дочерние департаменты (если есть) - отображаем рекурсивно */}
        {childDepts.length > 0 && (
          <div className="children-container">
            <div className="children-branches">
              {childDepts.map((childDept: any) => renderHorizontalBranch(childDept, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (rootDepartments.length === 0) {
    return <div className="p-4 text-center text-gray-500">Структура организации не найдена</div>;
  }

  return (
    <div className="org-tree-container">
      {buildOrgTree()}
    </div>
  );
};

export default OrganizationTree;