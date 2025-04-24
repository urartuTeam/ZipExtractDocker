import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";

interface Project {
  project_id: number;
  name: string;
  department_id: number;
}

interface Department {
  department_id: number;
  name: string;
}

interface EmployeeProject {
  employee_id: number;
  project_id: number;
  role: string;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

// Схема валидации для формы
const projectFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа").max(100, "Название не должно превышать 100 символов"),
  department_id: z.string().transform(val => Number(val)),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  // Form для создания
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      department_id: "",
    },
  });

  // Form для редактирования
  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      department_id: "",
    },
  });

  // Mutation для создания нового проекта
  const createProject = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании проекта");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект создан успешно",
        description: "Новый проект был добавлен в систему",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при создании проекта",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для обновления проекта
  const updateProject = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: ProjectFormValues }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при обновлении проекта");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект обновлен успешно",
        description: "Информация о проекте была обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при обновлении проекта",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для удаления проекта
  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/projects/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении проекта");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект удален успешно",
        description: "Проект был удален из системы",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при удалении проекта",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Запрос на получение проектов
  const { data: projectsData, isLoading, error } = useQuery<{ status: string, data: Project[] }>({
    queryKey: ['/api/projects'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение связей сотрудников и проектов
  const { data: employeeProjectsData } = useQuery<{ status: string, data: EmployeeProject[] }>({
    queryKey: ['/api/employeeprojects'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Фильтрация проектов на основе поискового запроса
  const filteredProjects = projectsData?.data.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return '—';
    const department = departmentsData?.data.find(dept => dept.department_id === departmentId);
    return department ? department.name : '—';
  };

  // Получение сотрудников на проекте
  const getProjectEmployees = (projectId: number) => {
    if (!employeeProjectsData?.data) return [];
    
    return employeeProjectsData.data
      .filter(ep => ep.project_id === projectId)
      .map(ep => {
        const employee = employeesData?.data.find(e => e.employee_id === ep.employee_id);
        return {
          id: ep.employee_id,
          name: employee ? employee.full_name : `Сотрудник #${ep.employee_id}`,
          role: ep.role
        };
      });
  };

  const onSubmit = (values: ProjectFormValues) => {
    createProject.mutate(values);
  };

  const onEditSubmit = (values: ProjectFormValues) => {
    if (selectedProject) {
      updateProject.mutate({ id: selectedProject.project_id, values });
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    editForm.reset({
      name: project.name,
      department_id: project.department_id.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProject) {
      deleteProject.mutate(selectedProject.project_id);
    }
  };

  // Проверка, есть ли сотрудники, привязанные к проекту
  const hasAssociatedEmployees = (projectId: number) => {
    if (!employeeProjectsData?.data) return false;
    
    return employeeProjectsData.data.some(ep => ep.project_id === projectId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Проекты</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Добавить проект</Button>
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
            Всего проектов: {projectsData?.data.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-500">Загрузка данных...</div>
            </div>
          ) : error ? (
            <div className="text-red-500">
              Ошибка при загрузке данных. Пожалуйста, попробуйте позже.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead>Участники</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
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
                    filteredProjects.map((project) => {
                      const projectEmployees = getProjectEmployees(project.project_id);
                      const hasEmployees = hasAssociatedEmployees(project.project_id);
                      
                      return (
                        <TableRow key={project.project_id}>
                          <TableCell>{project.project_id}</TableCell>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{getDepartmentName(project.department_id)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {projectEmployees.length > 0 ? (
                                projectEmployees.slice(0, 3).map((emp) => (
                                  <Badge key={emp.id} variant="outline" className="py-1">
                                    {emp.name} ({emp.role})
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500">Нет участников</span>
                              )}
                              {projectEmployees.length > 3 && (
                                <Badge variant="secondary" className="py-1">
                                  +{projectEmployees.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(project)}
                              >
                                Изменить
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(project)}
                                disabled={hasEmployees}
                                title={hasEmployees ? "Невозможно удалить: к проекту привязаны сотрудники" : ""}
                              >
                                Удалить
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог добавления проекта */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить новый проект</DialogTitle>
            <DialogDescription>
              Введите информацию о новом проекте
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отдел</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentsData?.data.map((dept) => (
                          <SelectItem 
                            key={dept.department_id} 
                            value={dept.department_id.toString()}
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
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

      {/* Диалог редактирования проекта */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать проект</DialogTitle>
            <DialogDescription>
              Измените информацию о проекте
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отдел</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departmentsData?.data.map((dept) => (
                          <SelectItem 
                            key={dept.department_id} 
                            value={dept.department_id.toString()}
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateProject.isPending}
                >
                  {updateProject.isPending ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить проект "{selectedProject?.name}". 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}