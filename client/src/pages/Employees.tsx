import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  photo_url: string | null;
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
const employeeFormSchema = z
    .object({
      full_name: z
          .string()
          .min(2, "ФИО должно содержать минимум 2 символа")
          .max(100, "ФИО не должно превышать 100 символов"),
      position_id: z
          .string()
          .nullable()
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      department_id: z
          .string()
          .nullable()
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      manager_id: z
          .string()
          .nullable()
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      category_parent_id: z
          .string()
          .nullable()
          .transform((val) => (val && val !== "null" ? Number(val) : null)),
      email: z
          .string()
          .email("Некорректный email")
          .nullable()
          .or(z.literal(""))
          .transform((val) => (val === "" ? null : val)),
      phone: z
          .string()
          .nullable()
          .or(z.literal(""))
          .transform((val) => (val === "" ? null : val)),
      photo_url: z.string().nullable().optional(),
    });

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
      null
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
      null
  );
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [editSelectedPosition, setEditSelectedPosition] = useState<string | null>(
      null
  );
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [tempEditPhotoUrl, setTempEditPhotoUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);


  // Функция для очистки неиспользуемых фотографий
  const handleCleanupPhotos = async () => {
    if (!confirm("Вы уверены, что хотите удалить все неиспользуемые фотографии? Это действие нельзя отменить.")) {
      return;
    }

    try {
      const response = await fetch('/api/cleanup-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast({
          title: "Неиспользуемые фото удалены",
          description: `Успешно удалено ${result.data.count} неиспользуемых фотографий`,
        });
      } else {
        toast({
          title: "Ошибка при удалении фото",
          description: result.message || "Не удалось удалить неиспользуемые фотографии",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ошибка при очистке фотографий:", error);
      toast({
        title: "Ошибка при удалении фото",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };
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
      photo_url: null,
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
      photo_url: null,
    },
  });

  // Функция для получения инициалов из имени
  const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2);
  };

  // Обработчик загрузки фото для новых сотрудников
  const handleAddPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Неверный формат файла",
        description: "Поддерживаются только изображения форматов JPEG, PNG, GIF и WebP.",
        variant: "destructive"
      });
      return;
    }

    // Проверка размера файла (макс. 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Слишком большой файл",
        description: "Размер фото не должен превышать 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Создаем временный URL и сохраняем его в форме
    const tempUrl = URL.createObjectURL(file);
    setTempPhotoUrl(tempUrl);
    form.setValue("photo_url", tempUrl);
  };

  // Обработчик удаления фото при создании
  const handleAddPhotoDelete = () => {
    setTempPhotoUrl(null);
    form.setValue("photo_url", null);
  };

  // Обработчик загрузки фото для редактирования сотрудников
  const handleEditPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEmployee) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Неверный формат файла",
        description: "Поддерживаются только изображения форматов JPEG, PNG, GIF и WebP.",
        variant: "destructive"
      });
      return;
    }

    // Проверка размера файла (макс. 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Слишком большой файл",
        description: "Размер фото не должен превышать 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      console.log(`Отправка запроса на загрузку фото для сотрудника ID: ${selectedEmployee.employee_id}`);

      const response = await fetch(`/api/upload/employee-photo/${selectedEmployee.employee_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log(`Статус ответа: ${response.status}`);

      // Читаем ответ сначала как текст для диагностики
      const responseText = await response.text();
      console.log('Ответ сервера:', responseText);

      if (!response.ok) {
        throw new Error(`Ошибка при загрузке фото: ${responseText}`);
      }

      // Преобразуем текст в JSON
      const data = JSON.parse(responseText);
      setTempEditPhotoUrl(data.data.photo_url);
      editForm.setValue("photo_url", data.data.photo_url);

      toast({
        title: "Фото загружено",
        description: "Фотография сотрудника успешно загружена"
      });

      // Обновляем данные в таблице
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
    } catch (error) {
      console.error("Ошибка при загрузке фото:", error);
      toast({
        title: "Ошибка при загрузке фото",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  // Обработчик удаления фото при редактировании
  const handleEditPhotoDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await fetch(`/api/upload/employee-photo/${selectedEmployee.employee_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при удалении фото");
      }

      setTempEditPhotoUrl(null);
      editForm.setValue("photo_url", null);

      toast({
        title: "Фото удалено",
        description: "Фотография сотрудника успешно удалена"
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении фото",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  // Mutation для создания нового сотрудника
  const createEmployee = useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      // Исключаем photo_url из данных для отправки
      const { photo_url, ...dataToSend } = values;

      const res = await apiRequest("POST", "/api/employees", dataToSend);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка при создании сотрудника");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      // Если у нас есть временное фото и создан новый сотрудник,
      // загружаем фото для этого сотрудника
      if (tempPhotoUrl && data.data.employee_id) {
        try {
          // Получаем файл из временного URL
          const response = await fetch(tempPhotoUrl);
          const blob = await response.blob();
          const file = new File([blob], "photo.jpg", { type: blob.type });

          const formData = new FormData();
          formData.append('photo', file);

          await fetch(`/api/upload/employee-photo/${data.data.employee_id}`, {
            method: 'POST',
            body: formData
          });
        } catch (error) {
          console.error("Ошибка при загрузке фото для нового сотрудника:", error);
        }
      }

      toast({
        title: "Сотрудник добавлен успешно",
        description: "Новый сотрудник был добавлен в систему",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsAddDialogOpen(false);
      form.reset();
      setTempPhotoUrl(null);
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
    mutationFn: async ({ id, values }: { id: number; values: EmployeeFormValues }) => {
      // Исключаем photo_url из данных для отправки
      const { photo_url, ...dataToSend } = values;

      const res = await apiRequest("PUT", `/api/employees/${id}`, dataToSend);
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
      setTempEditPhotoUrl(null);
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
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
  } = useQuery<{ status: string; data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение должностей
  const { data: positionsData } = useQuery<{ status: string; data: Position[] }>({
    queryKey: ['/api/positions'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{
    status: string;
    data: Department[];
  }>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение связей между должностями и отделами
  const { data: positionDepartmentsData } = useQuery<{
    status: string;
    data: PositionDepartment[];
  }>({
    queryKey: ['/api/pd'],
  });

  // Запрос на получение связей между должностями и их родителями
  const { data: positionPositionsData } = useQuery<{
    status: string;
    data: {
      position_position_id: number;
      position_id: number;
      parent_position_id: number;
    }[];
  }>({
    queryKey: ['/api/positionpositions'],
  });

  // Настройка автоматического обновления данных каждые 5 секунд
  useDataRefresh([
    '/api/employees',
    '/api/positions',
    '/api/departments',
    '/api/pd',
    '/api/positionpositions',
  ]);

  // Фильтрация сотрудников на основе поискового запроса
  const filteredEmployees =
      employeesData?.data.filter((employee) =>
          employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

  const isLoading = isLoadingEmployees;
  const error = employeesError;

  // Получение названия должности по ID (с учетом категорий)
  const getPositionName = (
      positionId: number | null,
      categoryParentId: number | null = null
  ) => {
    if (!positionId) return '—';
    const position = positionsData?.data.find(
        (pos) => pos.position_id === positionId
    );

    // Если это не категория или нет родительской должности, просто возвращаем название
    if (!position || !position.is_category || !categoryParentId) {
      return position ? position.name : '—';
    }

    // Если это категория с родительской должностью, форматируем "Родительская должность (Категория)"
    const parentPosition = positionsData?.data.find(
        (pos) => pos.position_id === categoryParentId
    );
    if (!parentPosition) return position.name; // Если родитель не найден, возвращаем только название категории

    return `${parentPosition.name} (${position.name})`;
  };

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return '—';
    const department = departmentsData?.data.find(
        (dept) => dept.department_id === departmentId
    );
    return department ? department.name : '—';
  };

  // Получение имени руководителя по ID
  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '—';
    const manager = employeesData?.data.find(
        (emp) => emp.employee_id === managerId
    );
    return manager ? manager.full_name : '—';
  };

  // Получение списка должностей для выбранного отдела
  const getPositionsForDepartment = (departmentId: string | null) => {
    if (!departmentId || departmentId === "null" || !positionDepartmentsData?.data) {
      return positionsData?.data || [];
    }

    // Получаем ID должностей, связанных с выбранным отделом
    const positionIds = positionDepartmentsData.data
        .filter((pd) => pd.department_id === Number(departmentId))
        .map((pd) => pd.position_id);

    // Фильтруем и возвращаем должности
    return positionsData?.data.filter((pos) =>
        positionIds.includes(pos.position_id)
    ) || [];
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
    setSelectedDepartment(
        employee.department_id ? employee.department_id.toString() : "null"
    );

    const positionId =
        employee.position_id !== null ? employee.position_id.toString() : (null as any);
    setEditSelectedPosition(positionId);
    setTempEditPhotoUrl(employee.photo_url);

    editForm.reset({
      full_name: employee.full_name,
      position_id: positionId,
      department_id:
          employee.department_id !== null
              ? employee.department_id.toString()
              : (null as any),
      manager_id:
          employee.manager_id !== null
              ? employee.manager_id.toString()
              : (null as any),
      category_parent_id:
          employee.category_parent_id !== null
              ? employee.category_parent_id.toString()
              : (null as any),
      email: employee.email || "",
      phone: employee.phone || "",
      photo_url: employee.photo_url,
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
    const hasSubordinates = employeesData?.data.some(
        (emp) => emp.manager_id === employeeId
    );

    return !hasSubordinates;
  };

  // Отфильтрованные должности на основе выбранного отдела
  const filteredPositions = getPositionsForDepartment(selectedDepartment);

  // Проверка, является ли должность категорией
  const isPositionCategory = (positionId: string | null): boolean => {
    if (!positionId || positionId === "null" || !positionsData?.data)
      return false;
    const position = positionsData.data.find(
        (pos) => pos.position_id.toString() === positionId
    );
    return position?.is_category || false;
  };

  // Получение списка родительских должностей для выбранной категории
  const getParentPositionsForCategory = (categoryPositionId: string | null) => {
    if (
        !categoryPositionId ||
        categoryPositionId === "null" ||
        !positionPositionsData?.data ||
        !positionsData?.data
    ) {
      return [];
    }

    const categoryId = Number(categoryPositionId);

    // Находим все связи для этой категории
    const parentPositionIds = positionPositionsData.data
        .filter((pp) => pp.position_id === categoryId)
        .map((pp) => pp.parent_position_id);

    // Возвращаем все родительские должности для этой категории
    return positionsData.data.filter((pos) =>
        parentPositionIds.includes(pos.position_id)
    );
  };

  // Обработчик изменения должности в форме создания
  const handlePositionChange = (positionId: string) => {
    setSelectedPosition(positionId);
    // Преобразуем строку в число или null
    const numericValue = positionId !== "null" ? positionId : null;
    form.setValue("position_id", numericValue as any);

    // Если выбрана не категория, сбрасываем родительскую должность
    if (!isPositionCategory(positionId)) {
      form.setValue("category_parent_id", null);
    }
  };

  // Обработчик изменения должности в форме редактирования
  const handleEditPositionChange = (positionId: string) => {
    setEditSelectedPosition(positionId);
    // Преобразуем строку в число или null
    const numericValue = positionId !== "null" ? positionId : null;
    editForm.setValue("position_id", numericValue as any);

    // Если выбрана не категория, сбрасываем родительскую должность
    if (!isPositionCategory(positionId)) {
      editForm.setValue("category_parent_id", null);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6 mt-5">
          <h1 className="text-2xl font-bold">Сотрудники</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                  placeholder="Поиск сотрудников..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Добавить сотрудника
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Список сотрудников</CardTitle>
              <CardDescription>
                Всего сотрудников: {employeesData?.data.length || 0}
              </CardDescription>
            </div>
            {/*<Button*/}
            {/*    variant="outline"*/}
            {/*    className="text-red-600 hover:text-red-700 hover:bg-red-50"*/}
            {/*    onClick={handleCleanupPhotos}*/}
            {/*>*/}
            {/*  Очистить неиспользуемые фото*/}
            {/*</Button>*/}
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-center py-4">Загрузка...</div>
            ) : error ? (
                <div className="text-center py-4 text-red-500">
                  Ошибка загрузки данных
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-4">Сотрудники не найдены</div>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Должность / Категория</TableHead>
                        <TableHead>Отдел</TableHead>
                        <TableHead>Руководитель</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee, idx) => {
                        const canDelete = true;//canBeDeleted(employee.employee_id);
                        return (
                            <TableRow key={employee.employee_id}>
                              <TableCell>
                                {/*<Avatar className="w-10 h-10 border">*/}
                                {/*  {employee.photo_url ? (*/}
                                {/*      <AvatarImage src={employee.photo_url} alt={employee.full_name} />*/}
                                {/*  ) : (*/}
                                {/*      <AvatarFallback>*/}
                                {/*        {getInitials(employee.full_name)}*/}
                                {/*      </AvatarFallback>*/}
                                {/*  )}*/}
                                {/*</Avatar>*/}
                                {idx + 1}
                              </TableCell>
                              <TableCell>{employee.full_name}</TableCell>
                              <TableCell>
                                {getPositionName(
                                    employee.position_id,
                                    employee.category_parent_id
                                )}
                              </TableCell>
                              <TableCell>
                                {getDepartmentName(employee.department_id)}
                              </TableCell>
                              <TableCell>
                                {getManagerName(employee.manager_id)}
                              </TableCell>
                              <TableCell>{employee.phone || "—"}</TableCell>
                              <TableCell>{employee.email || "—"}</TableCell>
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
                                      disabled={!canDelete}
                                      title={
                                        !canDelete
                                            ? "Сотрудник является руководителем"
                                            : ""
                                      }
                                  >
                                    Удалить
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        );
                      })}
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
                {/* Компонент загрузки фото */}
                {/*<div className="flex flex-col items-center space-y-3 mb-4">*/}
                {/*  <Avatar className="w-24 h-24 border shadow-sm">*/}
                {/*    {tempPhotoUrl ? (*/}
                {/*        <AvatarImage src={tempPhotoUrl} alt="Фото сотрудника" />*/}
                {/*    ) : (*/}
                {/*        <AvatarFallback className="text-xl bg-primary/10">*/}
                {/*          ФИ*/}
                {/*        </AvatarFallback>*/}
                {/*    )}*/}
                {/*  </Avatar>*/}

                {/*  <div className="flex space-x-2">*/}
                {/*    <Button*/}
                {/*        type="button"*/}
                {/*        variant="outline"*/}
                {/*        size="sm"*/}
                {/*        onClick={() => addFileInputRef.current?.click()}*/}
                {/*    >*/}
                {/*      Загрузить фото*/}
                {/*    </Button>*/}

                {/*    {tempPhotoUrl && (*/}
                {/*        <Button*/}
                {/*            type="button"*/}
                {/*            variant="outline"*/}
                {/*            size="sm"*/}
                {/*            onClick={handleAddPhotoDelete}*/}
                {/*        >*/}
                {/*          Удалить*/}
                {/*        </Button>*/}
                {/*    )}*/}

                {/*    <input*/}
                {/*        type="file"*/}
                {/*        ref={addFileInputRef}*/}
                {/*        accept="image/jpeg,image/png,image/gif,image/webp"*/}
                {/*        className="hidden"*/}
                {/*        onChange={handleAddPhotoChange}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*</div>*/}

                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>ФИО</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Введите ФИО сотрудника"
                                {...field}
                            />
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
                                value={field.value || "null"}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleDepartmentChange(value);
                                }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите отдел" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="null">
                                  Не выбрано
                                </SelectItem>
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
                                value={field.value || "null"}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handlePositionChange(value);
                                }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите должность" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="null">
                                  Не выбрано
                                </SelectItem>
                                {filteredPositions.map((position) => (
                                    <SelectItem
                                        key={position.position_id}
                                        value={position.position_id.toString()}
                                    >
                                      {position.name}
                                      {position.is_category
                                          ? " (категория)"
                                          : ""}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                {isPositionCategory(selectedPosition) && (
                    <FormField
                        control={form.control}
                        name="category_parent_id"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Родительская должность для категории
                              </FormLabel>
                              <Select
                                  value={field.value || "null"}
                                  onValueChange={(value) =>
                                      field.onChange(
                                          value !== "null" ? value : null
                                      )
                                  }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите родительскую должность" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="null">
                                    Не выбрано
                                  </SelectItem>
                                  {getParentPositionsForCategory(
                                      selectedPosition
                                  ).map((position) => (
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
                )}

                <FormField
                    control={form.control}
                    name="manager_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Руководитель</FormLabel>
                          <Select
                              value={field.value || "null"}
                              onValueChange={(value) =>
                                  field.onChange(value !== "null" ? value : null)
                              }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите руководителя" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
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
                      name="phone"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите номер телефона"
                                  {...field}
                                  value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите email"
                                  {...field}
                                  value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <DialogFooter>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Добавить</Button>
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
              <form
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className="space-y-4"
              >
                {/* Компонент загрузки фото
                <div className="flex flex-col items-center space-y-3 mb-4">
                 <Avatar className="w-24 h-24 border shadow-sm">
                   {tempEditPhotoUrl ? (
                        <AvatarImage src={tempEditPhotoUrl} alt="Фото сотрудника" />
                    ) : (
                        <AvatarFallback className="text-xl bg-primary/10">
                          {selectedEmployee ? getInitials(selectedEmployee.full_name) : "ФИ"}
                        </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editFileInputRef.current?.click()}
                    >
                      Загрузить фото
                    </Button>

                    {tempEditPhotoUrl && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleEditPhotoDelete}
                        >
                          Удалить
                        </Button>
                    )}

                    <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleEditPhotoChange}
                    />
                  </div>
                </div> */}

                <FormField
                    control={editForm.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>ФИО</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Введите ФИО сотрудника"
                                {...field}
                            />
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
                                value={field.value || "null"}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleDepartmentChange(value);
                                }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите отдел" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="null">
                                  Не выбрано
                                </SelectItem>
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
                                value={field.value || "null"}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleEditPositionChange(value);
                                }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите должность" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="null">
                                  Не выбрано
                                </SelectItem>
                                {filteredPositions.map((position) => (
                                    <SelectItem
                                        key={position.position_id}
                                        value={position.position_id.toString()}
                                    >
                                      {position.name}
                                      {position.is_category
                                          ? " (категория)"
                                          : ""}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                {isPositionCategory(editSelectedPosition) && (
                    <FormField
                        control={editForm.control}
                        name="category_parent_id"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Родительская должность для категории
                              </FormLabel>
                              <Select
                                  value={field.value || "null"}
                                  onValueChange={(value) =>
                                      field.onChange(
                                          value !== "null" ? value : null
                                      )
                                  }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Выберите родительскую должность" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="null">
                                    Не выбрано
                                  </SelectItem>
                                  {getParentPositionsForCategory(
                                      editSelectedPosition
                                  ).map((position) => (
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
                )}

                <FormField
                    control={editForm.control}
                    name="manager_id"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Руководитель</FormLabel>
                          <Select
                              value={field.value || "null"}
                              onValueChange={(value) =>
                                  field.onChange(value !== "null" ? value : null)
                              }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите руководителя" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">Не выбрано</SelectItem>
                              {employeesData?.data
                                  .filter(
                                      (emp) =>
                                          !selectedEmployee ||
                                          emp.employee_id !==
                                          selectedEmployee.employee_id
                                  )
                                  .map((employee) => (
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
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите номер телефона"
                                  {...field}
                                  value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="Введите email"
                                  {...field}
                                  value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                </div>

                <DialogFooter>
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Сохранить</Button>
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
                Вы собираетесь удалить сотрудника "
                {selectedEmployee?.full_name}". Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
