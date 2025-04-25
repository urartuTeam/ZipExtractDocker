import React, { useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Project, 
  EmployeeProject, 
  Employee, 
  Department,
  Position
} from '@shared/schema';
import { ArrowLeft, Phone, Mail, Briefcase, Building } from 'lucide-react';

// Тип для сгруппированных сотрудников по отделам
type EmployeesByDepartment = {
  [departmentId: string]: {
    department: Department | null;
    employees: Array<{
      employee: Employee;
      position: Position | null;
      role: string;
    }>;
  };
};

export default function ProjectDetails() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/projects/:id');
  const { toast } = useToast();
  
  // Получаем ID проекта из URL
  const projectId = match ? parseInt(params.id) : 0;

  // Запрос на получение данных проекта
  const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{status: string, data: Project}>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить информацию о проекте',
        variant: 'destructive',
      });
      navigate('/projects');
    },
  });

  // Запрос на получение связей сотрудников и проекта
  const { data: employeeProjectsResponse, isLoading: isLoadingEmployeeProjects } = useQuery<{status: string, data: EmployeeProject[]}>({
    queryKey: [`/api/employeeprojects/project/${projectId}`],
    enabled: !!projectId,
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить информацию о сотрудниках проекта',
        variant: 'destructive',
      });
    },
  });

  // Получаем всех сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные о сотрудниках',
        variant: 'destructive',
      });
    },
  });

  // Получаем все отделы
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные об отделах',
        variant: 'destructive',
      });
    },
  });

  // Получаем все должности
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные о должностях',
        variant: 'destructive',
      });
    },
  });

  const project = projectResponse?.data;
  const employeeProjects = employeeProjectsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const departments = departmentsResponse?.data || [];
  const positions = positionsResponse?.data || [];

  const isLoading = isLoadingProject || isLoadingEmployeeProjects || 
                    isLoadingEmployees || isLoadingDepartments || isLoadingPositions;

  // Группируем сотрудников по отделам
  const employeesByDepartment = useMemo(() => {
    if (!employeeProjects.length || !employees.length) return {};

    const result: EmployeesByDepartment = {};

    // Сначала находим всех сотрудников проекта
    employeeProjects.forEach(ep => {
      const employee = employees.find(e => e.employee_id === ep.employee_id);
      if (employee) {
        const position = positions.find(p => p.position_id === employee.position_id) || null;
        const departmentId = employee.department_id?.toString() || 'no-department';
        
        if (!result[departmentId]) {
          const department = employee.department_id 
            ? departments.find(d => d.department_id === employee.department_id) || null
            : null;
          
          result[departmentId] = {
            department,
            employees: [],
          };
        }
        
        result[departmentId].employees.push({
          employee,
          position,
          role: ep.role,
        });
      }
    });

    return result;
  }, [employeeProjects, employees, departments, positions]);

  // Если проект не найден, показываем сообщение об ошибке и кнопку возврата
  if (!isLoading && !project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-12 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-medium mb-4">Проект не найден</h2>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку проектов
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          К списку проектов
        </Button>
        
        {isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <h1 className="text-2xl font-bold">{project?.name}</h1>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-md shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-[#a40000]" />
              Сотрудники проекта
            </h2>
            
            {Object.keys(employeesByDepartment).length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-md">
                <p className="text-gray-500">К проекту не привязаны сотрудники</p>
              </div>
            ) : (
              <>
                {Object.entries(employeesByDepartment).map(([departmentId, data]) => (
                  <div key={departmentId} className="mb-6">
                    <div className="flex items-center mb-2">
                      <Building className="mr-2 h-4 w-4 text-gray-500" />
                      <h3 className="text-lg font-medium text-gray-700">
                        {data.department ? data.department.name : 'Без отдела'}
                      </h3>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ФИО</TableHead>
                          <TableHead>Должность</TableHead>
                          <TableHead>Роль в проекте</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.employees.map(({ employee, position, role }) => (
                          <TableRow key={employee.employee_id}>
                            <TableCell className="font-medium">{employee.full_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Briefcase className="mr-1 h-3 w-3 text-gray-400" />
                                {position ? position.name : 'Н/Д'}
                              </div>
                            </TableCell>
                            <TableCell>{role}</TableCell>
                            <TableCell>
                              {employee.phone ? (
                                <div className="flex items-center">
                                  <Phone className="mr-1 h-3 w-3 text-gray-400" />
                                  {employee.phone}
                                </div>
                              ) : 'Н/Д'}
                            </TableCell>
                            <TableCell>
                              {employee.email ? (
                                <div className="flex items-center">
                                  <Mail className="mr-1 h-3 w-3 text-gray-400" />
                                  {employee.email}
                                </div>
                              ) : 'Н/Д'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент значка Users
const Users = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);