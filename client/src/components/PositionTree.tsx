import React, { useEffect, useRef } from "react";
import UnifiedPositionCard from "./UnifiedPositionCard";
import { Department, PositionHierarchyNode } from "../types";

interface PositionTreeProps {
  nodes: PositionHierarchyNode[];
  allPositions: any[];
  allEmployees: any[];
  onPositionClick: (positionId: number, departmentId?: number | null) => void;
  handleGoBack: () => void;
  selectedPositionId?: number;
  hierarchyInitialLevels: number;
  showThreeLevels: boolean;
  showVacancies: boolean;
}

const PositionTree: React.FC<PositionTreeProps> = ({
  nodes,
  onPositionClick,
  handleGoBack,
  selectedPositionId,
  showThreeLevels,
  showVacancies,
}: PositionTreeProps) => {
  const treeRef = useRef<HTMLDivElement>(null);

  // После рендера дерева вычисляем ширины для корректного отображения линий
  useEffect(() => {
    // Функция для рекурсивного расчета ширин узлов
    const calculateWidthsRecursively = (container: HTMLElement): number => {
      const branches = Array.from(
        container.querySelectorAll<HTMLElement>(".subordinate-branch"),
      );
      
      if (branches.length === 0) return container.offsetWidth;

      let totalWidth = 0;
      
      // Сначала вычисляем ширину каждой ветви, включая её детей
      branches.forEach((branch) => {
        // Рекурсивно вычисляем ширину вложенных контейнеров с подчиненными
        const subordinatesContainer = branch.querySelector<HTMLElement>(
          ".subordinates-container",
        );
        if (subordinatesContainer) {
          const childWidth = calculateWidthsRecursively(subordinatesContainer);
          branch.style.minWidth = `${childWidth}px`;
          totalWidth += childWidth;
        } else {
          // Если нет дочерних элементов, берем ширину самой ветви
          totalWidth += branch.offsetWidth;
        }
      });

      // Устанавливаем минимальную ширину контейнера
      container.style.minWidth = `${totalWidth}px`;

      // Настраиваем ширину горизонтальной линии
      const line = container.querySelector<HTMLElement>(".tree-branch-line");
      if (line) {
        const first = branches[0]?.offsetWidth || 0;
        const last = branches[branches.length - 1]?.offsetWidth || 0;
        const totalLine = totalWidth - (first + last) / 2 - 20;
        line.style.width = `${totalLine}px`;
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

  const isRootView = !selectedPositionId; // Если нет выбранной должности, это корневой вид

  // Отрисовка иерархии
  return (
    <div className="position-hierarchy" ref={treeRef}>
      {nodes.map((node, nodeIndex) => (
        <React.Fragment key={`node-fragment-${node.position.position_id}-${nodeIndex}`}>
          <div className="tree-node">
            <div className="tree-branch">
              {/* Карточка должности */}
              <div className="tree-node-container">
                <UnifiedPositionCard
                  node={node}
                  onPositionClick={node === nodes[0] ? handleGoBack : onPositionClick}
                  isTopLevel={isRootView}
                  showVacancies={showVacancies}
                />
              </div>

              {/* Подчиненные текущего узла */}
              {node.subordinates && node.subordinates.length > 0 && (
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

                  {/* Отображаем подчиненных */}
                  {node.subordinates
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
                          isTopLevel={isRootView}
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

                            {/* Отображаем только два уровня подчиненных (первый уровень + 2 вложенных) */}
                            {subNode.subordinates
                              .filter((grandSub) => grandSub && grandSub.position)
                              .map(
                                (grandChild: PositionHierarchyNode, subIndex: number) => (
                                  <div
                                    key={`${grandChild.position.position_id}-${subIndex}`}
                                    className="subordinate-branch"
                                    data-is-organization={
                                      grandChild.department?.is_organization
                                        ? "true"
                                        : "false"
                                    }
                                  >
                                    <UnifiedPositionCard
                                      node={grandChild}
                                      onPositionClick={onPositionClick}
                                      isTopLevel={false}
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
          </div>
          
          {/* Дочерние отделы как отдельные ветви */}
          {node.childDepartments && node.childDepartments.length > 0 && (
            <div className="tree-node department-tree-node">
              <div className="tree-branch">
                <div
                  className="subordinates-container child-departments-container"
                  style={{ minWidth: "750px" }}
                >
                  <div className="tree-node-label">
                    Отделы, подчиненные должности "{node.position.name}"
                  </div>
                  <div className="tree-branch-connections">
                    <div
                      className="tree-branch-line"
                      style={{
                        width: `${Math.max(node.childDepartments.length * 150, 100)}px`,
                      }}
                    ></div>
                  </div>
                  
                  {node.childDepartments.map((dept, deptIndex) => (
                    <div
                      key={`dept-${dept.department_id}-${deptIndex}`}
                      className="subordinate-branch department-branch"
                      data-is-organization={dept.is_organization ? "true" : "false"}
                    >
                      <div className={`department-card ${dept.is_organization ? 'organization-card' : ''}`}>
                        <div className="position-title">{dept.name}</div>
                        <div className="position-divider"></div>
                        <div className="department-type">Отдел</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PositionTree;