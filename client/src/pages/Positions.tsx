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

interface Position {
  position_id: number;
  name: string;
}

interface Employee {
  employee_id: number;
  position_id: number | null;
}

// Схема валидации для формы
const positionFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа").max(100, "Название не должно превышать 100 символов"),
});

type PositionFormValues = z.infer<typeof positionFormSchema>;

export default function Positions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const queryClient = useQueryClient();

  // Form для создания
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Form для редактирования
  const editForm = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
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
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
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

  // Запрос на получение должностей
  const { data: positionsData, isLoading, error } = useQuery<{ status: string, data: Position[] }>({
    queryKey: ['/api/positions'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

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
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
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
                            <div className="flex space-x-2">
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
                                disabled={usedByEmployees}
                                title={usedByEmployees ? "Невозможно удалить: должность назначена сотрудникам" : ""}
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
            <DialogTitle>Добавить новую должность</DialogTitle>
            <DialogDescription>
              Введите название новой должности
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
              disabled={deletePosition.isPending}
            >
              {deletePosition.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}