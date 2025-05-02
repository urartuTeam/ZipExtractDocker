import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Building,
  User,
  ChevronsRight,
  ChevronsDown,
} from "lucide-react";

// Копируем типы из OrganizationStructure.tsx
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

// Интерфейс для связки должности с отделом
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

// Компонент для отображения структуры как в админке
const AdminStructureView: React.FC = () => {
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [expanded, setExpanded] = useState(false);

  const { data: deptR, isLoading: ld } = useQuery<{ data: Department[] }>({
    queryKey: ["/api/departments"],
  });
  
  const { data: posR, isLoading: lp } = useQuery<{ data: Position[] }>({
    queryKey: ["/api/positions/with-departments"],
  });
  
  const { data: empR, isLoading: le } = useQuery<{ data: Employee[] }>({
    queryKey: ["/api/employees"],
  });
  
  // Получаем данные о связях должностей с отделами
  const { data: posDeptR, isLoading: lpd } = useQuery<{
    data: PositionDepartment[];
  }>({
    queryKey: ["/api/positiondepartments"],
  });
  
  // Получаем данные о иерархии должностей
  const { data: positionPositionsR, isLoading: lpp } = useQuery<{ 
    data: { 
      position_position_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number;
      deleted: boolean;
    }[] 
  }>({
    queryKey: ["/api/positionpositions"],
  });
  
  if (ld || lp || le || lpd || lpp) return <div>Загрузка...</div>;

  const departments = deptR?.data || [];
  const positions = posR?.data || [];
  const employees = empR?.data || [];
  const positionDepartments = posDeptR?.data || [];
  const positionPositions = positionPositionsR?.data || [];

  const toggleDept = (id: number) => {
    // Если элемент сейчас развернут, то закрываем его
    // Если элемент сейчас закрыт, то открываем его
    const isCurrentlyExpanded = expDept[id] === false ? false : (expanded || (expDept[id] ?? false));
    setExpDept((s) => ({ ...s, [id]: !isCurrentlyExpanded }));
  };
  
  const togglePos = (key: string) => {
    // Если элемент сейчас развернут, то закрываем его
    // Если элемент сейчас закрыт, то открываем его
    const isCurrentlyExpanded = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    setExpPos((s) => ({ ...s, [key]: !isCurrentlyExpanded }));
  };
    
  // Функция для разворачивания/сворачивания всей структуры
  const toggleAllStructure = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    if (!newExpandedState) {
      // Если сворачиваем структуру, сбрасываем все состояния
      setExpDept({});
      setExpPos({});
    }
  };

  // Возвращает дочерние отделы для указанного отдела
  const getChildDeptsByDept = (deptId: number) => {
    return departments.filter(
      (d) => !d.deleted && d.parent_department_id === deptId && d.parent_position_id === null
    );
  };

  // Возвращает отделы, подчиненные должности
  const getChildDeptsByPos = (posId: number) => {
    return departments.filter(
      (d) => !d.deleted && d.parent_position_id === posId
    );
  };

  // Возвращает должности отдела
  const getDeptPositions = (deptId: number) => {
    // Находим все связи должность-отдел для указанного отдела
    const linkIds = positionDepartments
      .filter((pd) => !pd.deleted && pd.department_id === deptId)
      .map((pd) => pd.position_id);
      
    // Возвращаем должности, которые связаны с отделом
    return positions.filter((p) => linkIds.includes(p.position_id));
  };

  // Возвращает должности, подчиненные указанной должности в указанном отделе
  const getChildPositions = (posId: number, deptId: number) => {
    // Находим все связи должность-должность для указанной родительской должности
    const childPosIds = positionPositions
      .filter((pp) => !pp.deleted && pp.parent_position_id === posId && pp.department_id === deptId)
      .map((pp) => pp.position_id);
      
    // Возвращаем только должности, которые подчинены указанной
    return positions.filter((p) => childPosIds.includes(p.position_id));
  };

  // Возвращает сотрудников для указанной должности в указанном отделе
  const getPosEmployees = (posId: number, deptId: number) => {
    return employees.filter(
      (e) => e.position_id === posId && e.department_id === deptId
    );
  };
  
  // Проверяет, является ли должность вакантной
  const isPositionVacant = (posId: number, deptId: number) => {
    return getPosEmployees(posId, deptId).length === 0;
  };

  // Корневые отделы (без родителей)
  const roots = departments.filter(
    (d) => !d.deleted && d.parent_department_id === null && d.parent_position_id === null
  );

  // Рендеринг отдельной должности и её детей
  const renderPos = (p: Position, d: Department, lvl: number = 0) => {
    const key = `pos-${p.position_id}-dept-${d.department_id}`;
    const ex = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    
    // Получаем подчиненные элементы
    const childPos = getChildPositions(p.position_id, d.department_id);
    const childDepts = getChildDeptsByPos(p.position_id);
    const hasChildren = childPos.length > 0 || childDepts.length > 0;
    
    // Сотрудники на этой должности
    const emps = getPosEmployees(p.position_id, d.department_id);
    
    // Вычисляем отступ в зависимости от уровня
    const paddingLeft = `${lvl * 20}px`;
    
    // Контейнер для должности и её подчиненных
    const posContent = (
      <div className="mb-2">
        <div 
          className="relative flex items-center p-2 border border-primary/20 bg-secondary/5 rounded-md cursor-pointer hover:bg-primary/10"
          style={{ paddingLeft }}
          onClick={() => togglePos(key)}
        >
          {hasChildren && (
            ex ? 
              <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
              <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          )}
          <User className="h-5 w-5 mr-2 text-blue-500" />
          <span className="font-medium">
            {p.name} {isPositionVacant(p.position_id, d.department_id) ? '(Вакантная)' : emps.length > 0 ? `(${emps[0].full_name})` : ''}
          </span>
        </div>
      </div>
    );
    
    // Контейнер для всех подчиненных элементов (отображается, если раскрыто)
    const childrenContent = (
      <div className={`ml-6 ${ex ? 'block' : 'hidden'}`}>
        {/* Подчиненные должности */}
        {childPos.map((cp) => renderPos(cp, d, lvl + 1))}
        
        {/* Подчиненные отделы */}
        {childDepts.map((cd) => renderDept(cd, lvl + 1, p.position_id))}
      </div>
    );

    return (
      <div key={key} className="mb-2">
        {posContent}
        {childrenContent}
      </div>
    );
  };

  const renderDept = (d: Department, lvl = 0, parentId: number | null = null) => {
    // Если элемент явно закрыт в expDept, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expDept[d.department_id] === false ? false : (expanded || (expDept[d.department_id] ?? false));
    
    // Получаем и сортируем дочерние элементы
    const childDepts = getChildDeptsByDept(d.department_id);
    const deptPositions = getDeptPositions(d.department_id);
    
    // Определяем классы для карточки отдела
    const deptCardClasses = "relative flex items-center p-2 border border-primary/20 bg-primary/5 rounded-md cursor-pointer hover:bg-primary/10";
    
    // Вычисляем отступ в зависимости от уровня
    const paddingLeft = `${lvl * 20}px`;
    
    // Контент элемента отдела
    const deptContent = (
      <div
        className={deptCardClasses}
        style={{ paddingLeft }}
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
    );
    
    return (
      <div key={`dept-${d.department_id}`} className="mb-2">
        {deptContent}
        
        {/* Дочерние элементы (отображаются, если отдел развернут) */}
        <div className={`ml-6 ${ex ? 'block' : 'hidden'}`}>
          {/* Должности отдела */}
          {deptPositions.map((p) => renderPos(p, d, lvl + 1))}
          
          {/* Дочерние отделы */}
          {childDepts.map((cd) => renderDept(cd, lvl + 1))}
        </div>
      </div>
    );
  };

  // Контент карточки структуры организации
  const cardContent = (
    <>
      {roots.map((r) => renderDept(r, 0, null))}
    </>
  );

  return (
    <div className="p-2">
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-1 border border-primary hover:bg-primary/10" 
          onClick={toggleAllStructure}
        >
          {expanded ? (
            <>
              <ChevronsDown className="h-4 w-4" />
              <span>Свернуть структуру</span>
            </>
          ) : (
            <>
              <ChevronsRight className="h-4 w-4" />
              <span>Развернуть структуру</span>
            </>
          )}
        </Button>
      </div>
      
      {cardContent}
    </div>
  );
};

export default AdminStructureView;