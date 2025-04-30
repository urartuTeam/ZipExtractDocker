import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronDown, Users, UserCircle, Building, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted: boolean;
  deleted_at: string | null;
}

type Position = {
  position_id: number;
  name: string;
  department_id: number;
  staff_units: number;
  current_count: number;
  vacancies: number;
  parent_position_id: number | null;
  sort?: number;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  manager_id: number | null;
  department_id: number;
  email?: string;
  phone?: string;
}

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  sort: number;
}

export default function OrganizationStructure() {
  const { toast } = useToast();
  const [expandedDepartments, setExpandedDepartments] = useState<{[key: number]: boolean}>({});
  const [expandedPositions, setExpandedPositions] = useState<{[key: string]: boolean}>({});
  
  // СТРОГО ФИКСИРУЕМ 1 УРОВЕНЬ
  const initialLevels = 1;
  
  // ПРИНУДИТЕЛЬНО ВЫВОДИМ В КОНСОЛЬ
  console.log('!!! ПРИНУДИТЕЛЬНОЕ ЗНАЧЕНИЕ initialLevels = 1 !!!');
  // ВСЕ ПРЕЖНИЕ ХУКИ ЗАКОММЕНТИРОВАНЫ
  // const [initialLevels, setInitialLevels] = useState<number>(1);
  
  // Тип для настроек
  type Setting = {
    id: number;
    data_key: string;
    data_value: string;
    created_at: string;
    updated_at: string;
  }
  
  // НАСТРОЙКИ УБРАНЫ
  // useEffect(() => { ... });
  
  // Дополнительный эффект для отслеживания изменения initialLevels
  // Дополнительные хуки отключены
  console.log('*** ПРИНУДИТЕЛЬНОЕ СТАТИЧНОЕ ЗНАЧЕНИЕ initialLevels:', initialLevels, '***');
  
  // Имитируем React Query для совместимости с остальным кодом
  const settingsResponse = { status: 'success', data: [] };
  const isLoadingSettings = false;
  const settingsError = null;
  
  // Получаем данные отделов
  const { 
    data: departmentsResponse, 
    isLoading: isLoadingDepartments, 
    error: departmentsError 
  } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  
  // Получаем данные должностей
  const { 
    data: positionsResponse, 
    isLoading: isLoadingPositions, 
    error: positionsError 
  } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  
  // Получаем данные сотрудников
  const { 
    data: employeesResponse, 
    isLoading: isLoadingEmployees, 
    error: employeesError 
  } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  
  // Получаем данные о связях должностей и отделов
  const { 
    data: positionDepartmentsResponse, 
    isLoading: isLoadingPositionDepartments, 
    error: positionDepartmentsError 
  } = useQuery<{status: string, data: PositionDepartment[]}>({
    queryKey: ['/api/positiondepartments'],
  });
  
  // Получаем данные о должностях с отделами (улучшенный API endpoint)
  const {
    data: positionsWithDepartmentsResponse,
    isLoading: isLoadingPositionsWithDepartments,
    error: positionsWithDepartmentsError
  } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positions/with-departments'],
  });
  
  // Извлекаем данные из API-ответов
  const departments = departmentsResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const positionDepartments = positionDepartmentsResponse?.data || [];
  const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
  
  // Получаем настройки, учитывая структуру ответа API
  const settings = Array.isArray(settingsResponse?.data) ? settingsResponse.data : [];
  


  // ВСЕ ХУКИ С НАСТРОЙКАМИ ОТКЛЮЧЕНЫ
  
  const isLoading = isLoadingDepartments || isLoadingPositions || isLoadingEmployees || 
                    isLoadingPositionDepartments || isLoadingPositionsWithDepartments || isLoadingSettings;
  const error = departmentsError || positionsError || employeesError || 
                positionDepartmentsError || positionsWithDepartmentsError || settingsError;
  
  const toggleDepartment = (departmentId: number) => {
    console.log(`Переключение отображения отдела ID:${departmentId}`);
    setExpandedDepartments(prev => ({
      ...prev,
      [departmentId]: !prev[departmentId]
    }));
  };
  
  const togglePosition = (positionDepartmentKey: string) => {
    setExpandedPositions(prev => ({
      ...prev,
      [positionDepartmentKey]: !prev[positionDepartmentKey]
    }));
  };
  
  // Определяем, является ли отдел корневым (не имеет вышестоящего отдела или должности)
  const isRootDepartment = (dept: Department) => {
    // Отдел является корневым, если у него нет parent_department_id
    // ИЛИ нет parent_position_id (для случая с Начальником управления - позиция не привязана к отделу)
    return dept.parent_department_id === null && dept.parent_position_id === null;
  };

  // Получаем корневые отделы (определяются по отсутствию родительских связей)
  const getRootDepartments = () => {
    console.log('Все отделы:', departments);
    console.log('ВНИМАНИЕ! ТЕКУЩЕЕ ЗНАЧЕНИЕ initialLevels:', initialLevels);
    
    // Корневыми являются отделы, у которых нет parent_department_id и parent_position_id
    const rootDepts = departments?.filter(dept => 
      dept.parent_department_id === null && dept.parent_position_id === null && !dept.deleted
    ) || [];
    
    console.log('Корневые отделы:', rootDepts);
    return rootDepts;
  };
  
  // Получаем дочерние отделы для указанного отдела по parent_position_id в отделе
  const getChildDepartmentsByParentId = (parentId: number) => {
    console.log(`Получаем дочерние отделы для ID:${parentId}`);
    
    // Находим все позиции в данном отделе
    const departmentPositions = positions.filter(pos => pos.department_id === parentId);
    console.log(`Позиции в отделе ID:${parentId}:`, departmentPositions.map(p => p.position_id));
    
    // Находим отделы, которые подчиняются этим позициям через parent_position_id
    const childDepartments = departments.filter(dept => 
      departmentPositions.some(pos => dept.parent_position_id === pos.position_id)
    );
    
    console.log(`Дочерние отделы для отдела ID:${parentId} через parent_position_id:`, 
      childDepartments.map(d => `${d.name} (ID: ${d.department_id}, Parent Position: ${d.parent_position_id})`));
    
    return childDepartments;
  };
  
  // Получаем дочерние отделы для указанного отдела
  const getChildDepartments = (parentId: number) => {
    // В нашей базе данных отделы имеют связь через parent_department_id
    // Находим все должности, связанные с указанным отделом
    const linkedPositions = positionsWithDepartments.filter(pos => 
      pos.departments && 
      Array.isArray(pos.departments) && 
      pos.departments.some((d: any) => d.department_id === parentId)
    ).map(pos => pos.position_id);
    
    console.log(`Должности отдела ID:${parentId}:`, linkedPositions);
    
    // Теперь находим отделы, у которых parent_department_id равен указанному parentId
    const childDepts = departments?.filter(dept => 
      dept.parent_department_id === parentId
    ) || [];
    
    console.log(`Дочерние отделы для ID:${parentId}:`, childDepts);
    
    return childDepts;
  };
  
  // Получаем должности для указанного отдела в правильной иерархии
  const getPositionsForDepartment = (departmentId: number) => {
    console.log(`Получение должностей для отдела ID:${departmentId}, имеем ${positionsWithDepartments.length} записей`);
    
    // Получаем все связанные должности
    let departmentPositions: any[] = [];
    
    if (positionsWithDepartments.length > 0) {
      // Фильтруем должности, у которых в массиве departments есть нужный department_id
      const allLinkedPositions = positionsWithDepartments.filter(pos => 
        pos.departments && 
        Array.isArray(pos.departments) && 
        pos.departments.some((d: any) => d.department_id === departmentId)
      );
      
      console.log(`Найдено ${allLinkedPositions.length} должностей, связанных с отделом ID:${departmentId}`);
      
      // Преобразуем позиции в формат для отображения
      departmentPositions = allLinkedPositions.map(position => {
        const deptLink = position.departments.find((d: any) => d.department_id === departmentId);
        return {
          position_link_id: deptLink?.position_link_id || 0,
          position_id: position.position_id,
          department_id: departmentId,
          positionName: position.name,
          parent_position_id: position.parent_position_id,
          isRoot: position.parent_position_id === null
        };
      });
    } else {
      console.log('Используем резервную логику для получения должностей');
      // Резервная логика
      const positionLinks = positionDepartments?.filter(pd => pd.department_id === departmentId) || [];
      
      departmentPositions = positionLinks.map(link => {
        const position = positions?.find(p => p.position_id === link.position_id);
        return {
          ...link,
          positionName: position?.name || 'Неизвестная должность',
          parent_position_id: position?.parent_position_id,
          isRoot: position?.parent_position_id === null
        };
      });
    }
    
    // Создаем иерархическую структуру: вначале корневые должности, а затем их потомки
    // Находим корневые должности (parent_position_id === null)
    const rootPositions = departmentPositions.filter(pos => pos.isRoot);
    
    // Находим должности, родительские которых не входят в этот отдел
    // Они также считаются корневыми для отображения
    const otherRootPositions = departmentPositions.filter(pos => 
      !pos.isRoot && 
      !departmentPositions.some(parent => parent.position_id === pos.parent_position_id)
    );
    
    // Объединяем все корневые должности
    const allRootPositions = [...rootPositions, ...otherRootPositions];
    
    // Создаем результат: сначала корневые должности, затем все остальные
    const result = [
      ...allRootPositions,
      ...departmentPositions.filter(pos => 
        !allRootPositions.some(root => root.position_id === pos.position_id)
      )
    ];
    
    console.log(`Иерархия должностей для отдела ID:${departmentId}:`, 
      result.map(p => `${p.positionName} (ID: ${p.position_id}, Parent: ${p.parent_position_id})`));
    
    return result;
  };
  
  // Получаем сотрудников для указанной должности в указанном отделе
  const getEmployeesForPositionInDepartment = (positionId: number, departmentId: number) => {
    return employees?.filter(emp => 
      emp.position_id === positionId && emp.department_id === departmentId
    ) || [];
  };
  
  // Функция для построения дерева должностей
  const buildPositionTree = (positions: any[]) => {
    // Индексируем должности по ID для быстрого доступа
    const positionMap = positions.reduce((map, pos) => {
      map[pos.position_id] = { ...pos, children: [] };
      return map;
    }, {} as Record<number, any>);
    
    // Корневые должности
    const rootPositions: any[] = [];
    
    // Строим дерево должностей на основе parent_position_id
    positions.forEach(pos => {
      if (pos.parent_position_id === null) {
        // Корневые должности не имеют родителя
        rootPositions.push(positionMap[pos.position_id]);
      } else if (positionMap[pos.parent_position_id]) {
        // Добавляем должность как дочернюю к родительской
        positionMap[pos.parent_position_id].children.push(positionMap[pos.position_id]);
      } else {
        // Если родительская должность не найдена, добавляем как корневую
        rootPositions.push(positionMap[pos.position_id]);
      }
    });
    
    return { rootPositions, positionMap };
  };

  // Функция для рендеринга должности и ее подчиненных
  const renderPosition = (position: any, departmentId: number, level: number = 0) => {
    const positionDeptKey = `${position.position_id}-${departmentId}`;
    const isPositionExpanded = expandedPositions[positionDeptKey] || false;
    const positionEmployees = getEmployeesForPositionInDepartment(position.position_id, departmentId);
    
    // Находим подчиненные отделы для этой должности
    // Теперь мы используем связь через должность-отдел
    const positionChildDepartments = departments?.filter(dept => 
      dept.parent_department_id === departmentId && 
      employees.some(emp => emp.position_id === position.position_id && emp.employee_id === dept.parent_department_id)
    ) || [];
    
    return (
      <div key={positionDeptKey} className="mb-2">
        <div 
          className="flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md"
          onClick={() => togglePosition(positionDeptKey)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {isPositionExpanded ? 
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          }
          <Users className="h-5 w-5 mr-2 text-blue-500" />
          <span>
            {position.positionName}
            {positionEmployees.length > 0 && (
              <span className="text-neutral-600 ml-1">
                ({positionEmployees[0].full_name})
              </span>
            )}
            {positionEmployees.length === 0 && (
              <span className="text-amber-500 ml-1">(Вакантная)</span>
            )}
          </span>
        </div>
        
        {isPositionExpanded && (
          <div className="ml-6 border-l-2 border-neutral-200 pl-4 py-2">
            {/* Подчиненные отделы сотрудника */}
            {positionChildDepartments.length > 0 && (
              <div className="ml-0 border-l-2 border-neutral-200 pl-4 py-2">
                <div className="font-medium mb-2 pl-2">Подчиненные отделы:</div>
                {positionChildDepartments.map(childDept => renderDepartment(childDept, level + 1))}
              </div>
            )}
            
            {/* Подчиненные должности */}
            {position.children && position.children.length > 0 && (
              <div className="mt-2">
                {position.children.map((child: any) => renderPosition(child, departmentId, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Рендер отдела и его содержимого
  const renderDepartment = (department: Department, level: number = 0) => {
    console.log(`РЕНДЕР ОТДЕЛА ${department.name} (ID:${department.department_id}) на уровне ${level}, initialLevels=${initialLevels}`);
    
    // Автоматическое расширение отделов до уровня initialLevels
    let isExpanded = expandedDepartments[department.department_id] || false;
    
    // Принудительно показываем первые initialLevels уровней
    if (level < initialLevels) {
      console.log(`ПРИНУДИТЕЛЬНО РАСШИРЯЕМ ОТДЕЛ ${department.name} (уровень ${level} < ${initialLevels})`);
      isExpanded = true;
    }
    
    const childDepartments = getChildDepartments(department.department_id);
    console.log(`Отдел: ${department.name} (ID: ${department.department_id}), дочерние отделы: ${childDepartments.length}`);
    
    // Получаем все должности для отдела и строим дерево должностей
    const positions = getPositionsForDepartment(department.department_id);
    const { rootPositions, positionMap } = buildPositionTree(positions);
    
    return (
      <div key={department.department_id} className="ml-4">
        <div 
          className="flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md"
          onClick={() => toggleDepartment(department.department_id)}
        >
          {isExpanded ? 
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          }
          <Building className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{department.name}</span>
        </div>
        
        {isExpanded && (
          <div className="ml-6 border-l-2 border-neutral-200 pl-4 py-2">
            {/* Должности в отделе как иерархическое дерево */}
            {rootPositions.length > 0 ? (
              rootPositions.map(position => renderPosition(position, department.department_id))
            ) : (
              <div className="text-neutral-500 italic pl-7">Нет должностей в этом отделе</div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка загрузки данных</CardTitle>
            <CardDescription>
              Не удалось загрузить структуру организации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              {(error as Error).message || 'Пожалуйста, попробуйте позже'}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Попробовать снова
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const rootDepartments = getRootDepartments();
  
  // Получаем все дочерние отделы, включая отделы, подчиняющиеся должностям в данном отделе
  const getAllChildDepartments = (parentDepartmentId: number) => {
    // Получаем прямых дочерних отделов по parent_department_id
    const directChildDeps = departments?.filter(
      dept => dept.parent_department_id === parentDepartmentId
    ) || [];
    
    // Получаем должность "Начальник управления" из отдела "Администрация"
    const managerPosition = positions.find(pos => 
      pos.name === "Начальник управления" && pos.department_id === parentDepartmentId
    );
    
    if (!managerPosition) {
      return directChildDeps;
    }
    
    // Получаем отделы, которые подчиняются этой должности через parent_position_id
    const positionChildDeps = departments.filter(dept => 
      dept.parent_position_id === managerPosition.position_id
    );
    
    console.log(`Дочерние отделы для отдела ${parentDepartmentId} через должность ${managerPosition.position_id}:`, 
      positionChildDeps.map(d => `${d.name} (ID: ${d.department_id})`));
    
    // Объединяем все дочерние отделы
    return [...directChildDeps, ...positionChildDeps];
  };
  
  // Рекурсивно рендерит отделы и их дочерние отделы
  const renderDepartmentTree = (department: Department, level: number = 0) => {
    // Отображаем сам отдел
    const renderedDepartment = renderDepartment(department, level);
    
    // Получаем все дочерние отделы (как по parent_department_id, так и по parent_position_id)
    const childDepartments = getAllChildDepartments(department.department_id);
    
    // Показываем дочерние элементы согласно настройке initialLevels
    // Меняем условие: level < 0 означает, что автоматически не раскрываем вообще ничего
    // Так как initialLevels = 1, то 1-1 = 0, и для уровня 0 это условие даст false
    const shouldShowChildren = level < initialLevels - 1 || expandedDepartments[department.department_id];
    
    console.log(`Отдел ${department.name} (уровень ${level}): показывать дочерние = ${shouldShowChildren}, hardcoded = 1, initialLevels = ${initialLevels}, condition = ${level < initialLevels - 1}`);
    
    if (childDepartments.length === 0) {
      return renderedDepartment;
    }
    
    // Если есть дочерние отделы, добавляем их под данным отделом, но только если:
    // 1. Уровень вложенности меньше initialLevels - 1 (авто-раскрыто)
    // 2. Или этот отдел явно раскрыт пользователем
    return (
      <React.Fragment key={`dept-tree-${department.department_id}`}>
        {renderedDepartment}
        {shouldShowChildren && (
          <div className="ml-8">
            {childDepartments.map(childDept => {
              console.log(`Рендерим дочерний отдел: ${childDept.name} (ID: ${childDept.department_id}), родительский уровень: ${level}`);
              return renderDepartmentTree(childDept, level + 1);
            })}
          </div>
        )}
      </React.Fragment>
    );
  };
  
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Структура организации</CardTitle>
          <CardDescription>
            Иерархическая структура отделов, должностей и сотрудников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rootDepartments.length > 0 ? (
            rootDepartments.map(department => renderDepartmentTree(department))
          ) : (
            <div className="text-center py-6 text-neutral-500">
              <Building className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>Нет доступных данных о структуре организации</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}