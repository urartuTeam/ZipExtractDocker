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
  if (ld || lp || le) return <div>Загрузка...</div>;

  const departments = deptR?.data || [];
  const positions = posR?.data || [];
  const employees = empR?.data || [];

  const toggleDept = (id: number) =>
    setExpDept((s) => ({ ...s, [id]: !s[id] }));
  const togglePos = (key: string) =>
    setExpPos((s) => ({ ...s, [key]: !s[key] }));
    
  // Функция для разворачивания/сворачивания всей структуры
  const toggleAllStructure = () => {
    setExpanded(!expanded);
    
    // Получаем все ID отделов и идентификаторы должностей
    const allDeptIds = departments.filter(d => !d.deleted).map(d => d.department_id);
    
    // Создаем объекты для развернутых/свернутых элементов
    const deptState: { [k: number]: boolean } = {};
    const posState: { [k: string]: boolean } = {};
    
    // Если разворачиваем, устанавливаем все элементы как развернутые
    if (!expanded) {
      allDeptIds.forEach(id => { deptState[id] = true; });
      
      // Для каждого отдела получаем связанные должности и добавляем их в posState
      allDeptIds.forEach(deptId => {
        const deptPositions = positions.filter(p => 
          p.departments.some(dd => dd.department_id === deptId)
        );
        
        deptPositions.forEach(pos => {
          posState[`${pos.position_id}-${deptId}`] = true;
        });
      });
    }
    
    // Обновляем состояния
    setExpDept(deptState);
    setExpPos(posState);
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

  const renderPos = (p: any, deptId: number, lvl = 0) => {
    const key = `${p.position_id}-${deptId}`;
    // Если элемент явно закрыт в expPos, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);
    
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
      <div key={key}>
        <div
          className="flex items-center cursor-pointer p-2"
          style={{ paddingLeft: `${lvl * 16 + 8}px` }}
          onClick={() => togglePos(key)}
        >
          {ex ? (
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          )}
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          <span>{displayText}</span>
        </div>
        {ex && (
          <div className="ml-6 border-l-2 pl-4">
            {/* Если несколько сотрудников, отображаем их как дочерние элементы */}
            {hasMultipleEmployees && (
              <div className="mt-1 mb-2">
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
      <div key={d.department_id} className="ml-4">
        <div
          className="flex items-center cursor-pointer p-2"
          onClick={() => toggleDept(d.department_id)}
        >
          {ex ? (
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          )}
          <Building className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{d.name} <span className="text-neutral-600 ml-1">(Отдел)</span></span>
        </div>
        {ex && (
          <div className="ml-6 border-l-2 pl-4 py-2">
            {deptPositions.length > 0 ? (
              deptPositions.map((p) => renderPos(p, d.department_id))
            ) : (
              <div className="italic text-neutral-500 pl-7">
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
