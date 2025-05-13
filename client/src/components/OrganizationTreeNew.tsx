import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UnifiedPositionCard from "./UnifiedPositionCard";
import DisplaySettings from "./DisplaySettings";
import {
  Department,
  DepartmentNode,
  Employee,
  Position,
  PositionHierarchyNode,
} from "@shared/types";

// Тип для элемента истории навигации, который сохраняет контекст отдела
type NavigationHistoryItem = {
  positionId: number;
  departmentId: number | null;
};

// Расширяем интерфейс Window глобально
declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

// Карточка отдела
const DepartmentCard = ({ department }: { department: DepartmentNode }) => {
  const isOrganization = department.is_organization;

  // Для организаций создаем упрощенную карточку с двумя элементами
  if (isOrganization) {
    return (
      <div
        className="department-card organizationClass"
        style={{
          width: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "15px",
        }}
      >
        <img
          src={`/organization${department.department_id || ""}.png`}
          alt="Организация"
          className="mr-4"
        />
        <span>{department.name}</span>
      </div>
    );
  }

  // Стандартная карточка для отделов
  return (
    <div
      className="department-card departmentClass"
      style={{ minWidth: "300px" }}
    >
      <div className="department-title">
        {department.name}
        {department.is_organization && (
          <img
            src={`/organization${department.department_id || ""}.png`}
            alt="Организация"
            style={{ width: "24px", height: "24px", marginLeft: "8px" }}
          />
        )}
      </div>
    </div>
  );
};

// Компонент для отображения иерархии позиций
const PositionTree = ({
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  handleGoBack,
  selectedPositionId,
  hierarchyInitialLevels,
  showThreeLevels,
  showVacancies,
}: {
  nodes: PositionHierarchyNode[];
  allPositions: Position[];
  allEmployees: Employee[];
  onPositionClick?: (positionId: number) => void;
  handleGoBack?: () => void;
  selectedPositionId?: number;
  hierarchyInitialLevels?: number;
  showThreeLevels?: boolean;
  showVacancies?: boolean;
}) => {
  const [firstNode, ...otherNodes] = nodes;

  // Рассчитываем ширину для каждого узла
  useEffect(() => {
    // Функция для пересчета ширины узлов
    const recalc = () => {
      const container = document.querySelector(".tree-node") as HTMLElement;
      if (!container) return;

      const calculateWidthsRecursively = (container: HTMLElement): number => {
        const children = Array.from(
          container.querySelectorAll(":scope > .tree-branch"),
        ) as HTMLElement[];

        if (children.length === 0) {
          // Узел без дочерних элементов, минимальная ширина
          return 300;
        }

        let totalWidth = 0;
        for (const child of children) {
          const childWidth = calculateWidthsRecursively(child);
          totalWidth += childWidth;
        }

        // Устанавливаем ширину контейнера на основе общей ширины дочерних элементов
        container.style.width = `${Math.max(300, totalWidth)}px`;
        return totalWidth;
      };

      calculateWidthsRecursively(container);
    };

    setTimeout(recalc, 0);
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [nodes, showThreeLevels]);

  return (
    <div className="tree-node">
      {firstNode && firstNode.position && (
        <div className="tree-branch">
          {/* Карточка первой должности верхнего уровня */}
          <div className="tree-node-container">
            <UnifiedPositionCard
              position={firstNode.position}
              employees={firstNode.employees}
              onClick={onPositionClick}
            />

            {/* Отображаем подчиненных, но только если их ≥ 2 (для лучшей визуализации) */}
            {firstNode.subordinates && firstNode.subordinates.length > 0 && (
              <div
                className={`subordinates-container ${showThreeLevels ? "expanded" : ""}`}
              >
                {firstNode.subordinates
                  .slice(0, showThreeLevels ? undefined : 2)
                  .map((subNode: PositionHierarchyNode, index: number) => (
                    <div
                      key={`sub-${subNode.position.position_id}-${index}`}
                      className="subordinate-branch"
                    >
                      <UnifiedPositionCard
                        position={subNode.position}
                        employees={subNode.employees}
                        onClick={onPositionClick}
                      />

                      {/* Показываем внуков только если выбран режим детализации */}
                      {showThreeLevels &&
                        subNode.subordinates &&
                        subNode.subordinates.length > 0 && (
                          <div className="subordinates-container expanded">
                            {subNode.subordinates.map(
                              (
                                grandChild: PositionHierarchyNode,
                                grandChildIndex,
                              ) => (
                                <div
                                  key={`grand-${grandChild.position.position_id}-${grandChildIndex}`}
                                  className="subordinate-branch"
                                >
                                  <UnifiedPositionCard
                                    position={grandChild.position}
                                    employees={grandChild.employees}
                                    onClick={onPositionClick}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}

                      {/* Показываем дочерние отделы */}
                      {subNode.childDepartments &&
                        subNode.childDepartments.length > 0 && (
                          <div className="child-departments-container">
                            {subNode.childDepartments.map((dept) => {
                              const deptAsPosition: Position = {
                                position_id: dept.department_id,
                                name: dept.name,
                                parent_position_id: subNode.position.position_id,
                                department_id: dept.department_id,
                              };
                              
                              const deptNode: PositionHierarchyNode = {
                                position: deptAsPosition,
                                employees: [],
                                subordinates: [],
                                childDepartments: [],
                                department: dept,
                                isDepartment: true,
                              };
                              
                              return (
                                <div
                                  key={`dept-sub-tree-${dept.department_id}`}
                                  className="subordinate-branch"
                                >
                                  <UnifiedPositionCard
                                    position={deptAsPosition}
                                    employees={[]}
                                    isAlternative={true}
                                    departmentNode={dept}
                                    onClick={onPositionClick}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}

            {/* Показываем дочерние отделы для первой должности */}
            {firstNode.childDepartments && firstNode.childDepartments.length > 0 && (
              <div className="child-departments-container">
                {firstNode.childDepartments.map((dept) => {
                  const deptAsPosition: Position = {
                    position_id: dept.department_id,
                    name: dept.name,
                    parent_position_id: firstNode.position.position_id,
                    department_id: dept.department_id,
                    departments: [],
                  };
                  
                  const deptNode: PositionHierarchyNode = {
                    position: deptAsPosition,
                    employees: [],
                    subordinates: [],
                    childDepartments: [],
                    department: dept,
                    isDepartment: true,
                  };
                  
                  return (
                    <div
                      key={`dept-tree-${dept.department_id}`}
                      className="subordinate-branch"
                    >
                      <UnifiedPositionCard
                        position={deptAsPosition}
                        employees={[]}
                        isAlternative={true}
                        departmentNode={dept}
                        onClick={onPositionClick}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {otherNodes.map((node: PositionHierarchyNode, index: number) => (
        <div className="tree-branch" key={`node-${node.position.position_id}-${index}`}>
          <div className="tree-node-container">
            <UnifiedPositionCard
              position={node.position}
              employees={node.employees}
              onClick={onPositionClick}
            />

            {/* Отображаем подчиненных */}
            {node.subordinates && node.subordinates.length > 0 && (
              <div
                className={`subordinates-container ${showThreeLevels ? "expanded" : ""}`}
              >
                {node.subordinates
                  .slice(0, showThreeLevels ? undefined : 2)
                  .map((subNode: PositionHierarchyNode, subIndex: number) => (
                    <div
                      key={`sub-${subNode.position.position_id}-${subIndex}`}
                      className="subordinate-branch"
                    >
                      <UnifiedPositionCard
                        position={subNode.position}
                        employees={subNode.employees}
                        onClick={onPositionClick}
                      />

                      {/* Показываем дочерние отделы */}
                      {subNode.childDepartments &&
                        subNode.childDepartments.length > 0 && (
                          <div className="child-departments-container">
                            {subNode.childDepartments.map((dept) => {
                              const deptAsPosition: Position = {
                                position_id: dept.department_id,
                                name: dept.name,
                                parent_position_id: subNode.position.position_id,
                                department_id: dept.department_id,
                                departments: [],
                              };
                              
                              return (
                                <div
                                  key={`dept-other-tree-${dept.department_id}`}
                                  className="subordinate-branch"
                                >
                                  <UnifiedPositionCard
                                    position={deptAsPosition}
                                    employees={[]}
                                    isAlternative={true}
                                    departmentNode={dept}
                                    onClick={onPositionClick}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Основной компонент
type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
  currentDepartmentId?: number | null;
  showThreeLevels?: boolean;
  showVacancies?: boolean;
};

const OrganizationTreeNew: React.FC<OrganizationTreeProps> = (props) => {
  const {
    initialPositionId = 0,
    onPositionClick,
    departmentsData,
    positionsData,
    employeesData,
    currentDepartmentId,
    showThreeLevels = false,
    showVacancies = false,
  } = props;

  // State для данных
  const [departments, setDepartments] = useState<Department[]>(departmentsData || []);
  const [positions, setPositions] = useState<Position[]>(positionsData || []);
  const [employees, setEmployees] = useState<Employee[]>(employeesData || []);
  const [positionsWithDepartments, setPositionsWithDepartments] = useState<any[]>([]);
  const [positionRelations, setPositionRelations] = useState<any[]>([]);
  
  // State для управления отображением
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    initialPositionId || null
  );
  const [currentDepartmentContext, setCurrentDepartmentContext] = useState<number | null>(
    currentDepartmentId || null
  );
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const [positionHierarchy, setPositionHierarchy] = useState<PositionHierarchyNode[]>([]);
  const [filteredHierarchy, setFilteredHierarchy] = useState<PositionHierarchyNode[]>([]);
  const [hierarchyInitialLevels, setHierarchyInitialLevels] = useState(3);
  const [showThreeLevelsState, setShowThreeLevels] = useState(showThreeLevels);
  const [showVacanciesState, setShowVacancies] = useState(showVacancies);

  // Fetch departments
  const departmentsQuery = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      return await response.json();
    },
    enabled: !departmentsData,
  });

  // Fetch positions with departments
  const positionsWithDepartmentsQuery = useQuery({
    queryKey: ["/api/positions/with-departments"],
    queryFn: async () => {
      const response = await fetch("/api/positions/with-departments");
      if (!response.ok) {
        throw new Error("Failed to fetch positions with departments");
      }
      return await response.json();
    },
  });

  // Fetch positions
  const positionsQuery = useQuery({
    queryKey: ["/api/positions"],
    queryFn: async () => {
      const response = await fetch("/api/positions");
      if (!response.ok) {
        throw new Error("Failed to fetch positions");
      }
      return await response.json();
    },
    enabled: !positionsData,
  });

  // Fetch employees
  const employeesQuery = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      return await response.json();
    },
    enabled: !employeesData,
  });

  // Fetch position relations
  const positionRelationsQuery = useQuery({
    queryKey: ["/api/positionpositions"],
    queryFn: async () => {
      const response = await fetch("/api/positionpositions");
      if (!response.ok) {
        throw new Error("Failed to fetch position relations");
      }
      return await response.json();
    },
  });

  // Set departments
  useEffect(() => {
    if (departmentsData) {
      setDepartments(departmentsData);
    } else if (departmentsQuery.data) {
      setDepartments(departmentsQuery.data);
    }
  }, [departmentsData, departmentsQuery.data]);

  // Set positions
  useEffect(() => {
    if (positionsData) {
      setPositions(positionsData);
    } else if (positionsQuery.data) {
      setPositions(positionsQuery.data);
    }
  }, [positionsData, positionsQuery.data]);

  // Set employees
  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    } else if (employeesQuery.data) {
      setEmployees(employeesQuery.data);
    }
  }, [employeesData, employeesQuery.data]);

  // Set positions with departments
  useEffect(() => {
    if (positionsWithDepartmentsQuery.data) {
      setPositionsWithDepartments(positionsWithDepartmentsQuery.data);
      // Сохраняем в глобальном объекте для отладки
      window.positionsWithDepartmentsData = positionsWithDepartmentsQuery.data;
    }
  }, [positionsWithDepartmentsQuery.data]);

  // Set position relations
  useEffect(() => {
    if (positionRelationsQuery.data) {
      setPositionRelations(positionRelationsQuery.data);
    }
  }, [positionRelationsQuery.data]);

  // Update display settings
  useEffect(() => {
    setShowThreeLevels(showThreeLevels);
  }, [showThreeLevels]);

  useEffect(() => {
    setShowVacancies(showVacancies);
  }, [showVacancies]);

  // Handle settings changes
  const handleThreeLevelsChange = (value: boolean) => {
    setShowThreeLevels(value);
  };

  const handleShowVacanciesChange = (value: boolean) => {
    setShowVacancies(value);
  };

  // Navigate back
  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const previousItem = navigationHistory[navigationHistory.length - 1];
      
      // Обновляем историю навигации
      setNavigationHistory(prev => prev.slice(0, -1));
      
      // Устанавливаем предыдущую выбранную должность
      setSelectedPositionId(previousItem.positionId);
      
      // Устанавливаем контекст отдела
      setCurrentDepartmentContext(previousItem.departmentId);
    } else {
      // Если история пуста, возвращаемся к начальному состоянию
      setSelectedPositionId(null);
      setCurrentDepartmentContext(null);
    }
  };

  // Handle position click
  const handlePositionClick = (positionId: number) => {
    // Добавляем текущее состояние в историю
    setNavigationHistory(prev => [
      ...prev,
      { positionId: selectedPositionId || 0, departmentId: currentDepartmentContext }
    ]);
    
    // Обновляем выбранную должность
    setSelectedPositionId(positionId);
    
    // Передаем событие родительскому компоненту, если нужно
    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };

  // Создаем иерархию должностей
  useEffect(() => {
    // Функция для создания узла должности с подчиненными
    const createPositionHierarchyNode = (
      positionId: number,
      department: Department,
      processedPositions: Set<number> = new Set()
    ): PositionHierarchyNode | null => {
      // Проверяем, не обрабатывали ли уже эту должность, чтобы избежать циклов
      if (processedPositions.has(positionId)) {
        return null;
      }
      
      // Добавляем должность в обработанные
      processedPositions.add(positionId);
      
      // Находим информацию о должности
      const position = positions.find(p => p.position_id === positionId);
      if (!position) return null;

      // Найти сотрудников на этой должности в этом отделе
      const positionEmployees = employees.filter(
        emp => 
          emp.position_id === positionId && 
          emp.department_id === department.department_id && 
          !emp.deleted
      );

      // Найти дочерние отделы, которые подчиняются этой должности
      const childDepartments = departments.filter(
        dept => 
          dept.parent_position_id === positionId && 
          !dept.deleted
      );

      // Найти подчиненные должности
      const subordinatePositions: PositionHierarchyNode[] = [];
      
      // Особая обработка для должности "Начальник управления" (ID: 121) в отделе "Управление цифровизации..." (ID: 5)
      // Добавляем должность "Ведущий специалист" (ID: 122) как подчиненную
      const specialCase = positionId === 121 && department.department_id === 5;
      
      if (specialCase) {
        console.log("Особый случай: Начальник управления (ID: 121) в отделе ID 5");
        // Проверяем, существует ли должность "Ведущий специалист" (ID: 122)
        const specialistPosition = positions.find(p => p.position_id === 122);
        
        if (specialistPosition) {
          // Находим сотрудников на должности "Ведущий специалист" в отделе 5
          const specialistEmployees = employees.filter(
            e => e.position_id === 122 && e.department_id === 5 && !e.deleted
          );
          
          // Добавляем должность "Ведущий специалист" как подчиненную
          subordinatePositions.push({
            position: specialistPosition,
            employees: specialistEmployees,
            subordinates: [],
            childDepartments: [],
            departmentContext: 5
          });
          
          console.log("Добавлен Ведущий специалист с", specialistEmployees.length, "сотрудниками");
        }
      }

      // Стандартная обработка подчиненных должностей на основе данных о связях
      positionRelations.forEach(relation => {
        if (
          relation.parent_position_id === positionId && 
          relation.department_id === department.department_id && 
          !relation.deleted
        ) {
          const subordinateNode = createPositionHierarchyNode(
            relation.position_id,
            department,
            new Set(processedPositions)
          );
          
          if (subordinateNode) {
            // Добавляем информацию о контексте отдела
            subordinateNode.departmentContext = department.department_id;
            subordinatePositions.push(subordinateNode);
          }
        }
      });

      // Создаем узел должности
      const node: PositionHierarchyNode = {
        position,
        employees: positionEmployees,
        subordinates: subordinatePositions,
        childDepartments,
        departmentContext: department.department_id
      };

      return node;
    };

    // Отфильтровать должности администрации
    const buildHierarchy = () => {
      if (
        departments.length === 0 ||
        positions.length === 0 ||
        positionRelations.length === 0
      ) {
        return;
      }

      // Находим корневой отдел
      const rootDepartment = departments.find(
        d => d.parent_department_id === null && d.parent_position_id === null
      );

      if (!rootDepartment) return;

      // Находим высшие должности администрации
      let adminPositions: Position[] = [];

      // Сначала проверим positions с отделами (из /api/positions/with-departments)
      if (positionsWithDepartments && positionsWithDepartments.length > 0) {
        adminPositions = positionsWithDepartments.filter(pos => {
          // Проверяем, есть ли у должности привязка к корневому отделу
          return (
            pos.departments &&
            Array.isArray(pos.departments) &&
            pos.departments.some(
              (d: any) => d.department_id === rootDepartment.department_id
            )
          );
        });
      }

      // Если не нашли через positions с отделами, ищем через обычные должности
      if (adminPositions.length === 0) {
        // Находим все должности, которые имеют связь с корневым отделом
        const positionIds = positionRelations
          .filter(
            rel =>
              rel.department_id === rootDepartment.department_id &&
              !rel.deleted
          )
          .map(rel => rel.position_id);

        adminPositions = positions.filter(pos =>
          positionIds.includes(pos.position_id)
        );
      }

      // Выбираем высшие должности (без родительских должностей в этом же отделе)
      const rootPositions = adminPositions.filter(pos => {
        const parentRel = positionRelations.find(
          rel => 
            rel.position_id === pos.position_id && 
            rel.department_id === rootDepartment.department_id
        );
        
        return !parentRel || !adminPositions.some(
          p => p.position_id === parentRel.parent_position_id
        );
      });

      // Создаем иерархию должностей для каждой корневой должности
      const hierarchyNodes = rootPositions.map(position => {
        return createPositionHierarchyNode(
          position.position_id,
          rootDepartment
        );
      }).filter(Boolean) as PositionHierarchyNode[];

      setPositionHierarchy(hierarchyNodes);
      setFilteredHierarchy(hierarchyNodes);
    };

    buildHierarchy();
  }, [departments, employees, positions, positionRelations, positionsWithDepartments]);

  // Фильтруем иерархию в зависимости от выбранной должности
  useEffect(() => {
    if (selectedPositionId) {
      // Рекурсивно ищем узел должности по ID
      const findPositionNodeById = (
        nodes: PositionHierarchyNode[],
        positionId: number,
        departmentId?: number | null
      ): PositionHierarchyNode | null => {
        for (const node of nodes) {
          if (node.position.position_id === positionId) {
            // Если указан контекст отдела, проверяем его
            if (departmentId && node.departmentContext && 
                node.departmentContext !== departmentId) {
              continue; // Пропускаем этот узел, ищем должность в правильном контексте
            }
            
            return JSON.parse(JSON.stringify(node)); // Глубокая копия узла
          }
          
          // Рекурсивно ищем в подчиненных
          if (node.subordinates && node.subordinates.length > 0) {
            const foundInSubordinates = findPositionNodeById(
              node.subordinates,
              positionId,
              departmentId
            );
            if (foundInSubordinates) return foundInSubordinates;
          }
        }
        
        return null;
      };
      
      // Ищем выбранную должность
      const selectedNode = findPositionNodeById(
        positionHierarchy,
        selectedPositionId,
        currentDepartmentContext
      );
      
      if (selectedNode) {
        // Создаем копию узла для обработки
        const selectedNodeCopy = JSON.parse(JSON.stringify(selectedNode));
        
        if (currentDepartmentContext) {
          // Фильтруем подчиненных, чтобы показать только те, которые относятся к выбранному отделу
          let filteredSubordinates = selectedNodeCopy.subordinates;
          
          // Функция для проверки связи должности с отделом
          const isPositionLinkedToDepartment = (positionId: number): boolean => {
            // 1. Проверяем связи между должностями в этом отделе
            const hasPositionRelation = positionRelations.some(
              rel =>
                (rel.position_id === positionId ||
                  rel.parent_position_id === positionId) &&
                rel.department_id === currentDepartmentContext && 
                !rel.deleted
            );
            
            if (hasPositionRelation) return true;
            
            // 2. Проверяем привязку должности к отделу
            const hasDepartmentLink = positionsWithDepartments
              .find(p => p.position_id === positionId)
              ?.departments?.some((d: any) => d.department_id === currentDepartmentContext);
            
            if (hasDepartmentLink) return true;
            
            // 3. Проверяем сотрудников в этом отделе
            const hasEmployees = employees.some(
              e =>
                e.position_id === positionId &&
                e.department_id === currentDepartmentContext &&
                !e.deleted
            );
            
            return hasEmployees;
          };
          
          // Фильтруем подчиненных
          filteredSubordinates = filteredSubordinates.filter(subNode => {
            return isPositionLinkedToDepartment(subNode.position.position_id);
          });
          
          // Обновляем информацию о сотрудниках и отделе для каждого подчиненного
          filteredSubordinates = filteredSubordinates.map(subNode => {
            const updatedNode = { ...subNode };
            
            // Фильтруем сотрудников для этого отдела
            updatedNode.employees = employees.filter(
              e =>
                e.position_id === subNode.position.position_id &&
                e.department_id === currentDepartmentContext &&
                !e.deleted
            );
            
            // Добавляем информацию об отделе
            const departmentInfo = departments.find(
              d => d.department_id === currentDepartmentContext
            );
            if (departmentInfo) {
              updatedNode.department = departmentInfo;
            }
            
            return updatedNode;
          });
          
          // Обновляем список подчиненных
          selectedNodeCopy.subordinates = filteredSubordinates;
        }
        
        // Показываем только выбранный узел
        setFilteredHierarchy([selectedNodeCopy]);
      } else {
        // Если должность не найдена, показываем второй уровень иерархии
        if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
          setFilteredHierarchy(positionHierarchy[0].subordinates);
        } else {
          setFilteredHierarchy([]);
        }
      }
    } else {
      // Если должность не выбрана, показываем полную иерархию
      setFilteredHierarchy(positionHierarchy);
    }
  }, [selectedPositionId, currentDepartmentContext, positionHierarchy, departments, employees, positionRelations, positionsWithDepartments]);

  // Если данные еще не загружены, показываем загрузку
  if (
    departments.length === 0 ||
    positions.length === 0 ||
    positionRelations.length === 0
  ) {
    return (
      <div className="loading-message">
        Загрузка организационной структуры...
        {departments.length > 0 &&
          positions.length > 0 &&
          positionRelations.length === 0 && (
            <div>Ожидание загрузки связей между должностями...</div>
          )}
      </div>
    );
  }

  return (
    <div className="org-tree-container">
      {/* Отображаем иерархию должностей как горизонтальное дерево */}
      <div
        className="position-hierarchy"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <div className="organization-controls">
          {selectedPositionId && (
            <div className="position-navigation">
              <button className="back-to-main-hierarchy" onClick={handleGoBack}>
                ← Вернуться к предыдущей структуре
              </button>
            </div>
          )}

          <div className="display-settings-wrapper">
            <DisplaySettings
              showThreeLevels={showThreeLevelsState}
              showVacancies={showVacanciesState}
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
          handleGoBack={handleGoBack}
          selectedPositionId={selectedPositionId || undefined}
          hierarchyInitialLevels={Number(hierarchyInitialLevels)}
          showThreeLevels={showThreeLevelsState}
          showVacancies={showVacanciesState}
        />
      </div>
    </div>
  );
};

export default OrganizationTreeNew;