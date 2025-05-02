import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { FolderIcon, BriefcaseIcon, ChevronDown, ChevronRight, User } from "lucide-react";

// Тип данных для информации о сотруднике
type EmployeeInfo = {
  id: number;
  fullName: string;
};

// Определяем тип TreeNode локально, чтобы не зависеть от импорта
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

type TreeViewProps = {
  onNodeSelect?: (id: string, type: string) => void;
};

const TreeView: React.FC<TreeViewProps> = ({ onNodeSelect }) => {
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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Организационная структура</h2>
      <div className="border rounded-md">
        {treeData.data.map((node) => (
          <TreeNodeComponent key={node.id} node={node} depth={0} onNodeSelect={onNodeSelect} />
        ))}
      </div>
    </div>
  );
};

type TreeNodeComponentProps = {
  node: TreeNode;
  depth: number;
  onNodeSelect?: (id: string, type: string) => void;
};

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({ node, depth, onNodeSelect }) => {
  const [expanded, setExpanded] = useState(depth < 2); // По умолчанию разворачиваем только первые два уровня
  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const handleClick = () => {
    if (onNodeSelect) {
      // Извлекаем числовой ID из строки (например, "d21" -> 21 или "p43" -> 43)
      const numericId = node.id.substring(1);
      onNodeSelect(numericId, node.type);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-2 px-3 hover:bg-gray-100 cursor-pointer",
          depth > 0 && `ml-${Math.min(depth * 6, 36)}`
        )}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span onClick={handleToggle} className="mr-2">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className="w-4 mr-2"></span>
        )}
        
        <span className="mr-2">
          {node.type === "department" ? (
            <FolderIcon size={16} className="text-blue-500" />
          ) : (
            <BriefcaseIcon size={16} className="text-green-500" />
          )}
        </span>
        
        <span className={cn(
          "font-medium",
          node.type === "department" ? "text-blue-800" : "text-green-800"
        )}>
          {node.name}
        </span>
        
        {/* Отображаем информацию о сотруднике, если доступна */}
        {node.type === "position" && node.employee && (
          <span className="ml-2 flex items-center text-gray-500 text-sm">
            <User size={14} className="mr-1" />
            {node.employee.fullName}
          </span>
        )}
      </div>
      
      {expanded && hasChildren && (
        <div className="border-l ml-4 pl-2 border-gray-200">
          {node.children.map((childNode) => (
            <TreeNodeComponent 
              key={childNode.id}
              node={childNode}
              depth={depth + 1}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeView;