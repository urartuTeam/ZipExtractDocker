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

interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

// Схема валидации для формы
const departmentFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа").max(100, "Название не должно превышать 100 символов"),
  parent_department_id: z.string().nullable().transform(val => 
    val && val !== "null" ? Number(val) : null
  ),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      parent_department_id: null,
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
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

  // Запрос на получение отделов
  const { data: departmentsData, isLoading, error } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Фильтрация отделов на основе поискового запроса
  const filteredDepartments = departmentsData?.data.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = (values: DepartmentFormValues) => {
    createDepartment.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Отделы</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>Добавить отдел</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск отделов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Родительский отдел</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        Отделы не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department) => {
                      // Найдем имя родительского отдела
                      const parentDepartment = department.parent_department_id 
                        ? departmentsData?.data.find(d => d.department_id === department.parent_department_id)
                        : null;

                      return (
                        <TableRow key={department.department_id}>
                          <TableCell>{department.department_id}</TableCell>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>
                            {parentDepartment ? parentDepartment.name : '—'}
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
              
              <FormField
                control={form.control}
                name="parent_department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Родительский отдел</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString() || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите родительский отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Нет (корневой отдел)</SelectItem>
                        {departmentsData?.data.map((dept) => (
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
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createDepartment.isPending}
                >
                  {createDepartment.isPending ? "Создание..." : "Создать отдел"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}