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
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";

interface Position {
  position_id: number;
  name: string;
}

// Схема валидации для формы
const positionFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа").max(100, "Название не должно превышать 100 символов"),
});

type PositionFormValues = z.infer<typeof positionFormSchema>;

export default function Positions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form
  const form = useForm<PositionFormValues>({
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

  // Запрос на получение должностей
  const { data: positionsData, isLoading, error } = useQuery<{ status: string, data: Position[] }>({
    queryKey: ['/api/positions'],
  });

  // Фильтрация должностей на основе поискового запроса
  const filteredPositions = positionsData?.data.filter(pos => 
    pos.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = (values: PositionFormValues) => {
    createPosition.mutate(values);
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
                    filteredPositions.map((position) => (
                      <TableRow key={position.position_id}>
                        <TableCell>{position.position_id}</TableCell>
                        <TableCell className="font-medium">{position.name}</TableCell>
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
                    ))
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
    </div>
  );
}