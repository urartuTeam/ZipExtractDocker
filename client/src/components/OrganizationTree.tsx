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
        <span className="department-label">Отдел</span>
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
    queryKey: [`/api/pd`],
  });

  // Загружаем связи должностей по иерархии
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: {
      position_relation_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number;
      deleted: boolean;
    }[];
  }>({
    queryKey: [`/api/positionpositions`],
  });
  const getDeptPositions = (deptId: number) => {
    const allPositions = window.positionsWithDepartmentsData || [];
    const positionRelations =
      positionPositionsResponse?.data?.filter((pp) => !pp.deleted) || [];

    // Список всех ID, участвующих в связях
    const allIds = new Set<number>();
    positionRelations.forEach((rel) => {
      allIds.add(rel.position_id);
      if (rel.parent_position_id) allIds.add(rel.parent_position_id);
    });

    // Строим карту всех должностей, участвующих в связях
    const map: Record<number, any> = {};
    allIds.forEach((id) => {
      const pos = allPositions.find((p) => p.position_id === id);
      if (pos && !map[id]) {
        map[id] = { ...pos, children: [] };
      }
    });

    // Строим иерархию
    positionRelations.forEach((rel) => {
      const child = map[rel.position_id];
      const parent = map[rel.parent_position_id];
      if (child && parent) {
        parent.children.push(child);
        // console.log(
        //   `Добавлена дочерняя должность ${child.name} (ID: ${rel.position_id}) к ${parent.name} (ID: ${rel.parent_position_id})`,
        // );
      }
    });

    // Отфильтруем только те должности, которые принадлежат текущему отделу
    const deptPositions = Object.values(map).filter((pos) =>
      pos.departments?.some((d: any) => d.department_id === deptId),
    );

    // Вычислим корневые: те, которые не являются ничьими подчинёнными
    const allChildren = new Set<number>();
    positionRelations.forEach((rel) => allChildren.add(rel.position_id));

    const rootPositions = deptPositions.filter((pos) => {
      const parentRel = positionRelations.find(
        (rel) => rel.position_id === pos.position_id,
      );
      return (
        !parentRel ||
        !deptPositions.find(
          (p) => p.position_id === parentRel.parent_position_id,
        )
      );
    });

    // console.log(
    //   `Найдено ${rootPositions.length} корневых должностей для отдела ${deptId}:`,
    // );
    rootPositions.forEach((p) => {
      // console.log(
      //   `- Корневая должность: "${p.name}" (ID: ${p.position_id}) с ${p.children?.length || 0} подчиненными`,
      // );
    });

    return rootPositions;
  };

  // Получаем должности для этого отдела
  let departmentPositions: any[] = getDeptPositions(department.department_id);

  // Если должности не найдены через positionsWithDepartmentsData,
  // используем резервные методы
  if (departmentPositions.length === 0) {
    // Пробуем получить из API
    if (
      departmentPositionsResponse?.data &&
      departmentPositionsResponse.data.length > 0
    ) {
      departmentPositions = departmentPositionsResponse.data;
      // console.log(
      //   `Получено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) из API`,
      // );
    } else {
      // Резервная логика с учетом position_department и сотрудников
      const positionDepartmentLinks = positionDepartmentsResponse?.data || [];

      // Множество для хранения ID найденных должностей
      const positionIds = new Set<number>();

      // 1. Добавляем ID из свя �ей позиция-отдел
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

      // console.log(
      //   `Найдено ${departmentPositions.length} должностей для отдела ${department.name} (ID: ${department.department_id}) через резервную логику`,
      // );
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
        width: department.is_organization ? "400px" : `${department.width}%`,
        minWidth: "300px",
        margin: "0 auto",
        flex: "0 0 auto",
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
          <div
            className="child-departments"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
            }}
          >
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

// Убираем вспомогательный компонент, так как теперь он импортирован из отдельного файла

// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  selectedPositionId,
  handleGoBack,
  hierarchyInitialLevels = 5, // По умолчанию 5 уровней для большей глубины
  showThreeLevels = false, // По умолчанию не показывать глубокие уровни
  showVacancies = false, // Показывать индикаторы вакансий
}: {
  nodes: PositionHierarchyNode[];
  allPositions: Position[];
  allEmployees: Employee[];
  onPositionClick?: (positionId: number) => void;
  selectedPositionId?: number;
  handleGoBack?: () => void;
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

  // Добавляем логирование параметров
  console.log("PositionTree параметры:", {
    showThreeLevels,
    hierarchyInitialLevels,
    nodesCount: nodes.length,
  });

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
          const isOrganization = branch.dataset.isOrganization === "true";
          branchWidth = isOrganization ? 350 : 240;
          branch.style.width = `${branchWidth}px`;
        }

        totalWidth += branchWidth + 20;
      });

      const line = container.querySelector<HTMLElement>(".tree-branch-line");
      if (line) {
        const first = branches[0]?.offsetWidth || 0;
        const last = branches[branches.length - 1]?.offsetWidth || 0;
        const totalLine = totalWidth - (first + last) / 2 - 20;
        line.style.width = `${totalLine}px`;
        //  console.log("-------------------");
        // console.log(first);
        // line.style.left = `${first / 2 + 10}px`;
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
              onPositionClick={handleGoBack}
              isTopLevel={isRootView} // Верхний уровень, если это корневой вид
              showVacancies={showVacancies}
            />
          </div>

          {/* Подчиненные первой должности */}
          {firstNode.subordinates.length > 0 && (
            <div
              className="subordinates-container"
              style={
                firstNode.department?.is_organization
                  ? { minWidth: "750px" }
                  : undefined
              }
            >
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
                .filter((sub) => sub && (sub.position || sub.department))
                .map((subNode: PositionHierarchyNode, index: number) => (
                  <div
                    key={`${subNode.position.position_id}-${index}`}
                    className="subordinate-branch"
                    data-is-organization={
                      subNode.department?.is_organization ? "true" : "false"
                    }
                  >
                    <UnifiedPositionCard
                      node={subNode}
                      onPositionClick={onPositionClick}
                      isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
                      showVacancies={showVacancies}
                    />

                    {/* Рекурсивное отображение подчиненных подчиненного, всегда показываем все уровни */}
                    {subNode.subordinates.length > 0 && (
                      <div
                        className="subordinates-container"
                        style={
                          subNode.department?.is_organization
                            ? { minWidth: "750px" }
                            : undefined
                        }
                      >
                        <div className="tree-branch-connections">
                          <div
                            className="tree-branch-line"
                            style={{
                              width: `${Math.max(subNode.subordinates.length * 120, 100)}px`,
                            }}
                          ></div>
                        </div>

                        {subNode.subordinates
                          .filter(
                            (sub) => sub && (sub.position || sub.department),
                          )
                          .map(
                            (
                              grandChild: PositionHierarchyNode,
                              grandIndex: number,
                            ) => (
                              <div
                                key={`${grandChild.position.position_id}-${grandIndex}`}
                                className="subordinate-branch"
                              >
                                <UnifiedPositionCard
                                  node={grandChild}
                                  onPositionClick={onPositionClick}
                                  isTopLevel={false} // Третий уровень не верхний
                                  showVacancies={showVacancies}
                                />
                              </div>
                            ),
                          )}
                      </div>
                    )}
                    
                    {/* Дочерние отделы подузла, отображаются как элементы дерева */}
                    {subNode.childDepartments && subNode.childDepartments.length > 0 && (
                      <div className="subordinates-container">
                        <div className="tree-branch-connections">
                          <div
                            className="tree-branch-line"
                            style={{
                              width: `${Math.max(subNode.childDepartments.length * 120, 100)}px`,
                            }}
                          ></div>
                        </div>

                        {subNode.childDepartments.map((dept) => {
                          // Создаем фиктивную позицию-узел для отдела
                          const deptAsPosition: Position = {
                            position_id: dept.department_id * 1000,
                            name: `${dept.name} (отдел)`,
                            departments: [],
                            parent_positions: [],
                            children_positions: [],
                          };
                          
                          // Создаем узел для дерева
                          const deptNode: PositionHierarchyNode = {
                            position: deptAsPosition,
                            employees: [],
                            subordinates: [],
                            department: dept,
                            isDepartment: true,
                          };
                          
                          return (
                            <div
                              key={`dept-sub-tree-${dept.department_id}`}
                              className="subordinate-branch"
                            >
                              <UnifiedPositionCard
                                node={deptNode}
                                onPositionClick={onPositionClick}
                                isTopLevel={false}
                                showVacancies={false}
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
          
          {/* Дочерние отделы для firstNode, отображаются как элементы дерева */}
          {firstNode && firstNode.childDepartments && firstNode.childDepartments.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                <div
                  className="tree-branch-line"
                  style={{
                    width: `${Math.max(firstNode.childDepartments.length * 120, 100)}px`,
                  }}
                ></div>
              </div>

              {firstNode.childDepartments.map((dept) => {
                // Создаем фиктивную позицию-узел для отдела
                const deptAsPosition: Position = {
                  position_id: dept.department_id * 1000,
                  name: `${dept.name} (отдел)`,
                  departments: [],
                  parent_positions: [],
                  children_positions: [],
                };
                
                // Создаем узел для дерева
                const deptNode: PositionHierarchyNode = {
                  position: deptAsPosition,
                  employees: [],
                  subordinates: [],
                  department: dept,
                  isDepartment: true,
                };
                
                return (
                  <div
                    key={`dept-tree-${dept.department_id}`}
                    className="subordinate-branch"
                  >
                    <UnifiedPositionCard
                      node={deptNode}
                      onPositionClick={onPositionClick}
                      isTopLevel={false}
                      showVacancies={false}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Отображаем остальные должности верхнего уровня */}
      {otherNodes.map((node: PositionHierarchyNode, index: number) => (
        <div
          key={`${node.position.position_id}-${index}`}
          className="tree-branch"
          style={{ marginLeft: "30px" }}
        >
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
            <div
              className="subordinates-container"
              style={
                node.department?.is_organization
                  ? { minWidth: "750px" }
                  : undefined
              }
            >
              <div className="tree-branch-connections">
                <div
                  className="tree-branch-line"
                  style={{
                    width: `${Math.max(node.subordinates.length * 120, 100)}px`,
                  }}
                ></div>
              </div>

              {node.subordinates
                .filter((sub) => sub && (sub.position || sub.department))
                .map((subNode: PositionHierarchyNode, subIndex: number) => (
                  <div
                    key={`${subNode.position.position_id}-${subIndex}`}
                    className="subordinate-branch"
                  >
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
          
          {/* Дочерние отделы */}
          {node.childDepartments && node.childDepartments.length > 0 && (
            <div className="child-departments">
              <div className="child-departments-header">Дочерние отделы:</div>
              <div className="child-departments-list">
                {node.childDepartments.map((dept) => (
                  <div 
                    key={`dept-${dept.department_id}`} 
                    className="child-department-card"
                    onClick={() => {
                      // При клике на дочерний отдел создаем для него фиктивный узел и устанавливаем его как текущий
                      const deptAsPosition: Position = {
                        position_id: dept.department_id * 1000, // Используем уникальный ID для различения
                        name: `${dept.name} (отдел)`,
                        departments: [],
                        parent_positions: [],
                        children_positions: [],
                      };
                      
                      if (onPositionClick) {
                        onPositionClick(deptAsPosition.position_id);
                      }
                    }}
                  >
                    <div className="child-department-name">{dept.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Тип уже определен выше

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
  currentDepartmentId?: number | null; // Добавляем контекст текущего отдела
  showThreeLevels?: boolean; // Свойство для отображения 3 уровней иерархии
  showVacancies?: boolean; // Свойство для отображения вакансий
};

const OrganizationTree: React.FC<OrganizationTreeProps> = (props) => {
  const {
    initialPositionId = 0,
    onPositionClick,
    departmentsData,
    positionsData,
    employeesData,
    currentDepartmentId,
    showThreeLevels,
    showVacancies = false,
  } = props;
  // Загрузка данных из API (если не переданы через пропсы)
  const { data: departmentsResponse } = useQuery<{
    status: string;
    data: Department[];
  }>({
    queryKey: ["/api/departments"],
    enabled: !departmentsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const departments = departmentsData || departmentsResponse?.data || [];

  // Запрашиваем данные о иерархии должностей из новой таблицы position_position
  const { data: positionHierarchyResponse } = useQuery<{
    status: string;
    data: {
      position_relation_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number | null;
      sort: number | null;
      deleted: boolean;
      deleted_at: string | null;
    }[];
  }>({
    queryKey: ["/api/positionpositions"],
  });
  // Отфильтровываем только неудаленные связи
  const positionRelations =
    positionHierarchyResponse?.data?.filter((pr) => !pr.deleted) || [];
  const positionPositionsData = positionHierarchyResponse?.data || [];

  const { data: positionsResponse } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: ["/api/positions"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const positions = positionsData || positionsResponse?.data || [];

  const { data: employeesResponse } = useQuery<{
    status: string;
    data: Employee[];
  }>({
    queryKey: ["/api/employees"],
    enabled: !employeesData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const employees = employeesData || employeesResponse?.data || [];

  // Состояние для хранения построенного дерева
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);

  // Состояние для хранения иерархии должностей
  const [positionHierarchy, setPositionHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  // Состояние для хранения текущей выбранной должности
  const [selectedPositionId, setSelectedPositionId] = useState<
    number | undefined
  >(initialPositionId);

  // Состояние для хранения отфильтрованной иерархии должностей, когда выбрана конкретная должность
  const [filteredHierarchy, setFilteredHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  console.log("filteredHierarchy", filteredHierarchy);
  // Состояние для хранения информации о должностях с отделами (если не переданы через пропсы)
  const { data: positionsWithDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/positions/with-departments"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });

  // Используем данные о должностях с отделами из пропсов или из запроса
  const positionsWithDepartments =
    positionsData || positionsWithDepartmentsResponse?.data || [];

  // Сохраняем positionsWithDepartments в глобальном объекте для доступа из подкомпонентов
  if (typeof window !== "undefined") {
    window.positionsWithDepartmentsData = positionsWithDepartments;
  }

  // Состояние для хранения истории навигации по дереву с учетом контекста отдела
  const [navigationHistory, setNavigationHistory] = useState<
    NavigationHistoryItem[]
  >([]);

  // Состояние для хранения текущего контекста отдела
  const [currentDepartmentContext, setCurrentDepartmentContext] = useState<
    number | null
  >(null);

  // Состояния для настроек отображения
  const [localShowThreeLevels, setLocalShowThreeLevels] = useState<boolean>(Boolean(showThreeLevels));
  const [localShowVacancies, setLocalShowVacancies] = useState<boolean>(showVacancies);

  // Запрос настроек для получения количества показываемых уровней иерархии
  const { data: settingsResponse, isError } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/settings"],
    retry: false, // Не повторять запрос в случае ошибки
  });

  // Если есть ошибка с запросом настроек, просто логируем
  if (isError) {
    //  console.log("Ошибка получения настроек, используем значения по умолчанию");
  }

  // Получаем настройки из ответа или используем значение по умолчанию
  const defaultLevels = 5; // По умолчанию 5 уровней, чтобы показать более глубокую иерархию

  // Пытаемся получить настройку из ответа API
  const hierarchyInitialLevels = settingsResponse?.data
    ? settingsResponse.data.find(
        (item: any) => item.data_key === "hierarchy_initial_levels",
      )?.data_value || defaultLevels
    : defaultLevels;

  console.log("Настройки уровней иерархии:", hierarchyInitialLevels);

  // Инициализируем состояние localShowThreeLevels на основе настроек
  useEffect(() => {
    const threeLevels = Number(hierarchyInitialLevels) === 3;
    console.log("Состояние localShowThreeLevels:", threeLevels, "основано на hierarchyInitialLevels =", hierarchyInitialLevels);
    setLocalShowThreeLevels(threeLevels);
  }, [hierarchyInitialLevels]);

  // Эффект для обновления UI при изменении настройки localShowThreeLevels
  useEffect(() => {
    // Реагируем на изменение настройки отображения уровней
    //  console.log("Обновленная настройка localShowThreeLevels:", localShowThreeLevels);
  }, [localShowThreeLevels]);

  // Эффект для отслеживания изменений текущего контекста отдела
  useEffect(() => {
    console.log(
      `Текущий контекст отдела изменился на: ${currentDepartmentContext}`,
    );
  }, [currentDepartmentContext]);

  // Обработчики для изменения настроек отображения
  const handleThreeLevelsChange = (value: boolean) => {
    setLocalShowThreeLevels(value);
  };

  const handleShowVacanciesChange = (value: boolean) => {
    setLocalShowVacancies(value);
  };

  // Получение иерархии должностей для отдела с использованием новой таблицы position_position
  const getDeptPositionsHierarchy = (deptId: number) => {
    // Используем positionsWithDepartments, т.к. там уже есть связи с отделами
    const linkedPositions = positionsWithDepartments.filter(
      (p) =>
        p.departments &&
        Array.isArray(p.departments) &&
        p.departments.some((d: any) => d.department_id === deptId),
    );

    // Получаем ID должностей, привязанных к текущему отделу
    const deptPositionIds = linkedPositions.map((p) => p.position_id);

    // Фильтруем связи должностей только для текущего отдела, используя department_id из relation
    const deptPositionRelations = positionRelations
      // Только связи этого отдела (проверяем department_id)
      .filter((relation) => relation.department_id === deptId)
      // Убираем удаленные связи
      .filter((relation) => !relation.deleted)
      // Убираем дубликаты (одну и ту же пару parent-child в одном отделе)
      .filter(
        (relation, index, arr) =>
          arr.findIndex(
            (r) =>
              r.parent_position_id === relation.parent_position_id &&
              r.position_id === relation.position_id &&
              r.department_id === relation.department_id,
          ) === index,
      );

    // Добавим дополнительную проверку: выведем количество связей для отдела
    console.log(`Для отдела ${deptId} найдено ${deptPositionRelations.length} связей между должностями`);
    
    // Если для этого отдела есть связи, проверим их все
    if (deptPositionRelations.length > 0) {
      console.log(`Связи в отделе ${deptId}:`, deptPositionRelations.map(rel => 
        `${rel.parent_position_id} -> ${rel.position_id}`));
    }

    // Создаем словарь для быстрого доступа к должностям и их дочерним элементам
    const positionsMap: { [k: number]: any } = {};

    // Заполняем словарь должностями, связанными с этим отделом
    linkedPositions.forEach((p) => {
      positionsMap[p.position_id] = { ...p, children: [] };
    });

    // Также убедимся, что в словаре есть все должности из связей,
    // даже если они не были напрямую получены через positionsWithDepartments
    deptPositionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;

      // Если в словаре нет какой-то должности из связи, добавим её
      if (!positionsMap[childId]) {
        // Найдем эту должность в общем списке должностей
        const childPosition = positions.find(p => p.position_id === childId);
        if (childPosition) {
          positionsMap[childId] = { ...childPosition, children: [] };
          console.log(`Добавлена должность ${childId} в словарь отдела ${deptId}, которой не было в linkedPositions`);
        }
      }

      if (!positionsMap[parentId]) {
        // Найдем эту должность в общем списке должностей
        const parentPosition = positions.find(p => p.position_id === parentId);
        if (parentPosition) {
          positionsMap[parentId] = { ...parentPosition, children: [] };
          console.log(`Добавлена должность ${parentId} в словарь отдела ${deptId}, которой не было в linkedPositions`);
        }
      }
    });

    // Строим иерархию на основе отфильтрованных связей для этого отдела
    deptPositionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;

      // Проверяем, что обе должности существуют в нашем словаре
      if (positionsMap[childId] && positionsMap[parentId]) {
        positionsMap[parentId].children.push(positionsMap[childId]);
      }
    });

    // Фильтруем только корневые должности (те, которые не являются ни чьими дочерними)
    // Для этого находим все должности, которые не упоминаются как position_id в deptPositionRelations
    const childPositionIds = new Set(
      deptPositionRelations.map((r) => r.position_id),
    );
    const rootPositions = Object.values(positionsMap).filter(
      (p: any) => !childPositionIds.has(p.position_id),
    );

    return rootPositions;
  };

  // Функция для преобразования должности из формата hierarchyPosition в PositionHierarchyNode
  const createPositionHierarchyNode = (
    positionNode: any,
    departmentId: number,
  ): PositionHierarchyNode | null => {
    if (!positionNode || !positionNode.position_id) {
      return null;
    }

    // Проверяем, является ли должность категорией
    const isCategory = positionNode.is_category === true;

    // Ищем всех сотрудников на этой должности в этом отделе
    // Для обычных должностей используем стандартную фильтрацию
    // Для категорийных должностей учитываем поле category_parent_id
    const positionEmployees = employees.filter((e) => {
      if (isCategory) {
        // Для категорийных должностей проверяем не только позицию и отдел,
        // но и привязку к конкретной родительской должности через category_parent_id
        return (
          e.position_id === positionNode.position_id &&
          e.department_id === departmentId &&
          (e.category_parent_id === undefined || // Если поле не используется
            e.category_parent_id === null || // Если поле не заполнено
            e.category_parent_id === positionNode.parent_position_id)
        ); // Если заполнено и совпадает
      } else {
        // Для обычных должностей проверяем только позицию и отдел
        return (
          e.position_id === positionNode.position_id &&
          e.department_id === departmentId
        );
      }
    });

    // Добавляем отладочный вывод только для проблемной должности
    if (positionNode.position_id === 122) {
      console.log(`Создаем узел для должности "Ведущий специалист" (ID: 122) в отделе ${departmentId}`);
      console.log(`Найдено ${positionEmployees.length} сотрудников на этой должности в этом отделе`);
      
      if (positionEmployees.length > 0) {
        console.log("Сотрудники:", positionEmployees.map(e => e.full_name));
      }
    }

    // Найдем отдел по ID для сохранения полной информации
    const departmentInfo = departments.find(
      (d) => d.department_id === departmentId
    );

    // Создаем узел для должности
    const node: PositionHierarchyNode = {
      position: {
        position_id: positionNode.position_id,
        name: positionNode.name,
        parent_position_id: positionNode.parent_position_id,
        department_id: departmentId,
      },
      employees: positionEmployees,
      subordinates: [],
      childDepartments: [],
      // Добавляем полную информацию об отделе
      department: departmentInfo,
      // Сохраняем контекст отдела
      departmentContext: departmentId,
    };

    // Рекурсивно обрабатываем дочерние должности
    if (positionNode.children && Array.isArray(positionNode.children)) {
      positionNode.children.forEach((childPos: any) => {
        const childNode = createPositionHierarchyNode(childPos, departmentId);
        if (childNode) {
          // Добавляем контекст отдела дочерним узлам
          childNode.departmentContext = departmentId;
          node.subordinates.push(childNode);
        }
      });
    }

    return node;
  };

  // Рекурсивно ищем узел должности по ID
  // Добавлен параметр currentDepartmentId для сохранения контекста отдела
  const findPositionNodeById = (
    nodes: PositionHierarchyNode[],
    positionId: number,
    currentDepartmentId?: number | null,
  ): PositionHierarchyNode | null => {
    for (const node of nodes) {
      if (node.position.position_id === positionId) {
        // Когда находим нужную должность, создаем глубокую копию узла,
        // чтобы избежать изменения исходного объекта
        let result = JSON.parse(JSON.stringify(node));

        // Если передан ID отдела, проверяем связь с этим отделом
        if (currentDepartmentId) {
          // Проверяем связь должности с отделом
          const hasPositionDepartmentLink = positionsWithDepartments
            .find((p) => p.position_id === positionId)
            ?.departments?.some(
              (d: any) => d.department_id === currentDepartmentId,
            );

          // Если должность не связана с указанным отделом, но имеет связь с другими,
          // и у нас нет явных признаков, что она относится к указанному отделу (сотрудники, связи),
          // то это может быть неверный контекст - продолжаем поиск
          if (!hasPositionDepartmentLink) {
            // Проверяем есть ли сотрудники в этом отделе
            const hasEmployees = employees.some(
              (e) =>
                e.position_id === positionId &&
                e.department_id === currentDepartmentId &&
                !e.deleted,
            );

            // Проверяем наличие связей в positionRelations
            const hasPositionRelation = positionRelations.some(
              (rel) =>
                (rel.position_id === positionId ||
                  rel.parent_position_id === positionId) &&
                rel.department_id === currentDepartmentId &&
                !rel.deleted,
            );

            if (!hasEmployees && !hasPositionRelation) {
              // У этой должности нет связи с указанным отделом,
              // продолжаем искать другие экземпляры должности с правильным контекстом
              continue;
            }
          }

          // Добавляем информацию об отделе
          const departmentInfo = departments.find(
            (d) => d.department_id === currentDepartmentId,
          );
          if (departmentInfo) {
            result.department = departmentInfo;
          }

          // Фильтруем сотрудников только для этого отдела
          // Обновляем массив сотрудников в узле
          result.employees = employees.filter(
            (e) =>
              e.position_id === positionId &&
              e.department_id === currentDepartmentId &&
              !e.deleted, // Только не удаленные сотрудники
          );

          // Фильтруем подчиненных, которые связаны с этим отделом
          result.subordinates = result.subordinates.filter((subNode: any) => {
            const subPositionId = subNode.position.position_id;

            // Проверяем связь подчиненной должности с отделом в positionRelations
            const relation = positionRelations.find(
              (rel) =>
                rel.parent_position_id === positionId &&
                rel.position_id === subPositionId &&
                !rel.deleted,
            );

            let departmentInfoForSubordinate = null;
            if (relation) {
              // Ищем отдел по связи в positionRelations
              departmentInfoForSubordinate = departments.find(
                (d) => d.department_id === relation.department_id,
              );
            }

            if (departmentInfoForSubordinate) {
              subNode.department = departmentInfoForSubordinate; // Присваиваем подчиненному правильный отдел
              return true;
            }

            // Если связи нет, проверяем привязку через positionsWithDepartments
            const hasSubPositionDepartmentLink = positionsWithDepartments
              .find((p) => p.position_id === subPositionId)
              ?.departments?.some(
                (d: any) => d.department_id === currentDepartmentId,
              );

            if (hasSubPositionDepartmentLink) {
              subNode.department = departmentInfo; // Присваиваем текущий отдел
              return true;
            }

            // Проверяем наличие сотрудников этой должности в отделе
            return employees.some(
              (e) =>
                e.position_id === subPositionId &&
                e.department_id === currentDepartmentId &&
                !e.deleted,
            );
          });

          // Добавляем дочерние отделы для подчиненных должностей
          result.subordinates = result.subordinates.map((subNode: any) => {
            subNode.childDepartments = departments.filter(
              (d: any) => d.parent_department_id === subNode.position.department_id,
            ); // Добавляем дочерние отделы для подчиненных
            
            // Добавляем контекст текущего отдела к подчиненным позициям
            if (currentDepartmentId) {
              subNode.departmentContext = currentDepartmentId;
            }
            
            return subNode;
          });

          console.log(
            "DDEEEEBBBUUUUGGG",
            departments,
            "result.position.position_id=>" + result.position.position_id,
          );

          result.childDepartments = departments.filter(
            (d) => d.parent_position_id === result.position.position_id,
          );

          console.log("result.childDepartments", result.childDepartments);
        }

        return result;
      }
      if (node.subordinates.length > 0) {
        const found = findPositionNodeById(
          node.subordinates,
          positionId,
          currentDepartmentId,
        );

        if (found) {
          console.log("found", found);
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
    allEmployees: Employee[],
  ): number => {
    // Находим непосредственных детей - отделы, которые привязаны к должностям в этом отделе
    const departmentPositions = allPositions.filter((pos) =>
      // Позиции, которые связаны с сотрудниками в этом отделе
      allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      ),
    );

    // Находим отделы, которые привязаны к этому отделу
    const children = allDepartments.filter(
      (d) => d.parent_department_id === department.department_id,
    );

    // Считаем количество позиций в текущем отделе
    const departmentPositionCount = allPositions.filter((pos) => {
      // Проверяем, есть ли сотрудники с этой позицией в этом отделе
      const hasEmployeesInDepartment = allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      );

      // Проверяем, имеет ли позиция прямую связь с отделом
      const isDirectlyLinkedToThisDepartment =
        pos.department_id === department.department_id;

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
      (sum, child) =>
        sum +
        calculateChildCount(child, allDepartments, allPositions, allEmployees),
      positionCount,
    );
  };

  // Рекурсивно строим дерево отделов
  const buildDepartmentTree = (
    parentId: number | null,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
    totalElements: number,
  ): DepartmentNode[] => {
    // Находим отделы либо без родительской должности (корневые), либо с заданной родительской должностью
    const departmentsAtLevel =
      parentId === null
        ? allDepartments.filter((d) => d.parent_department_id === null)
        : allDepartments.filter((d) => {
            // Находим все позиции в отделе с parentId
            const departmentPositions = allPositions.filter((pos) => {
              // Позиция непосредственно привязана к отделу
              const isDirectlyLinkedToThisDepartment =
                pos.department_id === parentId;

              // Позиция связана с сотрудником в этом отделе
              const hasEmployeesInDepartment = allEmployees.some(
                (emp) =>
                  emp.position_id === pos.position_id &&
                  emp.department_id === parentId,
              );

              return (
                isDirectlyLinkedToThisDepartment || hasEmployeesInDepartment
              );
            });

            // Отдел привязан к родительскому отделу
            return d.parent_department_id === parentId;
          });

    // Вычисляем childCount для каждого отдела
    const departmentsWithCounts = departmentsAtLevel.map((dept) => {
      const childCount = calculateChildCount(
        dept,
        allDepartments,
        allPositions,
        allEmployees,
      );
      return { ...dept, childCount };
    });

    // Вычисляем общее количество дочерних элементов на этом уровне
    const totalChildCount = departmentsWithCounts.reduce(
      (sum, dept) => sum + dept.childCount,
      0,
    );

    return departmentsWithCounts.map((dept) => {
      // Получаем позиции для этого отдела
      // Сначала проверяем, есть ли у нас API для получения позиций отдела
      // Если нет, используем логику определения по сотрудникам

      // Нужно получить все позиции, которые привязаны к этому отделу
      // даже если у них нет сотрудников
      // Поэтому нам нужно запросить связь position-department из API

      // Пока используем следующую логику:
      // Все позиции, где есть сотрудники в этом отделе
      const positionsWithEmployees = allPositions.filter((pos) => {
        return allEmployees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === dept.department_id,
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
      let width =
        totalChildCount === 0 ? 100 : (dept.childCount / totalChildCount) * 100;

      // Если элементов слишком много, ограничиваем минимальную ширину
      if (width < 5) width = 5;

      // Рекурсивно строим дочерние элементы
      const children = buildDepartmentTree(
        dept.department_id,
        allDepartments,
        allPositions,
        allEmployees,
        dept.childCount,
      );

      return {
        ...dept,
        positions: departmentPositions,
        children,
        width,
        childCount: dept.childCount,
      };
    });
  };

  // Функция для построения иерархии должностей на основе новой таблицы position_position
  const buildPositionHierarchy = () => {
    if (positions.length === 0) {
      return [];
    }

    // Используем глобальный доступ к positionsWithDepartmentsData
    const positionsWithDepartments = window.positionsWithDepartmentsData || [];

    // console.log(
    //   "Построение иерархии должностей из",
    //   positions.length,
    //   "должностей",
    // );
    // console.log("Должности с отделами:", positionsWithDepartments.length);

    // Загружаем данные о связях должностей ��з positionHierarchyResponse,
    // который загружается на уровне компонента через хук useQuery
    // Важно: этот запрос уже выполнен на уровне компонента
    const hierarchyRelations =
      positionHierarchyResponse?.data?.filter((pr) => !pr.deleted) || [];

    // Выводим отладочную информацию для проверки связей
    positions.forEach((position) => {
      if (position.parent_position_id) {
        // console.log(
        //   `Должность "${position.name}" (ID: ${position.position_id}) имеет родительскую должность с ID: ${position.parent_position_id}`,
        // );
      }

      if (position.is_category) {
        // console.log(
        //   `КАТЕГОРИЯ: "${position.name}" (ID: ${position.position_id})`,
        // );

        // Найдем все связи для этой категории
        const categoryRelations = hierarchyRelations.filter(
          (rel) => rel.position_id === position.position_id,
        );

        if (categoryRelations.length > 0) {
          // console.log(
          //   `Найдено ${categoryRelations.length} родительских должностей для категории "${position.name}":`,
          //   categoryRelations.map((rel) => {
          //     const parentPos = positions.find(
          //       (p) => p.position_id === rel.parent_position_id,
          //     );
          //     return {
          //       parent_id: rel.parent_position_id,
          //       parent_name: parentPos ? parentPos.name : "Неизвестно",
          //       department_id: rel.department_id,
          //     };
          //   }),
          // );
        } else {
          // console.log(
          //   `Категория "${position.name}" не имеет родительских должностей`,
          // );
        }
      }
    });

    // В функциях нельзя использовать хуки, поэтому используем positionsWithDepartments
    // для получения информации о связях должностей и отделов

    // Сначала создаем узлы для всех должностей
    const positionNodes: Record<number, PositionHierarchyNode> = {};

    // Создаем узлы для всех должностей с правильными связями с отделами
    positions.forEach((position) => {
      // Находим актуальную информацию о должности из positionsWithDepartmentsData
      const positionWithDepts =
        positionsWithDepartments.find(
          (p) => p.position_id === position.position_id,
        ) || position;

      // Проверяем, является ли должность категорией
      const isCategory = position.is_category === true;

      // Находим сотрудников на этой должности
      const positionEmployees = employees.filter((emp) => {
        if (isCategory) {
          // Для категорийных должностей учитываем поле category_parent_id
          return (
            emp.position_id === position.position_id &&
            (emp.category_parent_id === undefined ||
              emp.category_parent_id === null ||
              emp.category_parent_id === position.position_id || // Если категория сама является "родителем"
              emp.category_parent_id === position.parent_position_id)
          ); // Если категория имеет родителя
        } else {
          // Для обычных должностей фильтруем только по position_id
          return emp.position_id === position.position_id;
        }
      });

      // Если position.departments нет, а в positionWithDepts есть, используем его
      const positionData = {
        ...position,
        departments: positionWithDepts.departments || [],
      };

      positionNodes[position.position_id] = {
        position: positionData,
        employees: positionEmployees,
        subordinates: [],
        childDepartments: [],
      };
    });

    // Используем данные о связях должностей, полученные выше
    // Это исправляет проблему с вызовом useQuery внутри функции

    // console.log(
    //   `Загружено ${hierarchyRelations.length} связей позиций из position_positions`,
    // );

    // Создаем множество для отслеживания дочерних должностей
    const childPositions = new Set<number>();

    // Строим иерархию на основе position_position
    hierarchyRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      const deptId = relation.department_id;

      // Специальный лог для отслеживания связи между Начальником управления и Ведущим специалистом
      if (parentId === 121 && childId === 122) {
        console.log(`НАЙДЕНА СВЯЗЬ: Начальник управления (ID: 121) -> Ведущий специалист (ID: 122) в отделе ${deptId}`);
      }

      // Находим родительскую должность
      const parentNode = positionNodes[parentId];
      // Находим узел текущей должности
      const currentNode = positionNodes[childId];

      if (parentNode && currentNode) {
        // Для связи Начальник управления -> Ведущий специалист добавляем подробный лог
        if (parentId === 121 && childId === 122) {
          console.log("ПОСТРОЕНИЕ ИЕРАРХИИ для Начальник управления -> Ведущий специалист:");
          console.log("  parentNode:", parentNode.position.name, "ID:", parentNode.position.position_id);
          console.log("  currentNode:", currentNode.position.name, "ID:", currentNode.position.position_id);
        }

        // Добавляем текущую должность как подчиненную к родительской
        // Проверяем, не добавлен ли уже этот узел
        if (
          !parentNode.subordinates.some(
            (sub) =>
              sub.position.position_id === currentNode.position.position_id,
          )
        ) {
          // Клонируем узел, чтобы не было ссылок на один и тот же объект
          const clonedNode = JSON.parse(JSON.stringify(currentNode));
          
          // Устанавливаем контекст отдела для узла, чтобы можно было фильтровать по отделу
          clonedNode.departmentContext = deptId;
          
          parentNode.subordinates.push(clonedNode);
          
          // Помечаем, что это дочерняя должность
          childPositions.add(childId);
          
          // Специальный лог для связи Начальник управления -> Ведущий специалист
          if (parentId === 121 && childId === 122) {
            console.log(`СОЗДАНА СВЯЗЬ в иерархии: "${currentNode.position.name}" (ID: ${childId}) подчиняется "${parentNode.position.name}" (ID: ${parentId}) в отделе ${deptId}`);
          }
        }
      } else {
        // Специальный лог для отладки, если не найдены узлы
        if (parentId === 121 && childId === 122) {
          console.log(`ОШИБКА: Не найдена родительская или дочерняя должность для связи: childId=${childId}, parentId=${parentId}, deptId=${deptId}`);
          console.log(`  parentNode существует: ${!!parentNode}`);
          console.log(`  currentNode существует: ${!!currentNode}`);
        }
      }
    });

    // Добавляем связь отделов и должностей
    departments.forEach((department) => {
      if (department.parent_position_id) {
        const parentNode = positionNodes[department.parent_position_id];
        if (parentNode) {
          // Добавляем отдел как дочерний для должности
          if (!parentNode.childDepartments) {
            parentNode.childDepartments = [];
          }

          // Проверяем, не добавлен ли отдел уже
          if (
            !parentNode.childDepartments.some(
              (d) => d.department_id === department.department_id,
            )
          ) {
            parentNode.childDepartments.push(department);
            // console.log(
            //   `Добавлен отдел "${department.name}" (ID: ${department.department_id}) как дочерний для должности "${parentNode.position.name}"`,
            // );
          }
        }
      }
    });

    // Дополнительно обрабатываем связи между должностями и отделами
    positionsWithDepartments.forEach((pos) => {
      if (pos.departments && Array.isArray(pos.departments)) {
        // Находим узел должности
        const positionNode = positionNodes[pos.position_id];
        if (positionNode) {
          // Для каждого отдела, связанного с должнос.�ью
          pos.departments.forEach((dept: any) => {
            // Находим соответствующий отдел
            const department = departments.find(
              (d) => d.department_id === dept.department_id,
            );
            if (department) {
              // Находим сотрудников в этом отделе для этой должности
              const deptEmployees = employees.filter(
                (e) =>
                  e.position_id === pos.position_id &&
                  e.department_id === dept.department_id,
              );

              if (deptEmployees.length > 0) {
                // Обновляем информацию о сотрудниках для этой должности, если связь с этим отделом
                // Добавляем сотрудников к существующему массиву
                deptEmployees.forEach((deptEmployee) => {
                  // Проверяем, не добавлен ли уже этот сотрудник
                  if (
                    !positionNode.employees.some(
                      (e) => e.employee_id === deptEmployee.employee_id,
                    )
                  ) {
                    positionNode.employees.push(deptEmployee);
                    // console.log(
                    //   `Привязан сотрудник "${deptEmployee.full_name}" к должности "${pos.name}" в отделе "${department.name}"`,
                    // );
                  }
                });
              }
            }
          });
        }
      }
    });

    // Добавляем должности, связанные с отделами через position_department
    // Используем информацию о связях из positionsWithDepartments
    positionsWithDepartments.forEach((position: any) => {
      if (position.departments && Array.isArray(position.departments)) {
        position.departments.forEach((dept: any) => {
          const positionId = position.position_id;
          const departmentId = dept.department_id;
          const positionNode = positionNodes[positionId];

          if (!positionNode) return; // Если должность не найдена

          // Находим отдел
          const department = departments.find(
            (d) => d.department_id === departmentId,
          );
          if (!department) return; // Если отдел не найден

          // Если у отдела есть parent_position_id, то это означает, что им управляет должность
          if (department.parent_position_id) {
            const managerNode = positionNodes[department.parent_position_id];

            // Если нашли управляющую должность и эта должность еще не в подчинении
            if (
              managerNode &&
              !managerNode.subordinates.some(
                (sub) => sub.position.position_id === positionId,
              )
            ) {
              // console.log(
              //   `Добавляем должность ${positionNode.position.name} (ID: ${positionId}) как подчиненную к ${managerNode.position.name} (ID: ${department.parent_position_id}) через отдел ${department.name} (ID: ${departmentId})`,
              // );
              managerNode.subordinates.push(positionNode);
            }
          }
        });
      }
    });

    // Дополнительно учитываем manager_id для сотрудников без parent_position_id
    // Это резервная логика, если parent_position_id не указан
    employees.forEach((employee) => {
      // Проверяем, что у сотрудника есть позиция и менеджер
      if (employee.manager_id !== null && employee.position_id !== null) {
        // Находим менеджера
        const manager = employees.find(
          (emp) => emp.employee_id === employee.manager_id,
        );
        if (manager && manager.position_id !== null) {
          // Находим узел должности сотрудника
          const employeeNode = positionNodes[employee.position_id];
          // Находим узел должности менеджера
          const managerNode = positionNodes[manager.position_id];

          // Проверяем, что должность сотрудника еще не является подчиненной какой-либо должности
          // через parent_position_id
          const isAlreadySubordinate = positions.some(
            (p) =>
              p.position_id === employee.position_id &&
              p.parent_position_id !== null,
          );

          if (employeeNode && managerNode && !isAlreadySubordinate) {
            // Добавляем должность сотрудника как подчиненную к должности менеджера
            // только если еще не была добавлена через parent_position_id
            if (
              !managerNode.subordinates.some(
                (sub: PositionHierarchyNode) =>
                  sub.position.position_id ===
                  employeeNode.position.position_id,
              )
            ) {
              managerNode.subordinates.push(employeeNode);
            }
          }
        }
      }
    });

    // Находим корневые узлы, используя собранный set childPositions
    const rootNodes: PositionHierarchyNode[] = [];

    // Получаем информацию о том, какие позиции должны быть на корневом уровне
    // На корневом уровне должны быть позиции, у которых is_subordinate = false
    // из данных API (это указывается в `/api/positions/with-departments`)

    // Проходим по всем узлам и проверяем, не являются ли они дочерними
    Object.entries(positionNodes).forEach(([positionId, node]) => {
      // Находим расширенную информацию о позиции из API
      const posWithDeptInfo = positionsWithDepartments.find(
        (p) => p.position_id === parseInt(positionId),
      );

      // Проверяем, является ли позиция дочерней (подчиненной) на основе данных из API
      const isSubordinate = posWithDeptInfo?.is_subordinate === true;

      // Если позиция не подчиненная (не имеет родителей в position_position), то это корневая позиция
      if (!isSubordinate) {
        rootNodes.push(node);
        // console.log(
        //   `Добавлена корневая должность: "${node.position.name}" (ID: ${positionId}) с ${node.subordinates.length} подчиненными`,
        // );
      } else {
        // console.log(
        //   `Должность "${node.position.name}" (ID: ${positionId}) НЕ добавлена как корневая, потому что является подчиненной`,
        // );
      }
    });

    // Обрабатываем позиции, для которых связи не образовались по стандартным алгоритмам
    // console.log(
    //   "Проверяем корректность построенных связей на основе связей position_positions...",
    // );

    // Проходим по всем позициям и убеждаемся, что их parent_position_id правильно отображен в иерархии
    hierarchyRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;

      // Пропускаем уже обработанные связи
      if (childPositions.has(childId)) {
        return;
      }

      // Получаем узлы для проверки
      const childNode = positionNodes[childId];
      const parentNode = positionNodes[parentId];

      if (childNode && parentNode) {
        // Проверяем, что дочерняя позиция не является уже подчинённой родительской
        const isAlreadySubordinate = parentNode.subordinates.some(
          (sub) => sub.position.position_id === childId,
        );

        if (!isAlreadySubordinate) {
          // console.log(
          //   `Добавляем связь из иерархии: "${childNode.position.name}" (ID: ${childId}) подчиняется "${parentNode.position.name}" (ID: ${parentId}) в отделе ${relation.department_id}`,
          // );

          // Добавляем связь
          parentNode.subordinates.push(childNode);
          childPositions.add(childId);

          // Удаляем из корневых узлов, если там есть
          const childNodeIndex = rootNodes.findIndex(
            (node) => node.position.position_id === childId,
          );
          if (childNodeIndex !== -1) {
            rootNodes.splice(childNodeIndex, 1);
          }

          // И удаляем из подчинённых других узлов (если есть)
          Object.values(positionNodes).forEach((node) => {
            if (node.position.position_id !== parentId) {
              const subIndex = node.subordinates.findIndex(
                (sub) => sub.position.position_id === childId,
              );
              if (subIndex !== -1) {
                // console.log(
                //   `Удаляем позицию "${childNode.position.name}" из подчинённых позиции "${node.position.name}", так как она должна быть подчинена "${parentNode.position.name}"`,
                // );
                node.subordinates.splice(subIndex, 1);
              }
            }
          });
        }
      }
    });

    //  console.log(`Построено ${rootNodes.length} корневых узлов`);

    // Сортируем подчиненные должности для каждого узла по полю sort
    Object.values(positionNodes).forEach((node) => {
      // Сортируем подчиненных по полю sort
      if (node.subordinates.length > 0) {
        node.subordinates.sort((a, b) => {
          // Если sort отсутствует, считаем его равным 0
          const aSort = a.position.sort ?? 0;
          const bSort = b.position.sort ?? 0;

          // Сортировка по полю sort
          return aSort - bSort;
        });
      }
    });

    // Выводим информацию о корневых узлах
    rootNodes.forEach((node) => {
      // console.log(
      //   `Корневой узел: "${node.position.name}" (ID: ${node.position.position_id}) с ${node.subordinates.length} подчиненными`,
      // );
      // Выводим информацию о подчиненных
      if (node.subordinates.length > 0) {
        node.subordinates.forEach((sub) => {
          // console.log(
          //   `- Подчиненный: "${sub.position.name}" (ID: ${sub.position.position_id}), родительская должность: ${sub.position.parent_position_id}, sort: ${sub.position.sort}`,
          // );
        });
      }
    });

    return rootNodes;
  };

  const attachAllChildDepartmentsRecursively = (
    node: PositionHierarchyNode,
  ) => {
    const childDepts = departments.filter(
      (d) => d.parent_position_id === node.position.position_id,
    );

    childDepts.forEach((dept) => {
      const deptAsPosition: Position = {
        position_id: dept.department_id * 1000,
        name: dept.name + " (отдел)",
        parent_position_id: node.position.position_id,
        department_id: dept.department_id,
      };

      const deptNode: PositionHierarchyNode = {
        position: deptAsPosition,
        employees: [],
        subordinates: [],
        childDepartments: [],
        department: dept,
      };

      // загрузить иерархию должностей отдела
      const deptPositions = getDeptPositionsHierarchy(dept.department_id);
      deptPositions.forEach((posNode) => {
        const child = createPositionHierarchyNode(posNode, dept.department_id);
        if (child) deptNode.subordinates.push(child);
      });

      // Рекурсивно углубляемся дальше
      attachAllChildDepartmentsRecursively(deptNode);

      // Добавляем отдел в текущий узел
      if (
        !node.subordinates.some(
          (n) => n.position.position_id === deptNode.position.position_id,
        )
      ) {
        node.subordinates.push(deptNode);
      }
    });

    // Сортируем подчиненных по полю sort
    if (node.subordinates.length > 0) {
      node.subordinates.sort((a, b) => {
        // Если sort отсутствует, считаем его равным 0
        const aSort = a.position.sort ?? 0;
        const bSort = b.position.sort ?? 0;

        // Сортировка по полю sort
        return aSort - bSort;
      });
    }

    // Рекурсивно обходим всех subordinates
    node.subordinates.forEach((childNode) => {
      attachAllChildDepartmentsRecursively(childNode);
    });
  };

  const buildRootDepartmentHierarchy = () => {
    if (positions.length === 0 || departments.length === 0) {
      //  console.error("Нет данных о должностях или отделах");
      return [];
    }

    const rootDepartment = departments.find(
      (dept) =>
        dept.parent_department_id === null && dept.parent_position_id === null,
    );

    if (!rootDepartment) {
      //console.error("Корневой отдел не найден");
      return [];
    }

    console.log(
      "Данные о связях position_position:",
      positionPositionsData
        ? `получено ${positionPositionsData.length} связей`
        : "отсутствуют",
    );

    const hierarchyLinks =
      positionPositionsData?.filter((link: any) => {
        const hasParentPosition = link.parent_position_id !== null;
        const hasDepartment = link.department_id !== null;

        if (hasParentPosition && hasDepartment) return true;
        if (hasParentPosition && !hasDepartment) return true;
        if (!hasParentPosition && hasDepartment) return false;

        return false;
      }) || [];

    // Создаем мапу с должностями по ID для быстрого доступа
    const positionMap: Record<number, PositionHierarchyNode> = {};

    // Создание множества подчинённых должностей
    const childPositionIds = new Set<number>();
    hierarchyLinks.forEach((link: any) => {
      childPositionIds.add(link.position_id);
    });

    hierarchyLinks.forEach((link: any) => {
      const parentId = link.parent_position_id;
      const childId = link.position_id;

      if (positionMap[parentId] && positionMap[childId]) {
        positionMap[parentId].subordinates.push(positionMap[childId]);
      }
    });

    // Логируем активные связи position_position
    // console.log(
    //   "Активные связи position_position:",
    //   hierarchyLinks.map(
    //     (link: any) =>
    //       `Должность ID ${link.position_id} подчиняется должности ID ${link.parent_position_id}`,
    //   ),
    // );
    //
    // console.log("Найден корневой отдел:", rootDepartment);

    // Шаг 1: Находим все должности корневого отдела
    let adminPositions = [];

    // Сначала проверим positions с отделами (из /api/positions/with-departments)
    if (positionsWithDepartments && positionsWithDepartments.length > 0) {
      adminPositions = positionsWithDepartments.filter((pos) => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        return (
          pos.departments &&
          Array.isArray(pos.departments) &&
          pos.departments.some(
            (d: any) => d.department_id === rootDepartment.department_id,
          )
        );
      });
    }

    // Если мы не нашли должности через positionsWithDepartments, используем резервную логику
    if (adminPositions.length === 0) {
      adminPositions = positions.filter((pos) => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        // через сотрудников, назначенных на эту должность в этом отделе
        return employees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === rootDepartment.department_id,
        );
      });
    }

    // console.log(
    //   "Должности корневого отдела:",
    //   adminPositions.map((p) => `${p.name} (ID: ${p.position_id})`),
    // );

    // Создаем мапу с должностями по ID для быстрого доступа
    const positionMapRoot: Record<number, PositionHierarchyNode> = {};

    // Инициализация узлов для всех должностей корневого отдела
    adminPositions.forEach((position) => {
      // Находим всех сотрудников для этой должности в корневом отделе
      const positionEmployees = employees.filter(
        (emp) =>
          emp.position_id === position.position_id &&
          emp.department_id === rootDepartment.department_id,
      );

      // Создаем новый i�зел-должность
      positionMapRoot[position.position_id] = {
        position,
        employees: positionEmployees,
        subordinates: [],
        childDepartments: [],
      };

      // Находим дочерние отделы, связанные с этой должностью
      const childDepartments = departments.filter(
        (dept) => dept.parent_position_id === position.position_id,
      );

      // Выводим для отладки информацию о дочерних отделах
      if (childDepartments.length > 0) {
        // console.log(
        //   `Должность "${position.name}" (ID: ${position.position_id}) имеет дочерние отделы:`,
        //   childDepartments.map(
        //     (dept) => `${dept.name} (ID: ${dept.department_id})`,
        //   ),
        // );

        // Для каждого дочернего отдела создаем узел-отдел
        childDepartments.forEach((department) => {
          // Находим должности этого отдела
          // Используем positionsWithDepartments для поиска должностей, связанных с отделом
          let deptPositions = [];

          // Поиск должностей для отдела в positionsWithDepartments
          // console.log(
          //   `Обрабатываем отдел "${department.name}" (ID=${department.department_id})`,
          // );

          // Получаем должности для конкретного отдела с учетом связей
          deptPositions = getDeptPositionsHierarchy(department.department_id);

          // Создаем псевдо-должность для отдела
          const deptAsPosition: Position = {
            position_id: department.department_id * 1000, // Уникальный ID
            name: department.name + " (отдел)",
            parent_position_id: position.position_id,
            department_id: department.department_id,
          };

          // Создаем узел для отдела в виде должности
          const departmentNode: PositionHierarchyNode = {
            position: deptAsPosition,
            employees: [], // У отдела нет сотрудников
            subordinates: [],
            childDepartments: [], // Нет дочерних отделов у этого узла
            department: department, // Добавляем информацию об отделе, включая is_organization
          };

          deptPositions.forEach((posNode) => {
            const child = createPositionHierarchyNode(
              posNode,
              department.department_id,
            );
            if (child) departmentNode.subordinates.push(child);
          });

          // Находим дочерние отделы для текущего отдела (рекурсивно)
          const childDeptDepartments = departments.filter(
            (d) => d.parent_department_id === department.department_id,
          );

          if (childDeptDepartments.length > 0) {
            // console.log(
            //   `Отдел "${department.name}" (ID: ${department.department_id}) имеет дочерние отделы:`,
            //   childDeptDepartments.map(
            //     (d) => `${d.name} (ID: ${d.department_id})`,
            //   ),
            // );

            // Для каждого дочернего отдела создаем узел-отдел
            childDeptDepartments.forEach((childDept) => {
              // Создаем псевдо-должность для дочернего отдела
              const childDeptAsPosition: Position = {
                position_id: childDept.department_id * 1000, // Уникальный ID
                name: childDept.name + " (отдел)",
                parent_position_id: deptAsPosition.position_id, // Связываем с родительским отделом
                department_id: childDept.department_id,
              };

              // Создаем узел для дочернего отдела
              const childDeptNode: PositionHierarchyNode = {
                position: childDeptAsPosition,
                employees: [], // У отдела нет сотрудников
                subordinates: [],
                childDepartments: [], // У дочернего отдела пока нет отделов
                department: childDept, // Добавляем информацию об отделе, включая is_organization
              };

              // Общая обработка для всех отделов - строим полную иерархию должностей
              // по аналогии с OrganizationStructure.tsx
              // console.log(
              //   `Обрабатываем отдел "${childDept.name}" (ID=${childDept.department_id})`,
              // );

              // Получаем должности для этого отдела
              const deptPositionsHierarchy = getDeptPositionsHierarchy(
                childDept.department_id,
              );

              if (deptPositionsHierarchy.length > 0) {
                // console.log(
                //   `Найдено ${deptPositionsHierarchy.length} корневых должностей для отдела 3 "${childDept.name}"`,
                // );

                // Добавляем должности в отдел с сохранением иерархии
                deptPositionsHierarchy.forEach((positionNode) => {
                  // Преобразуем иерархию должностей в формат PositionHierarchyNode
                  const rootNode = createPositionHierarchyNode(
                    positionNode,
                    childDept.department_id,
                  );
                  if (rootNode) {
                    childDeptNode.subordinates.push(rootNode);
                  }
                });
              } else {
                // console.log(
                //   `Не найдено должностей для отдела "${childDept.name}"`,
                // );
              }

              // Добавляем дочерний отдел как подчиненный к текущему отделу
              departmentNode.subordinates.push(childDeptNode);
            });
          }

          // Добавляем отдел как подчиненный элемент к должности-родителю
          positionMapRoot[position.position_id].subordinates.push(
            departmentNode,
          );
        });
      }
    });

    // Список корневых должностей (пока пустой)
    const rootNodes: PositionHierarchyNode[] = [];

    // Сначала добавляем все должности в список корневых узлов
    // Затем на основе данных из position_position будем перемещать их в подчиненные
    adminPositions.forEach((position) => {
      const currentNode = positionMapRoot[position.position_id];
      rootNodes.push(currentNode);
    });

    hierarchyLinks.forEach((link: any) => {
      const childId = link.position_id;
      const parentId = link.parent_position_id;

      if (positionMapRoot[childId] && positionMapRoot[parentId]) {
        const childIndex = rootNodes.findIndex(
          (node) => node.position.position_id === childId,
        );

        if (childIndex !== -1) {
          const childNode = rootNodes.splice(childIndex, 1)[0];
          positionMapRoot[parentId].subordinates.push(childNode);
        }
      }
    });

    // Если все еще остались позиции с parent_position_id, которые не были обработаны через position_position,
    // обрабатываем их
    adminPositions.forEach((position) => {
      // Пропускаем позиции, которые уже были перемещены на основе position_position
      if (childPositionIds.has(position.position_id)) {
        return;
      }

      // Обрабатываем стандартную связь parent_position_id -> position_id
      if (
        position.parent_position_id &&
        positionMapRoot[position.parent_position_id]
      ) {
        const childIndex = rootNodes.findIndex(
          (node) => node.position.position_id === position.position_id,
        );

        if (childIndex !== -1) {
          const childNode = rootNodes.splice(childIndex, 1)[0];
          positionMapRoot[position.parent_position_id].subordinates.push(
            childNode,
          );
          // console.log(
          //   `СТАНДАРТНАЯ СВЯЗЬ: ${position.position_id} -> ${position.parent_position_id}`,
          // );
        }
      }
    });

    // Проверяем, что все связи position_positions корректно применены
    // Используем данные от уже существующего запроса
    // Если данные о связях есть и есть корневые ноды
    if (positionPositionsData && rootNodes.length > 0) {
      // Получаем только актуальные связи (не удаленные)
      const positionPositions = positionPositionsData.filter(
        (pp) => !pp.deleted,
      );

      // Обрабатываем каждую связь между должностями
      positionPositions.forEach((pp) => {
        const childId = pp.position_id;
        const parentId = pp.parent_position_id;

        // Находим узлы, соответствующие связи
        const childNode = rootNodes.find(
          (node) => node.position.position_id === childId,
        );
        const parentNode = rootNodes.find(
          (node) => node.position.position_id === parentId,
        );

        // Если оба узла найдены в корневых, то перемещаем дочерний под родительский
        if (childNode && parentNode) {
          const childIndex = rootNodes.findIndex(
            (node) => node.position.position_id === childId,
          );

          if (childIndex !== -1) {
            // console.log(
            //   `Применяем связь из API: "${childNode.position.name}" -> "${parentNode.position.name}"`,
            // );
            const childNodeObj = rootNodes.splice(childIndex, 1)[0];
            parentNode.subordinates.push(childNodeObj);
          }
        }
      });
    }
    rootNodes.forEach((node) => {
      attachAllChildDepartmentsRecursively(node);
    });
    // console.log("Построено", rootNodes.length, "корневых узлов");

    return rootNodes;
  };

  // Обработчик клика по должности
  const handlePositionClick = (
    positionId: number,
    departmentContext?: number | null,
  ) => {
    console.log(
      `Клик по должности с ID: ${positionId}, контекст отдела: ${departmentContext || "не указан"}`,
    );

    // Специальная обработка для должности "Начальник управления" (ID: 121) в отделе 5
    if (positionId === 121 && departmentContext === 5) {
      console.log("Переход к должности 'Начальник управления' в отделе 'Управление цифровизации и градостроительных данных'");
    }

    // Если передан контекст отдела, сохраняем его
    if (departmentContext) {
      setCurrentDepartmentContext(departmentContext);
      console.log(`Сохранен контекст отдела: ${departmentContext}`);
    }

    // Если текущая позиция выбрана, добавляем её в историю перед переходом на новую
    if (selectedPositionId) {
      // При сохранении в историю также сохраняем текущий контекст отдела
      setNavigationHistory((prev) => [
        ...prev,
        {
          positionId: selectedPositionId,
          departmentId: currentDepartmentContext,
        },
      ]);
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
      const prevItem = navigationHistory[navigationHistory.length - 1];
      console.log(
        `Возвращаемся к позиции: ID=${prevItem.positionId}, отдел=${prevItem.departmentId}`,
      );

      // Убираем её из истории
      setNavigationHistory((prev) => prev.slice(0, -1));

      // Устанавливаем контекст отдела из истории
      if (prevItem.departmentId) {
        setCurrentDepartmentContext(prevItem.departmentId);
      }

      // Устанавливаем как текущую позицию
      const positionId = prevItem.positionId;
      setSelectedPositionId(positionId);

      if (onPositionClick) {
        onPositionClick(positionId);
      }
    } else {
      // Если история пуста, возвращаемся к корню
      console.log("История пуста, возвращаемся к корню");
      setSelectedPositionId(undefined);
      setCurrentDepartmentContext(null);

      if (onPositionClick) {
        onPositionClick(0);
      }
    }
  };

  // Строим дерево, когда данные загружены
  useEffect(() => {
    // Проверка всех необходимых данных
    const hasAllData =
      departments.length > 0 &&
      (positions.length > 0 || positionsWithDepartments.length > 0);

    if (hasAllData) {
      // Вычисляем данные для построения дерева только 1 раз, когда все загружено

      // Находим корневые отделы (без родительской должности)
      const rootDepartments = departments.filter(
        (d) => d.parent_department_id === null,
      );

      // Вычисляем общe�е количество элементов для масштабирования
      const totalElements = rootDepartments.reduce(
        (sum, dept) =>
          sum + calculateChildCount(dept, departments, positions, employees),
        0,
      );

      // Строим дерево отделов
      const tree = buildDepartmentTree(
        null,
        departments,
        positions,
        employees,
        totalElements,
      );
      setDepartmentTree(tree);

      // Строим иерархию должностей для корневого отдела
      const rootDepartmentHierarchy = buildRootDepartmentHierarchy();
      if (rootDepartmentHierarchy && rootDepartmentHierarchy.length > 0) {
        setPositionHierarchy(rootDepartmentHierarchy);
      } else {
        // Резервный вариант - строим на основе manager_id
        const hierarchy = buildPositionHierarchy();
        setPositionHierarchy(hierarchy);
      }
    }
    // зависимость от стабильных "снимков" данных, чтобы избежать повторных рендеров
  }, [
    departments.length,
    positions.length,
    positionsWithDepartments.length,
    positionRelations.length,
    employees.length,
  ]);

  // Фильтруем иерархию при изменении выбранной должности
  useEffect(() => {
    if (!selectedPositionId || positionHierarchy.length === 0) {
      // Если нет выбранной должности, показываем все должности корневого отдела
      // Это будут корневые узлы, полученные из функции buildRootDepartmentHierarchy
      setFilteredHierarchy(positionHierarchy);
      return;
    }

    // Находим выбранную должность в иерархии и сохраняем контекст отдела
    let selectedNode: PositionHierarchyNode | null = null;

    // Определяем текущий отдел, из которого мы пришли - по информации из локального состояния
    // Можно также использовать URL-параметры или другие механизмы для сохранения контекста

    // Попытка найти департамент для выбранной должности
    let currentDepartmentId: number | null = null;

    // 0. Приоритет отдаем сохраненному контексту отдела
    if (currentDepartmentContext) {
      // Проверяем, что должность действительно связана с этим отделом
      // через position_department, position_position или через сотрудников

      // Проверяем связь с отделом через position_department
      const hasPositionDepartmentLink = positionsWithDepartments
        .find((p) => p.position_id === selectedPositionId)
        ?.departments?.some(
          (d: any) => d.department_id === currentDepartmentContext,
        );

      // Проверяем связь с отделом через position_position
      const hasPositionRelation = positionRelations.some(
        (rel) =>
          (rel.position_id === selectedPositionId ||
            rel.parent_position_id === selectedPositionId) &&
          rel.department_id === currentDepartmentContext &&
          !rel.deleted,
      );

      // Проверяем наличие сотрудников в этом отделе
      const hasEmployees = employees.some(
        (e) =>
          e.position_id === selectedPositionId &&
          e.department_id === currentDepartmentContext &&
          !e.deleted,
      );

      // Если должность связана с сохраненным контекстом, используем его
      if (hasPositionDepartmentLink || hasPositionRelation || hasEmployees) {
        currentDepartmentId = currentDepartmentContext;
        console.log(
          `Используем сохраненный контекст отдела: ${currentDepartmentId}`,
        );
      }
    }

    // Если контекст не был найден через сохраненное значение, продолжаем поиск
    if (!currentDepartmentId) {
      // 1. Пытаемся найти сотрудника для этой должности
      // Важно: для позиции "Начальник управления" (ID=44) проверяем контекст department_id
      let employeeForPosition;

      // Для позиции "Начальник управления" (ID=44) или других проблемных позиций
      // используем специальную логику, чтобы выбрать сотрудника из правильного отдела
      if (selectedPositionId === 44) {
        // Для "Начальник управления" ищем сотрудника, но выбираем только из отдела 24
        // когда "Герц" привязан к должности в этом отделе
        employeeForPosition = employees.find(
          (e) =>
            e.position_id === selectedPositionId &&
            e.department_id === 24 && // Принудительно выбираем отдел "Управление цифрового развития"
            !e.deleted,
        );
      } else {
        // Для других должностей используем стандартную логику
        employeeForPosition = employees.find(
          (e) => e.position_id === selectedPositionId && !e.deleted,
        );
      }

      if (employeeForPosition && employeeForPosition.department_id) {
        // Берем департамент сотрудника
        currentDepartmentId = employeeForPosition.department_id;
        console.log(
          `Выбран департамент ${currentDepartmentId} по сотруднику ${employeeForPosition.full_name}`,
        );
      } else {
        // 2. Если сотрудника нет, ищем департамент через positionWithDepartments
        const positionWithDeptInfo = positionsWithDepartments.find(
          (p) => p.position_id === selectedPositionId,
        );

        if (positionWithDeptInfo?.departments?.length > 0) {
          // Берем первый департамент
          currentDepartmentId =
            positionWithDeptInfo.departments[0].department_id;
          console.log(
            `Выбран департамент ${currentDepartmentId} из списка департаментов должности`,
          );
        } else {
          // 3. Проверяем position_department связи
          const pdRelation = positionRelations.find(
            (rel) => rel.position_id === selectedPositionId && !rel.deleted,
          );

          if (pdRelation && pdRelation.department_id) {
            currentDepartmentId = pdRelation.department_id;
            console.log(
              `Выбран департамент ${currentDepartmentId} из связи в position_position`,
            );
          }
        }
      }
    }

    // После определения контекста отдела, сохраняем его в состоянии
    if (
      currentDepartmentId &&
      currentDepartmentId !== currentDepartmentContext
    ) {
      setCurrentDepartmentContext(currentDepartmentId);
    }

    console.log(
      `Для должности ${selectedPositionId} установлен департамент ${currentDepartmentId}`,
    );

    // Теперь поиск должности передает информацию о департаменте
    for (const node of positionHierarchy) {
      console.log("33333333", [node]);
      const found = findPositionNodeById(
        [node],
        selectedPositionId,
        currentDepartmentId,
      );
      if (found) {
        selectedNode = found;
        break;
      }
    }

    // Если должность найдена, показываем только её непосредственных подчиненных 1-го уровня
    if (selectedNode) {
      // Нам известен отдел выбранной должности
      const departmentId = currentDepartmentId;

      // Начинаем с создания копии объекта selectedNode, чтобы не менять оригинал
      const selectedNodeCopy = { ...selectedNode };

      // Обновляем список сотрудников для выбранной должности (важно для "Герц")
      if (departmentId) {
        // Фильтруем сотрудников только для текущего отдела
        const filteredEmployees = employees.filter(
          (e) =>
            e.position_id === selectedPositionId &&
            e.department_id === departmentId &&
            !e.deleted,
        );

        // Заменяем сотрудников в узле на отфильтрованных
        selectedNodeCopy.employees = filteredEmployees;

        // Также привязываем отдел к узлу
        const departmentInfo = departments.find(
          (d) => d.department_id === departmentId,
        );
        if (departmentInfo) {
          selectedNodeCopy.department = departmentInfo;
        }
      }

      // Фильтруем подчиненных с учетом отдела
      let filteredSubordinates = [...selectedNodeCopy.subordinates];

      if (departmentId) {
        // Определяем, связана ли должность с отделом (функция-помощник)
        const isPositionLinkedToDepartment = (positionId: number): boolean => {
          // 1. Проверяем связь position_position с учетом отдела
          const hasPositionRelation = positionRelations.some(
            (rel) =>
              rel.position_id === positionId &&
              rel.parent_position_id === selectedPositionId &&
              rel.department_id === departmentId &&
              !rel.deleted,
          );

          if (hasPositionRelation) return true;

          // 2. Проверяем прямую связь должности с отделом (position_department)
          const hasDepartmentLink = positionsWithDepartments
            .find((p) => p.position_id === positionId)
            ?.departments?.some((d: any) => d.department_id === departmentId);

          if (hasDepartmentLink) return true;

          // 3. Проверяем, есть ли сотрудники с этой должностью в этом отделе
          const hasEmployees = employees.some(
            (e) =>
              e.position_id === positionId &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          return hasEmployees;
        };

        // Фильтруем подчиненных, оставляя только те, которые относятся к текущему отделу
        filteredSubordinates = filteredSubordinates.filter((subNode) => {
          const subPositionId = subNode.position.position_id;
          return isPositionLinkedToDepartment(subPositionId);
        });

        // Для каждого подчиненного обновляем список сотрудников и информацию об отделе
        filteredSubordinates = filteredSubordinates.map((subNode) => {
          // Создаем копию узла
          const updatedNode = { ...subNode };

          // Обновляем список сотрудников только для этого отдела
          const deptEmployees = employees.filter(
            (e) =>
              e.position_id === subNode.position.position_id &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          // Всегда заменяем список сотрудников на отфильтрованных
          // (даже если список пустой, это правильно - вакантная должность)
          updatedNode.employees = deptEmployees;

          // Добавляем привязку к отделу
          const departmentInfo = departments.find(
            (d) => d.department_id === departmentId,
          );
          if (departmentInfo) {
            updatedNode.department = departmentInfo;
          }

          // Находим все подчиненные должности для текущей должности из всех отделов
          // Это нужно, чтобы при клике на должность "Руководитель проекта" отображались все его подчиненные
          if (updatedNode.subordinates.length === 0) {
            // Проверяем связи position_position для этой должности во всех отделах
            const childPositions = positionRelations.filter(
              (rel) => 
                rel.parent_position_id === subNode.position.position_id && 
                !rel.deleted
            );
            
            if (childPositions.length > 0) {
              console.log(`Найдено ${childPositions.length} дочерних должностей для должности ${subNode.position.name} (ID: ${subNode.position.position_id})`);
              
              // Добавляем дочерние должности
              childPositions.forEach(childRel => {
                const posInfo = positions.find(p => p.position_id === childRel.position_id);
                if (posInfo) {
                  // Находим сотрудников на этой должности в том же отделе, что и родительская должность
                  const childEmployees = employees.filter(
                    (e) =>
                      e.position_id === childRel.position_id &&
                      e.department_id === childRel.department_id &&
                      !e.deleted,
                  );
                  
                  // Находим отдел
                  const childDeptInfo = departments.find(d => d.department_id === childRel.department_id);
                  
                  // Создаем узел
                  const childNode: PositionHierarchyNode = {
                    position: {
                      position_id: childRel.position_id,
                      name: posInfo.name,
                      parent_position_id: subNode.position.position_id,
                      department_id: childRel.department_id,
                      sort: posInfo.sort
                    },
                    employees: childEmployees,
                    subordinates: [],
                    childDepartments: [],
                    department: childDeptInfo,
                    departmentContext: childRel.department_id,
                  };
                  
                  // Добавляем в подчиненные
                  updatedNode.subordinates.push(childNode);
                }
              });
            }
          }

          // Сохраняем лог, чтобы отследить, какие подчиненные добавляются
          console.log(
            `Добавлен подчиненный ${updatedNode.position.name} (ID: ${updatedNode.position.position_id}) для отдела ${departmentId} с ${deptEmployees.length} сотрудниками и ${updatedNode.subordinates.length} подчиненными должностями`,
          );

          return updatedNode;
        });
      }

      // Показываем только выбранную должность и её отфильтрованных подчиненных
      // ВАЖНО: используем selectedNodeCopy, а не selectedNode
      // чтобы отфильтрованные сотрудники применились
      let filteredNode = {
        ...selectedNodeCopy,
        subordinates: filteredSubordinates,
      };
      
      // Специальная обработка для должности "Руководитель проекта" (ID: 46)
      // Добавляем подчиненных только для текущего отдела
      if (selectedPositionId === 46 && filteredNode.subordinates.length === 0) {
        console.log("Специальная обработка для должности 'Руководитель проекта'");
        
        // Получаем контекст отдела
        const contextDepartmentId = departmentId || currentDepartmentContext;
        console.log(`Текущий контекст отдела: ${contextDepartmentId}`);
        
        // Ищем связи для должности "Руководитель проекта" только в текущем отделе
        const projectManagerLinks = positionRelations.filter(
          (rel) => 
            rel.parent_position_id === 46 && 
            (rel.department_id === contextDepartmentId || contextDepartmentId === null) && 
            !rel.deleted
        );
        
        if (projectManagerLinks.length > 0) {
          console.log(`Найдено ${projectManagerLinks.length} дочерних должностей для 'Руководителя проекта'`);
          
          // Добавляем дочерние должности
          projectManagerLinks.forEach(childRel => {
            const posInfo = positions.find(p => p.position_id === childRel.position_id);
            if (posInfo) {
              // Находим сотрудников на этой должности
              // Если мы находимся в конкретном отделе, показываем только сотрудников этого отдела
              const childEmployees = employees.filter(
                (e) =>
                  e.position_id === childRel.position_id &&
                  (contextDepartmentId ? e.department_id === contextDepartmentId : e.department_id === childRel.department_id) &&
                  !e.deleted,
              );
              
              // Находим отдел - используем контекстный отдел, если он задан
              const childDeptId = contextDepartmentId || childRel.department_id;
              const childDeptInfo = departments.find(d => d.department_id === childDeptId);
              
              // Создаем узел
              const childNode: PositionHierarchyNode = {
                position: {
                  position_id: childRel.position_id,
                  name: posInfo.name,
                  parent_position_id: 46,
                  department_id: childDeptId, // Используем идентификатор отдела из контекста
                  sort: posInfo.sort
                },
                employees: childEmployees,
                subordinates: [],
                childDepartments: [],
                department: childDeptInfo,
                departmentContext: childDeptId,
              };
              
              // Добавляем в подчиненные
              filteredNode.subordinates.push(childNode);
            }
          });
        }
      }

      // Проверяем, были ли добавлены все необходимые подчиненные должности
      // Ищем должность "Ведущий специалист" (ID: 122) среди подчиненных, если мы в отделе 5
      if (currentDepartmentId === 5) {
        // Проверяем связи из базы данных, актуальные для текущего отдела
        const departmentRelations = positionRelations.filter(rel => 
          rel.department_id === currentDepartmentId && !rel.deleted
        );
        
        // Проверяем, есть ли связи от выбранной должности к другим должностям
        const missingRelations = departmentRelations.filter(rel => 
          rel.parent_position_id === selectedPositionId && 
          !filteredNode.subordinates.some(sub => sub.position.position_id === rel.position_id)
        );
        
        // Для каждой отсутствующей связи добавляем должность
        for (const relation of missingRelations) {
          console.log(`Добавление недостающей связи: ${relation.parent_position_id} -> ${relation.position_id} в отделе ${relation.department_id}`);
          
          // Находим информацию о должности
          const positionInfo = positions.find(p => p.position_id === relation.position_id);
          
          if (positionInfo) {
            // Находим сотрудников на этой должности в этом отделе
            const posEmployees = employees.filter(e => 
              e.position_id === relation.position_id && 
              e.department_id === currentDepartmentId && 
              !e.deleted
            );
            
            // Находим информацию об отделе
            const departmentInfo = departments.find(d => d.department_id === currentDepartmentId);
            
            // Создаем узел должности и добавляем его в список подчиненных
            const positionNode: PositionHierarchyNode = {
              position: {
                position_id: relation.position_id,
                name: positionInfo.name,
                parent_position_id: relation.parent_position_id,
                department_id: relation.department_id,
                sort: positionInfo.sort
              },
              employees: posEmployees,
              subordinates: [],
              childDepartments: [],
              department: departmentInfo,
              departmentContext: currentDepartmentId,
            };
            
            console.log(`Добавлена должность "${positionInfo.name}" (ID: ${relation.position_id}) с ${posEmployees.length} сотрудниками`);
            
            // Добавляем созданный узел в список подчиненных
            filteredNode.subordinates.push(positionNode);
          }
        }
      }

      console.log("[DEBUG] filteredNode:", filteredNode);

      console.log("Итоговое отображение:", {
        positionId: selectedPositionId,
        departmentId: currentDepartmentId,
        employeesCount: filteredNode.employees.length,
        subordinatesCount: filteredNode.subordinates.length,
      });

      // Показываем только выбранный узел - его отфильтрованные подчиненные видны внутри него
      setFilteredHierarchy([filteredNode]);
    } else {
      // Если должность не найдена, показываем только второй уровень иерархии
      if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
        // Создаем копию иерархии, чтобы не изменять оригинальный объект
        const hierarchyCopy = JSON.parse(JSON.stringify(positionHierarchy[0].subordinates));
        
        // Проверяем и заполняем недостающие связи в иерархии для всех отделов
        for (const dept of departments) {
          const deptId = dept.department_id;
          
          // Получаем все связи между должностями для данного отдела
          const deptRelations = positionRelations.filter(
            (rel: { department_id: number | null; deleted: boolean }) => 
            rel.department_id === deptId && !rel.deleted
          );
          
          // Проходим по всей иерархии и проверяем, все ли связи учтены
          const processNodeForDept = (nodeList: any[]) => {
            for (const node of nodeList) {
              const nodeId = node.position?.position_id;
              
              // Проверяем, есть ли недостающие связи у текущего узла
              const childRelations = deptRelations.filter(rel => 
                rel.parent_position_id === nodeId
              );
              
              // Для каждой связи проверяем, есть ли соответствующий подчиненный
              for (const relation of childRelations) {
                const childExists = node.subordinates?.some((sub: any) => 
                  sub.position?.position_id === relation.position_id &&
                  (sub.departmentContext === deptId || sub.position.department_id === deptId)
                );
                
                // Если подчиненного нет, создаем и добавляем его
                if (!childExists) {
                  const positionInfo = positions.find(p => p.position_id === relation.position_id);
                  
                  if (positionInfo) {
                    // Находим сотрудников на этой должности в этом отделе
                    const posEmployees = employees.filter(e => 
                      e.position_id === relation.position_id && 
                      e.department_id === deptId && 
                      !e.deleted
                    );
                    
                    // Создаем узел должности
                    const newNode: any = {
                      position: {
                        position_id: relation.position_id,
                        name: positionInfo.name,
                        parent_position_id: relation.parent_position_id,
                        department_id: deptId,
                        sort: positionInfo.sort
                      },
                      employees: posEmployees,
                      subordinates: [],
                      childDepartments: [],
                      department: dept,
                      departmentContext: deptId
                    };
                    
                    // Добавляем в подчиненные
                    if (!node.subordinates) {
                      node.subordinates = [];
                    }
                    
                    node.subordinates.push(newNode);
                    console.log(`Добавлена должность "${positionInfo.name}" (ID: ${relation.position_id}) в отделе ${deptId} к "${node.position?.name}" (ID: ${nodeId})`);
                  }
                }
              }
              
              // Рекурсивно обрабатываем подчиненных
              if (node.subordinates && node.subordinates.length > 0) {
                processNodeForDept(node.subordinates);
              }
            }
          };
          
          // Запускаем обработку для всей иерархии
          processNodeForDept(hierarchyCopy);
        }
        
        setFilteredHierarchy(hierarchyCopy);
      } else {
        setFilteredHierarchy([]);
      }
    }
  }, [selectedPositionId, positionHierarchy]);

  console.log("departments:", departments);
  console.log("positions:", positions);
  console.log("positionsWithDepartments:", positionsWithDepartments);
  // Если данные еще не загружены, показываем загрузку
  if (
    departments.length === 0 ||
    (positions.length === 0 && positionsWithDepartments.length === 0)
    //  || positionRelations.length === 0 // Добавлена проверка на загрузку данных о связях должностей
  ) {
    return (
      <div className="loading-message">
        Загрузка организационной структуры...
        {departments.length > 0 &&
          (positions.length > 0 || positionsWithDepartments.length > 0) &&
          positionRelations.length === 0 && (
            <div>Ожидание загрузки связей между должностями...</div>
          )}
      </div>
    );
  }

  // Находим корневой отдел (без родительских отделов и позиций)
  const rootDept = departments.find(
    (d) => d.parent_department_id === null && d.parent_position_id === null,
  );

  return (
    <div className="org-tree-container">
      {/* Убрали отображение отдела Администрация */}

      {/* Отображаем иерархию должностей как горизонтальное дерево с горизонтальным скроллингом */}
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
              showThreeLevels={Boolean(showThreeLevels)}
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
          handleGoBack={handleGoBack}
          selectedPositionId={selectedPositionId}
          hierarchyInitialLevels={Number(hierarchyInitialLevels)}
          showThreeLevels={Boolean(showThreeLevels)}
          showVacancies={showVacancies}
        />
      </div>
    </div>
  );
};

export default OrganizationTree;
