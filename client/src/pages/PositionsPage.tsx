import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import UnifiedPositionForm from "@/components/UnifiedPositionForm";

// UI компоненты
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Типы данных
type Position = {
  position_id: number;
  name: string;
  deleted: boolean;
  deleted_at: string | null;
};

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  deleted: boolean;
  deleted_at: string | null;
};

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  vacancy_count: number;
  is_primary: boolean;
  deleted: boolean;
  deleted_at: string | null;
};

type PositionPosition = {
  position_relation_id: number;
  position_id: number;
  parent_position_id: number;
  department_id: number | null;
  sort: number | null;
  deleted: boolean;
  deleted_at: string | null;
};

// Расширенная структура с дополнительной информацией для отображения
type PositionWithDetails = Position & {
  departments: { 
    department: Department;
    link: PositionDepartment;
  }[];
  parentPositions: { 
    position: Position;
    department?: Department;
    link: PositionPosition;
  }[];
  childPositions: { 
    position: Position;
    department?: Department;
    link: PositionPosition;
  }[];
};

const PositionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editPositionId, setEditPositionId] = useState<number | null>(null);
  const [deletePositionId, setDeletePositionId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Загрузка данных
  const { data: positionsData, isLoading: isPositionsLoading } = useQuery<{ status: string; data: Position[] }>({
    queryKey: ["/api/positions"],
  });

  const { data: departmentsData, isLoading: isDepartmentsLoading } = useQuery<{ status: string; data: Department[] }>({
    queryKey: ["/api/departments"],
  });

  const { data: positionDepartmentsData, isLoading: isPositionDepartmentsLoading } = useQuery<{ status: string; data: PositionDepartment[] }>({
    queryKey: ["/api/positiondepartments"],
  });

  const { data: positionHierarchyData, isLoading: isPositionHierarchyLoading } = useQuery<{ status: string; data: PositionPosition[] }>({
    queryKey: ["/api/positionpositions"],
  });

  // Мутация для удаления должности
  const deletePositionMutation = useMutation({
    mutationFn: async (positionId: number) => {
      // 1. Удаляем должность
      const response = await apiRequest("DELETE", `/api/positions/${positionId}`);
      if (!response.ok) throw new Error("Не удалось удалить должность");
      return await response.json();
    },
    onSuccess: () => {
      // Инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positiondepartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positionpositions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions/with-departments"] });
      
      toast({
        title: "Должность удалена",
        description: "Должность и все её связи успешно удалены",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletePositionId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось удалить должность: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Обработчики действий
  const handleCreate = () => {
    setIsCreateFormOpen(true);
  };

  const handleEdit = (positionId: number) => {
    setEditPositionId(positionId);
  };

  const handleDelete = (positionId: number) => {
    setDeletePositionId(positionId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletePositionId) {
      deletePositionMutation.mutate(deletePositionId);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletePositionId(null);
  };

  // Объединяем данные для отображения
  const preparePositionsWithDetails = (): PositionWithDetails[] => {
    if (!positionsData?.data || !departmentsData?.data || !positionDepartmentsData?.data || !positionHierarchyData?.data) {
      return [];
    }

    const positions = positionsData.data.filter(p => !p.deleted);
    const departments = departmentsData.data.filter(d => !d.deleted);
    const positionDepartments = positionDepartmentsData.data.filter(pd => !pd.deleted);
    const positionPositions = positionHierarchyData.data.filter(pp => !pp.deleted);

    return positions.map(position => {
      // Находим связи с отделами
      const positionDeptLinks = positionDepartments.filter(pd => pd.position_id === position.position_id);
      const deptDetails = positionDeptLinks.map(link => {
        const department = departments.find(d => d.department_id === link.department_id);
        return { 
          department: department!, 
          link 
        };
      }).filter(item => item.department); // Фильтруем записи без отделов

      // Находим родительские должности
      const parentLinks = positionPositions.filter(pp => pp.position_id === position.position_id);
      const parentDetails = parentLinks.map(link => {
        const parentPosition = positions.find(p => p.position_id === link.parent_position_id);
        const department = link.department_id ? departments.find(d => d.department_id === link.department_id) : undefined;
        return { 
          position: parentPosition!, 
          department, 
          link 
        };
      }).filter(item => item.position); // Фильтруем записи без должностей

      // Находим дочерние должности
      const childLinks = positionPositions.filter(pp => pp.parent_position_id === position.position_id);
      const childDetails = childLinks.map(link => {
        const childPosition = positions.find(p => p.position_id === link.position_id);
        const department = link.department_id ? departments.find(d => d.department_id === link.department_id) : undefined;
        return { 
          position: childPosition!, 
          department, 
          link 
        };
      }).filter(item => item.position); // Фильтруем записи без должностей

      return {
        ...position,
        departments: deptDetails,
        parentPositions: parentDetails,
        childPositions: childDetails
      };
    });
  };

  const positionsWithDetails = preparePositionsWithDetails();
  const isLoading = isPositionsLoading || isDepartmentsLoading || isPositionDepartmentsLoading || isPositionHierarchyLoading;
  const isDeleting = deletePositionMutation.isPending;

  return (
    <div className="container py-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление должностями</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Создать должность
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Отделы</TableHead>
                  <TableHead>Родительские должности</TableHead>
                  <TableHead>Подчиненные должности</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionsWithDetails.length > 0 ? (
                  positionsWithDetails.map(position => (
                    <TableRow key={position.position_id}>
                      <TableCell className="font-medium">{position.position_id}</TableCell>
                      <TableCell>{position.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {position.departments.length > 0 ? (
                            position.departments.map(({ department, link }) => (
                              <Badge key={department.department_id} variant={link.is_primary ? "default" : "outline"}>
                                {department.name} ({link.vacancy_count})
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Нет отделов</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {position.parentPositions.length > 0 ? (
                            position.parentPositions.map(({ position: parent, department, link }) => (
                              <Badge key={`${link.position_relation_id}`} variant="secondary">
                                {parent.name}{department && ` (${department.name})`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Нет родительских должностей</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {position.childPositions.length > 0 ? (
                            position.childPositions.map(({ position: child, department, link }) => (
                              <Badge key={`${link.position_relation_id}`} variant="secondary">
                                {child.name}{department && ` (${department.name})`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Нет подчиненных должностей</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(position.position_id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(position.position_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Должности не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Форма создания/редактирования должности */}
      {isCreateFormOpen && (
        <UnifiedPositionForm 
          isOpen={isCreateFormOpen} 
          onClose={() => setIsCreateFormOpen(false)} 
        />
      )}

      {editPositionId && (
        <UnifiedPositionForm 
          isOpen={true} 
          onClose={() => setEditPositionId(null)} 
          positionId={editPositionId}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы действительно хотите удалить эту должность?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Должность будет помечена как удаленная, 
              а все её связи с отделами и другими должностями будут разорваны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={cancelDelete}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isDeleting} 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PositionsPage;