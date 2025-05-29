import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import Draggable from 'react-draggable';
import { Menu, MenuItem } from '@/components/ui/menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Типы узлов
const NODE_TYPES = {
  ORGANIZATION: 'organization',
  DEPARTMENT: 'department',
  POSITION: 'position',
  MANAGEMENT: 'management',
};

interface NodeProps {
  node: {
    id: string;
    type: string;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    parentId: string | null;
    employees?: { id: string; name: string; position?: string }[];
  };
  isSelected: boolean;
  nodeColor: string;
  onMove: (id: string, x: number, y: number) => void;
  onClick: () => void;
  onAddChild: (type: string) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onParentChange: (nodeId: string, newParentId: string | null) => void;
  availableDropTargets: any[];
}

export default function OrganizationNode({
  node,
  isSelected,
  nodeColor,
  onMove,
  onClick,
  onAddChild,
  onDelete,
  onDragStart,
  onDragEnd,
  onParentChange,
  availableDropTargets
}: NodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmployees, setShowEmployees] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Настраиваем перетаскивание узла
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'NODE',
    item: () => {
      onDragStart();
      return { id: node.id, type: node.type };
    },
    end: () => {
      onDragEnd();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Настраиваем узел как цель для соединения
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'NODE',
    drop: (item: { id: string, type: string }) => {
      if (item.id !== node.id) {
        onParentChange(item.id, node.id);
      }
    },
    canDrop: (item: { id: string, type: string }) => {
      // Проверяем допустимость типов соединения
      if (item.id === node.id) return false;
      
      // Правила связи между типами
      if (item.type === NODE_TYPES.ORGANIZATION) return false; // Организация не может быть ничьим потомком
      
      if (node.type === NODE_TYPES.POSITION) return false; // Должность не может иметь потомков
      
      if (item.type === NODE_TYPES.MANAGEMENT && 
         (node.type !== NODE_TYPES.ORGANIZATION && node.type !== NODE_TYPES.MANAGEMENT)) {
        return false; // Управление только внутри организации или другого управления
      }
      
      if (item.type === NODE_TYPES.DEPARTMENT && 
         (node.type === NODE_TYPES.POSITION)) {
        return false; // Отдел не может быть внутри должности
      }
      
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Объединяем ссылки для перетаскивания и цели
  const dragPreviewRef = (el: HTMLDivElement | null) => {
    preview(el);
    drop(el);
    nodeRef.current = el;
  };

  // Получаем иконку для типа узла
  const getNodeIcon = (type: string) => {
    switch (type) {
      case NODE_TYPES.ORGANIZATION:
        return '🏢';
      case NODE_TYPES.DEPARTMENT:
        return '👥';
      case NODE_TYPES.POSITION:
        return '💼';
      case NODE_TYPES.MANAGEMENT:
        return '👑';
      default:
        return '📌';
    }
  };

  // Получаем название типа узла
  const getNodeTypeName = (type: string) => {
    switch (type) {
      case NODE_TYPES.ORGANIZATION:
        return 'Организация';
      case NODE_TYPES.DEPARTMENT:
        return 'Отдел';
      case NODE_TYPES.POSITION:
        return 'Должность';
      case NODE_TYPES.MANAGEMENT:
        return 'Управление';
      default:
        return 'Элемент';
    }
  };

  // Обработка окончания перетаскивания
  const handleDragStop = (e: any, data: { x: number, y: number }) => {
    onMove(node.id, data.x, data.y);
  };

  // Открытие контекстного меню
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  return (
    <Draggable
      position={{ x: node.x, y: node.y }}
      onStop={handleDragStop}
      bounds="parent"
      handle=".node-header"
      nodeRef={nodeRef}
    >
      <div
        ref={dragPreviewRef}
        id={node.id}
        className={`org-node absolute rounded shadow transition-shadow ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } ${isDragging ? 'opacity-50' : 'opacity-100'} ${
          isOver && canDrop ? 'ring-2 ring-green-500' : ''
        } ${isOver && !canDrop ? 'ring-2 ring-red-500' : ''}`}
        style={{ 
          width: node.width, 
          height: 'auto',
          backgroundColor: 'white',
          borderLeft: `4px solid ${nodeColor}`,
          zIndex: isDragging ? 1000 : 10 
        }}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Заголовок узла */}
        <div 
          className="node-header p-2 border-b flex items-center cursor-move"
          ref={drag}
        >
          <div className="node-icon mr-2">{getNodeIcon(node.type)}</div>
          <div className="node-title flex-1 overflow-hidden">
            <div className="text-sm font-medium truncate">{node.title}</div>
            <div className="text-xs text-gray-500">{getNodeTypeName(node.type)}</div>
          </div>
          <div className="node-actions flex space-x-1">
            <button 
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setConnectDialogOpen(true);
              }}
            >
              🔗
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(true);
              }}
            >
              ⋮
            </button>
          </div>
        </div>
        
        {/* Содержимое узла */}
        <div className="node-content p-2">
          {/* Сотрудники для должности */}
          {node.type === NODE_TYPES.POSITION && node.employees && node.employees.length > 0 && showEmployees && (
            <div className="employee-list mb-2">
              <div className="text-xs font-medium mb-1">Сотрудники:</div>
              {node.employees.map(employee => (
                <div 
                  key={employee.id} 
                  className="employee-item flex items-center p-1 bg-gray-50 rounded mb-1"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs mr-2">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="text-xs truncate">{employee.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Контекстное меню */}
        {menuOpen && (
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setMenuOpen(false)}
          >
            <div 
              className="absolute bg-white shadow-lg rounded py-1 w-48"
              style={{ 
                top: '100%', 
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b">
                Действия
              </div>
              
              {/* Добавление дочерних элементов (кроме должности) */}
              {node.type !== NODE_TYPES.POSITION && (
                <>
                  <button 
                    className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                    onClick={() => {
                      onAddChild(NODE_TYPES.DEPARTMENT);
                      setMenuOpen(false);
                    }}
                  >
                    Добавить отдел
                  </button>
                  
                  {(node.type === NODE_TYPES.ORGANIZATION || node.type === NODE_TYPES.MANAGEMENT) && (
                    <button 
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                      onClick={() => {
                        onAddChild(NODE_TYPES.MANAGEMENT);
                        setMenuOpen(false);
                      }}
                    >
                      Добавить управление
                    </button>
                  )}
                  
                  {(node.type === NODE_TYPES.DEPARTMENT || node.type === NODE_TYPES.MANAGEMENT) && (
                    <button 
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                      onClick={() => {
                        onAddChild(NODE_TYPES.POSITION);
                        setMenuOpen(false);
                      }}
                    >
                      Добавить должность
                    </button>
                  )}
                  
                  <div className="border-t my-1"></div>
                </>
              )}
              
              {/* Общие действия */}
              <button 
                className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                onClick={() => {
                  setConnectDialogOpen(true);
                  setMenuOpen(false);
                }}
              >
                Связать с...
              </button>
              
              <button 
                className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
                onClick={() => {
                  onParentChange(node.id, null);
                  setMenuOpen(false);
                }}
              >
                Отвязать от родителя
              </button>
              
              <div className="border-t my-1"></div>
              
              <button 
                className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        )}
        
        {/* Диалог выбора родителя для соединения */}
        {connectDialogOpen && (
          <div 
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
            onClick={() => setConnectDialogOpen(false)}
          >
            <div 
              className="bg-white rounded shadow-xl p-4 w-64 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-lg font-medium mb-2">Связать с элементом</div>
              
              <div className="mb-4 text-sm text-gray-500">
                Выберите элемент, с которым хотите связать "{node.title}"
              </div>
              
              <div className="space-y-1 mb-4">
                {availableDropTargets.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">Нет доступных элементов для связи</div>
                ) : (
                  availableDropTargets.map(target => (
                    <button
                      key={target.id}
                      className={`w-full text-left p-2 rounded text-sm ${
                        target.id === node.parentId 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        onParentChange(node.id, target.id);
                        setConnectDialogOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{getNodeIcon(target.type)}</span>
                        <div>
                          <div className="font-medium">{target.title}</div>
                          <div className="text-xs text-gray-500">{getNodeTypeName(target.type)}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button 
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setConnectDialogOpen(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}