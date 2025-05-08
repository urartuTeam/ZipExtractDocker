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
import {Users, ArrowRight, LogInIcon, ArrowLeft} from 'lucide-react';
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
  
  // Сортировка по полю sort и фильтрация проектов по поисковому запросу
  const filteredProjects = [...projects]
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="flex flex-col h-screen">

      <div className="flex-1 p-4 bg-gray-100 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Проекты</h1>
            <p className="text-gray-500">Всего проектов: {projects.length}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              На главную
            </Button>
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


      </div>
    </div>
  );
}