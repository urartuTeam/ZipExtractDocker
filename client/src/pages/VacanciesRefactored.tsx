import React, { useState, useEffect, useCallback } from "react";
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

// Интерфейс для данных
interface VacanciesData {
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  positionDepartments: PositionDepartment[];
  positionRelations: PositionRelation[];
  isLoading: boolean;
}

// Компонент для загрузки данных
function DataLoader({ children }: { children: (data: VacanciesData) => React.ReactNode }) {
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

  const { data: pdData } = useQuery<{ data: PositionDepartment[] }>({
    queryKey: ["/api/pd"],
  });

  const { data: prData } = useQuery<{ data: PositionRelation[] }>({
    queryKey: ["/api/positionpositions"],
  });

  // Перечисляем все имеющиеся данные
  const departments = deptData?.data || [];
  const positions = posData?.data || [];
  const employees = empData?.data || [];
  const positionDepartments = pdData?.data || [];
  const positionRelations = prData?.data || [];
  const isLoading = ldDept || ldPos || ldEmp;

  return <>{children({
    departments,
    positions,
    employees,
    positionDepartments,
    positionRelations,
    isLoading
  })}</>;
}

// Компонент для управления поиском
function SearchManager({ 
  vacanciesData,
  onSearchResults
}: { 
  vacanciesData: VacanciesData,
  onSearchResults: (matches: SearchMatch) => void
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { departments, positions, positionRelations } = vacanciesData;
  
  // Функция для проверки соответствия текста поисковому запросу
  const isMatch = useCallback(
    (text: string, searchTermLower: string): boolean => {
      if (!text || !searchTermLower) return false;

      try {
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

        // Проверка на полное вхождение в строку
        if (normalizedText.includes(normalizedSearchTerm)) {
          return true;
        }

        // Если поисковый запрос короткий (1-3 символа), ищем вхождение в начале слов
        if (normalizedSearchTerm.length <= 3) {
          // Разбиваем текст на слова
          const words = normalizedText.split(/\s+/);

          // Проверяем начало каждого слова
          for (const word of words) {
            if (word.startsWith(normalizedSearchTerm)) {
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

  // Эффект для поиска
  useEffect(() => {
    if (!departments.length || !positions.length) return;

    // Даже если поисковый запрос пустой, мы все равно обрабатываем его,
    // чтобы сбросить состояние
    if (!searchTerm.trim()) {
      onSearchResults({
        departments: new Set<number>(),
        positions: new Set<number>(),
      });
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchedDepts = new Set<number>();
    const matchedPositions = new Set<number>();

    // Поиск в отделах
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

    // Поиск в должностях
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

    onSearchResults({
      departments: matchedDepts,
      positions: matchedPositions,
    });
  }, [searchTerm, departments, positions, positionRelations, isMatch, onSearchResults]);

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Поиск по наименованию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-2 top-2.5"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

// Компонент для отображения отделов и должностей
function OrganizationViewer({
  vacanciesData,
  searchMatches,
}: {
  vacanciesData: VacanciesData;
  searchMatches: SearchMatch;
}) {
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [stateOrgId, setStateOrgId] = useState<number | null>(null);
  const [stateOrgName, setStateOrgName] = useState<string | null>(null);
  const [, routeParams] = useRoute("/vacancies/:id");
  
  const { departments, positions, employees, positionDepartments, positionRelations } = vacanciesData;

  // Функция для проверки соответствия поиску
  const shouldShowInSearch = (
    itemType: "department" | "position",
    id: number,
  ): boolean => {
    if (!searchMatches.departments.size && !searchMatches.positions.size) return true;

    if (itemType === "department") {
      return searchMatches.departments.has(id);
    } else {
      return searchMatches.positions.has(id);
    }
  };

  // Обработчики событий UI
  const toggleDept = useCallback((id: number) => {
    setExpDept((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const togglePos = useCallback((key: string) => {
    setExpPos((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Эффект для начального раскрытия дерева
  useEffect(() => {
    if (!departments.length || !positions.length) return;
    
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
  }, [departments, positions]);

  // При монтировании компонента проверяем localStorage
  useEffect(() => {
    const savedIdInStorage = typeof window !== "undefined" ? localStorage.getItem("selectedOrganizationId") : null;
    const savedNameInStorage = typeof window !== "undefined" ? localStorage.getItem("selectedOrganizationName") : null;
    
    if (typeof window !== "undefined") {
      if (savedIdInStorage) {
        setStateOrgId(Number(savedIdInStorage));
        localStorage.removeItem("selectedOrganizationId");
      }

      if (savedNameInStorage) {
        setStateOrgName(savedNameInStorage);
        localStorage.removeItem("selectedOrganizationName");
      }
    }
  }, []);

  // Эффект для раскрытия элементов при поиске
  useEffect(() => {
    if (!searchMatches.departments.size && !searchMatches.positions.size) return;

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
  }, [searchMatches, positions, expDept, expPos]);

  // Вычисляем глубину отдела
  const getDepthForDepartment = useCallback((dept: Department, depts: Department[]): number => {
    if (!dept.parent_department_id) return 0;

    const parent = depts.find(
      (d) => d.department_id === dept.parent_department_id,
    );
    if (!parent) return 1; // Если родитель не найден, считаем глубину 1

    return getDepthForDepartment(parent, depts) + 1;
  }, []);

  // Эффект для авто-раскрытия первых двух уровней дерева при загрузке данных
  useEffect(() => {
    // Выполняем только если есть данные и дерево ещё не было развернуто
    if (!departments.length || !positions.length || Object.keys(expDept).length > 0) {
      return;
    }
    
    // Определяем отделы с глубиной не более 2 (0, 1, 2)
    const deptsToExpand = departments.filter((d) => {
      if (d.deleted) return false;

      const depth = getDepthForDepartment(d, departments);
      return depth <= 2;
    });

    // Создаем объект для экспандированных отделов
    const newExpDept = deptsToExpand.reduce(
      (acc, dept) => {
        acc[dept.department_id] = true;
        return acc;
      },
      {} as { [k: number]: boolean },
    );

    setExpDept(newExpDept);
  }, [departments, positions, expDept, getDepthForDepartment]);

  // Вспомогательные функции для получения данных
  const getChildDeptsByDept = (deptId: number) =>
    departments.filter(
      (d) =>
        !d.deleted &&
        d.parent_department_id === deptId &&
        shouldShowInSearch("department", d.department_id),
    );

  const getChildDeptsByPosition = (posId: number) =>
    departments.filter(
      (d) =>
        !d.deleted &&
        d.parent_position_id === posId &&
        shouldShowInSearch("department", d.department_id),
    );

  const getDeptPositions = (deptId: number) => {
    // Находим должности в отделе
    const linked = positions.filter(
      (p) =>
        p.departments.some((dd) => dd.department_id === deptId) &&
        shouldShowInSearch("position", p.position_id),
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
  };

  const getEmps = (posId: number, deptId: number) =>
    employees.filter(
      (e) => e.position_id === posId && e.department_id === deptId,
    );

  // Функция для получения информации о вакансиях
  const getPositionDepartmentInfo = (posId: number, deptId: number) => {
    const positionDept = positionDepartments?.find(
      (pd) =>
        pd.position_id === posId && pd.department_id === deptId && !pd.deleted,
    );

    const emps = getEmps(posId, deptId);

    if (!positionDept) {
      return {
        staffUnits: 0,
        vacancies: 0,
        currentCount: emps.length,
      };
    }

    // Базовая логика подсчета вакансий
    return {
      staffUnits: positionDept.staff_units,
      vacancies: Math.max(0, positionDept.staff_units - emps.length),
      currentCount: emps.length,
    };
  };

  // Функция для переключения сворачивания/разворачивания всех узлов
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

  // Рендер строки с должностью
  const renderPositionRow = (position: Position, departmentId: number = 0, lvl = 0, parentId?: string) => {
    const rowId = parentId
      ? `${parentId}_pos_${position.position_id}_${departmentId}`
      : `pos_${position.position_id}_${departmentId}`;

    const rows: React.ReactNode[] = [];
    const posKey = `${position.position_id}-${departmentId}`;
    const ex = expPos[posKey];

    // Получаем всех сотрудников в этой должности
    const emps = getEmps(position.position_id, departmentId);

    // Получаем дочерние отделы, которые подчиняются этой должности
    const childDepts = getChildDeptsByPosition(position.position_id);

    // Получаем информацию о вакансиях
    const { staffUnits, vacancies, currentCount } = getPositionDepartmentInfo(
      position.position_id,
      departmentId,
    );

    rows.push(
      <TableRow key={rowId} className="group">
        <TableCell className="p-2">
          <div className="flex items-center">
            <div
              style={{ width: lvl * 24 }}
              className="flex-shrink-0 inline-block"
            ></div>
            <div
              className="cursor-pointer flex items-center"
              onClick={() => togglePos(posKey)}
            >
              {(emps.length > 0 || childDepts.length > 0) && (
                ex ? (
                  <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
                )
              )}
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium">{position.name}</span>
              <span className="ml-2 text-neutral-500 text-sm">
                (Должность)
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell className="p-2 text-right">
          <div className="flex justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`px-2 py-1 rounded-md text-xs ${
                    vacancies > 0
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {staffUnits} шт.ед.
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Штатная численность: {staffUnits}</p>
                <p>Занято должностей: {currentCount}</p>
                <p>Вакантные места: {vacancies}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`px-2 py-1 rounded-md text-xs ${
                    vacancies > 0
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {vacancies} вак.
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Вакантные места: {vacancies}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>,
    );

    // Если должность раскрыта, добавляем сотрудников и дочерние отделы
    if (ex) {
      // Добавляем сотрудников
      emps.forEach((emp, idx) => {
        rows.push(
          <TableRow key={`${rowId}_emp_${idx}`} className="bg-gray-50">
            <TableCell className="p-2">
              <div className="flex items-center">
                <div
                  style={{ width: (lvl + 1) * 24 }}
                  className="flex-shrink-0 inline-block"
                ></div>
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600">
                    {emp.full_name}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="p-2"></TableCell>
          </TableRow>,
        );
      });

      // Добавляем дочерние отделы
      childDepts.forEach((childDept) => {
        rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
      });
    }

    return rows;
  };

  // Рендер строки с отделом
  const renderDepartmentRow = (d: Department, lvl = 0, parentId?: string) => {
    const rowId = parentId
      ? `${parentId}_dept_${d.department_id}`
      : `dept_${d.department_id}`;
    const rows: React.ReactNode[] = [];
    const ex = expDept[d.department_id];

    // Получаем должности, которые есть в этом отделе
    const deptPositions = getDeptPositions(d.department_id);

    // Получаем дочерние отделы
    const childDepts = getChildDeptsByDept(d.department_id);

    rows.push(
      <TableRow key={rowId} className="group">
        <TableCell className="p-2">
          <div
            className="cursor-pointer flex items-center"
            onClick={() => toggleDept(d.department_id)}
          >
            <div
              style={{ width: lvl * 24 }}
              className="flex-shrink-0 inline-block"
            ></div>
            {(deptPositions.length > 0 || childDepts.length > 0) && (
              ex ? (
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
      deptPositions.forEach((position) => {
        if (position) {
          // Проверяем, что position существует
          rows.push(
            ...renderPositionRow(position, d.department_id, lvl + 1, rowId),
          );
        }
      });

      childDepts.forEach((childDept) => {
        if (childDept) {
          // Проверяем, что childDept существует
          rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
        }
      });
    }

    return rows;
  };

  const renderFromRoute = () => {
    const department = departments.filter(
      (d) =>
        !d.deleted &&
        d.department_id === Number(routeParams?.id) &&
        shouldShowInSearch("department", d.department_id),
    );

    const position = positions.filter(
      (p) =>
        p.position_id === Number(routeParams?.id) &&
        shouldShowInSearch("position", p.position_id),
    );

    if (department.length > 0) {
      return renderDepartmentRow(department[0], 0);
    } else if (position.length > 0) {
      return renderPositionRow(position[0], 0);
    }
    return [];
  };

  // Если есть ID организации в state, используем его
  // Иначе ищем Цифролаб как дефолтную организацию
  let targetDepartment = stateOrgId
    ? departments.find((d) => !d.deleted && d.department_id === stateOrgId)
    : departments.find(
        (d) => !d.deleted && d.name.includes("Цифролаб") && d.is_organization,
      );

  const targetDepartmentId = targetDepartment?.department_id;

  // Определяем, показывать только выбранную организацию или все организации
  const showOnlyTarget = Boolean(targetDepartmentId);

  // Фильтруем корневые отделы в соответствии с поисковым запросом
  const roots = departments.filter(
    (d) =>
      !d.deleted &&
      d.is_organization &&
      (!showOnlyTarget || d.department_id === targetDepartmentId) &&
      shouldShowInSearch("department", d.department_id),
  );

  if (routeParams?.id) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {stateOrgName || "Структура организации"}
          </h1>
          <div>
            <Button variant="outline" onClick={toggleAll}>
              {allExpanded ? "Свернуть все" : "Развернуть все"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableBody>{renderFromRoute()}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {stateOrgName || "Структура организации"}
        </h1>
        <div>
          <Button variant="outline" onClick={toggleAll}>
            {allExpanded ? "Свернуть все" : "Развернуть все"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">
                  Подразделение / Должность
                </TableHead>
                <TableHead className="text-right">Вакансии</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roots.map((d) => renderDepartmentRow(d))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Главный компонент
export default function VacanciesRefactored() {
  const [searchMatches, setSearchMatches] = useState<SearchMatch>({
    departments: new Set<number>(),
    positions: new Set<number>(),
  });

  return (
    <DataLoader>
      {(vacanciesData) => {
        if (vacanciesData.isLoading) {
          return <div>Загрузка...</div>;
        }

        return (
          <div className="container mx-auto py-6">
            <SearchManager 
              vacanciesData={vacanciesData}
              onSearchResults={setSearchMatches}
            />
            <OrganizationViewer
              vacanciesData={vacanciesData}
              searchMatches={searchMatches}
            />
          </div>
        );
      }}
    </DataLoader>
  );
}