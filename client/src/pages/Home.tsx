import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import React, {useState, useEffect, useMemo} from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import OrganizationTree from "@/components/Tree/OrganizationTree";
import HomeBottomBlock from "@/components/HomeBottomBlock";
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

  const getContextDepartmentsCount = (context): number => {
    if (!context.departmentId) return departments.length;
    return getAllChildDepartments(context).length;
  };

  const getContextProjectsCount = (departmentId: number | null): number => {
    if (!departmentId) return projects.length;

    const selectedDepartment = departments.filter(dept => dept.department_id === departmentId)[0];
    const isOrganization = organizations.filter(org => org.department_id === selectedDepartment.department_id).length > 0;

    if (isOrganization) {
      return projects.filter(p => p.id_organization === selectedDepartment.department_id).length;
    } else if (selectedDepartment.parent_department_id) {
      return projects.filter(p => p.id_organization === selectedDepartment.parent_department_id).length;
    } else {
      const parentPosition = positionsWithDepartments.filter(pd => selectedDepartment.parent_position_id === pd.position_id)[0];
      const organizationId = parentPosition?.departments.map(d => d.department_id)[0];
      
      return projects.filter(p => p.id_organization === organizationId).length;
    }
  };

  // Вспомогательная функция для получения дочерних отделов
  const getAllChildDepartments = (context): number[] => {
    const { departmentId, positionId } = context;
    const result: number[] = [];
    const curDepartment = departments.filter(d => d.department_id === departmentId);
    if (!curDepartment[0]?.is_organization) {
      result.push(departmentId);
    }
    const queue: number[] = [departmentId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = departments.filter(d => d.parent_department_id === currentId && !d.is_organization);
      const children2 = departments.filter(d => d.parent_position_id === positionId);

      children.forEach(child => {
        if (!result.includes(child.department_id)) {
          result.push(child.department_id);
          queue.push(child.department_id);
        }
      });

      children2.forEach(child => {
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
    setIsRootView(value);
  };

  const handleGoBack = () => {
    // Логика для перехода назад
    console.log("Going back...");
  };

  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects ||
      isLoadingPositionsWithDepartments || isLoadingPositionPositions || isLoadingOrganizations ||
      isLoadingSettings;

  const formatedPositionId = selectedPositionId % 1000 === 0 ? selectedPositionId / 1000 : selectedPositionId;

  const [showVacancies, setShowVacancies] = useState(false);

  return (
      <div className="flex flex-col">
        <div className="flex-1 p-4 bg-gray-100 flex flex-col">
          {/* Дерево организации */}
          <div className="rounded-md shadow-sm p-6 mb-8 flex-grow-0 h-full">
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
                        showVacancies={showVacancies}  // Показывать ли вакансии
                        setShowVacancies={setShowVacancies}
                    />
                  </div>
                </div>
              )}
            {showVacancies && (
            <div className="vacancies-blocks">
              <div className="text-m font-semibold mb-2">Всего в дочерних элементах</div>
              <div className="description">
                <div className="block">
                  <div className="color red"></div>
                  <span className="text">вакантных позиций</span>
                </div>
                <div className="block">
                  <div className="color blue"></div>
                  <span className="text">штатных позиций</span>
                </div>
              </div>
            </div>
            )}
          </div>
          <HomeBottomBlock
              isRootView={isRootView}
              selectedPositionId={selectedPositionId}
              currentContext={currentContext}
              organizations={organizations}
              getContextVacancies={getContextVacancies}
              getOrganizationVacancies={getOrganizationVacancies}
              getContextDepartmentsCount={getContextDepartmentsCount}
              getContextProjectsCount={getContextProjectsCount}
              projects={projects}
          />
        </div>
      </div>
  );
}