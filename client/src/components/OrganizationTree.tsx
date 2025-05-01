import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import UnifiedPositionCard from "./UnifiedPositionCard";
import DisplaySettings from "./DisplaySettings";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Расширяем интерфейс Window глобально
declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

// Типы данных для организационной структуры
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
};

type Position = {
  position_id: number;
  name: string;
  department_id?: number | null;
};

// Тип для связей position_position
type PositionRelation = {
  position_relation_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number;
  deleted: boolean;
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null; // Добавляем поле manager_id для отслеживания подчиненности
};

// Тип для построения дерева отделов
type DepartmentNode = Department & {
  positions: Position[];
  children: DepartmentNode[];
  width: number; // ширина в процентах
  childCount: number; // общее количество дочерних элементов
};

// Тип для построения позиций с сотрудниками
type PositionWithEmployees = Position & {
  employees: Employee[];
};

// Специальный тип для представления отдела в иерархии должностей
type DepartmentAsPosition = {
  position_id: number; // Используем уникальный ID, например department_id * 1000
  name: string;
  isDepartment: true;
  department_id: number;
};

// Карточка отдела
const DepartmentCard = ({ department }: { department: DepartmentNode }) => {
  return (
    <div className="department-card" style={{ minWidth: "300px" }}>
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
  onClick,
}: {
  position: Position;
  employees: Employee[];
  onClick?: (positionId: number) => void;
}) => {
  return (
    <div
      className="position-employee-card"
      onClick={() => onClick && onClick(position.position_id)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="position-title-small">{position.name}</div>
      <div className="position-divider-small"></div>
      {employees.length > 0 ? (
        // Если есть сотрудники, показываем их имена
        employees.map((employee) => (
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
  level = 0,
}: {
  department: DepartmentNode;
  allPositions: Position[];
  allEmployees: Employee[];
  level?: number;
}) => {
  // Загружаем должности для этого отдела из API
  const { data: departmentPositionsResponse } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: [`/api/departments/${department.department_id}/positions`],
  });

  // Загружаем связи должностей с отделами
  const { data: positionDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: [`/api/positiondepartments`],
  });
  
  // Загружаем связи должностей по иерархии
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: PositionRelation[];
  }>({
    queryKey: [`/api/positionpositions`],
  });

  // Получаем должности для этого отдела по аналогии с OrganizationStructure.tsx
  // Аналог метода getDeptPositions из OrganizationStructure.tsx
  const getDeptPositions = (deptId: number) => {
    // Используем глобальный объект positionsWithDepartmentsData 
    const positions = window.positionsWithDepartmentsData || [];
    
    // Фильтруем должности, которые связаны с текущим отделом
    const linked = positions.filter(p => 
      p.departments && Array.isArray(p.departments) && 
      p.departments.some((d: any) => d.department_id === deptId)
    );
    
    console.log(`Найдено ${linked.length} должностей для отдела ID=${deptId} через positionsWithDepartmentsData`);
    
    // Получаем связи position_position для этого отдела
    const positionRelations = positionPositionsResponse?.data?.filter(pp => 
      !pp.deleted && pp.department_id === deptId
    ) || [];
    
    console.log(`Найдено ${positionRelations.length} связей должностей для отдела ${deptId}`);
    positionRelations.forEach(rel => {
      console.log(`- Связь position_position: должность ${rel.position_id} подчиняется ${rel.parent_position_id}`);
    });
    
    // Создаем карту должностей с их дочерними элементами
    const map: Record<number, any> = {};
    
    // Заполняем карту базовыми данными
    linked.forEach(p => {
      map[p.position_id] = { ...p, children: [] };
    });
    
    // Строим иерархию на основе данных position_position
    positionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      // Проверяем, что обе должности существуют в этом отделе
      if (map[childId] && map[parentId]) {
        // Добавляем дочернюю должность к родительской
        map[parentId].children.push(map[childId]);
        console.log(`Добавлена дочерняя должность ${map[childId].name} (ID: ${childId}) к ${map[parentId].name} (по данным position_position)`);
      }
    });
    
    // Находим корневые должности (те, которые не являются дочерними ни для одной другой должности в этом отделе)
    const isChildInDept = new Set<number>();
    positionRelations.forEach(rel => {
      isChildInDept.add(rel.position_id);
    });
    
    // Корневые должности - это те, которые есть в отделе, но не являются дочерними
    const rootPositions = linked.filter(p => !isChildInDept.has(p.position_id));
    
    console.log(`Найдено ${rootPositions.length} корневых должностей для отдела ${deptId}:`);
    rootPositions.forEach(p => {
      console.log(`- Корневая должность: "${p.name}" (ID: ${p.position_id}) с ${map[p.position_id]?.children?.length || 0} подчиненными`);
    });
    
    return rootPositions;
  };
  
  // Получаем должности для этого отдела
  let departmentPositions: any[] = getDeptPositions(department.department_id);
  
  // Если должности не найдены через positionsWithDepartmentsData, 
  // используем резервные методы
  if (departmentPositions.length === 0) {
    // Пробуем получить из API
    if (departmentPositionsResponse?.data && departmentPositionsResponse.data.length > 0) {
      departmentPositions = departmentPositionsResponse.data;
      console.log(
        `Получено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) из API`,
      );
    } else {
      // Резервная логика с учетом position_department и сотрудников
      const positionDepartmentLinks = positionDepartmentsResponse?.data || [];
      
      // Множество для хранения ID найденных должностей
      const positionIds = new Set<number>();
      
      // 1. Добавляем ID из связей позиция-отдел
      positionDepartmentLinks
        .filter((link) => link.department_id === department.department_id)
        .forEach((link) => positionIds.add(link.position_id));
      
      // 2. Добавляем ID должностей сотрудников, которые работают в этом отделе
      allEmployees
        .filter(
          (emp) =>
            emp.department_id === department.department_id &&
            emp.position_id !== null,
        )
        .forEach((emp) => {
          if (emp.position_id) positionIds.add(emp.position_id);
        });
      
      // 3. Также включаем позиции, которые уже были привязаны к этому отделу через API
      department.positions.forEach((pos) => positionIds.add(pos.position_id));
      
      // Фильтруем позиции по найденным ID
      departmentPositions = allPositions.filter((position) =>
        positionIds.has(position.position_id),
      );
      
      console.log(
        `Найдено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) через резервную логику`,
      );
    }
  }

  // Получаем сотрудников для каждой должности
  const positionsWithEmployees = departmentPositions.map((position) => {
    const positionEmployees = allEmployees.filter(
      (emp) =>
        emp.position_id === position.position_id &&
        emp.department_id === department.department_id,
    );

    return {
      ...position,
      employees: positionEmployees,
    };
  });

  // Вычисляем ширину для дочерних отделов
  const totalChildWidth = department.children.reduce(
    (sum, child) => sum + child.width,
    0,
  );

  return (
    <div
      className="department-node"
      style={{
        width: `${department.width}%`,
        minWidth: "300px",
        margin: "0 auto",
      }}
    >
      <DepartmentCard department={department} />

      {/* Должности в отделе */}
      <div className="position-employees-list">
        {positionsWithEmployees.map((position) => (
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
            {department.children.map((childDept) => (
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
  employees: Employee[]; // Массив сотрудников на этой должности
  subordinates: PositionHierarchyNode[];
  childDepartments: Department[]; // Дочерние отделы, связанные с этой должностью
};

// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  selectedPositionId,
  hierarchyInitialLevels = 3, // По умолчанию 3 уровня
  showThreeLevels = false, // Показывать третий уровень
  showVacancies = false, // Показывать индикаторы вакансий
}: {
  nodes: PositionHierarchyNode[];
  allPositions: Position[];
  allEmployees: Employee[];
  onPositionClick?: (positionId: number) => void;
  selectedPositionId?: number;
  hierarchyInitialLevels?: number;
  showThreeLevels?: boolean;
  showVacancies?: boolean;
}) => {
  // Проверяем, есть ли хотя бы одна действительная должность
  // Фильтрация необходима, т.к. иногда могут приходить неверные данные
  const validNodes = nodes.filter((node) => node && node.position);

  // Берем первую должность для основной ветви (если есть)
  const firstNode = validNodes.length > 0 ? validNodes[0] : null;

  // Остальные должности верхнего уровня
  const otherNodes = validNodes.length > 0 ? validNodes.slice(1) : [];

  // Определяем, является ли это первичным показом организационного дерева с самой вершины
  const isRootView = !selectedPositionId;

  useEffect(() => {
    const calculateWidthsRecursively = (container: HTMLElement): number => {
      const branches = container.querySelectorAll<HTMLElement>(
        ":scope > .subordinate-branch",
      );
      if (branches.length === 0) return 0;

      let totalWidth = 0;

      branches.forEach((branch) => {
        const childSubContainer = branch.querySelector<HTMLElement>(
          ":scope > .subordinates-container",
        );
        let branchWidth = 0;

        if (childSubContainer) {
          const childWidth = calculateWidthsRecursively(childSubContainer);
          branchWidth = childWidth;
          branch.style.width = `${childWidth}px`;
        } else {
          branchWidth = 240;
          branch.style.width = "240px";
        }

        totalWidth += branchWidth + 20;
      });

      const line = container.querySelector<HTMLElement>(".tree-branch-line");
      if (line) {
        const first = branches[0]?.offsetWidth || 0;
        const last = branches[branches.length - 1]?.offsetWidth || 0;
        const totalLine = totalWidth - (first + last) / 2 - 20;
        line.style.width = `${totalLine}px`;
        line.style.left = `${first / 2 + 10}px`;
      }

      return totalWidth;
    };

    const recalc = () => {
      document
        .querySelectorAll<HTMLElement>(".subordinates-container")
        .forEach((container) => {
          calculateWidthsRecursively(container);
        });
    };

    // Отложенный запуск после первого рендера
    requestAnimationFrame(() => {
      setTimeout(recalc, 0);
    });

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [nodes, showThreeLevels]); // Добавили зависимость от showThreeLevels

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
                <div
                  className="tree-branch-line"
                  style={{
                    width: `${Math.max(firstNode.subordinates.length * 120, 100)}px`,
                  }}
                ></div>
              </div>

              {/* Отображаем подчиненных */}
              {firstNode.subordinates
                .filter((sub) => sub && sub.position)
                .map((subNode: PositionHierarchyNode, index: number) => (
                  <div
                    key={`${subNode.position.position_id}-${index}`}
                    className="subordinate-branch"
                  >
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
                          <div
                            className="tree-branch-line"
                            style={{
                              width: `${Math.max(
                                subNode.subordinates.length * 120,
                                100,
                              )}px`,
                            }}
                          ></div>
                        </div>

                        {subNode.subordinates
                          .filter((sub) => sub && sub.position)
                          .map((grandChild: PositionHierarchyNode, grandIndex: number) => (
                            <div
                              key={`${grandChild.position.position_id}-${grandIndex}`}
                              className="subordinate-branch"
                            >
                              <UnifiedPositionCard
                                node={grandChild}
                                onPositionClick={onPositionClick}
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
        <div key={`other-${node.position.position_id}-${index}`} className="tree-branch other-branch">
          <div className="tree-node-container">
            <UnifiedPositionCard
              node={node}
              onPositionClick={onPositionClick}
              isTopLevel={isRootView} // Верхний уровень, если это корневой вид
              showVacancies={showVacancies}
            />
          </div>

          {/* Подчиненные должности */}
          {node.subordinates.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                <div
                  className="tree-branch-line"
                  style={{
                    width: `${Math.max(node.subordinates.length * 120, 100)}px`,
                  }}
                ></div>
              </div>

              {node.subordinates
                .filter((sub) => sub && sub.position)
                .map((subNode: PositionHierarchyNode, subIndex: number) => (
                  <div
                    key={`other-sub-${subNode.position.position_id}-${subIndex}`}
                    className="subordinate-branch"
                  >
                    <UnifiedPositionCard
                      node={subNode}
                      onPositionClick={onPositionClick}
                      isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
                      showVacancies={showVacancies}
                    />
                    
                    {/* Третий уровень иерархии */}
                    {subNode.subordinates.length > 0 && showThreeLevels && (
                      <div className="subordinates-container">
                        <div className="tree-branch-connections">
                          <div
                            className="tree-branch-line"
                            style={{
                              width: `${Math.max(
                                subNode.subordinates.length * 120,
                                100,
                              )}px`,
                            }}
                          ></div>
                        </div>

                        {subNode.subordinates
                          .filter((sub) => sub && sub.position)
                          .map((grandChild: PositionHierarchyNode, grandIndex: number) => (
                            <div
                              key={`other-grand-${grandChild.position.position_id}-${grandIndex}`}
                              className="subordinate-branch"
                            >
                              <UnifiedPositionCard
                                node={grandChild}
                                onPositionClick={onPositionClick}
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
      ))}
    </div>
  );
};

// Основной компонент организационного дерева
type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
};

// Основной компонент дерева организации
const OrganizationTree = ({
  initialPositionId,
  onPositionClick,
  departmentsData,
  positionsData,
  employeesData,
}: OrganizationTreeProps) => {
  // Состояние для отображения различных уровней дерева
  const [displayLevel, setDisplayLevel] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  // Состояние для настроек отображения
  const [showThreeLevels, setShowThreeLevels] = useState(false); // показывать ли три уровня
  const [showVacancies, setShowVacancies] = useState(false); // показывать ли индикаторы вакансий

  // Получаем данные из API
  const { data: departmentsResponse } = useQuery<{
    status: string;
    data: Department[];
  }>({
    queryKey: ["/api/departments"],
  });

  const { data: positionsResponse } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: ["/api/positions"],
  });

  const { data: employeesResponse } = useQuery<{
    status: string;
    data: Employee[];
  }>({
    queryKey: ["/api/employees"],
  });

  // Загружаем связи должностей по иерархии
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: PositionRelation[];
  }>({
    queryKey: [`/api/positionpositions`],
  });

  // Загружаем связи должностей с отделами
  const { data: positionDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: [`/api/positiondepartments`],
  });

  // Получаем должности с отделами
  const { data: positionsWithDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/positions/with-departments"],
  });

  // Загружаем настройки
  const { data: settingsResponse } = useQuery<{
    status: string;
    data: { id: number; data_key: string; data_value: string }[];
  }>({
    queryKey: ["/api/settings"],
  });

  // Используем данные, переданные в props, или данные из API
  const departments = departmentsData || departmentsResponse?.data || [];
  const positions = positionsData || positionsResponse?.data || [];
  const employees = employeesData || employeesResponse?.data || [];
  const positionsWithDepartments =
    positionsWithDepartmentsResponse?.data || [];

  // Сохраняем positionsWithDepartments в глобальной переменной для использования в других компонентах
  if (positionsWithDepartments.length > 0) {
    window.positionsWithDepartmentsData = positionsWithDepartments;
  }

  // Обработка значения initialPositionId, если оно задано
  useEffect(() => {
    if (initialPositionId) {
      // Получаем данные о выбранной должности из загруженных данных
      const selectedPosition = positions.find(
        (p) => p.position_id === initialPositionId,
      );

      if (selectedPosition) {
        setCurrentPosition(selectedPosition);
        console.log(
          `Установлена текущая должность: ${selectedPosition.name} (ID: ${selectedPosition.position_id})`,
        );
        
        // Переходим на следующий уровень, чтобы показать выбранную должность
        setDisplayLevel([...displayLevel, selectedPosition]);
      }
    }
  }, [initialPositionId, positions]);

  // Получаем связи position_position
  const positionRelations = positionPositionsResponse?.data?.filter(pp => !pp.deleted) || [];

  // Функция для получения дочерних отделов
  const getChildDepartments = (departmentId: number): Department[] => {
    return departments.filter(
      (d) => d.parent_department_id === departmentId,
    );
  };

  // Строим дерево отделов
  const buildDepartmentTree = (
    department: Department,
    allPositions: Position[],
    allEmployees: Employee[],
    level = 0,
  ): DepartmentNode => {
    // Получаем дочерние отделы
    const childDepartments = getChildDepartments(department.department_id);

    // Рекурсивно строим деревья для дочерних отделов
    const childNodes = childDepartments.map((childDept) =>
      buildDepartmentTree(childDept, allPositions, allEmployees, level + 1),
    );

    // Общее кол-во дочерних элементов (включая детей дочерних отделов)
    const totalChildCount = childNodes.reduce(
      (sum, child) => sum + child.childCount + 1,
      0,
    );

    // Получаем должности для этого отдела
    const deptPositions = allPositions.filter((pos) => {
      return allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      );
    });

    // Создаем узел отдела с дочерними отделами
    const node: DepartmentNode = {
      ...department,
      positions: deptPositions,
      children: childNodes,
      width: 100, // изначально задаем ширину 100%
      childCount: totalChildCount,
    };

    return node;
  };

  // Строим иерархию должностей
  const buildPositionHierarchy = (
    rootPositionId?: number
  ): PositionHierarchyNode[] => {
    // Результирующий массив для хранения дерева должностей
    const result: PositionHierarchyNode[] = [];
    
    // Создаем карту всех должностей для быстрого доступа
    const positionNodes: Record<number, PositionHierarchyNode> = {};
    
    // Инициализируем все узлы
    positions.forEach((position) => {
      // Находим сотрудников для этой должности
      const positionEmployees = employees.filter(
        (emp) => emp.position_id === position.position_id
      );
      
      // Находим дочерние отделы, связанные с этой должностью
      const childDepartments = departments.filter(
        (dept) => dept.parent_position_id === position.position_id,
      );
      
      // Создаем узел для должности
      positionNodes[position.position_id] = {
        position,
        employees: positionEmployees,
        subordinates: [],
        childDepartments,
      };
    });
    
    // Множество для отслеживания дочерних должностей
    const childPositions = new Set<number>();
    
    // Строим иерархию на основе данных position_positions
    positionRelations.forEach(relation => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      if (positionNodes[childId] && positionNodes[parentId]) {
        // Добавляем дочернюю должность к родительской
        positionNodes[parentId].subordinates.push(positionNodes[childId]);
        childPositions.add(childId);
        console.log(`Создана связь: "${positionNodes[childId].position.name}" подчиняется "${positionNodes[parentId].position.name}"`);
      }
    });
    
    // Если указан конкретный корневой ID, возвращаем только его поддерево
    if (rootPositionId && positionNodes[rootPositionId]) {
      return [positionNodes[rootPositionId]];
    }
    
    // Иначе находим все корневые должности (без родителей по связям position_position)
    // Корневые узлы - это те, которые не находятся ни в одной записи как дочерняя должность
    const rootNodes = Object.values(positionNodes).filter(
      (positionNode) => !childPositions.has(positionNode.position.position_id)
    );
    
    console.log(`Построено ${rootNodes.length} корневых узлов`);
    return rootNodes;
  };
  
  // Используем настройки, если они загружены
  useEffect(() => {
    if (settingsResponse?.data) {
      try {
        // Загружаем настройки из API
        const settings = settingsResponse.data;
        
        // Ищем настройку для количества уровней иерархии
        const hierarchyLevelsSetting = settings.find(s => s.data_key === "hierarchy_initial_levels");
        if (hierarchyLevelsSetting) {
          const levels = parseInt(hierarchyLevelsSetting.data_value);
          console.log(`Настройки уровней иерархии:`, hierarchyLevelsSetting.data_value);
          
          // Устанавливаем показ трех уровней, если настройка = 3
          setShowThreeLevels(levels >= 3);
        }
        
        // Ищем настройку для показа вакансий
        const showVacanciesSetting = settings.find(s => s.data_key === "show_vacancies");
        if (showVacanciesSetting) {
          const showVacancies = showVacanciesSetting.data_value === "true";
          setShowVacancies(showVacancies);
        }
      } catch (error) {
        console.error("Ошибка при обработке настроек:", error);
        console.log("Ошибка получения настроек, используем значения по умолчанию");
      }
    }
  }, [settingsResponse]);

  // Обработчик навигации по дереву
  const handlePositionClick = (positionId: number) => {
    // Если передан внешний обработчик, вызываем его
    if (onPositionClick) {
      onPositionClick(positionId);
      return;
    }

    // Находим должность по её ID
    const position = positions.find((p) => p.position_id === positionId);
    if (!position) return;

    // Добавляем должность в путь навигации
    setDisplayLevel([...displayLevel, position]);
    setCurrentPosition(position);
  };

  // Обработчик кнопки "Назад"
  const handleBack = () => {
    if (displayLevel.length <= 1) {
      // Если находимся на верхнем уровне, возвращаемся к корневому представлению
      setDisplayLevel([]);
      setCurrentPosition(null);
    } else {
      // Возвращаемся на уровень выше
      const newLevel = [...displayLevel];
      newLevel.pop();
      setDisplayLevel(newLevel);
      setCurrentPosition(newLevel[newLevel.length - 1] || null);
    }
  };

  // Если данные еще не загружены, показываем индикатор загрузки
  if (
    positions.length === 0 ||
    departments.length === 0 ||
    employees.length === 0
  ) {
    return <div>Загрузка данных...</div>;
  }
  
  // Строим корневые узлы департаментов (верхнего уровня)
  const rootDepartments = departments.filter(
    (d) => d.parent_department_id === null && d.parent_position_id === null,
  );

  // Строим дерево департаментов, начиная с корневых
  const departmentTrees = rootDepartments.map((rootDept) =>
    buildDepartmentTree(rootDept, positions, employees),
  );

  // Если у нас отображается конкретная должность, показываем детальный вид
  if (currentPosition) {
    // Получаем иерархию для текущей должности
    const positionHierarchy = buildPositionHierarchy(currentPosition.position_id);

    return (
      <div className="position-hierarchy-container">
        <div className="position-hierarchy-header">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="position-navigation-path">
            {displayLevel.map((pos, index) => (
              <React.Fragment key={pos.position_id}>
                {index > 0 && <span className="path-separator">/</span>}
                <span className="position-path-item">{pos.name}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="org-settings-container">
          <DisplaySettings
            showThreeLevels={showThreeLevels}
            onShowThreeLevelsChange={setShowThreeLevels}
            showVacancies={showVacancies}
            onShowVacanciesChange={setShowVacancies}
          />
        </div>

        <div className="position-hierarchy">
          <PositionTree
            nodes={positionHierarchy}
            allPositions={positions}
            allEmployees={employees}
            onPositionClick={handlePositionClick}
            selectedPositionId={currentPosition.position_id}
            showThreeLevels={showThreeLevels}
            showVacancies={showVacancies}
          />
        </div>
      </div>
    );
  }

  // Дерево отделов и должностей
  return (
    <div className="organization-tree-container">
      <div className="org-settings-container">
        <DisplaySettings
          showThreeLevels={showThreeLevels}
          onShowThreeLevelsChange={setShowThreeLevels}
          showVacancies={showVacancies}
          onShowVacanciesChange={setShowVacancies}
        />
      </div>

      {/* Дерево должностей */}
      <div className="position-hierarchy">
        <PositionTree
          nodes={buildPositionHierarchy()}
          allPositions={positions}
          allEmployees={employees}
          onPositionClick={handlePositionClick}
          showThreeLevels={showThreeLevels}
          showVacancies={showVacancies}
        />
      </div>

      {/* Дерево отделов */}
      <div className="department-tree-container">
        {departmentTrees.map((deptTree) => (
          <DepartmentWithChildren
            key={deptTree.department_id}
            department={deptTree}
            allPositions={positions}
            allEmployees={employees}
          />
        ))}
      </div>
    </div>
  );
};

export default OrganizationTree;