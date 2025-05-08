import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Building, PlusCircle, Upload, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Department } from '@shared/schema';

export default function Organizations() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Загрузка списка организаций
  const { data: organizations, isLoading: organizationsLoading } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/organizations'],
  });

  // Загрузка всех отделов для выбора в диалоге
  const { data: departments, isLoading: departmentsLoading } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });

  // Мутация для добавления организации
  const addOrganizationMutation = useMutation({
    mutationFn: async (departmentId: number) => {
      const response = await apiRequest('POST', `/api/organizations/${departmentId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Организация добавлена',
        description: 'Отдел успешно отмечен как организация',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setDialogOpen(false);
      setSelectedDepartmentId('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: `Не удалось добавить организацию: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Мутация для удаления организации
  const removeOrganizationMutation = useMutation({
    mutationFn: async (departmentId: number) => {
      const response = await apiRequest('DELETE', `/api/organizations/${departmentId}`, {});
      return response.json();
    },
    onSuccess: (_, departmentId) => {
      toast({
        title: 'Организация удалена',
        description: 'Отдел больше не отмечен как организация',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: `Не удалось удалить организацию: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Фильтрация отделов, которые еще не являются организациями
  const availableDepartments = departments?.data.filter(
    dept => !organizations?.data.some(
      org => org.department_id === dept.department_id
    )
  ) || [];

  const handleAddOrganization = () => {
    if (selectedDepartmentId) {
      addOrganizationMutation.mutate(parseInt(selectedDepartmentId));
    }
  };

  const handleRemoveOrganization = (departmentId: number) => {
    if (confirm('Вы уверены, что хотите удалить эту организацию?')) {
      removeOrganizationMutation.mutate(departmentId);
    }
  };

  if (organizationsLoading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Организации</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Добавить организацию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить организацию</DialogTitle>
              <DialogDescription>
                Выберите отдел, который будет отмечен как организация
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Отдел
                </Label>
                <Select 
                  value={selectedDepartmentId} 
                  onValueChange={setSelectedDepartmentId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="loading" disabled>Загрузка...</SelectItem>
                    ) : availableDepartments.length === 0 ? (
                      <SelectItem value="none" disabled>Нет доступных отделов</SelectItem>
                    ) : (
                      availableDepartments.map(dept => (
                        <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleAddOrganization} 
                disabled={!selectedDepartmentId || addOrganizationMutation.isPending}
              >
                {addOrganizationMutation.isPending ? 'Добавление...' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations?.data && organizations.data.length > 0 ? (
          organizations.data.map(org => (
            <Card key={org.department_id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary p-4 text-white flex items-center">
                  <Building className="w-6 h-6 mr-3" />
                  <h3 className="text-lg font-semibold">{org.name}</h3>
                </div>
                <div className="p-4">
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveOrganization(org.department_id)}
                      disabled={removeOrganizationMutation.isPending}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-neutral-500">
            Список организаций пуст. Добавьте организацию, нажав на кнопку "Добавить организацию".
          </div>
        )}
      </div>
    </div>
  );
}