import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
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

  return (
    <div className="vertical-tree-container">
      <h2 className="tree-title">Организационная структура</h2>
      <div className="tree-content">
        {treeData.data.map((rootNode) => (
          <DepartmentNode 
            key={rootNode.id} 
            node={rootNode} 
            onNodeSelect={onNodeSelect} 
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
}> = ({ node, onNodeSelect }) => {
  const [expanded, setExpanded] = useState(true);
  
  // Разделяем дочерние узлы по типу
  const childDepartments = node.children.filter(child => child.type === "department");
  const childPositions = node.children.filter(child => child.type === "position");
  
  const handleClick = () => {
    if (onNodeSelect) {
      // Извлекаем числовой ID из строки (например, "d21" -> 21)
      const numericId = node.id.substring(1);
      onNodeSelect(numericId, node.type);
    }
    setExpanded(!expanded); // Разворачиваем/сворачиваем при клике
  };

  return (
    <div className="department-root">
      {/* Карточка отдела */}
      <div className="department-card" onClick={handleClick}>
        <div className="department-title">{node.name}</div>
        <div className="position-divider"></div>
        <div className="department-type">Отдел</div>
      </div>
      
      {/* Отображаем дочерние элементы, если отдел развернут */}
      {expanded && (childPositions.length > 0 || childDepartments.length > 0) && (
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
                {childPositions.map((position, index) => (
                  <PositionNode 
                    key={position.id} 
                    node={position} 
                    onNodeSelect={onNodeSelect} 
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
}> = ({ node, onNodeSelect }) => {
  const [expanded, setExpanded] = useState(true);
  
  // Разделяем дочерние узлы по типу
  const childDepartments = node.children.filter(child => child.type === "department");
  const childPositions = node.children.filter(child => child.type === "position");
  
  const handleClick = () => {
    if (onNodeSelect) {
      // Извлекаем числовой ID из строки (например, "p39" -> 39)
      const numericId = node.id.substring(1);
      onNodeSelect(numericId, node.type);
    }
    setExpanded(!expanded); // Разворачиваем/сворачиваем при клике
  };

  return (
    <div className="position-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Вертикальная линия над должностью, если не первая */}
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
        {(childPositions.length > 0 || childDepartments.length > 0) && (
          <div className="count-badge">
            {childPositions.length + childDepartments.length}
          </div>
        )}
      </div>
      
      {/* Отображаем дочерние элементы, если должность развернута */}
      {expanded && (childPositions.length > 0 || childDepartments.length > 0) && (
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