import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataRefresh } from "@/hooks/use-data-refresh";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FormDescription,
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

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  phone: string | null;
  email: string | null;
  manager_id: number | null;
  department_id: number | null;
  category_parent_id: number | null;
}

interface Position {
  position_id: number;
  name: string;
  department_id?: number | null;
  is_category?: boolean;
}

interface Department {
  department_id: number;
  name: string;
}

interface PositionDepartment {
  position_department_id: number;
  position_id: number;
  department_id: number;
}

// Схема валидации для формы
const employeeFormSchema = z.object({
  full_name: z.string().min(2, "ФИО должно содержать минимум 2 символа").max(100, "ФИО не должно превышать 100 символов"),
  position_id: z.string().nullable().transform(val => 
    val && val !== "null" ? Number(val) : null
  ),
  department_id: z.string().nullable().transform(val => 
    val && val !== "null" ? Number(val) : null
  ),
  manager_id: z.string().nullable().transform(val => 
    val && val !== "null" ? Number(val) : null
  ),
  category_parent_id: z.string().nullable().transform(val => 
    val && val !== "null" ? Number(val) : null
  ),
  email: z.string().email("Некорректный email").nullable().or(z.literal('')).transform(val => 
    val === '' ? null : val
  ),
  phone: z.string().nullable().or(z.literal('')).transform(val => 
    val === '' ? null : val
  ),
}).refine(data => {
  // Проверяем, что либо position_id, либо department_id заполнен
  return data.position_id !== null || data.department_id !== null;
}, {
  message: "Необходимо выбрать либо должность, либо отдел",
  path: ["position_id"]
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [editSelectedPosition, setEditSelectedPosition] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form для создания
  const form = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      position_id: null as any,
      department_id: null as any,
      manager_id: null as any,
      category_parent_id: null as any,
      email: "",
      phone: "",
    },
  });

  // Form для редактирования
  const editForm = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      position_id: null as any,
      department_id: null as any,
      manager_id: null as any,
      category_parent_id: null as any,
      email: "",
      phone: "",
    },
  });

  // Mutation для создания нового сотрудника
  const createEmployee = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      const res = await apiRequest("POST", "/api/employees", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании сотрудника");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник добавлен успешно",
        description: "Новый сотрудник был добавлен в систему",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при добавлении сотрудника",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для обновления сотрудника
  const updateEmployee = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: EmployeeFormValues }) => {
      const res = await apiRequest("PUT", `/api/employees/${id}`, values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при обновлении сотрудника");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник обновлен успешно",
        description: "Информация о сотруднике была обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedEmployee(null);
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при обновлении сотрудника",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для удаления сотрудника
  const deleteEmployee = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/employees/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении сотрудника");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Сотрудник удален успешно",
        description: "Сотрудник был удален из системы",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при удалении сотрудника",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Запрос на получение сотрудников
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение должностей
  const { data: positionsData } = useQuery<{ status: string, data: Position[] }>({
    queryKey: ['/api/positions'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение связей между должностями и отделами
  const { data: positionDepartmentsData } = useQuery<{ status: string, data: PositionDepartment[] }>({
    queryKey: ['/api/pd'],
  });

  // Настройка автоматического обновления данных каждые 5 секунд
  useDataRefresh(['/api/employees', '/api/positions', '/api/departments', '/api/pd']);

  // Фильтрация сотрудников на основе поискового запроса
  const filteredEmployees = employeesData?.data.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isLoading = isLoadingEmployees;
  const error = employeesError;

  // Получение названия должности по ID
  const getPositionName = (positionId: number | null) => {
    if (!positionId) return '—';
    const position = positionsData?.data.find(pos => pos.position_id === positionId);
    return position ? position.name : '—';
  };

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return '—';
    const department = departmentsData?.data.find(dept => dept.department_id === departmentId);
    return department ? department.name : '—';
  };

  // Получение имени руководителя по ID
  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '—';
    const manager = employeesData?.data.find(emp => emp.employee_id === managerId);
    return manager ? manager.full_name : '—';
  };

  // Получение списка должностей для выбранного отдела
  const getPositionsForDepartment = (departmentId: string | null) => {
    if (!departmentId || departmentId === "null" || !positionDepartmentsData?.data) {
      return positionsData?.data || [];
    }

    // Получаем ID должностей, связанных с выбранным отделом
    const positionIds = positionDepartmentsData.data
      .filter(pd => pd.department_id === Number(departmentId))
      .map(pd => pd.position_id);

    // Фильтруем и возвращаем должности
    return positionsData?.data.filter(pos => positionIds.includes(pos.position_id)) || [];
  };

  // Обработчик изменения отдела
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    if (isEditDialogOpen) {
      // Сбрасываем выбранную должность, если отдел изменился
      editForm.setValue('position_id', null);
    } else {
      // Сбрасываем выбранную должность, если отдел изменился
      form.setValue('position_id', null);
    }
  };

  const onSubmit = (values: EmployeeFormValues) => {
    createEmployee.mutate(values);
  };

  const onEditSubmit = (values: EmployeeFormValues) => {
    if (selectedEmployee) {
      updateEmployee.mutate({ id: selectedEmployee.employee_id, values });
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedDepartment(employee.department_id ? employee.department_id.toString() : "null");
    
    editForm.reset({
      full_name: employee.full_name,
      position_id: employee.position_id !== null ? employee.position_id.toString() : null as any,
      department_id: employee.department_id !== null ? employee.department_id.toString() : null as any,
      manager_id: employee.manager_id !== null ? employee.manager_id.toString() : null as any,
      email: employee.email || "",
      phone: employee.phone || "",
    });
    
    setIsEditDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee.mutate(selectedEmployee.employee_id);
    }
  };

  // Проверка, может ли сотрудник быть удален
  const canBeDeleted = (employeeId: number) => {
    // Проверка, есть ли другие сотрудники, которые имеют этого сотрудника как руководителя
    const hasSubordinates = employeesData?.data.some(emp => emp.manager_id === employeeId);
    
    return !hasSubordinates;
  };

  // Отфильтрованные должности на основе выбранного отдела
  const filteredPositions = getPositionsForDepartment(selectedDepartment);
  
  // Проверка, является ли должность категорией
  const isPositionCategory = (positionId: string | null): boolean => {
    if (!positionId || positionId === "null" || !positionsData?.data) return false;
    const position = positionsData.data.find(pos => pos.position_id.toString() === positionId);
    return position?.is_category || false;
  };
  
  // Обработчик изменения должности в форме создания
  const handlePositionChange = (positionId: string) => {
    setSelectedPosition(positionId);
    // Преобразуем строку в число или null
    const numericValue = positionId !== "null" ? positionId : null;
    form.setValue('position_id', numericValue as any);
    
    // Если выбрана не категория, сбрасываем родительскую должность
    if (!isPositionCategory(positionId)) {
      form.setValue('category_parent_id', null);
    }
  };
  
  // Обработчик изменения должности в форме редактирования
  const handleEditPositionChange = (positionId: string) => {
    setEditSelectedPosition(positionId);
    // Преобразуем строку в число или null
    const numericValue = positionId !== "null" ? positionId : null;
    editForm.setValue('position_id', numericValue as any);
    
    // Если выбрана не категория, сбрасываем родительскую должность
    if (!isPositionCategory(positionId)) {
      editForm.setValue('category_parent_id', null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Сотрудники</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Добавить сотрудника</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск сотрудников..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>
            Всего сотрудников: {employeesData?.data.length || 0}
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead>Руководитель</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead className="w-[160px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Сотрудники не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => {
                      const canDelete = canBeDeleted(employee.employee_id);
                      
                      return (
                        <TableRow key={employee.employee_id}>
                          <TableCell>{employee.employee_id}</TableCell>
                          <TableCell className="font-medium">{employee.full_name}</TableCell>
                          <TableCell>{getPositionName(employee.position_id)}</TableCell>
                          <TableCell>{getDepartmentName(employee.department_id)}</TableCell>
                          <TableCell>{getManagerName(employee.manager_id)}</TableCell>
                          <TableCell>
                            {employee.email && <div>{employee.email}</div>}
                            {employee.phone && <div>{employee.phone}</div>}
                            {!employee.email && !employee.phone && '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(employee)}
                              >
                                Изменить
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(employee)}
                                title={!canDelete ? "Сотрудник является руководителем" : ""}
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

      {/* Диалог добавления сотрудника */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить нового сотрудника</DialogTitle>
            <DialogDescription>
              Введите информацию о новом сотруднике
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ФИО сотрудника" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Отдел</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDepartmentChange(value);
                        }}
                        defaultValue={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите отдел" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указан</SelectItem>
                          {departmentsData?.data.map((department) => (
                            <SelectItem 
                              key={department.department_id} 
                              value={department.department_id.toString()}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Должность</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          handlePositionChange(value);
                        }}
                        defaultValue={field.value?.toString() || "null"}
                        value={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите должность" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указана</SelectItem>
                          {filteredPositions.map((position) => (
                            <SelectItem 
                              key={position.position_id} 
                              value={position.position_id.toString()}
                            >
                              {position.name} {position.is_category ? "(Категория)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Поле для выбора родительской должности (если выбрана категория) */}
              {isPositionCategory(selectedPosition) && (
                <FormField
                  control={form.control}
                  name="category_parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Родительская должность</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString() || "null"}
                        value={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите родительскую должность" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указана</SelectItem>
                          {/* Фильтруем только не категории */}
                          {positionsData?.data
                            .filter(pos => !pos.is_category)
                            .map((position) => (
                              <SelectItem 
                                key={position.position_id} 
                                value={position.position_id.toString()}
                              >
                                {position.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <FormDescription>
                        Выберите родительскую должность для этой категории
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Руководитель</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString() || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите руководителя" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Нет руководителя</SelectItem>
                        {employeesData?.data.map((employee) => (
                          <SelectItem 
                            key={employee.employee_id} 
                            value={employee.employee_id.toString()}
                          >
                            {employee.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите email" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите телефон" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createEmployee.isPending}
                >
                  {createEmployee.isPending ? "Добавление..." : "Добавить сотрудника"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования сотрудника */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
            <DialogDescription>
              Измените информацию о сотруднике
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ФИО сотрудника" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Отдел</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleDepartmentChange(value);
                        }}
                        defaultValue={field.value?.toString() || "null"}
                        value={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите отдел" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указан</SelectItem>
                          {departmentsData?.data.map((department) => (
                            <SelectItem 
                              key={department.department_id} 
                              value={department.department_id.toString()}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="position_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Должность</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          handleEditPositionChange(value);
                        }}
                        defaultValue={field.value?.toString() || "null"}
                        value={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите должность" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указана</SelectItem>
                          {filteredPositions.map((position) => (
                            <SelectItem 
                              key={position.position_id} 
                              value={position.position_id.toString()}
                            >
                              {position.name} {position.is_category ? "(Категория)" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="manager_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Руководитель</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString() || "null"}
                      value={field.value?.toString() || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите руководителя" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Нет руководителя</SelectItem>
                        {employeesData?.data
                          .filter(emp => emp.employee_id !== selectedEmployee?.employee_id) // Исключаем текущего сотрудника
                          .map((employee) => (
                            <SelectItem 
                              key={employee.employee_id} 
                              value={employee.employee_id.toString()}
                            >
                              {employee.full_name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите email" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите телефон" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateEmployee.isPending}
                >
                  {updateEmployee.isPending ? "Сохранение..." : "Сохранить изменения"}
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
              Вы собираетесь удалить сотрудника "{selectedEmployee?.full_name}". 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteEmployee.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}