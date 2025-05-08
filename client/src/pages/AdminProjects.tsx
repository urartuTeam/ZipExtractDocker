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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, EmployeeProject } from '@shared/schema';
import { Plus, Edit, Trash, Users } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";

// Основной компонент страницы проектов для админа 
export default function AdminProjects() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  
  // Форма добавления проекта
  const projectFormSchema = z.object({
    name: z.string().min(2, "Название должно содержать минимум 2 символа"),
    description: z.string().optional(),
    id_organization: z.number({
      required_error: "Выберите организацию",
      invalid_type_error: "Выберите организацию",
    })
  });

  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      id_organization: undefined
    }
  });
  
  // Запрос на получение списка организаций (отделы с is_organization=true)
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/organizations']
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

  // Обработка ошибок загрузки
  const isLoading = isLoadingProjects || isLoadingEmployeeProjects || isLoadingOrganizations;
  const projects = projectsResponse?.data || [];
  const employeeProjects = employeeProjectsResponse?.data || [];
  const organizations = organizationsResponse?.data || [];
  
  // Получить количество сотрудников в проекте
  const getEmployeeCount = (projectId: number) => {
    return employeeProjects.filter(ep => ep.project_id === projectId).length;
  };
  
  // Получить название организации по ID
  const getOrganizationName = (organizationId: number | null | undefined) => {
    if (!organizationId) return "—";
    const organization = organizations.find(org => org.department_id === organizationId);
    return organization ? organization.name : "—";
  };
  
  // Фильтрация проектов по поисковому запросу
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmitAddProject = (values: z.infer<typeof projectFormSchema>) => {
    createProject.mutate(values);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6 mt-5">
        <h1 className="text-2xl font-bold">Управление проектами</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
          </div>
          <Button onClick={() => setShowAddProjectDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить проект
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Проекты</CardTitle>
          <CardDescription>Список всех проектов в системе</CardDescription>
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
          ) : (
            <>
              {filteredProjects.length === 0 ? (
                <div className="text-center p-12">
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
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Организация</TableHead>
                        <TableHead>Сотрудники</TableHead>
                        <TableHead className="w-[100px]">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            Проекты не найдены
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProjects.map((project) => (
                          <TableRow key={project.project_id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/admin/projects/${project.project_id}`)}>
                            <TableCell>{project.project_id}</TableCell>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>{project.description || "—"}</TableCell>
                            <TableCell>{getOrganizationName(project.id_organization)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{getEmployeeCount(project.project_id)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/projects/${project.project_id}`);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления проекта */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый проект</DialogTitle>
            <DialogDescription>
              Введите информацию о новом проекте
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
              
              <FormField
                control={projectForm.control}
                name="id_organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Организация</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите организацию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Организации</SelectLabel>
                          {organizations.map(org => (
                            <SelectItem key={org.department_id} value={org.department_id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
    </div>
  );
}