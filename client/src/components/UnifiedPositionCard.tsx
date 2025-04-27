import React from 'react';

// Импортируем типы
type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
}

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
}

// Типы узлов в иерархии должностей
type PositionHierarchyNode = {
  position: Position;
  employee: Employee | null;
  subordinates: PositionHierarchyNode[];
  childDepartments?: Department[]; // Добавляем поле для хранения подчиненных отделов
}

// Компонент для унифицированного отображения карточки позиции/отдела
const UnifiedPositionCard = ({
  node,
  onPositionClick,
  isTopLevel = false
}: {
  node: PositionHierarchyNode,
  onPositionClick?: (positionId: number) => void,
  isTopLevel?: boolean
}) => {
  const isDepartment = node.position.name.includes('(отдел)');
  
  // Определяем класс на основе типа узла и положения в дереве
  const cardClass = isDepartment 
    ? 'departmentClass' // Класс для отделов
    : isTopLevel 
      ? 'topTopPositionClass' // Класс для должностей верхнего уровня
      : 'positionClass'; // Класс для обычных должностей
  
  return (
    <div 
      className={`position-card ${cardClass} ${isDepartment ? 'department-card' : ''}`}
      onClick={() => onPositionClick && onPositionClick(node.position.position_id)}
      style={{ 
        cursor: onPositionClick ? 'pointer' : 'default',
        backgroundColor: isDepartment ? '#f0f4ff' : undefined, 
        borderColor: isDepartment ? '#4b7bec' : undefined
      }}
    >
      <div className="position-title">
        {isDepartment 
          ? node.position.name.replace(' (отдел)', '') 
          : node.position.name}
      </div>
      
      {/* Только для должностей (не отделов) показываем сотрудника или вакансию */}
      {!isDepartment && (
        <>
          <div className="position-divider"></div>
          {node.employee ? (
            <div className="employee-name">{node.employee.full_name}</div>
          ) : (
            <div className="position-vacant">Вакантная должность</div>
          )}
        </>
      )}
      
      {/* Отображаем дочерние отделы для должности */}
      {node.childDepartments && node.childDepartments.length > 0 && (
        <div className="child-departments">
          <div className="child-departments-title">Подчиненные отделы:</div>
          {node.childDepartments.map((dept) => (
            <div key={dept.department_id} className="child-department-name">
              {dept.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedPositionCard;