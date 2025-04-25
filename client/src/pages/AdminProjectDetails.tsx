import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, EmployeeProject, Employee, Position, Department } from '@shared/schema';
import { ArrowLeft, Users, Plus, Edit, Trash, AlertTriangle, Pencil } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import { RouteComponentProps } from 'wouter';

// Компонент отображения деталей проекта для администраторов
export default function AdminProjectDetails({ params }: RouteComponentProps<{ id: string }>) {
  const projectId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [showRemoveEmployeeDialog, setShowRemoveEmployeeDialog] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<number | null>(null);

  // Запрос проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId && !isNaN(projectId)
  });

  // Запрос данных проекта и его сотрудников
  const { data: projectEmployeesResponse, isLoading: isLoadingProjectEmployees } = useQuery<{status: string, data: {
    title: string;
    description: string;
    employees: EmployeeProject[];
  }}>({
    queryKey: [`/api/employeeprojects/project/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
  });

  // Запрос всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
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
  
  // Использовать данные запроса
  const projectData = projectResponse?.data;
  const projectDetails = projectEmployeesResponse?.data || { title: '', description: '', employees: [] };
  
  // Форма редактирования проекта
  const editProjectForm = useForm<{ name: string, description: string }>({
    defaultValues: {
      name: "",
      description: "",
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Название проекта не может быть пустым"),
        description: z.string().optional(),
      })
    )
  });
  
  // Обновление формы при изменении данных проекта
  useEffect(() => {
    if (projectData) {
      // Используем данные из projectDetails, если они есть, иначе из projectData
      const projectName = projectDetails.title || projectData.name;
      const projectDescription = projectDetails.description || projectData.description || "";
      
      editProjectForm.reset({
        name: projectName,
        description: projectDescription,
      });
    }
  }, [projectData, projectDetails, editProjectForm]);

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
      queryClient.invalidateQueries({ queryKey: [`/api/employeeprojects/project/${projectId}`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/employeeprojects/project/${projectId}`] });
      setShowRemoveEmployeeDialog(false);
      setEmployeeToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Мутация для обновления информации о проекте
  const updateProject = useMutation({
    mutationFn: async (values: { name: string, description: string }) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}`, {
        name: values.name,
        description: values.description,
        department_id: projectData?.department_id || null
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при обновлении информации о проекте");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект обновлен",
        description: "Информация о проекте успешно обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      setShowEditProjectDialog(false);
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
    mutationFn: async () => {
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
        description: "Проект успешно удален из системы",
      });
      setShowDeleteProjectDialog(false);
      navigate('/admin/projects');
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const allEmployees = employeesResponse?.data || [];
  
  // Запрос всех должностей
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  
  // Запрос всех отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  
  const allPositions = positionsResponse?.data || [];
  const allDepartments = departmentsResponse?.data || [];
  
  // Получаем полную информацию о сотрудниках проекта
  const projectEmployeesWithDetails = projectDetails.employees.map((ep: EmployeeProject) => {
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

  // Фильтруем сотрудников, которые еще не добавлены в проект
  const availableEmployees = allEmployees.filter(
    emp => !projectDetails.employees.some((ep: EmployeeProject) => ep.employee_id === emp.employee_id)
  );

  const isLoading = isLoadingProject || isLoadingProjectEmployees || isLoadingEmployees || isLoadingPositions || isLoadingDepartments;

  // Обработчики форм
  const onSubmitAddEmployee = (values: { employeeId: string }) => {
    addEmployeeToProject.mutate(values);
  };
  
  const onSubmitEditProject = (values: { name: string, description: string }) => {
    updateProject.mutate(values);
  };

  const confirmRemoveEmployee = (employeeId: number) => {
    if (typeof employeeId === 'number') {
      setEmployeeToRemove(employeeId);
      setShowRemoveEmployeeDialog(true);
    }
  };

  const handleRemoveEmployee = () => {
    if (typeof employeeToRemove === 'number') {
      removeEmployeeFromProject.mutate(employeeToRemove);
    }
  };

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

  if (!projectData) {
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к проектам
          </Button>
          <h1 className="text-2xl font-bold">{projectDetails.title || projectData.name}</h1>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowEditProjectDialog(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteProjectDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Удалить проект
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Информация о проекте</CardTitle>
            <CardDescription>Основные сведения о проекте</CardDescription>
          </div>
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
                      <TableCell>{ep.positionName}</TableCell>
                      <TableCell>{ep.departmentName}</TableCell>
                      <TableCell>{ep.role || "Участник"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmRemoveEmployee(ep.employee_id || 0)}
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

      {/* Диалог добавления сотрудника */}
      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить сотрудника в проект</DialogTitle>
            <DialogDescription>
              Выберите сотрудника для добавления в проект "{projectData.name}"
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

      {/* Диалог редактирования проекта */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование проекта</DialogTitle>
            <DialogDescription>
              Измените информацию о проекте
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editProjectForm}>
            <form onSubmit={editProjectForm.handleSubmit(onSubmitEditProject)} className="space-y-4">
              <FormField
                control={editProjectForm.control}
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
                control={editProjectForm.control}
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
                  onClick={() => setShowEditProjectDialog(false)}
                >
                  Отмена
                </Button>
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

      {/* Диалог подтверждения удаления проекта */}
      <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить проект "{projectData.name}"?
              Это действие нельзя будет отменить.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteProjectDialog(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteProject.mutate()}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Удаление..." : "Удалить проект"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления сотрудника */}
      <Dialog open={showRemoveEmployeeDialog} onOpenChange={setShowRemoveEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription>
              Вы действительно хотите удалить этого сотрудника из проекта?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowRemoveEmployeeDialog(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveEmployee}
              disabled={removeEmployeeFromProject.isPending}
            >
              {removeEmployeeFromProject.isPending ? "Удаление..." : "Удалить из проекта"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}