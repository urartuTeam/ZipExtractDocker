import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, ChevronDown, ChevronUp, Settings, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  parent_position_id?: number | null;
  parent_department_id?: number | null;
};

type VerticalTreeViewProps = {
  onNodeSelect?: (id: string, type: string) => void;
};

const VerticalTreeView: React.FC<VerticalTreeViewProps> = ({ onNodeSelect }) => {
  // Состояние для хранения текущего корневого узла (ID)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Настройки отображения
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(false);
  
  // История навигации для возврата назад
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Получаем настройки из запроса или используем значение по умолчанию
  const defaultLevels = 2; // По умолчанию 2 уровня
  
  // Запрос настроек отключен, т.к. API требует авторизации
  // Если в будущем понадобится использовать API настроек, включите этот код
  /*
  const { data: settingsResponse } = useQuery<{status: string, data: any[]}>({
    queryKey: ["/api/settings"],
    retry: false, // Не повторять запрос в случае ошибки
    enabled: false, // Отключаем запрос
  });
  */

  // Просто используем дефолтное значение, т.к. API требует авторизации
  const hierarchyInitialLevels = defaultLevels;
    
  // Инициализируем состояние showThreeLevels на основе настроек
  useEffect(() => {
    const threeLevels = Number(hierarchyInitialLevels) === 3;
    setShowThreeLevels(threeLevels);
  }, [hierarchyInitialLevels]);
  
  const { data: treeData, isLoading, error } = useQuery<{status: string, data: TreeNode[]}>({
    queryKey: ["/api/tree"],
    staleTime: 60000, // кэшировать данные на 1 минуту
  });

  // Обработчик клика по узлу для изменения корня дерева
  const handleNodeClick = (id: string, type: string) => {
    if (onNodeSelect) {
      onNodeSelect(id, type);
    }
    
    // Если выбран новый узел - сохраняем старый в историю
    if (selectedNodeId) {
      setNavigationHistory(prev => [...prev, selectedNodeId]);
    }
    
    // Устанавливаем новый корень дерева
    setSelectedNodeId(type === "department" ? `d${id}` : `p${id}`);
  };
  
  // Обработчик для возврата назад в навигации
  const handleNavigateBack = () => {
    if (navigationHistory.length === 0) {
      // Возврат к полному дереву
      setSelectedNodeId(null);
    } else {
      // Возврат к предыдущему узлу
      const prevNode = navigationHistory[navigationHistory.length - 1];
      setSelectedNodeId(prevNode);
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Загрузка структуры организации...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Ошибка загрузки данных: {(error as Error).message}</div>;
  }

  if (!treeData || !treeData.data || treeData.data.length === 0) {
    return <div className="p-4">Нет данных для отображения</div>;
  }

  // Функция для фильтрации узлов и ограничения глубины дерева
  const filterNodesByDepth = (nodes: TreeNode[], maxDepth: number, currentDepth: number = 0): TreeNode[] => {
    if (currentDepth >= maxDepth) {
      return nodes.map(node => ({ ...node, children: [] }));
    }
    
    return nodes.map(node => ({
      ...node,
      children: filterNodesByDepth(node.children, maxDepth, currentDepth + 1)
    }));
  };
  
  // Получаем узлы с учетом выбранного корня и настроек глубины
  let displayNodes: TreeNode[] = [];
  const maxDepth = showThreeLevels ? 3 : 2;
  
  if (selectedNodeId) {
    // Показываем подузлы выбранного узла
    const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        
        const foundInChildren = findNodeById(node.children, id);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
      return null;
    };
    
    const selectedNode = findNodeById(treeData.data, selectedNodeId);
    if (selectedNode) {
      displayNodes = filterNodesByDepth([selectedNode], maxDepth);
    }
  } else {
    // Показываем корневые узлы (исключая самый верхний отдел без родителей)
    displayNodes = treeData.data
      .filter(node => {
        // Скрываем самый верхний отдел, если у него нет родителей
        if (node.type === "department") {
          const departmentId = node.id.substring(1); // Убираем префикс 'd'
          const nodeData = treeData.data.find(n => n.id === node.id);
          return nodeData && (nodeData.parent_position_id || nodeData.parent_department_id);
        }
        return true;
      })
      .sort((a, b) => a.sort - b.sort);
    
    // Если нет узлов после фильтрации, показываем дочерние узлы корневого отдела
    if (displayNodes.length === 0 && treeData.data.length > 0) {
      // Ищем корневой отдел без родителей
      const rootDepartment = treeData.data.find(
        node => node.type === "department" && !node.parent_position_id && !node.parent_department_id
      );
      
      if (rootDepartment) {
        displayNodes = filterNodesByDepth(rootDepartment.children, maxDepth);
      }
    } else {
      displayNodes = filterNodesByDepth(displayNodes, maxDepth);
    }
  }

  return (
    <div className="vertical-tree-container">
      <div className="tree-header">
        <h2 className="tree-title">Организационная структура</h2>
        
        <div className="tree-controls">
          {(selectedNodeId || navigationHistory.length > 0) && (
            <button 
              className="back-button" 
              onClick={handleNavigateBack}
              title="Вернуться назад"
            >
              <ArrowLeft size={16} />
              <span>Назад</span>
            </button>
          )}
          
          <div className="settings-panel">
            <Settings size={16} className="settings-icon" />
            
            <div className="settings-options">
              <div className="setting-option">
                <Switch 
                  id="three-levels" 
                  checked={showThreeLevels} 
                  onCheckedChange={setShowThreeLevels}
                />
                <Label htmlFor="three-levels">Показать 3 уровня</Label>
              </div>
              
              <div className="setting-option">
                <Switch 
                  id="show-vacancies" 
                  checked={showVacancies} 
                  onCheckedChange={setShowVacancies}
                />
                <Label htmlFor="show-vacancies">Показать вакансии</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="tree-content">
        {displayNodes.map((rootNode) => (
          rootNode.type === "department" ? (
            <DepartmentNode 
              key={rootNode.id} 
              node={rootNode} 
              onNodeSelect={handleNodeClick}
              level={1}
              showVacancies={showVacancies}
            />
          ) : (
            <PositionNode 
              key={rootNode.id} 
              node={rootNode} 
              onNodeSelect={handleNodeClick}
              level={1}
              showVacancies={showVacancies}
            />
          )
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
  showVacancies?: boolean;
}> = ({ node, onNodeSelect, level, showVacancies = false }) => {
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
  
  // Генерируем числовые индикаторы для правого верхнего и нижнего угла
  const topIndicator = parseInt(node.id.substring(1)) % 10; // Берем последнюю цифру ID
  const bottomIndicator = childPositions.length + childDepartments.length;

  return (
    <div className="department-root" ref={nodeRef}>
      {/* Карточка отдела в стиле UnifiedPositionCard */}
      <div 
        className="position-card departmentClass"
        onClick={handleClick}
        style={{
          cursor: onNodeSelect ? "pointer" : "default",
          position: "relative"
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
              fontWeight: "bold"
            }}
          >
            {topIndicator}
          </div>
        )}
        
        <div className="position-title">{node.name}</div>
        <div className="position-divider"></div>
        <div className="department-type">Отдел</div>
        
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
              fontWeight: "bold"
            }}
          >
            {bottomIndicator}
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
          
          {/* Отображаем все дочерние элементы (и должности, и отделы) в одном ряду */}
          <div className="unified-children-container">
            <div className="position-row">
              {/* Горизонтальная линия, соединяющая все элементы */}
              {(childPositions.length + childDepartments.length) > 1 && (
                <div 
                  className="horizontal-line" 
                  style={{
                    top: '50%',
                    width: `${((childPositions.length + childDepartments.length) - 1) * 250}px`,
                    left: `${125 - (((childPositions.length + childDepartments.length) - 1) * 250) / 2}px`,
                  }}
                ></div>
              )}
              
              {/* Дочерние должности */}
              {childPositions.map((position) => (
                <PositionNode 
                  key={position.id} 
                  node={position} 
                  onNodeSelect={onNodeSelect}
                  level={level + 1}
                />
              ))}
              
              {/* Дочерние отделы - отображаем в том же ряду */}
              {childDepartments.map((department) => (
                <div className="department-as-child" key={department.id}>
                  <DepartmentNode 
                    node={department} 
                    onNodeSelect={onNodeSelect}
                    level={level + 1}
                  />
                </div>
              ))}
            </div>
          </div>
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
  showVacancies?: boolean;
}> = ({ node, onNodeSelect, level, showVacancies = false }) => {
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
  
  // Генерируем числовые индикаторы для правого верхнего и нижнего угла
  const topIndicator = parseInt(node.id.substring(1)) % 10; // Берем последнюю цифру ID
  const bottomIndicator = childPositions.length + childDepartments.length;

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
      
      {/* Карточка должности в стиле UnifiedPositionCard */}
      <div 
        className="position-card" 
        onClick={handleClick}
        style={{
          cursor: onNodeSelect ? "pointer" : "default",
          position: "relative"
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
              fontWeight: "bold"
            }}
          >
            {topIndicator}
          </div>
        )}
        
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
        
        {/* Индикатор в правом нижнем углу, показывается только если включены вакансии */}
        {showVacancies && hasChildren && (
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
              fontWeight: "bold"
            }}
          >
            {bottomIndicator}
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
          
          {/* Отображаем все дочерние элементы (и должности, и отделы) в одном ряду */}
          <div className="unified-children-container">
            <div className="position-row">
              {/* Горизонтальная линия, соединяющая все элементы */}
              {(childPositions.length + childDepartments.length) > 1 && (
                <div 
                  className="horizontal-line" 
                  style={{
                    top: '50%',
                    width: `${((childPositions.length + childDepartments.length) - 1) * 250}px`,
                    left: `${125 - (((childPositions.length + childDepartments.length) - 1) * 250) / 2}px`,
                  }}
                ></div>
              )}
              
              {/* Дочерние должности */}
              {childPositions.map((position) => (
                <PositionNode 
                  key={position.id} 
                  node={position} 
                  onNodeSelect={onNodeSelect} 
                  level={level + 1}
                />
              ))}
              
              {/* Дочерние отделы - отображаем в том же ряду */}
              {childDepartments.map((department) => (
                <div className="department-as-child" key={department.id}>
                  <DepartmentNode 
                    node={department} 
                    onNodeSelect={onNodeSelect}
                    level={level + 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerticalTreeView;