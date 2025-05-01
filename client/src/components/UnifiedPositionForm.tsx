import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// UI компоненты
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Типы из схемы
type Position = {
  position_id: number;
  name: string;
  deleted: boolean;
  deleted_at: string | null;
};

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted: boolean;
  deleted_at: string | null;
};

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  vacancy_count: number;
  is_primary: boolean;
  deleted: boolean;
  deleted_at: string | null;
};

type PositionPosition = {
  position_relation_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number | null;
  sort: number | null;
  deleted: boolean;
  deleted_at: string | null;
};

// Схема формы создания/редактирования должности
const positionFormSchema = z.object({
  name: z.string().min(1, "Название должности обязательно"),
  departmentLinks: z.array(
    z.object({
      department_id: z.number(),
      vacancy_count: z.number().min(0, "Количество вакансий не может быть отрицательным"),
      is_primary: z.boolean(),
    })
  ).min(1, "Необходимо указать хотя бы один отдел"),
  positionLinks: z.array(
    z.object({
      parent_position_id: z.number(),
      department_id: z.number().nullable(),
    })
  ),
});

// Тип данных формы
type PositionFormValues = z.infer<typeof positionFormSchema>;

interface UnifiedPositionFormProps {
  isOpen: boolean;
  onClose: () => void;
  positionId?: number; // Если указан, то это режим редактирования
}

const UnifiedPositionForm: React.FC<UnifiedPositionFormProps> = ({
  isOpen,
  onClose,
  positionId,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!positionId;

  // Загружаем данные для формы
  const { data: departmentsData, isLoading: isDepartmentsLoading } = useQuery<{ status: string; data: Department[] }>({
    queryKey: ["/api/departments"],
  });

  const { data: positionsData, isLoading: isPositionsLoading } = useQuery<{ status: string; data: Position[] }>({
    queryKey: ["/api/positions"],
  });

  const { data: positionDepartmentsData, isLoading: isPositionDepartmentsLoading } = useQuery<{ status: string; data: PositionDepartment[] }>({
    queryKey: ["/api/positiondepartments"],
  });

  const { data: positionHierarchyData, isLoading: isPositionHierarchyLoading } = useQuery<{ status: string; data: PositionPosition[] }>({
    queryKey: ["/api/positionpositions"],
  });

  // Если в режиме редактирования, загружаем данные о должности
  const { data: positionData, isLoading: isPositionLoading } = useQuery<{ status: string; data: Position }>({
    queryKey: [`/api/positions/${positionId}`],
    enabled: !!positionId, // Запрос активен только если есть positionId
  });

  // Создаем форму
  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      name: "",
      departmentLinks: [],
      positionLinks: [],
    },
  });

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (isEditMode && positionData && positionDepartmentsData && positionHierarchyData) {
      const position = positionData.data;
      
      // Находим все связи этой должности с отделами
      const departmentLinks = positionDepartmentsData.data
        .filter(link => link.position_id === positionId && !link.deleted)
        .map(link => ({
          department_id: link.department_id,
          vacancy_count: link.vacancy_count,
          is_primary: link.is_primary,
        }));
      
      // Находим все связи этой должности с родительскими должностями
      const positionLinks = positionHierarchyData.data
        .filter(link => link.position_id === positionId && !link.deleted)
        .map(link => ({
          parent_position_id: link.parent_position_id,
          department_id: link.department_id,
        }));
      
      // Устанавливаем значения формы
      form.reset({
        name: position.name,
        departmentLinks,
        positionLinks,
      });
    }
  }, [isEditMode, positionData, positionDepartmentsData, positionHierarchyData, positionId, form]);

  // Мутация для создания должности
  const createPositionMutation = useMutation({
    mutationFn: async (data: PositionFormValues) => {
      // 1. Создаем должность
      const positionResponse = await apiRequest("POST", "/api/positions", { name: data.name });
      if (!positionResponse.ok) throw new Error("Не удалось создать должность");
      
      const positionResult = await positionResponse.json();
      const newPositionId = positionResult.data.position_id;
      
      // 2. Создаем связи с отделами
      for (const link of data.departmentLinks) {
        const linkResponse = await apiRequest("POST", "/api/positiondepartments", {
          position_id: newPositionId,
          department_id: link.department_id,
          vacancy_count: link.vacancy_count,
          is_primary: link.is_primary,
        });
        
        if (!linkResponse.ok) throw new Error(`Не удалось связать должность с отделом ${link.department_id}`);
      }
      
      // 3. Создаем связи с родительскими должностями
      for (const link of data.positionLinks) {
        const positionLinkResponse = await apiRequest("POST", "/api/positionpositions", {
          position_id: newPositionId,
          parent_position_id: link.parent_position_id,
          department_id: link.department_id,
        });
        
        if (!positionLinkResponse.ok) throw new Error(`Не удалось создать иерархическую связь с должностью ${link.parent_position_id}`);
      }
      
      return positionResult.data;
    },
    onSuccess: () => {
      // Инвалидируем все связанные запросы, чтобы обновить данные
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positiondepartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positionpositions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/with-departments"] });
      
      toast({
        title: "Должность создана",
        description: "Должность и все её связи успешно созданы",
      });
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать должность: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Мутация для обновления должности
  const updatePositionMutation = useMutation({
    mutationFn: async (data: PositionFormValues) => {
      if (!positionId) throw new Error("ID должности не указан");
      
      // 1. Обновляем основные данные должности
      const positionResponse = await apiRequest("PUT", `/api/positions/${positionId}`, { name: data.name });
      if (!positionResponse.ok) throw new Error("Не удалось обновить должность");
      
      // 2. Получаем текущие связи
      const currentDeptLinks = positionDepartmentsData?.data.filter(link => 
        link.position_id === positionId && !link.deleted
      ) || [];
      
      const currentPosLinks = positionHierarchyData?.data.filter(link => 
        link.position_id === positionId && !link.deleted
      ) || [];
      
      // 3. Обновляем связи с отделами - удаляем старые, создаем новые
      // Сначала удаляем все старые связи
      for (const link of currentDeptLinks) {
        await apiRequest("DELETE", `/api/positiondepartments/${link.position_link_id}`);
      }
      
      // Затем создаем новые связи
      for (const link of data.departmentLinks) {
        await apiRequest("POST", "/api/positiondepartments", {
          position_id: positionId,
          department_id: link.department_id,
          vacancy_count: link.vacancy_count,
          is_primary: link.is_primary,
        });
      }
      
      // 4. Обновляем иерархические связи с должностями
      // Удаляем старые связи
      for (const link of currentPosLinks) {
        await apiRequest("DELETE", `/api/positionpositions/${link.position_relation_id}`);
      }
      
      // Создаем новые связи
      for (const link of data.positionLinks) {
        await apiRequest("POST", "/api/positionpositions", {
          position_id: positionId,
          parent_position_id: link.parent_position_id,
          department_id: link.department_id,
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positiondepartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positionpositions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/with-departments"] });
      queryClient.invalidateQueries({ queryKey: [`/api/positions/${positionId}`] });
      
      toast({
        title: "Должность обновлена",
        description: "Должность и все её связи успешно обновлены",
      });
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось обновить должность: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Состояние для выбранного отдела при добавлении связи
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [vacancyCount, setVacancyCount] = useState<string>("0");
  const [isPrimary, setIsPrimary] = useState<boolean>(false);

  // Состояние для выбранной родительской должности
  const [selectedParentPositionId, setSelectedParentPositionId] = useState<string>("");
  const [selectedParentDepartmentId, setSelectedParentDepartmentId] = useState<string>("");

  // Добавление связи с отделом
  const addDepartmentLink = () => {
    const departmentId = parseInt(selectedDepartmentId);
    if (!departmentId) return;
    
    const currentLinks = form.getValues().departmentLinks || [];
    // Проверяем, не добавлен ли уже этот отдел
    if (currentLinks.some(link => link.department_id === departmentId)) {
      toast({
        title: "Ошибка",
        description: "Этот отдел уже добавлен",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("departmentLinks", [
      ...currentLinks,
      {
        department_id: departmentId,
        vacancy_count: parseInt(vacancyCount) || 0,
        is_primary: isPrimary,
      }
    ]);
    
    // Сбрасываем форму добавления
    setSelectedDepartmentId("");
    setVacancyCount("0");
    setIsPrimary(false);
  };

  // Удаление связи с отделом
  const removeDepartmentLink = (departmentId: number) => {
    const currentLinks = form.getValues().departmentLinks || [];
    form.setValue("departmentLinks", currentLinks.filter(link => link.department_id !== departmentId));
  };

  // Добавление связи с родительской должностью
  const addPositionLink = () => {
    const parentPositionId = parseInt(selectedParentPositionId);
    if (!parentPositionId) return;
    
    const departmentId = selectedParentDepartmentId ? parseInt(selectedParentDepartmentId) : null;
    
    const currentLinks = form.getValues().positionLinks || [];
    // Проверяем, не добавлена ли уже эта связь
    if (currentLinks.some(link => 
      link.parent_position_id === parentPositionId && 
      link.department_id === departmentId
    )) {
      toast({
        title: "Ошибка",
        description: "Эта иерархическая связь уже добавлена",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("positionLinks", [
      ...currentLinks,
      {
        parent_position_id: parentPositionId,
        department_id: departmentId,
      }
    ]);
    
    // Сбрасываем форму добавления
    setSelectedParentPositionId("");
    setSelectedParentDepartmentId("");
  };

  // Удаление связи с родительской должностью
  const removePositionLink = (parentPositionId: number, departmentId: number | null) => {
    const currentLinks = form.getValues().positionLinks || [];
    form.setValue("positionLinks", currentLinks.filter(link => 
      !(link.parent_position_id === parentPositionId && link.department_id === departmentId)
    ));
  };

  // Поиск названия отдела или должности по ID
  const getDepartmentName = (departmentId: number) => {
    return departmentsData?.data.find(d => d.department_id === departmentId)?.name || `Отдел #${departmentId}`;
  };
  
  const getPositionName = (positionId: number) => {
    return positionsData?.data.find(p => p.position_id === positionId)?.name || `Должность #${positionId}`;
  };

  // Обработка отправки формы
  const onSubmit = (values: PositionFormValues) => {
    if (isEditMode) {
      updatePositionMutation.mutate(values);
    } else {
      createPositionMutation.mutate(values);
    }
  };

  const isLoading = isDepartmentsLoading || isPositionsLoading || 
                   isPositionDepartmentsLoading || isPositionHierarchyLoading ||
                   (isEditMode && isPositionLoading);

  const isMutating = createPositionMutation.isPending || updatePositionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Редактирование должности" : "Создание должности"}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-4">
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
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Связь с отделами</h3>
                  
                  {/* Уже добавленные отделы */}
                  <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-2">Добавленные отделы:</h4>
                    {form.getValues().departmentLinks?.length ? (
                      <div className="space-y-2">
                        {form.getValues().departmentLinks.map((link, index) => (
                          <div key={`${link.department_id}-${index}`} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Badge variant={link.is_primary ? "default" : "outline"}>
                                {link.is_primary ? "Основной" : "Дополнительный"}
                              </Badge>
                              <span>{getDepartmentName(link.department_id)}</span>
                              <Badge variant="secondary">{link.vacancy_count} вакансий</Badge>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeDepartmentLink(link.department_id)}
                              type="button"
                            >
                              Удалить
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Нет добавленных отделов</p>
                    )}
                  </div>
                  
                  {/* Форма для добавления нового отдела */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Добавить отдел</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Select
                            value={selectedDepartmentId}
                            onValueChange={setSelectedDepartmentId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите отдел" />
                            </SelectTrigger>
                            <SelectContent>
                              {departmentsData?.data
                                .filter(dept => !dept.deleted)
                                .map(dept => (
                                  <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Input 
                            type="number" 
                            placeholder="Количество вакансий" 
                            value={vacancyCount}
                            onChange={(e) => setVacancyCount(e.target.value)}
                            min="0"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="isPrimary" 
                            checked={isPrimary} 
                            onCheckedChange={(checked) => setIsPrimary(!!checked)}
                          />
                          <label
                            htmlFor="isPrimary"
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            Это основной отдел
                          </label>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="button" 
                        onClick={addDepartmentLink}
                        disabled={!selectedDepartmentId}
                      >
                        Добавить отдел
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Иерархические связи с должностями</h3>
                  
                  {/* Уже добавленные родительские должности */}
                  <div className="mb-4">
                    <h4 className="text-sm text-muted-foreground mb-2">Добавленные связи:</h4>
                    {form.getValues().positionLinks?.length ? (
                      <div className="space-y-2">
                        {form.getValues().positionLinks.map((link, index) => (
                          <div key={`${link.parent_position_id}-${link.department_id}-${index}`} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <span>Подчиняется: {getPositionName(link.parent_position_id)}</span>
                              {link.department_id && (
                                <Badge variant="outline">в отделе {getDepartmentName(link.department_id)}</Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removePositionLink(link.parent_position_id, link.department_id)}
                              type="button"
                            >
                              Удалить
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Нет добавленных иерархических связей</p>
                    )}
                  </div>
                  
                  {/* Форма для добавления новой иерархической связи */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Добавить родительскую должность</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Select
                            value={selectedParentPositionId}
                            onValueChange={setSelectedParentPositionId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите родительскую должность" />
                            </SelectTrigger>
                            <SelectContent>
                              {positionsData?.data
                                .filter(pos => !pos.deleted && pos.position_id !== positionId)
                                .map(pos => (
                                  <SelectItem key={pos.position_id} value={pos.position_id.toString()}>
                                    {pos.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Select
                            value={selectedParentDepartmentId}
                            onValueChange={setSelectedParentDepartmentId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Отдел (опционально)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Общая связь (без привязки к отделу)</SelectItem>
                              {departmentsData?.data
                                .filter(dept => !dept.deleted)
                                .map(dept => (
                                  <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="button" 
                        onClick={addPositionLink}
                        disabled={!selectedParentPositionId}
                      >
                        Добавить связь
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isMutating}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isMutating}
                  >
                    {isMutating && (
                      <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isEditMode ? "Сохранить" : "Создать"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedPositionForm;