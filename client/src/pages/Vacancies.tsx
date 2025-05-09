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
import { ChevronRight, ChevronDown, Building, Users, Search, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

export default function Vacancies() {
  // State
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch>({
    departments: new Set<number>(),
    positions: new Set<number>()
  });

  const [vacantSort, setVacantSort] = useState(false);
  const [busySort, setBusySort] = useState(false);
  const [, routeParams] = useRoute('/vacancies/:id');

  // Запросы к API
  const { data: deptData, isLoading: ldDept } = useQuery<{ data: Department[] }>({
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

  // Обработчики событий UI
  const clearSearch = () => setSearchTerm("");

  const toggleDept = useCallback((id: number) => {
    setExpDept(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const togglePos = useCallback((key: string) => {
    setExpPos(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Функция для проверки соответствия текста поисковому запросу
  const isMatch = useCallback((text: string, searchTermLower: string): boolean => {
    if (!text || !searchTermLower) return false;

    try {
      // Дебаг логирование для поиска проблемы
      console.log(`Сравниваем: "${text}" с "${searchTermLower}"`);

      // Нормализуем строки для более точного поиска
      const normalizedText = text.toLowerCase()
          .normalize('NFD') // Нормализация символов
          .replace(/[\u0300-\u036f]/g, '') // Удаляем диакритические знаки
          .replace(/ё/g, 'е') // Замена ё на е
          .trim();

      const normalizedSearchTerm = searchTermLower
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/ё/g, 'е')
          .trim();

      console.log(`После нормализации: "${normalizedText}" с "${normalizedSearchTerm}"`);

      // Проверка на полное вхождение в строку
      if (normalizedText.includes(normalizedSearchTerm)) {
        console.log(`Полное совпадение: ${normalizedText} содержит ${normalizedSearchTerm}`);
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
      if (normalizedSearchTerm.length >= 2 && normalizedSearchTerm.length <= 5) {
        const words = normalizedText.split(/\s+/);
        if (words.length >= 2) {
          const acronym = words.map(w => w.charAt(0)).join('');
          if (acronym.includes(normalizedSearchTerm)) {
            console.log(`Аббревиатура ${acronym} содержит ${normalizedSearchTerm}`);
            return true;
          }
        }
      }

      // Проверка регулярным выражением с учетом кириллицы
      try {
        const regExp = new RegExp(normalizedSearchTerm.split('').join('\\s*'), 'i');
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
  }, []);

  // Эффект для начального раскрытия дерева
  useEffect(() => {
    if (deptData?.data && posData?.data) {
      const departments = deptData.data;
      const positions = posData.data;

      // Найдем организацию ООО "Цифролаб"
      const cifroOrg = departments.find(d => 
        !d.deleted && d.name.includes("Цифролаб") && d.is_organization
      );

      const allDepts = departments.reduce(
          (acc, dept) => {
            if (!dept.deleted) {
              // Если это Цифролаб или его дочерний отдел, автоматически раскрываем
              const isCifroDept = cifroOrg && (
                dept.department_id === cifroOrg.department_id || 
                dept.parent_department_id === cifroOrg.department_id
              );
              
              acc[dept.department_id] = isCifroDept || false;
            }
            return acc;
          },
          {} as { [k: number]: boolean }
      );

      const allPos = positions.reduce(
          (acc, pos) => {
            pos.departments.forEach(dept => {
              const key = `${pos.position_id}-${dept.department_id}`;
              // Если эта должность принадлежит отделу Цифролаб, автоматически раскрываем
              const isCifroPos = cifroOrg && (
                dept.department_id === cifroOrg.department_id
              );
              acc[key] = isCifroPos || false;
            });
            return acc;
          },
          {} as { [k: string]: boolean }
      );

      setExpDept(allDepts);
      setExpPos(allPos);
    }
  }, [deptData, posData]);

  // Эффект для поиска
  useEffect(() => {
    if (!departments.length || !positions.length) return;

    // Даже если поисковый запрос пустой, мы все равно обрабатываем его,
    // чтобы сбросить состояние
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

    // Поиск в отделах
    departments.forEach(dept => {
      if (!dept.deleted && isMatch(dept.name, searchTermLower)) {
        matchedDepts.add(dept.department_id);

        // Добавляем родителей отдела
        let currentDept = dept;
        while (currentDept.parent_department_id) {
          matchedDepts.add(currentDept.parent_department_id);
          const parentDept = departments.find(d => d.department_id === currentDept.parent_department_id);
          if (!parentDept) break;
          currentDept = parentDept;
        }

        if (dept.parent_position_id) {
          matchedPositions.add(dept.parent_position_id);
        }
      }
    });

    // Поиск в должностях
    positions.forEach(pos => {
      if (isMatch(pos.name, searchTermLower)) {
        matchedPositions.add(pos.position_id);

        // Добавляем связанные отделы
        pos.departments.forEach(deptLink => {
          const dept = departments.find(d => d.department_id === deptLink.department_id);
          if (dept && !dept.deleted) {
            matchedDepts.add(dept.department_id);

            // Добавляем родителей отдела
            let currentDept = dept;
            while (currentDept.parent_department_id) {
              matchedDepts.add(currentDept.parent_department_id);
              const parentDept = departments.find(d => d.department_id === currentDept.parent_department_id);
              if (!parentDept) break;
              currentDept = parentDept;
            }
          }
        });

        // Добавляем дочерние должности
        const findChildPositions = (parentId: number) => {
          const children = positionRelations.filter(rel =>
              !rel.deleted && rel.parent_position_id === parentId
          );

          children.forEach(child => {
            matchedPositions.add(child.position_id);
            findChildPositions(child.position_id);
          });
        };

        findChildPositions(pos.position_id);
      }
    });

    setSearchMatches({
      departments: matchedDepts,
      positions: matchedPositions
    });
  }, [searchTerm, departments, positions, positionRelations, isMatch]);

  // Эффект для раскрытия элементов при поиске
  useEffect(() => {
    if (!searchTerm.trim() || !searchMatches.departments.size && !searchMatches.positions.size) return;

    // Раскрываем найденные отделы
    const newExpDept = { ...expDept };
    searchMatches.departments.forEach(deptId => {
      newExpDept[deptId] = true;
    });

    // Раскрываем найденные должности
    const newExpPos = { ...expPos };
    searchMatches.positions.forEach(posId => {
      positions.forEach(pos => {
        if (pos.position_id === posId) {
          pos.departments.forEach(dept => {
            const key = `${posId}-${dept.department_id}`;
            newExpPos[key] = true;
          });
        }
      });
    });

    setExpDept(newExpDept);
    setExpPos(newExpPos);
  }, [searchMatches, positions]);

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
          {} as { [k: number]: boolean }
      );

      const allPos = positions.reduce(
          (acc, pos) => {
            pos.departments.forEach(dept => {
              const key = `${pos.position_id}-${dept.department_id}`;
              acc[key] = true;
            });
            return acc;
          },
          {} as { [k: string]: boolean }
      );

      setExpDept(allDepts);
      setExpPos(allPos);
    }

    setAllExpanded(!allExpanded);
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (ldDept || ldPos || ldEmp) {
    return <div>Загрузка...</div>;
  }

  // Функция для проверки соответствия поиску
  const shouldShowInSearch = (itemType: 'department' | 'position', id: number): boolean => {
    if (!searchTerm.trim()) return true;

    if (itemType === 'department') {
      return searchMatches.departments.has(id);
    } else {
      return searchMatches.positions.has(id);
    }
  };

  // Вспомогательные функции для получения данных
  const getChildDeptsByDept = (deptId: number) =>
      departments.filter(
          d => !d.deleted &&
              d.parent_department_id === deptId &&
              (!searchTerm.trim() || shouldShowInSearch('department', d.department_id))
      );

  const getChildDeptsByPosition = (posId: number) =>
      departments.filter(
          d => !d.deleted &&
              d.parent_position_id === posId &&
              (!searchTerm.trim() || shouldShowInSearch('department', d.department_id))
      );

  const getDeptPositions = (deptId: number) => {
    // Находим должности в отделе
    const linked = positions.filter(p =>
        p.departments.some(dd => dd.department_id === deptId) &&
        (!searchTerm.trim() || shouldShowInSearch('position', p.position_id))
    );

    if (positionRelations.length === 0) {
      return linked.filter(p => p.parent_position_id === null);
    }

    // Отношения между должностями
    const rels = positionRelations
        .filter(r => !r.deleted)
        .filter(r => {
          const childInDept = linked.some(p => p.position_id === r.position_id);
          const parentInDept = linked.some(p => p.position_id === r.parent_position_id);
          return childInDept || parentInDept;
        });

    // Строим дерево
    const map: Record<number, any> = {};
    linked.forEach(p => map[p.position_id] = { ...p, children: [] });

    rels.forEach(r => {
      const parent = map[r.parent_position_id];
      const child = map[r.position_id];
      if (parent && child) {
        if (!parent.children.some((c: any) => c.position_id === child.position_id)) {
          parent.children.push(child);
        }
      }
    });

    // Возвращаем корневые должности
    return Object.values(map).filter((p: any) =>
        !rels.some(r => r.position_id === p.position_id && map[r.parent_position_id])
    );
  };

  const getEmps = (posId: number, deptId: number) =>
      employees.filter(
          e => e.position_id === posId && e.department_id === deptId
      );

  // Функция для получения информации о вакансиях
  const getPositionDepartmentInfo = (posId: number, deptId: number) => {
    const positionDept = positionDepartments?.find(
        pd => pd.position_id === posId && pd.department_id === deptId && !pd.deleted
    );

    const emps = getEmps(posId, deptId);

    if (!positionDept) {
      return {
        staffUnits: 0,
        vacancies: 0,
        currentCount: emps.length,
      };
    }

    // ПРЕДЕЛЬНО ПРОСТАЯ ЛОГИКА ПО УКАЗАНИЮ:
    // 1. ВСЕГО - значение из БД (поле vacancies)
    // 2. Занято - количество сотрудников (emps.length)
    // 3. Вакансии = ВСЕГО - Занято (если получается отрицательное, то 0)

    const currentCount = emps.length;
    const totalCount = positionDept.vacancies || 0;
    const vacancies = Math.max(0, totalCount - currentCount);

    console.log(`Позиция в отделе ${positionDept?.department_id}, всего (vacancies из БД): ${totalCount}, занято: ${currentCount}, вакансий: ${vacancies}`);
    return {
      staffUnits: totalCount,
      vacancies: vacancies,
      currentCount: currentCount
    };
  };

  // Рендеринг строки должности
  const renderPositionRow = (
      p: Position & { children?: Array<Position & { children?: any[] }> } | undefined,
      deptId: number,
      lvl = 0,
      parentId?: string,
  ) => {
    // Проверка на случай, если p не определено
    if (!p) {
      return [];
    }
    
    if (searchTerm.trim() && !shouldShowInSearch('position', p.position_id)) {
      return [];
    }

    const key = `${p.position_id}-${deptId}`;
    const rowId = parentId ? `${parentId}-${key}` : key;
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);
    const { staffUnits, vacancies } = getPositionDepartmentInfo(p.position_id, deptId);
    const ex = expPos[key] ? expPos[key] : lvl < 2;
    const rows = [];

    // Определяем цвет фона в зависимости от наличия вакансий
    let bgClass = "";
    if (staffUnits > 0) {
      bgClass = emps.length < staffUnits ? "bg-red-100" : "bg-green-100";
    }

    if (vacancies === 0 && vacantSort || vacancies > 0 && busySort) {
      bgClass += " opacity-30"
    }

    const paddingLeftValue = lvl * 20 + ((childPositions.length === 0 && childDepts.length === 0) ? 15 : 0);

    // Добавляем строку для текущей должности
    rows.push(
        <TableRow key={rowId} className={bgClass}>
          <TableCell className="font-medium">
            <div
                className="flex items-center cursor-pointer"
                style={{ paddingLeft: `${paddingLeftValue}px` }}
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
        </TableRow>
    );

    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      childPositions.forEach((child) => {
        if (child) { // Проверяем, что дочерний элемент существует
          rows.push(...renderPositionRow(child, deptId, lvl + 1, rowId));
        }
      });

      childDepts.forEach(dept => {
        if (dept) { // Проверяем, что дочерний отдел существует
          rows.push(...renderDepartmentRow(dept, lvl + 1, rowId));
        }
      });
    }

    return rows;
  };

  // Рендеринг строки отдела
  const renderDepartmentRow = (d: Department, lvl = 0, parentId?: string) => {
    if (searchTerm.trim() && !shouldShowInSearch('department', d.department_id)) {
      return [];
    }

    const rowId = parentId ? `${parentId}-dept-${d.department_id}` : `dept-${d.department_id}`;
    const childDepts = getChildDeptsByDept(d.department_id);
    const deptPositions = getDeptPositions(d.department_id);
    const ex = expDept[d.department_id] ? expDept[d.department_id] : lvl < 2;
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
        </TableRow>
    );

    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      deptPositions.forEach(position => {
        if (position) { // Проверяем, что position существует
          rows.push(...renderPositionRow(position, d.department_id, lvl + 1, rowId));
        }
      });

      childDepts.forEach(childDept => {
        if (childDept) { // Проверяем, что childDept существует
          rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
        }
      });
    }

    return rows;
  };

  const renderFromRoute = () => {
    const department = departments.filter(
        d =>
            !d.deleted &&
            d.department_id === Number(routeParams?.id) &&
            (!searchTerm.trim() || shouldShowInSearch('department', d.department_id))
    );

    const position = positions.filter(
        p =>
            p.position_id === Number(routeParams?.id) &&
            (!searchTerm.trim() || shouldShowInSearch('position', p.position_id))
    );

    if (department.length > 0) {
      return renderDepartmentRow(department[0], 0); 
    } else if (position.length > 0) {
      return renderPositionRow(position[0], 0);
    }
    return [];
  }

  // Получаем состояние из localStorage, которое мы записываем при переходе с главной страницы
  const [stateOrgId, setStateOrgId] = useState<number | null>(null);
  const [stateOrgName, setStateOrgName] = useState<string | null>(null);
  
  // При монтировании компонента проверяем localStorage и настраиваем автоматическое раскрытие уровней
  useEffect(() => {
    const savedOrgId = localStorage.getItem('selectedOrganizationId');
    const savedOrgName = localStorage.getItem('selectedOrganizationName');
    
    if (savedOrgId) {
      setStateOrgId(Number(savedOrgId));
      localStorage.removeItem('selectedOrganizationId');
    }
    
    if (savedOrgName) {
      setStateOrgName(savedOrgName);
      localStorage.removeItem('selectedOrganizationName');
    }
  }, []);
  
  // Если есть ID организации в state, используем его
  // Иначе ищем Цифролаб как дефолтную организацию
  let targetDepartment = stateOrgId 
    ? departments.find(d => !d.deleted && d.department_id === stateOrgId)
    : departments.find(d => !d.deleted && d.name.includes("Цифролаб") && d.is_organization);
    
  const targetDepartmentId = targetDepartment?.department_id;
  
  // Определяем, показывать только выбранную организацию или все организации
  const showOnlyTarget = Boolean(targetDepartmentId);
  
  // Эффект для авто-раскрытия первых двух уровней дерева при загрузке данных
  useEffect(() => {
    if (departments.length && positions.length && !Object.keys(expDept).length) {
      console.log("Авто-раскрытие первых 2-х уровней дерева...");
      
      // Определяем корневые отделы
      const rootDepts = departments.filter(d => 
        !d.deleted && d.parent_department_id === null
      );
      
      // Определяем отделы первого уровня
      const level1Depts = departments.filter(d => 
        !d.deleted && rootDepts.some(rd => rd.department_id === d.parent_department_id)
      );
      
      const newExpDept: { [k: number]: boolean } = {};
      
      // Раскрываем корневые отделы
      rootDepts.forEach(d => {
        newExpDept[d.department_id] = true;
      });
      
      // Раскрываем отделы первого уровня
      level1Depts.forEach(d => {
        newExpDept[d.department_id] = true;
      });
      
      setExpDept(newExpDept);
    }
  }, [departments, positions, expDept]);
  
  // Фильтруем корневые отделы в соответствии с поисковым запросом
  const roots = departments.filter(
      d =>
          !d.deleted &&
          // Если найдена целевая организация, показываем только её, иначе показываем все корневые отделы
          (showOnlyTarget 
            ? d.department_id === targetDepartmentId 
            : (d.parent_department_id === null && d.parent_position_id === null)
          ) &&
          (!searchTerm.trim() || shouldShowInSearch('department', d.department_id))
  );

  // Компонент пользовательского интерфейса
  return (
    <div className="flex flex-col h-screen">

      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        <Card>
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <Button asChild variant="outline" className="flex items-center">
                <Link href="/">На главную</Link>
              </Button>
              
              {/* Поисковый блок в правом верхнем углу */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                  {searchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
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
            </div>
            <div>
              <CardTitle>
                {showOnlyTarget ? `Учет вакансий | ${targetDepartment?.name || stateOrgName}` : "Учет вакансий"}
              </CardTitle>
              <CardDescription>
                Анализ штатных единиц и занятых позиций
                {showOnlyTarget && (
                  <Button 
                    asChild
                    variant="link" 
                    className="ml-2 p-0 h-auto text-sm text-blue-500"
                  >
                    <Link href="/vacancies">Показать все</Link>
                  </Button>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="-mt-[48px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[400px]"></TableHead>
                  <TableHead colSpan={3}>
                    <div className="flex items-center justify-center gap-2">
                      Штатные позиции
                      <Tooltip>
                        <TooltipTrigger>
                          <Button className="p-0 h-auto size-4 rounded-[50%]">i</Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-center">Нажатием на <br></br>"Занято" или "Вакантно" <br></br>можно отфильтровать структуру <br></br>организации, оставив выбранное.</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="min-w-[400px]">
                    Структура организации
                  </TableHead>
                  <TableHead className="text-center">Всего</TableHead>
                  <TableHead
                    className={`selection:bg-transparent cursor-pointer text-center text-primary${busySort ? ' pointer-events-none opacity-50' : ''}`}
                    onClick={() => setVacantSort((prevValue) => !prevValue)}
                  >Занято</TableHead>
                  <TableHead
                    className={`selection:bg-transparent cursor-pointer text-center text-primary${vacantSort ? ' pointer-events-none opacity-50' : ''}`}
                    onClick={() => setBusySort((prevValue) => !prevValue)}
                  >Вакансии</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!routeParams?.id ? roots.map((dept) => renderDepartmentRow(dept, 0)) : renderFromRoute()}
              </TableBody>
            </Table>
            
            {/* Показываем уведомление, если не найдено результатов */}
            {searchTerm && roots.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                Ничего не найдено по запросу "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}