import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {useState, useEffect, useMemo} from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import OrganizationTree from "@/components/OrganizationTree";
import { VacancyCounter, VacancyCount } from '../VacancyCounter';

declare global {
    interface Window {
        departmentsData: any[];
        employeesData: any[];
        positionsWithDepartmentsData: any[];
        positionPositionsData: any[];
    }
}
// Типы данных
type NavigationHistoryItem = {
    positionId: number | null;
    departmentId: number | null;
};

type ContextType = {
    positionId: number | null;
    departmentId: number | null;
    name: string | null;
    isOrganization: boolean;
};

type VacancyCount = {
    total: number;
    occupied: number;
    vacant: number
};

export default function Home() {
    // Состояния
    const [selectedPositionId, setSelectedPositionId] = useState(0);
    const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
    const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
    const [currentContext, setCurrentContext] = useState<ContextType>({
        positionId: null,
        departmentId: null,
        name: null,
        isOrganization: false
    });

    // Запросы данных
    const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery({
        queryKey: ['/api/departments'],
    });

    const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['/api/employees'],
    });

    const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['/api/projects'],
    });

    const { data: positionsWithDepartmentsResponse, isLoading: isLoadingPositionsWithDepartments } = useQuery({
        queryKey: ['/api/positions/with-departments'],
    });

    const { data: positionPositionsResponse, isLoading: isLoadingPositionPositions } = useQuery({
        queryKey: ['/api/positionpositions'],
    });

    const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useQuery({
        queryKey: ['/api/organizations'],
    });

    const { data: settingsResponse, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['/api/settings'],
    });

    // Подготовка данных
    const departments = departmentsResponse?.data || [];
    const employees = employeesResponse?.data || [];
    const projects = projectsResponse?.data || [];
    const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
    const positionPositions = positionPositionsResponse?.data || [];
    const organizations = organizationsResponse?.data || [];
    const settings = settingsResponse?.data || [];

    useEffect(() => {
        window.departmentsData = departments;
        window.employeesData = employees;
        window.positionsWithDepartmentsData = positionsWithDepartments;
        window.positionPositionsData = positionPositions;
    }, [departments, employees, positionsWithDepartments, positionPositions]);

    const vacancyCounter = useMemo(
        () => new VacancyCounter(
            departments,
            employees,
            positionsWithDepartments,
            positionPositions
        ),
        [departments, employees, positionsWithDepartments, positionPositions]
    );

    // Получение настроек
    const hierarchyInitialLevelsSetting = settings.find(
        (setting: any) => setting.data_key === 'hierarchy_initial_levels'
    );
    const showThreeLevels = hierarchyInitialLevelsSetting?.data_value === '3';

    // Функции для работы с вакансиями
    const getContextVacancies = (departmentId: number | null, positionId: number | null): VacancyCount => {
        return vacancyCounter.getVacancyCount({ departmentId, positionId });
    };

    const getOrganizationVacancies = (departmentId: number): VacancyCount => {
        return vacancyCounter.getVacancyCount({ departmentId });
    };

    // Функции для подсчета количества
    const getContextEmployeesCount = (departmentId: number | null): number => {
        if (!departmentId) return employees.filter(e => !e.deleted).length;
        const childDepartments = getAllChildDepartments(departmentId);
        return employees.filter(e =>
            !e.deleted && childDepartments.includes(e.department_id)
        ).length;
    };

    const getContextDepartmentsCount = (departmentId: number | null): number => {
        if (!departmentId) return departments.length;
        return getAllChildDepartments(departmentId).length;
    };

    const getContextProjectsCount = (departmentId: number | null): number => {
        if (!departmentId) return projects.length;
        const childDepartments = getAllChildDepartments(departmentId);
        const departmentEmployees = employees.filter(e =>
            !e.deleted && childDepartments.includes(e.department_id)
        );
        const employeeIds = departmentEmployees.map(e => e.employee_id);
        return projects.length; // Упрощенно, можно добавить связь с сотрудниками
    };

    // Вспомогательная функция для получения дочерних отделов
    const getAllChildDepartments = (departmentId: number): number[] => {
        const result: number[] = [departmentId];
        const queue: number[] = [departmentId];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const children = departments.filter(d => d.parent_department_id === currentId);

            children.forEach(child => {
                if (!result.includes(child.department_id)) {
                    result.push(child.department_id);
                    queue.push(child.department_id);
                }
            });
        }

        return result;
    };

    // Обработчик клика по элементу дерева
    const handlePositionClick = (context: {
        positionId: number | null;
        departmentId: number | null;
        name: string | null;
        isOrganization: boolean;
    }) => {
        console.log('33333333333333333333333333333')
        setCurrentContext({
            positionId: context.positionId,
            departmentId: context.departmentId,
            name: context.name,
            isOrganization: context.isOrganization
        });

        if (context.positionId) {
            setSelectedPositionId(context.positionId);

            if (context.departmentId) {
                setCurrentDepartmentId(context.departmentId);
                setNavigationHistory(prev => [...prev, {
                    positionId: context.positionId,
                    departmentId: context.departmentId
                }]);
            }
        }
    };
    const [isRootView, setIsRootView] = useState(false);

    const handleRootViewChange = (value: boolean) => {
        console.log('Changing root view:', value);
        setIsRootView(value);
    };

    const handleGoBack = () => {
        // Логика для перехода назад
        console.log("Going back...");
    };

    const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects ||
        isLoadingPositionsWithDepartments || isLoadingPositionPositions || isLoadingOrganizations ||
        isLoadingSettings;

    return (
        <div className="flex flex-col">
            <div className="flex-1 p-4 bg-gray-100 flex flex-col">
                {/* Дерево организации */}
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
                                    onPositionClick={handlePositionClick}
                                    onRootViewChange={handleRootViewChange}
                                    handleGoBack={handleGoBack}  // Функция для навигации назад
                                    hierarchyInitialLevels={showThreeLevels ? 3 : 2}  // Количество уровней иерархии
                                    nodes={departments}  // Данные узлов для дерева
                                    selectedPositionId={selectedPositionId}  // ID выбранной позиции
                                    showVacancies={false}  // Показывать ли вакансии
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Статистика */}
                {selectedPositionId === 0 || isRootView ? (
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
                                            <div className="text-2xl font-bold">
                                                <span className="text-[#a40000]">{getOrganizationVacancies(org.department_id).total}</span>{' '}
                                                <span className="text-green-600">({getOrganizationVacancies(org.department_id).vacant})</span>
                                            </div>
                                            <div className="text-sm text-gray-500">Всего мест / Вакантно</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
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
                            <div className="text-2xl font-bold">{getContextDepartmentsCount(currentContext.departmentId)}</div>
                            <div className="text-sm text-gray-500">Всего отделов</div>
                        </div>

                        <div className="bg-white p-4 rounded-md shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-lg">Сотрудники</h3>
                                <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div className="text-2xl font-bold">{getContextEmployeesCount(currentContext.departmentId)}</div>
                            <div className="text-sm text-gray-500">Всего сотрудников</div>
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
                                <div className="text-2xl font-bold">{getContextProjectsCount(currentContext.departmentId)}</div>
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
                  <span className="text-[#a40000]">
                    {getContextVacancies(currentContext.departmentId, currentContext.positionId).total}
                  </span>{' '}
                                    <span className="text-green-600">
                    ({getContextVacancies(currentContext.departmentId, currentContext.positionId).vacant})
                  </span>
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