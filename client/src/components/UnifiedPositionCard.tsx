import React, { useMemo } from "react";
import { VacancyCounter } from "../VacancyCounter";
import {
    Position,
    Employee,
    Department,
    PositionHierarchyNode,
} from "../types";
import { ChevronRight, ChevronDown, Users, Building, User, ChevronsRight, ChevronsDown,
    MoveVertical, AlertTriangle } from "lucide-react";
const UnifiedPositionCard = ({
                                 node,
                                 onPositionClick,
                                 isTopLevel = false,
                                 showVacancies = false,
                             }: {
    node: PositionHierarchyNode;
    onPositionClick?: (positionId: number, departmentId?: number | null) => void;
    isTopLevel?: boolean;
    showVacancies?: boolean;
}) => {
    const isDepartment = node.position.name.includes("(отдел)");
    const department = node.department;
    const isOrganization = department ? department.is_organization : false;

    let cardClass = isDepartment
        ? isOrganization
            ? "organizationClass"
            : "departmentClass"
        : isTopLevel
            ? "topTopPositionClass"
            : "positionClass";

    const bottomIndicator = node.subordinates.length;

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

        const result = counter.getVacancyCount({
            departmentId: deptId,
            positionId: isDepartment ? null : posId,
        });

        return result.vacant;
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
            </div>
        );
    }

    return (
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
            {showVacancies && (
                <div
                    style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "#a40000",
                        color: "white",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                >
                    {vacanciesCount}
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
                                    <div className="employee-name flex text-sm items-start">
                                        <span className="w-4 mr-1 shrink-0 text-[#a40000]">{index + 1}.</span>
                                        <span className="break-words">{employee.full_name}</span>
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
            {showVacancies && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        background: "#4b7bec",
                        color: "white",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                    }}
                >
                    {bottomIndicator}
                </div>
            )}
        </div>
    );
};

export default UnifiedPositionCard;
