import React from "react";
import { Position, Employee, Department, PositionHierarchyNode } from "@shared/types";

// Компонент для унифицированного отображения карточки позиции/отдела
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

  // Определяем класс на основе типа узла и положения в дереве
  let cardClass = isDepartment
    ? isOrganization
      ? "organizationClass" // Класс для организаций
      : "departmentClass" // Класс для отделов
    : isTopLevel
      ? "topTopPositionClass" // Класс для должностей верхнего уровня
      : "positionClass"; // Класс для обычных должностей

  // Генерируем числовые индикаторы для правого верхнего и нижнего угла
  // В данном случае берем ID позиции/отдела и количество подчиненных
  const topIndicator = node.position.position_id % 10; // Берем последнюю цифру ID
  const bottomIndicator = node.subordinates.length; // Количество подчиненных

  // Если это организация, создаем упрощенную карточку
  if (isDepartment && isOrganization) {
    return (
      <div
        className={`position-card ${cardClass} department-card`}
        onClick={() => {
          if (onPositionClick) {
            // Если есть department, передаем его ID, если нет - null
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
          // width: "100%",
        }}
      >
        {department && department.logo_path ? (
          <img
            src={department.logo_path}
            alt={`Логотип ${department.name}`}
            className="mr-4 w-8 h-8 object-contain"
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

  // Стандартный рендер для других типов карточек
  const countEmployees = (position: PositionHierarchyNode) => {
      let count = 0;

      console.log(position.employees);


      // Считаем сотрудников в текущем объекте
      if (position.employees && Array.isArray(position.employees)) {
          count += position.employees.length;
      }

      // Рекурсивно обрабатываем всех подчиненных
      if (position.subordinates && Array.isArray(position.subordinates)) {
          for (const subordinate of position.subordinates) {
              count += countEmployees(subordinate);
          }
      }

      return count;
  }

  // if (isTopLevel) {
  //   console.log(countEmployees(node));
  // }

  return (
    <div
      className={`position-card ${cardClass} ${isDepartment ? "department-card" : ""}`}
      onClick={() => {
        if (onPositionClick) {
          const departmentId = department?.department_id || null;
          
          // Исправление для должностей с дочерними отделами
          const positionHasChildDepartments = node.childDepartments && node.childDepartments.length > 0;
          
          if (positionHasChildDepartments) {
            console.log(`Клик на должность ${node.position.name} с ${node.childDepartments.length} дочерними отделами`);
          }
          
          onPositionClick(node.position.position_id, departmentId);
        }
      }}
      style={{
        cursor: onPositionClick ? "pointer" : "default",
        position: "relative", // Добавляем позиционирование для абсолютных элементов
      }}
    >
      {/* Индикатор в правом верхнем углу, показывается только если включены вакансии */}
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
          {topIndicator}
        </div>
      )}

      <div className="position-title">
        {isDepartment
          ? node.position.name.replace(" (отдел)", "")
          : node.position.name}
      </div>

      {/* Для всех карточек добавляем разделитель */}
      <div className="position-divider"></div>

      {/* Для отделов показываем слово "Отдел", для должностей - сотрудников или вакансию */}
      {isDepartment ? (
        <div className="department-type">Отдел</div>
      ) : (
        <>
          {node.employees && node.employees.length > 0 ? (
            <div className="employee-names">
              {node.employees.map((employee, index) => (
                <div key={employee.employee_id} className="employee-name">
                  {employee.full_name}
                  {index < node.employees.length - 1 && (
                    <div className="employee-divider"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="position-vacant">Вакантная должность</div>
          )}
        </>
      )}

      {/* Отображаем индикатор, что есть подчиненные отделы, но сами отделы будут отображаться отдельно в дереве */}
      {node.childDepartments && node.childDepartments.length > 0 && (
        <div className="has-child-departments">
          <div className="child-departments-count">
            Управляет {node.childDepartments.length} {node.childDepartments.length === 1 ? 'отделом' : 'отделами'}
          </div>
        </div>
      )}

      {/* Индикатор в правом нижнем углу, показывается только если включены вакансии */}
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
