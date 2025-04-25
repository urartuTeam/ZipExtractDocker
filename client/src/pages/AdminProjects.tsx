import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataRefresh } from "@/hooks/use-data-refresh";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, EmployeeProject } from '@shared/schema';
import { Plus, Edit, Trash, Users, AlertTriangle } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";

// Основной компонент страницы проектов для админа (таблица)
export default function AdminProjects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Форма добавления проекта
  const projectFormSchema = z.object({
    name: z.string().min(2, "Название должно содержать минимум 2 символа"),
    description: z.string().optional()
  });

  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  // Запрос на получение всех проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: Project[]}>({
    queryKey: ['/api/projects']
  });

  // Запрос на получение связей сотрудников и проектов
  const { data: employeeProjectsResponse, isLoading: isLoadingEmployeeProjects } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: ['/api/employeeprojects']
  });

  // Настройка автоматического обновления данных
  useDataRefresh(['/api/projects', '/api/employeeprojects']);

  // Мутация для создания проекта
  const createProject = useMutation({
    mutationFn: async (values: z.infer<typeof projectFormSchema>) => {
      const res = await apiRequest("POST", "/api/projects", values);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании проекта");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект создан",
        description: "Новый проект успешно создан",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddProjectDialog(false);
      projectForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Мутация для удаления проекта
  const deleteProject = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await apiRequest("DELETE", `/api/projects/${projectId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении проекта");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект удален",
        description: "Проект успешно удален",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowDeleteConfirmDialog(false);
      setProjectToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Обработка ошибок загрузки
  const isLoading = isLoadingProjects || isLoadingEmployeeProjects;
  const projects = projectsResponse?.data || [];
  const employeeProjects = employeeProjectsResponse?.data || [];
  
  // Получить количество сотрудников в проекте
  const getProjectEmployeeCount = (projectId: number) => {
    return employeeProjects.filter(ep => ep.project_id === projectId).length;
  };
  
  // Фильтрация проектов по поисковому запросу
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmitAddProject = (values: z.infer<typeof projectFormSchema>) => {
    createProject.mutate(values);
  };

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.project_id);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Управление проектами</h1>
          <p className="text-gray-500">Всего проектов: {projects.length}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
          <Input
            type="text"
            placeholder="Поиск проектов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-[300px]"
          />
          <Button onClick={() => setShowAddProjectDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить проект
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список проектов</CardTitle>
          <CardDescription>Управление проектами в системе</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-medium mb-2">Проекты не найдены</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `По запросу "${searchTerm}" ничего не найдено` 
                  : "В системе нет проектов"}
              </p>
              <Button onClick={() => setShowAddProjectDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первый проект
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название проекта</TableHead>
                    <TableHead className="hidden md:table-cell">Описание</TableHead>
                    <TableHead>Сотрудники</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.project_id}>
                      <TableCell className="font-medium">{project.project_id}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                        {project.description || "Описание отсутствует"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{getProjectEmployeeCount(project.project_id)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/projects/${project.project_id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmDeleteProject(project)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления проекта */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый проект</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом проекте
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmitAddProject)} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название проекта</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название проекта" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Введите описание проекта" 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddProjectDialog(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Создание..." : "Создать проект"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления проекта */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить проект "{projectToDelete?.name}"?
              Это действие нельзя будет отменить.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}