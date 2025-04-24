import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Запрос на получение общего количества отделов
  const departmentsQuery = useQuery({
    queryKey: ['/api/departments'],
    select: (data) => data.data.length
  });

  // Запрос на получение общего количества сотрудников
  const employeesQuery = useQuery({
    queryKey: ['/api/employees'], 
    select: (data) => data.data.length
  });

  // Запрос на получение общего количества проектов
  const projectsQuery = useQuery({
    queryKey: ['/api/projects'],
    select: (data) => data.data.length
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Система управления персоналом</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Отделы</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {departmentsQuery.isLoading ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                departmentsQuery.data || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего отделов</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/departments">Просмотреть все отделы</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Сотрудники</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {employeesQuery.isLoading ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                employeesQuery.data || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего сотрудников</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/employees">Просмотреть всех сотрудников</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Проекты</CardTitle>
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {projectsQuery.isLoading ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                projectsQuery.data || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Всего проектов</p>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/projects">Просмотреть все проекты</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Быстрый доступ</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/departments">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Отделы
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/positions">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Должности
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/employees">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Сотрудники
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/projects">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Проекты
            </Link>
          </Button>
          <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/leaves">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Отпуска
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}