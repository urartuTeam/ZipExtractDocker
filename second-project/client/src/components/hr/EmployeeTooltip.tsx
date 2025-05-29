import React from "react";
import { Employee, OrgUnit } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface EmployeeTooltipProps {
  visible: boolean;
  employee: Employee | null;
  position: { x: number; y: number };
  nodes: OrgUnit[];
}

export default function EmployeeTooltip({
  visible,
  employee,
  position,
  nodes,
}: EmployeeTooltipProps) {
  // Получаем данные о позиции сотрудника
  const positionId = employee?.positionId;
  const position_data = positionId
    ? nodes.find((node) => node.id === positionId)
    : null;

  // Получаем данные о департаменте
  const departmentId = employee?.departmentId;
  const department = departmentId
    ? nodes.find((node) => node.id === departmentId)
    : null;

  // Получаем данные о руководителе
  const managerId = employee?.managerId;
  const { data: manager } = useQuery({
    queryKey: [`/api/employees/${managerId}`],
    enabled: !!managerId && visible,
  });

  if (!visible || !employee) {
    return null;
  }

  return (
    <div
      className={`employee-tooltip ${visible ? "visible" : ""}`}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="flex items-start mb-3">
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center mr-3">
          <span className="material-icons text-neutral-400">person</span>
        </div>
        <div>
          <h4 className="font-medium">{employee.fullName}</h4>
          <p className="text-sm text-neutral-400">
            {position_data?.name || "Должность не указана"}
            {department?.name ? ` • ${department.name}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        {manager && (
          <div className="flex justify-between">
            <span className="font-medium">Руководитель:</span>
            <span>{manager.fullName}</span>
          </div>
        )}

        {employee.email && (
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{employee.email}</span>
          </div>
        )}

        {employee.phone && (
          <div className="flex justify-between">
            <span className="font-medium">Телефон:</span>
            <span>{employee.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
