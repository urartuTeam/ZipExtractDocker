import React from "react";
import {
  Position,
  Employee,
  Department,
  PositionHierarchyNode,
} from "../types";

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

  // Рекурсивный подсчет статистики для узла и всех его дочерних узлов
  const calculateNodeStats = (position: PositionHierarchyNode): { 
    total: number; 
    occupied: number; 
    vacant: number; 
  } => {
    // Начальное значение статистики для текущего узла
    let currentNodeStats = {
      total: 0,      // Общее количество должностей
      occupied: 0,   // Занятые должности
      vacant: 0      // Вакантные должности
    };
    
    // Считаем текущий узел/позицию
    // Считаем минимум 1 должность для текущей позиции
    currentNodeStats.total = 1;
    
    // Если у узла есть сотрудники, считаем его занятым, иначе - вакантным
    if (position.employees && position.employees.length > 0) {
      currentNodeStats.occupied = 1;
    } else {
      currentNodeStats.vacant = 1;
    }
    
    // Рекурсивно обрабатываем всех подчиненных и добавляем их статистику
    if (position.subordinates && Array.isArray(position.subordinates)) {
      for (const subordinate of position.subordinates) {
        const subordinateStats = calculateNodeStats(subordinate);
        currentNodeStats.total += subordinateStats.total;
        currentNodeStats.occupied += subordinateStats.occupied;
        currentNodeStats.vacant += subordinateStats.vacant;
      }
    }
    
    // Возвращаем общую статистику для этого узла и всех его дочерних узлов
    return currentNodeStats;
  };

  // Вычисляем статистику текущего узла и всех его дочерних узлов
  const nodeStats = calculateNodeStats(node);
  
  // Получаем количество вакансий для индикаторов
  // Если узел раскрыт (subordinates показываются отдельно), показываем только его собственную статистику
  // Если узел свернут, показываем общую статистику включая все дочерние узлы
  const isExpanded = false; // В будущем можно добавить проп для определения, раскрыт ли узел
  
  // Вычисляем количество вакансий для индикаторов
  const totalPositions = isExpanded ? 1 : nodeStats.total;
  const occupiedPositions = isExpanded ? (node.employees && node.employees.length > 0 ? 1 : 0) : nodeStats.occupied;
  const vacanciesCount = totalPositions - occupiedPositions;

  return (
    <div
      className={`position-card ${cardClass} ${isDepartment ? "department-card" : ""}`}
      onClick={() => {
        if (onPositionClick) {
          // Приоритет отдаем явному контексту отдела, который мог быть передан в ноду
          const departmentId = node.departmentContext || department?.department_id || null;
          console.log(`Клик на должность ${node.position.name} (ID: ${node.position.position_id}) с контекстом отдела: ${departmentId}`);
          onPositionClick(node.position.position_id, departmentId);
        }
      }}
      style={{
        cursor: onPositionClick ? "pointer" : "default",
        position: "relative", // Добавляем позиционирование для абсолютных элементов
      }}
    >
      {/* Статистический блок в правом верхнем углу, показывается только если включены вакансии */}
      {showVacancies && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
            background: "rgba(255,255,255,0.9)",
            borderRadius: "4px",
            padding: "4px 6px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: "#666", fontSize: "9px", marginBottom: "2px" }}>Всего / Занято / Вакантно</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ color: "#333" }}>{totalPositions}</span>
              <span style={{ color: "#0984e3" }}>{occupiedPositions}</span>
              <span style={{ color: "#a40000" }}>{vacanciesCount}</span>
            </div>
          </div>
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


    </div>
  );
};

export default UnifiedPositionCard;
