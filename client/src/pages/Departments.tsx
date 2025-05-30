import React, {useState, useCallback, useEffect} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataRefresh } from "@/hooks/use-data-refresh";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Plus, MoveVertical } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface Department {
  department_id: number;
  name: string;
  parent_position_id: number | null;
  parent_department_id: number | null;
  leadership_position_id: number | null;
  manager_id: number | null;
  leadership_position_name?: string | null;
  manager_name?: string | null;
  is_organization: boolean;
  sort?: number;
}

// Схема валидации для формы
const departmentFormSchema = z
    .object({
      name: z
          .string()
          .min(2, "Название должно содержать минимум 2 символа")
          .max(100, "Название не должно превышать 100 символов"),
      parent_position_id: z
          .union([z.string(), z.null()])
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      parent_department_id: z
          .union([z.string(), z.null()])
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      leadership_position_id: z
          .union([z.string(), z.null()])
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      manager_id: z
          .union([z.string(), z.null()])
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
    })
    .refine(
        (data) => {
          // Проверяем, что только одно из полей заполнено (или оба пустые для корневого отдела)
          const hasParentPosition = data.parent_position_id !== null;
          const hasParentDepartment = data.parent_department_id !== null;

          return (
              (!hasParentPosition && !hasParentDepartment) || // корневой отдел
              (hasParentPosition && !hasParentDepartment) || // только родительская должность
              (!hasParentPosition && hasParentDepartment)
          ); // только родительский отдел
        },
        {
          message:
              "Выберите либо родительскую должность, либо родительский отдел, но не оба одновременно",
          path: ["parent_selection"], // указывает, к какому полю относится ошибка
        },
    );

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
      useState<Department | null>(null);
  const [isSortMode, setIsSortMode] = useState(false);
  const queryClient = useQueryClient();

  // Form для создания
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      parent_position_id: null,
      parent_department_id: null,
      leadership_position_id: null,
      manager_id: null,
    },
  });

  // Form для редактирования
  const editForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      parent_position_id: null,
      parent_department_id: null,
      leadership_position_id: null,
      manager_id: null,
    },
  });

  useEffect(() => {
    if (selectedDepartment) {
      editForm.reset({
        name: selectedDepartment.name,
        parent_position_id: selectedDepartment.parent_position_id?.toString() || "null",
        parent_department_id: selectedDepartment.parent_department_id?.toString() || "null",
        leadership_position_id: selectedDepartment.leadership_position_id?.toString() || "null",
        manager_id: selectedDepartment.manager_id?.toString() || "null",
      });
    }
  }, [selectedDepartment]);

  // Mutation для создания нового отдела
  const createDepartment = useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      const res = await apiRequest("POST", "/api/departments", values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании отдела");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Отдел создан успешно",
        description: "Новый отдел был добавлен в систему",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при создании отдела",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для обновления отдела
  const updateDepartment = useMutation({
    mutationFn: async ({
                         id,
                         values,
                       }: {
      id: number;
      values: DepartmentFormValues;
    }) => {
      const res = await apiRequest("PUT", `/api/departments/${id}`, values);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при обновлении отдела");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Отдел обновлен успешно",
        description: "Информация об отделе была обновлена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при обновлении отдела",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для удаления отдела
  const deleteDepartment = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/departments/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при удалении отдела");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Отдел удален успешно",
        description: "Отдел был удален из системы",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при удалении отдела",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation для обновления порядка сортировки отделов
  const updateDepartmentSort = useMutation({
    mutationFn: async (updates: { department_id: number; sort: number }[]) => {
      const res = await apiRequest("POST", `/api/departments/sort`, {
        updates,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
            errorData.message || "Ошибка при обновлении порядка сортировки",
        );
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Порядок сортировки обновлен",
        description: "Новый порядок сортировки отделов был сохранен",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка при обновлении порядка сортировки",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Запрос на получение отделов
  const {
    data: departmentsData,
    isLoading,
    error,
  } = useQuery<{ status: string; data: Department[] }>({
    queryKey: ["/api/departments"],
  });

  // Запрос на получение сотрудников, привязанных к отделам
  const { data: employeesData } = useQuery<{ status: string; data: any[] }>({
    queryKey: ["/api/employees"],
  });

  // Запрос на получение должностей
  const { data: positionsData } = useQuery<{ status: string; data: any[] }>({
    queryKey: ["/api/positions"],
    select: (res) => ({
      ...res,
      data: res.data.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }),
  });

  // Настройка автоматического обновления данных каждые 5 секунд
  useDataRefresh(["/api/departments", "/api/employees", "/api/positions"]);

  // Фильтрация отделов на основе поискового запроса
  const filteredDepartments =
      departmentsData?.data.filter(
          (dept) =>
              !dept.is_organization &&
              dept.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || [];

  const onSubmit = (values: DepartmentFormValues) => {
    createDepartment.mutate(values);
  };

  const onEditSubmit = (values: DepartmentFormValues) => {
    if (selectedDepartment) {
      updateDepartment.mutate({ id: selectedDepartment.department_id, values });
    }
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    editForm.reset({
      name: department.name,
      parent_position_id: department.parent_position_id
          ? department.parent_position_id
          : "null",
      parent_department_id: department.parent_department_id
          ? department.parent_department_id
          : "null",
      leadership_position_id: department.leadership_position_id
          ? department.leadership_position_id
          : "null",
      manager_id: department.manager_id
          ? department.manager_id
          : "null",
    } as any);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment.mutate(selectedDepartment.department_id);
    }
  };

  // Проверка, есть ли зависимые сотрудники у отдела
  const hasDependentEmployees = (departmentId: number) => {
    if (!employeesData?.data) return false;

    return employeesData.data.some(
        (employee) => employee.department_id === departmentId,
    );
  };

  // Проверка, есть ли зависимые отделы (дочерние)
  const hasDependentDepartments = (departmentId: number) => {
    if (!departmentsData?.data) return false;

    return departmentsData.data.some(
        (dept) => dept.parent_department_id === departmentId,
    );
  };

  // Обработчик для завершения перетаскивания
  const handleDragEnd = useCallback(
      (result: DropResult) => {
        const { source, destination } = result;

        // Если элемент не был перемещен никуда
        if (!destination) return;

        // Если это внутри одного и того же droppable
        if (
            source.droppableId === destination.droppableId &&
            source.index !== destination.index
        ) {
          // Создаем копию отделов
          const sortedDepartments = [...filteredDepartments];

          // Перемещаем отдел в копии массива
          const [removed] = sortedDepartments.splice(source.index, 1);
          sortedDepartments.splice(destination.index, 0, removed);

          // Обновляем индексы сортировки
          const updates = sortedDepartments.map((department, index) => ({
            department_id: department.department_id,
            sort: index,
          }));

          // Отправляем обновления на сервер
          updateDepartmentSort.mutate(updates);
        }
      },
      [filteredDepartments, updateDepartmentSort],
  );

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6 mt-5">
          <h1 className="text-2xl font-bold">Отделы</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                  placeholder="Поиск отделов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
              />
            </div>
            <Button
                variant={isSortMode ? "destructive" : "outline"}
                onClick={() => setIsSortMode(!isSortMode)}
                className="flex items-center gap-2"
            >
              <MoveVertical size={18} />
              {isSortMode
                  ? "Выключить режим сортировки"
                  : "Режим установки сортировки"}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Добавить отдел
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список отделов</CardTitle>
            <CardDescription>
              Всего отделов: {departmentsData?.data.length || 0}
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
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Название</TableHead>
                          <TableHead>Родительская должность</TableHead>
                          <TableHead>Родительский отдел</TableHead>
                          <TableHead>Руководящая должность</TableHead>
                          <TableHead>Руководитель</TableHead>
                          <TableHead className="w-[150px]">Действия</TableHead>
                        </TableRow>
                      </TableHeader>

                      <Droppable
                          droppableId="departments"
                          isDropDisabled={!isSortMode}
                      >
                        {(provided) => (
                            <TableBody
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                              {filteredDepartments.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                      Отделы не найдены
                                    </TableCell>
                                  </TableRow>
                              ) : (
                                  filteredDepartments.map((department, index) => {
                                    // Найдем имя родительской должности
                                    const parentPosition = department.parent_position_id
                                        ? positionsData?.data.find(
                                            (p) =>
                                                p.position_id ===
                                                department.parent_position_id,
                                        )
                                        : null;

                                    // Найдем имя родительского отдела
                                    const parentDepartment =
                                        department.parent_department_id
                                            ? departmentsData?.data.find(
                                                (d) =>
                                                    d.department_id ===
                                                    department.parent_department_id,
                                            )
                                            : null;

                                    // Проверка зависимостей для предупреждения
                                    const hasEmployees = hasDependentEmployees(
                                        department.department_id,
                                    );
                                    const hasChildDepartments = hasDependentDepartments(
                                        department.department_id,
                                    );

                                    return (
                                        <Draggable
                                            key={department.department_id.toString()}
                                            draggableId={department.department_id.toString()}
                                            index={index}
                                            isDragDisabled={!isSortMode}
                                        >
                                          {(provided, snapshot) => (
                                              <TableRow
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className={
                                                    snapshot.isDragging ? "bg-muted" : ""
                                                  }
                                              >
                                                <TableCell>
                                                  {department.department_id}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                  <div className="flex items-center gap-2">
                                                    {isSortMode && (
                                                        <MoveVertical
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                    )}
                                                    {department.name}
                                                  </div>
                                                </TableCell>
                                                <TableCell>
                                                  {parentPosition
                                                      ? parentPosition.name
                                                      : "—"}
                                                </TableCell>
                                                <TableCell>
                                                  {parentDepartment
                                                      ? parentDepartment.name
                                                      : "—"}
                                                </TableCell>
                                                <TableCell>
                                                  {department.leadership_position_name || "—"}
                                                </TableCell>
                                                <TableCell>
                                                  {department.manager_name || "—"}
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(department)}
                                                        disabled={isSortMode}
                                                    >
                                                      Изменить
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(department)
                                                        }
                                                        disabled={isSortMode}
                                                        title={
                                                          hasEmployees && hasChildDepartments
                                                              ? "В отделе имеются сотрудники и дочерние отделы"
                                                              : hasEmployees
                                                                  ? "В отделе имеются сотрудники"
                                                                  : hasChildDepartments
                                                                      ? "В отделе имеются дочерние отделы"
                                                                      : ""
                                                        }
                                                    >
                                                      Удалить
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                          )}
                                        </Draggable>
                                    );
                                  })
                              )}
                              {provided.placeholder}
                            </TableBody>
                        )}
                      </Droppable>
                    </Table>
                  </DragDropContext>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Диалог добавления отдела */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Добавить новый отдел</DialogTitle>
              <DialogDescription>
                Введите информацию о новом отделе
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название отдела</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите название отдела" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-medium text-red-500">
                    Выберите один из вариантов подчинения (не оба одновременно):
                  </h3>
                </div>

                <FormField
                    control={form.control}
                    name="parent_position_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Родительская должность</FormLabel>
                          <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Если выбрана должность, сбрасываем отдел
                                if (value !== "null") {
                                  form.setValue('parent_department_id', 'null');
                                }
                              }}
                              defaultValue={field.value?.toString() || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите родительскую должность" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {positionsData?.data.map((pos) => (
                                  <SelectItem
                                      key={pos.position_id}
                                      value={pos.position_id.toString()}
                                  >
                                    {pos.name}
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
                    name="parent_department_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Родительский отдел</FormLabel>
                          <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Если выбран отдел, сбрасываем должность
                                if (value !== "null") {
                                  form.setValue("parent_position_id", "null");
                                }
                              }}
                              defaultValue={field.value?.toString() || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите родительский отдел" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {departmentsData?.data.map((dept) => (
                                  <SelectItem
                                      key={dept.department_id}
                                      value={dept.department_id.toString()}
                                      disabled={
                                          dept.department_id ===
                                          selectedDepartment?.department_id
                                      } // Нельзя выбрать себя как родителя
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

                <FormField
                    control={form.control}
                    name="leadership_position_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Руководящая должность</FormLabel>
                          <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите руководящую должность" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {positionsData?.data.map((pos) => (
                                  <SelectItem
                                      key={pos.position_id}
                                      value={pos.position_id.toString()}
                                  >
                                    {pos.name}
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
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {employeesData?.data.map((emp) => (
                                  <SelectItem
                                      key={emp.employee_id}
                                      value={emp.employee_id.toString()}
                                  >
                                    {emp.full_name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createDepartment.isPending}>
                    {createDepartment.isPending ? "Создание..." : "Создать отдел"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования отдела */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Редактировать отдел</DialogTitle>
              <DialogDescription>Измените информацию об отделе</DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className="space-y-4"
              >
                <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название отдела</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите название отдела" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-medium text-red-500">
                    Выберите один из вариантов подчинения (не оба одновременно):
                  </h3>
                </div>

                <FormField
                    control={editForm.control}
                    name="parent_position_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Родительская должность</FormLabel>
                          <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Если выбрана должность, сбрасываем отдел
                                if (value !== "null") {
                                  editForm.setValue("parent_department_id", null);
                                }
                              }}
                              defaultValue={field.value?.toString() || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите родительскую должность" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {positionsData?.data.map((pos) => (
                                  <SelectItem
                                      key={pos.position_id}
                                      value={pos.position_id.toString()}
                                  >
                                    {pos.name}
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
                    name="parent_department_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Родительский отдел</FormLabel>
                          <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Если выбран отдел, сбрасываем должность
                                if (value !== "null") {
                                  editForm.setValue("parent_position_id", null);
                                }
                              }}
                              defaultValue={field.value?.toString() || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите родительский отдел" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {departmentsData?.data
                                  .filter(
                                      (dept) =>
                                          dept.department_id !==
                                          selectedDepartment?.department_id,
                                  ) // Фильтруем, чтобы не отображать текущий отдел
                                  .map((dept) => (
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

                <FormField
                    control={editForm.control}
                    name="leadership_position_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Руководящая должность</FormLabel>
                          <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value?.toString() || "null"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите руководящую должность" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {positionsData?.data.map((pos) => (
                                  <SelectItem
                                      key={pos.position_id}
                                      value={pos.position_id.toString()}
                                  >
                                    {pos.name}
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
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {employeesData?.data.map((emp) => (
                                  <SelectItem
                                      key={emp.employee_id}
                                      value={emp.employee_id.toString()}
                                  >
                                    {emp.full_name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={updateDepartment.isPending}>
                    {updateDepartment.isPending
                        ? "Сохранение..."
                        : "Сохранить изменения"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Диалог подтверждения удаления */}
        <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы собираетесь удалить отдел "{selectedDepartment?.name}". Это
                действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600"
              >
                {deleteDepartment.isPending ? "Удаление..." : "Удалить"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
