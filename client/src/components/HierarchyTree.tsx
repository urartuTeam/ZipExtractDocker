import React from 'react';

// Базовые типы данных
export type Department = {
  department_id: number;
  name: string;
  parent_position_id: number | null;
};

export type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
};

export type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
};

// Типы для построения комбинированной иерархии позиций и отделов
export type HierarchyNodeType = 'position' | 'department';

// Базовый интерфейс для узла иерархии
export interface BaseHierarchyNode {
  type: HierarchyNodeType;
  id: number;
  name: string;
}

// Для позиций в иерархии
export interface PositionHierarchyNode extends BaseHierarchyNode {
  type: 'position';
  position: Position;
  employee: Employee | null;
  subordinates: (PositionHierarchyNode | DepartmentHierarchyNode)[];
}

// Для отделов в иерархии
export interface DepartmentHierarchyNode extends BaseHierarchyNode {
  type: 'department';
  department: Department;
  positions: PositionHierarchyNode[];
  subordinates: (PositionHierarchyNode | DepartmentHierarchyNode)[];
}

// Тип для любого узла в иерархии
export type HierarchyNode = PositionHierarchyNode | DepartmentHierarchyNode;

// Компонент для отображения карточки должности
const PositionCard: React.FC<{
  node: PositionHierarchyNode;
  onNodeClick?: (nodeType: HierarchyNodeType, id: number) => void;
}> = ({ node, onNodeClick }) => {
  return (
    <div 
      className="position-card"
      onClick={() => onNodeClick && onNodeClick('position', node.id)}
      style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
    >
      <div className="position-title">{node.name}</div>
      {node.employee ? (
        <div className="employee-name">{node.employee.full_name}</div>
      ) : (
        <div className="position-vacant">Вакантная должность</div>
      )}
    </div>
  );
};

// Компонент для отображения карточки отдела
const DepartmentCard: React.FC<{
  node: DepartmentHierarchyNode;
  onNodeClick?: (nodeType: HierarchyNodeType, id: number) => void;
}> = ({ node, onNodeClick }) => {
  return (
    <div 
      className="department-card"
      onClick={() => onNodeClick && onNodeClick('department', node.id)}
      style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
    >
      <div className="department-title">{node.name}</div>
      <div className="department-info">
        {node.positions.length} должностей
      </div>
    </div>
  );
};

// Рекурсивный компонент для отображения дерева иерархии
const NodeTree: React.FC<{
  nodes: HierarchyNode[];
  onNodeClick?: (nodeType: HierarchyNodeType, id: number) => void;
  level?: number;
}> = ({ nodes, onNodeClick, level = 0 }) => {
  if (nodes.length === 0) return null;
  
  return (
    <div className="hierarchy-level" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
      {nodes.map((node, index) => (
        <div key={`${node.type}-${node.id}-${index}`} className="hierarchy-node">
          {/* Карточка узла (должность или отдел) */}
          <div className="node-card">
            {node.type === 'position' ? (
              <PositionCard node={node} onNodeClick={onNodeClick} />
            ) : (
              <DepartmentCard node={node} onNodeClick={onNodeClick} />
            )}
          </div>
          
          {/* Отображаем подчиненные узлы, если они есть */}
          {node.subordinates.length > 0 && (
            <div className="subordinates-container">
              <div className="tree-branch-connections">
                {/* Горизонтальная линия */}
                <div className="tree-branch-line" style={{ 
                  width: `${Math.max(node.subordinates.length * 200, 50)}px` 
                }}></div>
              </div>
              
              <div className="subordinates-list">
                {/* Рекурсивно отображаем подчиненные узлы */}
                <NodeTree 
                  nodes={node.subordinates} 
                  onNodeClick={onNodeClick} 
                  level={level + 1}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Основной компонент дерева иерархии
export const HierarchyTree: React.FC<{
  nodes: HierarchyNode[];
  onPositionClick?: (positionId: number) => void;
  onDepartmentClick?: (departmentId: number) => void;
}> = ({ nodes, onPositionClick, onDepartmentClick }) => {
  // Обработчик клика по узлу
  const handleNodeClick = (nodeType: HierarchyNodeType, id: number) => {
    if (nodeType === 'position' && onPositionClick) {
      onPositionClick(id);
    } else if (nodeType === 'department' && onDepartmentClick) {
      onDepartmentClick(id);
    }
  };
  
  return (
    <div className="hierarchy-tree">
      <NodeTree nodes={nodes} onNodeClick={handleNodeClick} />
    </div>
  );
};

export default HierarchyTree;