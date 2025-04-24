import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";

interface Leave {
  leave_id: number;
  employee_id: number;
  start_date: string;
  end_date: string | null;
  type: string;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

// Схема валидации для формы
const leaveFormSchema = z.object({
  employee_id: z.string().transform(val => Number(val)),
  type: z.string().min(2, "Тип отпуска должен содержать минимум 2 символа"),
  start_date: z.date({
    required_error: "Выберите дату начала отпуска",
  }),
  end_date: z.date({
    required_error: "Выберите дату окончания отпуска",
  }).nullable(),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export default function Leaves() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      employee_id: "",
      type: "",
      start_date: undefined,
      end_date: null,
    },
  });

  // Mutation для создания нового отпуска
  const createLeave = useMutation({
    mutationFn: async (values: LeaveFormValues) => {
      // Форматирование дат для API
      const formattedValues = {
        ...values,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
      };

      const res = await apiRequest("POST", "/api/leaves", formattedValues);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании отпуска");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Отпуск добавлен успешно",
        description: "Новый отпуск был добавлен в систему",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/leaves'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при добавлении отпуска",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Запрос на получение отпусков
  const { data: leavesData, isLoading, error } = useQuery<{ status: string, data: Leave[] }>({
    queryKey: ['/api/leaves'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Фильтрация отпусков на основе поискового запроса и имени сотрудника
  const filteredLeaves = leavesData?.data.filter(leave => {
    const employee = employeesData?.data.find(emp => emp.employee_id === leave.employee_id);
    if (!employee) return false;
    
    return (
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  // Получение имени сотрудника по ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employeesData?.data.find(emp => emp.employee_id === employeeId);
    return employee ? employee.full_name : `Сотрудник #${employeeId}`;
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  // Определение статуса отпуска
  const getLeaveStatus = (startDate: string, endDate: string | null) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (start > now) {
      return { label: 'Запланирован', variant: 'outline' as const };
    }
    
    if (!end) {
      return { label: 'Активен', variant: 'default' as const };
    }
    
    if (end < now) {
      return { label: 'Завершен', variant: 'secondary' as const };
    }
    
    return { label: 'Активен', variant: 'default' as const };
  };

  const onSubmit = (values: LeaveFormValues) => {
    createLeave.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Отпуска</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Добавить отпуск</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск по сотруднику или типу отпуска..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список отпусков</CardTitle>
          <CardDescription>
            Всего отпусков: {leavesData?.data.length || 0}
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
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Дата начала</TableHead>
                    <TableHead>Дата окончания</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Отпуска не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => {
                      const status = getLeaveStatus(leave.start_date, leave.end_date);
                      
                      return (
                        <TableRow key={leave.leave_id}>
                          <TableCell>{leave.leave_id}</TableCell>
                          <TableCell className="font-medium">{getEmployeeName(leave.employee_id)}</TableCell>
                          <TableCell>{leave.type}</TableCell>
                          <TableCell>{formatDate(leave.start_date)}</TableCell>
                          <TableCell>{formatDate(leave.end_date)}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Изменить
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500">
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

      {/* Диалог добавления отпуска */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить новый отпуск</DialogTitle>
            <DialogDescription>
              Введите информацию о новом отпуске
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сотрудник</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите сотрудника" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип отпуска</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип отпуска" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ежегодный">Ежегодный</SelectItem>
                        <SelectItem value="По болезни">По болезни</SelectItem>
                        <SelectItem value="По уходу за ребенком">По уходу за ребенком</SelectItem>
                        <SelectItem value="Без сохранения оплаты">Без сохранения оплаты</SelectItem>
                        <SelectItem value="Учебный">Учебный</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата начала</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: ru })
                              ) : (
                                <span>Выберите дату</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата окончания</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: ru })
                              ) : (
                                <span>Оставить пустым для бессрочного</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              const startDate = form.getValues("start_date");
                              return startDate ? date < startDate : false;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createLeave.isPending}
                >
                  {createLeave.isPending ? "Добавление..." : "Добавить отпуск"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}