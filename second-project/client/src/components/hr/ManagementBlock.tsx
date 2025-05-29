import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, UserPlus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ManagementBlockProps {
  node: any;
  employees: any[];
  positions: any[];
  employeeAssignments: any[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function ManagementBlock({ 
  node, 
  employees, 
  positions, 
  employeeAssignments, 
  onDragOver, 
  onDragLeave, 
  onDrop 
}: ManagementBlockProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [positionSearchTerm, setPositionSearchTerm] = useState("");

  // Получаем назначения для этого блока управления
  const unitAssignments = employeeAssignments?.filter(assignment => 
    assignment.orgUnitId === node.id
  ) || [];

  // Фильтрация сотрудников и должностей для поиска
  const filteredEmployees = employees?.filter(emp => 
    emp.fullName.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  ).slice(0, 50) || [];

  const filteredPositions = positions?.filter(pos => 
    pos.name.toLowerCase().includes(positionSearchTerm.toLowerCase())
  ).slice(0, 50) || [];

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || !selectedPosition) return;

    try {
      // Сначала обновляем данные сотрудника с новой должностью
      await apiRequest(`/api/employees/${selectedEmployee}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          positionId: parseInt(selectedPosition) 
        }),
      });

      // Затем создаем назначение в организационную единицу
      await apiRequest(`/api/employee-positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: parseInt(selectedEmployee),
          orgUnitId: node.id,
          positionId: parseInt(selectedPosition),
          isHead: false
        }),
      });

      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: ["/api/employee-positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      
      // Закрываем диалог и сбрасываем состояние
      setIsAssignDialogOpen(false);
      setSelectedEmployee("");
      setSelectedPosition("");
      setEmployeeSearchTerm("");
      setPositionSearchTerm("");
    } catch (error) {
      console.error("Ошибка при назначении сотрудника:", error);
    }
  };

  const handleRemoveEmployee = async (assignment: any) => {
    try {
      // Удаляем назначение
      await apiRequest(`/api/employee-positions/${assignment.employeeId}/${assignment.orgUnitId}`, {
        method: "DELETE",
      });

      // Обновляем сотрудника, убирая должность
      await apiRequest(`/api/employees/${assignment.employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          positionId: null 
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/employee-positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    } catch (error) {
      console.error("Ошибка при удалении сотрудника:", error);
    }
  };

  return (
    <div 
      className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Заголовок блока управления */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm text-blue-800">
          {node.title}
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <UserPlus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Назначить сотрудника</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Выбор сотрудника */}
              <div>
                <label className="text-sm font-medium mb-2 block">Сотрудник</label>
                <Input
                  placeholder="Поиск сотрудника..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сотрудника" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {filteredEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.fullName}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор должности */}
              <div>
                <label className="text-sm font-medium mb-2 block">Должность</label>
                <Input
                  placeholder="Поиск должности..."
                  value={positionSearchTerm}
                  onChange={(e) => setPositionSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите должность" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {filteredPositions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAssignEmployee}
                disabled={!selectedEmployee || !selectedPosition}
                className="w-full"
              >
                Назначить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Информация о руководителе */}
      {node.headEmployee && (
        <div className="mt-2 border-t pt-2">
          <div className="text-xs font-medium">
            {node.headEmployee.fullName}
          </div>
          {node.headPosition && (
            <div className="text-xs text-gray-500 italic">
              {node.headPosition.name}
            </div>
          )}
        </div>
      )}

      {/* Отображение назначенных сотрудников */}
      {unitAssignments.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <div className="text-xs text-gray-600 mb-1">Назначенные:</div>
          <div className="space-y-1">
            {unitAssignments.map((assignment) => {
              const employee = employees?.find(emp => emp.id === assignment.employeeId);
              const position = positions?.find(pos => pos.id === assignment.positionId);
              return employee && (
                <div
                  key={assignment.id}
                  className="text-xs bg-white px-2 py-1 rounded border cursor-move hover:bg-gray-50 group relative"
                  draggable={true}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData("application/json", JSON.stringify({
                      type: "assigned-employee",
                      employeeId: employee.id,
                      sourceOrgUnitId: assignment.orgUnitId,
                      positionId: assignment.positionId,
                      assignmentId: assignment.id
                    }));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = "1";
                    const allNodes = document.querySelectorAll('[style*="border"]');
                    allNodes.forEach(node => {
                      if (node instanceof HTMLElement) {
                        node.style.border = "";
                      }
                    });
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{employee.fullName}</div>
                      {position && (
                        <div className="text-gray-500 italic">{position.name}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEmployee(assignment);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}