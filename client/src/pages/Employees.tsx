import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  phone: string | null;
  email: string | null;
  manager_id: number | null;
  department_id: number | null;
}

interface Position {
  position_id: number;
  name: string;
}

interface Department {
  department_id: number;
  name: string;
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
  email: z.string().email("Некорректный email").nullable().or(z.literal('')).transform(val => 
    val === '' ? null : val
  ),
  phone: z.string().nullable().or(z.literal('')).transform(val => 
    val === '' ? null : val
  ),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      position_id: null,
      department_id: null,
      manager_id: null,
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

  const onSubmit = (values: EmployeeFormValues) => {
    createEmployee.mutate(values);
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
                    <TableHead className="w-[100px]">Действия</TableHead>
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
                    filteredEmployees.map((employee) => (
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
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              Изменить
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
                  name="position_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Должность</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString() || "null"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите должность" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Не указана</SelectItem>
                          {positionsData?.data.map((position) => (
                            <SelectItem 
                              key={position.position_id} 
                              value={position.position_id.toString()}
                            >
                              {position.name}
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
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Отдел</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
              </div>
              
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
    </div>
  );
}