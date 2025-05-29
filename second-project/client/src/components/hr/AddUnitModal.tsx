import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { entityTypes, insertOrgUnitSchema } from '@shared/schema';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: number | null;
  onSuccess: () => void;
}

export default function AddUnitModal({ isOpen, onClose, parentId, onSuccess }: AddUnitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  // Расширяем схему для валидации
  const formSchema = insertOrgUnitSchema.extend({
    type: z.enum([
      entityTypes.ORGANIZATION,
      entityTypes.MANAGEMENT,
      entityTypes.DEPARTMENT,
      entityTypes.POSITION
    ]),
  });
  
  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: entityTypes.POSITION,
      parentId: parentId,
      isOrganization: false,
      isManagement: false,
      isDepartment: false,
      isPosition: false,
      staffCount: 1,
      positionX: 0,
      positionY: 0,
    },
  });
  
  // Мутация для создания новой ячейки
  const createUnit = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      // В зависимости от типа устанавливаем соответствующие флаги
      let unitData = {
        ...data,
        isOrganization: data.type === entityTypes.ORGANIZATION,
        isManagement: data.type === entityTypes.MANAGEMENT,
        isDepartment: data.type === entityTypes.DEPARTMENT,
        isPosition: data.type === entityTypes.POSITION,
      };
      
      return apiRequest('POST', '/api/org-units', unitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org-units'] });
      onSuccess();
      form.reset({
        name: '',
        type: entityTypes.POSITION,
        parentId: parentId,
        isOrganization: false,
        isManagement: false,
        isDepartment: false,
        isPosition: false,
        staffCount: 1,
        positionX: 0,
        positionY: 0,
      });
    }
  });
  
  // Обработка отправки формы
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createUnit.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработка изменения типа
  const handleTypeChange = (value: string) => {
    form.setValue('type', value as any);
    
    // Обновляем флаги в соответствии с типом
    form.setValue('isOrganization', value === entityTypes.ORGANIZATION);
    form.setValue('isManagement', value === entityTypes.MANAGEMENT);
    form.setValue('isDepartment', value === entityTypes.DEPARTMENT);
    form.setValue('isPosition', value === entityTypes.POSITION);
    
    // Если выбрана должность, устанавливаем staffCount = 1, иначе обнуляем
    if (value === entityTypes.POSITION) {
      form.setValue('staffCount', 1);
    } else {
      form.setValue('staffCount', 0);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить элемент структуры</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Поле для названия */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Поле для типа */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип элемента</FormLabel>
                  <Select
                    onValueChange={handleTypeChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={entityTypes.ORGANIZATION}>Организация</SelectItem>
                      <SelectItem value={entityTypes.MANAGEMENT}>Управление</SelectItem>
                      <SelectItem value={entityTypes.DEPARTMENT}>Отдел</SelectItem>
                      <SelectItem value={entityTypes.POSITION}>Должность</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Поле для количества штатных единиц (только для должностей) */}
            {form.watch('type') === entityTypes.POSITION && (
              <FormField
                control={form.control}
                name="staffCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Количество штатных единиц</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}