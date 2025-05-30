import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Project,
  EmployeeProject,
  Employee,
  Position,
  Department,
} from "@shared/schema";
import {
  ArrowLeft,
  Users,
  Plus,
  Edit,
  Trash,
  AlertTriangle,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RouteComponentProps } from "wouter";

// Компонент отображения деталей проекта для администраторов
export default function AdminProjectDetails({
                                              params,
                                            }: RouteComponentProps<{ id: string }>) {
  const projectId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [showRemoveEmployeeDialog, setShowRemoveEmployeeDialog] =
      useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<number | null>(null);
  const [employeeToEditRole, setEmployeeToEditRole] =
      useState<EmployeeProject | null>(null);

  // Запрос проекта
  const {
    data: projectResponse,
    isLoading: isLoadingProject,
    refetch: refetchProject,
  } = useQuery<{ status: string; data: Project }>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 1000 * 60, // 1 минута
  });

  // Запрос сотрудников проекта
  const {
    data: projectEmployeesResponse,
    isLoading: isLoadingProjectEmployees,
    refetch: refetchEmployees,
  } = useQuery<{ status: string; data: EmployeeProject[] }>({
    queryKey: [`/api/employeeprojects/project/${projectId}`],
    enabled: !!projectId && !isNaN(projectId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 1000 * 60, // 1 минута
  });

  // Запрос всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{
    status: string;
    data: Employee[];
  }>({
    queryKey: ["/api/employees"],
  });

  // Запрос ролей в проекте
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery<{status: string, data: string[]}>({
    queryKey: ['/api/project_roles'],
  });

  // Форма добавления сотрудника
  const addEmployeeForm = useForm<{ employeeId: string; isRP: boolean; roleGroup: string; role: string }>({
    defaultValues: {
      employeeId: "",
      isRP: false,
      roleGroup: "",
      role: "",
    },
    resolver: zodResolver(
        z.object({
          employeeId: z.string().nonempty("Необходимо выбрать сотрудника"),
          isRP: z.boolean(),
          roleGroup: z.string().optional(),
          role: z.string().optional(),
        }).refine((data) => {
          if (data.isRP) return true; // Если РП отмечен, роль не обязательна
          return data.roleGroup && data.role; // Иначе обязательны группа и роль
        }, {
          message: "Выберите роль или отметьте РП",
          path: ["role"],
        }),
    ),
  });

  // Возможные роли в проекте
  const projectRoles = [
    { value: "Руководитель", label: "Руководитель проекта" },
    { value: "Аналитик", label: "Бизнес-аналитик" },
    { value: "Разработчик", label: "Разработчик" },
    { value: "Тестировщик", label: "Тестировщик" },
    { value: "Дизайнер", label: "Дизайнер" },
    { value: "Участник", label: "Участник" },
  ];

  // Использовать данные запроса
  console.log("Project Response:", projectResponse);
  console.log("Project Data:", projectResponse?.data);
  console.log("Project Employees Response:", projectEmployeesResponse);

  // Правильное получение данных проекта из ответа API
  // В нашем случае API возвращает массив объектов
  // Находим нужный проект по ID
  const projectData = projectResponse?.data
      ? Array.isArray(projectResponse.data)
          ? projectResponse.data.find(
              (project) => project.project_id === Number(projectId),
          )
          : projectResponse.data
      : undefined;

  console.log("Обработанные данные проекта:", projectData);
  console.log("Employees в проекте:", projectEmployeesResponse?.data || []);

  const projectEmployees = projectEmployeesResponse?.data || [];

  // Форма редактирования проекта
  const editProjectForm = useForm<{
    name: string;
    description: string;
    id_organization: number | undefined;
  }>({
    defaultValues: {
      name: "",
      description: "",
      "id_organization": undefined,
    },
    resolver: zodResolver(
        z.object({
          name: z.string().min(1, "Название проекта не может быть пустым"),
          description: z.string().optional(),
          id_organization: z
              .number({
                required_error: "Выберите организацию",
                invalid_type_error: "Выберите организацию",
              })
              .optional(),
        }),
    ),
  });

  // Форма редактирования роли сотрудника
  const editRoleForm = useForm<{
    role_group_id: number | undefined;
    role_id: number | undefined;
    is_rp: boolean;
  }>({
    defaultValues: {
      role_group_id: undefined,
      role_id: undefined,
      is_rp: false,
    },
    resolver: zodResolver(
        z.object({
          role_group_id: z.number().optional(),
          role_id: z.number().optional(),
          is_rp: z.boolean(),
        }).refine((data) => data.is_rp || data.role_id, {
          message: "Необходимо выбрать роль или отметить РП 1",
          path: ["role_id"],
        }),
    ),
  });

  // Обновление формы при изменении данных проекта
  useEffect(() => {
    console.log("projectData в useEffect:", projectData);
    if (projectData) {
      // Используем данные из projectData
      const projectName = projectData.name;
      const projectDescription = projectData.description || "";
      const projectOrganization = projectData.id_organization || undefined;

      console.log(
          `Updating form with name: ${projectName}, description: ${projectDescription}, organization: ${projectOrganization}`,
      );

      editProjectForm.reset({
        name: projectName,
        description: projectDescription,
        id_organization: projectOrganization,
      });
    }
  }, [projectData, editProjectForm]);

  // Мутация для добавления сотрудника в проект
  const addEmployeeToProject = useMutation({
    mutationFn: async (values: { employeeId: string; roleId: number }) => {
      const res = await apiRequest("POST", "/api/employeeprojects", {
        employee_id: parseInt(values.employeeId),
        project_id: projectId,
        role_id: values.roleId,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
            errorData.message || "Ошибка при добавлении сотрудника в проект",
        );
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Сотрудник добавлен в проект",
        description: "Сотрудник успешно добавлен в проект",
      });
      // Принудительное обновление всех связанных запросов
      queryClient.invalidateQueries({
        queryKey: [`/api/employeeprojects/project/${projectId}`],
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employeeprojects`] });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });

      // Задержка для завершения анимации закрытия диалога
      setTimeout(() => {
        // Еще раз обновляем данные, чтобы точно получить актуальную информацию
        queryClient.refetchQueries({
          queryKey: [`/api/employeeprojects/project/${projectId}`],
        });
        queryClient.refetchQueries({
          queryKey: [`/api/projects/${projectId}`],
        });
      }, 300);

      setShowAddEmployeeDialog(false);
      addEmployeeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для удаления сотрудника из проекта
  const removeEmployeeFromProject = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest(
          "DELETE",
          `/api/employeeprojects/${employeeId}/${projectId}`,
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
            errorData.message || "Ошибка при удалении сотрудника из проекта",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник удален из проекта",
        description: "Сотрудник успешно удален из проекта",
      });
      // Принудительное обновление всех связанных запросов
      queryClient.invalidateQueries({
        queryKey: [`/api/employeeprojects/project/${projectId}`],
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employeeprojects`] });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });

      // Задержка для завершения анимации закрытия диалога
      setTimeout(() => {
        // Еще раз обновляем данные, чтобы точно получить актуальную информацию
        queryClient.refetchQueries({
          queryKey: [`/api/employeeprojects/project/${projectId}`],
        });
        queryClient.refetchQueries({
          queryKey: [`/api/projects/${projectId}`],
        });
      }, 300);

      setShowRemoveEmployeeDialog(false);
      setEmployeeToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для обновления информации о проекте
  const updateProject = useMutation({
    mutationFn: async (values: {
      name: string;
      description: string;
      id_organization?: number;
    }) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}`, {
        name: values.name,
        description: values.description,
        department_id: projectData?.department_id || null,
        id_organization: values.id_organization || null,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
            errorData.message || "Ошибка при обновлении информации о проекте",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Проект обновлен",
        description: "Информация о проекте успешно обновлена",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });
      setShowEditProjectDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для обновления роли сотрудника в проекте
  const updateEmployeeRole = useMutation({
    mutationFn: async (values: { employeeId: number; role_id: number | null }) => {
      const res = await apiRequest(
          "PUT",
          `/api/employeeprojects/${values.employeeId}/${projectId}`,
          {
            role_id: values.role_id,
          },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
            errorData.message || "Ошибка при обновлении роли сотрудника",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Роль обновлена",
        description: "Роль сотрудника в проекте успешно обновлена",
      });
      // Принудительное обновление всех связанных запросов
      queryClient.invalidateQueries({
        queryKey: [`/api/employeeprojects/project/${projectId}`],
      });
      queryClient.invalidateQueries({ queryKey: [`/api/employeeprojects`] });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${projectId}`],
      });

      // Задержка для завершения анимации закрытия диалога
      setTimeout(() => {
        // Еще раз обновляем данные, чтобы точно получить актуальную информацию
        queryClient.refetchQueries({
          queryKey: [`/api/employeeprojects/project/${projectId}`],
        });
        queryClient.refetchQueries({
          queryKey: [`/api/projects/${projectId}`],
        });
      }, 300);

      setShowEditRoleDialog(false);
      setEmployeeToEditRole(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
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
      navigate("/admin/projects");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const allEmployees = employeesResponse?.data || [];

  // Запрос всех должностей
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{
    status: string;
    data: Position[];
  }>({
    queryKey: ["/api/positions"],
  });

  // Запрос всех отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } =
      useQuery<{ status: string; data: Department[] }>({
        queryKey: ["/api/departments"],
      });

  // Запрос на получение списка организаций
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
      useQuery<{ status: string; data: any[] }>({
        queryKey: ["/api/organizations"],
      });

  // Запрос ролей проектов
  const { data: projectRolesResponse, isLoading: isLoadingProjectRoles } = useQuery<{
    status: string;
    data: { id: number; parent_id: number | null; name: string; is_rp: boolean | null }[];
  }>({
    queryKey: ["/api/project-roles"],
  });

  const allPositions = positionsResponse?.data || [];
  const allDepartments = departmentsResponse?.data || [];
  const allProjectRoles = projectRolesResponse?.data || [];

  // Получаем корневые роли (parent_id === null)
  const rootRoles = allProjectRoles.filter(role => role.parent_id === null);

  // Получаем РП роль (is_rp === true)
  const rpRole = allProjectRoles.find(role => role.is_rp === true);

  // Функция для получения дочерних ролей по ID родительской роли
  const getChildRoles = (parentId: number) => {
    return allProjectRoles.filter(role => role.parent_id === parentId);
  };

  // Отслеживаем выбранную группу ролей и состояние РП
  const selectedRoleGroup = addEmployeeForm.watch("roleGroup");
  const isRP = addEmployeeForm.watch("isRP");
  const availableChildRoles = selectedRoleGroup ? getChildRoles(parseInt(selectedRoleGroup)) : [];

  // Для диалога редактирования роли
  const parentRoles = rootRoles;

  // Сбрасываем роль при изменении группы или РП
  React.useEffect(() => {
    if (selectedRoleGroup || isRP) {
      addEmployeeForm.setValue("role", "");
    }
  }, [selectedRoleGroup, isRP, addEmployeeForm]);

  // Получаем полную информацию о сотрудниках проекта
  const projectEmployeesWithDetails = projectEmployees.map(
      (ep: EmployeeProject) => {
        const employee = allEmployees.find(
            (e) => e.employee_id === ep.employee_id,
        );
        const position = allPositions.find(
            (p) => p.position_id === employee?.position_id,
        );
        const department = allDepartments.find(
            (d) => d.department_id === employee?.department_id,
        );

        return {
          ...ep,
          employeeDetails: employee,
          positionName: position?.name || "Неизвестная должность",
          departmentName: department?.name || "Неизвестный отдел",
        };
      },
  );

  // Фильтруем сотрудников, которые еще не добавлены в проект
  const availableEmployees = allEmployees.filter(
      (emp) =>
          !projectEmployees.some(
              (ep: EmployeeProject) => ep.employee_id === emp.employee_id,
          ),
  );

  const isLoading =
      isLoadingProject ||
      isLoadingProjectEmployees ||
      isLoadingEmployees ||
      isLoadingPositions ||
      isLoadingDepartments;

  // Обработчики форм
  const onSubmitAddEmployee = (values: {
    employeeId: string;
    isRP: boolean;
    roleGroup: string;
    role: string;
  }) => {
    let roleId: number;

    if (values.isRP && rpRole) {
      // Если отмечен РП, используем ID РП роли
      roleId = rpRole.id;
    } else {
      // Иначе находим ID выбранной роли
      const selectedRole = availableChildRoles.find(r => r.name === values.role);
      roleId = selectedRole?.id || 1; // fallback to first role
    }

    addEmployeeToProject.mutate({
      employeeId: values.employeeId,
      roleId: roleId,
    });
  };

  const onSubmitEditProject = (values: {
    name: string;
    description: string;
    id_organization?: number;
  }) => {
    updateProject.mutate(values);
  };

  const onSubmitEditRole = (values: {
    role_group_id: number | undefined;
    role_id: number | undefined;
    is_rp: boolean;
  }) => {
    if (employeeToEditRole?.employee_id) {
      const rpRole = allProjectRoles?.find(r => r.is_rp);
      let roleId: number | null = null;
console.log(rpRole);
      if (values.is_rp && rpRole) {
        roleId = rpRole.id;
      } else if (values.role_id) {
        roleId = values.role_id;
      } else {
        // Если ни РП, ни роль не выбраны, показываем ошибку
        toast({
          title: "Ошибка",
          description: "Необходимо выбрать роль или отметить РП",
          variant: "destructive",
        });
        return;
      }

      updateEmployeeRole.mutate({
        employeeId: employeeToEditRole.employee_id,
        role_id: roleId,
      });

      // Закрываем диалог
      setShowEditRoleDialog(false);
      setEmployeeToEditRole(null);
    }
  };

  const confirmRemoveEmployee = (employeeId: number) => {
    if (typeof employeeId === "number") {
      setEmployeeToRemove(employeeId);
      setShowRemoveEmployeeDialog(true);
    }
  };

  const openEditRoleDialog = (employeeProject: EmployeeProject) => {
    setEmployeeToEditRole(employeeProject);

    const rpRole = allProjectRoles?.find(r => r.is_rp);
    const isRp = employeeProject.role_id === rpRole?.id;

    editRoleForm.reset({
      role_group_id: isRp ? rpRole?.id : (employeeProject.role_id ? allProjectRoles?.find(r => r.id === employeeProject.role_id)?.parent_id : undefined),
      role_id: isRp ? undefined : employeeProject.role_id,
      is_rp: isRp
    });
    setShowEditRoleDialog(true);
  };

  // Проверяем, есть ли уже РП в проекте
  const hasExistingRP = () => {
    const rpRole = allProjectRoles?.find(r => r.is_rp);
    if (!rpRole) return false;

    return projectEmployees.some(ep => ep.role_id === rpRole.id);
  };

  // Проверяем, является ли текущий сотрудник РП
  const isCurrentEmployeeRP = () => {
    const rpRole = allProjectRoles?.find(r => r.is_rp);
    if (!rpRole || !employeeToEditRole) return false;

    return employeeToEditRole.role_id === rpRole.id;
  };

  const handleRemoveEmployee = () => {
    if (typeof employeeToRemove === "number") {
      removeEmployeeFromProject.mutate(employeeToRemove);
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button
                variant="outline"
                size="sm"
                className="mr-4"
                onClick={() => navigate("/admin/projects")}
            >
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
            <Button
                variant="outline"
                size="sm"
                className="mr-4"
                onClick={() => navigate("/admin/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
            <h1 className="text-2xl font-bold">Проект не найден</h1>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-12">
                <h2 className="text-xl font-medium mb-2">Проект не найден</h2>
                <p className="text-gray-500 mb-4">
                  Проект с ID {projectId} не существует.
                </p>
                <Button onClick={() => navigate("/admin/projects")}>
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
            <Button
                variant="outline"
                size="sm"
                className="mr-4"
                onClick={() => navigate("/admin/projects")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к проектам
            </Button>
            <h1 className="text-2xl font-bold">
              {projectData?.name || "Проект"}
            </h1>
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
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Принудительно сбрасываем кэш запросов
                  queryClient.invalidateQueries({
                    queryKey: [`/api/projects/${projectId}`],
                  });
                  queryClient.invalidateQueries({
                    queryKey: [`/api/employeeprojects/project/${projectId}`],
                  });

                  // Принудительно запрашиваем данные заново
                  refetchProject();
                  refetchEmployees();

                  // Оповещаем пользователя
                  toast({
                    title: "Обновление данных",
                    description: "Данные проекта обновляются...",
                  });

                  // Через 500мс снова обновляем данные, чтобы гарантировать актуальность
                  setTimeout(() => {
                    queryClient.refetchQueries({
                      queryKey: [`/api/projects/${projectId}`],
                    });
                    queryClient.refetchQueries({
                      queryKey: [`/api/employeeprojects/project/${projectId}`],
                    });
                  }, 500);
                }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить данные
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Название проекта:
                </p>
                <p className="text-lg">
                  {projectData?.name || "Название проекта"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Описание:</p>
                <p className="text-base">
                  {projectData?.description || "Описание отсутствует"}
                </p>
              </div>
              {/* Добавляем отладочную информацию */}
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <p className="text-xs text-gray-500">Информация для отладки:</p>
                <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(projectData, null, 2)}
              </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Сотрудники проекта</CardTitle>
              <CardDescription>
                Всего сотрудников: {projectEmployeesWithDetails.length}
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddEmployeeDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </CardHeader>
          <CardContent>
            {projectEmployeesWithDetails.length === 0 ? (
                <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
                  <h2 className="text-xl font-medium mb-2">
                    Сотрудники не назначены
                  </h2>
                  <p className="text-gray-500 mb-4">
                    На данный момент к проекту не привязаны сотрудники.
                  </p>
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
                            <TableCell className="font-medium">
                              {ep.employeeDetails?.full_name ||
                                  "Неизвестный сотрудник"}
                            </TableCell>
                            <TableCell>{ep.positionName}</TableCell>
                            <TableCell>{ep.departmentName}</TableCell>
                            <TableCell>
                              {ep.role_id
                                  ? allProjectRoles?.find(r => r.id === ep.role_id)?.name || "Роль не найдена"
                                  : "Роль не выбрана"
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditRoleDialog(ep)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        confirmRemoveEmployee(ep.employee_id || 0)
                                    }
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

        {/* Диалог добавления сотрудника */}
        <Dialog
            open={showAddEmployeeDialog}
            onOpenChange={setShowAddEmployeeDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить сотрудника в проект</DialogTitle>
              <DialogDescription>
                Выберите сотрудника для добавления в проект "
                {projectData?.name || "Проект"}"
              </DialogDescription>
            </DialogHeader>

            <Form {...addEmployeeForm}>
              <form
                  onSubmit={addEmployeeForm.handleSubmit(onSubmitAddEmployee)}
                  className="space-y-4"
              >
                <div className="flex gap-2">
                  <FormField
                      control={addEmployeeForm.control}
                      name="employeeId"
                      render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Сотрудник</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите сотрудника" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableEmployees.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                      Нет доступных сотрудников
                                    </SelectItem>
                                ) : (
                                    availableEmployees.map((employee) => (
                                        <SelectItem
                                            key={employee.employee_id}
                                            value={employee.employee_id.toString()}
                                        >
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

                  <FormField
                      control={addEmployeeForm.control}
                      name="isRP"
                      render={({ field }) => (
                          <FormItem className="flex flex-col items-center justify-end">
                            <FormLabel className="text-sm">РП</FormLabel>
                            <FormControl>
                              <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-2"
                              />
                            </FormControl>
                          </FormItem>
                      )}
                  />
                </div>

                <FormField
                    control={addEmployeeForm.control}
                    name="roleGroup"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Группа ролей</FormLabel>
                          <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isRP}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  isRP
                                      ? "РП выбран - группа ролей недоступна"
                                      : "Выберите группу ролей"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rootRoles.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    Нет доступных групп ролей
                                  </SelectItem>
                              ) : (
                                  rootRoles.map((role) => (
                                      <SelectItem
                                          key={role.id}
                                          value={role.id.toString()}
                                      >
                                        {role.name}
                                      </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={addEmployeeForm.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Роль в проекте</FormLabel>
                          <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isRP || !selectedRoleGroup}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  isRP
                                      ? "РП выбран - роль недоступна"
                                      : !selectedRoleGroup
                                          ? "Сначала выберите группу ролей"
                                          : "Выберите роль"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableChildRoles.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    {isRP
                                        ? "РП выбран"
                                        : !selectedRoleGroup
                                            ? "Выберите группу ролей"
                                            : "Нет доступных ролей в этой группе"
                                    }
                                  </SelectItem>
                              ) : (
                                  availableChildRoles.map((role) => (
                                      <SelectItem
                                          key={role.id}
                                          value={role.name}
                                      >
                                        {role.name}
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
                      disabled={
                          addEmployeeToProject.isPending ||
                          availableEmployees.length === 0
                      }
                  >
                    {addEmployeeToProject.isPending
                        ? "Добавление..."
                        : "Добавить"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования проекта */}
        <Dialog
            open={showEditProjectDialog}
            onOpenChange={setShowEditProjectDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование проекта</DialogTitle>
              <DialogDescription>Измените информацию о проекте</DialogDescription>
            </DialogHeader>

            <Form {...editProjectForm}>
              <form
                  onSubmit={editProjectForm.handleSubmit(onSubmitEditProject)}
                  className="space-y-4"
              >
                <FormField
                    control={editProjectForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название проекта</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Введите название проекта"
                                {...field}
                            />
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

                <FormField
                    control={editProjectForm.control}
                    name="id_organization"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Организация</FormLabel>
                          <Select
                              onValueChange={(value) =>
                                  field.onChange(parseInt(value, 10))
                              }
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
                                {organizationsResponse?.data?.map((org) => (
                                    <SelectItem
                                        key={org.department_id}
                                        value={org.department_id.toString()}
                                    >
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
                      onClick={() => setShowEditProjectDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={updateProject.isPending}>
                    {updateProject.isPending
                        ? "Сохранение..."
                        : "Сохранить изменения"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог подтверждения удаления проекта */}
        <Dialog
            open={showDeleteProjectDialog}
            onOpenChange={setShowDeleteProjectDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Подтверждение удаления
              </DialogTitle>
              <DialogDescription>
                Вы действительно хотите удалить проект "
                {projectData?.name || "Проект"}"? Это действие нельзя будет
                отменить.
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
        <Dialog
            open={showRemoveEmployeeDialog}
            onOpenChange={setShowRemoveEmployeeDialog}
        >
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
                {removeEmployeeFromProject.isPending
                    ? "Удаление..."
                    : "Удалить из проекта"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования роли сотрудника */}
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование роли</DialogTitle>
              <DialogDescription>
                Изменение роли сотрудника в проекте
              </DialogDescription>
            </DialogHeader>

            <Form {...editRoleForm}>
              <form
                  onSubmit={editRoleForm.handleSubmit(onSubmitEditRole)}
                  className="space-y-4"
              >
                {/* Чекбокс РП */}
                <FormField
                    control={editRoleForm.control}
                    name="is_rp"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <div className="relative">
                              <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      // Если отмечен РП, сбрасываем селекторы ролей
                                      editRoleForm.setValue("role_group_id", undefined);
                                      editRoleForm.setValue("role_id", undefined);
                                    }
                                  }}
                                  disabled={hasExistingRP() && !isCurrentEmployeeRP()}
                                  title={hasExistingRP() && !isCurrentEmployeeRP() ? "У текущего проекта уже есть выбранный РП. Сначала отмените выбор РП, чтобы назначить другого сотрудника." : undefined}
                              />
                            </div>
                          </FormControl>
                          <FormLabel className="font-normal">
                            Руководитель проекта (РП)
                          </FormLabel>
                        </FormItem>
                    )}
                />

                {/* Группа ролей */}
                <FormField
                    control={editRoleForm.control}
                    name="role_group_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Группа ролей</FormLabel>
                          <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => {
                                field.onChange(value ? parseInt(value) : undefined);
                                editRoleForm.setValue("role_id", undefined);
                              }}
                              disabled={editRoleForm.watch("is_rp")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите группу ролей" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rootRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Роль */}
                <FormField
                    control={editRoleForm.control}
                    name="role_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Роль</FormLabel>
                          <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                              disabled={editRoleForm.watch("is_rp") || !editRoleForm.watch("role_group_id")}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите роль" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {editRoleForm.watch("role_group_id") &&
                                  allProjectRoles
                                      ?.filter(r => r.parent_id === editRoleForm.watch("role_group_id"))
                                      .map((role) => (
                                          <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                          </SelectItem>
                                      ))
                              }
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
                      onClick={() => setShowEditRoleDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={updateEmployeeRole.isPending}>
                    {updateEmployeeRole.isPending
                        ? "Сохранение..."
                        : "Сохранить изменения"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
  );
}
