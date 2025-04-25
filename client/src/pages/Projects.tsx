import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, EmployeeProject, Employee } from '@shared/schema';
import { ArrowLeft, Users, Plus, Edit, Trash } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

// Отдельная страница для проекта
export const ProjectDetails = ({ id: propId }: { id?: string }) => {
  const params = useParams();
  const idFromParams = params?.id || propId;
  const projectId = parseInt(idFromParams as string);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);

  // Запрос проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId && !isNaN(projectId),
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные проекта',
        variant: 'destructive',
      });
    },
  });

  // Запрос сотрудников проекта
  const { data: projectEmployeesResponse, isLoading: isLoadingProjectEmployees } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: ['/api/employeeprojects/project', projectId],
    enabled: !!projectId && !isNaN(projectId),
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сотрудников проекта',
        variant: 'destructive',
      });
    },
  });

  // Запрос всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список сотрудников',
        variant: 'destructive',
      });
    },
  });

  // Форма добавления сотрудника
  const addEmployeeForm = useForm<{ employeeId: string }>({
    defaultValues: {
      employeeId: "",
    },
    resolver: zodResolver(
      z.object({
        employeeId: z.string().nonempty("Необходимо выбрать сотрудника")
      })
    )
  });

  // Мутация для добавления сотрудника в проект
  const addEmployeeToProject = useMutation({
    mutationFn: async (values: { employeeId: string }) => {
      const res = await apiRequest("POST", "/api/employeeprojects", {
        employee_id: parseInt(values.employeeId),
        project_id: projectId,
        role: "Участник"
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при добавлении сотрудника в проект");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник добавлен в проект",
        description: "Сотрудник успешно добавлен в проект",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employeeprojects/project', projectId] });
      setShowAddEmployeeDialog(false);
      addEmployeeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Мутация для удаления сотрудника из проекта
  const removeEmployeeFromProject = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest("DELETE", `/api/employeeprojects/${employeeId}/${projectId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении сотрудника из проекта");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник удален из проекта",
        description: "Сотрудник успешно удален из проекта",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employeeprojects/project', projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const project = projectResponse?.data;
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

  // Фильтруем сотрудников, которые еще не добавлены в проект
  const availableEmployees = allEmployees.filter(
    emp => !employeeProjects.some(ep => ep.employee_id === emp.employee_id)
  );

  const isLoading = isLoadingProject || isLoadingProjectEmployees || isLoadingEmployees;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/admin/projects')}>
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

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/admin/projects')}>
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
              <Button onClick={() => navigate('/admin/projects')}>
                Вернуться к списку проектов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmitAddEmployee = (values: { employeeId: string }) => {
    addEmployeeToProject.mutate(values);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к проектам
        </Button>
        <h1 className="text-2xl font-bold">{project.name}</h1>
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
              <p className="text-lg">{project.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Описание:</p>
              <p>{project.description || "Описание отсутствует"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Сотрудники проекта</CardTitle>
            <CardDescription>Всего сотрудников: {projectEmployeesWithDetails.length}</CardDescription>
          </div>
          <Button onClick={() => setShowAddEmployeeDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить сотрудника
          </Button>
        </CardHeader>
        <CardContent>
          {projectEmployeesWithDetails.length === 0 ? (
            <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-medium mb-2">Сотрудники не назначены</h2>
              <p className="text-gray-500 mb-4">На данный момент к проекту не привязаны сотрудники.</p>
              <Button onClick={() => setShowAddEmployeeDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Привязать сотрудника
              </Button>
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
                    <TableHead className="w-[100px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectEmployeesWithDetails.map((ep) => (
                    <TableRow key={ep.employee_id}>
                      <TableCell className="font-medium">{ep.employeeDetails?.full_name || "Неизвестный сотрудник"}</TableCell>
                      <TableCell>{ep.employeeDetails?.position_id || "—"}</TableCell>
                      <TableCell>{ep.employeeDetails?.department_id || "—"}</TableCell>
                      <TableCell>{ep.role || "Участник"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeEmployeeFromProject.mutate(ep.employee_id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить сотрудника в проект</DialogTitle>
            <DialogDescription>
              Выберите сотрудника для добавления в проект "{project.name}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addEmployeeForm}>
            <form onSubmit={addEmployeeForm.handleSubmit(onSubmitAddEmployee)} className="space-y-4">
              <FormField
                control={addEmployeeForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сотрудник</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите сотрудника" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableEmployees.length === 0 ? (
                          <SelectItem value="none" disabled>Нет доступных сотрудников</SelectItem>
                        ) : (
                          availableEmployees.map((employee) => (
                            <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                              {employee.full_name}
                            </SelectItem>
                          ))
                        )}
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
                  onClick={() => setShowAddEmployeeDialog(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={addEmployeeToProject.isPending || availableEmployees.length === 0}
                >
                  {addEmployeeToProject.isPending ? "Добавление..." : "Добавить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Основной компонент страницы проектов (список)
export default function Projects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);

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
    queryKey: ['/api/projects'],
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
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить связи сотрудников и проектов',
        variant: 'destructive',
      });
    },
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

  const projects = projectsResponse?.data || [];
  const employeeProjects = employeeProjectsResponse?.data || [];
  
  const isLoading = isLoadingProjects || isLoadingEmployeeProjects;

  // Фильтрация проектов по поисковому запросу
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Подсчет количества сотрудников для каждого проекта
  const getEmployeeCount = (projectId: number) => {
    return employeeProjects.filter(ep => ep.project_id === projectId).length;
  };

  const onSubmitProject = (values: z.infer<typeof projectFormSchema>) => {
    createProject.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Проекты</h1>
        <Button onClick={() => setShowAddProjectDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить проект
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск проектов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список проектов</CardTitle>
          <CardDescription>
            Всего проектов: {projects.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-500">Загрузка данных...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
              <h2 className="text-xl font-medium mb-2">Список проектов пуст</h2>
              <p className="text-gray-500 mb-4">На данный момент проекты не созданы.</p>
              <Button onClick={() => setShowAddProjectDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Сотрудники</TableHead>
                    <TableHead className="w-[100px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Проекты не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.project_id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/admin/projects/${project.project_id}`)}>
                        <TableCell>{project.project_id}</TableCell>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.description || "—"}</TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый проект</DialogTitle>
            <DialogDescription>
              Введите информацию о новом проекте
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
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
                      <Input placeholder="Введите описание проекта (необязательно)" {...field} />
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
                  {createProject.isPending ? "Создание..." : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}