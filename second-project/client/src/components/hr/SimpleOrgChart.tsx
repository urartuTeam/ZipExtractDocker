import React, { useState, useEffect } from 'react';
import Xarrow from 'react-xarrows';
import { cn } from '@/lib/utils';

interface OrgNode {
  id: number;
  name: string;
  parentId: number | null;
  type: string;
  children?: OrgNode[];
}

export default function SimpleOrgChart() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных организационной структуры
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/org-units');
        if (response.ok) {
          const data = await response.json();
          setNodes(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Построение дерева из плоского списка
  const buildTree = (items: OrgNode[], parentId: number | null = null): OrgNode[] => {
    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }));
  };

  // Определение типа узла (упрощенная логика)
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

  // Получение цвета для типа узла
  const getNodeColor = (type: string): string => {
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

  // Рендер узла и его дочерних элементов
  const renderNode = (node: OrgNode, level: number = 0) => {
    const nodeType = node.type || getNodeType(node);
    const nodeColor = getNodeColor(nodeType);
    
    return (
      <div key={node.id} className="relative flex flex-col items-center">
        <div 
          id={`node-${node.id}`} 
          className={cn(
            "p-3 mb-6 border-l-4 rounded shadow-sm w-64 text-center relative", 
            nodeColor
          )}
        >
          <div className="text-sm font-medium">{node.name}</div>
          <div className="text-xs text-gray-500 mt-1">{nodeType}</div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="flex justify-center gap-4">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Рендер стрелок связей между узлами
  const renderConnections = (nodes: OrgNode[]) => {
    const connections: JSX.Element[] = [];
    
    const addConnections = (node: OrgNode) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          connections.push(
            <Xarrow
              key={`arrow-${node.id}-${child.id}`}
              start={`node-${node.id}`}
              end={`node-${child.id}`}
              color="#94a3b8"
              strokeWidth={1.5}
              headSize={5}
              curveness={0.2}
              path="smooth"
            />
          );
          addConnections(child);
        });
      }
    };
    
    nodes.forEach(node => {
      addConnections(node);
    });
    
    return connections;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Загрузка структуры...</div>;
  }

  const treeData = buildTree(nodes);

  return (
    <div className="p-8 w-full h-full overflow-auto">
      <div className="tree-container flex flex-col items-center min-w-fit">
        {treeData.map(node => renderNode(node))}
        {renderConnections(treeData)}
      </div>
    </div>
  );
}