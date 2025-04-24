import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Users, UserCircle, Building, User } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";

// Типы данных для структуры организации
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

type Position = {
  position_id: number;
  name: string;
  department_id: number;
  staff_units: number;
  current_count: number;
  vacancies: number;
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

export default function Home() {
  const { user } = useAuth();
  const [expandedDepartments, setExpandedDepartments] = useState<{[key: number]: boolean}>({});
  const [expandedPositions, setExpandedPositions] = useState<{[key: string]: boolean}>({});

  // Запрос на получение общего количества отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение общего количества сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение общего количества проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/projects'],
  });

  // Получаем данные должностей
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  
  // Получаем данные о связях должностей и отделов
  const { data: positionDepartmentsResponse, isLoading: isLoadingPositionDepartments } = useQuery<{status: string, data: PositionDepartment[]}>({
    queryKey: ['/api/positiondepartments'],
  });

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const positionDepartments = positionDepartmentsResponse?.data || [];
  
  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects || isLoadingPositions || isLoadingPositionDepartments;

  const toggleDepartment = (departmentId: number) => {
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
  
  // Получаем корневые отделы (без родителя)
  const getRootDepartments = () => {
    return departments?.filter(dept => dept.parent_department_id === null) || [];
  };
  
  // Получаем дочерние отделы для указанного отдела
  const getChildDepartments = (parentId: number) => {
    return departments?.filter(dept => dept.parent_department_id === parentId) || [];
  };
  
  // Получаем должности для указанного отдела
  const getPositionsForDepartment = (departmentId: number) => {
    const positionLinks = positionDepartments?.filter(pd => pd.department_id === departmentId) || [];
    
    return positionLinks.map(link => {
      const position = positions?.find(p => p.position_id === link.position_id);
      return {
        ...link,
        positionName: position?.name || 'Неизвестная должность'
      };
    });
  };
  
  // Получаем сотрудников для указанной должности в указанном отделе
  const getEmployeesForPositionInDepartment = (positionId: number, departmentId: number) => {
    return employees?.filter(emp => 
      emp.position_id === positionId && emp.department_id === departmentId
    ) || [];
  };

  // Рендер отдела и его содержимого
  const renderDepartment = (department: Department, level: number = 0) => {
    const isExpanded = expandedDepartments[department.department_id] || false;
    const childDepartments = getChildDepartments(department.department_id);
    const positions = getPositionsForDepartment(department.department_id);
    
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
            {/* Должности в отделе */}
            {positions.length > 0 ? (
              positions.map(positionLink => {
                const positionDeptKey = `${positionLink.position_id}-${department.department_id}`;
                const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                const positionEmployees = getEmployeesForPositionInDepartment(
                  positionLink.position_id, 
                  department.department_id
                );
                
                return (
                  <div key={positionDeptKey} className="mb-2">
                    <div 
                      className="flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md"
                      onClick={() => togglePosition(positionDeptKey)}
                    >
                      {isPositionExpanded ? 
                        <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
                        <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
                      }
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{positionLink.positionName}</span>
                    </div>
                    
                    {isPositionExpanded && (
                      <div className="ml-6 border-l-2 border-neutral-200 pl-4 py-2">
                        {/* Сотрудники на должности */}
                        {positionEmployees.length > 0 ? (
                          positionEmployees.map(employee => (
                            <div 
                              key={employee.employee_id} 
                              className="flex items-center p-2 hover:bg-neutral-100 rounded-md"
                            >
                              <User className="h-5 w-5 mr-2 text-green-500" />
                              <span>{employee.full_name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-neutral-500 italic pl-7">Нет сотрудников на этой должности</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-neutral-500 italic pl-7">Нет должностей в этом отделе</div>
            )}
            
            {/* Дочерние отделы */}
            {childDepartments.length > 0 && (
              <div className="mt-4">
                <div className="font-medium mb-2 pl-2">Подчиненные отделы:</div>
                {childDepartments.map(childDept => renderDepartment(childDept, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Система управления персоналом</h1>
        {!user && (
          <Button asChild className="text-lg" variant="default">
            <Link href="/auth">Войти в систему</Link>
          </Button>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Структура организации</CardTitle>
          <CardDescription>
            Иерархическая структура отделов, должностей и сотрудников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-8 w-3/4 ml-4" />
              <Skeleton className="h-8 w-2/3 ml-8" />
              <Skeleton className="h-8 w-1/2 ml-8" />
            </div>
          ) : getRootDepartments().length > 0 ? (
            <div>
              {getRootDepartments().map(department => renderDepartment(department))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              <Building className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>Нет доступных данных о структуре организации</p>
              {!user && (
                <Button asChild className="mt-4" variant="default">
                  <Link href="/auth">Войти для управления</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Отделы</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDepartments ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                departments.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего отделов</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/departments">Просмотреть все отделы</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Сотрудники</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingEmployees ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                employees.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего сотрудников</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/employees">Просмотреть всех сотрудников</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Проекты</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingProjects ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                projectsResponse?.data.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего проектов</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/projects">Просмотреть все проекты</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}