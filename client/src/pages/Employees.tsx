import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  phone: string | null;
  email: string | null;
  manager_id: number | null;
  department_id: number | null;
}

interface Position {
  position_id: number;
  name: string;
}

interface Department {
  department_id: number;
  name: string;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");

  // Запрос на получение сотрудников
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение должностей
  const { data: positionsData } = useQuery<{ status: string, data: Position[] }>({
    queryKey: ['/api/positions'],
  });

  // Запрос на получение отделов
  const { data: departmentsData } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Фильтрация сотрудников на основе поискового запроса
  const filteredEmployees = employeesData?.data.filter(employee => 
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isLoading = isLoadingEmployees;
  const error = employeesError;

  // Получение названия должности по ID
  const getPositionName = (positionId: number | null) => {
    if (!positionId) return '—';
    const position = positionsData?.data.find(pos => pos.position_id === positionId);
    return position ? position.name : '—';
  };

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return '—';
    const department = departmentsData?.data.find(dept => dept.department_id === departmentId);
    return department ? department.name : '—';
  };

  // Получение имени руководителя по ID
  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '—';
    const manager = employeesData?.data.find(emp => emp.employee_id === managerId);
    return manager ? manager.full_name : '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Сотрудники</h1>
        <Button>Добавить сотрудника</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск сотрудников..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>
            Всего сотрудников: {employeesData?.data.length || 0}
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead>Руководитель</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead className="w-[100px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Сотрудники не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.employee_id}>
                        <TableCell>{employee.employee_id}</TableCell>
                        <TableCell className="font-medium">{employee.full_name}</TableCell>
                        <TableCell>{getPositionName(employee.position_id)}</TableCell>
                        <TableCell>{getDepartmentName(employee.department_id)}</TableCell>
                        <TableCell>{getManagerName(employee.manager_id)}</TableCell>
                        <TableCell>
                          {employee.email && <div>{employee.email}</div>}
                          {employee.phone && <div>{employee.phone}</div>}
                          {!employee.email && !employee.phone && '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              Изменить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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