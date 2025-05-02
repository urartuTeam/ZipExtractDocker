import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User } from "lucide-react";

// Типы данных
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted?: boolean;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
  departments?: { department_id: number }[];
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
};

type PositionPosition = {
  position_position_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number;
  deleted: boolean;
};

// Тип для построения иерархии позиций
type PositionHierarchyNode = {
  position: Position;
  employee: Employee | null;
  subordinates: PositionHierarchyNode[];
  childDepartments?: Department[]; // Дочерние отделы, связанные с этой должностью
};

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: Position[];
  employeesData?: Employee[];
};

export default function OrganizationTree({
  departmentsData = [],
  positionsData = [],
  employeesData = [],
  onPositionClick,
  initialPositionId,
}: OrganizationTreeProps) {
  // Состояние для настроек отображения
  const [showThreeLevels, setShowThreeLevels] = useState(false);
  const [showVacancies, setShowVacancies] = useState(false);
  
  // Загружаем связи position_position
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: PositionPosition[];
  }>({
    queryKey: ["/api/positionpositions"],
  });
  
  // Получаем настройки
  const { data: settingsResponse, isError: isSettingsError } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/settings"],
  });
  
  useEffect(() => {
    if (isSettingsError) {
      console.log("Ошибка получения настроек, используем значения по умолчанию");
    }
  }, [isSettingsError]);
  
  // Получаем настройки отображения уровней иерархии
  const settingsData = settingsResponse?.data || [];
  const hierarchyLevelsSetting = settingsData.find(item => item.data_key === 'hierarchy_levels');
  const hierarchyLevels = hierarchyLevelsSetting ? Number(hierarchyLevelsSetting.data_value) : 2;
  
  useEffect(() => {
    setShowThreeLevels(hierarchyLevels > 2);
    console.log("Настройки уровней иерархии:", hierarchyLevels);
    console.log("Обновленная настройка showThreeLevels:", showThreeLevels);
  }, [hierarchyLevels]);
  
  // Данные из пропсов
  const departments = departmentsData || [];
  const positions = positionsData || [];
  const employees = employeesData || [];
  
  // Получаем связи position_position
  const positionPositions = positionPositionsResponse?.data || [];
  const activePositionPositions = positionPositions.filter(pp => !pp.deleted);
  
  console.log("Данные о связях position_position:", activePositionPositions.length === 0 
    ? "получено 0 связей" 
    : activePositionPositions);
  console.log("Активные связи position_position:", activePositionPositions);
  
  // Находим корневой отдел (тот, у которого нет родителя)
  const rootDepartment = departments.find(
    d => !d.deleted && d.parent_department_id === null && d.parent_position_id === null
  );
  
  if (rootDepartment) {
    console.log("Найден корневой отдел:", rootDepartment);
  }
  
  // Функция для получения подчиненных должностей
  const getSubordinatePositions = (parentPositionId: number, departmentId: number) => {
    // Ищем подчиненные должности через связи position_position
    return positions.filter(position => {
      return activePositionPositions.some(
        relation => 
          relation.position_id === position.position_id && 
          relation.parent_position_id === parentPositionId &&
          relation.department_id === departmentId
      );
    });
  };
  
  // Функция для получения сотрудника на должности
  const getEmployeeForPosition = (positionId: number, departmentId: number) => {
    const positionEmployees = employees.filter(
      employee => employee.position_id === positionId && employee.department_id === departmentId
    );
    return positionEmployees.length > 0 ? positionEmployees[0] : null;
  };
  
  // Функция для получения дочерних отделов должности
  const getChildDepartmentsForPosition = (positionId: number) => {
    return departments.filter(dept => 
      !dept.deleted && dept.parent_position_id === positionId
    );
  };
  
  // Построение иерархии должностей
  const buildPositionHierarchy = (positionId: number, departmentId: number, level = 0, maxLevel = 2) => {
    // Прекращаем рекурсию, если достигли максимального уровня
    if (level > maxLevel) return null;
    
    // Находим должность
    const position = positions.find(p => p.position_id === positionId);
    if (!position) return null;
    
    // Находим сотрудника на этой должности
    const employee = getEmployeeForPosition(positionId, departmentId);
    
    // Находим подчиненные должности
    const subordinatePositions = getSubordinatePositions(positionId, departmentId);
    
    // Находим дочерние отделы, связанные с этой должностью
    const childDepartments = getChildDepartmentsForPosition(positionId);
    
    // Строим иерархию подчиненных
    const subordinates = subordinatePositions.map(subPosition => {
      return buildPositionHierarchy(subPosition.position_id, departmentId, level + 1, maxLevel);
    }).filter(node => node !== null) as PositionHierarchyNode[];
    
    // Создаем узел иерархии
    return {
      position,
      employee,
      subordinates,
      childDepartments,
    };
  };
  
  // Находим все должности корневого отдела
  let adminPositions: Position[] = [];
  
  if (rootDepartment) {
    // Корневые должности - это должности, которые не имеют родителя в данном отделе согласно табилцы position_position
    // или имеют привязку к отделу через position_department или employees
    adminPositions = positions.filter(position => {
      // Проверяем, есть ли привязка к отделу через departments
      const hasDepartmentLink = position.departments?.some(
        dept => dept.department_id === rootDepartment.department_id
      );
      
      // Проверяем, есть ли привязка через сотрудников
      const hasEmployeeLink = employees.some(
        emp => emp.position_id === position.position_id && emp.department_id === rootDepartment.department_id
      );
      
      // Проверяем, является ли позиция дочерней в этом отделе
      const isChildInDept = activePositionPositions.some(
        rel => rel.position_id === position.position_id && rel.department_id === rootDepartment.department_id
      );
      
      // Возвращаем true, если должность привязана к отделу и не является дочерней
      return (hasDepartmentLink || hasEmployeeLink) && !isChildInDept;
    });
  }
  
  console.log(
    "Должности корневого отдела:",
    adminPositions.map((p) => `${p.name} (ID: ${p.position_id})`),
  );
  
  // Строим иерархию для каждой должности верхнего уровня
  const hierarchyNodes = adminPositions.map(position => {
    return buildPositionHierarchy(
      position.position_id, 
      rootDepartment?.department_id || 0,
      0,
      showThreeLevels ? 2 : 1
    );
  }).filter(node => node !== null) as PositionHierarchyNode[];
  
  console.log("Построено", hierarchyNodes.length, "корневых узлов");
  
  // Вспомогательный компонент для отображения карточки должности
  const PositionCard = ({ 
    position, 
    employee, 
    isTopLevel = false, 
    onClick 
  }: { 
    position: Position, 
    employee: Employee | null, 
    isTopLevel?: boolean,
    onClick?: () => void 
  }) => {
    return (
      <div 
        className={`position-card ${isTopLevel ? 'topTopPositionClass' : 'positionClass'}`}
        onClick={onClick}
      >
        <div className="position-title">{position.name}</div>
        <div className={`position-divider ${isTopLevel ? 'topTopPositionClass' : ''}`}></div>
        {employee ? (
          <div className="position-name">
            <span className="employee-name">{employee.full_name}</span>
          </div>
        ) : (
          <div className="position-name">
            <span className="position-vacant">Вакантная должность</span>
          </div>
        )}
      </div>
    );
  };
  
  // Функция для получения настроек отображения
  console.log("Настройки уровней иерархии:", `${hierarchyLevels}`);
  
  // Референс для горизонтального скролла
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Рендерим иерархию должностей в виде дерева
  const renderOrgChart = () => {
    // Проверяем, есть ли что отображать
    if (hierarchyNodes.length === 0) {
      return (
        <div className="text-center p-8">
          <div className="text-lg text-gray-500">Организационная структура не настроена</div>
        </div>
      );
    }
    
    // Берем первую должность для основной ветви
    const firstNode = hierarchyNodes[0];
    const otherNodes = hierarchyNodes.slice(1);
    
    return (
      <div className="org-chart overflow-auto" ref={scrollRef}>
        {/* Верхний блок с первой должностью (обычно руководитель) */}
        {firstNode && (
          <div className="org-tree-top">
            <div className="top-position">
              <div className="top-position-title">{firstNode.position.name}</div>
              <div className="position-divider"></div>
              {firstNode.employee ? (
                <div className="top-position-name">{firstNode.employee.full_name}</div>
              ) : (
                <div className="top-position-name position-vacant">Вакантная должность</div>
              )}
            </div>
            
            {/* Вертикальная линия */}
            <div className="org-vertical-line"></div>
          </div>
        )}
        
        {/* Второй уровень - прямые подчиненные руководителя */}
        {firstNode && firstNode.subordinates.length > 0 && (
          <div className="org-level-1">
            <div className="position-cards">
              {firstNode.subordinates.map((subNode, index) => (
                <div key={`sub-${subNode.position.position_id}`} className="org-branch">
                  <PositionCard 
                    position={subNode.position}
                    employee={subNode.employee}
                    onClick={() => onPositionClick && onPositionClick(subNode.position.position_id)}
                  />
                  
                  {/* Если есть подчиненные третьего уровня и включен показ третьего уровня */}
                  {showThreeLevels && subNode.subordinates.length > 0 && (
                    <div className="subordinates-container">
                      {subNode.subordinates.map((grandChild, grandIndex) => (
                        <div 
                          key={`grand-${grandChild.position.position_id}`} 
                          className="subordinate-branch"
                        >
                          <PositionCard 
                            position={grandChild.position}
                            employee={grandChild.employee}
                            onClick={() => onPositionClick && onPositionClick(grandChild.position.position_id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Третий уровень - остальные должности верхнего уровня */}
        {otherNodes.length > 0 && (
          <div className="org-level-2">
            <div className="branch-group">
              {otherNodes.map((node, index) => (
                <div key={`other-${node.position.position_id}`} className="branch">
                  <PositionCard 
                    position={node.position}
                    employee={node.employee}
                    onClick={() => onPositionClick && onPositionClick(node.position.position_id)}
                  />
                  
                  {/* Если есть подчиненные и включен показ дополнительных уровней */}
                  {showThreeLevels && node.subordinates.length > 0 && (
                    <div className="subordinates-container">
                      {node.subordinates.map((subNode, subIndex) => (
                        <div 
                          key={`other-sub-${subNode.position.position_id}`} 
                          className="subordinate-branch"
                        >
                          <PositionCard 
                            position={subNode.position}
                            employee={subNode.employee}
                            onClick={() => onPositionClick && onPositionClick(subNode.position.position_id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="org-tree-container">
      {renderOrgChart()}
    </div>
  );
}