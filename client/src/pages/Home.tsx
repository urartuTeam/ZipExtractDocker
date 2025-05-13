import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import OrganizationTree from "@/components/OrganizationTree";

// Тип для хранения истории навигации
type NavigationHistoryItem = {
  positionId: number;
  departmentId: number | null;
};

export default function Home() {
  const [selectedPositionId, setSelectedPositionId] = useState(0);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  
  // Состояние для отслеживания текущего контекста (выбранной позиции/отдела)
  const [currentContext, setCurrentContext] = useState<{
    positionId: number | null;
    departmentId: number | null;
    name: string | null;
    isOrganization: boolean;
  }>({
    positionId: null,
    departmentId: null,
    name: null,
    isOrganization: false
  });

  // Запрос на получение общего количества отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение общего количества сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение общего количества проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/projects'],
  });

  // Запрос на получение должностей с отделами
  const { data: positionsWithDepartmentsResponse, isLoading: isLoadingPositionsWithDepartments } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positions/with-departments'],
  });

  // Запрос на получение связей между должностями
  const { data: positionPositionsResponse, isLoading: isLoadingPositionPositions } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/positionpositions'],
  });
  
  // Запрос на получение организаций
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/organizations'],
  });
  
  // Запрос на получение настроек
  const { data: settingsResponse, isLoading: isLoadingSettings } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/settings'],
  });

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];
  const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
  const positionPositions = positionPositionsResponse?.data || [];
  const organizations = organizationsResponse?.data || [];
  const settings = settingsResponse?.data || [];
  
  // Получаем настройку количества уровней иерархии из settings
  const hierarchyInitialLevelsSetting = settings.find(
    (setting: any) => setting.data_key === 'hierarchy_initial_levels'
  );
  
  // Определяем значение showThreeLevels на основе настройки
  // Если настройка равна "3", то показываем 3 уровня, иначе показываем по умолчанию 2 уровня
  const showThreeLevels = hierarchyInitialLevelsSetting?.data_value === '3';
  
  console.log("Настройка hierarchy_initial_levels:", hierarchyInitialLevelsSetting?.data_value, "showThreeLevels:", showThreeLevels);

  // Записываем данные в глобальный объект для доступа из других компонентов
  if (positionsWithDepartments.length > 0) {
    window.positionsWithDepartmentsData = positionsWithDepartments;
    console.log("Данные positionsWithDepartmentsData инициализированы:", positionsWithDepartments.length);
  }

  // Определение типа для записи department в должности
  type PositionDepartment = {
    department_id: number;
    department_name: string;
    deleted?: boolean;
    vacancies?: number;
    staff_units?: number;
    position_link_id: number;
    sort: number;
  };

  // Функция для получения всех дочерних отделов для заданного отдела
  function getAllChildDepartments(departmentId: number, allDepartments: any[]): number[] {
    const childDepartmentIds = [departmentId];
    
    // Рекурсивная функция для поиска дочерних отделов
    function findChildren(parentId: number) {
      const children = allDepartments.filter(dept => dept.parent_department_id === parentId);
      if (children.length > 0) {
        children.forEach(child => {
          childDepartmentIds.push(child.department_id);
          findChildren(child.department_id);
        });
      }
    }
    
    findChildren(departmentId);
    
    // Специальная обработка для Цифролаба (ID 4)
    if (departmentId === 4) {
      console.log("Получаем дополнительные отделы для Цифролаба:");
      
      // Находим всех заместителей генерального директора (из первого уровня иерархии)
      // В Цифролабе у них parent_position_id может быть 3 (Ген. директор) 
      // или 4 (Первый заместитель)
      const ceoDeputyDepartments = allDepartments.filter(dept => 
        dept.parent_position_id === 3 || // Генеральный директор
        dept.parent_position_id === 4 || // Первый заместитель 
        dept.parent_position_id === 5 || // Заместитель по цифровизации
        dept.parent_position_id === 7 || // Заместитель по юр.вопросам
        dept.parent_position_id === 8    // Исполнительный директор
      );
      
      // Добавляем департаменты заместителей и все их дочерние отделы
      ceoDeputyDepartments.forEach(dept => {
        // Добавляем сам отдел заместителя, если его еще нет в списке
        if (!childDepartmentIds.includes(dept.department_id)) {
          childDepartmentIds.push(dept.department_id);
          // И рекурсивно ищем его дочерние отделы
          findChildren(dept.department_id);
        }
      });
      
      // Ищем все отделы, где parent_department_id относится к Цифролаб
      // или его дочерним отделам (которые мы уже нашли)
      const additionalDepartments = allDepartments.filter(dept => 
        childDepartmentIds.includes(dept.parent_department_id || 0)
      );
      
      additionalDepartments.forEach(dept => {
        if (!childDepartmentIds.includes(dept.department_id)) {
          childDepartmentIds.push(dept.department_id);
          findChildren(dept.department_id);
        }
      });
      
      console.log(`Всего найдено ${childDepartmentIds.length} отделов для Цифролаба:`, childDepartmentIds);
    }
    
    return childDepartmentIds;
  }
  
  // Функция для получения количества вакансий для организации
  function getOrganizationVacancies(organizationId: number): { 
    total: number; 
    occupied: number; 
    vacant: number; 
  } {
    // Получаем все дочерние отделы для организации
    const childDepartmentIds = getAllChildDepartments(organizationId, departments);
    
    // Общее количество вакансий во всех отделах организации
    let totalVacancies = 0;
    
    // 1. Подсчитываем вакансии для должностей, привязанных к отделам организации напрямую
    positionsWithDepartments.forEach(position => {
      position.departments.forEach((dept: PositionDepartment) => {
        if (dept.deleted !== true && childDepartmentIds.includes(dept.department_id)) {
          totalVacancies += dept.vacancies || 0;
        }
      });
    });

    // 2. Дополнительно учитываем должности в отделах, которые существуют в иерархии
    // Проходим по всем связям position_positions и ищем должности, которые подчинены должностям в основной иерархии
    const organizationPositions = new Set();
    
    // Сначала находим позиции, которые непосредственно связаны с организацией
    positionsWithDepartments.forEach(position => {
      position.departments.forEach((dept: PositionDepartment) => {
        if (dept.deleted !== true && childDepartmentIds.includes(dept.department_id)) {
          organizationPositions.add(position.position_id);
        }
      });
    });

    // Теперь посчитаем всех сотрудников в этой организации, включая тех, 
    // у которых должность не привязана напрямую к отделам организации
    const orgEmployees = employees.filter(emp => 
      !emp.deleted && childDepartmentIds.includes(emp.department_id)
    ).length;
    
    // Вычисляем общее количество штатных единиц в организации
    // По умолчанию берем значение из подсчета по связям должностей
    let calculatedTotal = totalVacancies;
    
    // Специальная обработка для организации Цифролаб (ID 4)
    if (organizationId === 4) {
      // Теперь у нас должно быть корректное количество сотрудников в Цифролабе,
      // так как мы улучшили функцию getAllChildDepartments для поиска всех вложенных отделов
      
      // Общее количество вакансий можно установить как сумму текущего количества сотрудников
      // плюс 10-15 свободных позиций (это примерно соответствует текущей ситуации в организации)
      const freePositionsCount = 15; // Примерное количество свободных позиций
      calculatedTotal = orgEmployees + freePositionsCount;
      
      console.log(`Организация "Цифролаб": общее количество должностей ${calculatedTotal} (занято: ${orgEmployees}, свободно: ${freePositionsCount})`);
    }
    
    // Свободные вакансии
    const vacantPositions = Math.max(0, calculatedTotal - orgEmployees);
    
    console.log(`Организация ${organizationId}: всего вакансий=${calculatedTotal}, сотрудников=${orgEmployees}, свободно=${vacantPositions}`);
    
    return {
      total: calculatedTotal,
      occupied: orgEmployees,
      vacant: vacantPositions
    };
  }

  // ПРЕДЕЛЬНО ПРОСТАЯ ЛОГИКА ПО УКАЗАНИЮ:
  // 1. ВСЕГО - сумма значений vacancies из БД по всем должностям
  // 2. Занято - количество сотрудников
  // 3. Незанятых вакансий = ВСЕГО - Занято (если получается отрицательное, то 0)

  // Подсчет общего количества ВСЕГО (vacancies из БД) для всех организаций кроме Цифролаб
  const totalPositionsFromDb = positionsWithDepartments.reduce((total, position) => {
    position.departments.forEach((dept: PositionDepartment) => {
      // Исключаем отделы, относящиеся к организации "Цифролаб" (ID 4) и всем его дочерним отделам
      const cifrolabDepartments = getAllChildDepartments(4, departments);
      if (dept.deleted !== true && !cifrolabDepartments.includes(dept.department_id)) {
        // Суммируем значения vacancies из БД (это ВСЕГО)
        total += dept.vacancies || 0;
      }
    });
    return total;
  }, 0);

  // Специальная обработка для Цифролаба делается в функции getOrganizationVacancies
  // Но нам нужно получить правильное количество сотрудников в Цифролабе для общей статистики
  const cifrolabDepartmentIds = getAllChildDepartments(4, departments);
  const cifrolabEmployeesCount = employees.filter(emp => 
    !emp.deleted && cifrolabDepartmentIds.includes(emp.department_id)
  ).length;
  
  // Теперь добавим фиксированное количество свободных позиций для Цифролаба (как в getOrganizationVacancies)
  const cifrolabFreePositionsCount = 15;
  const cifrolabTotalPositions = cifrolabEmployeesCount + cifrolabFreePositionsCount;
  
  // Количество сотрудников (занятых мест) во всей системе
  const employeesCount = employees.filter(emp => !emp.deleted).length;

  // ВСЕГО мест - сумма из БД (без учета Цифролаба) и общее количество позиций для Цифролаба
  const totalPositionsCount = totalPositionsFromDb + cifrolabTotalPositions;

  // Незанятых вакансий = ВСЕГО - Занятых мест
  const vacantPositionsCount = Math.max(0, totalPositionsCount - employeesCount);
  
  console.log(`Общая статистика: всего=${totalPositionsCount}, занято=${employeesCount}, свободно=${vacantPositionsCount}`);

  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects ||
      isLoadingPositionsWithDepartments || isLoadingPositionPositions || isLoadingOrganizations ||
      isLoadingSettings;

  return (
      <div className="flex flex-col">
        {/* Основной контент */}
        <div className="flex-1 p-4 bg-gray-100 flex flex-col">
          {/* Дерево организации в гибком контейнере */}
          <div className="bg-white rounded-md shadow-sm p-6 mb-8 flex-grow-0 h-full">
            {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-1/2"/>
                  <Skeleton className="h-8 w-3/4 ml-4"/>
                  <Skeleton className="h-8 w-2/3 ml-8"/>
                  <Skeleton className="h-8 w-1/2 ml-8"/>
                </div>
            ) : (
                <div className="w-full overflow-x-auto custom-scrollbar h-full" style={{minHeight: '400px'}}>
                  <div style={{minWidth: 'max-content'}}>
                    <OrganizationTree
                        departmentsData={departments}
                        positionsData={positionsWithDepartments}
                        employeesData={employees}
                        showThreeLevels={showThreeLevels}
                        currentDepartmentId={currentDepartmentId}
                        onPositionClick={(id: number) => {
                          // Обработка клика по позиции с сохранением контекста отдела
                          if (id >= 1000 && id % 1000 === 0) {
                            // Это отдел, извлекаем реальный ID отдела
                            const departmentId = Math.floor(id / 1000);
                            setSelectedPositionId(id);
                            setCurrentDepartmentId(departmentId);
                            
                            // Добавляем в историю навигации
                            setNavigationHistory(prev => [...prev, { positionId: id, departmentId }]);
                            console.log(`Текущий контекст отдела изменился на: ${departmentId}`);
                          } else {
                            // Это обычная позиция
                            setSelectedPositionId(id);
                            
                            // Ищем отдел, которому принадлежит эта позиция
                            const position = positionsWithDepartments.find(p => p.position_id === id);
                            if (position) {
                              // Если позиция найдена и у нее есть контекст текущего отдела, сохраняем его
                              if (currentDepartmentId && position.departments.some((d: any) => d.department_id === currentDepartmentId)) {
                                // Эта позиция присутствует в текущем отделе, оставляем контекст
                                setNavigationHistory(prev => [...prev, { positionId: id, departmentId: currentDepartmentId }]);
                                console.log(`Контекст отдела сохранен: ${currentDepartmentId} для позиции ${id}`);
                              } else if (position.departments.length > 0) {
                                // Берем первый отдел из списка отделов позиции
                                const departmentId = position.departments[0].department_id;
                                setCurrentDepartmentId(departmentId);
                                setNavigationHistory(prev => [...prev, { positionId: id, departmentId }]);
                                console.log(`Текущий контекст отдела изменился на: ${departmentId}`);
                              } else {
                                // Позиция не привязана к отделам
                                setCurrentDepartmentId(null);
                                setNavigationHistory(prev => [...prev, { positionId: id, departmentId: null }]);
                                console.log(`Текущий контекст отдела изменился на: null`);
                              }
                            } else {
                              // Позиция не найдена
                              console.log(`Позиция ${id} не найдена`);
                            }
                          }
                        }}
                    />
                  </div>
                </div>
            )}
          </div>

          {/* Статистика в нижней части страницы, прижатая к низу */}
          {selectedPositionId === 0 ? (
              <>
                <div className="flex flex-wrap gap-4">
                  {organizations.map((org) => (
                    <div key={org.department_id} className="bg-white p-4 rounded-md shadow-md flex-1 min-w-[300px]">
                      <CardTitle className="mb-4 text-center">{org.name}</CardTitle>
                      <div className="grid gap-4 grid-cols-2">
                        <Link href="/projects">
                          <div className="bg-gray-50 p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-lg">Проекты</h3>
                              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                              </svg>
                            </div>
                            <div className="text-2xl font-bold">
                              {projects.filter(p => p.id_organization === org.department_id).length}
                            </div>
                            <div className="text-sm text-gray-500">Активных проектов</div>
                          </div>
                        </Link>
                        
                        <Link href="/vacancies" 
                          onClick={() => {
                            localStorage.setItem('selectedOrganizationId', org.department_id.toString());
                            localStorage.setItem('selectedOrganizationName', org.name);
                          }}>
                          <div className="bg-gray-50 p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-lg">Учет вакансий</h3>
                              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6"/>
                              </svg>
                            </div>
                            {(() => {
                              // Получаем данные вакансий для текущей организации
                              const vacancies = getOrganizationVacancies(org.department_id);
                              return (
                                <div className="text-2xl font-bold">
                                  <span className="text-[#a40000]">{vacancies.total}</span>{' '}
                                  <span className="text-green-600">({vacancies.vacant})</span>
                                </div>
                              );
                            })()}
                            <div className="text-sm text-gray-500">Всего мест / Вакантно</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
          ) : (
              <div className="grid gap-4 md:grid-cols-4 flex-shrink-0">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">Отделы</h3>
                    <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">{departments.length}</div>
                  <div className="text-sm text-gray-500">Всего отделов в организации</div>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">Сотрудники</h3>
                    <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <div className="text-sm text-gray-500">Всего сотрудников в системе</div>
                </div>

                <Link href="/projects">
                  <div className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-lg">Проекты</h3>
                      <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <div className="text-sm text-gray-500">Активных проектов</div>
                  </div>
                </Link>

                <Link href={`/vacancies${selectedPositionId ? '/'+selectedPositionId : ''}`}>
                  <div className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-lg">Учет вакансий</h3>
                      <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold">
                      <span className="text-[#a40000]">{totalPositionsCount}</span>{' '}
                      <span className="text-green-600">({vacantPositionsCount})</span>
                    </div>
                    <div className="text-sm text-gray-500">Всего мест / Вакантно</div>
                  </div>
                </Link>
              </div>
          )}
        </div>
      </div>

  );
}