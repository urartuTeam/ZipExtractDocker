import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import UnifiedPositionCard from './UnifiedPositionCard';
import DisplaySettings from './DisplaySettings';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

// Типы данных для организационной структуры
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
}

type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null; // Добавляем поле manager_id для отслеживания подчиненности
}

// Тип для построения дерева отделов
type DepartmentNode = Department & {
  positions: Position[];
  children: DepartmentNode[];
  width: number; // ширина в процентах
  childCount: number; // общее количество дочерних элементов
}

// Тип для построения позиций с сотрудниками
type PositionWithEmployees = Position & {
  employees: Employee[];
}

// Специальный тип для представления отдела в иерархии должностей
type DepartmentAsPosition = {
  position_id: number; // Используем уникальный ID, например department_id * 1000
  name: string;
  isDepartment: true;
  department_id: number;
}

// Карточка отдела
const DepartmentCard = ({ department }: { department: DepartmentNode }) => {
  return (
    <div className="department-card" style={{ minWidth: '300px' }}>
      <div className="department-title">{department.name}</div>
    </div>
  );
};

// Карточка должности с сотрудниками
const PositionCard = ({ 
  position, 
  employees,
  onClick
}: { 
  position: Position, 
  employees: Employee[],
  onClick?: (positionId: number) => void
}) => {
  return (
    <div 
      className="position-employee-card"
      onClick={() => onClick && onClick(position.position_id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="position-title-small">{position.name}</div>
      <div className="position-divider-small"></div>
      {employees.length > 0 ? (
        // Если есть сотрудники, показываем их имена
        employees.map(employee => (
          <div key={employee.employee_id} className="position-name-small">
            {employee.full_name}
          </div>
        ))
      ) : (
        // Если нет сотрудников, показываем пустое место
        <div className="position-name-small empty">Вакантная должность</div>
      )}
    </div>
  );
};

// Компонент отдела с должностями и подотделами
const DepartmentWithChildren = ({ 
  department, 
  allPositions, 
  allEmployees, 
  level = 0 
}: { 
  department: DepartmentNode, 
  allPositions: Position[], 
  allEmployees: Employee[],
  level?: number
}) => {
  // Загружаем должности для этого отдела из API
  const { data: departmentPositionsResponse } = useQuery<{status: string, data: Position[]}>({
    queryKey: [`/api/departments/${department.department_id}/positions`]
  });
  
  // Получаем должности для этого отдела
  // Если API вернул результат, используем его
  // Иначе используем резервную логику на основе сотрудников и позиций из department.positions
  let departmentPositions: Position[] = [];
  
  if (departmentPositionsResponse?.data && departmentPositionsResponse.data.length > 0) {
    // Используем данные из API
    departmentPositions = departmentPositionsResponse.data;
  } else {
    // Резервная логика: используем позиции с сотрудниками в этом отделе
    // и позиции, которые уже были привязаны к этому отделу
    departmentPositions = allPositions.filter(pos => {
      // Проверяем, есть ли сотрудники с этой позицией в этом отделе
      const hasEmployeesInDepartment = allEmployees.some(
        emp => emp.position_id === pos.position_id && emp.department_id === department.department_id
      );
      
      // Также включаем позиции, которые уже были привязаны к этому отделу через API
      const isPositionInDepartment = department.positions.some(
        deptPos => deptPos.position_id === pos.position_id
      );
  
      return hasEmployeesInDepartment || isPositionInDepartment;
    });
    
    // Если у нас всё равно нет позиций, покажем все позиции в системе
    // (только для демонстрации, в реальном приложении так не делать)
    if (departmentPositions.length === 0 && level === 0) {
      departmentPositions = allPositions;
    }
  }

  // Получаем сотрудников для каждой должности
  const positionsWithEmployees = departmentPositions.map(position => {
    const positionEmployees = allEmployees.filter(
      emp => emp.position_id === position.position_id && emp.department_id === department.department_id
    );
    
    return {
      ...position,
      employees: positionEmployees
    };
  });

  // Вычисляем ширину для дочерних отделов
  const totalChildWidth = department.children.reduce((sum, child) => sum + child.width, 0);
  
  return (
    <div 
      className="department-node"
      style={{
        width: `${department.width}%`,
        minWidth: '300px',
        margin: '0 auto'
      }}
    >
      <DepartmentCard department={department} />
      
      {/* Должности в отделе */}
      <div className="position-employees-list">
        {positionsWithEmployees.map(position => (
          <PositionCard 
            key={position.position_id}
            position={position}
            employees={position.employees}
          />
        ))}
      </div>
      
      {/* Если есть дочерние отделы, рекурсивно отображаем их */}
      {department.children.length > 0 && (
        <div className="department-children">
          <div className="child-departments">
            {department.children.map(childDept => (
              <DepartmentWithChildren
                key={childDept.department_id}
                department={childDept}
                allPositions={allPositions}
                allEmployees={allEmployees}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Тип для построения иерархии позиций
type PositionHierarchyNode = {
  position: Position;
  employee: Employee | null;
  subordinates: PositionHierarchyNode[];
  childDepartments?: Department[]; // Дочерние отделы, связанные с этой должностью
};

// Убираем вспомогательный компонент, так как теперь он импортирован из отдельного файла

// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({ 
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  selectedPositionId,
  hierarchyInitialLevels = 3, // По умолчанию 3 уровня
  showThreeLevels = false, // Настройка для отображения 3-х уровней
  showVacancies = false // Настройка для отображения вакансий
}: { 
  nodes: PositionHierarchyNode[], 
  allPositions: Position[],
  allEmployees: Employee[],
  onPositionClick?: (positionId: number) => void,
  selectedPositionId?: number,
  hierarchyInitialLevels?: number,
  showThreeLevels?: boolean,
  showVacancies?: boolean
}) => {
  // Проверяем, есть ли хотя бы одна действительная должность
  // Фильтрация необходима, т.к. иногда могут приходить неверные данные
  const validNodes = nodes.filter(node => node && node.position);
  
  // Берем первую должность для основной ветви (если есть)
  const firstNode = validNodes.length > 0 ? validNodes[0] : null;
  
  // Остальные должности верхнего уровня
  const otherNodes = validNodes.length > 0 ? validNodes.slice(1) : [];
  
  // Определяем, является ли это первичным показом организационного дерева с самой вершины
  const isRootView = !selectedPositionId;
  
  return (
    <div className="tree-node">
      {firstNode && firstNode.position && (
        <div className="tree-branch">
          {/* Карточка первой должности верхнего уровня */}
          <div className="tree-node-container">
            <UnifiedPositionCard 
              node={firstNode} 
              onPositionClick={onPositionClick}
              isTopLevel={isRootView} // Верхний уровень, если это корневой вид
              showVacancies={showVacancies}
            />
          </div>
          
          {/* Подчиненные первой должности */}
          {firstNode.subordinates.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                {/* Горизонтальная линия */}
                <div className="tree-branch-line" style={{ 
                  width: `${Math.max(firstNode.subordinates.length * 240, 100)}px` 
                }}></div>
              </div>
              
              {/* Отображаем подчиненных */}
              {firstNode.subordinates.filter(sub => sub && sub.position).map((subNode: PositionHierarchyNode, index: number) => (
                <div key={`${subNode.position.position_id}-${index}`} className="subordinate-branch">
                  <UnifiedPositionCard 
                    node={subNode} 
                    onPositionClick={onPositionClick}
                    isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
                    showVacancies={showVacancies}
                  />
                  
                  {/* Рекурсивное отображение подчиненных подчиненного, если они есть И настройка позволяет (3 уровня) */}
                  {subNode.subordinates.length > 0 && showThreeLevels && (
                    <div className="subordinates-container">
                      <div className="tree-branch-connections">
                        <div className="tree-branch-line" style={{ 
                          width: `${Math.max(subNode.subordinates.length * 240, 100)}px` 
                        }}></div>
                      </div>
                      
                      {subNode.subordinates.filter(sub => sub && sub.position).map((grandChild: PositionHierarchyNode, grandIndex: number) => (
                        <div key={`${grandChild.position.position_id}-${grandIndex}`} className="subordinate-branch">
                          <UnifiedPositionCard 
                            node={grandChild} 
                            onPositionClick={onPositionClick}
                            isTopLevel={false} // Третий уровень не верхний
                            showVacancies={showVacancies}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Отображаем остальные должности верхнего уровня */}
      {otherNodes.map((node: PositionHierarchyNode, index: number) => (
        <div key={`${node.position.position_id}-${index}`} className="tree-branch" style={{ marginLeft: '30px' }}>
          <div className="tree-node-container">
            <UnifiedPositionCard 
              node={node} 
              onPositionClick={onPositionClick}
              isTopLevel={isRootView} // Верхний уровень, если это корневой вид
              showVacancies={showVacancies}
            />
          </div>
          
          {/* Подчиненные других должностей */}
          {node.subordinates.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                <div className="tree-branch-line" style={{ 
                  width: `${Math.max(node.subordinates.length * 240, 100)}px` 
                }}></div>
              </div>
              
              {node.subordinates.filter(sub => sub && sub.position).map((subNode: PositionHierarchyNode, subIndex: number) => (
                <div key={`${subNode.position.position_id}-${subIndex}`} className="subordinate-branch">
                  <UnifiedPositionCard 
                    node={subNode} 
                    onPositionClick={onPositionClick}
                    isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
                    showVacancies={showVacancies}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
};

const OrganizationTree: React.FC<OrganizationTreeProps> = ({ 
  initialPositionId, 
  onPositionClick,
  departmentsData,
  positionsData,
  employeesData
}) => {
  // Загрузка данных из API (если не переданы через пропсы)
  const { data: departmentsResponse } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
    enabled: !departmentsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const departments = departmentsData || departmentsResponse?.data || [];

  const { data: positionsResponse } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const positions = positionsData || positionsResponse?.data || [];

  const { data: employeesResponse } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
    enabled: !employeesData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const employees = employeesData || employeesResponse?.data || [];

  // Состояние для хранения построенного дерева
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
  
  // Состояние для хранения иерархии должностей
  const [positionHierarchy, setPositionHierarchy] = useState<PositionHierarchyNode[]>([]);
  
  // Состояние для хранения текущей выбранной должности
  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>(initialPositionId);
  
  // Состояние для хранения отфильтрованной иерархии должностей, когда выбрана конкретная должность
  const [filteredHierarchy, setFilteredHierarchy] = useState<PositionHierarchyNode[]>([]);
  
  // Состояние для хранения информации о должностях с отделами (если не переданы через пропсы)
  const { data: positionsWithDepartmentsResponse } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positions/with-departments'],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  
  // Используем данные о должностях с отделами из пропсов или из запроса
  const positionsWithDepartments = positionsData || positionsWithDepartmentsResponse?.data || [];
  
  // Состояние для хранения истории навигации по дереву
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  
  // Состояния для настроек отображения
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(false);
  
  // Запрос настроек для получения количества показываемых уровней иерархии
  const { data: settingsResponse, isError } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/settings'],
    retry: false // Не повторять запрос в случае ошибки
  });
  
  // Если есть ошибка с запросом настроек, просто логируем
  if (isError) {
    console.log('Ошибка получения настроек, используем значения по умолчанию');
  }
  
  // Получаем настройки из ответа или используем значение по умолчанию
  const defaultLevels = 2; // По умолчанию 2 уровня
  
  // Пытаемся получить настройку из ответа API
  const hierarchyInitialLevels = settingsResponse?.data
    ? settingsResponse.data.find((item: any) => item.data_key === 'hierarchy_initial_levels')?.data_value || defaultLevels
    : defaultLevels;
  
  console.log('Настройки уровней иерархии:', hierarchyInitialLevels);
  
  // Инициализируем состояние showThreeLevels на основе настроек
  useEffect(() => {
    const threeLevels = Number(hierarchyInitialLevels) === 3;
    setShowThreeLevels(threeLevels);
  }, [hierarchyInitialLevels]);
  
  // Обработчики для изменения настроек отображения
  const handleThreeLevelsChange = (value: boolean) => {
    setShowThreeLevels(value);
  };
  
  const handleShowVacanciesChange = (value: boolean) => {
    setShowVacancies(value);
  };
  
  // Рекурсивно ищем узел должности по ID
  const findPositionNodeById = (
    nodes: PositionHierarchyNode[], 
    positionId: number
  ): PositionHierarchyNode | null => {
    for (const node of nodes) {
      if (node.position.position_id === positionId) {
        return node;
      }
      
      if (node.subordinates.length > 0) {
        const found = findPositionNodeById(node.subordinates, positionId);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  };

  // Рекурсивно вычисляем количество всех дочерних элементов для отдела
  const calculateChildCount = (
    department: Department,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[]
  ): number => {
    // Находим непосредственных детей - отделы, которые привязаны к должностям в этом отделе
    const departmentPositions = allPositions.filter(pos => 
      // Позиции, которые связаны с сотрудниками в этом отделе
      allEmployees.some(emp => emp.position_id === pos.position_id && emp.department_id === department.department_id)
    );
    
    // Находим отделы, которые привязаны к этому отделу
    const children = allDepartments.filter(
      d => d.parent_department_id === department.department_id
    );
    
    // Считаем количество позиций в текущем отделе
    const departmentPositionCount = allPositions.filter(pos => {
      // Проверяем, есть ли сотрудники с этой позицией в этом отделе
      const hasEmployeesInDepartment = allEmployees.some(
        emp => emp.position_id === pos.position_id && emp.department_id === department.department_id
      );
      
      // Проверяем, имеет ли позиция прямую связь с отделом
      const isDirectlyLinkedToThisDepartment = pos.department_id === department.department_id;
      
      return hasEmployeesInDepartment || isDirectlyLinkedToThisDepartment;
    }).length;
    
    // Если нет позиций, считаем минимум 1
    const positionCount = Math.max(departmentPositionCount, 1);
    
    // Если нет детей, возвращаем только количество позиций
    if (children.length === 0) {
      return positionCount;
    }
    
    // Иначе суммируем количество позиций с количеством всех дочерних элементов
    return children.reduce(
      (sum, child) => sum + calculateChildCount(child, allDepartments, allPositions, allEmployees),
      positionCount
    );
  };

  // Рекурсивно строим дерево отделов
  const buildDepartmentTree = (
    parentId: number | null,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
    totalElements: number
  ): DepartmentNode[] => {
    // Находим отделы либо без родительской должности (корневые), либо с заданной родительской должностью
    const departmentsAtLevel = parentId === null 
      ? allDepartments.filter(d => d.parent_department_id === null)
      : allDepartments.filter(d => {
          // Находим все позиции в отделе с parentId
          const departmentPositions = allPositions.filter(pos => {
            // Позиция непосредственно привязана к отделу
            const isDirectlyLinkedToThisDepartment = pos.department_id === parentId;
            
            // Позиция связана с сотрудником в этом отделе
            const hasEmployeesInDepartment = allEmployees.some(
              emp => emp.position_id === pos.position_id && emp.department_id === parentId
            );
            
            return isDirectlyLinkedToThisDepartment || hasEmployeesInDepartment;
          });
          
          // Отдел привязан к родительскому отделу
          return d.parent_department_id === parentId;
        });
    
    // Вычисляем childCount для каждого отдела
    const departmentsWithCounts = departmentsAtLevel.map(dept => {
      const childCount = calculateChildCount(dept, allDepartments, allPositions, allEmployees);
      return { ...dept, childCount };
    });
    
    // Вычисляем общее количество дочерних элементов на этом уровне
    const totalChildCount = departmentsWithCounts.reduce(
      (sum, dept) => sum + dept.childCount, 
      0
    );
    
    return departmentsWithCounts.map(dept => {
      // Получаем позиции для этого отдела
      // Сначала проверяем, есть ли у нас API для получения позиций отдела
      // Если нет, используем логику определения по сотрудникам
      
      // Нужно получить все позиции, которые привязаны к этому отделу
      // даже если у них нет сотрудников
      const departmentPositions = allPositions.filter(pos => {
        // Проверяем прямую связь позиции с отделом
        const isPositionDirectlyLinked = pos.department_id === dept.department_id;
        
        // Проверяем, есть ли сотрудники с этой позицией в этом отделе
        const hasEmployeesInDepartment = allEmployees.some(
          emp => emp.position_id === pos.position_id && emp.department_id === dept.department_id
        );
        
        return isPositionDirectlyLinked || hasEmployeesInDepartment;
      });
      
      // Рекурсивно строим дочерние отделы
      const childDepartments = buildDepartmentTree(
        dept.department_id, 
        allDepartments, 
        allPositions, 
        allEmployees,
        totalElements
      );
      
      // Вычисляем ширину отдела в % на основе его childCount и общего количества дочерних элементов
      const width = totalChildCount > 0 
        ? (dept.childCount / totalChildCount) * 100 
        : (1 / departmentsAtLevel.length) * 100;
      
      return {
        ...dept,
        positions: departmentPositions,
        children: childDepartments,
        width
      };
    });
  };

  // Находим должности без родительских должностей (корневые должности)
  const findRootPositions = (
    allPositions: Position[],
    allEmployees: Employee[]
  ): Position[] => {
    return allPositions.filter(pos => 
      // Должность не имеет родительской должности
      pos.parent_position_id === null
    );
  };

  // Строим иерархию должностей с учетом сотрудников
  const buildPositionHierarchy = (
    rootPositions: Position[],
    allPositions: Position[],
    allEmployees: Employee[],
    allDepartments: Department[],
    positionsWithDepts: any[] // позиции с информацией о подчиненных отделах
  ): PositionHierarchyNode[] => {
    // Для каждой корневой должности строим ее иерархию
    return rootPositions.map(rootPos => {
      // Находим позицию с отделами из расширенного API, если есть
      const positionWithDepts = positionsWithDepts.find(pwd => pwd.position_id === rootPos.position_id);
      
      // Находим сотрудника, занимающего эту должность
      const employee = allEmployees.find(emp => emp.position_id === rootPos.position_id);
      
      // Находим дочерние отделы
      let childDepartments: Department[] = [];
      
      if (positionWithDepts && positionWithDepts.child_departments) {
        // Если в API есть информация о подчиненных отделах
        childDepartments = positionWithDepts.child_departments;
        
        // Добавляем отделы, которые привязаны к id позиции через parent_position_id
        const additionalDepartments = allDepartments.filter(dept => 
          dept.parent_position_id === rootPos.position_id
        );
        
        // Объединяем с уникальным добавлением
        additionalDepartments.forEach(addDept => {
          if (!childDepartments.some(cd => cd.department_id === addDept.department_id)) {
            childDepartments.push(addDept);
          }
        });
        
      } else {
        // Резервная логика - ищем по parent_position_id
        childDepartments = allDepartments.filter(dept => 
          dept.parent_position_id === rootPos.position_id
        );
        
        if (employee) {
          // Если есть сотрудник, также добавляем отделы, где он руководитель
          const employeeDepartments = allDepartments.filter(dept => {
            const deptManager = allEmployees.find(emp => 
              emp.department_id === dept.department_id && emp.manager_id === employee.employee_id
            );
            return deptManager !== undefined;
          });
          
          // Добавляем только уникальные отделы
          employeeDepartments.forEach(empDept => {
            if (!childDepartments.some(cd => cd.department_id === empDept.department_id)) {
              childDepartments.push(empDept);
            }
          });
        }
      }
      
      if (childDepartments.length > 0) {
        console.log(`Должность "${rootPos.name}" (ID: ${rootPos.position_id}) имеет дочерние отделы:`, 
          childDepartments.map(d => `${d.name} (ID: ${d.department_id})`));
      }
      
      // Находим подчиненные должности
      const subordinatePositions = allPositions.filter(pos => 
        pos.parent_position_id === rootPos.position_id
      );
      
      // Рекурсивно строим иерархию для подчиненных должностей
      const subordinateNodes = buildPositionHierarchy(
        subordinatePositions,
        allPositions,
        allEmployees,
        allDepartments,
        positionsWithDepts
      );
      
      // Возвращаем узел иерархии для этой должности
      return {
        position: rootPos,
        employee: employee || null,
        subordinates: subordinateNodes,
        childDepartments
      };
    });
  };

  // Эффект для построения дерева отделов при изменении данных
  useEffect(() => {
    if (departments.length > 0 && positions.length > 0 && employees.length > 0) {
      // Находим корневой отдел, скорее всего это администрация или головная компания
      const rootDepartment = departments.find(dept => 
        dept.parent_department_id === null && dept.parent_position_id === null
      );
      
      if (rootDepartment) {
        console.log('Найден корневой отдел:', rootDepartment);
        
        // Строим дерево начиная с корневого отдела
        const departmentTree = buildDepartmentTree(
          null, 
          departments, 
          positions, 
          employees,
          departments.length // Начальное количество отделов
        );
        
        setDepartmentTree(departmentTree);
      }
      
      // Находим корневые должности
      const rootPositions = findRootPositions(positions, employees);
      console.log('Должности корневого отдела:', rootPositions.map(pos => `${pos.name} (ID: ${pos.position_id})`));
      
      // Строим иерархию должностей
      const hierarchy = buildPositionHierarchy(
        rootPositions,
        positions,
        employees,
        departments,
        positionsWithDepartments // Позиции с информацией о подчиненных отделах
      );
      
      console.log('Построено', hierarchy.length, 'корневых узлов');
      setPositionHierarchy(hierarchy);
      
      // Если у нас уже есть selectedPositionId, отфильтруем иерархию для этой должности
      if (selectedPositionId) {
        // Ищем узел с выбранной должностью в иерархии
        for (const node of hierarchy) {
          const selectedNode = findPositionNodeById([node], selectedPositionId);
          if (selectedNode) {
            setFilteredHierarchy([selectedNode]);
            break;
          }
        }
      }
    }
  }, [departments, positions, employees, positionsWithDepartments, selectedPositionId, initialPositionId]);

  // Обработчик клика по должности для навигации по дереву
  const handlePositionClick = (positionId: number) => {
    // Сохраняем текущий positionId в историю навигации
    if (selectedPositionId) {
      setNavigationHistory(prev => [...prev, selectedPositionId]);
    }
    
    // Обновляем выбранную должность
    setSelectedPositionId(positionId);
    
    // Если передан внешний обработчик, используем его
    if (onPositionClick) {
      onPositionClick(positionId);
    }
    
    // Ищем узел с выбранной должностью в иерархии
    if (positionHierarchy.length > 0) {
      for (const node of positionHierarchy) {
        const selectedNode = findPositionNodeById([node], positionId);
        if (selectedNode) {
          setFilteredHierarchy([selectedNode]);
          break;
        }
      }
    }
  };

  // Обработчик возврата на предыдущий уровень
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      // Получаем последний элемент из истории
      const prevPositionId = navigationHistory[navigationHistory.length - 1];
      
      // Обновляем историю, удаляя последний элемент
      setNavigationHistory(prev => prev.slice(0, -1));
      
      // Устанавливаем предыдущую должность в качестве текущей
      setSelectedPositionId(prevPositionId);
      
      // Если передан внешний обработчик, используем его
      if (onPositionClick && prevPositionId) {
        onPositionClick(prevPositionId);
      }
      
      // Обновляем отфильтрованную иерархию
      if (positionHierarchy.length > 0 && prevPositionId) {
        for (const node of positionHierarchy) {
          const selectedNode = findPositionNodeById([node], prevPositionId);
          if (selectedNode) {
            setFilteredHierarchy([selectedNode]);
            break;
          }
        }
      }
    } else {
      // Если история пуста, возвращаемся к корневому уровню
      setSelectedPositionId(undefined);
      setFilteredHierarchy([]);
    }
  };

  // Обработчик возврата на корневой уровень
  const handleReset = () => {
    // Очищаем историю навигации
    setNavigationHistory([]);
    
    // Сбрасываем выбранную должность
    setSelectedPositionId(undefined);
    
    // Сбрасываем отфильтрованную иерархию
    setFilteredHierarchy([]);
  };
  
  return (
    <div className="organization-tree-container">
      <DisplaySettings 
        showThreeLevels={showThreeLevels}
        showVacancies={showVacancies}
        onShowThreeLevelsChange={handleThreeLevelsChange}
        onShowVacanciesChange={handleShowVacanciesChange}
      />
      
      {/* Дерево должностей */}
      <div className="hierarchy-tree">
        {/* Если выбрана конкретная должность, показываем отфильтрованную иерархию */}
        {selectedPositionId && filteredHierarchy.length > 0 ? (
          <PositionTree 
            nodes={filteredHierarchy} 
            allPositions={positions}
            allEmployees={employees}
            onPositionClick={handlePositionClick}
            selectedPositionId={selectedPositionId}
            showThreeLevels={showThreeLevels}
            showVacancies={showVacancies}
          />
        ) : (
          /* Иначе показываем полную иерархию */
          <PositionTree 
            nodes={positionHierarchy} 
            allPositions={positions}
            allEmployees={employees}
            onPositionClick={handlePositionClick}
            selectedPositionId={selectedPositionId}
            showThreeLevels={showThreeLevels}
            showVacancies={showVacancies}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationTree;