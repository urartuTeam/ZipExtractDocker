import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import UnifiedPositionCard from "./UnifiedPositionCard";
import DisplaySettings from "./DisplaySettings";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Расширяем интерфейс Window глобально
declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

// Типы данных для организационной структуры
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
};

type Position = {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
};

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null; // Добавляем поле manager_id для отслеживания подчиненности
};

type DepartmentNode = Department & {
  positions: Position[];
  children: DepartmentNode[];
  width: number; // ширина в процентах
  childCount: number; // общее количество дочерних элементов
};

type PositionWithEmployees = Position & {
  employees: Employee[];
};

type DepartmentAsPosition = {
  position_id: number; // Используем уникальный ID, например department_id * 1000
  name: string;
  isDepartment: true;
  department_id: number;
};

type PositionHierarchyNode = {
  position: Position;
  employees: Employee[];
  subordinates: PositionHierarchyNode[];
  childDepartments: Department[];
};

type OrganizationTreeProps = {
  initialPositionId?: number;
  onPositionClick?: (positionId: number) => void;
  departmentsData?: Department[];
  positionsData?: any[];
  employeesData?: Employee[];
};

const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  initialPositionId,
  onPositionClick,
  departmentsData,
  positionsData,
  employeesData,
}) => {
  // Запрос на получение отделов (если не переданы через пропсы)
  const { data: departmentsResponse } = useQuery<{
    status: string;
    data: Department[];
  }>({
    queryKey: ["/api/departments"],
    enabled: !departmentsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const departments = departmentsData || departmentsResponse?.data || [];

  // Запрос на получение должностей (если не переданы через пропсы)
  const { data: positionsResponse } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: ["/api/positions"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const positions = positionsData || positionsResponse?.data || [];

  // Запрос на получение сотрудников (если не переданы через пропсы)
  const { data: employeesResponse } = useQuery<{
    status: string;
    data: Employee[];
  }>({
    queryKey: ["/api/employees"],
    enabled: !employeesData, // Не выполнять запрос, если данные переданы через пропсы
  });
  const employees = employeesData || employeesResponse?.data || [];

  // Состояние для хранения построенного дерева
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);

  // Состояние для хранения иерархии должностей
  const [positionHierarchy, setPositionHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  // Состояние для хранения текущей выбранной должности
  const [selectedPositionId, setSelectedPositionId] = useState<
    number | undefined
  >(initialPositionId);

  // Состояние для хранения отфильтрованной иерархии должностей, когда выбрана конкретная должность
  const [filteredHierarchy, setFilteredHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  // Запрос для получения данных о связях должностей (position_position)
  const { data: positionPositionsData } = useQuery<{
    status: string;
    data: {
      position_relation_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number;
      deleted: boolean;
    }[];
  }>({
    queryKey: ['/api/positionpositions'],
  });

  // Состояние для хранения информации о должностях с отделами (если не переданы через пропсы)
  const { data: positionsWithDepartmentsResponse } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/positions/with-departments"],
    enabled: !positionsData, // Не выполнять запрос, если данные переданы через пропсы
  });

  // Используем данные о должностях с отделами из пропсов или из запроса
  const positionsWithDepartments =
    positionsData || positionsWithDepartmentsResponse?.data || [];

  // Сохраняем positionsWithDepartments в глобальном объекте для доступа из подкомпонентов
  if (typeof window !== "undefined") {
    window.positionsWithDepartmentsData = positionsWithDepartments;
  }

  // Состояние для хранения истории навигации по дереву
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);

  // Состояния для настроек отображения
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(false);

  // Запрос настроек для получения количества показываемых уровней иерархии
  const { data: settingsResponse, isError } = useQuery<{
    status: string;
    data: any[];
  }>({
    queryKey: ["/api/settings"],
    retry: false, // Не повторять запрос в случае ошибки
  });

  // Если есть ошибка с запросом настроек, просто логируем
  if (isError) {
    console.log("Ошибка получения настроек, используем значения по умолчанию");
  }

  // Получаем настройки из ответа или используем значение по умолчанию
  const defaultLevels = 2; // По умолчанию 2 уровня

  // Пытаемся получить настройку из ответа API
  const hierarchyInitialLevels = settingsResponse?.data
    ? settingsResponse.data.find(
        (item: any) => item.data_key === "hierarchy_initial_levels",
      )?.data_value || defaultLevels
    : defaultLevels;

  console.log("Настройки уровней иерархии:", hierarchyInitialLevels);

  // Инициализируем состояние showThreeLevels на основе настроек
  useEffect(() => {
    const threeLevels = Number(hierarchyInitialLevels) === 3;
    setShowThreeLevels(threeLevels);
  }, [hierarchyInitialLevels]);

  // Эффект для обновления UI при изменении настройки showThreeLevels
  useEffect(() => {
    // Реагируем на изменение настройки отображения уровней
    console.log("Обновленная настройка showThreeLevels:", showThreeLevels);
  }, [showThreeLevels]);

  // Обработчики для изменения настроек отображения
  const handleThreeLevelsChange = (value: boolean) => {
    setShowThreeLevels(value);
  };

  const handleShowVacanciesChange = (value: boolean) => {
    setShowVacancies(value);
  };

  // Получение иерархии должностей для отдела с использованием новой таблицы position_position
  const getDeptPositionsHierarchy = (deptId: number) => {
    // Используем positionsWithDepartments, т.к. там уже есть связи с отделами
    const linkedPositions = positionsWithDepartments.filter(p => 
      p.departments && 
      Array.isArray(p.departments) &&
      p.departments.some((d: any) => d.department_id === deptId)
    );
    
    console.log(`getDeptPositionsHierarchy для отдела ${deptId}: найдено ${linkedPositions.length} должностей`);
    
    // Отладочный вывод - список найденных должностей 
    linkedPositions.forEach(p => {
      console.log(`- Должность в отделе ${deptId}: "${p.name}" (ID: ${p.position_id})`);
    });
    
    // Получаем связи должностей из position_position для этого отдела
    const positionRelations = positionPositionsData?.data?.filter(
      relation => relation.department_id === deptId && !relation.deleted
    ) || [];
    
    console.log(`Найдено ${positionRelations.length} связей должностей для отдела ${deptId}`);
    
    // Создаем словарь для быстрого доступа к должностям и их дочерним элементам
    const positionsMap: { [k: number]: any } = {};
    
    // Заполняем словарь должностями, связанными с этим отделом
    linkedPositions.forEach(p => {
      positionsMap[p.position_id] = { ...p, children: [] };
    });
    
    // Строим иерархию на основе position_position
    positionRelations.forEach(relation => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      // Проверяем, что обе должности существуют в нашем словаре
      if (positionsMap[childId] && positionsMap[parentId]) {
        positionsMap[parentId].children.push(positionsMap[childId]);
        console.log(`Создана связь: "${positionsMap[childId].name}" (ID: ${childId}) подчиняется "${positionsMap[parentId].name}" (ID: ${parentId}) в отделе ${deptId}`);
      }
    });
    
    // Фильтруем только корневые должности (те, которые не являются ни чьими дочерними)
    // Для этого находим все должности, которые не упоминаются как position_id в positionRelations
    const childPositionIds = new Set(positionRelations.map(r => r.position_id));
    const rootPositions = Object.values(positionsMap).filter(
      (p: any) => !childPositionIds.has(p.position_id)
    );
    
    console.log(`Найдено ${rootPositions.length} корневых должностей для отдела ${deptId}:`);
    rootPositions.forEach((p: any) => {
      console.log(`- Корневая должность: "${p.name}" (ID: ${p.position_id}) с ${p.children.length} подчиненными`);
      // Выводим подчиненных, если есть
      if (p.children.length > 0) {
        p.children.forEach((child: any) => {
          console.log(`  - Подчиненный: "${child.name}" (ID: ${child.position_id})`);
        });
      }
    });
    
    return rootPositions;
  };
  
  // Функция для преобразования должности из формата hierarchyPosition в PositionHierarchyNode
  const createPositionHierarchyNode = (positionNode: any, departmentId: number): PositionHierarchyNode | null => {
    if (!positionNode || !positionNode.position_id) {
      return null;
    }
    
    // Ищем всех сотрудников на этой должности в этом отделе
    const positionEmployees = employees.filter(e => 
      e.position_id === positionNode.position_id && e.department_id === departmentId
    );
    
    // Создаем узел для должности
    const node: PositionHierarchyNode = {
      position: {
        position_id: positionNode.position_id,
        name: positionNode.name,
        parent_position_id: positionNode.parent_position_id,
        department_id: departmentId
      },
      employees: positionEmployees,
      subordinates: [],
      childDepartments: []
    };
    
    // Рекурсивно обрабатываем дочерние должности
    if (positionNode.children && Array.isArray(positionNode.children)) {
      positionNode.children.forEach((childPos: any) => {
        const childNode = createPositionHierarchyNode(childPos, departmentId);
        if (childNode) {
          node.subordinates.push(childNode);
        }
      });
    }
    
    return node;
  };
  
  // Рекурсивно ищем узел должности по ID
  const findPositionNodeById = (
    nodes: PositionHierarchyNode[],
    positionId: number,
  ): PositionHierarchyNode | null => {
    for (const node of nodes) {
      if (node.position.position_id === positionId) {
        return node;
      }

      if (node.subordinates.length > 0) {
        const found = findPositionNodeById(node.subordinates, positionId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  // Рекурсивно вычисляем количество всех дочерних элементов для отдела
  const calculateChildCount = (
    department: Department,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
  ): number => {
    // Находим непосредственных детей - отделы, которые привязаны к должностям в этом отделе
    const departmentPositions = allPositions.filter((pos) =>
      // Позиции, которые связаны с сотрудниками в этом отделе
      allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      ),
    );

    // Находим отделы, которые привязаны к этому отделу
    const children = allDepartments.filter(
      (d) => d.parent_department_id === department.department_id,
    );

    // Считаем количество позиций в текущем отделе
    const departmentPositionCount = allPositions.filter((pos) => {
      // Проверяем, есть ли сотрудники с этой позицией в этом отделе
      const hasEmployeesInDepartment = allEmployees.some(
        (emp) =>
          emp.position_id === pos.position_id &&
          emp.department_id === department.department_id,
      );

      return hasEmployeesInDepartment;
    }).length;

    // Если нет позиций, считаем минимум 1
    const positionCount = Math.max(departmentPositionCount, 1);

    // Если нет детей, возвращаем только количество позиций
    if (children.length === 0) {
      return positionCount;
    }

    // Рекурсивно вычисляем количество позиций для всех дочерних отделов
    let childCount = positionCount;
    for (const child of children) {
      childCount += calculateChildCount(
        child,
        allDepartments,
        allPositions,
        allEmployees,
      );
    }

    return childCount;
  };

  // Построение дерева отделов
  const buildDepartmentTree = (
    parentId: number | null,
    allDepartments: Department[],
    allPositions: Position[],
    allEmployees: Employee[],
    parentChildCount?: number,
  ): DepartmentNode[] => {
    // Находим отделы либо без родительской должности (корневые), либо с заданной родительской должностью
    const departmentsAtLevel =
      parentId === null
        ? allDepartments.filter((d) => d.parent_department_id === null)
        : allDepartments.filter((d) => {
            // Находим все позиции в отделе с parentId
            const departmentPositions = allPositions.filter((pos) => {
              // Позиция непосредственно привязана к отделу
              const isDirectlyLinkedToThisDepartment =
                pos.department_id === parentId;

              // Позиция связана с сотрудником в этом отделе
              const hasEmployeesInDepartment = allEmployees.some(
                (emp) =>
                  emp.position_id === pos.position_id &&
                  emp.department_id === parentId,
              );

              return (
                isDirectlyLinkedToThisDepartment || hasEmployeesInDepartment
              );
            });

            // Отдел привязан к родительскому отделу
            return d.parent_department_id === parentId;
          });

    // Вычисляем childCount для каждого отдела
    const departmentsWithCounts = departmentsAtLevel.map((dept) => {
      const childCount = calculateChildCount(
        dept,
        allDepartments,
        allPositions,
        allEmployees,
      );
      return { ...dept, childCount };
    });

    // Вычисляем общее количество дочерних элементов на этом уровне
    const totalChildCount = departmentsWithCounts.reduce(
      (sum, dept) => sum + dept.childCount,
      0,
    );

    return departmentsWithCounts.map((dept) => {
      // Получаем позиции для этого отдела
      // Сначала проверяем, есть ли у нас API для получения позиций отдела
      // Если нет, используем логику определения по сотрудникам

      // Нужно получить все позиции, которые привязаны к этому отделу
      // даже если у них нет сотрудников
      // Поэтому нам нужно запросить связь position-department из API

      // Пока используем следующую логику:
      // Все позиции, где есть сотрудники в этом отделе
      const positionsWithEmployees = allPositions.filter((pos) => {
        return allEmployees.some(
          (emp) =>
            emp.position_id === pos.position_id &&
            emp.department_id === dept.department_id,
        );
      });

      // Предполагаем также, что все позиции могут быть привязаны к отделу
      // Поскольку у нас нет API для получения связей department-position,
      // покажем все позиции для демонстрации
      const allDepartmentPositions = [...positionsWithEmployees];

      // В реальном приложении здесь будет вызов API для получения
      // всех позиций, привязанных к отделу
      const departmentPositions = allPositions;

      // Вычисляем ширину как пропорцию от общего количества
      // Если totalChildCount = 0, устанавливаем ширину 100%
      let width =
        totalChildCount === 0 ? 100 : (dept.childCount / totalChildCount) * 100;

      // Если элементов слишком много, ограничиваем минимальную ширину
      if (width < 5) width = 5;

      // Рекурсивно строим дочерние элементы
      const children = buildDepartmentTree(
        dept.department_id,
        allDepartments,
        allPositions,
        allEmployees,
        dept.childCount,
      );

      return {
        ...dept,
        positions: departmentPositions,
        children,
        width,
        childCount: dept.childCount,
      };
    });
  };

  // Функция для построения иерархии должностей
  const buildPositionHierarchy = (
    positions: Position[],
    employees: Employee[],
    departments: Department[],
    initialPositionId?: number,
  ): PositionHierarchyNode[] => {
    console.log("Запуск buildPositionHierarchy с", positions.length, "должностями");
    
    // Получаем данные о связях должностей из position_position
    const positionRelations = positionPositionsData?.data?.filter(pp => !pp.deleted) || [];
    
    console.log(`Загружено ${positionRelations.length} связей из position_positions таблицы`);
    
    // Создаем индексированную карту всех должностей для быстрого доступа
    const positionMap: Record<number, Position> = {};
    positions.forEach(position => {
      positionMap[position.position_id] = position;
    });
    
    // Сначала создаем узлы для всех должностей
    const positionNodes: Record<number, PositionHierarchyNode> = {};
    
    // Инициализируем узлы для всех должностей
    positions.forEach(position => {
      // Находим сотрудников на этой должности
      const positionEmployees = employees.filter(emp => 
        emp.position_id === position.position_id
      );
      
      positionNodes[position.position_id] = {
        position: position,
        employees: positionEmployees,
        subordinates: [],
        childDepartments: []
      };
    });
    
    // Набор идентификаторов дочерних должностей (для определения корневых)
    const childPositionIds = new Set<number>();
    
    // Строим иерархию на основе position_position таблицы
    positionRelations.forEach(relation => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      const departmentId = relation.department_id;
      
      // Проверяем, что должности существуют в нашей карте узлов
      if (positionNodes[childId] && positionNodes[parentId]) {
        // Если у подчиненной должности есть сотрудники в другом отделе,
        // создаем копию узла специально для этого отдела
        const childNode = positionNodes[childId];
        
        // Находим сотрудников только в текущем отделе
        const departmentEmployees = employees.filter(emp => 
          emp.position_id === childId && 
          emp.department_id === departmentId
        );
        
        // Если есть сотрудники в этом отделе или если это специально отмеченная связь,
        // добавляем должность как подчиненную
        if (departmentEmployees.length > 0 || true) { // Всегда добавляем связь из position_position
          // Если должность уже добавлена как подчиненная, пропускаем
          const alreadyAdded = positionNodes[parentId].subordinates.some(
            sub => sub.position.position_id === childId
          );
          
          if (!alreadyAdded) {
            // Отмечаем, что эта должность является чьей-то дочерней
            childPositionIds.add(childId);
            
            // Создаем глубокую копию подчиненного узла с сотрудниками только из этого отдела
            const departmentChildNode: PositionHierarchyNode = {
              position: {
                ...childNode.position,
                department_id: departmentId
              },
              employees: departmentEmployees,
              subordinates: [...childNode.subordinates], // Копируем подчиненных
              childDepartments: []
            };
            
            // Добавляем узел как подчиненный
            positionNodes[parentId].subordinates.push(departmentChildNode);
            
            console.log(`Создана связь: "${positionMap[childId]?.name}" (ID: ${childId}) подчиняется "${positionMap[parentId]?.name}" (ID: ${parentId}) в отделе ${departmentId}`);
          }
        }
      } else {
        console.log(`Не найдены должности для связи: parent=${parentId}, child=${childId}, dept=${departmentId}`);
      }
    });
    
    // Добавляем связи отделов и должностей
    departments.forEach(department => {
      if (department.parent_position_id) {
        const parentNode = positionNodes[department.parent_position_id];
        if (parentNode) {
          // Добавляем отдел как дочерний для должности
          if (!parentNode.childDepartments.some(d => d.department_id === department.department_id)) {
            parentNode.childDepartments.push(department);
            console.log(`Добавлен отдел "${department.name}" как дочерний для должности "${parentNode.position.name}"`);
          }
        }
      }
    });
    
    // Находим корневые должности (те, которые не являются ничьими дочерними)
    let rootNodes: PositionHierarchyNode[] = [];
    
    if (initialPositionId) {
      // Если указан конкретный ID начальной должности
      const rootNode = positionNodes[initialPositionId];
      if (rootNode) {
        rootNodes = [rootNode];
        console.log(`Используем указанную начальную должность: "${rootNode.position.name}" (ID: ${initialPositionId})`);
      } else {
        console.log(`Начальная должность с ID ${initialPositionId} не найдена`);
        // Используем всех, кто не является чьим-то дочерним, как резервный вариант
        rootNodes = Object.values(positionNodes).filter(
          node => !childPositionIds.has(node.position.position_id)
        );
      }
    } else {
      // Если начальная должность не указана, используем должности, которые не являются ничьими дочерними
      rootNodes = Object.values(positionNodes).filter(
        node => !childPositionIds.has(node.position.position_id)
      );
      
      console.log(`Найдено ${rootNodes.length} корневых должностей:`);
      rootNodes.forEach(node => {
        console.log(`- Корневая должность: "${node.position.name}" (ID: ${node.position.position_id}) с ${node.subordinates.length} подчиненными`);
      });
    }
    
    return rootNodes;
  };

  // Функция для построения структуры на основе данных о должностях
  const buildRootDepartmentHierarchy = () => {
    // Проверяем, есть ли данные о должностях и отделах
    if (positions.length === 0 || departments.length === 0) {
      console.error("Нет данных о должностях или отделах");
      return [];
    }

    // Находим корневой отдел (без родительских отделов и позиций)
    const rootDepartment = departments.find(
      (dept) =>
        dept.parent_department_id === null && dept.parent_position_id === null,
    );
    if (!rootDepartment) {
      console.error("Корневой отдел не найден");
      return [];
    }

    console.log("Найден корневой отдел:", rootDepartment);

    // Шаг 1: Находим все должности корневого отдела
    let adminPositions = [];

    // Сначала проверим positions с отделами (из /api/positions/with-departments)
    if (positionsWithDepartments && positionsWithDepartments.length > 0) {
      adminPositions = positionsWithDepartments.filter((pos) => {
        // Проверяем, есть ли у должности привязка к корневому отделу
        return (
          pos.departments &&
          Array.isArray(pos.departments) &&
          pos.departments.some(
            (d: any) => d.department_id === rootDepartment.department_id,
          )
        );
      });
    } else {
      // Запасной вариант - используем данные о сотрудниках для определения должностей
      // Находим должности по сотрудникам, работающим в корневом отделе
      const rootEmployees = employees.filter(
        (emp) => emp.department_id === rootDepartment.department_id,
      );

      // Получаем уникальные ID должностей
      const rootPositionIds = Array.from(
        new Set(
          rootEmployees
            .map((emp) => emp.position_id)
            .filter((id): id is number => id !== null),
        ),
      );

      // Находим должности по ID
      adminPositions = positions.filter((pos) =>
        rootPositionIds.includes(pos.position_id),
      );
    }

    console.log(
      `Должности корневого отдела "${rootDepartment.name}":`,
      adminPositions.map((pos) => pos.name),
    );

    // Шаг 2: Находим все дочерние отделы для корневого отдела (отделы верхнего уровня)
    const topLevelDepartments = departments.filter(
      (dept) => dept.parent_department_id === rootDepartment.department_id,
    );

    console.log(
      `Отделы верхнего уровня:`,
      topLevelDepartments.map((dept) => dept.name),
    );

    // Шаг 3: Находим позиции менеджеров, которые связаны с отделами верхнего уровня
    // Например, генеральный директор -> управление
    const managerPositions: PositionWithEmployees[] = [];

    // Для каждого отдела верхнего уровня
    for (const dept of topLevelDepartments) {
      // Проверяем, есть ли у отдела родительская должность
      if (dept.parent_position_id) {
        const parentPosition = positions.find(
          (pos) => pos.position_id === dept.parent_position_id,
        );
        if (parentPosition) {
          // Находим сотрудников на этой должности
          const posEmployees = employees.filter(
            (emp) => emp.position_id === parentPosition.position_id,
          );
          managerPositions.push({
            ...parentPosition,
            employees: posEmployees,
          });
        }
      }
    }

    console.log(
      `Должности менеджеров, связанные с отделами верхнего уровня:`,
      managerPositions.map((pos) => pos.name),
    );

    // Шаг 4: Сливаем все в одну структуру для построения дерева
    // Результат: корневые должности, из которых можно построить дерево
    return buildPositionHierarchy(positions, employees, departments);
  };

  // Эффект для построения дерева при загрузке данных
  useEffect(() => {
    // После загрузки данных о позициях, отделах и сотрудниках, строим структуру
    if (
      positions.length > 0 &&
      departments.length > 0 &&
      employees.length > 0 &&
      positionPositionsData?.data 
    ) {
      console.log("Построение иерархии на основе position_position данных");
      
      // Собираем корневую иерархию
      const hierarchy = buildPositionHierarchy(
        positions,
        employees,
        departments,
        selectedPositionId,
      );
      
      // Если есть выбранная должность, обрабатываем иерархию
      if (selectedPositionId) {
        // Находим выбранную должность в иерархии
        const selectedPosition = positions.find(
          (p) => p.position_id === selectedPositionId,
        );
        
        if (selectedPosition) {
          console.log(`Фильтрация иерархии для должности "${selectedPosition.name}" (ID: ${selectedPositionId})`);
        }
        
        // Фильтруем иерархию для выбранной должности
        const filtered = hierarchy.filter(
          (node) => node.position.position_id === selectedPositionId,
        );
        
        if (filtered.length > 0) {
          setFilteredHierarchy(filtered);
        } else {
          // Если выбранная должность не найдена в корневых узлах,
          // пытаемся найти ее в подчиненных
          let foundNode: PositionHierarchyNode | null = null;
          
          for (const rootNode of hierarchy) {
            foundNode = findPositionNodeById(
              [rootNode],
              selectedPositionId,
            );
            if (foundNode) {
              break;
            }
          }
          
          if (foundNode) {
            setFilteredHierarchy([foundNode]);
          } else {
            // Если должность не найдена нигде в иерархии, отображаем всю иерархию
            console.warn(`Выбранная должность с ID ${selectedPositionId} не найдена в иерархии`);
            setFilteredHierarchy(hierarchy);
          }
        }
      } else {
        // Если нет выбранной должности, отображаем всю иерархию
        setFilteredHierarchy(hierarchy);
      }
      
      setPositionHierarchy(hierarchy);
    }
  }, [positions, departments, employees, selectedPositionId, positionPositionsData]);

  // Функция для обработки клика по должности в иерархии
  const handlePositionClick = (positionId: number) => {
    if (onPositionClick) {
      onPositionClick(positionId);
    } else {
      // Если не передан обработчик извне, обрабатываем клик сами
      // добавляем предыдущую позицию в историю навигации
      if (selectedPositionId) {
        setNavigationHistory((prev) => [...prev, selectedPositionId]);
      }
      setSelectedPositionId(positionId);
    }
  };

  // Компонент для отображения одного узла иерархии (должности или отдела)
  const TreeNode = ({
    node,
    level = 0,
    forceExpand = false,
  }: {
    node: PositionHierarchyNode;
    level?: number;
    forceExpand?: boolean;
  }) => {
    // Определяем, нужно ли показывать данный уровень иерархии
    const shouldShow = showThreeLevels || level < 2 || forceExpand || level === 0;

    // Если не нужно показывать, возвращаем null
    if (!shouldShow) return null;

    // Находим сотрудников на этой должности
    const employees = node.employees;

    // Если режим showVacancies=false и нет сотрудников, не показываем должность
    if (!showVacancies && employees.length === 0) {
      // Но если у должности есть подчиненные должности, все равно показываем
      if (node.subordinates.length === 0) {
        return null;
      }
    }

    // Предпочитаем UnifiedPositionCard, но если он не доступен,
    // используем обычную верстку
    return (
      <div className="flex flex-col items-center">
        <UnifiedPositionCard
          data={{
            position: node.position,
            employees: node.employees,
          }}
          onClick={() => handlePositionClick(node.position.position_id)}
        />

        {/* Дочерние отделы */}
        {node.childDepartments.length > 0 && (
          <div className="mt-4 border-t-2 border-gray-300 pt-4 flex flex-wrap justify-center gap-6">
            {node.childDepartments.map((dept) => (
              <div
                key={dept.department_id}
                className="border-2 border-[#a40000] rounded-lg p-3 text-center bg-white shadow-sm"
              >
                <div className="font-bold text-[#a40000]">{dept.name}</div>
                <div className="text-xs text-gray-500">
                  ID отдела: {dept.department_id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Подчиненные должности */}
        {node.subordinates.length > 0 && (
          <div className="mt-4 border-t-2 border-gray-300 pt-4 flex flex-wrap justify-center gap-6">
            {node.subordinates.map((sub, index) => (
              <TreeNode
                key={`${sub.position.position_id}-${index}`}
                node={sub}
                level={level + 1}
                forceExpand={forceExpand}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Контейнер для навигации, например для возврата назад
  const NavigationControls = () => {
    // Функция для возврата назад
    const handleBack = () => {
      if (navigationHistory.length > 0) {
        // Получаем последний элемент из истории
        const lastId = navigationHistory[navigationHistory.length - 1];
        // Удаляем последний элемент из истории
        setNavigationHistory((prev) => prev.slice(0, -1));
        // Устанавливаем новую выбранную должность
        setSelectedPositionId(lastId);
      } else {
        // Если истории нет, сбрасываем выбранную должность
        setSelectedPositionId(undefined);
      }
    };

    // Функция для сброса и возврата к корню
    const handleReset = () => {
      setNavigationHistory([]);
      setSelectedPositionId(undefined);
    };

    return (
      <div className="flex gap-2 mb-4">
        {(selectedPositionId || navigationHistory.length > 0) && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={navigationHistory.length === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              К корню
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Панель навигации */}
      <div className="flex justify-between mb-6">
        <NavigationControls />
        <DisplaySettings
          showThreeLevels={showThreeLevels}
          showVacancies={showVacancies}
          onThreeLevelsChange={handleThreeLevelsChange}
          onShowVacanciesChange={handleShowVacanciesChange}
        />
      </div>

      {/* Самореферентная хлебная крошка */}
      {navigationHistory.length > 0 && (
        <div className="flex items-center overflow-x-auto whitespace-nowrap mb-4 p-2 bg-gray-50 rounded-md">
          <span
            className="text-sm text-blue-600 cursor-pointer hover:underline"
            onClick={handleReset}
          >
            Корень
          </span>
          {navigationHistory.map((posId, index) => {
            const position = positions.find((p) => p.position_id === posId);
            return (
              <React.Fragment key={posId}>
                <span className="mx-2 text-gray-400">/</span>
                <span
                  className="text-sm text-blue-600 cursor-pointer hover:underline"
                  onClick={() => {
                    // Обрезаем историю до этого элемента включительно
                    setNavigationHistory(navigationHistory.slice(0, index + 1));
                    // Устанавливаем выбранную должность
                    setSelectedPositionId(posId);
                  }}
                >
                  {position?.name || `Должность ${posId}`}
                </span>
              </React.Fragment>
            );
          })}
          {selectedPositionId && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-semibold">
                {positions.find((p) => p.position_id === selectedPositionId)
                  ?.name || `Должность ${selectedPositionId}`}
              </span>
            </>
          )}
        </div>
      )}

      {/* Область отображения дерева */}
      <div className="border rounded-lg p-6 bg-gray-50 min-h-[400px] overflow-x-auto">
        {/* Проверяем, загружены ли данные */}
        {positions.length === 0 || departments.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Загрузка данных...
          </div>
        ) : filteredHierarchy.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Нет данных для отображения. Проверьте настройки или обновите страницу.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {filteredHierarchy.map((node, index) => (
              <TreeNode
                key={`${node.position.position_id}-${index}`}
                node={node}
                forceExpand={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationTree;