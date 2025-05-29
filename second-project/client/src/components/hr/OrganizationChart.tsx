import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Xarrow from 'react-xarrows';
import OrganizationNode from './OrganizationNode';
import { generateUniqueId } from '@/lib/utils';

// Типы узлов организационной структуры
const NODE_TYPES = {
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  POSITION: 'position',
  MANAGEMENT: 'management',
};

// Цвета для разных типов узлов
const NODE_COLORS = {
  [NODE_TYPES.ORGANIZATION]: '#3b82f6', // blue
  [NODE_TYPES.DEPARTMENT]: '#10b981',   // green
  [NODE_TYPES.POSITION]: '#6366f1',     // indigo
  [NODE_TYPES.MANAGEMENT]: '#f59e0b',   // amber
};

// Заглушка для начальных данных
const INITIAL_NODES = [
  {
    id: 'org1',
    type: NODE_TYPES.ORGANIZATION,
    title: 'Организация',
    x: 500,
    y: 50,
    width: 200,
    height: 100,
    parentId: null,
  },
];

// Интерфейс для узла
interface Node {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId: string | null;
  employees?: Employee[];
}

// Интерфейс для сотрудника
interface Employee {
  id: string;
  name: string;
  position?: string;
  email?: string;
}

export default function OrganizationChart() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connections, setConnections] = useState<{from: string, to: string}[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Устанавливаем соединения между узлами
  useEffect(() => {
    const newConnections = nodes
      .filter(node => node.parentId)
      .map(node => ({
        from: node.parentId as string,
        to: node.id,
      }));
    
    setConnections(newConnections);
  }, [nodes]);
  
  // Настраиваем drop-зону для всей области организационной структуры
  const [, drop] = useDrop({
    accept: 'NODE_PALETTE_ITEM',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && chartRef.current) {
        const chartRect = chartRef.current.getBoundingClientRect();
        const x = offset.x - chartRect.left;
        const y = offset.y - chartRect.top;
        
        // Создаём новый узел
        const newNode: Node = {
          id: generateUniqueId(),
          type: item.type,
          title: getDefaultTitle(item.type),
          x,
          y,
          width: 200,
          height: item.type === NODE_TYPES.POSITION ? 80 : 100,
          parentId: null,
          employees: [],
        };
        
        setNodes([...nodes, newNode]);
      }
    },
  });
  
  // Получаем стандартное название для типа узла
  const getDefaultTitle = (type: string): string => {
    switch (type) {
      case NODE_TYPES.ORGANIZATION:
        return 'Новая организация';
      case NODE_TYPES.DEPARTMENT:
        return 'Новый отдел';
      case NODE_TYPES.POSITION:
        return 'Новая должность';
      case NODE_TYPES.MANAGEMENT:
        return 'Новое управление';
      default:
        return 'Новый элемент';
    }
  };
  
  // Обновление позиции узла
  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === id 
          ? { ...node, x, y } 
          : node
      )
    );
  };
  
  // Обработка клика по узлу
  const handleNodeClick = (id: string) => {
    setSelectedNode(id === selectedNode ? null : id);
  };
  
  // Добавление нового дочернего узла
  const handleAddChild = (parentId: string, type: string) => {
    const parent = nodes.find(node => node.id === parentId);
    if (!parent) return;
    
    // Вычисляем позицию для нового узла
    const childrenCount = nodes.filter(node => node.parentId === parentId).length;
    
    const newNode: Node = {
      id: generateUniqueId(),
      type,
      title: getDefaultTitle(type),
      x: parent.x + (childrenCount * 50) + 50,
      y: parent.y + 150,
      width: 200,
      height: type === NODE_TYPES.POSITION ? 80 : 100,
      parentId,
      employees: [],
    };
    
    setNodes([...nodes, newNode]);
  };
  
  // Обработка удаления узла
  const handleDeleteNode = (id: string) => {
    // Удаление всех дочерних узлов рекурсивно
    const nodesToDelete = getAllDescendantIds(id);
    nodesToDelete.push(id);
    
    setNodes(prevNodes => 
      prevNodes.filter(node => !nodesToDelete.includes(node.id))
    );
    
    if (selectedNode && nodesToDelete.includes(selectedNode)) {
      setSelectedNode(null);
    }
  };
  
  // Получение всех ID дочерних узлов рекурсивно
  const getAllDescendantIds = (nodeId: string): string[] => {
    const descendants: string[] = [];
    
    const addChildrenRecursively = (id: string) => {
      const children = nodes.filter(node => node.parentId === id);
      children.forEach(child => {
        descendants.push(child.id);
        addChildrenRecursively(child.id);
      });
    };
    
    addChildrenRecursively(nodeId);
    return descendants;
  };
  
  // Автоматическое позиционирование узлов
  const handleAutoArrange = () => {
    // Находим корневые узлы
    const rootNodes = nodes.filter(node => !node.parentId);
    
    // Если нет корневых узлов, нечего позиционировать
    if (!rootNodes.length) return;
    
    const newNodes = [...nodes];
    
    // Рассчитываем позиции для каждого дерева, начиная с корневого узла
    rootNodes.forEach((rootNode, rootIndex) => {
      // Позиция корня
      const rootX = 500 + (rootIndex * 600);
      const rootY = 50;
      
      // Обновляем позицию корневого узла
      const rootNodeIndex = newNodes.findIndex(node => node.id === rootNode.id);
      newNodes[rootNodeIndex] = { ...newNodes[rootNodeIndex], x: rootX, y: rootY };
      
      // Рекурсивно позиционируем дочерние узлы
      arrangeChildNodes(rootNode.id, rootX, rootY, 300, 0, newNodes);
    });
    
    setNodes(newNodes);
  };
  
  // Рекурсивное позиционирование дочерних узлов
  const arrangeChildNodes = (
    parentId: string, 
    parentX: number, 
    parentY: number, 
    levelHeight: number, 
    level: number, 
    nodesArray: Node[]
  ) => {
    const children = nodesArray.filter(node => node.parentId === parentId);
    if (!children.length) return;
    
    // Рассчитываем горизонтальный интервал между дочерними узлами
    const totalWidth = children.length * 250;
    let startX = parentX - (totalWidth / 2) + 125;
    
    children.forEach((child, index) => {
      const childX = startX + (index * 250);
      const childY = parentY + levelHeight;
      
      // Обновляем позицию дочернего узла
      const childIndex = nodesArray.findIndex(node => node.id === child.id);
      nodesArray[childIndex] = { ...nodesArray[childIndex], x: childX, y: childY };
      
      // Рекурсивно позиционируем дочерние узлы этого узла
      arrangeChildNodes(child.id, childX, childY, levelHeight, level + 1, nodesArray);
    });
  };
  
  // Изменение родительского узла (перетаскивание)
  const handleParentChange = (nodeId: string, newParentId: string | null) => {
    // Проверяем, не пытаемся ли мы сделать узел потомком самого себя
    if (newParentId === nodeId) return;
    
    // Проверяем, не пытаемся ли мы сделать узел потомком своего потомка
    if (newParentId && getAllDescendantIds(nodeId).includes(newParentId)) return;
    
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, parentId: newParentId } 
          : node
      )
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <div className="node-palette flex space-x-2">
          {Object.entries(NODE_TYPES).map(([key, type]) => (
            <div
              key={key}
              className="palette-item p-2 border rounded cursor-grab bg-white"
              style={{ borderLeftColor: NODE_COLORS[type], borderLeftWidth: 4 }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({ type }));
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
        </div>
        
        <div className="controls">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAutoArrange}
          >
            Автоматически расположить
          </button>
        </div>
      </div>
      
      <div 
        ref={(node) => {
          drop(node);
          chartRef.current = node;
        }}
        className="org-chart-area relative flex-grow border rounded bg-gray-50 overflow-auto"
        style={{ height: 'calc(100vh - 160px)', minHeight: '500px' }}
      >
        {nodes.map(node => (
          <OrganizationNode
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            nodeColor={NODE_COLORS[node.type]}
            onMove={handleNodeMove}
            onClick={() => handleNodeClick(node.id)}
            onAddChild={(type) => handleAddChild(node.id, type)}
            onDelete={() => handleDeleteNode(node.id)}
            onDragStart={() => setDraggingNode(node.id)}
            onDragEnd={() => setDraggingNode(null)}
            onParentChange={handleParentChange}
            availableDropTargets={nodes.filter(n => n.id !== node.id && !getAllDescendantIds(node.id).includes(n.id))}
          />
        ))}
        
        {/* Соединительные линии между узлами */}
        {connections.map(connection => (
          <Xarrow
            key={`${connection.from}-${connection.to}`}
            start={connection.from}
            end={connection.to}
            color="#94a3b8"
            strokeWidth={2}
            headSize={6}
            curveness={0.3}
            path="smooth"
          />
        ))}
      </div>
    </div>
  );
}