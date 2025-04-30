import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataRefresh } from "@/hooks/use-data-refresh";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";

interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

interface DepartmentLink {
  position_link_id: number;
  department_id: number;
  department_name: string;
  sort: number;
}

interface Position {
  position_id: number;
  name: string;
  departments?: DepartmentLink[];
  parent_position_id?: number | null;
  department_id?: number | null;
}

interface Employee {
  employee_id: number;
  position_id: number | null;
}

// Схема валидации для формы
const positionFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа").max(100, "Название не должно превышать 100 символов"),
  parent_position_id: z.number().nullable().optional(),
  // Убираем поле department_id, т.к. теперь будем связывать должности с отделами через таблицу position_department
});

type PositionFormValues = z.infer<typeof positionFormSchema>;

export default function Positions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [vacanciesCount, setVacanciesCount] = useState<number>(0);
  const queryClient = useQueryClient();

  // Form для создания
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
      parent_position_id: null,
      department_id: null,
    },
  });

  // Form для редактирования
  const editForm = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
      parent_position_id: null,
      department_id: null,
    },
  });

  // Mutation для создания новой должности
  const createPosition = useMutation({
    mutationFn: async (values: PositionFormValues) => {
      const res = await apiRequest("POST", "/api/positions", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании должности");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Должность создана успешно",
        description: "Новая должность была добавлена в систему",
      });
      // Обновляем оба запроса - обычный и с отделами
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions/with-departments'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при создании должности",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для обновления должности
  const updatePosition = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: PositionFormValues }) => {
      const res = await apiRequest("PUT", `/api/positions/${id}`, values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при обновлении должности");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Должность обновлена успешно",
        description: "Информация о должности была обновлена",
      });
      // Обновляем оба запроса
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions/with-departments'] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedPosition(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при обновлении должности",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для удаления должности
  const deletePosition = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/positions/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении должности");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Должность удалена успешно",
        description: "Должность была удалена из системы",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions/with-departments'] });
      setIsDeleteDialogOpen(false);
      setSelectedPosition(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при удалении должности",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation для создания связи должности с отделом
  const createPositionDepartment = useMutation({
    mutationFn: async ({ position_id, department_id, vacancies }: { position_id: number, department_id: number, vacancies: number }) => {
      const res = await apiRequest("POST", "/api/positiondepartments", { 
        position_id, 
        department_id,
        vacancies, // Количество вакансий
        sort: 0  // Значение по умолчанию
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при привязке должности к отделу");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Должность привязана к отделу",
        description: "Связь успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/positions/with-departments'] });
      setIsAddDepartmentDialogOpen(false);
      setSelectedDepartmentId(null);
      setVacanciesCount(0); // Сбрасываем счетчик вакансий после успешного создания
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при привязке должности к отделу",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation для удаления связи должности с отделом
  const deletePositionDepartment = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/positiondepartments/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении связи должности с отделом");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Связь удалена",
        description: "Должность отвязана от отдела",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/positions/with-departments'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при удалении связи",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Запрос на получение должностей с отделами
  const { data: positionsData, isLoading, error } = useQuery<{ status: string, data: Position[] }>({
    queryKey: ['/api/positions/with-departments'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Настройка автоматического обновления данных каждые 5 секунд
  useDataRefresh(['/api/positions', '/api/positions/with-departments', '/api/departments', '/api/employees']);

  // Фильтрация должностей на основе поискового запроса
  const filteredPositions = positionsData?.data.filter(pos => 
    pos.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = (values: PositionFormValues) => {
    createPosition.mutate(values);
  };

  const onEditSubmit = (values: PositionFormValues) => {
    if (selectedPosition) {
      updatePosition.mutate({ id: selectedPosition.position_id, values });
    }
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    editForm.reset({
      name: position.name,
      parent_position_id: position.parent_position_id || null,
      department_id: position.department_id || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPosition) {
      deletePosition.mutate(selectedPosition.position_id);
    }
  };
  
  // Обработчик удаления связи должности с отделом
  const handleDeleteLink = (linkId: number) => {
    deletePositionDepartment.mutate(linkId);
  };
  
  // Обработчик добавления связи должности с отделом
  const handleOpenAddDepartment = (position: Position) => {
    setSelectedPosition(position);
    setVacanciesCount(0); // Сбрасываем счетчик вакансий при открытии диалога
    setIsAddDepartmentDialogOpen(true);
  };
  
  // Обработчик подтверждения добавления связи
  const handleAddDepartment = () => {
    if (selectedPosition && selectedDepartmentId) {
      createPositionDepartment.mutate({
        position_id: selectedPosition.position_id,
        department_id: selectedDepartmentId,
        vacancies: vacanciesCount
      });
    }
  };

  // Проверка, используется ли должность сотрудниками
  const isPositionUsed = (positionId: number) => {
    if (!employeesData?.data) return false;
    
    return employeesData.data.some(
      (employee) => employee.position_id === positionId
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Должности</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Добавить должность</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск должностей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список должностей</CardTitle>
          <CardDescription>
            Всего должностей: {positionsData?.data.length || 0}
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
                    <TableHead>Родительская должность</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Должности не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPositions.map((position) => {
                      const usedByEmployees = isPositionUsed(position.position_id);
                      
                      return (
                        <TableRow key={position.position_id}>
                          <TableCell>{position.position_id}</TableCell>
                          <TableCell className="font-medium">{position.name}</TableCell>
                          <TableCell>
                            {position.parent_position_id ? (
                              positionsData?.data.find(p => p.position_id === position.parent_position_id)?.name || 
                              <span className="text-gray-500">ID: {position.parent_position_id}</span>
                            ) : (
                              <span className="text-gray-500">Нет</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {position.departments && position.departments.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {position.departments.map(dept => (
                                  <div key={dept.position_link_id} className="flex items-center gap-2">
                                    <span className="text-sm">{dept.department_name}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6" 
                                      onClick={() => handleDeleteLink(dept.position_link_id)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                        <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                                      </svg>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">Нет привязанных отделов</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenAddDepartment(position)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                  <path d="M5 12h14"></path><path d="M12 5v14"></path>
                                </svg>
                                Отдел
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(position)}
                              >
                                Изменить
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(position)}
                                title={usedByEmployees ? "Должность назначена сотрудникам" : ""}
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

      {/* Диалог добавления должности */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить должность</DialogTitle>
            <DialogDescription>
              Заполните информацию о новой должности
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название должности</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название должности" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parent_position_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Родительская должность</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "null" ? null : parseInt(value));
                      }}
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите родительскую должность" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Нет (верхний уровень)</SelectItem>
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
                      onValueChange={(value) => {
                        field.onChange(value === "null" ? null : parseInt(value));
                      }}
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Не привязывать к отделу</SelectItem>
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
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createPosition.isPending}
                >
                  {createPosition.isPending ? "Создание..." : "Создать должность"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования должности */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать должность</DialogTitle>
            <DialogDescription>
              Измените название должности
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название должности</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название должности" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="parent_position_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Родительская должность</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value === "null" ? null : parseInt(value));
                      }}
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите родительскую должность" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Нет (верхний уровень)</SelectItem>
                        {positionsData?.data
                          .filter(pos => pos.position_id !== selectedPosition?.position_id) // Исключаем текущую должность
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
                      onValueChange={(value) => {
                        field.onChange(value === "null" ? null : parseInt(value));
                      }}
                      value={field.value?.toString() || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Не привязывать к отделу</SelectItem>
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
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updatePosition.isPending}
                >
                  {updatePosition.isPending ? "Сохранение..." : "Сохранить изменения"}
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
              Вы собираетесь удалить должность "{selectedPosition?.name}". 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePosition.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Диалог добавления отдела к должности */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Привязать должность к отделам</DialogTitle>
            <DialogDescription>
              Выберите отделы, к которым нужно привязать должность "{selectedPosition?.name}" и укажите количество вакансий для каждого отдела
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Отдел
                </label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedDepartmentId || ""}
                  onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
                >
                  <option value="" disabled>Выберите отдел</option>
                  {departmentsData?.data
                    // Фильтруем отделы, исключая те, которые уже привязаны к этой должности
                    .filter(dept => !selectedPosition?.departments?.some(d => d.department_id === dept.department_id))
                    .map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Количество штатных единиц
                </label>
                <Input 
                  type="number" 
                  min="0" 
                  placeholder="Укажите количество штатных единиц"
                  value={vacanciesCount}
                  onChange={(e) => setVacanciesCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Привязанные отделы
              </label>
              
              {selectedPosition?.departments && selectedPosition.departments.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {selectedPosition.departments.map(dept => (
                    <div key={dept.position_link_id} className="flex items-center justify-between p-3">
                      <div>
                        <span className="font-medium">{dept.department_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleDeleteLink(dept.position_link_id)}
                          title="Удалить связь"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-3 border rounded-md text-center">
                  Нет привязанных отделов
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                onClick={handleAddDepartment}
                disabled={!selectedDepartmentId || createPositionDepartment.isPending}
              >
                {createPositionDepartment.isPending ? "Добавление..." : "Добавить связь"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}