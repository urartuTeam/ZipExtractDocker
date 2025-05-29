import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Интерфейс узла организационной структуры
interface OrgNode {
  id: number;
  name: string;
  parentId: number | null;
  type?: string;
}

// Интерфейс узла дерева с детьми
interface TreeNode extends OrgNode {
  children: TreeNode[];
}

export default function SimpleTreeChart() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных организационной структуры
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/org-units');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные');
        }
        const data = await response.json();
        setNodes(data);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить организационную структуру');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Построение дерева из плоского списка
  const buildTree = (items: OrgNode[]): TreeNode[] => {
    // Создаем словарь для быстрого доступа
    const nodeMap: { [key: number]: TreeNode } = {};
    
    // Инициализируем все узлы с пустым массивом детей
    items.forEach(item => {
      nodeMap[item.id] = { ...item, children: [] };
    });
    
    // Заполняем массивы детей
    const roots: TreeNode[] = [];
    
    items.forEach(item => {
      const node = nodeMap[item.id];
      
      if (item.parentId === null) {
        // Это корневой узел
        roots.push(node);
      } else if (nodeMap[item.parentId]) {
        // Добавляем узел к детям родителя
        nodeMap[item.parentId].children.push(node);
      } else {
        // Родитель не найден, считаем корневым
        roots.push(node);
      }
    });
    
    return roots;
  };

  // Определение типа узла
  const getNodeType = (node: OrgNode): string => {
    if (node.name.toLowerCase().includes('отдел') || 
        node.name.toLowerCase().includes('департамент')) {
      return 'department';
    } 
    else if (node.name.toLowerCase().includes('руководитель') ||
             node.name.toLowerCase().includes('директор') ||
             node.name.toLowerCase().includes('начальник')) {
      return 'management';
    }
    else if (node.name.toLowerCase().includes('специалист') ||
             node.name.toLowerCase().includes('менеджер') ||
             node.name.toLowerCase().includes('инженер')) {
      return 'position';
    }
    return 'organization';
  };

  // Получение цвета и стилей для типа узла
  const getNodeStyles = (type: string): string => {
    switch (type) {
      case 'department':
        return 'border-green-500 bg-green-50';
      case 'management':
        return 'border-amber-500 bg-amber-50';
      case 'position':
        return 'border-indigo-500 bg-indigo-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  // Рендер узла дерева и его детей
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const nodeType = node.type || getNodeType(node);
    const nodeStyles = getNodeStyles(nodeType);
    
    return (
      <div key={node.id} className="tree-node">
        {/* Ячейка узла */}
        <div 
          className={cn(
            "p-3 border-l-4 rounded shadow-sm w-64 relative", 
            nodeStyles
          )}
        >
          <div className="text-sm font-medium">{node.name}</div>
          <div className="text-xs text-gray-500 mt-1">{nodeType}</div>
        </div>
        
        {/* Дочерние узлы */}
        {node.children.length > 0 && (
          <div className="children-container mt-8 ml-8 space-y-4 relative">
            {/* Вертикальная линия соединения */}
            <div className="absolute left-[-20px] top-[-20px] w-px h-full bg-gray-300"></div>
            
            {node.children.map((child, index) => (
              <div key={child.id} className="child-node relative">
                {/* Горизонтальная линия соединения */}
                <div className="absolute left-[-20px] top-[15px] w-5 h-px bg-gray-300"></div>
                {renderTreeNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg">Загрузка организационной структуры...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  const treeData = buildTree(nodes);

  if (treeData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg">Нет данных для отображения</div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <h1 className="text-xl font-bold mb-6">Организационная структура</h1>
      <div className="org-tree space-y-8">
        {treeData.map(node => renderTreeNode(node))}
      </div>
    </div>
  );
}