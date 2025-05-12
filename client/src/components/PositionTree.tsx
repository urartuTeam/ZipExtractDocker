import React, { useState, useEffect, useRef } from "react";
import "../styles/OrganizationTree.css";

// Типы
interface Position {
  position_id: number;
  name: string;
  sort: number;
  is_category?: boolean;
  deleted: boolean;
  deleted_at: string | null;
  departments?: Array<any>;
  parent_positions?: Array<any>;
  children_positions?: Array<any>;
  is_subordinate?: boolean;
}

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  phone: string | null;
  email: string | null;
  manager_id: number | null;
  department_id: number | null;
  category_parent_id: number | null;
  deleted: boolean;
  deleted_at: string | null;
}

interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization: boolean;
  logo_path: string | null;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
}

interface PositionHierarchyNode {
  position: Position;
  department?: Department;
  employees: Employee[];
  subordinates: PositionHierarchyNode[];
}

interface PositionTreeProps {
  nodes: PositionHierarchyNode[];
  allPositions: Position[];
  allEmployees: Employee[];
  onPositionClick: (positionId: number, departmentId?: number | null) => void;
  handleGoBack: () => void;
  selectedPositionId: number | null;
  hierarchyInitialLevels: number;
  showThreeLevels: boolean;
  showVacancies: boolean;
}

const PositionTree: React.FC<PositionTreeProps> = ({
  nodes,
  allPositions,
  allEmployees,
  onPositionClick,
  handleGoBack,
  selectedPositionId,
  hierarchyInitialLevels,
  showThreeLevels,
  showVacancies,
}) => {
  // Максимальная глубина, которую показываем по умолчанию
  const maxDepth = showThreeLevels ? 3 : hierarchyInitialLevels;

  // Функция для рендеринга узла дерева
  const renderNode = (
    node: PositionHierarchyNode,
    depth: number = 0,
    index: number = 0,
    parentId: number | null = null,
  ) => {
    const { position, employees, subordinates, department } = node;
    const hasSubordinates = subordinates && subordinates.length > 0;
    const isSelected = position.position_id === selectedPositionId;
    const isExpanded = depth < maxDepth || isSelected;
    const departmentId = department?.department_id;

    // Определяем, является ли должность вакантной
    const isVacant = employees.length === 0;

    // Если должность вакантная и showVacancies=false, не показываем её
    if (isVacant && !showVacancies && !hasSubordinates) {
      return null;
    }

    // Если это отрицательный ID, значит это отдел, а не должность
    const isDepartment = position.position_id < 0;

    return (
      <div
        key={`${position.position_id}_${departmentId || "none"}_${index}`}
        className={`position-node ${isSelected ? "selected" : ""} ${
          hasSubordinates ? "has-subordinates" : ""
        } ${isVacant ? "vacant" : ""} ${isDepartment ? "department-node" : ""}`}
      >
        <div
          className="position-info"
          onClick={() => {
            // Не обрабатываем клик для отделов (с отрицательными ID)
            if (!isDepartment) {
              // Передаем ID департамента, если он есть
              onPositionClick(position.position_id, departmentId);
            }
          }}
        >
          <div className="position-name">
            {position.name}{" "}
            {departmentId && (
              <span className="department-context">
                [{department?.name || `Отдел ${departmentId}`}]
              </span>
            )}
          </div>
          <div className="employees-list">
            {employees.map((employee) => (
              <div key={employee.employee_id} className="employee-name">
                {employee.full_name}
              </div>
            ))}
            {isVacant && <div className="vacancy-label">Вакансия</div>}
          </div>
        </div>

        {hasSubordinates && isExpanded && (
          <div className="subordinates-container">
            {subordinates.map((sub, subIndex) =>
              renderNode(
                sub,
                depth + 1,
                subIndex,
                position.position_id,
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="position-tree">
      {nodes.map((node, index) => renderNode(node, 0, index))}
    </div>
  );
};

export default PositionTree;