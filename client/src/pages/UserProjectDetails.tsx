import React from 'react';
import { useLocation, useParams } from 'wouter';
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
import { ArrowLeft, Users } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { RouteComponentProps } from 'wouter';

// Компонент отображения деталей проекта для обычных пользователей
export default function UserProjectDetails({ params }: RouteComponentProps<{ id: string }>) {
  const projectId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
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
        {/* Шапка с скелетоном */}
        <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
              <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
            </svg>
            <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
          </div>
          
          <div className="text-center flex-1">
            <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
          </div>
          
          <div>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20" onClick={() => navigate('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto bg-neutral-100">
          <div className="mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
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
    );
  }

  // Экран "Проект не найден"
  if (!projectData) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
              <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
            </svg>
            <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
          </div>
          
          <div className="text-center flex-1 text-2xl font-bold">
            Проект не найден
          </div>
          
          <div>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20" onClick={() => navigate('/projects')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto bg-neutral-100">
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
      </div>
    );
  }

  // Основной экран с данными проекта
  return (
    <div className="flex flex-col h-screen">
      {/* Красная шапка как на главной странице */}
      <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
        </div>
        
        <div className="text-center flex-1 text-2xl font-bold">
          {projectData.name}
        </div>
        
        <div>
          <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20" onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto bg-neutral-100">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{projectData.name}</h1>
            <p className="text-gray-500">Проект №{projectData.project_id}</p>
          </div>
        </div>

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
  );
}