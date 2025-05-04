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
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

// Типы данных
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

type SearchMatch = {
  departments: Set<number>;
  positions: Set<number>;
};

export default function Vacancies() {
  // State
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch>({
    departments: new Set<number>(),
    positions: new Set<number>()
  });

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

    // Получаем данные из БД
    const currentCount = emps.length;
    
    // Общее количество штатных единиц из БД, или по умолчанию 1
    let staffUnits = positionDept.staff_units || 1;
    
    // Вычисляем правильное количество вакансий
    // Если staff_units = 0 в БД, но есть сотрудники или vacancies, исправляем это
    if (staffUnits === 0 && (currentCount > 0 || positionDept.vacancies > 0)) {
      staffUnits = Math.max(currentCount, positionDept.vacancies);
    }
    
    // Вакансии - это разница между штатными единицами и занятыми местами
    const vacancies = Math.max(0, staffUnits - currentCount);
    
    console.log(`staffUnits: ${staffUnits}, vacancies DB: ${positionDept.vacancies}, vacancies calc: ${vacancies}, currentCount: ${currentCount}`);

    return { staffUnits, vacancies, currentCount };
  };

  // Рендеринг строки должности
  const renderPositionRow = (
    p: Position & { children?: Array<Position & { children?: any[] }> },
    deptId: number,
    lvl = 0,
    parentId?: string,
  ) => {
    if (searchTerm.trim() && !shouldShowInSearch('position', p.position_id)) {
      return [];
    }
    
    const key = `${p.position_id}-${deptId}`;
    const rowId = parentId ? `${parentId}-${key}` : key;
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const childDepts = getChildDeptsByPosition(p.position_id);
    const { staffUnits, vacancies } = getPositionDepartmentInfo(p.position_id, deptId);
    const ex = expPos[key] ?? false;
    const rows = [];

    // Определяем цвет фона в зависимости от наличия вакансий
    let bgClass = "";
    if (staffUnits > 0) {
      bgClass = emps.length < staffUnits ? "bg-red-100" : "bg-green-100";
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
      </TableRow>
    );

    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      childPositions.forEach((child) => {
        rows.push(...renderPositionRow(child, deptId, lvl + 1, rowId));
      });

      childDepts.forEach(dept => {
        rows.push(...renderDepartmentRow(dept, lvl + 1, rowId));
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
      </TableRow>
    );

    // Если поддерево развернуто, добавляем дочерние элементы
    if (ex) {
      deptPositions.forEach(position => {
        rows.push(...renderPositionRow(position, d.department_id, lvl + 1, rowId));
      });

      childDepts.forEach(childDept => {
        rows.push(...renderDepartmentRow(childDept, lvl + 1, rowId));
      });
    }

    return rows;
  };

  // Фильтруем корневые отделы в соответствии с поисковым запросом
  const roots = departments.filter(
    d =>
      !d.deleted &&
      d.parent_department_id === null &&
      d.parent_position_id === null &&
      (!searchTerm.trim() || shouldShowInSearch('department', d.department_id))
  );

  // Компонент пользовательского интерфейса
  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием */}
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