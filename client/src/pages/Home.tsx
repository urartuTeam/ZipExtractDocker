import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, LogInIcon } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import OrganizationTreeNew from "@/components/OrganizationTreeNew";
import headerBgImage from '../assets/image_1745501657968.png';

export default function Home() {
  const { user } = useAuth();

  // Запрос на получение общего количества отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение общего количества сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение общего количества проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/projects'],
  });

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const projects = projectsResponse?.data || [];
  
  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects;

  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием */}
      <div 
        className="text-white p-4 shadow-md flex justify-between items-center relative" 
        style={{ 
          backgroundImage: `url(${headerBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '80px'
        }}
      >
        <div className="flex-1">
          {/* Содержимое заменено на изображение */}
        </div>
        
        <div className="text-center flex-1 text-2xl font-bold">
          
        </div>
        
        <div className="flex-1 flex justify-end">
          {!user ? (
            <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <Link href="/auth">
                <LogInIcon className="w-5 h-5 mr-2" />
                Войти
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {user.username}
            </Button>
          )}
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        {/* Организационная структура */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-8 w-3/4 ml-4" />
              <Skeleton className="h-8 w-2/3 ml-8" />
              <Skeleton className="h-8 w-1/2 ml-8" />
            </div>
          ) : (
            <OrganizationTreeNew />
          )}
        </div>

        {/* Статистика в нижней части страницы */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Отделы</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{departments.length}</div>
            <div className="text-sm text-gray-500">Всего отделов в организации</div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Сотрудники</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{employees.length}</div>
            <div className="text-sm text-gray-500">Всего сотрудников в системе</div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Проекты</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm text-gray-500">Активных проектов</div>
          </div>
        </div>
      </div>
    </div>
  );
}