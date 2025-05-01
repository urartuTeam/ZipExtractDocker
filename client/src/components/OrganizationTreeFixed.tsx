import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NavigationIcon, UserIcon, Building2Icon, XIcon, ArrowUpCircleIcon, ArrowLeftCircleIcon } from "lucide-react";

// Определяем типы для наших данных, совпадающие с теми, что приходят с сервера
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
};

type DepartmentNode = Department & {
  positions: Position[];
  children: DepartmentNode[];
  width: number;
  childCount: number;
};

type PositionHierarchyNode = {
  position: Position;
  employees: Employee[];
  subordinates: PositionHierarchyNode[];
  childDepartments: Department[];
};

declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
};

// Стили для компонентов
const treeNodeStyle = "border-2 border-gray-300 rounded-md p-3 bg-white shadow-sm text-center flex flex-col items-center justify-center min-w-[200px]";
const treeLineStyle = "border-t-2 border-gray-300 my-4";
const treeContainerStyle = "flex flex-col items-center";
const departmentNodeStyle = "border-2 border-[#a40000] rounded-md p-3 bg-white shadow-sm text-center flex flex-col items-center justify-center";
const positionNodeStyle = "border-2 border-blue-500 rounded-md p-3 bg-white shadow-sm text-center flex flex-col items-center justify-center my-2 w-full";
const employeeNodeStyle = "text-xs text-gray-700 my-1";
const vacancyNodeStyle = "text-xs text-gray-500 italic my-1";
const breadcrumbStyle = "flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-100 p-2 rounded overflow-x-auto";
const breadcrumbItemStyle = "flex items-center gap-1 cursor-pointer hover:underline whitespace-nowrap";
const breadcrumbSeparatorStyle = "mx-1";
const settingsContainerStyle = "flex gap-4 items-center mb-4 p-2 bg-gray-100 rounded";
const settingItemStyle = "flex items-center gap-2";

// Компонент для отображения организационного дерева
const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  initialPositionId,
  onPositionClick,
  departmentsData,
  positionsData,
  employeesData,
}) => {
  // Запрос на получение отделов (если не переданы через пропсы)
  const { data: departmentsResponse } = useQuery<{
    status: string;
    data: Department[];
  }>({
    queryKey: ["/api/departments"],
    enabled: !departmentsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const departments = departmentsData || departmentsResponse?.data || [];

  // Запрос на получение должностей (если не переданы через пропсы)
  const { data: positionsResponse } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: ["/api/positions"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const positions = positionsData || positionsResponse?.data || [];

  // Запрос на получение сотрудников (если не переданы через пропсы)
  const { data: employeesResponse } = useQuery<{
    status: string;
    data: Employee[];
  }>({
    queryKey: ["/api/employees"],
    enabled: !employeesData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const employees = employeesData || employeesResponse?.data || [];

  // Запрос для получения данных о связях должностей (position_position)
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: {
      position_relation_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number;
      deleted: boolean;
    }[];
  }>({
    queryKey: ['/api/positionpositions'],
  });

  // Запрос на получение должностей с отделами (если не переданы через пропсы)
  const { data: positionsWithDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/positions/with-departments"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  
  // Используем данные о должностях с отделами из пропсов или из запроса
  const positionsWithDepartments =
    positionsData || positionsWithDepartmentsResponse?.data || [];

  // Состояния компонента
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
  const [positionHierarchy, setPositionHierarchy] = useState<PositionHierarchyNode[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | undefined>(initialPositionId);
  const [filteredHierarchy, setFilteredHierarchy] = useState<PositionHierarchyNode[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(false);

  // Сохраняем positionsWithDepartments в глобальном объекте для доступа из подкомпонентов
  if (typeof window !== "undefined") {
    window.positionsWithDepartmentsData = positionsWithDepartments;
  }

  // Функция построения иерархии должностей
  const buildPositionHierarchy = (
    positions: Position[],
    employees: Employee[],
    departments: Department[],
    initialPositionId?: number,
  ): PositionHierarchyNode[] => {
    console.log("Запуск buildPositionHierarchy с", positions.length, "должностями");
    
    // Получаем данные о связях должностей из position_position
    const positionRelations = positionPositionsResponse?.data?.filter(pp => !pp.deleted) || [];
    
    console.log(`Загружено ${positionRelations.length} связей из position_positions таблицы`);
    
    // Создаем индексированную карту всех должностей для быстрого доступа
    const positionMap: Record<number, Position> = {};
    positions.forEach(position => {
      positionMap[position.position_id] = position;
    });
    
    // Сначала создаем узлы для всех должностей
    const positionNodes: Record<number, PositionHierarchyNode> = {};
    
    // Инициализируем узлы для всех должностей
    positions.forEach(position => {
      // Находим сотрудников на этой должности
      const positionEmployees = employees.filter(emp => 
        emp.position_id === position.position_id
      );
      
      positionNodes[position.position_id] = {
        position: position,
        employees: positionEmployees,
        subordinates: [],
        childDepartments: []
      };
    });
    
    // Набор идентификаторов дочерних должностей (для определения корневых)
    const childPositionIds = new Set<number>();
    
    // Строим иерархию на основе position_position таблицы
    positionRelations.forEach(relation => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      const departmentId = relation.department_id;
      
      // Проверяем, что должности существуют в нашей карте узлов
      if (positionNodes[childId] && positionNodes[parentId]) {
        // Если у подчиненной должности есть сотрудники в другом отделе,
        // создаем копию узла специально для этого отдела
        const childNode = positionNodes[childId];
        
        // Находим сотрудников только в текущем отделе
        const departmentEmployees = employees.filter(emp => 
          emp.position_id === childId && 
          emp.department_id === departmentId
        );
        
        // Если есть сотрудники в этом отделе или если это специально отмеченная связь,
        // добавляем должность как подчиненную
        if (departmentEmployees.length > 0 || true) { // Всегда добавляем связь из position_position
          // Если должность уже добавлена как подчиненная, пропускаем
          const alreadyAdded = positionNodes[parentId].subordinates.some(
            sub => sub.position.position_id === childId
          );
          
          if (!alreadyAdded) {
            // Отмечаем, что эта должность является чьей-то дочерней
            childPositionIds.add(childId);
            
            // Создаем глубокую копию подчиненного узла с сотрудниками только из этого отдела
            const departmentChildNode: PositionHierarchyNode = {
              position: {
                ...childNode.position,
                department_id: departmentId
              },
              employees: departmentEmployees,
              subordinates: [...childNode.subordinates], // Копируем подчиненных
              childDepartments: []
            };
            
            // Добавляем узел как подчиненный
            positionNodes[parentId].subordinates.push(departmentChildNode);
            
            console.log(`Создана связь: "${positionMap[childId]?.name}" (ID: ${childId}) подчиняется "${positionMap[parentId]?.name}" (ID: ${parentId}) в отделе ${departmentId}`);
          }
        }
      } else {
        console.log(`Не найдены должности для связи: parent=${parentId}, child=${childId}, dept=${departmentId}`);
      }
    });
    
    // Добавляем связи отделов и должностей
    departments.forEach(department => {
      if (department.parent_position_id) {
        const parentNode = positionNodes[department.parent_position_id];
        if (parentNode) {
          // Добавляем отдел как дочерний для должности
          if (!parentNode.childDepartments.some(d => d.department_id === department.department_id)) {
            parentNode.childDepartments.push(department);
            console.log(`Добавлен отдел "${department.name}" как дочерний для должности "${parentNode.position.name}"`);
          }
        }
      }
    });
    
    // Находим корневые должности (те, которые не являются ничьими дочерними)
    let rootNodes: PositionHierarchyNode[] = [];
    
    if (initialPositionId) {
      // Если указан конкретный ID начальной должности
      const rootNode = positionNodes[initialPositionId];
      if (rootNode) {
        rootNodes = [rootNode];
        console.log(`Используем указанную начальную должность: "${rootNode.position.name}" (ID: ${initialPositionId})`);
      } else {
        console.log(`Начальная должность с ID ${initialPositionId} не найдена`);
        // Используем всех, кто не является чьим-то дочерним, как резервный вариант
        rootNodes = Object.values(positionNodes).filter(
          node => !childPositionIds.has(node.position.position_id)
        );
      }
    } else {
      // Если начальная должность не указана, используем должности, которые не являются ничьими дочерними
      rootNodes = Object.values(positionNodes).filter(
        node => !childPositionIds.has(node.position.position_id)
      );
      
      console.log(`Найдено ${rootNodes.length} корневых должностей:`);
      rootNodes.forEach(node => {
        console.log(`- Корневая должность: "${node.position.name}" (ID: ${node.position.position_id}) с ${node.subordinates.length} подчиненными`);
      });
    }
    
    return rootNodes;
  };

  // Построение иерархии позиций и отделов при загрузке данных
  useEffect(() => {
    if (positions.length > 0 && employees.length > 0 && departments.length > 0 && positionPositionsResponse?.data) {
      // Построение иерархии должностей
      const hierarchy = buildPositionHierarchy(
        positions,
        employees,
        departments,
        selectedPositionId
      );
      
      setPositionHierarchy(hierarchy);
      
      // Если выбрана конкретная должность, отфильтруем иерархию
      if (selectedPositionId) {
        setFilteredHierarchy(hierarchy);
      } else {
        setFilteredHierarchy(hierarchy);
      }
    }
  }, [positions, employees, departments, selectedPositionId, positionPositionsResponse]);

  // Компоненты для отображения иерархии
  const DepartmentCard = ({ department }: { department: DepartmentNode }) => (
    <div className={departmentNodeStyle} style={{ width: `${department.width}%` }}>
      <div className="font-bold text-[#a40000]">{department.name}</div>
      <div className="text-xs text-gray-500">Отдел ID: {department.department_id}</div>
    </div>
  );

  const PositionCard = ({ 
    position,
    employees,
    onPositionClick
  }: { 
    position: Position,
    employees: Employee[],
    onPositionClick?: (positionId: number) => void 
  }) => (
    <div 
      className={positionNodeStyle}
      onClick={() => onPositionClick && onPositionClick(position.position_id)}
    >
      <div className="font-bold text-blue-700">{position.name}</div>
      <div className="text-xs text-gray-500">ID: {position.position_id}</div>
      {employees.map(employee => (
        <div key={employee.employee_id} className={employeeNodeStyle}>
          {employee.full_name}
        </div>
      ))}
      {showVacancies && employees.length === 0 && (
        <div className={vacancyNodeStyle}>Вакансия</div>
      )}
    </div>
  );

  // Отображение узла организационной структуры
  const renderTreeNode = (node: PositionHierarchyNode) => {
    return (
      <div className={treeContainerStyle}>
        <PositionCard 
          position={node.position} 
          employees={node.employees}
          onPositionClick={onPositionClick}
        />
        
        {/* Отображение подчиненных должностей */}
        {node.subordinates.length > 0 && (
          <>
            <div className={treeLineStyle}></div>
            <div className="flex flex-wrap justify-center gap-4">
              {node.subordinates.map((subordinate, index) => (
                <div key={`${subordinate.position.position_id}-${index}`} className={treeContainerStyle}>
                  {renderTreeNode(subordinate)}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Отображение дочерних отделов */}
        {node.childDepartments.length > 0 && (
          <>
            <div className={treeLineStyle}></div>
            <div className="flex flex-wrap justify-center gap-4">
              {node.childDepartments.map(department => (
                <div key={department.department_id} className={departmentNodeStyle}>
                  <div className="font-bold text-[#a40000]">{department.name}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Функция для обработки клика по позиции
  const handlePositionClick = (positionId: number) => {
    if (onPositionClick) {
      onPositionClick(positionId);
    } else {
      // Добавляем текущую позицию в историю навигации
      if (selectedPositionId) {
        setNavigationHistory(prev => [...prev, selectedPositionId]);
      }
      setSelectedPositionId(positionId);
    }
  };

  // Функция для возврата к предыдущей позиции
  const handleBack = () => {
    if (navigationHistory.length > 0) {
      // Берем последнюю позицию из истории
      const prevPosition = navigationHistory[navigationHistory.length - 1];
      // Обновляем историю, удаляя последний элемент
      setNavigationHistory(prev => prev.slice(0, -1));
      // Устанавливаем предыдущую позицию
      setSelectedPositionId(prevPosition);
    } else {
      // Если истории нет, сбрасываем выбранную позицию
      setSelectedPositionId(undefined);
    }
  };

  // Функция для возврата к корневой позиции
  const handleReset = () => {
    setNavigationHistory([]);
    setSelectedPositionId(undefined);
  };

  return (
    <div className="w-full">
      {/* Панель навигации и настроек */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          {selectedPositionId && (
            <>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeftCircleIcon className="h-4 w-4 mr-1" />
                Назад
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                К началу
              </Button>
            </>
          )}
        </div>
        
        <div className={settingsContainerStyle}>
          <div className={settingItemStyle}>
            <Switch
              id="three-levels"
              checked={showThreeLevels}
              onCheckedChange={setShowThreeLevels}
            />
            <Label htmlFor="three-levels">Три уровня</Label>
          </div>
          
          <div className={settingItemStyle}>
            <Switch
              id="show-vacancies"
              checked={showVacancies}
              onCheckedChange={setShowVacancies}
            />
            <Label htmlFor="show-vacancies">Показать вакансии</Label>
          </div>
        </div>
      </div>
      
      {/* Хлебные крошки для навигации */}
      {navigationHistory.length > 0 && (
        <div className={breadcrumbStyle}>
          <span className={breadcrumbItemStyle} onClick={handleReset}>
            <NavigationIcon className="h-3 w-3" />
            Начало
          </span>
          
          {navigationHistory.map((posId, index) => {
            const position = positions.find(p => p.position_id === posId);
            return (
              <React.Fragment key={posId}>
                <span className={breadcrumbSeparatorStyle}>/</span>
                <span
                  className={breadcrumbItemStyle}
                  onClick={() => {
                    // Переходим к этой позиции и обновляем историю
                    setNavigationHistory(prev => prev.slice(0, index + 1));
                    setSelectedPositionId(posId);
                  }}
                >
                  <UserIcon className="h-3 w-3" />
                  {position?.name || `Позиция ${posId}`}
                </span>
              </React.Fragment>
            );
          })}
          
          {selectedPositionId && (
            <>
              <span className={breadcrumbSeparatorStyle}>/</span>
              <span className="font-semibold flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {positions.find(p => p.position_id === selectedPositionId)?.name || `Позиция ${selectedPositionId}`}
              </span>
            </>
          )}
        </div>
      )}
      
      {/* Отображение организационного дерева */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] flex justify-center p-4">
          {filteredHierarchy.length > 0 ? (
            <div className="flex flex-col items-center">
              {filteredHierarchy.map((node, index) => (
                <div key={`${node.position.position_id}-${index}`} className="mb-8">
                  {renderTreeNode(node)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              Загрузка данных...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationTree;