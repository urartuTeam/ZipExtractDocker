import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";

// Типы данных для организационной структуры
type Department = {
  department_id: number;
  name: string;
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
}

// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({ 
  nodes,
  allPositions,
  allEmployees,
  onPositionClick
}: { 
  nodes: PositionHierarchyNode[], 
  allPositions: Position[],
  allEmployees: Employee[],
  onPositionClick?: (positionId: number) => void
}) => {
  // Берем первую должность для основной ветви (если есть),
  // а остальные должности для дополнительных ветвей
  const firstNode = nodes.length > 0 ? nodes[0] : null;
  
  // Остальные должности верхнего уровня
  const otherNodes = nodes.length > 0 ? nodes.slice(1) : [];
  
  return (
    <div className="tree-node">
      {firstNode && (
        <div className="tree-branch">
          {/* Карточка первой должности верхнего уровня */}
          <div className="tree-node-container">
            <div 
              className="position-card"
              onClick={() => onPositionClick && onPositionClick(firstNode.position.position_id)}
              style={{ cursor: onPositionClick ? 'pointer' : 'default' }}
            >
              <div className="position-title">{firstNode.position.name}</div>
              {firstNode.employee ? (
                <div className="employee-name">{firstNode.employee.full_name}</div>
              ) : (
                <div className="position-vacant">Вакантная должность</div>
              )}
            </div>
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
              {firstNode.subordinates.map((subNode: PositionHierarchyNode, index: number) => (
                <div key={`${subNode.position.position_id}-${index}`} className="subordinate-branch">
                  <div 
                    className="position-card"
                    onClick={() => onPositionClick && onPositionClick(subNode.position.position_id)}
                    style={{ cursor: onPositionClick ? 'pointer' : 'default' }}
                  >
                    <div className="position-title">{subNode.position.name}</div>
                    {subNode.employee ? (
                      <div className="employee-name">{subNode.employee.full_name}</div>
                    ) : (
                      <div className="position-vacant">Вакантная должность</div>
                    )}
                  </div>
                  
                  {/* Рекурсивное отображение подчиненных подчиненного, если они есть */}
                  {subNode.subordinates.length > 0 && (
                    <div className="subordinates-container">
                      <div className="tree-branch-connections">
                        <div className="tree-branch-line" style={{ 
                          width: `${Math.max(subNode.subordinates.length * 240, 100)}px` 
                        }}></div>
                      </div>
                      
                      {subNode.subordinates.map((grandChild: PositionHierarchyNode, grandIndex: number) => (
                        <div key={`${grandChild.position.position_id}-${grandIndex}`} className="subordinate-branch">
                          <div 
                            className="position-card"
                            onClick={() => onPositionClick && onPositionClick(grandChild.position.position_id)}
                            style={{ cursor: onPositionClick ? 'pointer' : 'default' }}
                          >
                            <div className="position-title">{grandChild.position.name}</div>
                            {grandChild.employee ? (
                              <div className="employee-name">{grandChild.employee.full_name}</div>
                            ) : (
                              <div className="position-vacant">Вакантная должность</div>
                            )}
                          </div>
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
            <div 
              className="position-card"
              onClick={() => onPositionClick && onPositionClick(node.position.position_id)}
              style={{ cursor: onPositionClick ? 'pointer' : 'default' }}
            >
              <div className="position-title">{node.position.name}</div>
              {node.employee ? (
                <div className="employee-name">{node.employee.full_name}</div>
              ) : (
                <div className="position-vacant">Вакантная должность</div>
              )}
            </div>
          </div>
          
          {/* Подчиненные других должностей */}
          {node.subordinates.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                <div className="tree-branch-line" style={{ 
                  width: `${Math.max(node.subordinates.length * 240, 100)}px` 
                }}></div>
              </div>
              
              {node.subordinates.map((subNode: PositionHierarchyNode, subIndex: number) => (
                <div key={`${subNode.position.position_id}-${subIndex}`} className="subordinate-branch">
                  <div 
                    className="position-card"
                    onClick={() => onPositionClick && onPositionClick(subNode.position.position_id)}
                    style={{ cursor: onPositionClick ? 'pointer' : 'default' }}
                  >
                    <div className="position-title">{subNode.position.name}</div>
                    {subNode.employee ? (
                      <div className="employee-name">{subNode.employee.full_name}</div>
                    ) : (
                      <div className="position-vacant">Вакантная должность</div>
                    )}
                  </div>
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
};

const OrganizationTree: React.FC<OrganizationTreeProps> = ({ 
  initialPositionId, 
  onPositionClick 
}) => {
  // Загрузка данных из API
  const { data: departmentsResponse } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  const departments = departmentsResponse?.data || [];

  const { data: positionsResponse } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  const positions = positionsResponse?.data || [];

  const { data: employeesResponse } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  const employees = employeesResponse?.data || [];

  // Состояние для хранения построенного дерева
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
  
  // Состояние для хранения иерархии должностей
  const [positionHierarchy, setPositionHierarchy] = useState<PositionHierarchyNode[]>([]);
  
  // Состояние для хранения текущей выбранной должности
  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>(initialPositionId);
  
  // Состояние для хранения отфильтрованной иерархии должностей, когда выбрана конкретная должность
  const [filteredHierarchy, setFilteredHierarchy] = useState<PositionHierarchyNode[]>([]);
  
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
    
    // Находим отделы, которые привязаны к должностям в этом отделе
    const children = allDepartments.filter(
      d => departmentPositions.some(pos => d.parent_position_id === pos.position_id)
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
      ? allDepartments.filter(d => d.parent_position_id === null)
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
          
          // Отдел привязан к одной из должностей в родительском отделе
          return departmentPositions.some(pos => d.parent_position_id === pos.position_id);
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
    
    // Сначала создаем узлы для всех должностей
    const positionNodes: Record<number, PositionHierarchyNode> = {};
    
    // Создаем узлы для всех должностей
    positions.forEach(position => {
      // Находим сотрудника на этой должности, если есть
      const positionEmployee = employees.find(emp => emp.position_id === position.position_id) || null;
      
      positionNodes[position.position_id] = {
        position,
        employee: positionEmployee,
        subordinates: []
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
  const buildAdministrationHierarchy = () => {
    // Проверяем, есть ли данные о должностях
    if (positions.length === 0) {
      return null;
    }
    
    // Используем стандартную функцию для построения иерархии должностей
    // на основе parent_position_id
    return buildPositionHierarchy();
  };

  // Обработчик клика по должности
  const handlePositionClick = (positionId: number) => {
    // Обновляем ID выбранной должности
    setSelectedPositionId(positionId);
    
    // Если передан внешний обработчик, вызываем его
    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };

  // Строим дерево, когда данные загружены
  useEffect(() => {
    if (departments.length > 0 && positions.length > 0) {
      // Находим корневые отделы (без родительской должности)
      const rootDepartments = departments.filter(d => d.parent_position_id === null);
      
      // Вычисляем общее количество элементов для масштабирования
      const totalElements = rootDepartments.reduce(
        (sum, dept) => sum + calculateChildCount(dept, departments, positions, employees),
        0
      );
      
      // Строим дерево отделов
      const tree = buildDepartmentTree(null, departments, positions, employees, totalElements);
      setDepartmentTree(tree);
      
      // Строим иерархию должностей для Администрации
      const administrationHierarchy = buildAdministrationHierarchy();
      if (administrationHierarchy) {
        setPositionHierarchy(administrationHierarchy);
      } else {
        // Резервный вариант - строим на основе manager_id
        const hierarchy = buildPositionHierarchy();
        setPositionHierarchy(hierarchy);
      }
    }
  }, [departments, positions, employees]);
  
  // Фильтруем иерархию при изменении выбранной должности
  useEffect(() => {
    if (!selectedPositionId || positionHierarchy.length === 0) {
      // Если нет выбранной должности или иерархия еще не построена, 
      // показываем первые два уровня
      if (positionHierarchy.length > 0) {
        const limitedHierarchy = positionHierarchy.map(node => ({
          ...node,
          subordinates: node.subordinates.slice(0, 5), // Ограничиваем до 5 подчиненных для каждого корневого узла
        })).slice(0, 2); // Ограничиваем до 2 корневых узлов
        
        setFilteredHierarchy(limitedHierarchy);
      } else {
        setFilteredHierarchy([]);
      }
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

    // Если должность найдена, создаем новую иерархию с этой должностью в корне
    if (selectedNode) {
      // Создаем копию узла, чтобы избежать мутаций оригинальной иерархии
      const filteredNode = {
        ...selectedNode,
        subordinates: [...selectedNode.subordinates], // Получаем всех непосредственных подчиненных
      };
      
      setFilteredHierarchy([filteredNode]);
    } else {
      // Если должность не найдена, показываем стандартную иерархию
      setFilteredHierarchy(positionHierarchy);
    }
  }, [selectedPositionId, positionHierarchy]);

  // Если данные еще не загружены, показываем загрузку
  if (departments.length === 0 || positions.length === 0) {
    return <div className="loading-message">Загрузка организационной структуры...</div>;
  }

  // Находим отдел Администрация
  const administrationDept = departments.find(d => d.name === 'Администрация');
  
  return (
    <div className="org-tree-container">
      {administrationDept && (
        <div className="department-card" style={{ maxWidth: '100%', margin: '0 auto 20px' }}>
          <div className="department-title">{administrationDept.name}</div>
        </div>
      )}
      
      {/* Отображаем иерархию должностей как горизонтальное дерево */}
      <div className="position-hierarchy">
        {selectedPositionId && (
          <div className="position-navigation">
            <button 
              className="back-to-main-hierarchy" 
              onClick={() => setSelectedPositionId(undefined)}
            >
              ← Вернуться к общей структуре
            </button>
          </div>
        )}
        <PositionTree
          nodes={filteredHierarchy.length > 0 ? filteredHierarchy : positionHierarchy.slice(0, 2)}
          allPositions={positions}
          allEmployees={employees}
          onPositionClick={handlePositionClick}
        />
      </div>
    </div>
  );
};

export default OrganizationTree;