import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus, User } from 'lucide-react';

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

// Для отслеживания развернутых узлов
type ExpandedNodes = Record<number, boolean>;

// Карточка должности с сотрудниками
const PositionCard = ({ 
  position, 
  employees 
}: { 
  position: Position, 
  employees: Employee[] 
}) => {
  return (
    <div className="position-item">
      <div className="position-name">
        <span>{position.name}</span>
      </div>
      <div className="employee-list">
        {employees.length > 0 ? (
          employees.map(employee => (
            <div key={employee.employee_id} className="employee-item">
              <User className="employee-icon" size={14} />
              <span>{employee.full_name}</span>
            </div>
          ))
        ) : (
          <div className="employee-item vacant">
            <span>Вакантная должность</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент отдела
const DepartmentNode = ({ 
  department,
  positions,
  employees,
  departments,
  allPositions,
  allEmployees,
  positionDepartments,
  expandedNodes,
  setExpandedNodes,
  level = 0,
  maxInitialLevel = 3  // Максимальный уровень для начального отображения
}: { 
  department: Department,
  positions: Position[],
  employees: Employee[],
  departments: Department[],
  allPositions: Position[],
  allEmployees: Employee[],
  positionDepartments: { position_link_id: number, position_id: number, department_id: number }[],
  expandedNodes: ExpandedNodes,
  setExpandedNodes: React.Dispatch<React.SetStateAction<ExpandedNodes>>,
  level?: number,
  maxInitialLevel?: number
}) => {
  // По умолчанию разворачиваем только первые уровни
  const isInitiallyExpanded = level < maxInitialLevel;
  
  // Проверяем, развернут ли текущий узел
  const isExpanded = expandedNodes[department.department_id] !== undefined 
    ? expandedNodes[department.department_id] 
    : isInitiallyExpanded;

  // Фильтруем сотрудников текущего отдела
  const departmentEmployees = employees.filter(
    emp => emp.department_id === department.department_id
  );
  
  // Получаем дочерние отделы
  const childDepartments = departments.filter(
    dept => dept.parent_department_id === department.department_id
  );
  
  // Получаем позиции для текущего отдела
  const departmentPositionIds = positionDepartments
    .filter(link => link.department_id === department.department_id)
    .map(link => link.position_id);
  
  const departmentPositions = allPositions.filter(
    pos => departmentPositionIds.includes(pos.position_id)
  );
  
  // Группируем сотрудников по должностям
  const positionEmployees = new Map<number, Employee[]>();
  
  // Инициализируем Map пустыми массивами для всех позиций
  departmentPositions.forEach(pos => {
    positionEmployees.set(pos.position_id, []);
  });
  
  // Заполняем Map сотрудниками
  departmentEmployees.forEach(emp => {
    const empList = positionEmployees.get(emp.position_id) || [];
    empList.push(emp);
    positionEmployees.set(emp.position_id, empList);
  });
  
  // Функция для переключения состояния развернутости узла
  const toggleExpand = () => {
    setExpandedNodes(prev => ({
      ...prev,
      [department.department_id]: !isExpanded
    }));
  };
  
  return (
    <div className={`org-node level-${level}`}>
      <div 
        className={`org-node-header ${childDepartments.length > 0 ? 'has-children' : ''}`}
        onClick={toggleExpand}
      >
        {childDepartments.length > 0 ? (
          <span className="expand-icon">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className="expand-icon placeholder">
            <Plus size={16} className="invisible" />
          </span>
        )}
        <span className="department-name">{department.name}</span>
      </div>
      
      {/* Если узел развернут, показываем должности и дочерние отделы */}
      {isExpanded && (
        <div className="org-node-content">
          {/* Должности в отделе */}
          {departmentPositions.length > 0 && (
            <div className="org-positions-list">
              {departmentPositions.map(position => (
                <PositionCard 
                  key={position.position_id}
                  position={position}
                  employees={positionEmployees.get(position.position_id) || []}
                />
              ))}
            </div>
          )}
          
          {/* Дочерние отделы */}
          {childDepartments.length > 0 && (
            <div className="org-children-list">
              {childDepartments.map(childDept => (
                <DepartmentNode
                  key={childDept.department_id}
                  department={childDept}
                  positions={departmentPositions}
                  employees={departmentEmployees}
                  departments={departments}
                  allPositions={allPositions}
                  allEmployees={allEmployees}
                  positionDepartments={positionDepartments}
                  expandedNodes={expandedNodes}
                  setExpandedNodes={setExpandedNodes}
                  level={level + 1}
                  maxInitialLevel={maxInitialLevel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrganizationTree: React.FC = () => {
  // Состояние для отслеживания развернутых узлов
  const [expandedNodes, setExpandedNodes] = useState<ExpandedNodes>({});
  
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
  
  // Загрузка связей должность-отдел
  const { data: positionDepartmentsResponse, isLoading: isPositionDepartmentsLoading } = useQuery<{
    status: string, 
    data: { position_link_id: number, position_id: number, department_id: number }[]
  }>({
    queryKey: ['/api/positiondepartments'],
  });
  const positionDepartments = positionDepartmentsResponse?.data || [];

  // Если данные еще не загружены, показываем загрузку
  if (isDepartmentsLoading || isPositionsLoading || isEmployeesLoading || isPositionDepartmentsLoading) {
    return <div className="loading-message">Загрузка организационной структуры...</div>;
  }

  // Находим корневые отделы (без родителя)
  const rootDepartments = departments.filter(dept => dept.parent_department_id === null);

  return (
    <div className="org-tree-container">
      <div className="org-tree-wrapper">
        {rootDepartments.map(department => (
          <DepartmentNode
            key={department.department_id}
            department={department}
            positions={positions}
            employees={employees}
            departments={departments}
            allPositions={positions}
            allEmployees={employees}
            positionDepartments={positionDepartments}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
          />
        ))}
      </div>
    </div>
  );
};

export default OrganizationTree;