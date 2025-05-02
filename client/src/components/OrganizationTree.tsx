import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Building, User } from "lucide-react";

// Типы данных
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted?: boolean;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
  departments?: { department_id: number }[];
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
};

type PositionPosition = {
  position_position_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number;
  deleted: boolean;
};

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: Position[];
  employeesData?: Employee[];
};

export default function OrganizationTree({
  departmentsData = [],
  positionsData = [],
  employeesData = [],
  onPositionClick,
  initialPositionId,
}: OrganizationTreeProps) {
  // Состояние для отслеживания развёрнутых элементов
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [expanded, setExpanded] = useState(false);
  
  // Загружаем связи position_position
  const { data: positionPositionsResponse } = useQuery<{
    status: string;
    data: PositionPosition[];
  }>({
    queryKey: ["/api/positionpositions"],
  });
  
  const { data: settingsResponse } = useQuery<{
    status: string;
    data: any;
  }>({
    queryKey: ["/api/settings"],
    onError: () => {
      console.log("Ошибка получения настроек, используем значения по умолчанию");
    }
  });
  
  // Получаем настройки отображения уровней иерархии
  const hierarchyLevels = settingsResponse?.data?.hierarchy_levels || 2;
  const [showThreeLevels, setShowThreeLevels] = useState(hierarchyLevels > 2);
  
  useEffect(() => {
    setShowThreeLevels(hierarchyLevels > 2);
    console.log("Настройки уровней иерархии:", hierarchyLevels);
    console.log("Обновленная настройка showThreeLevels:", showThreeLevels);
  }, [hierarchyLevels]);
  
  // Данные из пропсов
  const departments = departmentsData || [];
  const positions = positionsData || [];
  const employees = employeesData || [];
  
  // Получаем связи position_position
  const positionPositions = positionPositionsResponse?.data || [];
  const activePositionPositions = positionPositions.filter(pp => !pp.deleted);
  
  console.log("Данные о связях position_position:", activePositionPositions.length === 0 
    ? "получено 0 связей" 
    : activePositionPositions);
  console.log("Активные связи position_position:", activePositionPositions);
  
  // Функции для работы с деревом
  const toggleDept = (id: number) => {
    const isCurrentlyExpanded = expDept[id] === false ? false : (expanded || (expDept[id] ?? false));
    setExpDept((s) => ({ ...s, [id]: !isCurrentlyExpanded }));
  };
  
  const togglePos = (key: string) => {
    const isCurrentlyExpanded = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    setExpPos((s) => ({ ...s, [key]: !isCurrentlyExpanded }));
  };
  
  // Вспомогательные функции для работы с деревом
  const getChildDeptsByDept = (deptId: number) =>
    departments.filter((d) => !d.deleted && d.parent_department_id === deptId);

  const getChildDeptsByPosition = (posId: number) =>
    departments.filter((d) => !d.deleted && d.parent_position_id === posId);

  const getDeptPositions = (deptId: number) => {
    // Получаем все должности, связанные с этим отделом
    const linked = positions.filter((p) =>
      p.departments && Array.isArray(p.departments) && 
      p.departments.some((dd) => dd.department_id === deptId),
    );
    
    // Получаем связи position_position для этого отдела
    const positionRelations = activePositionPositions.filter(pp => pp.department_id === deptId);
    
    // Создаем карту всех должностей этого отдела для построения иерархии
    const map: { [k: number]: any } = {};
    linked.forEach((p) => {
      map[p.position_id] = { ...p, children: [] };
    });
    
    // Строим иерархию на основе данных position_position
    positionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      // Проверяем, что обе должности существуют в этом отделе
      if (map[childId] && map[parentId]) {
        // Добавляем дочернюю должность к родительской
        map[parentId].children.push(map[childId]);
      }
    });
    
    // Находим корневые должности
    const isChildInDept = new Set<number>();
    positionRelations.forEach(rel => {
      isChildInDept.add(rel.position_id);
    });
    
    // Корневые должности - это те, которые есть в отделе, но не являются дочерними
    const rootPositions = linked.filter(p => !isChildInDept.has(p.position_id));
    
    return rootPositions;
  };

  const getEmps = (posId: number, deptId: number) =>
    employees.filter(
      (e) => e.position_id === posId && e.department_id === deptId,
    );
  
  // Находим корневой отдел (тот, у которого нет родителя)
  const rootDepartment = departments.find(
    d => !d.deleted && d.parent_department_id === null && d.parent_position_id === null
  );
  
  if (rootDepartment) {
    console.log("Найден корневой отдел:", rootDepartment);
  }
  
  // Находим все должности корневого отдела
  let adminPositions: Position[] = [];
  
  if (rootDepartment) {
    adminPositions = getDeptPositions(rootDepartment.department_id);
  
    // Если мы не нашли должности через positionsWithDepartments, используем резервную логику
    if (adminPositions.length === 0) {
      adminPositions = positions.filter((pos) => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        // через сотрудников, назначенных на эту должность в этом отделе
        return employees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === rootDepartment.department_id,
        );
      });
    }
  
    console.log(
      "Должности корневого отдела:",
      adminPositions.map((p) => `${p.name} (ID: ${p.position_id})`),
    );
  }
  
  // Функция для рендеринга должности
  const renderPos = (p: Position, deptId: number, lvl = 0, parentDeptId: number | null = null) => {
    // Проверяем, развернут ли этот элемент
    const ex = expPos[`${p.position_id}-${deptId}`] === false ? false : (expanded || (expPos[`${p.position_id}-${deptId}`] ?? false));
    
    // Получаем сотрудников для этой должности в этом отделе
    const emps = getEmps(p.position_id, deptId);
    
    // Получаем дочерние должности
    const childPositions = positions.filter(cp => {
      // Проверяем связи position_position
      return activePositionPositions.some(
        rel => rel.position_id === cp.position_id && rel.parent_position_id === p.position_id && rel.department_id === deptId
      );
    });
    
    // Получаем дочерние отделы для этой должности
    const childDepts = getChildDeptsByPosition(p.position_id);
    
    // Определяем, есть ли несколько сотрудников
    const hasMultipleEmployees = emps.length > 1;
    
    return (
      <div key={`pos-${p.position_id}-${deptId}`} className="mb-2">
        {/* Заголовок должности */}
        <div 
          className={`flex items-center p-2 border rounded-md ${
            childPositions.length > 0 || childDepts.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''
          }`}
          onClick={() => {
            if (childPositions.length > 0 || childDepts.length > 0) {
              togglePos(`${p.position_id}-${deptId}`);
            }
          }}
        >
          {/* Показываем стрелку, только если есть дочерние элементы */}
          {(childPositions.length > 0 || childDepts.length > 0) && (
            ex ? (
              <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
            )
          )}
          
          {/* Иконка пользователя, если есть сотрудник */}
          {emps.length === 1 ? (
            <User className="h-5 w-5 mr-2 text-green-600" />
          ) : (
            <User className="h-5 w-5 mr-2 text-gray-400" />
          )}
          
          {/* Название должности */}
          <span className="font-medium">{p.name}</span>
          
          {/* Если есть один сотрудник, показываем его имя рядом */}
          {emps.length === 1 && (
            <span className="ml-2 text-green-700">{emps[0].full_name}</span>
          )}
          
          {/* Индикатор количества сотрудников */}
          {emps.length > 1 && (
            <span className="ml-2 text-blue-600 text-sm">
              ({emps.length} сотрудника)
            </span>
          )}
        </div>
        
        {/* Содержимое, которое показывается при развернутом элементе */}
        {ex && (
          <div className="ml-6 border-l-2 pl-4 mt-1">
            {/* Если несколько сотрудников, отображаем их списком */}
            {hasMultipleEmployees && (
              <div className="mb-2">
                <div className="border-l border-l-gray-200 ml-1">
                  {emps.map(emp => (
                    <div 
                      key={emp.employee_id} 
                      className="flex items-center p-1 pl-4 hover:bg-gray-50 rounded-r"
                    >
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm">{emp.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Дочерние должности */}
            {childPositions.length > 0 && childPositions.map(c => renderPos(c, deptId, lvl + 1, deptId))}
            
            {/* Дочерние отделы */}
            {childDepts.length > 0 && childDepts.map(d => renderDept(d, lvl + 1, p.position_id))}
          </div>
        )}
      </div>
    );
  };
  
  // Функция для рендеринга отдела
  const renderDept = (d: Department, lvl = 0, parentId: number | null = null) => {
    // Проверяем, развернут ли этот элемент
    const ex = expDept[d.department_id] === false ? false : (expanded || (expDept[d.department_id] ?? false));
    
    // Получаем дочерние отделы
    const childDepts = getChildDeptsByDept(d.department_id);
    
    // Получаем должности отдела
    const deptPositions = getDeptPositions(d.department_id);
    
    return (
      <div key={`dept-${d.department_id}`} className="mb-3">
        {/* Заголовок отдела */}
        <div 
          className="flex items-center p-2 border border-primary/20 bg-primary/5 rounded-md cursor-pointer hover:bg-primary/10"
          onClick={() => toggleDept(d.department_id)}
        >
          {ex ? (
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          )}
          <Building className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{d.name}</span>
          <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>
        </div>
        
        {/* Содержимое, которое показывается при развернутом элементе */}
        {ex && (
          <div className="ml-6 border-l-2 pl-4 py-2">
            {/* Должности отдела */}
            {deptPositions.length > 0 ? (
              deptPositions.map(p => renderPos(p, d.department_id, lvl, d.department_id))
            ) : (
              <div className="italic text-neutral-500 pl-7 mt-1">
                Нет должностей в этом отделе
              </div>
            )}
            
            {/* Дочерние отделы */}
            {childDepts.length > 0 && childDepts.map(cd => renderDept(cd, lvl + 1, d.department_id))}
          </div>
        )}
      </div>
    );
  };
  
  // Находим все корневые отделы
  const roots = departments.filter(
    d => !d.deleted && d.parent_department_id === null && d.parent_position_id === null
  );
  
  return (
    <div className="tree-container">
      {/* Заголовок и кнопки управления */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Организационная структура</h2>
        <div>
          <button 
            className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm mr-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Свернуть все" : "Развернуть все"}
          </button>
        </div>
      </div>
      
      {/* Вывод корневых отделов */}
      {roots.map(r => renderDept(r, 0, null))}
      
      {/* Если нет корневых отделов */}
      {roots.length === 0 && (
        <div className="text-center py-6 text-neutral-500">
          <Building className="h-12 w-12 mx-auto mb-2 text-neutral-400" />
          <p>Организационная структура не настроена</p>
        </div>
      )}
    </div>
  );
}