import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building,
  ChevronsUp,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  UserPlus,
  UserMinus,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import TreeComponent from './tree';

// Типы данных
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted: boolean;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id: number | null;
  departments: { department_id: number }[];
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  department_id: number;
};

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  staff_units: number;
  current_count: number;
  vacancies: number;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
};

// Типы для дерева
type TreeNode = {
  id: string; // Уникальный идентификатор
  type: 'department' | 'position'; // Тип узла
  name: string; // Название
  realId: number; // Реальный ID (department_id или position_id)
  departmentId?: number; // ID отдела (для позиций)
  positionId?: number; // ID должности (для должностей)
  children: TreeNode[]; // Дочерние узлы
  stats?: {
    total: number;     // Всего единиц
    filled: number;    // Занято
    vacancies: number; // Вакансий
  };
  level: number; // Уровень вложенности
};

const VacanciesTree: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Получаем данные
  const { data: departmentsResponse, isLoading: isDepartmentsLoading } = useQuery<{ data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  const { data: positionsResponse, isLoading: isPositionsLoading } = useQuery<{ data: Position[] }>({
    queryKey: ['/api/positions/with-departments'],
  });

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useQuery<{ data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  const { data: positionDepartmentsResponse } = useQuery<{ data: PositionDepartment[] }>({
    queryKey: ['/api/positiondepartments'],
  });

  // Раскрываем/скрываем все узлы
  const toggleAllNodes = () => {
    if (showAll) {
      setExpandedNodes(new Set());
    } else {
      const allNodeIds = getAllNodeIds(treeData);
      setExpandedNodes(new Set(allNodeIds));
    }
    setShowAll(!showAll);
  };

  // Получаем все ID узлов для полного раскрытия
  const getAllNodeIds = (nodes: TreeNode[]): string[] => {
    let ids: string[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children.length > 0) {
        ids = [...ids, ...getAllNodeIds(node.children)];
      }
    });
    return ids;
  };

  // Обработка клика по узлу - раскрытие/скрытие
  const handleNodeClick = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Форматируем данные в древовидную структуру
  useEffect(() => {
    if (
      isDepartmentsLoading ||
      isPositionsLoading ||
      isEmployeesLoading ||
      !departmentsResponse?.data ||
      !positionsResponse?.data ||
      !employeesResponse?.data
    ) {
      return;
    }

    const departments = departmentsResponse.data;
    const positions = positionsResponse.data;
    const employees = employeesResponse.data;
    const positionDepartments = positionDepartmentsResponse?.data || [];

    // Функция для получения корневых отделов
    const getRootDepartments = () => 
      departments.filter(d => 
        !d.deleted && 
        d.parent_department_id === null && 
        d.parent_position_id === null
      );

    // Функция для получения дочерних отделов по ID отдела
    const getChildDepartmentsByDept = (deptId: number) => 
      departments.filter(d => 
        !d.deleted && 
        d.parent_department_id === deptId
      );

    // Функция для получения дочерних отделов по ID должности
    const getChildDepartmentsByPosition = (posId: number) => 
      departments.filter(d => 
        !d.deleted && 
        d.parent_position_id === posId
      );

    // Функция для получения должностей отдела
    const getDepartmentPositions = (deptId: number) => {
      // Находим все должности связанные с отделом
      const linked = positions.filter(p =>
        p.departments.some(d => d.department_id === deptId)
      );

      // Создаем карту должностей для построения иерархии
      const positionMap: Record<number, any> = {};
      linked.forEach(p => {
        positionMap[p.position_id] = { ...p, children: [] };
      });

      // Заполняем дочерние должности
      linked.forEach(p => {
        if (p.parent_position_id && positionMap[p.parent_position_id]) {
          positionMap[p.parent_position_id].children.push(positionMap[p.position_id]);
        }
      });

      // Возвращаем только корневые должности
      return Object.values(positionMap).filter(
        (p: any) => p.parent_position_id === null || !positionMap[p.parent_position_id]
      );
    };

    // Получение сотрудников для должности в отделе
    const getEmployees = (posId: number, deptId: number) =>
      employees.filter(e => e.position_id === posId && e.department_id === deptId);

    // Получение информации о вакансиях
    const getVacancyInfo = (posId: number, deptId: number) => {
      // Находим связь должности с отделом
      const positionDept = positionDepartments.find(
        pd => pd.position_id === posId && pd.department_id === deptId && !pd.deleted
      );

      // Получаем список сотрудников
      const emps = getEmployees(posId, deptId);

      if (!positionDept) {
        return {
          total: emps.length,
          filled: emps.length,
          vacancies: 0
        };
      }

      // Из БД получаем число вакансий
      const vacancies = positionDept.vacancies || 0;
      
      // Сотрудники на данной должности
      const filled = emps.length;
      
      // Всего единиц = вакансии + занятые
      const total = vacancies + filled;

      return {
        total,
        filled,
        vacancies
      };
    };

    // Рекурсивное построение дерева для отдела
    const buildDepartmentTree = (dept: Department, level: number = 0): TreeNode => {
      const departmentNode: TreeNode = {
        id: `dept-${dept.department_id}`,
        type: 'department',
        name: dept.name,
        realId: dept.department_id,
        children: [],
        level
      };

      // Добавляем должности отдела
      const departmentPositions = getDepartmentPositions(dept.department_id);
      departmentPositions.forEach(pos => {
        const positionNode = buildPositionTree(pos, dept.department_id, level + 1);
        departmentNode.children.push(positionNode);
      });

      // Добавляем дочерние отделы
      const childDepartments = getChildDepartmentsByDept(dept.department_id);
      childDepartments.forEach(childDept => {
        const childDeptNode = buildDepartmentTree(childDept, level + 1);
        departmentNode.children.push(childDeptNode);
      });

      return departmentNode;
    };

    // Рекурсивное построение дерева для должности
    const buildPositionTree = (pos: any, deptId: number, level: number): TreeNode => {
      const positionNode: TreeNode = {
        id: `pos-${pos.position_id}-dept-${deptId}`,
        type: 'position',
        name: pos.name,
        realId: pos.position_id,
        positionId: pos.position_id,
        departmentId: deptId,
        stats: getVacancyInfo(pos.position_id, deptId),
        children: [],
        level
      };

      // Добавляем дочерние должности
      const childPositions = pos.children || [];
      childPositions.forEach((childPos: any) => {
        const childPosNode = buildPositionTree(childPos, deptId, level + 1);
        positionNode.children.push(childPosNode);
      });

      // Добавляем дочерние отделы для должности
      const childDepartments = getChildDepartmentsByPosition(pos.position_id);
      childDepartments.forEach(childDept => {
        const childDeptNode = buildDepartmentTree(childDept, level + 1);
        positionNode.children.push(childDeptNode);
      });

      return positionNode;
    };

    // Строим корневые узлы дерева
    const rootDepartments = getRootDepartments();
    const treeNodes = rootDepartments.map(dept => buildDepartmentTree(dept));

    setTreeData(treeNodes);

    // По умолчанию раскрываем все узлы
    if (showAll) {
      setExpandedNodes(new Set(getAllNodeIds(treeNodes)));
    }
  }, [
    isDepartmentsLoading,
    isPositionsLoading,
    isEmployeesLoading,
    departmentsResponse,
    positionsResponse,
    employeesResponse,
    positionDepartmentsResponse,
    showAll
  ]);

  // Преобразуем данные в формат для компонента дерева
  const transformedTreeData = useMemo(() => {
    if (!treeData.length) return [];

    // Функция для преобразования узла
    const transformNode = (node: TreeNode): any => {
      const transformedNode: any = {
        id: node.id,
        level: node.level,
        content: (
          <div className={`node-content ${node.type === 'department' ? 'department-card' : node.type === 'position' ? 'position-card' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center">
                {node.type === 'department' ? (
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                ) : (
                  <Users className="h-5 w-5 mr-2 text-red-600" />
                )}
                <div className="font-medium text-sm">{node.name}</div>
              </div>
              
              {node.type === 'position' && node.stats && (
                <div className="flex items-center gap-2 ml-4">
                  <div title="Всего мест" className="flex items-center text-sm mr-1">
                    <span className="text-xs text-gray-600">{node.stats.total}</span>
                  </div>
                  <div title="Занято" className="flex items-center text-sm mr-1">
                    <Badge variant="outline" className="bg-blue-50 text-xs">
                      {node.stats.filled}
                    </Badge>
                  </div>
                  <div title="Вакансий" className="flex items-center text-sm">
                    <Badge variant={node.stats.vacancies > 0 ? "default" : "outline"} 
                      className={node.stats.vacancies > 0 ? "bg-green-500 text-xs" : "text-xs"}>
                      {node.stats.vacancies > 0 && "+"}{node.stats.vacancies}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
        expanded: expandedNodes.has(node.id),
        className: node.type === 'department' ? 'department-node' : 'position-node',
        children: node.children.map(transformNode)
      };

      return transformedNode;
    };

    return treeData.map(transformNode);
  }, [treeData, expandedNodes]);

  // Показываем скелетон при загрузке
  if (isDepartmentsLoading || isPositionsLoading || isEmployeesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Обработчик клика по узлу дерева
  const handleTreeNodeClick = (node: any) => {
    handleNodeClick(node.id);
  };

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="flex justify-end mb-4">
        <Button
          onClick={toggleAllNodes}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          {showAll ? (
            <>
              <ChevronsUp className="h-4 w-4" />
              <span>Свернуть все</span>
            </>
          ) : (
            <>
              <ChevronsRight className="h-4 w-4" />
              <span>Развернуть все</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-lg p-4 overflow-x-auto">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-blue-50">10</Badge>
            <span className="text-sm text-gray-600">Занято</span>
          </div>
          <div className="flex items-center">
            <Badge className="mr-2 bg-green-500">+5</Badge>
            <span className="text-sm text-gray-600">Вакансий</span>
          </div>
        </div>
        
        <div className="org-tree-container" style={{ minWidth: 'max-content' }}>
          <TreeComponent 
            tree={transformedTreeData} 
            onNodeClick={handleTreeNodeClick}
          />
        </div>
      </div>
    </div>
  );
};

export default VacanciesTree;