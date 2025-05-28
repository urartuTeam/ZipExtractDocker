import React, { useMemo, useState } from "react";
import {VacancyCounter} from "../VacancyCounter";
import {PositionHierarchyNode,} from "../types";
import { createPortal } from "react-dom";

const TooltipImage = ({ src, x, y }: { src: string; x: number; y: number }) =>
    createPortal(
        <div
            style={{
                position: "fixed",
                top: y,
                left: x,
                zIndex: 9999,
                border: "2px solid #f0f0f0",
                borderRadius: "4px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                background: "white",
                padding: "4px",
                pointerEvents: "none"
            }}
        >
            <img
                src={src}
                alt="full photo"
                style={{
                    width: "auto",
                    maxWidth: "180px",
                    maxHeight: "240px",
                    objectFit: "contain"
                }}
            />
        </div>,
        document.body
    );

const UnifiedPositionCard = ({
                               node,
                               onPositionClick,
                               isTopLevel = false,
                               showVacancies = false,
                               hasSubordinates = false
                             }: {
  node: PositionHierarchyNode;
  onPositionClick?: (positionId: number, departmentId?: number | null) => void;
  isTopLevel?: boolean;
  showVacancies?: boolean;
}) => {
  const isDepartment = node.position.name.includes("(отдел)");
  const department = node.department;
  const isOrganization = department ? department.is_organization : false;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; src: string } | null>(null);
  let cardClass = isDepartment
      ? isOrganization
          ? "organizationClass"
          : "departmentClass"
      : isTopLevel
          ? "topTopPositionClass"
          : "positionClass";

  const bottomIndicator = node.subordinates.length;
console.log('@@@@@@hasSubordinates',node.position.name, hasSubordinates);
  // Подсчет вакансий
  const vacanciesCount = useMemo(() => {
    if (!showVacancies) return 0;
    if (
        !window.departmentsData ||
        !window.employeesData ||
        !window.positionsWithDepartmentsData ||
        !window.positionPositionsData
    ) {
      return 0;
    }

    const counter = new VacancyCounter(
        window.departmentsData,
        window.employeesData,
        window.positionsWithDepartmentsData,
        window.positionPositionsData
    );

    const deptId = node.department?.department_id || node.departmentContext || null;
    const posId = node.position?.position_id || null;

    if (!deptId) return 0;

    return counter.getVacancyCount({
        departmentId: deptId,
        positionId: isDepartment ? null : posId,
        hasSubordinates
    });
  }, [node, showVacancies]);

  if (isDepartment && isOrganization) {
    return (
        <div
            className={`position-card ${cardClass} department-card`}
            onClick={() => {
              if (onPositionClick) {
                const departmentId = node.department?.department_id || null;
                onPositionClick(node.position.position_id, departmentId);
              }
            }}
            style={{
              cursor: onPositionClick ? "pointer" : "default",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "15px",
            }}
        >
          {department && department.logo_path ? (
              <img
                  src={department.logo_path}
                  alt={`Логотип ${department.name}`}
                  className="mr-4 w-8 h-8 object-contain"
                  style={{ width: 81, height: 81 }}
              />
          ) : (
              <img src={`/organization21.png`} alt="Организация" className="mr-4" />
          )}
          <span>
          {department?.name || node.position.name.replace(" (отдел)", "")}
        </span>
            {showVacancies && (
                <div
                    style={{
                        position: "absolute",
                        top: "0px",
                        right: "0px",
                        background: "#a40000",
                        color: "white",
                        borderRadius: "5px",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                >
                    {vacanciesCount.vacant}
                </div>
            )}

            {showVacancies && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "0px",
                        right: "0px",
                        background: "#4b7bec",
                        color: "white",
                        borderRadius: "5px",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                >
                    {vacanciesCount.total}
                </div>
            )}
        </div>
    );
  }
    return (
        <>
      <div
          className={`position-card ${cardClass} ${isDepartment ? "department-card" : ""}`}
          onClick={() => {
              if (onPositionClick) {
                  const departmentId = node.departmentContext || department?.department_id || null;
                  onPositionClick(node.position.position_id, departmentId);
              }
          }}
          style={{
              cursor: onPositionClick ? "pointer" : "default",
              position: "relative",
          }}
      >
          {/* Вакансии — правый верх */}
          {!isTopLevel && showVacancies && (
              <div
                  style={{
                      position: "absolute",
                      top: "0px",
                      right: "0px",
                      background: "#a40000",
                      color: "white",
                      borderRadius: "5px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                  }}
              >
                  {vacanciesCount.vacant}
              </div>
          )}

          <div className="position-title">
              {isDepartment
                  ? node.position.name.replace(" (отдел)", "")
                  : node.position.name}
          </div>

          <div className="position-divider"></div>

          {isDepartment ? (
              <div className="department-type">Отдел</div>
          ) : (
              <>
                  {node.employees && node.employees.length > 0 ? (
                      <div className="employee-names">
                          {node.employees.map((employee, index) => (
                              <div key={employee.employee_id} className="mb-1">
                                  <div
                                      className={`employee-name flex text-sm ${isTopLevel ? 'flex-col items-center' : 'items-center'}`}
                                  >
                                      {!isTopLevel && node.employees.length > 1 && (
                                          <span className="w-4 mr-1 shrink-0 text-[#a40000]">{index + 1}.</span>
                                      )}
                                      {employee.photo_url && (
                                          <div
                                              style={{ position: 'relative', display: 'inline-block' }}
                                              onMouseEnter={(e) => {
                                                  if (!isTopLevel) {
                                                      const rect = e.currentTarget.getBoundingClientRect();
                                                      setTooltip({
                                                          x: rect.right + 10,
                                                          y: rect.top,
                                                          src: employee.photo_url,
                                                      });
                                                  }
                                              }}
                                              onMouseLeave={() => setTooltip(null)}
                                          >
                                              <img
                                                  src={employee.photo_url}
                                                  alt="photo"
                                                  style={{
                                                      width: isTopLevel ? 240 : 30,
                                                      height: isTopLevel ? 360 : 40,
                                                      borderRadius: "4px",
                                                      margin: isTopLevel ? "0 0 8px 0" : "0 8px 0 0",
                                                  }}
                                              />
                                          </div>
                                      )}

                                      <span
                                          className={isTopLevel ? "break-words text-center" : "break-words pl-2"}
                                          style={{fontSize: isTopLevel ? "1.1rem" : undefined}}
                                      >
    {employee.full_name}
  </span>
                                  </div>


                                  {index < node.employees.length - 1 && (
                                      <div className="employee-divider my-1 h-px bg-gray-300 w-full"/>
                                  )}
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="position-vacant">Вакантная должность</div>
                  )}
              </>
          )}

          {/* Индикатор подчинённых — правый низ */}
          {!isTopLevel && showVacancies && (
              <div
                  style={{
                      position: "absolute",
                      bottom: "0px",
                      right: "0px",
                      background: "#4b7bec",
                      color: "white",
                      borderRadius: "5px",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                  }}
              >
                  {vacanciesCount.total}
              </div>
          )}
      </div>
            {tooltip && <TooltipImage src={tooltip.src} x={tooltip.x} y={tooltip.y} />}
        </>
  );
};

export default UnifiedPositionCard;
