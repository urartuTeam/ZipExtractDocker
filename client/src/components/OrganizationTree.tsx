import React, { useEffect, useState, useRef } from 'react';
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
      <div className="department-title">
        {department.name} <span className="department-label">Отдел</span>
      </div>
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
  
  // Загружаем связи должностей с отделами
  const { data: positionDepartmentsResponse } = useQuery<{status: string, data: any[]}>({
    queryKey: [`/api/positiondepartments`]
  });
  
  // Получаем должности для этого отдела
  // Если API вернул результат, используем его
  // Иначе используем резервную логику на основе сотрудников и позиций из department.positions
  let departmentPositions: Position[] = [];
  
  if (departmentPositionsResponse?.data && departmentPositionsResponse.data.length > 0) {
    // Используем данные из API
    departmentPositions = departmentPositionsResponse.data;
    console.log(`Получено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) из API`);
  } else {
    // Резервная логика с учетом position_department и сотрудников
    const positionDepartmentLinks = positionDepartmentsResponse?.data || [];
    
    // Множество для хранения ID найденных должностей
    const positionIds = new Set<number>();
    
    // 1. Добавляем ID из связей позиция-отдел
    positionDepartmentLinks
      .filter(link => link.department_id === department.department_id)
      .forEach(link => positionIds.add(link.position_id));
    
    // 2. Добавляем ID должностей сотрудников, которые работают в этом отделе
    allEmployees
      .filter(emp => emp.department_id === department.department_id && emp.position_id !== null)
      .forEach(emp => {
        if (emp.position_id) positionIds.add(emp.position_id);
      });
    
    // 3. Также включаем позиции, которые уже были привязаны к этому отделу через API
    department.positions.forEach(pos => positionIds.add(pos.position_id));
    
    // Фильтруем позиции по найденным ID
    departmentPositions = allPositions.filter(
      position => positionIds.has(position.position_id)
    );
    
    console.log(`Найдено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) через резервную логику`);
    
    // Если у нас всё равно нет позиций и это уровень 0, покажем все позиции системы
    // (только для демонстрации, в реальном приложении так не делать)
    if (departmentPositions.length === 0 && level === 0) {
      departmentPositions = allPositions;
      console.log(`Используем все ${departmentPositions.length} должностей для отдела ${department.name} (уровень 0)`);
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
  childDepartments: Department[]; // Дочерние отделы, связанные с этой должностью
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
  showThreeLevels = false, // Показывать третий уровень
  showVacancies = false // Показывать индикаторы вакансий
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
                  width: `${Math.max(firstNode.subordinates.length * 120, 100)}px`
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
                          width: `${Math.max(subNode.subordinates.length * 120, 100)}px`
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
                  width: `${Math.max(node.subordinates.length * 120, 100)}px`
                }}></div>
              </div>
              
              {node.subordinates.filter(sub => sub && sub.position).map((subNode: PositionHierarchyNode, subIndex: number) => (
                <div key={`${subNode.position.position_id}-${subIndex}`} className="subordinate-branch">
                  <UnifiedPositionCard 
                    node={subNode} 
                    onPositionClick={onPositionClick}
                    showVacancies={showVacancies}
                    isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
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
  
  // Эффект для обновления UI при изменении настройки showThreeLevels
  useEffect(() => {
    // Реагируем на изменение настройки отображения уровней
    console.log("Обновленная настройка showThreeLevels:", showThreeLevels);
  }, [showThreeLevels]);
  
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
      // Поэтому нам нужно запросить связь position-department из API
      
      // Пока используем следующую логику:
      // Все позиции, где есть сотрудники в этом отделе
      const positionsWithEmployees = allPositions.filter(pos => {
        return allEmployees.some(
          emp => emp.position_id === pos.position_id && emp.department_id === dept.department_id
        );
      });
      
      // Предполагаем также, что все позиции могут быть привязаны к отделу
      // Поскольку у нас нет API для получения связей department-position,
      // покажем все позиции для демонстрации
      const allDepartmentPositions = [...positionsWithEmployees];
      
      // В реальном приложении здесь будет вызов API для получения
      // всех позиций, привязанных к отделу
      const departmentPositions = allPositions;
      
      // Вычисляем ширину как пропорцию от общего количества
      // Если totalChildCount = 0, устанавливаем ширину 100%
      let width = totalChildCount === 0 
        ? 100 
        : (dept.childCount / totalChildCount) * 100;
      
      // Если элементов слишком много, ограничиваем минимальную ширину
      if (width < 5) width = 5;
      
      // Рекурсивно строим дочерние элементы
      const children = buildDepartmentTree(
        dept.department_id,
        allDepartments,
        allPositions,
        allEmployees,
        dept.childCount
      );
      
      return {
        ...dept,
        positions: departmentPositions,
        children,
        width,
        childCount: dept.childCount
      };
    });
  };

  // Функция для построения иерархии должностей на основе parent_position_id
  const buildPositionHierarchy = () => {
    if (positions.length === 0) {
      return [];
    }
    
    // Получаем данные о связях position_department
    const { data: positionDepartmentsResponse } = useQuery<{status: string, data: any[]}>({
      queryKey: [`/api/positiondepartments`],
      staleTime: 60000 // Используем кэш в течение минуты
    });
    const positionDepartments = positionDepartmentsResponse?.data || [];
    
    // Сначала создаем узлы для всех должностей
    const positionNodes: Record<number, PositionHierarchyNode> = {};
    
    // Создаем узлы для всех должностей
    positions.forEach(position => {
      // Находим сотрудника на этой должности, если есть
      const positionEmployee = employees.find(emp => emp.position_id === position.position_id) || null;
      
      positionNodes[position.position_id] = {
        position,
        employee: positionEmployee,
        subordinates: [],
        childDepartments: []
      };
    });
    
    // Строим иерархию на основе parent_position_id
    positions.forEach(position => {
      if (position.parent_position_id !== null && position.parent_position_id !== undefined) {
        // Находим родительскую должность
        const parentNode = positionNodes[position.parent_position_id];
        // Находим узел текущей должности
        const currentNode = positionNodes[position.position_id];
        
        if (parentNode && currentNode) {
          // Добавляем текущую должность как подчиненную к родительской
          parentNode.subordinates.push(currentNode);
        }
      }
    });
    
    // Добавляем связь отделов и должностей
    departments.forEach(department => {
      if (department.parent_position_id) {
        const parentNode = positionNodes[department.parent_position_id];
        if (parentNode) {
          // Добавляем отдел как дочерний для должности
          if (!parentNode.childDepartments) {
            parentNode.childDepartments = [];
          }
          parentNode.childDepartments.push(department);
        }
      }
    });
    
    // Добавляем должности, связанные с отделами через position_department
    // Перебираем все связи position_department
    positionDepartments.forEach(link => {
      if (link.deleted) return; // Пропускаем удаленные связи
      
      const positionId = link.position_id;
      const departmentId = link.department_id;
      const positionNode = positionNodes[positionId];
      
      if (!positionNode) return; // Если должность не найдена
      
      // Находим отдел
      const department = departments.find(d => d.department_id === departmentId);
      if (!department) return; // Если отдел не найден
      
      // Если у отдела есть parent_position_id, то это означает, что им управляет должность
      if (department.parent_position_id) {
        const managerNode = positionNodes[department.parent_position_id];
        
        // Если нашли управляющую должность и эта должность еще не в подчинении
        if (managerNode && 
            !managerNode.subordinates.some(sub => sub.position.position_id === positionId)) {
          console.log(`Добавляем должность ${positionNode.position.name} (ID: ${positionId}) как подчиненную к ${managerNode.position.name} (ID: ${department.parent_position_id}) через отдел ${department.name} (ID: ${departmentId})`);
          managerNode.subordinates.push(positionNode);
        }
      }
    });
    
    // Дополнительно учитываем manager_id для сотрудников без parent_position_id
    // Это резервная логика, если parent_position_id не указан
    employees.forEach(employee => {
      // Проверяем, что у сотрудника есть позиция и менеджер
      if (employee.manager_id !== null && employee.position_id !== null) {
        // Находим менеджера
        const manager = employees.find(emp => emp.employee_id === employee.manager_id);
        if (manager && manager.position_id !== null) {
          // Находим узел должности сотрудника
          const employeeNode = positionNodes[employee.position_id];
          // Находим узел должности менеджера
          const managerNode = positionNodes[manager.position_id];
          
          // Проверяем, что должность сотрудника еще не является подчиненной какой-либо должности
          // через parent_position_id
          const isAlreadySubordinate = positions.some(p => 
            p.position_id === employee.position_id && p.parent_position_id !== null
          );
          
          if (employeeNode && managerNode && !isAlreadySubordinate) {
            // Добавляем должность сотрудника как подчиненную к должности менеджера
            // только если еще не была добавлена через parent_position_id
            if (!managerNode.subordinates.some((sub: PositionHierarchyNode) => 
                sub.position.position_id === employeeNode.position.position_id)) {
              managerNode.subordinates.push(employeeNode);
            }
          }
        }
      }
    });
    
    // Находим корневые узлы (те, которые не являются подчиненными)
    const rootNodes: PositionHierarchyNode[] = [];
    
    // Проходим по всем узлам
    Object.values(positionNodes).forEach(node => {
      // Если узел не встречается как подчиненный ни в одном другом узле, то это корневой узел
      const isSubordinate = Object.values(positionNodes).some(
        potentialParent => potentialParent.subordinates.includes(node)
      );
      
      if (!isSubordinate) {
        rootNodes.push(node);
      }
    });
    
    return rootNodes;
  };
  
  // Функция для построения структуры на основе данных о должностях
  const buildRootDepartmentHierarchy = () => {
    // Проверяем, есть ли данные о должностях и отделах
    if (positions.length === 0 || departments.length === 0) {
      console.error('Нет данных о должностях или отделах');
      return [];
    }
    
    // Находим корневой отдел (без родительских отделов и позиций)
    const rootDepartment = departments.find(dept => dept.parent_department_id === null && dept.parent_position_id === null);
    if (!rootDepartment) {
      console.error('Корневой отдел не найден');
      return [];
    }
    
    console.log('Найден корневой отдел:', rootDepartment);
    
    // Шаг 1: Находим все должности корневого отдела
    let adminPositions = [];
    
    // Сначала проверим positions с отделами (из /api/positions/with-departments)
    if (positionsWithDepartments && positionsWithDepartments.length > 0) {
      adminPositions = positionsWithDepartments.filter(pos => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        return pos.departments && Array.isArray(pos.departments) && 
          pos.departments.some((d: any) => d.department_id === rootDepartment.department_id);
      });
    }
    
    // Если мы не нашли должности через positionsWithDepartments, используем резервную логику
    if (adminPositions.length === 0) {
      adminPositions = positions.filter(pos => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        // через сотрудников, назначенных на эту должность в этом отделе
        return employees.some(emp => 
          emp.position_id === pos.position_id && 
          emp.department_id === rootDepartment.department_id
        );
      });
    }
    
    console.log('Должности корневого отдела:', 
      adminPositions.map(p => `${p.name} (ID: ${p.position_id})`));
    
    // Создаем мапу с должностями по ID для быстрого доступа
    const positionMap: Record<number, PositionHierarchyNode> = {};
    
    // Инициализация узлов для всех должностей корневого отдела
    adminPositions.forEach(position => {
      const employee = employees.find(emp => 
        emp.position_id === position.position_id && 
        emp.department_id === rootDepartment.department_id
      ) || null;
      
      // Создаем новый узел-должность
      positionMap[position.position_id] = {
        position,
        employee,
        subordinates: [],
        childDepartments: []
      };
      
      // Находим дочерние отделы, связанные с этой должностью
      const childDepartments = departments.filter(dept => 
        dept.parent_position_id === position.position_id
      );
      
      // Выводим для отладки информацию о дочерних отделах
      if (childDepartments.length > 0) {
        console.log(`Должность "${position.name}" (ID: ${position.position_id}) имеет дочерние отделы:`, 
          childDepartments.map(dept => `${dept.name} (ID: ${dept.department_id})`));
          
        // Для каждого дочернего отдела создаем узел-отдел
        childDepartments.forEach(department => {
          // Находим должности этого отдела
          const deptPositions = positions.filter(pos => {
            return employees.some(emp => 
              emp.position_id === pos.position_id && 
              emp.department_id === department.department_id
            );
          });
          
          // Создаем псевдо-должность для отдела
          const deptAsPosition: Position = {
            position_id: department.department_id * 1000, // Уникальный ID
            name: department.name + " (отдел)",
            parent_position_id: position.position_id,
            department_id: department.department_id
          };
          
          // Создаем узел для отдела в виде должности
          const departmentNode: PositionHierarchyNode = {
            position: deptAsPosition,
            employee: null, // У отдела нет сотрудника
            subordinates: [],
            childDepartments: [] // Нет дочерних отделов у этого узла
          };
          
          // Находим дочерние отделы для текущего отдела (рекурсивно)
          const childDeptDepartments = departments.filter(d => 
            d.parent_department_id === department.department_id
          );
          
          if (childDeptDepartments.length > 0) {
            console.log(`Отдел "${department.name}" (ID: ${department.department_id}) имеет дочерние отделы:`, 
              childDeptDepartments.map(d => `${d.name} (ID: ${d.department_id})`));
              
            // Для каждого дочернего отдела создаем узел-отдел
            childDeptDepartments.forEach(childDept => {
              // Создаем псевдо-должность для дочернего отдела
              const childDeptAsPosition: Position = {
                position_id: childDept.department_id * 1000, // Уникальный ID
                name: childDept.name + " (отдел)",
                parent_position_id: deptAsPosition.position_id, // Связываем с родительским отделом
                department_id: childDept.department_id
              };
              
              // Создаем узел для дочернего отдела
              const childDeptNode: PositionHierarchyNode = {
                position: childDeptAsPosition,
                employee: null, // У отдела нет сотрудника
                subordinates: [],
                childDepartments: [] // У дочернего отдела пока нет отделов
              };
              
              // Добавляем дочерний отдел как подчиненный к текущему отделу
              departmentNode.subordinates.push(childDeptNode);
            });
          }
          
          // Добавляем отдел как подчиненный элемент к должности-родителю
          positionMap[position.position_id].subordinates.push(departmentNode);
        });
      }
    });
    
    // Список корневых должностей (пока пустой)
    const rootNodes: PositionHierarchyNode[] = [];
    
    // Распределяем должности в иерархии на основе parent_position_id
    adminPositions.forEach(position => {
      const currentNode = positionMap[position.position_id];
      
      if (position.parent_position_id === null || position.parent_position_id === undefined) {
        // Это корневая должность
        rootNodes.push(currentNode);
      } else if (positionMap[position.parent_position_id]) {
        // Это подчиненная должность, у которой родительская должность находится в этом отделе
        positionMap[position.parent_position_id].subordinates.push(currentNode);
      } else {
        // Родитель не найден в этом отделе, считаем должность корневой
        rootNodes.push(currentNode);
      }
    });
    
    // В этом месте находилась жестко закодированная корректировка иерархии для Генерального директора
    // Убираем жесткие привязки к конкретным ID должностей в пользу структуры из базы данных
    // Вместо этого все связи должны следовать из данных, получаемых из parent_position_id
    
    // Проходим по всем позициям и собираем корректную иерархию на основе parent_position_id
    // В этой версии мы устраняем жестко закодированную привязку к ID директоров и заместителей
    // Все позиции изначально помещаются в корень, а затем перемещаются в подчиненные,
    // если есть соответствующее значение parent_position_id
    
    // Повторно обрабатываем, чтобы исправить случаи, когда дочерние ноды могут быть созданы
    // раньше родительских (в зависимости от порядка данных)
    adminPositions.forEach(position => {
      if (position.parent_position_id && positionMap[position.parent_position_id]) {
        // Если у позиции есть родитель, и этот родитель в нашем списке позиций
        const childIndex = rootNodes.findIndex(node => node.position.position_id === position.position_id);
        if (childIndex !== -1) {
          // Если эта позиция уже в корне, убираем её оттуда
          const childNode = rootNodes.splice(childIndex, 1)[0];
          // И добавляем в подчиненные к родителю
          positionMap[position.parent_position_id].subordinates.push(childNode);
        }
      }
    });
    
    console.log('Построено', rootNodes.length, 'корневых узлов');
    
    return rootNodes;
  };

  // Обработчик клика по должности
  const handlePositionClick = (positionId: number) => {
    console.log(`Клик по должности с ID: ${positionId}`);
    
    // Если текущая позиция выбрана, добавляем её в историю перед переходом на новую
    if (selectedPositionId) {
      console.log(`Сохраняем в историю позицию: ${selectedPositionId}`);
      setNavigationHistory(prev => [...prev, selectedPositionId]);
    }
    
    // Обновляем ID выбранной должности
    setSelectedPositionId(positionId);
    
    // Если передан внешний обработчик, вызываем его
    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };
  
  // Функция для возврата на предыдущий уровень
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      // Получаем последнюю позицию из истории
      const prevPosition = navigationHistory[navigationHistory.length - 1];
      console.log(`Возвращаемся к позиции: ${prevPosition}`);
      
      // Убираем её из истории
      setNavigationHistory(prev => prev.slice(0, -1));
      
      // Устанавливаем как текущую позицию
      setSelectedPositionId(prevPosition);
    } else {
      // Если история пуста, возвращаемся к корню
      console.log("История пуста, возвращаемся к корню");
      setSelectedPositionId(undefined);
    }
  };

  // Строим дерево, когда данные загружены
  useEffect(() => {
    if (departments.length > 0 && (positions.length > 0 || positionsWithDepartments.length > 0)) {
      // Находим корневые отделы (без родительской должности)
      const rootDepartments = departments.filter(d => d.parent_department_id === null);
      
      // Вычисляем общее количество элементов для масштабирования
      const totalElements = rootDepartments.reduce(
        (sum, dept) => sum + calculateChildCount(dept, departments, positions, employees),
        0
      );
      
      // Строим дерево отделов
      const tree = buildDepartmentTree(null, departments, positions, employees, totalElements);
      setDepartmentTree(tree);
      
      // Строим иерархию должностей для корневого отдела
      const rootDepartmentHierarchy = buildRootDepartmentHierarchy();
      if (rootDepartmentHierarchy) {
        setPositionHierarchy(rootDepartmentHierarchy);
      } else {
        // Резервный вариант - строим на основе manager_id
        const hierarchy = buildPositionHierarchy();
        setPositionHierarchy(hierarchy);
      }
    }
  }, [departments, positions, employees, positionsWithDepartments]);
  
  // Фильтруем иерархию при изменении выбранной должности
  useEffect(() => {
    if (!selectedPositionId || positionHierarchy.length === 0) {
      // Если нет выбранной должности, показываем все должности корневого отдела
      // Это будут корневые узлы, полученные из функции buildRootDepartmentHierarchy
      setFilteredHierarchy(positionHierarchy);
      return;
    }

    // Находим выбранную должность в иерархии
    let selectedNode: PositionHierarchyNode | null = null;
    for (const node of positionHierarchy) {
      const found = findPositionNodeById([node], selectedPositionId);
      if (found) {
        selectedNode = found;
        break;
      }
    }

    // Если должность найдена, показываем только её непосредственных подчиненных 1-го уровня
    if (selectedNode) {
      // Показываем только выбранную должность и её непосредственных подчиненных
      const filteredNode = {
        ...selectedNode,
        subordinates: [...selectedNode.subordinates], // Получаем всех непосредственных подчиненных
      };
      
      // Показываем только выбранный узел - его подчиненные видны внутри него
      setFilteredHierarchy([filteredNode]);
    } else {
      // Если должность не найдена, показываем только второй уровень иерархии
      if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
        setFilteredHierarchy(positionHierarchy[0].subordinates);
      } else {
        setFilteredHierarchy([]);
      }
    }
  }, [selectedPositionId, positionHierarchy]);

  // Если данные еще не загружены, показываем загрузку
  if (departments.length === 0 || (positions.length === 0 && positionsWithDepartments.length === 0)) {
    return <div className="loading-message">Загрузка организационной структуры...</div>;
  }

  // Находим корневой отдел (без родительских отделов и позиций)
  const rootDept = departments.find(d => d.parent_department_id === null && d.parent_position_id === null);
  
  return (
    <div className="org-tree-container">
      {/* Убрали отображение отдела Администрация */}
      
      {/* Отображаем иерархию должностей как горизонтальное дерево */}
      <div className="position-hierarchy">
        <div className="organization-controls">
          {selectedPositionId && (
            <div className="position-navigation">
              <button 
                className="back-to-main-hierarchy" 
                onClick={handleGoBack}
              >
                ← Вернуться к предыдущей структуре
              </button>
            </div>
          )}
          
          <div className="display-settings-wrapper">
            <DisplaySettings
              showThreeLevels={showThreeLevels}
              showVacancies={showVacancies}
              onShowThreeLevelsChange={handleThreeLevelsChange}
              onShowVacanciesChange={handleShowVacanciesChange}
            />
          </div>
        </div>
        
        <PositionTree
          nodes={filteredHierarchy}
          allPositions={positions}
          allEmployees={employees}
          onPositionClick={handlePositionClick}
          selectedPositionId={selectedPositionId}
          hierarchyInitialLevels={Number(hierarchyInitialLevels)}
          showThreeLevels={showThreeLevels}
          showVacancies={showVacancies}
        />
      </div>
    </div>
  );
};

export default OrganizationTree;