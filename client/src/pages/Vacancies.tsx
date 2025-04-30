import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Building, Users, User } from "lucide-react";

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

export default function Vacancies() {
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  
  // Получаем данные о департаментах
  const { data: deptR, isLoading: ld } = useQuery<{ data: Department[] }>({
    queryKey: ["/api/departments"],
  });
  
  // Получаем данные о позициях
  const { data: posR, isLoading: lp } = useQuery<{
    data: Position[];
  }>({
    queryKey: ["/api/positions/with-departments"],
  });
  
  // Получаем данные о сотрудниках
  const { data: empR, isLoading: le } = useQuery<{
    data: Employee[];
  }>({
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
    setExpDept((s) => ({ ...s, [id]: !s[id] }));
  };
  
  const togglePos = (key: string) => {
    setExpPos((s) => ({ ...s, [key]: !s[key] }));
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
    
    return {
      staffUnits: positionDept?.staff_units || 0, // Общее количество мест
      vacancies: positionDept?.vacancies || 0,     // Количество свободных мест
      currentCount: positionDept?.current_count || 0 // Текущее количество сотрудников
    };
  };
  
  // Рендер строки таблицы для должности
  const renderPositionRow = (p: any, deptId: number, lvl = 0, parentId?: string) => {
    const key = `${p.position_id}-${deptId}`;
    const rowId = parentId ? `${parentId}-${key}` : key;
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);
    
    // Получаем информацию о вакансиях
    const { staffUnits, vacancies, currentCount } = getPositionDepartmentInfo(p.position_id, deptId);
    
    // Проверяем развернуто ли это поддерево
    const ex = expPos[key] ?? false;
    
    const rows = [];
    
    // Добавляем строку для текущей должности
    rows.push(
      <TableRow key={rowId} className={parentId ? "bg-gray-50" : ""}>
        <TableCell className="font-medium">
          <div 
            className="flex items-center cursor-pointer" 
            style={{ paddingLeft: `${lvl * 20}px` }}
            onClick={() => togglePos(key)}
          >
            {(childPositions.length > 0 || childDepts.length > 0) && (
              ex ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              )
            )}
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            <span>{p.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-center">{staffUnits}</TableCell>
        <TableCell className="text-center">{emps.length}</TableCell>
        <TableCell className="text-center">
          {vacancies > 0 ? (
            <span className="text-green-600 font-medium">+{vacancies}</span>
          ) : (
            vacancies
          )}
        </TableCell>
      </TableRow>
    );
    
    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      // Добавляем дочерние должности
      childPositions.forEach((child: any) => {
        rows.push(...renderPositionRow(child, deptId, lvl + 1, rowId));
      });
      
      // Добавляем дочерние департаменты
      childDepts.forEach((dept) => {
        rows.push(...renderDepartmentRow(dept, lvl + 1, rowId));
      });
    }
    
    return rows;
  };
  
  // Рендер строк таблицы для отдела
  const renderDepartmentRow = (d: Department, lvl = 0, parentId?: string) => {
    const rowId = parentId ? `${parentId}-dept-${d.department_id}` : `dept-${d.department_id}`;
    const childDepts = getChildDeptsByDept(d.department_id);
    const deptPositions = getDeptPositions(d.department_id);
    
    // Проверяем развернуто ли это поддерево
    const ex = expDept[d.department_id] ?? false;
    
    const rows = [];
    
    // Добавляем строку для текущего отдела
    rows.push(
      <TableRow key={rowId} className="bg-primary/5">
        <TableCell className="font-medium" colSpan={4}>
          <div 
            className="flex items-center cursor-pointer" 
            style={{ paddingLeft: `${lvl * 20}px` }}
            onClick={() => toggleDept(d.department_id)}
          >
            {(deptPositions.length > 0 || childDepts.length > 0) && (
              ex ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              )
            )}
            <Building className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">{d.name}</span>
            <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>
          </div>
        </TableCell>
      </TableRow>
    );
    
    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      // Добавляем должности отдела
      deptPositions.forEach((position) => {
        rows.push(...renderPositionRow(position, d.department_id, lvl + 1, rowId));
      });
      
      // Добавляем дочерние отделы
      childDepts.forEach((childDept) => {
        rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
      });
    }
    
    return rows;
  };
  
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Учет вакансий</CardTitle>
          <CardDescription>Анализ штатных единиц и занятых позиций</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[400px]">Структура организации</TableHead>
                <TableHead className="text-center">Всего мест</TableHead>
                <TableHead className="text-center">Занято</TableHead>
                <TableHead className="text-center">Вакансий</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roots.map((dept) => renderDepartmentRow(dept, 0))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}