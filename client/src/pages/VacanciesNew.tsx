import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  ChevronRight,
  ChevronDown,
  Building,
  Users,
  Search,
  X,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Типы данных
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization: boolean;
  logo_path: string | null;
  deleted: boolean;
  deleted_at: string | null;
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

type SearchMatch = {
  departments: Set<number>;
  positions: Set<number>;
};

// Компонент для отображения строки должности
function PositionRow({
  position,
  deptId,
  level = 0,
  expanded,
  onToggle,
  searchActive,
  positionDepartments,
  employees,
  positionRelations,
  positions,
  childDepts,
  getChildDeptsByPosition,
  vacantSort,
  busySort,
  getDeptPositions,
  renderDeptRow,
  renderPosRow
}: {
  position: Position;
  deptId: number;
  level?: number;
  expanded: boolean;
  onToggle: () => void;
  searchActive: boolean;
  positionDepartments: PositionDepartment[];
  employees: Employee[];
  positionRelations: PositionRelation[];
  positions: Position[];
  childDepts: Department[];
  getChildDeptsByPosition: (posId: number) => Department[];
  vacantSort: boolean;
  busySort: boolean;
  getDeptPositions: (deptId: number) => any[];
  renderDeptRow: (dept: Department, level: number) => JSX.Element[];
  renderPosRow: (position: Position, deptId: number, level: number) => JSX.Element[];
}) {
  // Получаем информацию о должности
  const positionDept = positionDepartments?.find(
    (pd) => pd.position_id === position.position_id && pd.department_id === deptId && !pd.deleted
  );
  
  // Получаем список сотрудников
  const emps = employees.filter(
    (e) => e.position_id === position.position_id && e.department_id === deptId
  );
  
  // Базовая статистика для текущей должности
  const currentCount = emps.length;
  const totalCount = positionDept?.vacancies || 0;
  const vacancies = Math.max(0, totalCount - currentCount);
  
  // Определяем статистику в зависимости от развернутости узла
  let displayStats = useMemo(() => {
    // Если узел развернут или не имеет дочерних элементов, показываем только его статистику
    if (expanded || (childDepts.length === 0 && !position.children?.length)) {
      return {
        staffUnits: totalCount,
        currentCount: currentCount,
        vacancies: vacancies
      };
    }
    
    // Для свернутого узла считаем суммарную статистику
    let staffUnits = totalCount;
    let displayCurrentCount = currentCount;
    let displayVacancies = vacancies;
    
    // Добавляем статистику дочерних должностей
    const childPositionIds = positionRelations
      .filter(rel => !rel.deleted && rel.parent_position_id === position.position_id)
      .map(rel => rel.position_id);
    
    childPositionIds.forEach(childId => {
      const childEmps = employees.filter(
        (e) => e.position_id === childId && e.department_id === deptId
      );
      const childPd = positionDepartments?.find(
        (pd) => pd.position_id === childId && pd.department_id === deptId && !pd.deleted
      );
      staffUnits += childPd?.vacancies || 0;
      displayCurrentCount += childEmps.length;
      displayVacancies += Math.max(0, (childPd?.vacancies || 0) - childEmps.length);
    });
    
    // Добавляем статистику дочерних отделов
    childDepts.forEach(dept => {
      const deptPositions = positions.filter(pos => 
        pos.departments.some(d => d.department_id === dept.department_id)
      );
      
      deptPositions.forEach(pos => {
        const posEmps = employees.filter(
          (e) => e.position_id === pos.position_id && e.department_id === dept.department_id
        );
        const posPd = positionDepartments?.find(
          (pd) => pd.position_id === pos.position_id && pd.department_id === dept.department_id && !pd.deleted
        );
        staffUnits += posPd?.vacancies || 0;
        displayCurrentCount += posEmps.length;
        displayVacancies += Math.max(0, (posPd?.vacancies || 0) - posEmps.length);
      });
    });
    
    return {
      staffUnits,
      currentCount: displayCurrentCount,
      vacancies: displayVacancies
    };
  }, [expanded, position, deptId, childDepts, positionDepartments, employees, positionRelations, positions]);
  
  // Определяем цвет фона в зависимости от наличия вакансий
  const bgClass = useMemo(() => {
    let bgClass = "";
    if (displayStats.staffUnits > 0) {
      bgClass = displayStats.currentCount < displayStats.staffUnits ? "bg-red-100" : "bg-green-100";
    }

    if ((displayStats.vacancies === 0 && vacantSort) || (displayStats.vacancies > 0 && busySort)) {
      bgClass += " opacity-30";
    }
    
    return bgClass;
  }, [displayStats, vacantSort, busySort]);
  
  const childPositions = useMemo(() => {
    const childIds = positionRelations
      .filter(rel => !rel.deleted && rel.parent_position_id === position.position_id)
      .map(rel => rel.position_id);
      
    return positions.filter(p => childIds.includes(p.position_id));
  }, [position.position_id, positionRelations, positions]);
  
  const paddingLeftValue = level * 20 + 
    (childPositions.length === 0 && childDepts.length === 0 ? 15 : 0);
  
  return (
    <>
      <TableRow className={bgClass}>
        <TableCell className="font-medium">
          <div
            className="flex items-center cursor-pointer"
            style={{ paddingLeft: `${paddingLeftValue}px` }}
            onClick={onToggle}
          >
            {(childPositions.length > 0 || childDepts.length > 0) && (
              expanded ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              )
            )}
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            <span>{position.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-center">{displayStats.staffUnits}</TableCell>
        <TableCell className="text-center">{displayStats.currentCount}</TableCell>
        <TableCell className="text-center">
          {displayStats.vacancies > 0 ? (
            <span className="text-green-600 font-medium">+{displayStats.vacancies}</span>
          ) : (
            displayStats.vacancies
          )}
        </TableCell>
      </TableRow>
      
      {expanded && (
        <>
          {childPositions.map(childPosition => 
            renderPosRow(childPosition, deptId, level + 1)
          )}
          {childDepts.map(childDept => 
            renderDeptRow(childDept, level + 1)
          )}
        </>
      )}
    </>
  );
}

// Компонент для отображения строки отдела
function DepartmentRow({
  department,
  level = 0,
  expanded,
  onToggle,
  searchActive,
  getChildDeptsByDept,
  getDeptPositions,
  renderPosRow,
  renderDeptRow
}: {
  department: Department;
  level?: number;
  expanded: boolean;
  onToggle: () => void;
  searchActive: boolean;
  getChildDeptsByDept: (deptId: number) => Department[];
  getDeptPositions: (deptId: number) => any[];
  renderPosRow: (position: Position, deptId: number, level: number) => JSX.Element[];
  renderDeptRow: (dept: Department, level: number) => JSX.Element[];
}) {
  const childDepts = getChildDeptsByDept(department.department_id);
  const deptPositions = getDeptPositions(department.department_id);
  
  const paddingLeftValue = level * 20;
  
  return (
    <>
      <TableRow>
        <TableCell className="font-medium" colSpan={4}>
          <div
            className="flex items-center cursor-pointer"
            style={{ paddingLeft: `${paddingLeftValue}px` }}
            onClick={onToggle}
          >
            {(deptPositions.length > 0 || childDepts.length > 0) && (
              expanded ? (
                <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
              )
            )}
            <Building className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">{department.name}</span>
            <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>
          </div>
        </TableCell>
      </TableRow>
      
      {expanded && (
        <>
          {deptPositions.map(position => 
            renderPosRow(position, department.department_id, level + 1)
          )}
          {childDepts.map(childDept => 
            renderDeptRow(childDept, level + 1)
          )}
        </>
      )}
    </>
  );
}

export default function VacanciesNew() {
  // State для UI
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch>({
    departments: new Set<number>(),
    positions: new Set<number>(),
  });

  // State для фильтрации и страницы
  const [vacantSort, setVacantSort] = useState(false);
  const [busySort, setBusySort] = useState(false);
  const [, routeParams] = useRoute("/vacancies/:id");
  const [stateOrgId, setStateOrgId] = useState<number | null>(null);
  const [stateOrgName, setStateOrgName] = useState<string | null>(null);

  // Запросы к API
  const { data: deptData, isLoading: ldDept } = useQuery<{
    data: Department[];
  }>({
    queryKey: ["/api/departments"],
  });

  const { data: posData, isLoading: ldPos } = useQuery<{ data: Position[] }>({
    queryKey: ["/api/positions/with-departments"],
  });

  const { data: empData, isLoading: ldEmp } = useQuery<{ data: Employee[] }>({
    queryKey: ["/api/employees"],
  });

  const { data: pdData, isLoading: ldPd } = useQuery<{ data: PositionDepartment[] }>({
    queryKey: ["/api/pd"],
  });

  const { data: prData, isLoading: ldPr } = useQuery<{ data: PositionRelation[] }>({
    queryKey: ["/api/positionpositions"],
  });

  // Подготовка данных
  const departments = deptData?.data || [];
  const positions = posData?.data || [];
  const employees = empData?.data || [];
  const positionDepartments = pdData?.data || [];
  const positionRelations = prData?.data || [];

  // UI обработчики
  const clearSearch = () => setSearchTerm("");

  const toggleDept = useCallback((id: number) => {
    setExpDept((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const togglePos = useCallback((key: string) => {
    setExpPos((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  
  // Функция для проверки соответствия поиску
  const isMatch = useCallback(
    (text: string, searchTermLower: string): boolean => {
      if (!text || !searchTermLower) return false;

      try {
        // Дебаг логирование для поиска проблемы
        console.log(`Сравниваем: "${text}" с "${searchTermLower}"`);

        // Нормализуем строки для более точного поиска
        const normalizedText = text
          .toLowerCase()
          .normalize("NFD") // Нормализация символов
          .replace(/[\u0300-\u036f]/g, "") // Удаляем диакритические знаки
          .replace(/ё/g, "е") // Замена ё на е
          .trim();

        const normalizedSearchTerm = searchTermLower
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ё/g, "е")
          .trim();

        console.log(
          `После нормализации: "${normalizedText}" с "${normalizedSearchTerm}"`,
        );

        // Проверка на полное вхождение в строку
        if (normalizedText.includes(normalizedSearchTerm)) {
          console.log(
            `Полное совпадение: ${normalizedText} содержит ${normalizedSearchTerm}`,
          );
          return true;
        }

        // Если поисковый запрос короткий (1-3 символа), ищем вхождение в начале слов
        if (normalizedSearchTerm.length <= 3) {
          // Разбиваем текст на слова
          const words = normalizedText.split(/\s+/);

          // Проверяем начало каждого слова
          for (const word of words) {
            if (word.startsWith(normalizedSearchTerm)) {
              console.log(`Слово ${word} начинается с ${normalizedSearchTerm}`);
              return true;
            }
          }
        }

        // Проверяем, является ли поисковый запрос первыми буквами слов (для аббревиатур)
        if (
          normalizedSearchTerm.length >= 2 &&
          normalizedSearchTerm.length <= 5
        ) {
          const words = normalizedText.split(/\s+/);
          if (words.length >= 2) {
            const acronym = words.map((w) => w.charAt(0)).join("");
            if (acronym.includes(normalizedSearchTerm)) {
              console.log(
                `Аббревиатура ${acronym} содержит ${normalizedSearchTerm}`,
              );
              return true;
            }
          }
        }

        // Проверка регулярным выражением с учетом кириллицы
        try {
          const regExp = new RegExp(
            normalizedSearchTerm.split("").join("\\s*"),
            "i",
          );
          const result = regExp.test(normalizedText);
          if (result) {
            console.log(`RegExp совпадение: ${regExp} в ${normalizedText}`);
            return true;
          }
        } catch (e) {
          console.error("Ошибка в регулярном выражении:", e);
        }

        return false;
      } catch (error) {
        console.error("Ошибка в функции поиска:", error);
        // В случае ошибки возвращаем простое сравнение
        return text.toLowerCase().includes(searchTermLower);
      }
    },
    [],
  );
  
  // Вспомогательные функции для получения данных
  const getChildDeptsByDept = useCallback((deptId: number): Department[] => 
    departments.filter(
      (d) =>
        !d.deleted &&
        d.parent_department_id === deptId &&
        (!searchTerm.trim() || searchMatches.departments.has(d.department_id)),
    ), [departments, searchTerm, searchMatches.departments]);

  const getChildDeptsByPosition = useCallback((posId: number): Department[] => 
    departments.filter(
      (d) =>
        !d.deleted &&
        d.parent_position_id === posId &&
        (!searchTerm.trim() || searchMatches.departments.has(d.department_id)),
    ), [departments, searchTerm, searchMatches.departments]);

  const getDeptPositions = useCallback((deptId: number) => {
    // Находим должности в отделе
    const linked = positions.filter(
      (p) =>
        p.departments.some((dd) => dd.department_id === deptId) &&
        (!searchTerm.trim() || searchMatches.positions.has(p.position_id)),
    );

    if (positionRelations.length === 0) {
      return linked.filter((p) => p.parent_position_id === null);
    }

    // Отношения между должностями
    const rels = positionRelations
      .filter((r) => !r.deleted)
      .filter((r) => {
        const childInDept = linked.some((p) => p.position_id === r.position_id);
        const parentInDept = linked.some(
          (p) => p.position_id === r.parent_position_id,
        );
        return childInDept || parentInDept;
      });

    // Строим дерево
    const map: Record<number, any> = {};
    linked.forEach((p) => (map[p.position_id] = { ...p, children: [] }));

    rels.forEach((r) => {
      const parent = map[r.parent_position_id];
      const child = map[r.position_id];
      if (parent && child) {
        if (
          !parent.children.some((c: any) => c.position_id === child.position_id)
        ) {
          parent.children.push(child);
        }
      }
    });

    // Возвращаем корневые должности
    return Object.values(map).filter(
      (p: any) =>
        !rels.some(
          (r) => r.position_id === p.position_id && map[r.parent_position_id],
        ),
    );
  }, [positions, positionRelations, searchTerm, searchMatches.positions]);

  // Поиск
  useEffect(() => {
    if (!departments.length || !positions.length) return;

    if (!searchTerm.trim()) {
      setSearchMatches({
        departments: new Set<number>(),
        positions: new Set<number>(),
      });
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchedDepts = new Set<number>();
    const matchedPositions = new Set<number>();

    // Поиск по отделам
    departments.forEach((dept) => {
      if (!dept.deleted && isMatch(dept.name, searchTermLower)) {
        matchedDepts.add(dept.department_id);

        // Добавляем родителей отдела
        let currentDept = dept;
        while (currentDept.parent_department_id) {
          matchedDepts.add(currentDept.parent_department_id);
          const parentDept = departments.find(
            (d) => d.department_id === currentDept.parent_department_id,
          );
          if (!parentDept) break;
          currentDept = parentDept;
        }

        if (dept.parent_position_id) {
          matchedPositions.add(dept.parent_position_id);
        }
      }
    });

    // Поиск по должностям
    positions.forEach((pos) => {
      if (isMatch(pos.name, searchTermLower)) {
        matchedPositions.add(pos.position_id);

        // Добавляем связанные отделы
        pos.departments.forEach((deptLink) => {
          const dept = departments.find(
            (d) => d.department_id === deptLink.department_id,
          );
          if (dept && !dept.deleted) {
            matchedDepts.add(dept.department_id);

            // Добавляем родителей отдела
            let currentDept = dept;
            while (currentDept.parent_department_id) {
              matchedDepts.add(currentDept.parent_department_id);
              const parentDept = departments.find(
                (d) => d.department_id === currentDept.parent_department_id,
              );
              if (!parentDept) break;
              currentDept = parentDept;
            }
          }
        });

        // Добавляем дочерние должности
        const findChildPositions = (parentId: number) => {
          const children = positionRelations.filter(
            (rel) => !rel.deleted && rel.parent_position_id === parentId,
          );

          children.forEach((child) => {
            matchedPositions.add(child.position_id);
            findChildPositions(child.position_id);
          });
        };

        findChildPositions(pos.position_id);
      }
    });

    setSearchMatches({
      departments: matchedDepts,
      positions: matchedPositions,
    });
  }, [searchTerm, departments, positions, positionRelations, isMatch]);

  // Эффект для раскрытия элементов при поиске
  useEffect(() => {
    if (
      !searchTerm.trim() ||
      (!searchMatches.departments.size && !searchMatches.positions.size)
    )
      return;

    // Раскрываем найденные отделы
    const newExpDept = { ...expDept };
    searchMatches.departments.forEach((deptId) => {
      newExpDept[deptId] = true;
    });

    // Раскрываем найденные должности
    const newExpPos = { ...expPos };
    searchMatches.positions.forEach((posId) => {
      positions.forEach((pos) => {
        if (pos.position_id === posId) {
          pos.departments.forEach((dept) => {
            const key = `${posId}-${dept.department_id}`;
            newExpPos[key] = true;
          });
        }
      });
    });

    setExpDept(newExpDept);
    setExpPos(newExpPos);
  }, [searchMatches, positions]);

  // Эффект для начального раскрытия дерева
  useEffect(() => {
    if (deptData?.data && posData?.data) {
      const departments = deptData.data;
      const positions = posData.data;

      // Найдем организацию ООО "Цифролаб"
      const cifroOrg = departments.find(
        (d) => !d.deleted && d.name.includes("Цифролаб") && d.is_organization,
      );

      const allDepts = departments.reduce(
        (acc, dept) => {
          if (!dept.deleted) {
            // Если это Цифролаб или его дочерний отдел, автоматически раскрываем
            const isCifroDept =
              cifroOrg &&
              (dept.department_id === cifroOrg.department_id ||
                dept.parent_department_id === cifroOrg.department_id);

            acc[dept.department_id] = isCifroDept || false;
          }
          return acc;
        },
        {} as { [k: number]: boolean },
      );

      const allPos = positions.reduce(
        (acc, pos) => {
          pos.departments.forEach((dept) => {
            const key = `${pos.position_id}-${dept.department_id}`;
            // Если эта должность принадлежит отделу Цифролаб, автоматически раскрываем
            const isCifroPos =
              cifroOrg && dept.department_id === cifroOrg.department_id;
            acc[key] = isCifroPos || false;
          });
          return acc;
        },
        {} as { [k: string]: boolean },
      );

      setExpDept(allDepts);
      setExpPos(allPos);
    }
  }, [deptData, posData]);

  // Функция для переключения сворачивания всех узлов
  const toggleAll = () => {
    if (allExpanded) {
      setExpDept({});
      setExpPos({});
    } else if (departments.length && positions.length) {
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
  
  // Функция проверки соответствия поиску
  const shouldShowInSearch = useCallback(
    (itemType: "department" | "position", id: number): boolean => {
      if (!searchTerm.trim()) return true;

      if (itemType === "department") {
        return searchMatches.departments.has(id);
      } else {
        return searchMatches.positions.has(id);
      }
    },
    [searchTerm, searchMatches]
  );
  
  // Рекурсивные функции рендеринга строк с использованием React.memo
  const renderPositionRow = useCallback((position: Position, deptId: number, level: number = 0): JSX.Element[] => {
    if (searchTerm.trim() && !shouldShowInSearch("position", position.position_id)) {
      return [];
    }
    
    const key = `${position.position_id}-${deptId}`;
    const expanded = expPos[key] || level < 2;
    const childDepts = getChildDeptsByPosition(position.position_id);
    
    return [
      <PositionRow
        key={key}
        position={position}
        deptId={deptId}
        level={level}
        expanded={expanded}
        onToggle={() => togglePos(key)}
        searchActive={!!searchTerm.trim()}
        positionDepartments={positionDepartments}
        employees={employees}
        positionRelations={positionRelations}
        positions={positions}
        childDepts={childDepts}
        getChildDeptsByPosition={getChildDeptsByPosition}
        vacantSort={vacantSort}
        busySort={busySort}
        getDeptPositions={getDeptPositions}
        renderDeptRow={renderDepartmentRow}
        renderPosRow={renderPositionRow}
      />
    ];
  }, [
    searchTerm, 
    shouldShowInSearch, 
    expPos, 
    positionDepartments, 
    employees, 
    positionRelations, 
    positions, 
    vacantSort, 
    busySort, 
    getChildDeptsByPosition, 
    getDeptPositions, 
    togglePos
  ]);
  
  const renderDepartmentRow = useCallback((department: Department, level: number = 0): JSX.Element[] => {
    if (searchTerm.trim() && !shouldShowInSearch("department", department.department_id)) {
      return [];
    }
    
    const expanded = expDept[department.department_id] || level < 2;
    
    return [
      <DepartmentRow
        key={`dept-${department.department_id}`}
        department={department}
        level={level}
        expanded={expanded}
        onToggle={() => toggleDept(department.department_id)}
        searchActive={!!searchTerm.trim()}
        getChildDeptsByDept={getChildDeptsByDept}
        getDeptPositions={getDeptPositions}
        renderPosRow={renderPositionRow}
        renderDeptRow={renderDepartmentRow}
      />
    ];
  }, [
    searchTerm, 
    shouldShowInSearch, 
    expDept, 
    getChildDeptsByDept, 
    getDeptPositions, 
    toggleDept
  ]);
  
  // Корневые отделы для построения дерева
  const rootDepartments = useMemo(() => 
    departments
      .filter((d) => !d.deleted && !d.parent_department_id && !d.parent_position_id)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  );

  // Подготовка данных по заданному ID организации в URL
  useEffect(() => {
    if (routeParams && routeParams.id && departments.length > 0) {
      const orgId = parseInt(routeParams.id);
      const org = departments.find(
        (d) =>
          d.department_id === orgId &&
          !d.deleted &&
          (d.is_organization || !d.parent_department_id),
      );

      if (org) {
        setStateOrgId(orgId);
        setStateOrgName(org.name);
        // Автоматически раскрываем выбранную организацию
        setExpDept((prev) => ({ ...prev, [orgId]: true }));
      }
    }
  }, [routeParams, departments]);

  // Если данные загружаются, показываем индикатор загрузки
  if (ldDept || ldPos || ldEmp || ldPd || ldPr) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {stateOrgName ? `Вакансии - ${stateOrgName}` : "Вакансии"}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={toggleAll}>
            {allExpanded ? "Свернуть все" : "Развернуть все"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex-grow">
              <CardTitle>Штатное расписание</CardTitle>
              <CardDescription>
                Просмотр существующих должностей и вакансий
              </CardDescription>
            </div>
            <div className="relative w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по отделам и должностям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-2.5"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4 space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Checkbox
                    id="vacant"
                    checked={vacantSort}
                    onCheckedChange={(checked) => {
                      setVacantSort(!!checked);
                      setBusySort(false);
                    }}
                    className="mr-2"
                  />
                  <label
                    htmlFor="vacant"
                    className="text-sm cursor-pointer select-none"
                  >
                    Только с вакансиями
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Нажатием на <br></br>"Занято" или "Вакантно" <br></br>
                  можно сортировать таблицу
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Checkbox
                    id="busy"
                    checked={busySort}
                    onCheckedChange={(checked) => {
                      setBusySort(!!checked);
                      setVacantSort(false);
                    }}
                    className="mr-2"
                  />
                  <label
                    htmlFor="busy"
                    className="text-sm cursor-pointer select-none"
                  >
                    Только заполненные
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Нажатием на <br></br>"Занято" или "Вакантно" <br></br>
                  можно сортировать таблицу
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Должность / Отдел</TableHead>
                <TableHead className="text-center">Всего</TableHead>
                <TableHead
                  className="text-center cursor-pointer"
                  onClick={() => {
                    setBusySort(!busySort);
                    setVacantSort(false);
                  }}
                >
                  Занято
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer"
                  onClick={() => {
                    setVacantSort(!vacantSort);
                    setBusySort(false);
                  }}
                >
                  Вакантно
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stateOrgId ? (
                // Показываем данные только для выбранной организации
                renderDepartmentRow(departments.find(d => d.department_id === stateOrgId)!, 0)
              ) : (
                // Показываем все корневые отделы
                rootDepartments.map(dept => renderDepartmentRow(dept, 0))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}