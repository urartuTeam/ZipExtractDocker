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
    queryKey: ["/api/pd"],
  });
  
  // Получаем данные о иерархии должностей (связи родитель-дочерний элемент)
  const { data: positionPositionsR, isLoading: lpp } = useQuery<{ 
    data: { 
      position_position_id: number;
      position_id: number;
      parent_position_id: number;
      department_id: number;
      deleted: boolean;
    }[] 
  }>({
    queryKey: ["/api/positionpositions"],
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

  // Мутация для создания или получения существующей записи сортировки
  const createSortItemMutation = useMutation({
    mutationFn: async (item: { type: 'department' | 'position'; type_id: number; parent_id: number | null; sort: number }) => {
      console.log('Вызов API для создания/получения записи сортировки:', item);
      
      const response = await fetch('/api/sort-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      const data = await response.json();
      
      // Независимо от статуса (создана новая запись или найдена существующая),
      // сервер возвращает данные в одинаковом формате
      if (data.status === 'success') {
        console.log('Успешный ответ API sort-tree:', data);
        return data;
      } else {
        console.error('Ошибка API sort-tree:', data);
        throw new Error(data.message || 'Не удалось получить запись сортировки');
      }
    },
    onSuccess: (data) => {
      // Обновляем кэш запросов после успешного создания/получения записи
      queryClient.invalidateQueries({ queryKey: ['/api/sort-tree'] });
    },
    onError: (error: Error) => {
      console.error('Ошибка создания/получения записи сортировки:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось получить запись сортировки',
        variant: 'destructive',
      });
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
    console.log(`Получаем должности для отдела ${deptId}`);
    
    // Получаем все должности, связанные с этим отделом
    // Ищем все должности, которые имеют deptId в своем массиве departments
    const linked = positions.filter((p) =>
      p.departments && Array.isArray(p.departments) && 
      p.departments.some((dd) => dd.department_id === deptId),
    );
    
    // ВАЖНО: Получаем ВСЕ связи position_position, а не только для этого отдела
    // Это критически важно для случаев, когда должности из разных отделов связаны между собой
    const allPositionRelations = positionPositionsR?.data?.filter(pp => !pp.deleted) || [];
    
    // Отфильтруем связи, где хотя бы одна из должностей (дочерняя или родительская) находится в нашем отделе
    const positionRelations = allPositionRelations.filter(rel => {
      // Проверяем, есть ли дочерняя должность в нашем отделе
      const childInThisDept = linked.some(p => p.position_id === rel.position_id);
      
      // Проверяем, есть ли родительская должность в нашем отделе
      const parentInThisDept = linked.some(p => p.position_id === rel.parent_position_id);
      
      // Включаем связь, если хотя бы одна из должностей находится в нашем отделе
      return childInThisDept || parentInThisDept;
    });
    
    console.log(`Найдено ${positionRelations.length} связей должностей для отдела ${deptId} (из ${allPositionRelations.length} всего)`);
    
    // Более подробное логирование связей
    positionRelations.forEach(rel => {
      const childPosition = positions.find(p => p.position_id === rel.position_id);
      const parentPosition = positions.find(p => p.position_id === rel.parent_position_id);
      
      console.log(`- Связь: должность "${childPosition?.name}" (ID=${rel.position_id}) подчиняется "${parentPosition?.name}" (ID=${rel.parent_position_id})`);
      
      // Проверяем, находятся ли обе должности в текущем отделе
      const childInThisDept = linked.some(p => p.position_id === rel.position_id);
      const parentInThisDept = linked.some(p => p.position_id === rel.parent_position_id);
      
      if (!childInThisDept) {
        console.log(`  ВНИМАНИЕ: Дочерняя должность "${childPosition?.name}" (ID=${rel.position_id}) НЕ НАЙДЕНА в отделе ${deptId}`);
      }
      
      if (!parentInThisDept) {
        console.log(`  ВНИМАНИЕ: Родительская должность "${parentPosition?.name}" (ID=${rel.parent_position_id}) НЕ НАЙДЕНА в отделе ${deptId}`);
      }
    });
    
    // Проверка на случай, если дочерние должности не появляются
    // Специальный случай для начальника управления (ID=24) и его подчиненных
    if (deptId === 19 || deptId === 20) {
      console.log(`Проверка подчиненных для начальника управления в отделе ${deptId}`);
      
      // Проверяем наличие начальника управления (ID=24) среди должностей
      const managerPosition = linked.find(p => p.position_id === 24);
      if (managerPosition) {
        console.log(`Найден начальник управления (ID=24) в отделе ${deptId}`);
        
        // Находим подчиненных начальника управления в таблице position_position
        const subordinates = positionRelations.filter(rel => rel.parent_position_id === 24);
        console.log(`Подчиненные начальника управления в отделе ${deptId} из position_position:`, 
          subordinates.map(rel => {
            const pos = positions.find(p => p.position_id === rel.position_id);
            return `${pos?.name || 'Неизвестная должность'} (ID: ${rel.position_id})`;
          }));
      }
    }
    
    // Логгируем для отладки
    console.log(`Все должности отдела ${deptId} до построения иерархии:`, 
      linked.map(p => `${p.name} (ID: ${p.position_id})`));
    
    // Логируем данные о связях должностей (position_position)
    console.log(`Данные о связях должностей для отдела ${deptId}:`, 
      positionRelations.map(rel => `Должность ID ${rel.position_id} подчиняется должности ID ${rel.parent_position_id}`));
    
    // Проверяем, есть ли связь для Генерального директора (ID=43) и Заместителя руководителя департамента (ID=39)
    const genDirectorRelation = positionRelations.find(rel => rel.position_id === 43 && rel.parent_position_id === 39);
    if (genDirectorRelation) {
      console.log("НАЙДЕНА СВЯЗЬ: Генеральный директор (ID=43) подчиняется Заместителю руководителя департамента (ID=39)");
    } else {
      console.log("ВАЖНО: НЕ НАЙДЕНА СВЯЗЬ между Генеральным директором и Заместителем руководителя департамента");
    }
    
    // Создаем карту всех должностей в системе для построения иерархии
    // ВАЖНО: включаем в карту даже должности не из текущего отдела
    const map: { [k: number]: any } = {};
    
    // Сначала добавляем только должности из текущего отдела
    linked.forEach((p) => {
      map[p.position_id] = { ...p, children: [], inCurrentDept: true };
      
      // Отладка: проверяем наличие ключевых должностей в карте
      if (p.position_id === 39) {
        console.log("Заместитель руководителя департамента добавлен в карту должностей");
      } else if (p.position_id === 43) {
        console.log("Генеральный директор добавлен в карту должностей");
      }
    });
    
    // Теперь добавляем в карту должности, которые могут быть родителями или детьми для должностей текущего отдела
    // Это критично для корректной работы иерархии
    positionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      // Проверяем, нужно ли добавить дочернюю должность из другого отдела
      if (!map[childId] && (linked.some(p => p.position_id === parentId))) {
        // Найдем позицию в общем списке должностей
        const childPosition = positions.find(p => p.position_id === childId);
        if (childPosition) {
          map[childId] = { ...childPosition, children: [], inCurrentDept: false };
          console.log(`Добавлена в карту внешняя дочерняя должность ${childPosition.name} (ID: ${childId})`);
        }
      }
      
      // Проверяем, нужно ли добавить родительскую должность из другого отдела
      if (!map[parentId] && (linked.some(p => p.position_id === childId))) {
        // Найдем позицию в общем списке должностей
        const parentPosition = positions.find(p => p.position_id === parentId);
        if (parentPosition) {
          map[parentId] = { ...parentPosition, children: [], inCurrentDept: false };
          console.log(`Добавлена в карту внешняя родительская должность ${parentPosition.name} (ID: ${parentId})`);
        }
      }
    });
    
    // Специальная логика для поддержки связи Генеральный директор (ID=43) -> Заместитель руководителя департамента (ID=39)
    const deputy = positions.find(p => p.position_id === 39);
    const generalDirector = positions.find(p => p.position_id === 43);
    
    // Если в отделе есть Генеральный директор, то обязательно добавим и Заместителя руководителя
    if (map[43] && !map[39] && deputy) {
      map[39] = { ...deputy, children: [], inCurrentDept: false };
      console.log(`Добавлен Заместитель руководителя департамента для поддержки иерархии Генерального директора`);
    }
    
    // Если в отделе есть Заместитель руководителя, то обязательно добавим и Генерального директора
    if (map[39] && !map[43] && generalDirector) {
      map[43] = { ...generalDirector, children: [], inCurrentDept: false };
      console.log(`Добавлен Генеральный директор для поддержки иерархии с Заместителем руководителя департамента`);
    }
    
    // Строим иерархию на основе данных position_position для всех должностей в карте
    positionRelations.forEach((relation) => {
      const childId = relation.position_id;
      const parentId = relation.parent_position_id;
      
      // Особая проверка для Генерального директора
      if (childId === 43) {
        console.log(`Обработка связи: Генеральный директор (ID=43) -> родитель ID=${parentId}`);
      }
      
      // Проверяем, что обе должности существуют в нашей карте
      if (map[childId] && map[parentId]) {
        // Добавляем дочернюю должность к родительской
        // Проверяем, что эта должность еще не добавлена как дочерняя
        if (!map[parentId].children.some((child: any) => child.position_id === childId)) {
          map[parentId].children.push(map[childId]);
          console.log(`Добавлена дочерняя должность ${map[childId].name} (ID: ${childId}) к ${map[parentId].name} (по данным position_position)`);
        }
      } else {
        // Отладка: одна из должностей не найдена
        if (!map[childId]) {
          console.log(`ОШИБКА: Дочерняя должность ID=${childId} не найдена в карте`);
        }
        if (!map[parentId]) {
          console.log(`ОШИБКА: Родительская должность ID=${parentId} не найдена в карте`);
        }
      }
    });
    
    // Специальная обработка для связи "Генеральный директор" -> "Заместитель руководителя департамента"
    if (map[43] && map[39]) {
      // Если оба существуют в карте, но Генеральный директор не в дочерних у Заместителя
      if (!map[39].children.some((child: any) => child.position_id === 43)) {
        map[39].children.push(map[43]);
        console.log(`КРИТИЧНО: Добавлена специальная связь "Генеральный директор" -> "Заместитель руководителя департамента"`);
      }
    }
    
    // Находим корневые должности из нашей расширенной карты должностей
    const isChildPosition = new Set<number>();
    
    // Добавляем в набор все ID должностей, которые являются дочерними
    Object.values(map).forEach(position => {
      position.children.forEach((child: any) => {
        isChildPosition.add(child.position_id);
      });
    });
    
    // Корневые должности - это должности, которые:
    // 1. Есть в карте
    // 2. Не являются дочерними ни для какой другой должности
    // 3. Принадлежат текущему отделу (inCurrentDept = true)
    const rootPositions = Object.values(map)
      .filter((p: any) => 
        // Должность не является дочерней
        !isChildPosition.has(p.position_id) &&
        // Должность принадлежит текущему отделу
        p.inCurrentDept === true
      );
    
    console.log(`Найдено ${rootPositions.length} корневых должностей для отдела ${deptId}:`);
    rootPositions.forEach((p: any) => {
      console.log(`- Корневая должность: "${p.name}" (ID: ${p.position_id}) с ${p.children?.length || 0} подчиненными`);
      
      // Для каждой корневой должности выводим ее дочерние должности
      if (p.children && p.children.length > 0) {
        p.children.forEach((child: any) => {
          console.log(`  - Подчиненная должность: "${child.name}" (ID: ${child.position_id}), в текущем отделе: ${child.inCurrentDept ? 'да' : 'нет'}`);
        });
      }
    });
    
    // Специальная проверка для позиций Генерального директора и Заместителя руководителя
    if (map[39] && map[43]) {
      console.log(`Проверка связи: Генеральный директор (ID=43) и Заместитель руководителя департамента (ID=39)`);
      const deputyChildren = map[39].children.map((c: any) => `${c.name} (ID: ${c.position_id})`);
      console.log(`Дочерние должности Заместителя руководителя департамента: ${deputyChildren.join(', ')}`);
      
      // Проверяем, является ли Генеральный директор дочерней должностью для Заместителя
      const genDirIsChildOfDeputy = map[39].children.some((c: any) => c.position_id === 43);
      if (genDirIsChildOfDeputy) {
        console.log("ПОДТВЕРЖДЕНО: Генеральный директор является дочерней должностью для Заместителя руководителя департамента");
      } else {
        console.log("ОШИБКА: Генеральный директор НЕ является дочерней должностью для Заместителя руководителя департамента");
      }
    }
    
    return rootPositions;
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
    // Проверяем входящие данные для отладки
    if (items.length === 0) {
      return items;
    }

    // Делаем копию для сортировки
    const itemsToSort = [...items];
    
    // Специальная обработка для иерархии должностей
    if (itemType === 'position') {
      // Логируем для отладки, если это один из проблемных отделов
      const someItemId = itemsToSort[0]?.position_id;
        
      if (parentId === 19 || parentId === 20) {
        console.log(`Сортировка должностей для отдела ${parentId}:`, 
          itemsToSort.map(p => `${p.name} (ID: ${p.position_id}, parent: ${p.parent_position_id})`));
      }
      
      // Для должностей учитываем родительско-дочерние отношения в сортировке из таблицы position_position
      // Получаем ВСЕ связи position_position (не фильтруем по department_id)
      // Это важно для корректной работы с должностями, у которых связи могут быть между разными отделами
      const positionPositions = positionPositionsR?.data?.filter(pp => !pp.deleted) || [];
      
      return itemsToSort.sort((a, b) => {
        // Проверяем, является ли b родителем a в контексте текущего отдела
        const bIsParentOfA = positionPositions.some(pp => 
          pp.position_id === a.position_id && pp.parent_position_id === b.position_id
        );
        
        // Проверяем, является ли a родителем b в контексте текущего отдела
        const aIsParentOfB = positionPositions.some(pp => 
          pp.position_id === b.position_id && pp.parent_position_id === a.position_id
        );
        
        // Если b является родителем a, то b должен быть выше
        if (bIsParentOfA) return 1;
        // Если a является родителем b, то a должен быть выше
        if (aIsParentOfB) return -1;
        
        // Если у элементов нет родительско-дочерних отношений, используем sort_tree
        const sortItemA = sortItems.find(si => 
          si.type === itemType && 
          si.type_id === a.position_id && 
          (si.parent_id === parentId || (si.parent_id === null && parentId === null))
        );
        
        const sortItemB = sortItems.find(si => 
          si.type === itemType && 
          si.type_id === b.position_id && 
          (si.parent_id === parentId || (si.parent_id === null && parentId === null))
        );
        
        // Если у обоих есть записи сортировки, используем их
        if (sortItemA && sortItemB) {
          return sortItemA.sort - sortItemB.sort;
        }
        
        // Если только у одного есть запись сортировки, он идет первым
        if (sortItemA) return -1;
        if (sortItemB) return 1;
        
        // Если ни у одного нет записи сортировки, используем ID
        return a.position_id - b.position_id;
      });
    }
    
    // Сортировка для отделов
    return itemsToSort.sort((a, b) => {
      const typeIdA = a.department_id;
      const typeIdB = b.department_id;
      
      const sortItemA = sortItems.find(si => 
        si.type === 'department' && 
        si.type_id === typeIdA && 
        (si.parent_id === parentId || (si.parent_id === null && parentId === null))
      );
      
      const sortItemB = sortItems.find(si => 
        si.type === 'department' && 
        si.type_id === typeIdB && 
        (si.parent_id === parentId || (si.parent_id === null && parentId === null))
      );
      
      // Если у обоих есть записи сортировки, используем их
      if (sortItemA && sortItemB) {
        return sortItemA.sort - sortItemB.sort;
      }
      
      // Если только у одного есть запись сортировки, он идет первым
      if (sortItemA) return -1;
      if (sortItemB) return 1;
      
      // Если ни у одного нет записи сортировки, используем ID
      return typeIdA - typeIdB;
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
    // Получаем дочерние должности и детально логируем их для отладки
    const childPositions = p.children || [];
    
    // Отладка для проблемных позиций
    if (p.position_id === 21 || p.position_id === 22) { // Проверим id начальников управления
      console.log(`Дочерние должности для "${p.name}" (ID: ${p.position_id}):`, 
        childPositions.map((c: any) => `${c.name} (ID: ${c.position_id})`));
    }
    
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
    
    // Определяем классы для карточки должности в зависимости от режима перетаскивания
    const posCardClasses = `relative flex items-center p-2 rounded-md ${
      dragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:bg-gray-50'
    } ${isDragging ? 'shadow-lg' : ''}`;

    // Контент элемента должности
    const posContent = (
        <div
            className={posCardClasses}

            onClick={dragEnabled ? undefined : () => togglePos(key)}
        >
          {ex ? (
              <ChevronDown className="h-4 w-4 mr-2 text-neutral-500"/>
          ) : (
              <ChevronRight className="h-4 w-4 mr-2 text-neutral-500"/>
          )}
          {vacancies > 1 ? (
              <Users className="h-5 w-5 mr-2 text-blue-500"/>
          ) : vacancies === 1 ? (
              <User className="h-4 w-4 mr-1 text-green-600"/>
          ) : null}
          <span>
            {emps.length === 0 ? (
                <>
                  {p.name}
                  <span className="ml-2 text-neutral-500 text-sm">(Вакантная)</span>
                </>
            ) : hasMultipleEmployees ? (
                p.name
            ) : (
                <>
                  {p.name} (<User className="h-4 w-4 mr-1 inline text-green-600"/>{emps[0].full_name})
                </>
            )}
          </span>


          {vacancies - currentCount > 0 && (
              <div
                  className="absolute top-0 right-0 m-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                вакансий: {vacancies - currentCount}
              </div>
          )}

          {dragEnabled && (
              <MoveVertical className="h-4 w-4 ml-auto text-neutral-500"/>
          )}
        </div>
    );
    // staffUnits, vacancies, currentCount
    const childrenContent = ex && (
        <div className="ml-6 border-l-2 pl-2 mt-1">
          {/* Если несколько сотрудников, отображаем их как дочерние элементы */}
          {hasMultipleEmployees && (
              <div className="mb-2">
                <div className="border-l-gray-200 ml-1">
              {emps.map(emp => (
                <div 
                  key={emp.employee_id} 
                  className="flex items-center p-1 pl-2 hover:bg-gray-50 rounded-r"
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
    
    // Получаем и сортируем дочерние элементы
    const childDepts = getChildDeptsByDept(d.department_id);
    // Всегда применяем сортировку вне зависимости от режима перетаскивания
    const sortedChildDepts = sortByCustomOrder(childDepts, 'department', d.department_id);
    
    const deptPositions = getDeptPositions(d.department_id);
    // Всегда применяем сортировку вне зависимости от режима перетаскивания
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
      <div className="ml-6 border-l-2 pl-2 py-2">
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
          <div className="italic text-neutral-500 pl-4 mt-1">
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