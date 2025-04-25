import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Project, EmployeeProject } from '@shared/schema';
import { ArrowLeft, Users } from 'lucide-react';

export default function Projects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Запрос на получение всех проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: Project[]}>({
    queryKey: ['/api/projects'],
    onSuccess: (data) => {
      // Обработка успешного получения данных
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить проекты',
        variant: 'destructive',
      });
    },
  });

  // Запрос на получение связей сотрудников и проектов
  const { data: employeeProjectsResponse, isLoading: isLoadingEmployeeProjects } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: ['/api/employeeprojects'],
    onSuccess: (data) => {
      // Обработка успешного получения данных
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить связи сотрудников и проектов',
        variant: 'destructive',
      });
    },
  });

  const projects = projectsResponse?.data || [];
  const employeeProjects = employeeProjectsResponse?.data || [];
  
  const isLoading = isLoadingProjects || isLoadingEmployeeProjects;

  // Подсчет количества сотрудников для каждого проекта
  const getEmployeeCount = (projectId: number) => {
    return employeeProjects.filter(ep => ep.project_id === projectId).length;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <h1 className="text-2xl font-bold">Проекты</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-medium mb-2">Список проектов пуст</h2>
          <p className="text-gray-500 mb-4">На данный момент проекты не созданы.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.project_id} href={`/projects/${project.project_id}`}>
              <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>Проект #{project.project_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[100px] flex items-center justify-center bg-gray-50 rounded-md">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <span className="text-xl font-bold">{getEmployeeCount(project.project_id)}</span>
                      <span className="block text-sm text-gray-500">сотрудников</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-1 text-sm text-gray-500">
                  Нажмите, чтобы посмотреть детали
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}