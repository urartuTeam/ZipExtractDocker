import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Users, Building, User, ChevronsRight, ChevronsDown } from "lucide-react";

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
// Интерфейс для связки должности с отделом (содержит информацию о вакансиях)
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

export default function OrganizationStructure() {
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
  
  // Получаем данные о связях должностей с отделами (включая информацию о вакансиях)
  const { data: posDeptR, isLoading: lpd } = useQuery<{
    data: PositionDepartment[];
  }>({
    queryKey: ["/api/positiondepartments"],
  });
  
  if (ld || lp || le || lpd) return <div>Загрузка...</div>;

  const departments = deptR?.data || [];
  const positions = posR?.data || [];
  const employees = empR?.data || [];
  const positionDepartments = posDeptR?.data || [];

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
    
    // При развертывании, мы не меняем состояния expDept и expPos,
    // потому что логика рендеринга теперь учитывает expanded
    // и сами состояния элементов, что позволяет закрывать отдельные элементы
    // после общего разворачивания
  };

  const roots = departments.filter(
    (d) =>
      !d.deleted &&
      d.parent_department_id === null &&
      d.parent_position_id === null,
  );

  const getChildDeptsByDept = (deptId: number) =>
    departments.filter((d) => !d.deleted && d.parent_department_id === deptId);

  const getChildDeptsByPosition = (posId: number) =>
    departments.filter((d) => !d.deleted && d.parent_position_id === posId);

  const getDeptPositions = (deptId: number) => {
    const linked = positions.filter((p) =>
      p.departments.some((dd) => dd.department_id === deptId),
    );
    const map: { [k: number]: any } = {};
    linked.forEach((p) => (map[p.position_id] = { ...p, children: [] }));
    linked.forEach((p) => {
      if (p.parent_position_id && map[p.parent_position_id]) {
        map[p.parent_position_id].children.push(map[p.position_id]);
      }
    });
    return Object.values(map).filter(
      (p: any) => p.parent_position_id === null || !map[p.parent_position_id],
    );
  };

  const getEmps = (posId: number, deptId: number) =>
    employees.filter(
      (e) => e.position_id === posId && e.department_id === deptId,
    );
    
  // Функция для получения информации о вакансиях для позиции в отделе
  const getPositionDepartmentInfo = (posId: number, deptId: number) => {
    const positionDept = positionDepartments.find(
      pd => pd.position_id === posId && pd.department_id === deptId && !pd.deleted
    );
    
    // Получаем список сотрудников для этой позиции и отдела
    const emps = getEmps(posId, deptId);
    
    // Общее количество мест - это значение vacancies из БД (новая интерпретация)
    const staffUnits = positionDept?.vacancies || 0;
    
    // Текущее количество сотрудников - это фактическое количество сотрудников в этой должности
    const currentCount = emps.length;
    
    // Свободные места - это разница между общим количеством и занятыми местами
    // Если отрицательное значение (сотрудников больше чем мест), то считаем что вакансий нет (0)
    const vacancies = Math.max(0, staffUnits - currentCount);
    
    return {
      staffUnits, // Общее количество мест
      vacancies,  // Количество свободных мест
      currentCount // Текущее количество сотрудников
    };
  };

  const renderPos = (p: any, deptId: number, lvl = 0) => {
    const key = `${p.position_id}-${deptId}`;
    // Если элемент явно закрыт в expPos, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);
    
    // Получаем информацию о вакансиях для данной позиции в отделе
    const { staffUnits, vacancies } = getPositionDepartmentInfo(p.position_id, deptId);
    
    // Определяем, как отображать сотрудников в зависимости от их количества
    // Если один сотрудник - показываем в скобках рядом с должностью
    // Если несколько - показываем только должность, а сотрудников при раскрытии
    const hasMultipleEmployees = emps.length > 1;
    
    // Функция для правильного склонения слова "сотрудник"
    const getEmployeeWord = (count: number) => {
      const lastDigit = count % 10;
      const lastTwoDigits = count % 100;
      
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'сотрудников';
      } else if (lastDigit === 1) {
        return 'сотрудник';
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'сотрудника';
      } else {
        return 'сотрудников';
      }
    };
    
    const displayText = emps.length === 0 
      ? `${p.name} (Вакантная)` 
      : hasMultipleEmployees 
        ? `${p.name}` 
        : `${p.name} (${emps[0].full_name})`;

    return (
      <div key={key} className="mb-2">
        <div
          className="relative flex items-center cursor-pointer p-2 border border-gray-200 rounded-md hover:bg-gray-50"
          style={{ paddingLeft: `${lvl * 16 + 8}px` }}
          onClick={() => togglePos(key)}
        >
          {/* Количество свободных позиций (верхний правый угол) */}
          {vacancies > 0 && (
            <div className="absolute top-0 right-0 m-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
              +{vacancies}
            </div>
          )}
          
          {ex ? (
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          )}
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          <span>{displayText}</span>
          
          {/* Общее количество мест (нижний правый угол) */}
          {staffUnits > 0 && (
            <div className="absolute bottom-0 right-0 m-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {staffUnits}
            </div>
          )}
        </div>
        
        {ex && (
          <div className="ml-6 border-l-2 pl-4 mt-1">
            {/* Если несколько сотрудников, отображаем их как дочерние элементы */}
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
            {childPositions.map((c: any) => renderPos(c, deptId, lvl + 1))}
            {childDepts.map((d) => renderDept(d, lvl + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDept = (d: Department, lvl = 0) => {
    // Если элемент явно закрыт в expDept, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expDept[d.department_id] === false ? false : (expanded || (expDept[d.department_id] ?? false));
    const childDepts = getChildDeptsByDept(d.department_id);
    const deptPositions = getDeptPositions(d.department_id);

    return (
      <div key={d.department_id} className="ml-4 mb-2">
        <div
          className="relative flex items-center cursor-pointer p-2 border border-primary/20 bg-primary/5 rounded-md hover:bg-primary/10"
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
        {ex && (
          <div className="ml-6 border-l-2 pl-4 py-2">
            {deptPositions.length > 0 ? (
              deptPositions.map((p) => renderPos(p, d.department_id))
            ) : (
              <div className="italic text-neutral-500 pl-7 mt-1">
                Нет должностей в этом отделе
              </div>
            )}
            {childDepts.map((cd) => renderDept(cd, lvl + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Структура организации</CardTitle>
            <CardDescription>Иерархия</CardDescription>
          </div>
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
        </CardHeader>
        <CardContent>{roots.map((r) => renderDept(r))}</CardContent>
      </Card>
    </div>
  );
}
