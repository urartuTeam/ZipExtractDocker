import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Redirect } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Имя пользователя обязательно' }),
  password: z.string().min(1, { message: 'Пароль обязателен' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Имя пользователя должно содержать минимум 3 символа' }),
  email: z.string().email({ message: 'Введите корректный email' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
  confirmPassword: z.string().min(1, { message: 'Подтверждение пароля обязательно' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { username, email, password } = values;
    registerMutation.mutate({ username, email, password });
  };

  // Перенаправляем на главную страницу, если пользователь уже вошел
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="lg:w-1/2 p-8 lg:p-12">
          <h1 className="text-3xl font-bold text-primary mb-4">Система управления персоналом</h1>
          <p className="text-neutral-600 mb-8">
            Войдите или зарегистрируйтесь, чтобы получить доступ к системе управления персоналом.
          </p>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Вход в систему</CardTitle>
                  <CardDescription>
                    Введите ваши учетные данные для входа
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя пользователя</FormLabel>
                            <FormControl>
                              <Input placeholder="Введите имя пользователя" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Введите пароль" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Вход...' : 'Войти'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-neutral-500">
                    Нет аккаунта?{' '}
                    <button 
                      onClick={() => setActiveTab('register')}
                      className="text-primary hover:underline"
                    >
                      Зарегистрироваться
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Создание аккаунта</CardTitle>
                  <CardDescription>
                    Заполните форму для регистрации нового аккаунта
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя пользователя</FormLabel>
                            <FormControl>
                              <Input placeholder="Введите имя пользователя" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Введите email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Введите пароль" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подтверждение пароля</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Подтвердите пароль" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-neutral-500">
                    Уже есть аккаунт?{' '}
                    <button 
                      onClick={() => setActiveTab('login')}
                      className="text-primary hover:underline"
                    >
                      Войти
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-primary to-primary-foreground p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">Система управления кадрами</h2>
            <p className="text-lg mb-8">
              Эффективный инструмент для управления персоналом, отделами и проектами вашей организации.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Управление структурой организации</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Учет сотрудников и должностей</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Контроль проектов и распределения ресурсов</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Учет отпусков и отсутствий</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}