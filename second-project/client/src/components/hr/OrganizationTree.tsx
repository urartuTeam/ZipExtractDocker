import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddUnitModal from './AddUnitModal';
import TreeNode from './TreeNode';
import EmployeeTooltip from './EmployeeTooltip';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { OrgUnit, Employee, entityTypes } from '@shared/schema';
import { drawConnections } from '@/lib/tree-utils';

interface OrganizationTreeProps {
  orgUnits: OrgUnit[];
  employees: Employee[];
}

export default function OrganizationTree({ orgUnits, employees }: OrganizationTreeProps) {
  const [nodes, setNodes] = useState<OrgUnit[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [parentNodeId, setParentNodeId] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    employee: Employee | null;
    x: number;
    y: number;
  }>({
    visible: false,
    employee: null,
    x: 0,
    y: 0
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Мутация для обновления позиции ячейки
  const updateNodePosition = useMutation({
    mutationFn: (data: { id: number, x: number, y: number }) => 
      apiRequest('PUT', `/api/org-units/${data.id}`, { 
        positionX: data.x,
        positionY: data.y
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org-units'] });
    }
  });
  
  // Мутация для перемещения сотрудника
  const moveEmployee = useMutation({
    mutationFn: (data: { employeeId: number, positionId: number, departmentId: number | null }) => 
      apiRequest('PUT', `/api/employees/${data.employeeId}`, {
        positionId: data.positionId,
        departmentId: data.departmentId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Успех",
        description: "Сотрудник перемещен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось переместить сотрудника",
        variant: "destructive",
      });
    }
  });
  
  // Обработка данных и построение дерева
  useEffect(() => {
    if (!orgUnits.length) return;
    
    // Установка узлов с координатами
    setNodes(orgUnits);
    
    // Построение соединений между узлами
    if (canvasRef.current && nodeRefs.current.size) {
      const lines = drawConnections(orgUnits, nodeRefs.current);
      setConnections(lines);
    }
  }, [orgUnits]);
  
  // Обновляем соединения при изменении позиций узлов
  useEffect(() => {
    if (canvasRef.current && nodeRefs.current.size && nodes.length) {
      const lines = drawConnections(nodes, nodeRefs.current);
      setConnections(lines);
    }
  }, [nodes]);
  
  // Регистрация ссылки на узел
  const registerNodeRef = (id: number, ref: HTMLDivElement | null) => {
    if (ref) {
      nodeRefs.current.set(id, ref);
    } else {
      nodeRefs.current.delete(id);
    }
  };
  
  // Обновление позиции узла при перетаскивании
  const handleNodeDrag = (id: number, x: number, y: number) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === id ? { ...node, positionX: x, positionY: y } : node
      )
    );
  };
  
  // Сохранение позиции узла после перетаскивания
  const handleNodeDragStop = (id: number, x: number, y: number) => {
    updateNodePosition.mutate({ id, x, y });
  };
  
  // Обработка перетаскивания сотрудника
  const handleEmployeeDrop = (employeeId: number, targetNodeId: number) => {
    const targetNode = nodes.find(node => node.id === targetNodeId);
    if (!targetNode || !targetNode.isPosition) {
      toast({
        title: "Ошибка",
        description: "Сотрудники могут быть прикреплены только к должностям",
        variant: "destructive",
      });
      return;
    }
    
    // Находим департамент для целевой должности
    let departmentId: number | null = null;
    if (targetNode.parentId) {
      const parent = nodes.find(node => node.id === targetNode.parentId);
      if (parent && (parent.isDepartment || parent.isManagement)) {
        departmentId = parent.id;
      }
    }
    
    moveEmployee.mutate({
      employeeId,
      positionId: targetNodeId,
      departmentId
    });
  };
  
  // Открытие модального окна для добавления нового узла
  const handleAddClick = (parentId: number | null = null) => {
    setParentNodeId(parentId);
    setAddModalOpen(true);
  };
  
  // Обработка успешного добавления узла
  const handleAddSuccess = () => {
    setAddModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/org-units'] });
    toast({
      title: "Успех",
      description: "Элемент успешно добавлен",
    });
  };
  
  // Показ всплывающей подсказки с информацией о сотруднике
  const showEmployeeTooltip = (employee: Employee, x: number, y: number) => {
    setTooltip({
      visible: true,
      employee,
      x,
      y
    });
  };
  
  // Скрытие всплывающей подсказки
  const hideEmployeeTooltip = () => {
    setTooltip(prev => ({
      ...prev,
      visible: false
    }));
  };
  
  // Отображение пустого состояния, если нет ячеек
  if (!nodes.length) {
    return (
      <div className="empty-state">
        <div 
          className="big-plus-button"
          onClick={() => handleAddClick(null)}
        >
          +
        </div>
        <AddUnitModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          parentId={null}
          onSuccess={handleAddSuccess}
        />
      </div>
    );
  }
  
  return (
    <div className="org-tree">
      <div className="org-tree-canvas" ref={canvasRef}>
        {/* Соединительные линии */}
        {connections.map((path, index) => (
          <svg 
            key={index} 
            className="node-connector" 
            width="100%" 
            height="100%" 
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <path 
              d={path} 
              stroke="#ccc" 
              strokeWidth="2" 
              fill="none" 
            />
          </svg>
        ))}
        
        {/* Узлы дерева */}
        {nodes.map(node => {
          // Получаем сотрудников для должности
          const nodeEmployees = node.isPosition 
            ? employees.filter(emp => emp.positionId === node.id) 
            : [];
          
          // Получаем руководителя для отдела/управления
          const headEmployee = node.headEmployeeId 
            ? employees.find(emp => emp.id === node.headEmployeeId) 
            : null;
          
          return (
            <TreeNode
              key={node.id}
              node={node}
              employees={nodeEmployees}
              headEmployee={headEmployee}
              onAddClick={() => handleAddClick(node.id)}
              onDrag={(x, y) => handleNodeDrag(node.id, x, y)}
              onDragStop={(x, y) => handleNodeDragStop(node.id, x, y)}
              onEmployeeDrop={(employeeId) => handleEmployeeDrop(employeeId, node.id)}
              onEmployeeHover={showEmployeeTooltip}
              onEmployeeLeave={hideEmployeeTooltip}
              registerRef={(ref) => registerNodeRef(node.id, ref)}
            />
          );
        })}
        
        {/* Всплывающая подсказка для сотрудника */}
        <EmployeeTooltip 
          visible={tooltip.visible} 
          employee={tooltip.employee}
          position={{ x: tooltip.x, y: tooltip.y }}
          nodes={nodes}
        />
        
        {/* Модальное окно добавления узла */}
        <AddUnitModal 
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          parentId={parentNodeId}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
}