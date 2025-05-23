import React from 'react';
import {Link, useLocation, useParams} from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Project, EmployeeProject, Employee, Department, Position } from '@shared/schema';
import {ArrowLeft, Users, ArrowRight, LogInIcon} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from '@/hooks/use-auth';

import { RouteComponentProps } from 'wouter';

// Компонент отображения деталей проекта для обычных пользователей
export default function UserProjectDetails({ params }: RouteComponentProps<{ id: string }>) {
  const projectId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Запрос проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 1000 * 60, // 1 минута
  });

  // Запрос данных сотрудников проекта
  const { data: projectEmployeesResponse, isLoading: isLoadingProjectEmployees } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: [`/api/employeeprojects/project/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 1000 * 60, // 1 минута
  });

  // Запрос всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  
  // Запрос всех должностей
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  
  // Запрос всех отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  
  // Использовать данные запроса
  // В нашем случае API возвращает массив объектов, нужно найти проект по ID
  const projectData = projectResponse?.data ? 
    (Array.isArray(projectResponse.data) 
      ? projectResponse.data.find(project => project.project_id === Number(projectId))
      : projectResponse.data)
    : undefined;
    
  const projectEmployees = projectEmployeesResponse?.data || [];
  
  const allEmployees = employeesResponse?.data || [];
  const allPositions = positionsResponse?.data || [];
  const allDepartments = departmentsResponse?.data || [];
  
  // Получаем полную информацию о сотрудниках проекта
  const projectEmployeesWithDetails = (projectEmployees || []).map((ep: EmployeeProject) => {
    const employee = allEmployees.find(e => e.employee_id === ep.employee_id);
    const position = allPositions.find(p => p.position_id === employee?.position_id);
    const department = allDepartments.find(d => d.department_id === employee?.department_id);
    
    return {
      ...ep,
      employeeDetails: employee,
      positionName: position?.name || "Неизвестная должность",
      departmentName: department?.name || "Неизвестный отдел"
    };
  });

  const isLoading = isLoadingProject || isLoadingProjectEmployees || isLoadingEmployees || isLoadingPositions || isLoadingDepartments;

  // Экран загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">

        
        <div className="flex-1 p-4 bg-gray-100 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          
          <div className="flex-grow">
            <Card className="mb-6">
              <CardHeader>
                <Skeleton className="h-7 w-56 mb-2" />
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-56 mb-2" />
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Экран "Проект не найден"
  if (!projectData) {
    return (
      <div className="flex flex-col h-screen">
        
        <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto bg-neutral-100 flex flex-col">
          <div className="flex-grow">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-12">
                  <h2 className="text-xl font-medium mb-2">Проект не найден</h2>
                  <p className="text-gray-500 mb-4">Проект с ID {projectId} не существует.</p>
                  <Button onClick={() => navigate('/projects')}>
                    Вернуться к списку проектов
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Нижняя кнопка */}
          <div className="mt-auto pt-4 border-t border-gray-200 flex justify-end">
            <Button variant="outline" onClick={() => navigate('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Основной экран с данными проекта
  return (
    <div className="flex flex-col h-screen">

      <div className="flex-1 p-4 bg-gray-100 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{projectData.name}</h1>
            <p className="text-gray-500">Проект №{projectData.project_id}</p>
          </div>
          <div>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
          </div>
        </div>

        <div className="flex-grow">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Информация о проекте</CardTitle>
              <CardDescription>Основные сведения о проекте</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Название проекта:</p>
                  <p className="text-lg">{projectData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Описание:</p>
                  <p className="text-base">{projectData.description || "Описание отсутствует"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Команда проекта</CardTitle>
                <CardDescription>Всего участников: {projectEmployeesWithDetails.length}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {projectEmployeesWithDetails.length === 0 ? (
                <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
                  <h2 className="text-xl font-medium mb-2">В команде еще нет участников</h2>
                  <p className="text-gray-500 mb-4">На данный момент к проекту не привязаны сотрудники.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Должность</TableHead>
                        <TableHead>Отдел</TableHead>
                        <TableHead>Роль в проекте</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectEmployeesWithDetails.map((ep: any) => (
                        <TableRow key={ep.employee_id}>
                          <TableCell className="font-medium">{ep.employeeDetails?.full_name || "Неизвестный сотрудник"}</TableCell>
                          <TableCell>{ep.positionName}</TableCell>
                          <TableCell>{ep.departmentName}</TableCell>
                          <TableCell>{ep.role || "Участник"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}