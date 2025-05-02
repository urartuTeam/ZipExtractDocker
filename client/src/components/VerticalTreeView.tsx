import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import "./VerticalTreeView.css";

// Тип данных для информации о сотруднике
type EmployeeInfo = {
  id: number;
  fullName: string;
};

// Определяем тип TreeNode локально
type TreeNode = {
  id: string;
  name: string;
  type: "department" | "position";
  children: TreeNode[];
  sort: number;
  // Дополнительные поля
  positionId?: number;
  departmentId?: number;
  employee?: EmployeeInfo;
};

type VerticalTreeViewProps = {
  onNodeSelect?: (id: string, type: string) => void;
};

const VerticalTreeView: React.FC<VerticalTreeViewProps> = ({ onNodeSelect }) => {
  const { data: treeData, isLoading, error } = useQuery<{status: string, data: TreeNode[]}>({
    queryKey: ["/api/tree"],
    staleTime: 60000, // кэшировать данные на 1 минуту
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Загрузка структуры организации...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Ошибка загрузки данных: {(error as Error).message}</div>;
  }

  if (!treeData || !treeData.data || treeData.data.length === 0) {
    return <div className="p-4">Нет данных для отображения</div>;
  }

  // Сортируем корневые узлы по полю sort
  const sortedRootNodes = [...treeData.data].sort((a, b) => a.sort - b.sort);

  return (
    <div className="vertical-tree-container">
      <h2 className="tree-title">Организационная структура</h2>
      <div className="tree-content">
        {sortedRootNodes.map((rootNode) => (
          <DepartmentNode 
            key={rootNode.id} 
            node={rootNode} 
            onNodeSelect={onNodeSelect}
            level={1}
          />
        ))}
      </div>
    </div>
  );
};

// Компонент для отображения узла отдела
const DepartmentNode: React.FC<{
  node: TreeNode;
  onNodeSelect?: (id: string, type: string) => void;
  level: number;
}> = ({ node, onNodeSelect, level }) => {
  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Разделяем дочерние узлы по типу и сортируем их
  const childDepartments = node.children
    .filter(child => child.type === "department")
    .sort((a, b) => a.sort - b.sort);
    
  const childPositions = node.children
    .filter(child => child.type === "position")
    .sort((a, b) => a.sort - b.sort);
  
  const hasChildren = childPositions.length > 0 || childDepartments.length > 0;
  
  const handleClick = () => {
    if (onNodeSelect) {
      // Извлекаем числовой ID из строки (например, "d21" -> 21)
      const numericId = node.id.substring(1);
      onNodeSelect(numericId, node.type);
    }
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="department-root" ref={nodeRef}>
      {/* Карточка отдела */}
      <div className="department-card" onClick={handleClick}>
        <div className="department-title">{node.name}</div>
        <div className="position-divider"></div>
        <div className="department-type">Отдел</div>
        
        {/* Индикатор количества подчиненных элементов */}
        {hasChildren && (
          <div className="count-badge">
            {childPositions.length + childDepartments.length}
          </div>
        )}
      </div>
      
      {/* Индикатор развернутости */}
      {hasChildren && (
        <div className="expanded-indicator" onClick={toggleExpand}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      )}
      
      {/* Отображаем дочерние элементы, если отдел развернут */}
      {expanded && hasChildren && (
        <div className="children-container">
          {/* Вертикальная линия под отделом */}
          <div 
            className="vertical-line" 
            style={{
              top: '100%',
              height: '30px',
              left: '50%',
            }}
          ></div>
          
          {/* Дочерние должности */}
          {childPositions.length > 0 && (
            <div className="positions-container">
              <div className="position-row">
                {/* Горизонтальная линия, соединяющая все должности */}
                {childPositions.length > 1 && (
                  <div 
                    className="horizontal-line" 
                    style={{
                      top: '50%',
                      width: `${(childPositions.length - 1) * 250}px`,
                      left: `${125 - ((childPositions.length - 1) * 250) / 2}px`,
                    }}
                  ></div>
                )}
                
                {/* Отображаем должности */}
                {childPositions.map((position) => (
                  <PositionNode 
                    key={position.id} 
                    node={position} 
                    onNodeSelect={onNodeSelect}
                    level={level + 1}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Дочерние отделы */}
          {childDepartments.length > 0 && (
            <div className="child-department-container">
              {childDepartments.map((department) => (
                <DepartmentNode 
                  key={department.id} 
                  node={department} 
                  onNodeSelect={onNodeSelect}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Компонент для отображения узла должности
const PositionNode: React.FC<{
  node: TreeNode;
  onNodeSelect?: (id: string, type: string) => void;
  level: number;
}> = ({ node, onNodeSelect, level }) => {
  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Разделяем дочерние узлы по типу и сортируем их
  const childDepartments = node.children
    .filter(child => child.type === "department")
    .sort((a, b) => a.sort - b.sort);
    
  const childPositions = node.children
    .filter(child => child.type === "position")
    .sort((a, b) => a.sort - b.sort);
  
  const hasChildren = childPositions.length > 0 || childDepartments.length > 0;
  
  const handleClick = () => {
    if (onNodeSelect) {
      // Извлекаем числовой ID из строки (например, "p39" -> 39)
      const numericId = node.id.substring(1);
      onNodeSelect(numericId, node.type);
    }
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Определяем класс уровня для применения разных стилей в зависимости от глубины
  const levelClass = `level-${Math.min(level, 3)}`;

  return (
    <div className={`position-node ${levelClass}`} ref={nodeRef}>
      {/* Вертикальная линия над должностью */}
      <div 
        className="vertical-line" 
        style={{
          top: '-15px',
          height: '15px',
          left: '50%',
        }}
      ></div>
      
      {/* Карточка должности */}
      <div className="position-card" onClick={handleClick}>
        <div className="position-title">{node.name}</div>
        <div className="position-divider"></div>
        
        {/* Отображаем сотрудника, если есть */}
        {node.employee ? (
          <div className="employee-name">
            <User size={14} className="inline mr-1" />
            {node.employee.fullName}
          </div>
        ) : (
          <div className="position-vacant">Вакантная должность</div>
        )}
        
        {/* Показываем количество дочерних элементов */}
        {hasChildren && (
          <div className="count-badge">
            {childPositions.length + childDepartments.length}
          </div>
        )}
      </div>
      
      {/* Индикатор развернутости */}
      {hasChildren && (
        <div className="expanded-indicator" onClick={toggleExpand}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      )}
      
      {/* Отображаем дочерние элементы, если должность развернута */}
      {expanded && hasChildren && (
        <div className="children-container">
          {/* Вертикальная линия под должностью */}
          <div 
            className="vertical-line" 
            style={{
              top: '100%',
              height: '30px',
              left: '50%',
            }}
          ></div>
          
          {/* Дочерние должности */}
          {childPositions.length > 0 && (
            <div className="positions-container">
              <div className="position-row">
                {/* Горизонтальная линия, соединяющая все должности */}
                {childPositions.length > 1 && (
                  <div 
                    className="horizontal-line" 
                    style={{
                      top: '50%',
                      width: `${(childPositions.length - 1) * 250}px`,
                      left: `${125 - ((childPositions.length - 1) * 250) / 2}px`,
                    }}
                  ></div>
                )}
                
                {/* Отображаем должности */}
                {childPositions.map((position) => (
                  <PositionNode 
                    key={position.id} 
                    node={position} 
                    onNodeSelect={onNodeSelect} 
                    level={level + 1}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Дочерние отделы */}
          {childDepartments.length > 0 && (
            <div className="child-department-container">
              {childDepartments.map((department) => (
                <DepartmentNode 
                  key={department.id} 
                  node={department} 
                  onNodeSelect={onNodeSelect}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerticalTreeView;