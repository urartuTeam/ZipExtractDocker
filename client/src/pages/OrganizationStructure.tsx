import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Users, Building, User, ChevronsRight, ChevronsDown, 
  MoveVertical, AlertTriangle } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useToast } from "@/hooks/use-toast";

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

// Интерфейс для элемента сортировки
type SortTreeItem = {
  id: number;
  type: 'department' | 'position';
  type_id: number;
  parent_id: number | null;
  sort: number;
};

export default function OrganizationStructure() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expDept, setExpDept] = useState<{ [k: number]: boolean }>({});
  const [expPos, setExpPos] = useState<{ [k: string]: boolean }>({});
  const [expanded, setExpanded] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [sortItems, setSortItems] = useState<SortTreeItem[]>([]);
  const [dragMessage, setDragMessage] = useState<string | null>(null);


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

  // Получаем данные о порядке сортировки элементов
  const { data: sortTreeResponse, isLoading: lst, refetch: refetchSortTree } = useQuery<{ data: SortTreeItem[] }>({
    queryKey: ["/api/sort-tree"],
    enabled: dragEnabled || true, // Загружаем данные сортировки в любом случае
  });
  
  // Для более удобного доступа к данным
  const sortTreeR = sortTreeResponse?.data || [];
  
  // Функция для принудительного обновления данных сортировки
  const invalidateSortTree = () => {
    refetchSortTree();
    queryClient.invalidateQueries({ queryKey: ['/api/sort-tree'] });
  };

  // Мутация для обновления порядка сортировки
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: number; sort: number }[]) => {
      const response = await fetch('/api/sort-tree/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить порядок');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Порядок обновлен',
        description: 'Новый порядок элементов сохранен',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sort-tree'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить порядок элементов',
        variant: 'destructive',
      });
    },
  });

  // Мутация для создания записи сортировки
  const createSortItemMutation = useMutation({
    mutationFn: async (item: { type: 'department' | 'position'; type_id: number; parent_id: number | null; sort: number }) => {
      const response = await fetch('/api/sort-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Если ошибка 409 (конфликт), это означает, что запись уже существует
        // В этом случае не считаем это ошибкой
        if (response.status === 409) {
          return null;
        }
        throw new Error(errorData.message || 'Не удалось создать запись сортировки');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Только если был возвращен результат (не было 409 конфликта)
        queryClient.invalidateQueries({ queryKey: ['/api/sort-tree'] });
      }
    },
    onError: (error: Error) => {
      console.error('Ошибка создания записи сортировки:', error);
    },
  });

  // Обновляем локальное состояние sortItems при получении данных с сервера
  useEffect(() => {
    if (sortTreeR.length > 0) {
      setSortItems(sortTreeR);
    }
  }, [sortTreeR]);



  // Функция для включения/отключения режима перетаскивания
  const toggleDragMode = () => {
    const newDragEnabled = !dragEnabled;
    
    if (newDragEnabled) {
      // Запрашиваем данные о сортировке перед включением режима
      queryClient.invalidateQueries({ queryKey: ['/api/sort-tree'] }).then(() => {
        setDragEnabled(true);
        setDragMessage('Режим перемещения включен. Перетащите элементы, чтобы изменить их порядок.');
        
        // Сразу создаем записи сортировки для корневых отделов, если их нет
        setTimeout(() => {
          if (sortTreeR.length > 0) {
            createMissingSortRecords();
          }
        }, 100);
      });
    } else {
      setDragEnabled(false);
      setDragMessage(null);
    }
  };

  // Обработчик события завершения перетаскивания
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    console.log("DragEnd:", { 
      destination, 
      source, 
      draggableId,
      type: result.type
    });
    
    // Если нет места назначения или оно совпадает с источником, ничего не делаем
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    // Проверяем, что перетаскивание происходит внутри одного родительского контейнера
    if (destination.droppableId !== source.droppableId) {
      setDragMessage('Перемещение между разными родительскими контейнерами не поддерживается.');
      toast({
        title: 'Ошибка перемещения',
        description: 'Перемещение между разными родительскими контейнерами не поддерживается.',
        variant: 'destructive',
      });
      return;
    }
    
    let itemId: number;
    let itemType: 'department' | 'position';
    
    // Обрабатываем случай с временным ID
    if (draggableId.startsWith('temp-')) {
      const parts = draggableId.split('-');
      if (parts.length < 3) {
        console.error("Неверный формат временного ID:", draggableId);
        return;
      }
      
      itemType = parts[1] === 'pos' ? 'position' : 'department';
      itemId = parseInt(parts[2]);
      
      console.log("Получен временный ID, извлекаем данные:", { itemType, itemId });
    } else {
      // Это реальный ID записи сортировки
      const draggedItem = sortItems.find(item => item.id.toString() === draggableId);
      if (!draggedItem) {
        console.error("Не найден перетаскиваемый элемент с ID:", draggableId);
        toast({
          title: 'Ошибка перемещения',
          description: 'Не удалось найти перетаскиваемый элемент',
          variant: 'destructive',
        });
        return;
      }
      
      itemType = draggedItem.type;
      itemId = draggedItem.type_id;
    }
    
    // Определяем parentId из контекста перетаскивания
    let parentId: number | null = null;
    
    if (destination.droppableId === "root-depts") {
      parentId = null; // Корневые отделы
    } else if (destination.droppableId.startsWith("depts-")) {
      // Отделы внутри отдела, формат: "depts-{deptId}"
      parentId = parseInt(destination.droppableId.substring(6));
    } else if (destination.droppableId.startsWith("positions-")) {
      // Должности внутри отдела, формат: "positions-{deptId}"
      parentId = parseInt(destination.droppableId.substring(10));
    } else if (destination.droppableId.startsWith("childpos-")) {
      // Подчиненные должности, формат: "childpos-{posId}-{deptId}"
      const parts = destination.droppableId.split('-');
      if (parts.length >= 3) {
        parentId = parseInt(parts[2]);
      }
    } else if (destination.droppableId.startsWith("pos-depts-")) {
      // Отделы подчиненные должности, формат: "pos-depts-{posId}"
      parentId = parseInt(destination.droppableId.substring(10));
    }
    
    console.log("Определили parentId:", parentId);
    
    // Получаем или создаем запись сортировки для элемента
    // Сначала проверяем, есть ли уже запись сортировки
    let sortItemForDraggedElement = sortItems.find(item => 
      item.type === itemType && 
      item.type_id === itemId && 
      ((item.parent_id === null && parentId === null) || item.parent_id === parentId)
    );
    
    console.log("Поиск записи сортировки для элемента:", { itemType, itemId, parentId });
    
    // Если записи сортировки нет, создаем её
    if (!sortItemForDraggedElement) {
      console.log("Создаем новую запись сортировки для элемента:", { itemType, itemId, parentId });
      
      // Проверяем, существует ли уже такая запись в БД
      const exists = sortItems.some(item => 
        item.type === itemType && 
        item.type_id === itemId && 
        ((item.parent_id === null && parentId === null) || item.parent_id === parentId)
      );
      
      // Если запись не существует, создаем её
      if (!exists) {
        // Создаем новую запись сортировки
        const newSortItem = {
          type: itemType,
          type_id: itemId,
          parent_id: parentId,
          sort: 0 // Временное значение, будет обновлено ниже
        };
        
        // Вызываем API для создания записи в базе
        createSortItemMutation.mutate(newSortItem);
      }
      
      // Добавляем временную запись в local state с временным ID, даже если запись существует в БД
      // Реальный ID будет получен при следующей загрузке данных
      const tempRecord = {
        id: -1 * (sortItems.length + 1), // Отрицательное временное ID
        type: itemType,
        type_id: itemId,
        parent_id: parentId,
        sort: 0
      };
      
      // Добавляем запись во временный массив sortItems
      setSortItems([...sortItems, tempRecord]);
      
      // Используем эту запись для дальнейшей обработки
      sortItemForDraggedElement = tempRecord;
    }
    
    // Находим все элементы в том же контейнере
    const itemsInSameContainer = sortItems.filter(item => 
      item.type === itemType && 
      ((item.parent_id === null && parentId === null) || item.parent_id === parentId)
    );
    
    console.log("Элементы в том же контейнере:", itemsInSameContainer);
    
    // Переупорядочиваем индексы в этом контейнере
    // Удаляем перетаскиваемый элемент из текущей позиции
    const updatedItems = itemsInSameContainer.filter(item => 
      !(item.type === itemType && item.type_id === itemId)
    );
    
    // Создаем элемент для вставки
    const itemToInsert = sortItemForDraggedElement;
    
    // Вставляем элемент в новую позицию
    updatedItems.splice(destination.index, 0, itemToInsert);
    
    // Обновляем значения sort для всех элементов в контейнере
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      sort: index,
    }));
    
    console.log("Переупорядоченные элементы:", reorderedItems);
    
    // Обновляем общий массив с новыми значениями sort
    const finalSortItems = sortItems.map(item => {
      const reorderedItem = reorderedItems.find(ri => 
        ri.type === item.type && 
        ri.type_id === item.type_id && 
        ((ri.parent_id === null && item.parent_id === null) || ri.parent_id === item.parent_id)
      );
      return reorderedItem || item;
    });
    
    setSortItems(finalSortItems);
    
    // Отправляем обновленные значения на сервер для тех записей, которые уже существуют в БД
    const itemsToSend = reorderedItems
      .filter(item => item.id > 0) // Только те, у которых есть реальный ID
      .map(item => ({ id: item.id, sort: item.sort }));
    
    if (itemsToSend.length > 0) {
      reorderMutation.mutate(itemsToSend);
    }
    
    // После перетаскивания обновим данные сортировки с сервера
    setTimeout(() => {
      invalidateSortTree();
    }, 200);
  };
  
  if (ld || lp || le || lpd || (dragEnabled && lst)) return <div>Загрузка...</div>;

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
  
  // Проверка существования записи сортировки
  const checkSortTreeItemExists = (type: 'department' | 'position', typeId: number, parentId: number | null = null) => {
    // Проверяем, существует ли уже запись в БД
    return sortItems.some(item => 
      item.type === type && 
      item.type_id === typeId && 
      ((item.parent_id === null && parentId === null) || item.parent_id === parentId)
    );
  };
  
  // Создает недостающие записи сортировки для всех корневых элементов
  const createMissingSortRecords = () => {
    // Создаем записи для корневых отделов, которых еще нет в базе
    for (const dept of roots) {
      // Проверяем, существует ли уже запись в sortItems
      const exists = sortItems.some(item => 
        item.type === 'department' && 
        item.type_id === dept.department_id && 
        item.parent_id === null
      );
      
      if (!exists) {
        console.log(`Создаем запись сортировки для корневого отдела ${dept.department_id} - ${dept.name}`);
        createSortItemMutation.mutate({
          type: 'department',
          type_id: dept.department_id,
          parent_id: null,
          sort: dept.department_id
        });
      }
    }
  };

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
    return linked.filter(
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
    
    if (!positionDept) {
      return {
        staffUnits: 0, // Общее количество мест
        vacancies: 0,  // Количество свободных мест
        currentCount: emps.length // Текущее количество сотрудников
      };
    }
    
    // В БД поле vacancies хранит прямо количество вакансий (не общее количество мест)
    const vacancies = positionDept.vacancies || 0;
    
    // Текущее количество сотрудников - это фактическое количество сотрудников в этой должности
    const currentCount = emps.length;
    
    // Общее количество мест - это сумма вакансий и занятых мест
    const staffUnits = vacancies + currentCount;
    
    return {
      staffUnits, // Общее количество мест
      vacancies,  // Количество свободных мест
      currentCount // Текущее количество сотрудников
    };
  };

  // Функция для сортировки элементов с учетом значений из таблицы sort_tree
  const sortByCustomOrder = (items: any[], itemType: 'department' | 'position', parentId: number | null = null) => {
    if (!dragEnabled || sortItems.length === 0) {
      return items;
    }
    
    return [...items].sort((a, b) => {
      const typeIdA = itemType === 'department' ? a.department_id : a.position_id;
      const typeIdB = itemType === 'department' ? b.department_id : b.position_id;
      
      const sortItemA = sortItems.find(si => si.type === itemType && si.type_id === typeIdA && si.parent_id === parentId);
      const sortItemB = sortItems.find(si => si.type === itemType && si.type_id === typeIdB && si.parent_id === parentId);
      
      // Если оба элемента имеют записи сортировки, сравниваем их
      if (sortItemA && sortItemB) {
        return sortItemA.sort - sortItemB.sort;
      }
      
      // Если только один элемент имеет запись сортировки, он идет первым
      if (sortItemA) return -1;
      if (sortItemB) return 1;
      
      // Если ни один элемент не имеет записи сортировки, используем стандартную сортировку
      const aId = itemType === 'department' ? a.department_id : a.position_id;
      const bId = itemType === 'department' ? b.department_id : b.position_id;
      return aId - bId;
    });
  };

  const renderPos = (
    p: any, 
    deptId: number, 
    lvl = 0, 
    parentDeptId: number | null = null, 
    isDragging = false
  ) => {
    const key = `${p.position_id}-${deptId}`;
    // Если элемент явно закрыт в expPos, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expPos[key] === false ? false : (expanded || (expPos[key] ?? false));
    const emps = getEmps(p.position_id, deptId);
    const childPositions = p.children || [];
    const sortedChildPositions = sortByCustomOrder(childPositions, 'position', deptId);
    const childDepts = getChildDeptsByPosition(p.position_id);
    const sortedChildDepts = sortByCustomOrder(childDepts, 'department', p.position_id);
    
    // Получаем информацию о вакансиях для данной позиции в отделе
    const { staffUnits, vacancies, currentCount } = getPositionDepartmentInfo(p.position_id, deptId);
    
    // При перетаскивании нам нужно знать, существует ли запись сортировки
    const sortRecordExists = !dragEnabled || !parentDeptId || checkSortTreeItemExists('position', p.position_id, parentDeptId);
    
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
    
    // Определяем классы для карточки должности в зависимости от режима перетаскивания
    const posCardClasses = `relative flex items-center p-2 rounded-md ${
      dragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:bg-gray-50'
    } ${isDragging ? 'shadow-lg' : ''}`;

    // Контент элемента должности
    const posContent = (
      <div
        className={posCardClasses}
        style={{ paddingLeft: `${lvl * 16 + 8}px` }}
        onClick={dragEnabled ? undefined : () => togglePos(key)}
      >
        {ex ? (
          <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
        )}
        <Users className="h-5 w-5 mr-2 text-blue-500" />
        <span>{displayText}</span>
        
        {/* Показываем только количество вакансий в правом верхнем углу */}
        {vacancies > 0 && (
          <div className="absolute top-0 right-0 m-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
            вакансий: {vacancies}
          </div>
        )}
        
        {dragEnabled && (
          <MoveVertical className="h-4 w-4 ml-auto text-neutral-500" />
        )}
      </div>
    );
    
    const childrenContent = ex && (
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
        
        {/* Если есть дочерние должности, рендерим их через Droppable */}
        {childPositions.length > 0 ? (
          dragEnabled ? (
            <Droppable droppableId={`childpos-${p.position_id}-${deptId}`} type={`childpos-${p.position_id}-${deptId}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {sortedChildPositions.map((c: any, index) => (
                    <Draggable 
                      key={`childpos-${c.position_id}-${deptId}`} 
                      draggableId={sortItems.find(si => si.type === 'position' && si.type_id === c.position_id && si.parent_id === deptId)?.id.toString() || `temp-pos-${c.position_id}`}
                      index={index}
                      isDragDisabled={!dragEnabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderPos(c, deptId, lvl + 1, deptId, snapshot.isDragging)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            sortedChildPositions.map((c: any) => renderPos(c, deptId, lvl + 1, deptId))
          )
        ) : null}
        
        {/* Если есть дочерние отделы, рендерим их через Droppable */}
        {childDepts.length > 0 ? (
          dragEnabled ? (
            <Droppable droppableId={`pos-depts-${p.position_id}`} type={`pos-depts-${p.position_id}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mt-2"
                >
                  {sortedChildDepts.map((d, index) => (
                    <Draggable 
                      key={`dept-${d.department_id}`} 
                      draggableId={sortItems.find(si => si.type === 'department' && si.type_id === d.department_id)?.id.toString() || `temp-dept-${d.department_id}`}
                      index={index}
                      isDragDisabled={!dragEnabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          {renderDept(d, lvl + 1, p.position_id)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            sortedChildDepts.map((d) => renderDept(d, lvl + 1, p.position_id))
          )
        ) : null}
      </div>
    );
    
    return (
      <div key={key} className="mb-2">
        {posContent}
        {childrenContent}
      </div>
    );
  };

  const renderDept = (d: Department, lvl = 0, parentId: number | null = null) => {
    // Если элемент явно закрыт в expDept, то используем это значение, иначе проверяем глобальное состояние expanded
    const ex = expDept[d.department_id] === false ? false : (expanded || (expDept[d.department_id] ?? false));
    const childDepts = getChildDeptsByDept(d.department_id);
    const sortedChildDepts = sortByCustomOrder(childDepts, 'department', d.department_id);
    const deptPositions = getDeptPositions(d.department_id);
    const sortedDeptPositions = sortByCustomOrder(deptPositions, 'position', d.department_id);
    
    // При перетаскивании нам нужно знать, существует ли запись сортировки
    const sortRecordExists = !dragEnabled || checkSortTreeItemExists('department', d.department_id, parentId);
    
    // Находим ID записи сортировки для этого отдела
    const sortItem = sortItems.find(item => item.type === 'department' && item.type_id === d.department_id && item.parent_id === parentId);
    const sortItemId = sortItem?.id.toString() || `temp-dept-${d.department_id}`;
    
    // Определяем классы для карточки отдела в зависимости от режима перетаскивания
    const deptCardClasses = `relative flex items-center p-2 border border-primary/20 bg-primary/5 rounded-md ${
      dragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:bg-primary/10'
    }`;
    
    // Контент элемента отдела
    const deptContent = (isDragging = false) => (
      <div
        className={deptCardClasses + (isDragging ? ' shadow-lg' : '')}
        onClick={dragEnabled ? undefined : () => toggleDept(d.department_id)}
      >
        {ex ? (
          <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
        )}
        <Building className="h-5 w-5 mr-2 text-primary" />
        <span className="font-medium">{d.name}</span>
        <span className="ml-2 text-neutral-500 text-sm">(Отдел)</span>
        {dragEnabled && (
          <MoveVertical className="h-4 w-4 ml-auto text-neutral-500" />
        )}
      </div>
    );
    
    const childrenContent = ex && (
      <div className="ml-6 border-l-2 pl-4 py-2">
        {/* Если есть должности в отделе, рендерим их через Droppable */}
        {deptPositions.length > 0 ? (
          dragEnabled ? (
            <Droppable droppableId={`positions-${d.department_id}`} type={`positions-in-dept-${d.department_id}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {sortedDeptPositions.map((p, index) => (
                    <Draggable 
                      key={`position-${p.position_id}-${d.department_id}`} 
                      draggableId={sortItems.find(si => si.type === 'position' && si.type_id === p.position_id && si.parent_id === d.department_id)?.id.toString() || `temp-pos-${p.position_id}`}
                      index={index}
                      isDragDisabled={!dragEnabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderPos(p, d.department_id, lvl, d.department_id, snapshot.isDragging)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            sortedDeptPositions.map((p) => renderPos(p, d.department_id, lvl, d.department_id))
          )
        ) : (
          <div className="italic text-neutral-500 pl-7 mt-1">
            Нет должностей в этом отделе
          </div>
        )}
        
        {/* Если есть дочерние отделы, рендерим их через Droppable */}
        {childDepts.length > 0 ? (
          dragEnabled ? (
            <Droppable droppableId={`depts-${d.department_id}`} type={`depts-in-dept-${d.department_id}`}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mt-3"
                >
                  {sortedChildDepts.map((cd, index) => (
                    <Draggable 
                      key={`dept-${cd.department_id}`} 
                      draggableId={sortItems.find(si => si.type === 'department' && si.type_id === cd.department_id)?.id.toString() || `temp-dept-${cd.department_id}`}
                      index={index}
                      isDragDisabled={!dragEnabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          {renderDept(cd, lvl + 1, d.department_id)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            sortedChildDepts.map((cd) => renderDept(cd, lvl + 1, d.department_id))
          )
        ) : null}
      </div>
    );
    
    // Если включен режим перетаскивания, оборачиваем в Draggable
    if (dragEnabled && parentId !== null) {
      return (
        <div className="ml-4">
          {deptContent()}
          {childrenContent}
        </div>
      );
    }
    
    // В обычном режиме просто возвращаем компонент
    return (
      <div key={d.department_id} className="ml-4 mb-2">
        {deptContent()}
        {childrenContent}
      </div>
    );
  };

  // Сортируем корневые отделы, если включен режим перетаскивания
  const sortedRoots = sortByCustomOrder(roots, 'department', null);
  
  // Определяем контент для карточки
  const cardContent = (
    <>
      {/* Сообщение о режиме перетаскивания */}
      {dragMessage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-700">{dragMessage}</p>
        </div>
      )}
      
      {/* Контент с корневыми отделами */}
      {dragEnabled ? (
        <Droppable droppableId="root-depts" type="root-depts">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sortedRoots.map((r, index) => (
                <Draggable 
                  key={`root-dept-${r.department_id}`}
                  draggableId={sortItems.find(si => si.type === 'department' && si.type_id === r.department_id && si.parent_id === null)?.id.toString() || `temp-root-dept-${r.department_id}`}
                  index={index}
                  isDragDisabled={!dragEnabled}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {renderDept(r, 0, null)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        sortedRoots.map((r) => renderDept(r, 0, null))
      )}
    </>
  );
  
  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Структура организации</CardTitle>
            <CardDescription>Иерархия</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 border border-blue-500 hover:bg-blue-50" 
              onClick={toggleDragMode}
            >
              <MoveVertical className="h-4 w-4" />
              <span>{dragEnabled ? 'Выключить режим перемещения' : 'Включить режим перемещения'}</span>
            </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          {dragEnabled ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              {cardContent}
            </DragDropContext>
          ) : (
            cardContent
          )}
        </CardContent>
      </Card>
    </div>
  );
}