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

interface OrganizationLogoResponse {
  status: string;
  data: {
    department_id: number;
    logo_path: string | null;
  };
}

export default function Organizations() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Department | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  // Получение информации о логотипе организации
  const baseUrl = ''; // Используем относительный URL
  
  const { refetch: refetchOrganizationLogo } = useQuery<OrganizationLogoResponse>({
    queryKey: ['/api/upload/organization-logo', selectedOrganization?.department_id],
    enabled: !!selectedOrganization,
    refetchOnWindowFocus: false,
    queryFn: async ({ queryKey }) => {
      const [_, departmentId] = queryKey;
      const response = await fetch(`${baseUrl}/api/upload/organization-logo/${departmentId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await response.text();
        console.error('Получен не JSON ответ для GET логотипа:', textError);
        throw new Error('Сервер вернул неверный формат ответа');
      }
      
      return response.json();
    },
  });
  
  // Загрузка логотипа
  const uploadLogoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const departmentId = selectedOrganization?.department_id;
      
      // Используем относительный URL - это работает для всех сред
      const baseUrl = '';
      
      console.log(`Отправка запроса на: ${baseUrl}/api/upload/organization-logo/${departmentId}`);
      
      const response = await fetch(`${baseUrl}/api/upload/organization-logo/${departmentId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Важно: не устанавливаем 'Content-Type': 'multipart/form-data' - браузер сделает это сам с boundary
        },
        credentials: 'include', // Важно для сохранения сессии
      });
      
      // Проверяем, что ответ JSON, а не HTML
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Если ответ не JSON, выводим текст ошибки
        const textError = await response.text();
        console.error('Получен не JSON ответ:', textError);
        throw new Error('Сервер вернул неверный формат ответа');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки логотипа');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Логотип загружен',
        description: 'Логотип организации успешно обновлен',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setLogoDialogOpen(false);
      if (selectedOrganization) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/upload/organization-logo', selectedOrganization.department_id] 
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка загрузки',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Удаление логотипа
  const deleteLogoMutation = useMutation({
    mutationFn: async () => {
      const departmentId = selectedOrganization?.department_id;
      
      // Используем тот же baseUrl с относительным URL, как и для загрузки
      const response = await fetch(`${baseUrl}/api/upload/organization-logo/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textError = await response.text();
        console.error('Получен не JSON ответ для DELETE логотипа:', textError);
        throw new Error('Сервер вернул неверный формат ответа');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Логотип удален',
        description: 'Логотип организации успешно удален',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setLogoDialogOpen(false);
      if (selectedOrganization) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/upload/organization-logo', selectedOrganization.department_id] 
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
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
  
  const handleOpenLogoDialog = (organization: Department) => {
    setSelectedOrganization(organization);
    setLogoDialogOpen(true);
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrganization) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    
    uploadLogoMutation.mutate(formData);
  };
  
  const handleDeleteLogo = () => {
    if (confirm('Вы уверены, что хотите удалить логотип организации?')) {
      deleteLogoMutation.mutate();
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
                  {org.logo_path ? (
                    <img 
                      src={org.logo_path} 
                      alt={`Логотип ${org.name}`} 
                      className="w-8 h-8 mr-3 object-contain"
                    />
                  ) : (
                    <Building className="w-6 h-6 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold">{org.name}</h3>
                </div>
                <div className="p-4">
                  <div className="mt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenLogoDialog(org)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      {org.logo_path ? 'Изменить логотип' : 'Добавить логотип'}
                    </Button>
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
        
        {/* Диалог для загрузки логотипа */}
        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Логотип организации</DialogTitle>
              <DialogDescription>
                Загрузите логотип для организации "{selectedOrganization?.name}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedOrganization?.logo_path && (
                <div className="p-4 border rounded-md flex flex-col items-center">
                  <img 
                    src={selectedOrganization.logo_path} 
                    alt={`Логотип ${selectedOrganization.name}`} 
                    className="max-h-40 object-contain mb-4"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteLogo}
                    disabled={deleteLogoMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteLogoMutation.isPending ? 'Удаление...' : 'Удалить логотип'}
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                />
                <Button 
                  onClick={handleFileSelect}
                  disabled={uploadLogoMutation.isPending}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadLogoMutation.isPending ? 'Загрузка...' : 'Загрузить логотип'}
                </Button>
                <p className="text-xs text-neutral-500 mt-2">
                  Допустимые форматы: JPEG, PNG, GIF, SVG. Максимальный размер: 5MB.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}