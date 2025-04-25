import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import HierarchyTree, { 
  Department, 
  Position, 
  Employee, 
  PositionHierarchyNode, 
  DepartmentHierarchyNode,
  HierarchyNode
} from './HierarchyTree';

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
};

const OrganizationTreeNew: React.FC<OrganizationTreeProps> = ({ 
  initialPositionId, 
  onPositionClick,
  departmentsData,
  positionsData,
  employeesData
}) => {
  // Загрузка данных из API (если не переданы через пропсы)
  const { data: departmentsResponse } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
    enabled: !departmentsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const departments = departmentsData || departmentsResponse?.data || [];

  const { data: positionsResponse } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const positions = positionsData || positionsResponse?.data || [];

  const { data: employeesResponse } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
    enabled: !employeesData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const employees = employeesData || employeesResponse?.data || [];

  // Состояние для хранения иерархии
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  
  // Состояние для хранения текущей выбранной должности или отдела
  const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(initialPositionId);
  const [selectedNodeType, setSelectedNodeType] = useState<'position' | 'department'>('position');
  
  // Состояние для хранения отфильтрованной иерархии
  const [filteredHierarchy, setFilteredHierarchy] = useState<HierarchyNode[]>([]);
  
  // Состояние для хранения информации о должностях с отделами (если не переданы через пропсы)
  const { data: positionsWithDepartmentsResponse } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positions/with-departments'],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  
  // Используем данные о должностях с отделами из пропсов или из запроса
  const positionsWithDepartments = positionsData || positionsWithDepartmentsResponse?.data || [];

  // Строим дерево иерархии при загрузке данных
  useEffect(() => {
    if (departments.length > 0 && (positions.length > 0 || positionsWithDepartments.length > 0) && employees.length > 0) {
      const hierarchy = buildHierarchy();
      setHierarchyTree(hierarchy);
      setFilteredHierarchy(hierarchy);
    }
  }, [departments, positions, employees, positionsWithDepartments]);
  
  // Фильтруем иерархию при выборе узла
  useEffect(() => {
    if (!selectedNodeId || hierarchyTree.length === 0) {
      setFilteredHierarchy(hierarchyTree);
      return;
    }
    
    // Находим выбранный узел и отображаем его и его подчиненных
    const node = findNodeById(hierarchyTree, selectedNodeId, selectedNodeType);
    
    if (node) {
      setFilteredHierarchy([node]);
    } else {
      setFilteredHierarchy(hierarchyTree);
    }
  }, [selectedNodeId, selectedNodeType, hierarchyTree]);

  // Рекурсивный поиск узла по ID
  const findNodeById = (
    nodes: HierarchyNode[], 
    id: number,
    type: 'position' | 'department'
  ): HierarchyNode | null => {
    for (const node of nodes) {
      if (node.id === id && node.type === type) {
        return node;
      }
      
      if (node.subordinates && node.subordinates.length > 0) {
        const found = findNodeById(node.subordinates, id, type);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Построение иерархии должностей и отделов
  const buildHierarchy = (): HierarchyNode[] => {
    // Находим отдел "Администрация"
    const adminDepartment = departments.find(d => d.name === 'Администрация');
    
    if (!adminDepartment) {
      console.log('Отдел "Администрация" не найден');
      return [];
    }
    
    console.log('Найден отдел "Администрация":', adminDepartment);
    
    // Получаем должности отдела "Администрация"
    let adminPositions = positions.filter(pos => {
      // Проверяем, что должность либо прямо привязана к отделу, либо
      // есть сотрудник на этой должности в этом отделе
      return employees.some(emp => 
        emp.position_id === pos.position_id && 
        emp.department_id === adminDepartment.department_id
      );
    });
    
    if (positionsWithDepartments && positionsWithDepartments.length > 0) {
      adminPositions = positionsWithDepartments.filter(pos => {
        // Проверяем, что должность либо прямо привязана к отделу, либо
        // есть сотрудник на этой должности в этом отделе
        return employees.some(emp => 
          emp.position_id === pos.position_id && 
          emp.department_id === adminDepartment.department_id
        );
      });
    }
    
    console.log('Должности отдела "Администрация":', 
      adminPositions.map(pos => `${pos.name} (ID: ${pos.position_id})`)
    );
    
    // Создаем карту должностей для быстрого доступа
    const positionMap: Record<number, PositionHierarchyNode> = {};
    
    // Инициализируем узлы должностей
    adminPositions.forEach(position => {
      const employee = employees.find(emp => 
        emp.position_id === position.position_id && 
        emp.department_id === adminDepartment.department_id
      ) || null;
      
      positionMap[position.position_id] = {
        type: 'position',
        id: position.position_id,
        name: position.name,
        position,
        employee,
        subordinates: []
      };
      
      // Проверяем, есть ли дочерние отделы у должности
      const childDepartments = departments.filter(dept => 
        dept.parent_position_id === position.position_id
      );
      
      if (childDepartments.length > 0) {
        console.log(`Должность "${position.name}" (ID: ${position.position_id}) имеет дочерние отделы:`, 
          childDepartments.map(dept => `${dept.name} (ID: ${dept.department_id})`)
        );
        
        // Для каждого дочернего отдела создаем узел
        childDepartments.forEach(dept => {
          // Находим должности этого отдела
          const deptPositions = positions.filter(pos => {
            return employees.some(emp => 
              emp.position_id === pos.position_id && 
              emp.department_id === dept.department_id
            );
          });
          
          // Создаем узлы должностей для этого отдела
          const deptPositionNodes: PositionHierarchyNode[] = deptPositions.map(pos => {
            const emp = employees.find(e => 
              e.position_id === pos.position_id && 
              e.department_id === dept.department_id
            ) || null;
            
            return {
              type: 'position',
              id: pos.position_id,
              name: pos.name,
              position: pos,
              employee: emp,
              subordinates: []
            };
          });
          
          // Создаем узел отдела
          const deptNode: DepartmentHierarchyNode = {
            type: 'department',
            id: dept.department_id,
            name: dept.name,
            department: dept,
            positions: deptPositionNodes,
            subordinates: []
          };
          
          // Добавляем отдел как подчиненный элемент должности
          positionMap[position.position_id].subordinates.push(deptNode);
        });
      }
    });
    
    // Создаем иерархию должностей
    // Список корневых должностей
    const rootNodes: PositionHierarchyNode[] = [];
    
    // Распределяем должности в иерархии на основе parent_position_id
    adminPositions.forEach(position => {
      const currentNode = positionMap[position.position_id];
      
      if (position.parent_position_id === null || position.parent_position_id === undefined) {
        // Это корневая должность
        rootNodes.push(currentNode);
      } else if (positionMap[position.parent_position_id]) {
        // Это подчиненная должность, у которой родительская должность находится в этом отделе
        // Проверяем, что эта должность ещё не была добавлена как подчиненная через дочерний отдел
        const alreadyAdded = positionMap[position.parent_position_id].subordinates.some(sub => 
          sub.type === 'position' && sub.id === position.position_id
        );
        
        if (!alreadyAdded) {
          positionMap[position.parent_position_id].subordinates.push(currentNode);
        }
      } else {
        // Родитель не найден в этом отделе, считаем должность корневой
        rootNodes.push(currentNode);
      }
    });
    
    // Корректировка иерархии с учетом фактического состояния базы данных
    // (особенность: Генеральный директор подчиняется ЗАМЕСТИТЕЛЮ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА)
    const genDirectorPos = adminPositions.find(p => p.position_id === 5);
    
    if (genDirectorPos && positionMap[5] && positionMap[1]) {
      // Если Генеральный директор есть в списке должностей и маппинге
      // и есть ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА (ID: 1)
      
      // Проверяем, является ли позиция ID 5 уже корневой
      const genDirectorIndex = rootNodes.findIndex(node => node.id === 5);
      if (genDirectorIndex !== -1) {
        // Убираем из корневых
        const genDirectorNode = rootNodes.splice(genDirectorIndex, 1)[0];
        
        // Добавляем его как подчиненного к ЗАМЕСТИТЕЛЮ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА
        positionMap[1].subordinates.push(genDirectorNode);
      }
    }
    
    // Добавляем заместителей гендиректора как его подчиненных, а не как отдельные корневые узлы
    const deputyPositions = adminPositions.filter(p => 
      p.parent_position_id === 5 && [7, 8, 9, 10].includes(p.position_id)
    );
    
    // Для каждого заместителя проверяем, находится ли он в корне
    deputyPositions.forEach(deputyPos => {
      const deputyIndex = rootNodes.findIndex(node => node.id === deputyPos.position_id);
      if (deputyIndex !== -1 && positionMap[5]) {
        // Убираем из корневых
        const deputyNode = rootNodes.splice(deputyIndex, 1)[0];
        
        // Проверяем, что заместитель ещё не был добавлен как подчиненный
        const alreadyAdded = positionMap[5].subordinates.some(sub => 
          sub.type === 'position' && sub.id === deputyPos.position_id
        );
        
        // Добавляем как подчиненного гендиректору, если ещё не добавлен
        if (!alreadyAdded) {
          positionMap[5].subordinates.push(deputyNode);
        }
      }
    });
    
    console.log('Построено', rootNodes.length, 'корневых узлов');
    
    return rootNodes;
  };
  
  // Обработчик клика по должности
  const handlePositionClick = (positionId: number) => {
    if (selectedNodeId === positionId && selectedNodeType === 'position') {
      // Если клик на уже выбранной должности, возвращаемся к общему виду
      setSelectedNodeId(undefined);
    } else {
      // Иначе выбираем новую должность
      setSelectedNodeId(positionId);
      setSelectedNodeType('position');
    }
    
    // Если передан внешний обработчик, вызываем его
    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };
  
  // Обработчик клика по отделу
  const handleDepartmentClick = (departmentId: number) => {
    if (selectedNodeId === departmentId && selectedNodeType === 'department') {
      // Если клик на уже выбранном отделе, возвращаемся к общему виду
      setSelectedNodeId(undefined);
    } else {
      // Иначе выбираем новый отдел
      setSelectedNodeId(departmentId);
      setSelectedNodeType('department');
    }
  };
  
  // Если данные еще не загружены, показываем загрузку
  if (departments.length === 0 || (positions.length === 0 && positionsWithDepartments.length === 0)) {
    return <div className="loading-message">Загрузка организационной структуры...</div>;
  }
  
  return (
    <div className="org-tree-container">
      <div className="position-hierarchy">
        {selectedNodeId && (
          <div className="position-navigation">
            <button 
              className="back-to-main-hierarchy" 
              onClick={() => setSelectedNodeId(undefined)}
            >
              ← Вернуться к общей структуре
            </button>
          </div>
        )}
        
        <HierarchyTree 
          nodes={filteredHierarchy}
          onPositionClick={handlePositionClick}
          onDepartmentClick={handleDepartmentClick}
        />
      </div>
    </div>
  );
};

export default OrganizationTreeNew;