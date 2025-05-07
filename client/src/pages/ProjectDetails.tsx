import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, EmployeeProject, Employee } from '@shared/schema';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface ProjectDetailsProps {
  id?: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ id: propId }) => {
  const params = useParams();
  const idFromParams = params?.id || propId;
  const projectId = parseInt(idFromParams as string);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  
  // Определение, находимся ли мы в админской части
  const isAdminRoute = location.startsWith('/admin');

  // Запрос проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId && !isNaN(projectId),
  });

  // Запрос сотрудников проекта
  const { data: projectEmployeesResponse, isLoading: isLoadingProjectEmployees } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: ['/api/employeeprojects/project', projectId],
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
  const projectEmployeesWithDetails = employeeProjects.map((ep: any) => {
    const employee = allEmployees.find((e: any) => e.employee_id === ep.employee_id);
    return {
      ...ep,
      employeeDetails: employee
    };
  });

  // Фильтруем сотрудников, которые еще не добавлены в проект
  const availableEmployees = allEmployees.filter(
    (emp: any) => !employeeProjects.some((ep: any) => ep.employee_id === emp.employee_id)
  );

  const isLoading = isLoadingProject || isLoadingProjectEmployees || isLoadingEmployees;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(isAdminRoute ? '/admin/projects' : '/projects')}>
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
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(isAdminRoute ? '/admin/projects' : '/projects')}>
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
              <Button onClick={() => navigate(isAdminRoute ? '/admin/projects' : '/projects')}>
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
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(isAdminRoute ? '/admin/projects' : '/projects')}>
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
              <p className="text-sm font-medium text-gray-500">ID проекта:</p>
              <p>#{project.project_id}</p>
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
                  {projectEmployeesWithDetails.map((ep: any) => (
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
                          availableEmployees.map((employee: any) => (
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

export default ProjectDetails;