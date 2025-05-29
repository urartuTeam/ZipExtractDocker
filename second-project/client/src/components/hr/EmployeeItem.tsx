import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Employee } from "@shared/schema";
import { getEmployeeInitials } from "@/lib/employee-utils";

interface EmployeeItemProps {
  employee: Employee;
  onDrop: (employeeId: number) => void;
  onHover: (x: number, y: number) => void;
  onLeave: () => void;
}

export default function EmployeeItem({
  employee,
  onDrop,
  onHover,
  onLeave,
}: EmployeeItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Настройка перетаскивания (drag & drop)
  const [{ opacity }, drag] = useDrag({
    type: "employee",
    item: { id: employee.id, type: "employee" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ id: number }>();
      if (item && dropResult) {
        onDrop(employee.id);
      }
      setIsDragging(false);
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    previewOptions: {
      offsetX: 0,
      offsetY: 0,
    },
  });

  // Подключаем функциональность drag к компоненту
  drag(ref);

  // Инициалы сотрудника для аватара
  const initials = getEmployeeInitials(employee);

  // Полное имя сотрудника
  const fullName = `${employee.fullName}`.trim();

  // Обработка наведения мыши
  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      // Вычисляем позицию для всплывающей подсказки
      const x = rect.right + 10;
      const y = rect.top;
      onHover(x, y);
    }
  };

  return (
    <div
      ref={ref}
      className={`employee-item ${isDragging ? "dragging" : ""}`}
      style={{ opacity }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
    >
      <div className="employee-avatar">{initials}</div>
      <div className="employee-name">{fullName}</div>
    </div>
  );
}
