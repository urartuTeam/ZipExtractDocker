import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import OrganizationTree from "@/components/OrganizationTree";
import { useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [selectedPositionId, setSelectedPositionId] = useState(0);

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

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];
  const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
  const positionPositions = positionPositionsResponse?.data || [];
  const organizations = organizationsResponse?.data || [];

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

  // ПРЕДЕЛЬНО ПРОСТАЯ ЛОГИКА ПО УКАЗАНИЮ:
  // 1. ВСЕГО - сумма значений vacancies из БД по всем должностям
  // 2. Занято - количество сотрудников
  // 3. Незанятых вакансий = ВСЕГО - Занято (если получается отрицательное, то 0)

  // Подсчет общего количества ВСЕГО (vacancies из БД)
  const totalPositionsFromDb = positionsWithDepartments.reduce((total, position) => {
    position.departments.forEach((dept: PositionDepartment) => {
      if (dept.deleted !== true) {
        // Суммируем значения vacancies из БД (это ВСЕГО)
        total += dept.vacancies || 0;
      }
    });
    return total;
  }, 0);

  // Количество сотрудников (занятых мест)
  const employeesCount = employees.length;

  // ВСЕГО мест - прямо из БД (vacancies)
  const totalPositionsCount = totalPositionsFromDb;

  // Незанятых вакансий = ВСЕГО - Занятых мест
  const vacantPositionsCount = Math.max(0, totalPositionsCount - employeesCount);

  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects ||
      isLoadingPositionsWithDepartments || isLoadingPositionPositions || isLoadingOrganizations;

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
                        onPositionClick={(id) => setSelectedPositionId(id)}
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
                        
                        <Link href={`/vacancies${selectedPositionId ? '/'+selectedPositionId : ''}`}>
                          <div className="bg-gray-50 p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-lg">Учет вакансий</h3>
                              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6"/>
                              </svg>
                            </div>
                            <div className="text-2xl font-bold">
                              <span className="text-[#a40000]">Всего: {totalPositionsCount}</span>{' '}
                              <span className="text-green-600">({vacantPositionsCount})</span>
                            </div>
                            <div className="text-sm text-gray-500">Отчет по вакансиям</div>
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
                      <span className="text-[#a40000]">Всего: {totalPositionsCount}</span>{' '}
                      <span className="text-green-600">({vacantPositionsCount})</span>
                    </div>
                    <div className="text-sm text-gray-500">Отчет по вакансиям организации</div>
                  </div>
                </Link>
              </div>
          )}
        </div>
      </div>

  );
}