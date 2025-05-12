import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UnifiedPositionCard from "./UnifiedPositionCard";
import DisplaySettings from "./DisplaySettings";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Building } from "lucide-react";
import {
  Department,
  Position,
  Employee,
  DepartmentNode,
  PositionHierarchyNode,
} from "@shared/types";

// Расширяем интерфейс Window глобально
declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

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
  employeesData,
}) => {
  const useFetchData = (queryKey: string, data: any) => {
    return useQuery({
      queryKey: [queryKey],
      enabled: !data,
    });
  };

  const { data: departmentsResponse } = useFetchData(
    "/api/departments",
    departmentsData,
  );
  const departments = departmentsData || departmentsResponse?.data || [];

  const { data: positionHierarchyResponse } = useFetchData(
    "/api/positionpositions",
    null,
  );
  const positionRelations =
    positionHierarchyResponse?.data?.filter((pr) => !pr.deleted) || [];

  const { data: positionsResponse } = useFetchData(
    "/api/positions",
    positionsData,
  );
  const positions = positionsData || positionsResponse?.data || [];

  const { data: employeesResponse } = useFetchData(
    "/api/employees",
    employeesData,
  );
  const employees = employeesData || employeesResponse?.data || [];

  const { data: settingsResponse, isError } = useFetchData(
    "/api/settings",
    null,
  );
  const defaultLevels = 2; // По умолчанию 2 уровня

  // Пытаемся получить настройку из ответа API
  const hierarchyInitialLevels = settingsResponse?.data
    ? settingsResponse.data.find(
        (item: any) => item.data_key === "hierarchy_initial_levels",
      )?.data_value || defaultLevels
    : defaultLevels;

  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
  const [positionHierarchy, setPositionHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);
  const [selectedPositionId, setSelectedPositionId] = useState<
    number | undefined
  >(initialPositionId);
  const [filteredHierarchy, setFilteredHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(false);

  const { data: positionsWithDepartmentsResponse } = useFetchData(
    "/api/positions/with-departments",
    null,
  );
  const positionsWithDepartments =
    positionsData || positionsWithDepartmentsResponse?.data || [];

  if (typeof window !== "undefined") {
    window.positionsWithDepartmentsData = positionsWithDepartments;
  }

  const filterEmployees = (
    positionId: number,
    departmentId: number | null,
    isCategory: boolean,
  ) => {
    return employees.filter((e) => {
      if (isCategory) {
        return (
          e.position_id === positionId &&
          e.department_id === departmentId &&
          (e.category_parent_id === undefined ||
            e.category_parent_id === null ||
            e.category_parent_id === positionId)
        );
      } else {
        return (
          e.position_id === positionId &&
          e.department_id === departmentId &&
          !e.deleted
        );
      }
    });
  };

  const createPositionHierarchyNode = (
    positionNode: any,
    departmentId: number,
  ): PositionHierarchyNode | null => {
    if (!positionNode || !positionNode.position_id) {
      return null;
    }

    const isCategory = positionNode.is_category === true;
    const positionEmployees = filterEmployees(
      positionNode.position_id,
      departmentId,
      isCategory,
    );

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
    };

    if (positionNode.children && Array.isArray(positionNode.children)) {
      positionNode.children.forEach((childPos: any) => {
        const childNode = createPositionHierarchyNode(childPos, departmentId);
        if (childNode) {
          node.subordinates.push(childNode);
        }
      });
    }

    return node;
  };

  const findPositionNodeById = (
    nodes: PositionHierarchyNode[],
    positionId: number,
    currentDepartmentId?: number | null,
  ): PositionHierarchyNode | null => {
    for (const node of nodes) {
      if (node.position.position_id === positionId) {
        let result = { ...node };

        if (currentDepartmentId && !result.department) {
          const departmentInfo = departments.find(
            (d) => d.department_id === currentDepartmentId,
          );
          if (departmentInfo) {
            result.department = departmentInfo;
          }
        }

        if (currentDepartmentId) {
          const deptEmployees = filterEmployees(
            positionId,
            currentDepartmentId,
            false,
          );
          if (deptEmployees.length > 0) {
            result.employees = deptEmployees;
          }
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
          return found;
        }
      }
    }

    return null;
  };

  const calculateChildCount = (
    department: Department,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
  ): number => {
    const departmentPositions = allPositions.filter((pos) =>
      allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      ),
    );

    const children = allDepartments.filter(
      (d) => d.parent_department_id === department.department_id,
    );

    const departmentPositionCount = allPositions.filter((pos) => {
      const hasEmployeesInDepartment = allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      );

      const isDirectlyLinkedToThisDepartment =
        pos.department_id === department.department_id;

      return hasEmployeesInDepartment || isDirectlyLinkedToThisDepartment;
    }).length;

    const positionCount = Math.max(departmentPositionCount, 1);

    if (children.length === 0) {
      return positionCount;
    }

    return children.reduce(
      (sum, child) =>
        sum +
        calculateChildCount(child, allDepartments, allPositions, allEmployees),
      positionCount,
    );
  };

  const buildDepartmentTree = (
    parentId: number | null,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
    totalElements: number,
  ): DepartmentNode[] => {
    const departmentsAtLevel =
      parentId === null
        ? allDepartments.filter((d) => d.parent_department_id === null)
        : allDepartments.filter((d) => d.parent_department_id === parentId);

    const departmentsWithCounts = departmentsAtLevel.map((dept) => {
      const childCount = calculateChildCount(
        dept,
        allDepartments,
        allPositions,
        allEmployees,
      );
      return { ...dept, childCount };
    });

    const totalChildCount = departmentsWithCounts.reduce(
      (sum, dept) => sum + dept.childCount,
      0,
    );

    return departmentsWithCounts.map((dept) => {
      const positionsWithEmployees = allPositions.filter((pos) => {
        return allEmployees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === dept.department_id,
        );
      });

      let width =
        totalChildCount === 0 ? 100 : (dept.childCount / totalChildCount) * 100;

      if (width < 5) width = 5;

      const children = buildDepartmentTree(
        dept.department_id,
        allDepartments,
        allPositions,
        allEmployees,
        dept.childCount,
      );

      return {
        ...dept,
        positions: positionsWithEmployees,
        children,
        width,
        childCount: dept.childCount,
      };
    });
  };

  const buildRootDepartmentHierarchy = () => {
    if (positions.length === 0 || departments.length === 0) {
      return [];
    }

    const rootDepartment = departments.find(
      (dept) =>
        dept.parent_department_id === null && dept.parent_position_id === null,
    );

    if (!rootDepartment) {
      return [];
    }

    const hierarchyLinks =
      positionRelations.filter((link: any) => {
        const hasParentPosition = link.parent_position_id !== null;
        const hasDepartment = link.department_id !== null;

        if (hasParentPosition && hasDepartment) return true;
        if (hasParentPosition && !hasDepartment) return true;
        if (!hasParentPosition && hasDepartment) return false;

        return false;
      }) || [];

    let adminPositions = positionsWithDepartments.filter((pos) => {
      return (
        pos.departments &&
        Array.isArray(pos.departments) &&
        pos.departments.some(
          (d: any) => d.department_id === rootDepartment.department_id,
        )
      );
    });

    if (adminPositions.length === 0) {
      adminPositions = positions.filter((pos) => {
        return employees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === rootDepartment.department_id,
        );
      });
    }

    const rootNodes: PositionHierarchyNode[] = [];

    adminPositions.forEach((position) => {
      const positionEmployees = employees.filter(
        (emp) =>
          emp.position_id === position.position_id &&
          emp.department_id === rootDepartment.department_id,
      );

      const positionNode: PositionHierarchyNode = {
        position,
        employees: positionEmployees,
        subordinates: [],
        childDepartments: [],
      };

      // Добавляем подчиненные должности
      const childPositionRelations = hierarchyLinks.filter(
        (link) =>
          link.parent_position_id === position.position_id &&
          link.department_id === rootDepartment.department_id,
      );

      childPositionRelations.forEach((rel) => {
        const childPosition = positions.find(
          (p) => p.position_id === rel.position_id,
        );
        if (childPosition) {
          const childNode = createPositionHierarchyNode(
            childPosition,
            rootDepartment.department_id,
            positionRelations,
            departments,
            employees,
          );
          if (childNode) {
            positionNode.subordinates.push(childNode);
          }
        }
      });

      // Добавляем дочерние отделы
      const childDepartments = departments.filter(
        (dept) => dept.parent_department_id === rootDepartment.department_id,
      );

      childDepartments.forEach((dept) => {
        const deptPositions = positions.filter((pos) =>
          employees.some(
            (emp) =>
              emp.position_id === pos.position_id &&
              emp.department_id === dept.department_id &&
              !emp.deleted,
          ),
        );

        const departmentNode = {
          ...dept,
          positions: deptPositions,
          children: buildDepartmentTree(
            dept.department_id,
            departments,
            positions,
            employees,
            0,
          ),
          width: 0,
          childCount: 0,
        };

        positionNode.childDepartments.push(departmentNode);
      });

      rootNodes.push(positionNode);
    });

    return rootNodes;
  };

  const handlePositionClick = (positionId: number) => {
    if (selectedPositionId) {
      setNavigationHistory((prev) => [...prev, selectedPositionId]);
    }

    setSelectedPositionId(positionId);

    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const prevPosition = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setSelectedPositionId(prevPosition);

      if (onPositionClick) {
        onPositionClick(prevPosition);
      }
    } else {
      setSelectedPositionId(undefined);
      if (onPositionClick) {
        onPositionClick(0);
      }
    }
  };

  useEffect(() => {
    const hasAllData =
      departments.length > 0 &&
      (positions.length > 0 || positionsWithDepartments.length > 0);

    if (hasAllData) {
      const totalElements = departments.reduce(
        (sum, dept) =>
          sum + calculateChildCount(dept, departments, positions, employees),
        0,
      );

      const tree = buildDepartmentTree(
        null,
        departments,
        positions,
        employees,
        totalElements,
      );
      setDepartmentTree(tree);

      const rootDepartmentHierarchy = buildRootDepartmentHierarchy();
      if (rootDepartmentHierarchy && rootDepartmentHierarchy.length > 0) {
        setPositionHierarchy(rootDepartmentHierarchy);
      }
    }
  }, [
    departments.length,
    positions.length,
    positionsWithDepartments.length,
    positionRelations.length,
    employees.length,
  ]);

  useEffect(() => {
    if (!selectedPositionId || positionHierarchy.length === 0) {
      setFilteredHierarchy(positionHierarchy);
      return;
    }

    let selectedNode: PositionHierarchyNode | null = null;
    let currentDepartmentId: number | null = null;

    const employeeForPosition = employees.find(
      (e) => e.position_id === selectedPositionId && !e.deleted,
    );

    if (employeeForPosition && employeeForPosition.department_id) {
      currentDepartmentId = employeeForPosition.department_id;
    } else {
      const positionWithDeptInfo = positionsWithDepartments.find(
        (p) => p.position_id === selectedPositionId,
      );

      if (positionWithDeptInfo?.departments?.length > 0) {
        currentDepartmentId = positionWithDeptInfo.departments[0].department_id;
      } else {
        const pdRelation = positionRelations.find(
          (rel) => rel.position_id === selectedPositionId && !rel.deleted,
        );

        if (pdRelation && pdRelation.department_id) {
          currentDepartmentId = pdRelation.department_id;
        }
      }
    }

    for (const node of positionHierarchy) {
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

    if (selectedNode) {
      const departmentId = currentDepartmentId;
      const selectedNodeCopy = { ...selectedNode };

      if (departmentId) {
        const filteredEmployees = employees.filter(
          (e) =>
            e.position_id === selectedPositionId &&
            e.department_id === departmentId &&
            !e.deleted,
        );

        selectedNodeCopy.employees = filteredEmployees;

        const departmentInfo = departments.find(
          (d) => d.department_id === departmentId,
        );
        if (departmentInfo) {
          selectedNodeCopy.department = departmentInfo;
        }
      }

      let filteredSubordinates = [...selectedNodeCopy.subordinates];

      if (departmentId) {
        const isPositionLinkedToDepartment = (positionId: number): boolean => {
          const hasPositionRelation = positionRelations.some(
            (rel) =>
              rel.position_id === positionId &&
              rel.parent_position_id === selectedPositionId &&
              rel.department_id === departmentId &&
              !rel.deleted,
          );

          if (hasPositionRelation) return true;

          const hasDepartmentLink = positionsWithDepartments
            .find((p) => p.position_id === positionId)
            ?.departments?.some((d: any) => d.department_id === departmentId);

          if (hasDepartmentLink) return true;

          const hasEmployees = employees.some(
            (e) =>
              e.position_id === positionId &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          return hasEmployees;
        };

        filteredSubordinates = filteredSubordinates.filter((subNode) => {
          const subPositionId = subNode.position.position_id;
          return isPositionLinkedToDepartment(subPositionId);
        });

        filteredSubordinates = filteredSubordinates.map((subNode) => {
          const updatedNode = { ...subNode };
          const deptEmployees = employees.filter(
            (e) =>
              e.position_id === subNode.position.position_id &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          updatedNode.employees = deptEmployees;

          const departmentInfo = departments.find(
            (d) => d.department_id === departmentId,
          );
          if (departmentInfo) {
            updatedNode.department = departmentInfo;
          }

          return updatedNode;
        });
      }

      const filteredNode = {
        ...selectedNodeCopy,
        subordinates: filteredSubordinates,
      };

      setFilteredHierarchy([filteredNode]);
    } else {
      if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
        setFilteredHierarchy(positionHierarchy[0].subordinates);
      } else {
        setFilteredHierarchy([]);
      }
    }
  }, [selectedPositionId, positionHierarchy]);

  if (
    departments.length === 0 ||
    (positions.length === 0 && positionsWithDepartments.length === 0)
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

  const rootDept = departments.find(
    (d) => d.parent_department_id === null && d.parent_position_id === null,
  );

  return (
    <div className="org-tree-container">
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
              showThreeLevels={showThreeLevels}
              showVacancies={showVacancies}
              onShowThreeLevelsChange={setShowThreeLevels}
              onShowVacanciesChange={setShowVacancies}
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
          hierarchyInitialLevels={Number(hierarchyInitialLevels)} // Теперь эта переменная определена
          showThreeLevels={showThreeLevels}
          showVacancies={showVacancies}
        />
      </div>
    </div>
  );
};

// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  selectedPositionId,
  handleGoBack,
  hierarchyInitialLevels = 3, // По умолчанию 3 уровня
  showThreeLevels = false, // Показывать третий уровень
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

  // console.log(firstNode);

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
                .filter((sub) => sub && sub.position)
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

                    {/* Рекурсивное отображение подчиненных подчиненного, если они есть И настройка позволяет (3 уровня) */}
                    {subNode.subordinates.length > 0 && showThreeLevels && (
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
                          .filter((sub) => sub && sub.position)
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
                  </div>
                ))}
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
                .filter((sub) => sub && sub.position)
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
        </div>
      ))}
    </div>
  );
};

export default OrganizationTree;
