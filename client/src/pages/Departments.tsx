import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState("");

  // Запрос на получение отделов
  const { data: departmentsData, isLoading, error } = useQuery<{ status: string, data: Department[] }>({
    queryKey: ['/api/departments'],
  });

  // Фильтрация отделов на основе поискового запроса
  const filteredDepartments = departmentsData?.data.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Отделы</h1>
        <Button>Добавить отдел</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Поиск отделов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список отделов</CardTitle>
          <CardDescription>
            Всего отделов: {departmentsData?.data.length || 0}
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
                    <TableHead>Родительский отдел</TableHead>
                    <TableHead className="w-[150px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        Отделы не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department) => {
                      // Найдем имя родительского отдела
                      const parentDepartment = department.parent_department_id 
                        ? departmentsData?.data.find(d => d.department_id === department.parent_department_id)
                        : null;

                      return (
                        <TableRow key={department.department_id}>
                          <TableCell>{department.department_id}</TableCell>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>
                            {parentDepartment ? parentDepartment.name : '—'}
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