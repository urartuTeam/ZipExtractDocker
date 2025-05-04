import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, LogInIcon } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import OrganizationTree from "@/components/OrganizationTree";
import TreeView from "@/components/TreeView";
import VerticalTreeView from "@/components/VerticalTreeView";
import AdminStructureView from "@/components/AdminStructureView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { user } = useAuth();

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

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];
  const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
  const positionPositions = positionPositionsResponse?.data || [];
  
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
  
  // Общее количество штатных единиц по всей организации
  // Для каждой связки должность-отдел берем максимальное значение из:
  // 1. Поля staff_units в БД (если указано)
  // 2. Суммы занятых мест и вакансий
  const totalPositions = positionsWithDepartments.reduce((total, position) => {
    position.departments.forEach((dept: PositionDepartment) => {
      if (dept.deleted !== true) {
        // Получаем количество сотрудников на этой позиции в этом отделе
        const employeesCount = employees.filter(
          e => e.position_id === position.position_id && e.department_id === dept.department_id
        ).length;
        
        // Берем штатное расписание из БД или расчетное значение
        // Минимум должно быть столько мест, сколько сотрудников уже назначено
        const staffUnits = dept.staff_units || 0;
        const vacancies = dept.vacancies || 0;
        const posCount = Math.max(
          staffUnits,
          employeesCount + vacancies,
          employeesCount // как минимум, столько сколько есть сотрудников
        );
        
        total += posCount;
      }
    });
    return total;
  }, 0);
  
  // Общее количество занятых позиций - это количество сотрудников
  const occupiedPositions = employees.length;
  
  // Отображаемые данные
  const totalPositionsCount = Math.max(totalPositions, occupiedPositions);
  const vacantPositionsCount = Math.max(0, totalPositionsCount - occupiedPositions);
  
  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects || 
                   isLoadingPositionsWithDepartments || isLoadingPositionPositions;

  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием */}
      <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
        </div>
        
        <div className="text-center flex-1 text-2xl font-bold">
          Система управления персоналом
        </div>
        
        <div>
          {!user ? (
            <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <Link href="/auth">
                <LogInIcon className="w-5 h-5 mr-2" />
                Войти
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <Link href="/departments">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Управление
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto flex flex-col">
        {/* Дерево организации в гибком контейнере */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8 flex-grow-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-8 w-3/4 ml-4" />
              <Skeleton className="h-8 w-2/3 ml-8" />
              <Skeleton className="h-8 w-1/2 ml-8" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto custom-scrollbar" style={{ minHeight: '400px', maxHeight: '600px' }}>
              <div style={{ minWidth: 'max-content' }}>
                <OrganizationTree
                  departmentsData={departments}
                  positionsData={positionsWithDepartments}
                  employeesData={employees}
                />
              </div>
            </div>
          )}
        </div>

        {/* Растягивающийся элемент */}
        <div className="flex-grow"></div>

        {/* Статистика в нижней части страницы, прижатая к низу */}
        <div className="grid gap-4 md:grid-cols-4 mt-auto">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Отделы</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{departments.length}</div>
            <div className="text-sm text-gray-500">Всего отделов в организации</div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Сотрудники</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{projects.length}</div>
              <div className="text-sm text-gray-500">Активных проектов</div>
            </div>
          </Link>
          
          <Link href="/vacancies">
            <div className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-lg">Учет вакансий</h3>
                <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6" />
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
      </div>
    </div>
  );
}