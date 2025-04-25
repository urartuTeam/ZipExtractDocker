import React, { useState } from 'react';
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

export default function OrganizationStructure() {
  const { toast } = useToast();
  const [expandedDepartments, setExpandedDepartments] = useState<{[key: number]: boolean}>({});
  const [expandedPositions, setExpandedPositions] = useState<{[key: string]: boolean}>({});
  
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
  
  const departments = departmentsResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const positionDepartments = positionDepartmentsResponse?.data || [];
  const positionsWithDepartments = positionsWithDepartmentsResponse?.data || [];
  
  const isLoading = isLoadingDepartments || isLoadingPositions || isLoadingEmployees || 
                    isLoadingPositionDepartments || isLoadingPositionsWithDepartments;
  const error = departmentsError || positionsError || employeesError || 
                positionDepartmentsError || positionsWithDepartmentsError;
  
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
    // Используем улучшенный API endpoint с данными о должностях и отделах
    // Сначала проверяем, есть ли данные из API
    if (positionsWithDepartments.length > 0) {
      // Фильтруем должности, у которых в массиве departments есть нужный department_id
      const linkedPositions = positionsWithDepartments.filter(pos => 
        pos.departments && pos.departments.some((d: any) => d.department_id === departmentId)
      );
      
      return linkedPositions.map(position => {
        // Находим конкретную связь для этого отдела
        const deptLink = position.departments.find((d: any) => d.department_id === departmentId);
        return {
          position_link_id: deptLink.position_link_id,
          position_id: position.position_id,
          department_id: departmentId,
          positionName: position.name
        };
      });
    } else {
      // Резервная логика - используем старые данные
      const positionLinks = positionDepartments?.filter(pd => pd.department_id === departmentId) || [];
      
      return positionLinks.map(link => {
        const position = positions?.find(p => p.position_id === link.position_id);
        return {
          ...link,
          positionName: position?.name || 'Неизвестная должность'
        };
      });
    }
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
            rootDepartments.map(department => renderDepartment(department))
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