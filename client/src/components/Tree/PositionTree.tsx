import {useEffect} from "react";
import {Department, DepartmentNode, Employee, Position, PositionHierarchyNode} from "@shared/types";
import UnifiedPositionCard from "@/components/UnifiedPositionCard.tsx";
import {employees, PositionDepartment} from "@shared/schema";

const isLastLevel = (field) => {
    if (!field) return;

    if (!field.subordinates || field.subordinates.length === 0) {
        return 0; // Если нет подчиненных, возвращаем 0
    }

    let count = 0;

    for (const child of field.subordinates) {
        // Если у текущего дочернего элемента есть свои подчиненные, увеличиваем счетчик
        if (
          child.subordinates &&
          child.subordinates.length > 0 &&
          child.position.position_id !== 46
        ) {
          count += 1;
        }
        // Рекурсивно проверяем его подчиненных (если нужно углубляться дальше)
        count += isLastLevel(child);
    }

    return count;
}


// Компонент для отображения горизонтального дерева иерархии должностей
const PositionTree = ({
                          nodes,
                          allPositions,
                          allEmployees,
                          positionsWithDepartments,
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
    positionsWithDepartments: any;
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
    const isLastLevelForCurrentNode =
      isLastLevel(firstNode) === 0 &&
      (firstNode?.childDepartments && firstNode.childDepartments.length === 0);


    const getSortById = (posId: number | null, depId: number | null | undefined) => {
        return positionsWithDepartments.find(pos => (
            pos.position_id === posId
        ))?.sort;
    }

    useEffect(() => {
        const calculateWidthsRecursively = (container: HTMLElement): number => {
            const branches = container.querySelectorAll<HTMLElement>(
                ":scope > .subordinate-branch",
            );
            if (branches.length === 0) return 0;

            const parentWidth = container.parentElement?.querySelector(".tree-node-container")?.clientWidth;

            let totalWidth = 0;

            branches.forEach((branch) => {
                const childSubContainer = branch.querySelector<HTMLElement>(
                    ":scope > .subordinates-container",
                );
                let branchWidth = 0;

                if (isLastLevelForCurrentNode) {
                    branch.style.width = `${parentWidth}px`;
                } else {
                    if (childSubContainer) {
                        const childWidth = calculateWidthsRecursively(childSubContainer);
                        branchWidth = childWidth;
                        branch.style.width = `${childWidth}px`;
                    } else {
                        const isOrganization = branch.dataset.isOrganization === "true";
                        branchWidth = isOrganization ? 350 : 280;
                        branch.style.width = `${branchWidth}px`;
                    }
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
      <div className="tree-node" style={{ zoom: "0.75" }}>
        {firstNode && firstNode.position && (
          <div className="tree-branch">
            {/* Карточка первой должности верхнего уровня */}
            <div className={`tree-node-container${
                isLastLevelForCurrentNode ? " last-level" : ""
            }`}>
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
                className={`subordinates-container${
                  isLastLevelForCurrentNode ? " last-level" : ""
                }`}
                style={
                  firstNode.subordinates.length === 1
                    ? { marginTop: "0" }
                    : undefined
                }
              >
                {!isLastLevelForCurrentNode && (
                  <div className="tree-branch-connections">
                    {/* Горизонтальная линия */}
                    <div
                      className="tree-branch-line"
                      style={{
                        width: `${Math.max(
                          firstNode.subordinates.length * 120,
                          100
                        )}px`,
                        left:
                          showThreeLevels &&
                          firstNode?.position?.position_id === 2
                            ? "310px"
                            : "",
                      }}
                    ></div>
                  </div>
                )}

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
                      style={{
                        order:
                          getSortById(
                            subNode.position.position_id,
                            subNode.position.department_id
                          ) ?? 0,
                      }}
                    >
                      <UnifiedPositionCard
                        node={subNode}
                        onPositionClick={onPositionClick}
                        isTopLevel={isRootView} // Второй уровень тоже верхний, если это корневой вид
                        showVacancies={showVacancies}
                        hasSubordinates={subNode.subordinates.length == 0}
                      />

                      {/* Рекурсивное отображение подчиненных подчиненного, показываем всегда при навигации к конкретной должности */}
                      {subNode.subordinates.length > 0 && (showThreeLevels || selectedPositionId) && (
                        <div
                          className={`subordinates-container${
                            isLastLevelForCurrentNode ? " last-level" : ""
                          }`}
                          style={
                            subNode.subordinates.length === 1
                              ? { marginTop: "0" }
                              : undefined
                          }
                        >
                          {!isLastLevelForCurrentNode && (
                            <div className="tree-branch-connections">
                              <div
                                className="tree-branch-line"
                                style={{
                                  width: `${Math.max(
                                    subNode.subordinates.length * 120,
                                    100
                                  )}px`,
                                }}
                              ></div>
                            </div>
                          )}

                          {subNode.subordinates
                            .filter(
                              (sub) => sub && (sub.position || sub.department)
                            )
                            .map(
                              (
                                grandChild: PositionHierarchyNode,
                                grandIndex: number
                              ) => (
                                <div
                                  key={`${grandChild.position.position_id}-${grandIndex}`}
                                  className={`subordinate-branch${
                                    isLastLevelForCurrentNode
                                      ? " last-level"
                                      : ""
                                  }`}
                                  style={{
                                    order:
                                      getSortById(
                                        grandChild.position.position_id,
                                        grandChild.position.department_id
                                      ) ?? 0,
                                  }}
                                >
                                  <UnifiedPositionCard
                                    node={grandChild}
                                    onPositionClick={onPositionClick}
                                    isTopLevel={false} // Третий уровень не верхний
                                    showVacancies={showVacancies}
                                  />
                                </div>
                              )
                            )}
                        </div>
                      )}

                      {/* Дочерние отделы подузла, отображаются всегда при навигации к конкретной должности */}
                      {subNode.childDepartments &&
                        subNode.childDepartments.length > 0 &&
                        (showThreeLevels || selectedPositionId) && (
                          <div className="subordinates-container">
                            <div className="tree-branch-connections">
                              <div
                                className="tree-branch-line"
                                style={{
                                  width: `${Math.max(
                                    subNode.childDepartments.length * 120,
                                    100
                                  )}px`,
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
                                employees: employees,
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
                                    showVacancies={showVacancies}
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
            {firstNode &&
              firstNode.childDepartments &&
              firstNode.childDepartments.length > 0 && (
                <div
                  className="subordinates-container"
                  style={
                    firstNode.childDepartments.length === 1
                      ? { marginTop: "0" }
                      : undefined
                  }
                >
                  <div className="tree-branch-connections">
                    <div
                      className="tree-branch-line"
                      style={{
                        width: `${Math.max(
                          firstNode.childDepartments.length * 120,
                          100
                        )}px`,
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
                          showVacancies={showVacancies}
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
                // style={
                //     node.department?.is_organization
                //         ? {minWidth: "750px"}
                //         : undefined
                // }
              >
                <div className="tree-branch-connections">
                  <div
                    className="tree-branch-line"
                    style={{
                      width: `${Math.max(
                        node.subordinates.length * 120,
                        100
                      )}px`,
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

export default PositionTree;
