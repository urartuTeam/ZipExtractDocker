import React, { useState, useEffect, useRef } from "react";
import DisplaySettings from "./DisplaySettings";
import PositionTree from "./PositionTree";
import "../styles/OrganizationTree.css";

// Определяем типы для узлов иерархии положений
interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization: boolean;
  logo_path: string | null;
  sort: number;
  deleted: boolean;
  deleted_at: string | null;
}

interface Position {
  position_id: number;
  name: string;
  sort: number;
  is_category?: boolean;
  deleted: boolean;
  deleted_at: string | null;
  departments?: Array<any>;
  parent_positions?: Array<any>;
  children_positions?: Array<any>;
  is_subordinate?: boolean;
}

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  phone: string | null;
  email: string | null;
  manager_id: number | null;
  department_id: number | null;
  category_parent_id: number | null;
  deleted: boolean;
  deleted_at: string | null;
}

interface DepartmentNode {
  department: Department;
  positions: PositionHierarchyNode[];
  parent?: DepartmentNode;
  children: DepartmentNode[];
}

interface PositionHierarchyNode {
  position: Position;
  department?: Department;
  employees: Employee[];
  subordinates: PositionHierarchyNode[];
}

// Для отслеживания истории навигации
interface NavigationHistoryItem {
  positionId: number;
  departmentId: number | null;
}

// Дополнительный интерфейс для отображения окна
interface Window {
  positionsWithDepartmentsData: any[];
}

// При необходимости расширяем глобальный объект window
declare global {
  interface Window {
    positionsWithDepartmentsData: any[];
  }
}

// Компонент дерева организации
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
  departmentsData = [],
  positionsData = [],
  employeesData = [],
}) => {
  // Состояния для хранения данных
  const [departments, setDepartments] = useState<Department[]>(departmentsData);
  const [positions, setPositions] = useState<Position[]>(positionsData);
  const [employees, setEmployees] = useState<Employee[]>(employeesData);

  // Состояние для хранения данных о позициях с отделами
  const [positionsWithDepartments, setPositionsWithDepartments] = useState<
    any[]
  >([]);

  // Состояние для связей между должностями (position_position)
  const [positionRelations, setPositionRelations] = useState<any[]>([]);

  // Состояние для выбранной должности
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    initialPositionId || null,
  );

  // Состояние для иерархии должностей
  const [positionHierarchy, setPositionHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  // Состояние для отфильтрованной иерархии, которую показываем пользователю
  const [filteredHierarchy, setFilteredHierarchy] = useState<
    PositionHierarchyNode[]
  >([]);

  // Добавляем историю навигации для возврата назад
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);

  // Состояние для отслеживания текущего контекста департамента
  const [currentDepartmentContext, setCurrentDepartmentContext] = useState<number | null>(null);

  // Состояния для настроек отображения
  const [showThreeLevels, setShowThreeLevels] = useState<boolean>(false);
  const [showVacancies, setShowVacancies] = useState<boolean>(true);

  // Получаем значение из localStorage или используем дефолтное
  const hierarchyInitialLevels =
    localStorage.getItem("hierarchyInitialLevels") || "2";

  // Рекурсивная функция для поиска должности по ID
  const findPositionNodeById = (
    nodes: PositionHierarchyNode[],
    positionId: number,
    departmentId: number | null = null,
  ): PositionHierarchyNode | null => {
    for (const node of nodes) {
      if (
        node.position.position_id === positionId &&
        (!departmentId || // Если departmentId не задан, то не фильтруем по нему
          !node.department || // Если у узла нет department, то не фильтруем
          node.department.department_id === departmentId) // Иначе проверяем совпадение
      ) {
        return node;
      }

      const found = findPositionNodeById(node.subordinates, positionId, departmentId);
      if (found) return found;
    }
    return null;
  };

  // Обработчик изменения настроек отображения трех уровней
  const handleThreeLevelsChange = (value: boolean) => {
    setShowThreeLevels(value);
    // Сохраняем в localStorage
    localStorage.setItem("showThreeLevels", value ? "true" : "false");
  };

  // Обработчик изменения настроек отображения вакансий
  const handleShowVacanciesChange = (value: boolean) => {
    setShowVacancies(value);
    // Сохраняем в localStorage
    localStorage.setItem("showVacancies", value ? "true" : "false");
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    // Если данные переданы через props, используем их
    if (departmentsData.length > 0) {
      setDepartments(departmentsData);
    } else {
      // Иначе загружаем с сервера
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setDepartments(data.data);
          }
        })
        .catch((err) => console.error("Error loading departments:", err));
    }

    if (positionsData.length > 0) {
      setPositions(positionsData);
    } else {
      // Иначе загружаем с сервера
      fetch("/api/positions")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setPositions(data.data);
          }
        })
        .catch((err) => console.error("Error loading positions:", err));
    }

    if (employeesData.length > 0) {
      setEmployees(employeesData);
    } else {
      // Иначе загружаем с сервера
      fetch("/api/employees")
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setEmployees(data.data);
          }
        })
        .catch((err) => console.error("Error loading employees:", err));
    }

    // Загружаем позиции с отделами
    fetch("/api/positions/with-departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPositionsWithDepartments(data.data);
          // Для отладки
          window.positionsWithDepartmentsData = data.data;
          console.log("Пример обработанной должности:", data.data[0]);
        }
      })
      .catch((err) =>
        console.error("Error loading positions with departments:", err),
      );

    // Загружаем связи между должностями (position_position)
    fetch("/api/positionpositions")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPositionRelations(data.data);
          console.log("Данные о связях position_position:", "получено " + data.data.length + " связей");
        }
      })
      .catch((err) =>
        console.error("Error loading position relations:", err),
      );

    // Восстанавливаем настройки отображения из localStorage
    const savedShowThreeLevels = localStorage.getItem("showThreeLevels");
    if (savedShowThreeLevels !== null) {
      setShowThreeLevels(savedShowThreeLevels === "true");
    }

    const savedShowVacancies = localStorage.getItem("showVacancies");
    if (savedShowVacancies !== null) {
      setShowVacancies(savedShowVacancies === "true");
    }
  }, [departmentsData, positionsData, employeesData]);

  // Обработчик возврата к предыдущей структуре
  const handleGoBack = () => {
    // Проверяем, что есть история
    if (navigationHistory.length > 0) {
      // Берем последний элемент истории
      const prevItem = navigationHistory[navigationHistory.length - 1];
      
      // Удаляем последний элемент из истории
      setNavigationHistory(navigationHistory.slice(0, -1));
      
      // Устанавливаем предыдущую позицию
      console.log(`Возвращаемся к позиции: ID=${prevItem.positionId}, отдел=${prevItem.departmentId}`);
      
      // Восстанавливаем контекст отдела
      if (prevItem.departmentId) {
        setCurrentDepartmentContext(prevItem.departmentId);
      }
      
      // Переходим к предыдущей позиции
      setSelectedPositionId(prevItem.positionId);
      
      // Если есть внешний обработчик, вызываем его
      if (onPositionClick) {
        onPositionClick(prevItem.positionId);
      }
    } else {
      // Если история пуста, возвращаемся к корневой структуре
      setSelectedPositionId(null);
      setCurrentDepartmentContext(null);
      
      // Если есть внешний обработчик, вызываем его с 0
      if (onPositionClick) {
        onPositionClick(0);
      }
    }
  };

  // Строим иерархию должностей, когда данные загружены
  useEffect(() => {
    // Проверка всех необходимых данных
    const hasAllData =
      departments.length > 0 &&
      (positions.length > 0 || positionsWithDepartments.length > 0);

    if (!hasAllData) {
      return;
    }

    const buildPositionHierarchy = () => {
      // Создаем карту для позиций
      const positionNodes: { [key: number]: PositionHierarchyNode } = {};

      // Добавляем все позиции в карту
      positions.forEach((position) => {
        // Создаем узел для должности
        const node: PositionHierarchyNode = {
          position,
          employees: [],
          subordinates: [],
        };

        // Добавляем сотрудников для этой должности
        const positionEmployees = employees.filter(
          (e) => e.position_id === position.position_id && !e.deleted,
        );
        node.employees = positionEmployees;

        positionNodes[position.position_id] = node;
      });

      // Если есть данные из positionsWithDepartments и они отличаются от positions
      if (
        positionsWithDepartments.length > 0 &&
        positionsWithDepartments.length !== positions.length
      ) {
        // Добавляем позиции из positionsWithDepartments, которых нет в positions
        positionsWithDepartments.forEach((position) => {
          if (!positionNodes[position.position_id]) {
            const node: PositionHierarchyNode = {
              position,
              employees: [],
              subordinates: [],
            };

            // Добавляем сотрудников для этой должности
            const positionEmployees = employees.filter(
              (e) => e.position_id === position.position_id && !e.deleted,
            );
            node.employees = positionEmployees;

            positionNodes[position.position_id] = node;
          }
        });
      }

      // Устанавливаем иерархические связи на основе parent_position_id
      const rootNodes: PositionHierarchyNode[] = [];

      // Создаем корневые узлы и иерархию
      positions.forEach((position) => {
        const positionId = position.position_id;
        const node = positionNodes[positionId];

        if (!position.parent_positions || position.parent_positions.length === 0) {
          // Если нет родительских должностей, это корневой узел
          rootNodes.push(node);
        } else {
          // Если есть родительские должности, добавляем как подчиненные
          position.parent_positions.forEach((parentInfo: any) => {
            const parentId = parentInfo.position_id;
            const parentNode = positionNodes[parentId];

            if (parentNode) {
              // Добавляем только если еще не добавлено
              if (!parentNode.subordinates.some(sub => sub.position.position_id === positionId)) {
                parentNode.subordinates.push(node);
              }
            }
          });
        }
      });

      // Дополнительно обрабатываем связи position_position
      if (positionRelations.length > 0) {
        positionRelations.forEach((relation) => {
          const childId = relation.position_id;
          const parentId = relation.parent_position_id;
          const departmentId = relation.department_id;

          const childNode = positionNodes[childId];
          const parentNode = positionNodes[parentId];

          // Если оба узла существуют и связь не удалена
          if (childNode && parentNode && !relation.deleted) {
            // Если в дочернем узле есть department, проверяем совпадение
            if (departmentId) {
              // Находим соответствующий департамент
              const dept = departments.find(d => d.department_id === departmentId);
              if (dept) {
                // Создаем копию дочернего узла с привязкой к отделу
                const childNodeWithDept = {
                  ...childNode,
                  department: dept
                };

                // Если узел с таким position_id и department_id еще не добавлен
                const alreadyExists = parentNode.subordinates.some(
                  sub => sub.position.position_id === childId && 
                        sub.department?.department_id === departmentId
                );

                if (!alreadyExists) {
                  parentNode.subordinates.push(childNodeWithDept);
                }
              }
            } else {
              // Если нет department_id, просто добавляем
              const alreadyExists = parentNode.subordinates.some(
                sub => sub.position.position_id === childId
              );

              if (!alreadyExists) {
                parentNode.subordinates.push(childNode);
              }
            }
          }
        });
      }

      return rootNodes;
    };

    const hierarchy = buildPositionHierarchy();
    setPositionHierarchy(hierarchy);
  }, [departments, positions, employees, positionsWithDepartments, positionRelations]);

  // Эффект для фильтрации должностей в зависимости от выбранной должности
  useEffect(() => {
    if (!selectedPositionId || positionHierarchy.length === 0) {
      setFilteredHierarchy(positionHierarchy);
      return;
    }

    let selectedNode: PositionHierarchyNode | null = null;

    // Пытаемся определить текущий отдел для контекста
    let currentDepartmentId: number | null = null;

    // Приоритет отдаем сохраненному контексту отдела
    if (currentDepartmentContext) {
      currentDepartmentId = currentDepartmentContext;
    }
    
    // Если контекст не был найден через сохраненное значение, продолжаем поиск
    if (!currentDepartmentId) {
      // 1. Пытаемся найти сотрудника для этой должности
      let employeeForPosition;
      
      // Проверяем, есть ли в истории навигации контекст конкретного отдела
      const lastItem = navigationHistory[navigationHistory.length - 1];
      const contextDeptFromHistory = lastItem?.departmentId;
      
      if (contextDeptFromHistory) {
        // Если мы пришли из конкретного отдела, ищем сотрудника именно в этом отделе
        employeeForPosition = employees.find(
          (e) => e.position_id === selectedPositionId && 
                 e.department_id === contextDeptFromHistory && 
                 !e.deleted
        );
      }
      
      // Если сотрудник в нужном отделе не найден, используем стандартную логику
      if (!employeeForPosition) {
        employeeForPosition = employees.find(
          (e) => e.position_id === selectedPositionId && !e.deleted
        );
      }

      if (employeeForPosition && employeeForPosition.department_id) {
        // Берем департамент сотрудника
        currentDepartmentId = employeeForPosition.department_id;
        console.log(
          `Выбран департамент ${currentDepartmentId} по сотруднику ${employeeForPosition.full_name}`,
        );
      } else {
        // 2. Если сотрудника нет, ищем департамент через positionWithDepartments
        const positionWithDeptInfo = positionsWithDepartments.find(
          (p) => p.position_id === selectedPositionId,
        );

        if (positionWithDeptInfo?.departments?.length > 0) {
          // Берем первый департамент
          currentDepartmentId = positionWithDeptInfo.departments[0].department_id;
          console.log(
            `Выбран департамент ${currentDepartmentId} из списка департаментов должности`,
          );
        } else {
          // 3. Проверяем position_department связи
          const pdRelation = positionRelations.find(
            (rel) => rel.position_id === selectedPositionId && !rel.deleted,
          );

          if (pdRelation && pdRelation.department_id) {
            currentDepartmentId = pdRelation.department_id;
            console.log(
              `Выбран департамент ${currentDepartmentId} из связи в position_position`,
            );
          }
        }
      }
    }

    // После определения контекста отдела, сохраняем его в состоянии
    if (currentDepartmentId && currentDepartmentId !== currentDepartmentContext) {
      setCurrentDepartmentContext(currentDepartmentId);
    }

    console.log(
      `Для должности ${selectedPositionId} установлен департамент ${currentDepartmentId}`,
    );

    // Теперь поиск должности передает информацию о департаменте
    for (const node of positionHierarchy) {
      const found = findPositionNodeById(
        [node],
        selectedPositionId,
        currentDepartmentId,
      );
      if (found) {
        selectedNode = found;
        break;
      }
    }

    // Если должность найдена, показываем только её непосредственных подчиненных 1-го уровня
    if (selectedNode) {
      // Нам известен отдел выбранной должности
      const departmentId = currentDepartmentId;

      // Начинаем с создания копии объекта selectedNode, чтобы не менять оригинал
      const selectedNodeCopy = { ...selectedNode };

      // Обновляем список сотрудников для выбранной должности (важно для "Герц")
      if (departmentId) {
        // Фильтруем сотрудников только для текущего отдела
        const filteredEmployees = employees.filter(
          (e) =>
            e.position_id === selectedPositionId &&
            e.department_id === departmentId &&
            !e.deleted,
        );

        // Заменяем сотрудников в узле на отфильтрованных
        selectedNodeCopy.employees = filteredEmployees;

        // Также привязываем отдел к узлу
        const departmentInfo = departments.find(
          (d) => d.department_id === departmentId,
        );
        if (departmentInfo) {
          selectedNodeCopy.department = departmentInfo;
        }
      }

      // Фильтруем подчиненных с учетом отдела
      let filteredSubordinates = [...selectedNodeCopy.subordinates];

      if (departmentId) {
        // Определяем, связана ли должность с отделом (функция-помощник)
        const isPositionLinkedToDepartment = (positionId: number): boolean => {
          // 1. Проверяем связь position_position с учетом отдела
          const hasPositionRelation = positionRelations.some(
            (rel) =>
              rel.position_id === positionId &&
              rel.parent_position_id === selectedPositionId &&
              rel.department_id === departmentId &&
              !rel.deleted,
          );

          if (hasPositionRelation) return true;

          // 2. Проверяем прямую связь должности с отделом (position_department)
          const hasDepartmentLink = positionsWithDepartments
            .find((p) => p.position_id === positionId)
            ?.departments?.some((d: any) => d.department_id === departmentId);

          if (hasDepartmentLink) return true;

          // 3. Проверяем, есть ли сотрудники с этой должностью в этом отделе
          const hasEmployees = employees.some(
            (e) =>
              e.position_id === positionId &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          return hasEmployees;
        };

        // Фильтруем подчиненных, оставляя только те, которые относятся к текущему отделу
        filteredSubordinates = filteredSubordinates.filter((subNode) => {
          const subPositionId = subNode.position.position_id;
          return isPositionLinkedToDepartment(subPositionId);
        });

        // Для каждого подчиненного обновляем список сотрудников и информацию об отделе
        filteredSubordinates = filteredSubordinates.map((subNode) => {
          // Создаем копию узла
          const updatedNode = { ...subNode };

          // Обновляем список сотрудников только для этого отдела
          const deptEmployees = employees.filter(
            (e) =>
              e.position_id === subNode.position.position_id &&
              e.department_id === departmentId &&
              !e.deleted,
          );

          // Всегда заменяем список сотрудников на отфильтрованных
          // (даже если список пустой, это правильно - вакантная должность)
          updatedNode.employees = deptEmployees;

          // Добавляем привязку к отделу
          const departmentInfo = departments.find(
            (d) => d.department_id === departmentId,
          );
          if (departmentInfo) {
            updatedNode.department = departmentInfo;
          }

          // Сохраняем лог, чтобы отследить, какие подчиненные добавляются
          console.log(
            `Добавлен подчиненный ${updatedNode.position.name} (ID: ${updatedNode.position.position_id}) для отдела ${departmentId} с ${deptEmployees.length} сотрудниками`,
          );

          return updatedNode;
        });
      }

      // Показываем только выбранную должность и её отфильтрованных подчиненных
      // ВАЖНО: используем selectedNodeCopy, а не selectedNode
      // чтобы отфильтрованные сотрудники применились
      const filteredNode = {
        ...selectedNodeCopy,
        subordinates: filteredSubordinates,
      };

      console.log("Итоговое отображение:", {
        positionId: selectedPositionId,
        departmentId: currentDepartmentId,
        employeesCount: filteredNode.employees.length,
        subordinatesCount: filteredSubordinates.length,
      });

      // Показываем только выбранный узел - его отфильтрованные подчиненные видны внутри него
      setFilteredHierarchy([filteredNode]);
    } else {
      // Если должность не найдена, показываем только второй уровень иерархии
      if (positionHierarchy[0] && positionHierarchy[0].subordinates) {
        setFilteredHierarchy(positionHierarchy[0].subordinates);
      } else {
        setFilteredHierarchy([]);
      }
    }
  }, [selectedPositionId, positionHierarchy, currentDepartmentContext, positionRelations, positionsWithDepartments, employees, departments, navigationHistory]);

  // Обработчик клика по должности
  const handlePositionClick = (positionId: number, departmentContext?: number | null) => {
    console.log(`Клик по должности с ID: ${positionId}, контекст отдела: ${departmentContext || 'не указан'}`);

    // Если передан контекст отдела, сохраняем его
    if (departmentContext) {
      setCurrentDepartmentContext(departmentContext);
      console.log(`Сохранен контекст отдела: ${departmentContext}`);
    }

    // Если текущая позиция выбрана, добавляем её в историю перед переходом на новую
    if (selectedPositionId) {
      // При сохранении в историю также сохраняем текущий контекст отдела
      setNavigationHistory((prev) => [
        ...prev, 
        { 
          positionId: selectedPositionId, 
          departmentId: currentDepartmentContext 
        }
      ]);
    }

    // Обновляем ID выбранной должности
    setSelectedPositionId(positionId);

    // Если передан внешний обработчик, вызываем его
    if (onPositionClick) {
      onPositionClick(positionId);
    }
  };

  // Функция для рекурсивного присоединения дочерних отделов
  const attachAllChildDepartmentsRecursively = (node: PositionHierarchyNode) => {
    // Ничего не делаем, если у узла нет должности
    if (!node || !node.position) return;
    
    // Находим все дочерние отделы для этой должности
    const childDepartments = departments.filter(
      (dept) => dept.parent_position_id === node.position.position_id
    );
    
    // Если у должности есть подчиненные отделы
    childDepartments.forEach((department) => {
      // Создаем фиктивную должность для самого отдела
      const deptAsPosition: Position = {
        position_id: -department.department_id, // используем отрицательный ID, чтобы избежать конфликтов
        name: department.name,
        sort: 0,
        deleted: false,
        deleted_at: null,
      };
      
      // Создаем узел для отдела
      const deptNode: PositionHierarchyNode = {
        position: deptAsPosition,
        department,
        employees: [],  // у отдела как правило нет сотрудников напрямую
        subordinates: [], // дочерние должности будем добавлять дальше
      };
      
      // Добавляем должности, которые относятся к этому отделу (из position_department)
      const departmentPositions = positionsWithDepartments.filter(
        (p) => p.departments && p.departments.some((d: any) => d.department_id === department.department_id)
      );
      
      // Добавляем в дочерние узлы
      departmentPositions.forEach((depPosition) => {
        // Создаем узел для должности в отделе
        const departmentNode: PositionHierarchyNode = {
          position: depPosition,
          department,
          employees: employees.filter(
            (e) =>
              e.position_id === depPosition.position_id &&
              e.department_id === department.department_id &&
              !e.deleted
          ),
          subordinates: [],
        };
        
        // Добавляем в дочерние, если еще не добавлено
        if (!deptNode.subordinates.some((sub) => sub.position.position_id === depPosition.position_id)) {
          deptNode.subordinates.push(departmentNode);
        }
        
        // Теперь проверяем, есть ли у этого отдела дочерние отделы
        const childDepts = departments.filter(
          (childDept) => childDept.parent_department_id === department.department_id
        );
        
        childDepts.forEach((childDept) => {
          // Создаем фиктивную должность для дочернего отдела
          const childDeptAsPosition: Position = {
            position_id: -childDept.department_id,
            name: childDept.name,
            sort: 0,
            deleted: false,
            deleted_at: null,
          };
          
          // Создаем узел для дочернего отдела
          const childDeptNode: PositionHierarchyNode = {
            position: childDeptAsPosition,
            department: childDept,
            employees: [],
            subordinates: [],
          };
          
          // Добавляем дочерний отдел в дочерние узлы
          deptNode.subordinates.push(childDeptNode);
          
          // Рекурсивно обрабатываем дочерний отдел
          attachAllChildDepartmentsRecursively(childDeptNode);
        });
      });
      
      // Добавляем отдел в дочерние узлы должности
      node.subordinates.push(deptNode);
    });
    
    // Рекурсивно обрабатываем все дочерние должности
    node.subordinates.forEach((subordinate) => {
      attachAllChildDepartmentsRecursively(subordinate);
    });
  };

  console.log("departments:", departments);
  console.log("positions:", positions);
  console.log("positionsWithDepartments:", positionsWithDepartments);
  
  // Если данные еще не загружены, показываем загрузку
  if (
    departments.length === 0 ||
    (positions.length === 0 && positionsWithDepartments.length === 0)
  ) {
    return (
      <div className="loading-message">
        Загрузка организационной структуры...
        {departments.length > 0 &&
          (positions.length > 0 || positionsWithDepartments.length > 0) &&
          positionRelations.length === 0 && (
            <div>Ожидание загрузки связей между должностями...</div>
          )}
      </div>
    );
  }

  // Находим корневой отдел (без родительских отделов и позиций)
  const rootDept = departments.find(
    (d) => d.parent_department_id === null && d.parent_position_id === null,
  );

  return (
    <div className="org-tree-container">
      {/* Убрали отображение отдела Администрация */}

      {/* Отображаем иерархию должностей как горизонтальное дерево с горизонтальным скроллингом */}
      <div
        className="position-hierarchy"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <div className="organization-controls">
          {selectedPositionId && (
            <div className="position-navigation">
              <button className="back-to-main-hierarchy" onClick={handleGoBack}>
                ← Вернуться к предыдущей структуре
              </button>
            </div>
          )}

          <div className="display-settings-wrapper">
            <DisplaySettings
              showThreeLevels={showThreeLevels}
              showVacancies={showVacancies}
              onShowThreeLevelsChange={handleThreeLevelsChange}
              onShowVacanciesChange={handleShowVacanciesChange}
            />
          </div>
        </div>

        <PositionTree
          nodes={filteredHierarchy}
          allPositions={positions}
          allEmployees={employees}
          onPositionClick={handlePositionClick}
          handleGoBack={handleGoBack}
          selectedPositionId={selectedPositionId}
          hierarchyInitialLevels={Number(hierarchyInitialLevels)}
          showThreeLevels={showThreeLevels}
          showVacancies={showVacancies}
        />
      </div>
    </div>
  );
};

export default OrganizationTree;