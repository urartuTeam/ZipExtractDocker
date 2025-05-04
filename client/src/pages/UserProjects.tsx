import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useDataRefresh } from "@/hooks/use-data-refresh";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Project } from '@shared/schema';
import { Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Основной компонент страницы проектов для обычных пользователей (карточки)
export default function UserProjects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  // Запрос на получение всех проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: Project[]}>({
    queryKey: ['/api/projects']
  });

  // Настройка автоматического обновления данных
  useDataRefresh(['/api/projects']);

  // Обработка ошибок загрузки
  const isLoading = isLoadingProjects;
  const projects = projectsResponse?.data || [];
  
  // Фильтрация проектов по поисковому запросу
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          Проекты
        </div>
        
        {/* Убираем кнопку войти из шапки */}
        <div className="w-[100px]">
          {/* Пустой div для центрирования заголовка "Проекты" */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto bg-neutral-100 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Проекты</h1>
            <p className="text-gray-500">Всего проектов: {projects.length}</p>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
          </div>
        </div>

        <div className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-medium mb-2">Проекты не найдены</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `По запросу "${searchTerm}" ничего не найдено` 
                  : "В системе нет доступных проектов"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.project_id} className="overflow-hidden flex flex-col h-full">
                  <CardHeader className="pb-0">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>Проект №{project.project_id}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <p className="line-clamp-3">{project.description || "Описание отсутствует"}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/projects/${project.project_id}`)}
                    >
                      Просмотреть детали
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Нижняя часть с кнопками входа/управления */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-end">
          {user ? (
            <Button
              variant="outline"
              className="bg-[#a40000] text-white border-[#a40000] hover:bg-[#b30000] hover:text-white"
              onClick={() => navigate('/admin/projects')}
            >
              Управление
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="bg-[#a40000] text-white border-[#a40000] hover:bg-[#b30000] hover:text-white"
              onClick={() => navigate('/auth')}
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}