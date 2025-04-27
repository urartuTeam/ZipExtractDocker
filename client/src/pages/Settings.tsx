import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface Setting {
  id: number;
  data_key: string;
  data_value: string;
  created_at: string;
  updated_at: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);
  const { user } = useAuth();

  // Запрос на получение настроек
  const { 
    data: settingsResponse, 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Извлекаем настройки из ответа, учитывая структуру ответа API
  const settings = Array.isArray(settingsResponse?.data) ? settingsResponse.data : [];

  // Эффект для установки выбранного уровня иерархии из полученных настроек
  useEffect(() => {
    if (settings && settings.length > 0) {
      const hierarchyLevelSetting = settings.find(
        (setting: Setting) => setting.data_key === 'hierarchy_initial_levels'
      );
      
      if (hierarchyLevelSetting) {
        setSelectedLevel(hierarchyLevelSetting.data_value);
      }
    }
  }, [settings]);

  // Мутация для обновления настроек
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest('POST', '/api/settings', { key, value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Настройки обновлены',
        description: 'Настройки успешно сохранены.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка при сохранении настроек',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  // Мутация для смены пароля
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest('POST', '/api/change-password', passwordData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Пароль изменен',
        description: 'Ваш пароль был успешно изменен.',
      });
      setPasswordChangeOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast({
        title: 'Ошибка при смене пароля',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  // Обработчик изменения уровней иерархии
  const handleHierarchyLevelChange = (value: string) => {
    setSelectedLevel(value);
    updateSettingMutation.mutate({ key: 'hierarchy_initial_levels', value });
  };

  // Обработчик отправки формы смены пароля
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Проверка на совпадение паролей
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка при смене пароля',
        description: 'Новый пароль и подтверждение пароля не совпадают.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Отправка запроса на смену пароля
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  // Если загружаются настройки, показываем индикатор загрузки
  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Если ошибка при загрузке настроек
  if (settingsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          Ошибка при загрузке настроек: {String(settingsError)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Карточка с настройками организационной структуры */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки отображения организационной структуры</CardTitle>
            <CardDescription>
              Настройки влияют на то, как будет отображаться структура организации на главной странице.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hierarchy-levels">
                  Количество уровней иерархии при начальном отображении страницы
                </Label>
                <Select
                  value={selectedLevel}
                  onValueChange={handleHierarchyLevelChange}
                >
                  <SelectTrigger id="hierarchy-levels" className="w-full mt-1">
                    <SelectValue placeholder="Выберите количество уровней" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 уровень</SelectItem>
                    <SelectItem value="2">2 уровня (рекомендуется)</SelectItem>
                    <SelectItem value="3">3 уровня</SelectItem>
                    <SelectItem value="4">4 уровня</SelectItem>
                    <SelectItem value="5">5 уровней</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  При значении "2" будут отображаться верхние 2 уровня иерархии с возможностью раскрыть остальные.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Карточка с настройками пользователя */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки пользователя</CardTitle>
            <CardDescription>
              Изменение личных данных пользователя.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Имя пользователя</Label>
                <Input value={user?.username} className="mt-1" disabled />
              </div>
              <div>
                <Label>Электронная почта</Label>
                <Input value={user?.email} className="mt-1" disabled />
              </div>
              
              <Dialog open={passwordChangeOpen} onOpenChange={setPasswordChangeOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">Изменить пароль</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Изменение пароля</DialogTitle>
                    <DialogDescription>
                      Введите текущий пароль и новый пароль для вашей учетной записи.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="current-password">Текущий пароль</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Новый пароль</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <DialogFooter className="mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setPasswordChangeOpen(false)}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          'Сохранить'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}