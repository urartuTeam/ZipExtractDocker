import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Building, ChevronsRight, ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Типы для API /api/tree
type TreeNodeType = "department" | "position";

interface TreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  children: TreeNode[];
  department_id?: number;
  position_id?: number;
}

interface TreeNodeProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  toggleNode: (id: string) => void;
  onNodeSelect?: (id: string, type: TreeNodeType) => void;
}

// Компонент для отображения узла дерева
const TreeNodeComponent: React.FC<TreeNodeProps> = ({ node, level, expanded, toggleNode, onNodeSelect }) => {
  const isExpanded = expanded;
  const hasChildren = node.children && node.children.length > 0;
  
  // Вычисляем отступ в зависимости от уровня
  const paddingLeft = `${level * 20}px`;
  
  // Определяем цвет фона в зависимости от типа узла
  const bgColor = node.type === "department" ? "bg-primary/5" : "bg-secondary/5";
  
  // Определяем иконку в зависимости от типа узла
  const Icon = node.type === "department" ? Building : null;
  
  return (
    <div className="mb-1">
      <div 
        className={`flex items-center p-2 border border-primary/20 ${bgColor} rounded-md cursor-pointer hover:bg-primary/10`}
        style={{ paddingLeft }}
        onClick={() => {
          if (hasChildren) {
            toggleNode(node.id);
          }
          if (onNodeSelect) {
            onNodeSelect(node.id, node.type);
          }
        }}
      >
        {hasChildren && (
          isExpanded ? 
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500 flex-shrink-0" /> : 
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500 flex-shrink-0" />
        )}
        {Icon && <Icon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />}
        <span className="font-medium">{node.name}</span>
        {node.type === "department" && <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-6">
          {node.children.map(child => (
            <TreeNodeComponent 
              key={child.id} 
              node={child} 
              level={level + 1} 
              expanded={expanded}
              toggleNode={toggleNode}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NewStructureViewProps {
  onNodeSelect?: (id: string, type: TreeNodeType) => void;
}

const NewStructureView: React.FC<NewStructureViewProps> = ({ onNodeSelect }) => {
  // Состояние для хранения развернутых узлов
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  // Состояние для хранения развернуты ли все узлы
  const [allExpanded, setAllExpanded] = useState(false);
  
  // Запрос к API для получения дерева структуры
  const { data: treeResponse, isLoading } = useQuery<{status: string, data: TreeNode[]}>({
    queryKey: ["/api/tree"],
  });
  
  const treeData = treeResponse?.data || [];
  
  // Функция для переключения состояния узла (развернут/свернут)
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      // Если элемент сейчас развернут, то закрываем его
      // Если элемент сейчас закрыт, то открываем его  
      const isCurrentlyExpanded = prev[id] === false ? false : (allExpanded || (prev[id] ?? false));
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  };
  
  // Функция для разворачивания/сворачивания всего дерева
  const toggleAllNodes = () => {
    const newExpandedState = !allExpanded;
    setAllExpanded(newExpandedState);
    
    if (!newExpandedState) {
      // Если сворачиваем структуру, сбрасываем все состояния
      setExpandedNodes({});
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Загрузка структуры...</div>;
  }
  
  if (!treeData || treeData.length === 0) {
    return <div className="flex justify-center items-center p-8">Структура не найдена</div>;
  }
  
  return (
    <div className="p-2">
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-1 border border-primary hover:bg-primary/10" 
          onClick={toggleAllNodes}
        >
          {allExpanded ? (
            <>
              <ChevronsDown className="h-4 w-4" />
              <span>Свернуть структуру</span>
            </>
          ) : (
            <>
              <ChevronsRight className="h-4 w-4" />
              <span>Развернуть структуру</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-2">
        {treeData.map(node => (
          <TreeNodeComponent 
            key={node.id} 
            node={node} 
            level={0}
            expanded={expandedNodes[node.id] === false ? false : (allExpanded || (expandedNodes[node.id] ?? false))}
            toggleNode={toggleNode}
            onNodeSelect={onNodeSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default NewStructureView;