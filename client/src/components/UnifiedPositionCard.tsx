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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; src: string } | null>(null);

  const isOrganization =
    node.position.position_id / 1000 === node.department?.department_id &&
    node.department?.is_organization;

  let cardClass = isOrganization
          ? "organizationClass"
          : "departmentClass"
    //   : isTopLevel
    //       ? "topTopPositionClass"
    //       : "positionClass";

  const bottomIndicator = node.subordinates.length;
  // Подсчет вакансий
  const vacanciesCount = useMemo(() => {
    // if (!showVacancies) return 0;
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

  console.log(node);
  

  if (isDepartment && isOrganization) {
    return (
        <div
            className={`position-card organization-card department-card`}
            onClick={() => {
              if (onPositionClick) {
                const departmentId = node.department?.department_id || null;
                onPositionClick(node.position.position_id, departmentId);
              }
            }}
        >
          {department && department.logo_path && isOrganization && (
              <img
                  src={department.logo_path}
                  alt={`Логотип ${department.name}`}
                  className="object-contain"
              />
          )}
            {showVacancies && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            top: "0px",
                            right: "37px",
                            background: "#828282",
                            color: "white",
                            borderRadius: "8px",
                            width: "33px",
                            height: "33px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                        }}
                    >
                        {vacanciesCount.total}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: "0px",
                            right: "0px",
                            background: "#C00000",
                            color: "white",
                            borderRadius: "8px",
                            width: "33px",
                            height: "33px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                        }}
                    >
                        {vacanciesCount.vacant}
                    </div>
                </>
            )}
        </div>
    );
  } else if (isDepartment && !isOrganization) {

      console.log('node', node)
      return (
          <div
              className={`position-card department-card ${cardClass}`}
              onClick={() => {
                  if (onPositionClick) {
                      const departmentId =
                          node.departmentContext || department?.department_id || null;
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
                          background: "#C00000",
                          color: "white",
                          borderRadius: "8px",
                          width: "33px",
                          height: "33px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                      }}
                  >
                      {vacanciesCount.vacant}
                  </div>
              )}

              <div className="position-title">
                  {node.position.name.replace(" (отдел)", "")}
              </div>

              {node.employees && node.employees.length > 0 ? (
                  <div className="employee-names">
                      <div key={node.department.manager_id} className="mb-1">
                          <div
                              className={`employee-name flex text-sm ${
                                  !isTopLevel ? "items-center" : "items-center"
                              }`}
                          >
                              {node.department.manager_photo && (
                                  <div
                                      style={{
                                          position: "relative",
                                          display: "inline-block",
                                      }}
                                      onMouseEnter={(e) => {
                                          if (!isTopLevel) {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              setTooltip({
                                                  x: rect.right + 10,
                                                  y: rect.top,
                                                  src: node.department.manager_photo,
                                              });
                                          }
                                      }}
                                      onMouseLeave={() => setTooltip(null)}
                                  >
                                      <img
                                          src={node.department.manager_photo}
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
                                  className={
                                      isTopLevel ? "break-words text-center" : "break-words"
                                  }
                                  style={{
                                      fontSize: isTopLevel ? "1.1rem" : undefined,
                                  }}
                              >
              {node.department.manager_name}
            </span>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="employee-name flex items-center text-sm">
                      <div className="min-w-[50px] min-h-[50px] rounded-full bg-[#DFDFDF] flex items-center justify-center mr-[15px]">
                          {/* SVG — Иконка */}
                          <svg
                              width="36"
                              height="32"
                              viewBox="0 0 36 32"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                          >
                              <path
                                  d="M0.500015 31.9831C0.768015 32.0501 1.04201 31.8951 1.11201 31.6291C2.14201 27.7861 6.32802 26.7901 8.83002 26.1941C9.45702 26.0451 9.95202 25.9271 10.274 25.7881C13.124 24.5511 14.053 22.5611 14.331 21.1091C14.365 20.9341 14.302 20.7541 14.166 20.6361C12.682 19.3551 11.43 17.4321 10.64 15.2201C10.618 15.1571 10.583 15.0991 10.537 15.0491C9.49201 13.9131 8.89202 12.7121 8.89202 11.7551C8.89202 11.1961 9.10301 10.8211 9.57802 10.5381C9.72302 10.4511 9.81402 10.2981 9.82102 10.1301C10.042 5.03605 13.67 1.02605 18.12 1.00005C18.125 1.00005 18.222 1.00705 18.227 1.00705C22.699 1.06905 26.304 5.16505 26.433 10.3311C26.437 10.4741 26.501 10.6081 26.611 10.7001C26.924 10.9651 27.07 11.3011 27.07 11.7571C27.07 12.5581 26.643 13.5431 25.869 14.5291C25.832 14.5761 25.804 14.6301 25.785 14.6871C24.985 17.2231 23.549 19.4621 21.847 20.8321C21.703 20.9481 21.635 21.1341 21.669 21.3151C21.947 22.7661 22.876 24.7551 25.726 25.9941C26.063 26.1401 26.586 26.2541 27.249 26.3971C29.726 26.9331 33.871 27.8321 34.888 31.6291C34.948 31.8521 35.15 31.9991 35.37 31.9991C35.413 31.9991 35.456 31.9931 35.5 31.9821C35.767 31.9101 35.925 31.6361 35.854 31.3691C34.679 26.9821 29.983 25.9651 27.461 25.4191C26.876 25.2921 26.371 25.1831 26.125 25.0751C24.265 24.2671 23.119 23.0361 22.714 21.4101C24.441 19.9271 25.886 17.6391 26.712 15.0731C27.589 13.9331 28.071 12.7591 28.071 11.7561C28.071 11.0871 27.855 10.5291 27.427 10.0931C27.189 4.48905 23.19 0.0760518 18.227 0.00505176L18.078 0.00305176C13.205 0.0290518 9.18902 4.32605 8.83802 9.83305C8.21202 10.2931 7.89401 10.9381 7.89401 11.7571C7.89401 12.9401 8.56301 14.3551 9.73402 15.6531C10.543 17.8761 11.797 19.8291 13.29 21.1961C12.887 22.8281 11.74 24.0631 9.87602 24.8721C9.63502 24.9771 9.15501 25.0921 8.59902 25.2241C6.05802 25.8281 1.33001 26.9531 0.146015 31.3711C0.0750149 31.6381 0.233015 31.9111 0.500015 31.9831Z"
                                  fill="#828282"
                              />
                          </svg>
                      </div>
                      <span className="break-words text-center text-[#828282]">
          Должность вакантна
        </span>
                  </div>
              )}

              {!isTopLevel && (
                  <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[#D9D9D9]">
        <span className="text-lg text-[#828282] leading-none">
          Общее количество
        </span>
                      <span className="text-lg text-[#C00000] leading-none">
          {vacanciesCount.total}
        </span>
                  </div>
              )}
          </div>
      );

  }
    return (
        <>
            <div
                className={`position-card ${cardClass} ${
                    isDepartment ? "department-card" : ""
                }`}
                onClick={() => {
                    if (onPositionClick) {
                        const departmentId =
                            node.departmentContext || department?.department_id || null;
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
                    <>
                        <div
                            style={{
                                position: "absolute",
                                top: "0px",
                                right: "0px",
                                background: "#C00000",
                                color: "white",
                                borderRadius: "8px",
                                width: "33px",
                                height: "33px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                            }}
                        >
                            {vacanciesCount.vacant}
                        </div>
                    </>
                )}

                {isTopLevel ? (
                    <div className="flex items-center">
                        <div className="w-[100px] h-[100px] overflow-hidden rounded-full bg-[#DFDFDF] mr-[15px]">
                            <img src={node.employees[0]?.photo_url} alt="photo"/>
                        </div>
                        <div>
                            <div className="position-title">{node.position.name}</div>
                            <span
                                className={
                                    isTopLevel ? "break-words text-center" : "break-words"
                                }
                                style={{fontSize: isTopLevel ? "1.1rem" : undefined}}
                            >
                  {node.employees[0]?.full_name}
                </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="position-title">
                            {isDepartment
                                ? node.position.name.replace(" (отдел)", "")
                                : node.position.name}
                        </div>

                        {isDepartment ? (
                            <div className="department-type">Отдел</div>
                        ) : (
                            <>
                                {node.employees && node.employees.length > 0 ? (
                                    <div className="employee-names">
                                        {node.employees.map((employee, index) => (
                                            <div key={employee.employee_id} className="mb-1">
                                                <div
                                                    className={`employee-name flex text-sm ${
                                                        !isTopLevel ? "items-center" : "items-center"
                                                    }`}
                                                >
                                                    {employee.photo_url && (
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                display: "inline-block",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isTopLevel) {
                                                                    const rect =
                                                                        e.currentTarget.getBoundingClientRect();
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
                                                                    margin: isTopLevel
                                                                        ? "0 0 8px 0"
                                                                        : "0 8px 0 0",
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {!employee.photo_url && (
                                                        <div
                                                            className="min-w-[50px] min-h-[50px] rounded-full bg-[#DFDFDF] flex items-center justify-center mr-[15px]">
                                                            <svg
                                                                width="36"
                                                                height="32"
                                                                viewBox="0 0 36 32"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M0.500015 31.9831C0.768015 32.0501 1.04201 31.8951 1.11201 31.6291C2.14201 27.7861 6.32802 26.7901 8.83002 26.1941C9.45702 26.0451 9.95202 25.9271 10.274 25.7881C13.124 24.5511 14.053 22.5611 14.331 21.1091C14.365 20.9341 14.302 20.7541 14.166 20.6361C12.682 19.3551 11.43 17.4321 10.64 15.2201C10.618 15.1571 10.583 15.0991 10.537 15.0491C9.49201 13.9131 8.89202 12.7121 8.89202 11.7551C8.89202 11.1961 9.10301 10.8211 9.57802 10.5381C9.72302 10.4511 9.81402 10.2981 9.82102 10.1301C10.042 5.03605 13.67 1.02605 18.12 1.00005C18.125 1.00005 18.222 1.00705 18.227 1.00705C22.699 1.06905 26.304 5.16505 26.433 10.3311C26.437 10.4741 26.501 10.6081 26.611 10.7001C26.924 10.9651 27.07 11.3011 27.07 11.7571C27.07 12.5581 26.643 13.5431 25.869 14.5291C25.832 14.5761 25.804 14.6301 25.785 14.6871C24.985 17.2231 23.549 19.4621 21.847 20.8321C21.703 20.9481 21.635 21.1341 21.669 21.3151C21.947 22.7661 22.876 24.7551 25.726 25.9941C26.063 26.1401 26.586 26.2541 27.249 26.3971C29.726 26.9331 33.871 27.8321 34.888 31.6291C34.948 31.8521 35.15 31.9991 35.37 31.9991C35.413 31.9991 35.456 31.9931 35.5 31.9821C35.767 31.9101 35.925 31.6361 35.854 31.3691C34.679 26.9821 29.983 25.9651 27.461 25.4191C26.876 25.2921 26.371 25.1831 26.125 25.0751C24.265 24.2671 23.119 23.0361 22.714 21.4101C24.441 19.9271 25.886 17.6391 26.712 15.0731C27.589 13.9331 28.071 12.7591 28.071 11.7561C28.071 11.0871 27.855 10.5291 27.427 10.0931C27.189 4.48905 23.19 0.0760518 18.227 0.00505176L18.078 0.00305176C13.205 0.0290518 9.18902 4.32605 8.83802 9.83305C8.21202 10.2931 7.89401 10.9381 7.89401 11.7571C7.89401 12.9401 8.56301 14.3551 9.73402 15.6531C10.543 17.8761 11.797 19.8291 13.29 21.1961C12.887 22.8281 11.74 24.0631 9.87602 24.8721C9.63502 24.9771 9.15501 25.0921 8.59902 25.2241C6.05802 25.8281 1.33001 26.9531 0.146015 31.3711C0.0750149 31.6381 0.233015 31.9111 0.500015 31.9831Z"
                                                                    fill="#828282"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <span
                                                        className={
                                                            isTopLevel
                                                                ? "break-words text-center"
                                                                : "break-words"
                                                        }
                                                        style={{
                                                            fontSize: isTopLevel ? "1.1rem" : undefined,
                                                        }}
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
                                    <div className="employee-name flex items-center text-sm">
                                        <div
                                            className="min-w-[50px] min-h-[50px] rounded-full bg-[#DFDFDF] flex items-center justify-center mr-[15px]">
                                            <svg
                                                width="36"
                                                height="32"
                                                viewBox="0 0 36 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M0.500015 31.9831C0.768015 32.0501 1.04201 31.8951 1.11201 31.6291C2.14201 27.7861 6.32802 26.7901 8.83002 26.1941C9.45702 26.0451 9.95202 25.9271 10.274 25.7881C13.124 24.5511 14.053 22.5611 14.331 21.1091C14.365 20.9341 14.302 20.7541 14.166 20.6361C12.682 19.3551 11.43 17.4321 10.64 15.2201C10.618 15.1571 10.583 15.0991 10.537 15.0491C9.49201 13.9131 8.89202 12.7121 8.89202 11.7551C8.89202 11.1961 9.10301 10.8211 9.57802 10.5381C9.72302 10.4511 9.81402 10.2981 9.82102 10.1301C10.042 5.03605 13.67 1.02605 18.12 1.00005C18.125 1.00005 18.222 1.00705 18.227 1.00705C22.699 1.06905 26.304 5.16505 26.433 10.3311C26.437 10.4741 26.501 10.6081 26.611 10.7001C26.924 10.9651 27.07 11.3011 27.07 11.7571C27.07 12.5581 26.643 13.5431 25.869 14.5291C25.832 14.5761 25.804 14.6301 25.785 14.6871C24.985 17.2231 23.549 19.4621 21.847 20.8321C21.703 20.9481 21.635 21.1341 21.669 21.3151C21.947 22.7661 22.876 24.7551 25.726 25.9941C26.063 26.1401 26.586 26.2541 27.249 26.3971C29.726 26.9331 33.871 27.8321 34.888 31.6291C34.948 31.8521 35.15 31.9991 35.37 31.9991C35.413 31.9991 35.456 31.9931 35.5 31.9821C35.767 31.9101 35.925 31.6361 35.854 31.3691C34.679 26.9821 29.983 25.9651 27.461 25.4191C26.876 25.2921 26.371 25.1831 26.125 25.0751C24.265 24.2671 23.119 23.0361 22.714 21.4101C24.441 19.9271 25.886 17.6391 26.712 15.0731C27.589 13.9331 28.071 12.7591 28.071 11.7561C28.071 11.0871 27.855 10.5291 27.427 10.0931C27.189 4.48905 23.19 0.0760518 18.227 0.00505176L18.078 0.00305176C13.205 0.0290518 9.18902 4.32605 8.83802 9.83305C8.21202 10.2931 7.89401 10.9381 7.89401 11.7571C7.89401 12.9401 8.56301 14.3551 9.73402 15.6531C10.543 17.8761 11.797 19.8291 13.29 21.1961C12.887 22.8281 11.74 24.0631 9.87602 24.8721C9.63502 24.9771 9.15501 25.0921 8.59902 25.2241C6.05802 25.8281 1.33001 26.9531 0.146015 31.3711C0.0750149 31.6381 0.233015 31.9111 0.500015 31.9831Z"
                            fill="#828282"
                          />
                        </svg>
                      </div>
                      <span className="break-words text-center text-[#828282]">
                        Должность вакантна
                      </span>
                    </div>
                  )}
                  {!isTopLevel && (
                    <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[#D9D9D9]">
                      <span className="text-lg text-[#828282] leading-none">
                        Общее количество
                      </span>
                      <span className="text-lg text-[#C00000] leading-none">
                        {vacanciesCount.total}
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

      </>
    );
};

export default UnifiedPositionCard;
