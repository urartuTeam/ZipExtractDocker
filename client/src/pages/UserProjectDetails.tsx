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
import { Project, EmployeeProject, Employee } from '@shared/schema';
import { ArrowLeft, Users } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface ProjectDetailsProps {
  id?: string;
}

// Компонент отображения деталей проекта для обычных пользователей
export default function UserProjectDetails({ id: propId }: ProjectDetailsProps) {
  const params = useParams();
  const idFromParams = params?.id || propId;
  const projectId = parseInt(idFromParams as string);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Запрос проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId && !isNaN(projectId),
    onSuccess: (data) => {
      console.log("Project data received:", data);
    }
  });

  // Запрос сотрудников проекта
  const { data: projectEmployeesResponse, isLoading: isLoadingProjectEmployees } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: [`/api/employeeprojects/project/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
  });

  // Запрос всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  
  // Использовать данные запроса
  const projectData = projectResponse?.data;
  
  const employeeProjects = projectEmployeesResponse?.data || [];
  const allEmployees = employeesResponse?.data || [];
  
  // Получаем полную информацию о сотрудниках проекта
  const projectEmployeesWithDetails = employeeProjects.map(ep => {
    const employee = allEmployees.find(e => e.employee_id === ep.employee_id);
    return {
      ...ep,
      employeeDetails: employee
    };
  });

  const isLoading = isLoadingProject || isLoadingProjectEmployees || isLoadingEmployees;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
          <Skeleton className="h-9 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
          <h1 className="text-2xl font-bold">Проект не найден</h1>
        </div>
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
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к проектам
        </Button>
        <h1 className="text-2xl font-bold">{projectData.name}</h1>
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
                  {projectEmployeesWithDetails.map((ep) => (
                    <TableRow key={ep.employee_id}>
                      <TableCell className="font-medium">{ep.employeeDetails?.full_name || "Неизвестный сотрудник"}</TableCell>
                      <TableCell>{ep.employeeDetails?.position_id || "—"}</TableCell>
                      <TableCell>{ep.employeeDetails?.department_id || "—"}</TableCell>
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
  );
}