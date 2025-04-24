import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  project_id: number;
  name: string;
  department_id: number;
}

interface Department {
  department_id: number;
  name: string;
}

interface EmployeeProject {
  employee_id: number;
  project_id: number;
  role: string;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");

  // Запрос на получение проектов
  const { data: projectsData, isLoading, error } = useQuery<{ status: string, data: Project[] }>({
    queryKey: ['/api/projects'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение связей сотрудников и проектов
  const { data: employeeProjectsData } = useQuery<{ status: string, data: EmployeeProject[] }>({
    queryKey: ['/api/employeeprojects'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Фильтрация проектов на основе поискового запроса
  const filteredProjects = projectsData?.data.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return '—';
    const department = departmentsData?.data.find(dept => dept.department_id === departmentId);
    return department ? department.name : '—';
  };

  // Получение сотрудников на проекте
  const getProjectEmployees = (projectId: number) => {
    if (!employeeProjectsData) return [];
    
    return employeeProjectsData.data
      .filter(ep => ep.project_id === projectId)
      .map(ep => {
        const employee = employeesData?.data.find(e => e.employee_id === ep.employee_id);
        return {
          id: ep.employee_id,
          name: employee ? employee.full_name : `Сотрудник #${ep.employee_id}`,
          role: ep.role
        };
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Проекты</h1>
        <Button>Добавить проект</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск проектов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список проектов</CardTitle>
          <CardDescription>
            Всего проектов: {projectsData?.data.length || 0}
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
                    <TableHead>Отдел</TableHead>
                    <TableHead>Участники</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Проекты не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => {
                      const projectEmployees = getProjectEmployees(project.project_id);
                      
                      return (
                        <TableRow key={project.project_id}>
                          <TableCell>{project.project_id}</TableCell>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{getDepartmentName(project.department_id)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {projectEmployees.length > 0 ? (
                                projectEmployees.slice(0, 3).map((emp) => (
                                  <Badge key={emp.id} variant="outline" className="py-1">
                                    {emp.name} ({emp.role})
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500">Нет участников</span>
                              )}
                              {projectEmployees.length > 3 && (
                                <Badge variant="secondary" className="py-1">
                                  +{projectEmployees.length - 3}
                                </Badge>
                              )}
                            </div>
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
    </div>
  );
}