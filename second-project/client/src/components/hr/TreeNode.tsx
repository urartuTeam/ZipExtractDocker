import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { OrgUnit, Employee, entityTypes } from "@shared/schema";
import EmployeeItem from "./EmployeeItem";

interface TreeNodeProps {
  node: OrgUnit;
  employees: Employee[];
  headEmployee: Employee | null;
  onAddClick: () => void;
  onDrag: (x: number, y: number) => void;
  onDragStop: (x: number, y: number) => void;
  onEmployeeDrop: (employeeId: number) => void;
  onEmployeeHover: (employee: Employee, x: number, y: number) => void;
  onEmployeeLeave: () => void;
  registerRef: (ref: HTMLDivElement | null) => void;
}

export default function TreeNode({
  node,
  employees,
  headEmployee,
  onAddClick,
  onDrag,
  onDragStop,
  onEmployeeDrop,
  onEmployeeHover,
  onEmployeeLeave,
  registerRef,
}: TreeNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Определяем класс на основе типа узла
  const getNodeClass = () => {
    if (node.isOrganization) return "node-organization";
    if (node.isManagement) return "node-management";
    if (node.isDepartment) return "node-department";
    if (node.isPosition) return "node-position";
    return "";
  };

  // Получаем иконку на основе типа узла
  const getNodeIcon = () => {
    if (node.isOrganization) return "business";
    if (node.isManagement) return "account_balance";
    if (node.isDepartment) return "groups";
    if (node.isPosition) return "work";
    return "category";
  };

  // Получаем название типа узла
  const getNodeTypeName = () => {
    if (node.isOrganization) return "Организация";
    if (node.isManagement) return "Управление";
    if (node.isDepartment) return "Отдел";
    if (node.isPosition) return "Должность";
    return "Ячейка";
  };

  // Обработка начала перетаскивания
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Обработка перетаскивания
  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    onDrag(data.x, data.y);
  };

  // Обработка завершения перетаскивания
  const handleDragStop = (_e: any, data: { x: number; y: number }) => {
    setIsDragging(false);
    onDragStop(data.x, data.y);
  };

  // Обработка входа сотрудника в зону узла
  const handleEmployeeDragEnter = () => {
    if (node.isPosition) {
      setIsDropTarget(true);
    }
  };

  // Обработка выхода сотрудника из зоны узла
  const handleEmployeeDragLeave = () => {
    setIsDropTarget(false);
  };

  // Обработка сброса сотрудника на узел
  const handleEmployeeDrop = (employeeId: number) => {
    if (node.isPosition) {
      onEmployeeDrop(employeeId);
      setIsDropTarget(false);
    }
  };

  // Позиционные стили
  const position = {
    x: node.positionX || 0,
    y: node.positionY || 0,
  };

  return (
    <Draggable
      handle=".node-header"
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      nodeRef={nodeRef}
    >
      <div
        ref={(ref) => {
          if (nodeRef.current !== ref) {
            nodeRef.current = ref;
          }
          registerRef(ref);
        }}
        className={`tree-node ${getNodeClass()} ${isDragging ? "dragging" : ""} ${isDropTarget ? "drop-zone active" : "drop-zone"}`}
        onDragEnter={handleEmployeeDragEnter}
        onDragLeave={handleEmployeeDragLeave}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* Заголовок ячейки */}
        <div className="node-header">
          <div className="node-icon">
            <span className="material-icons">{getNodeIcon()}</span>
          </div>
          <div className="node-title">
            <h3>{node.name}</h3>
            <div className="node-subtitle">
              <span className="node-type-badge">{getNodeTypeName()}</span>
              {node.isPosition && node.staffCount && (
                <span className="ml-2 text-gray-500 text-xs">
                  Штат: {node.staffCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Контент ячейки */}
        <div className="node-content">
          {/* Логотип для организации */}
          {node.isOrganization && node.logo && (
            <div className="mb-3 border rounded p-2 bg-gray-50 flex items-center justify-center">
              <img src={node.logo} alt="Логотип" className="max-h-12" />
            </div>
          )}

          {/* Руководитель для отдела/управления */}
          {(node.isDepartment || node.isManagement) && headEmployee && (
            <div className="mb-3 bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500 mb-1">Руководитель:</div>
              <div className="flex items-center">
                <div className="employee-avatar">
                  {headEmployee.fullName.charAt(0)}
                  {headEmployee.fullName.charAt(0)}
                </div>
                <div className="employee-name">{headEmployee.fullName}</div>
              </div>
            </div>
          )}

          {/* Сотрудники для должности */}
          {node.isPosition && (
            <div className="employee-list">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <EmployeeItem
                    key={employee.id}
                    employee={employee}
                    onDrop={() => {}}
                    onHover={(x, y) => onEmployeeHover(employee, x, y)}
                    onLeave={onEmployeeLeave}
                  />
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-2">
                  Нет сотрудников
                </div>
              )}
            </div>
          )}

          {/* Кнопка добавления сотрудника для должности */}
          {node.isPosition && (
            <button className="add-button mt-2" onClick={onAddClick}>
              <span className="material-icons text-sm mr-1">person_add</span>
              <span>Добавить сотрудника</span>
            </button>
          )}

          {/* Кнопка добавления дочернего элемента */}
          <button className="add-button mt-2" onClick={onAddClick}>
            <span className="material-icons text-sm mr-1">add</span>
            <span>Добавить элемент</span>
          </button>
        </div>
      </div>
    </Draggable>
  );
}
