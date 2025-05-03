import React, { useState, useEffect } from "react";
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
import { Link } from "wouter";

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

type PositionRelation = {
  position_position_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number;
  deleted: boolean;
};

export default function Vacancies() {
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(true);

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
  const { data: posDeptR } = useQuery<{
    data: PositionDepartment[];
  }>({
    queryKey: ["/api/pd"],
  });
  
  // Получаем данные о связях между должностями (parent-child)
  const { data: posPositionsR } = useQuery<{
    data: PositionRelation[];
  }>({
    queryKey: ["/api/positionpositions"],
  });

  console.log("Данные о вакансиях:", posDeptR?.data);

  // Автоматически раскрываем все дерево при загрузке данных
  useEffect(() => {
    if (!ld && !lp && deptR && posR) {
      const departments = deptR.data || [];
      const positions = posR.data || [];

      // Создаем объект для всех департаментов, где все изначально раскрыты
      const allDepts = departments.reduce(
        (acc, dept) => {
          if (!dept.deleted) {
            acc[dept.department_id] = true;
          }
          return acc;
        },
        {} as { [k: number]: boolean },
      );

      // Создаем объект для всех позиций, где все изначально раскрыты
      const allPos = positions.reduce(
        (acc, pos) => {
          pos.departments.forEach((dept) => {
            const key = `${pos.position_id}-${dept.department_id}`;
            acc[key] = true;
          });
          return acc;
        },
        {} as { [k: string]: boolean },
      );

      setExpDept(allDepts);
      setExpPos(allPos);
    }
  }, [ld, lp, deptR, posR]);

  if (ld || lp || le) return <div>Загрузка...</div>;

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

  // Функция для переключения состояния всех элементов (развернуть/свернуть все)
  const toggleAll = () => {
    if (allExpanded) {
      // Сворачиваем все
      setExpDept({});
      setExpPos({});
    } else {
      // Разворачиваем все
      const departments = deptR?.data || [];
      const positions = posR?.data || [];

      const allDepts = departments.reduce(
        (acc, dept) => {
          if (!dept.deleted) {
            acc[dept.department_id] = true;
          }
          return acc;
        },
        {} as { [k: number]: boolean },
      );

      const allPos = positions.reduce(
        (acc, pos) => {
          pos.departments.forEach((dept) => {
            const key = `${pos.position_id}-${dept.department_id}`;
            acc[key] = true;
          });
          return acc;
        },
        {} as { [k: string]: boolean },
      );

      setExpDept(allDepts);
      setExpPos(allPos);
    }

    setAllExpanded(!allExpanded);
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
    // Получаем все должности, связанные с указанным отделом
    const linked = positions.filter((p) =>
      p.departments.some((dd) => dd.department_id === deptId),
    );
    
    // Проверяем, что данные о связях между должностями загружены
    if (!posPositionsR?.data) {
      return linked.filter(p => p.parent_position_id === null);
    }
    
    // Получить все связи parent-child для должностей в заданном отделе
    const rels = posPositionsR.data
      .filter(r => !r.deleted)
      .filter(r => {
        // Находим связи, где либо родительская, либо дочерняя позиция связана с этим отделом
        const childInDept = linked.some(p => p.position_id === r.position_id);
        const parentInDept = linked.some(p => p.position_id === r.parent_position_id);
        return childInDept || parentInDept;
      });
    
    // Собираем map всех позиций в отделе
    const map: Record<number, any> = {};
    linked.forEach(p => map[p.position_id] = { ...p, children: [] });
    
    // На основе rels вкладываем детей в родителей
    rels.forEach(r => {
      const parent = map[r.parent_position_id];
      const child = map[r.position_id];
      if (parent && child) {
        // Проверяем, что ребенок еще не добавлен (избегаем дублирования)
        if (!parent.children.some((c: any) => c.position_id === child.position_id)) {
          parent.children.push(child);
        }
      }
    });
    
    // Корни — те, у кого нет родителя в map или родитель не в текущем отделе
    return Object.values(map).filter((p: any) => 
      !rels.some(r => r.position_id === p.position_id && map[r.parent_position_id])
    );
  };

  const getEmps = (posId: number, deptId: number) =>
    employees.filter(
      (e) => e.position_id === posId && e.department_id === deptId,
    );

  // Функция для получения информации о вакансиях для позиции в отделе
  const getPositionDepartmentInfo = (posId: number, deptId: number) => {
    const positionDept = positionDepartments.find(
      (pd) =>
        pd.position_id === posId && pd.department_id === deptId && !pd.deleted,
    );

    // Получаем список сотрудников для этой позиции и отдела
    const emps = getEmps(posId, deptId);

    if (!positionDept) {
      return {
        staffUnits: 0, // Общее количество мест
        vacancies: 0, // Количество свободных мест
        currentCount: emps.length, // Текущее количество сотрудников
      };
    }

    // В БД поле vacancies хранит прямо количество вакансий (не общее количество мест)
    const vacancies = positionDept.vacancies || 0;

    // Текущее количество сотрудников - это фактическое количество сотрудников в этой должности
    const currentCount = emps.length;

    // Общее количество мест - это сумма вакансий и занятых мест
    const staffUnits = vacancies + currentCount;

    console.log(`Позиция ${posId} в отделе ${deptId}:`, {
      staffUnits,
      currentCount,
      vacancies,
      emps: emps.length,
    });

    return {
      staffUnits, // Общее количество мест
      vacancies, // Количество свободных мест
      currentCount, // Текущее количество сотрудников
    };
  };

  // Рендер строки таблицы для должности
  const renderPositionRow = (
    p: any,
    deptId: number,
    lvl = 0,
    parentId?: string,
  ) => {
    const key = `${p.position_id}-${deptId}`;
    const rowId = parentId ? `${parentId}-${key}` : key;
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);

    // Получаем информацию о вакансиях
    const { staffUnits, vacancies, currentCount } = getPositionDepartmentInfo(
      p.position_id,
      deptId,
    );

    // Проверяем развернуто ли это поддерево
    const ex = expPos[key] ?? false;

    const rows = [];

    // Определяем цвет фона в зависимости от наличия вакансий
    let bgClass = "";

    // Отладочная информация
    console.log(
      `Позиция ${p.name} (ID: ${p.position_id}) в отделе ${deptId}:`,
      { staffUnits, currentCount, emps: emps.length },
    );

    if (staffUnits > 0) {
      if (emps.length < staffUnits) {
        // Есть вакансии - красноватый фон
        bgClass = "bg-red-100";
      } else if (emps.length >= staffUnits) {
        // Нет вакансий - зеленоватый фон
        bgClass = "bg-green-100";
      }
    }

    // Добавляем строку для текущей должности
    rows.push(
      <TableRow key={rowId} className={bgClass}>
        <TableCell className="font-medium">
          <div
            className="flex items-center cursor-pointer"
            style={{ paddingLeft: `${lvl * 20}px` }}
            onClick={() => togglePos(key)}
          >
            {(childPositions.length > 0 || childDepts.length > 0) &&
              (ex ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              ))}
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
      </TableRow>,
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
    const rowId = parentId
      ? `${parentId}-dept-${d.department_id}`
      : `dept-${d.department_id}`;
    const childDepts = getChildDeptsByDept(d.department_id);
    const deptPositions = getDeptPositions(d.department_id);

    // Проверяем развернуто ли это поддерево
    const ex = expDept[d.department_id] ?? false;

    const rows = [];

    // Добавляем строку для текущего отдела
    rows.push(
      <TableRow key={rowId}>
        <TableCell className="font-medium" colSpan={4}>
          <div
            className="flex items-center cursor-pointer"
            style={{ paddingLeft: `${lvl * 20}px` }}
            onClick={() => toggleDept(d.department_id)}
          >
            {(deptPositions.length > 0 || childDepts.length > 0) &&
              (ex ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              ))}
            <Building className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">{d.name}</span>
            <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>
          </div>
        </TableCell>
      </TableRow>,
    );

    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      // Добавляем должности отдела
      deptPositions.forEach((position) => {
        rows.push(
          ...renderPositionRow(position, d.department_id, lvl + 1, rowId),
        );
      });

      // Добавляем дочерние отделы
      childDepts.forEach((childDept) => {
        rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
      });
    }

    return rows;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием (как на главной странице) */}
      <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-10 w-10 mr-2"
          >
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
        </div>

        <div className="text-center flex-1 text-2xl font-bold">
          Система управления персоналом
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <Button asChild variant="outline" className="flex items-center">
                <Link href="/">На главную</Link>
              </Button>
              <Button
                onClick={toggleAll}
                variant="outline"
                className="flex items-center"
              >
                {allExpanded ? (
                  <>
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Свернуть все
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Развернуть все
                  </>
                )}
              </Button>
            </div>
            <div>
              <CardTitle>Учет вакансий</CardTitle>
              <CardDescription>
                Анализ штатных единиц и занятых позиций
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[400px]">
                    Структура организации
                  </TableHead>
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
    </div>
  );
}