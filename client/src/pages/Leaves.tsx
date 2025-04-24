import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Leave {
  leave_id: number;
  employee_id: number;
  start_date: string;
  end_date: string | null;
  type: string;
}

interface Employee {
  employee_id: number;
  full_name: string;
}

export default function Leaves() {
  const [searchTerm, setSearchTerm] = useState("");

  // Запрос на получение отпусков
  const { data: leavesData, isLoading, error } = useQuery<{ status: string, data: Leave[] }>({
    queryKey: ['/api/leaves'],
  });

  // Запрос на получение сотрудников
  const { data: employeesData } = useQuery<{ status: string, data: Employee[] }>({
    queryKey: ['/api/employees'],
  });

  // Фильтрация отпусков на основе поискового запроса и имени сотрудника
  const filteredLeaves = leavesData?.data.filter(leave => {
    const employee = employeesData?.data.find(emp => emp.employee_id === leave.employee_id);
    if (!employee) return false;
    
    return (
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  // Получение имени сотрудника по ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employeesData?.data.find(emp => emp.employee_id === employeeId);
    return employee ? employee.full_name : `Сотрудник #${employeeId}`;
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  // Определение статуса отпуска
  const getLeaveStatus = (startDate: string, endDate: string | null) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (start > now) {
      return { label: 'Запланирован', variant: 'outline' as const };
    }
    
    if (!end) {
      return { label: 'Активен', variant: 'default' as const };
    }
    
    if (end < now) {
      return { label: 'Завершен', variant: 'secondary' as const };
    }
    
    return { label: 'Активен', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Отпуска</h1>
        <Button>Добавить отпуск</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск по сотруднику или типу отпуска..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список отпусков</CardTitle>
          <CardDescription>
            Всего отпусков: {leavesData?.data.length || 0}
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
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Дата начала</TableHead>
                    <TableHead>Дата окончания</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Отпуска не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => {
                      const status = getLeaveStatus(leave.start_date, leave.end_date);
                      
                      return (
                        <TableRow key={leave.leave_id}>
                          <TableCell>{leave.leave_id}</TableCell>
                          <TableCell className="font-medium">{getEmployeeName(leave.employee_id)}</TableCell>
                          <TableCell>{leave.type}</TableCell>
                          <TableCell>{formatDate(leave.start_date)}</TableCell>
                          <TableCell>{formatDate(leave.end_date)}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
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