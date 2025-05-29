import { useState } from "react";
import { useDrop } from "react-dnd";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { OrgUnitWithChildren, Employee } from "@shared/schema";
import EmployeeItem from "./EmployeeItem";
import AddEmployeeModal from "./AddEmployeeModal";

interface OrgUnitNodeProps {
  unit: OrgUnitWithChildren;
  onAddChild: () => void;
}

export default function OrgUnitNode({ unit, onAddChild }: OrgUnitNodeProps) {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load employees if this is a position
  const { data: employees = [] } = useQuery({
    queryKey: [`/api/positions/${unit.id}/employees`],
    enabled: unit.isPosition,
  });

  // Load head employee if this is a department or management
  const { data: headEmployee } = useQuery({
    queryKey: [`/api/employees/${unit.headEmployeeId}`],
    enabled:
      !!(unit.isDepartment || unit.isManagement) && !!unit.headEmployeeId,
  });

  // Handle employee drop
  const [{ isOver }, drop] = useDrop({
    accept: "employee",
    drop: (item: { employee: Employee }) => {
      handleEmployeeDrop(item.employee);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Mutation to update employee position
  const updateEmployeePosition = useMutation({
    mutationFn: (employeeId: number) =>
      apiRequest("PUT", `/api/employees/${employeeId}`, {
        positionId: unit.id,
        departmentId: unit.parentId,
      }),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Сотрудник перемещен",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/positions/${unit.id}/employees`],
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось переместить сотрудника",
        variant: "destructive",
      });
    },
  });

  const handleEmployeeDrop = (employee: Employee) => {
    if (unit.isPosition) {
      updateEmployeePosition.mutate(employee.id);
    }
  };

  // Get appropriate icon based on unit type
  const getUnitIcon = () => {
    if (unit.isOrganization) return "business";
    if (unit.isManagement) return "account_balance";
    if (unit.isDepartment) return "groups";
    if (unit.isPosition) return "work";
    return "category";
  };

  // Get appropriate color class based on unit type
  const getUnitColorClass = () => {
    if (unit.isOrganization) return "bg-primary/10 text-primary";
    if (unit.isManagement) return "bg-secondary/10 text-secondary";
    if (unit.isDepartment) return "bg-accent/10 text-accent";
    if (unit.isPosition) return "bg-primary/10 text-primary";
    return "bg-neutral-200 text-neutral-600";
  };

  // Get appropriate badge color based on unit type
  const getBadgeColorClass = () => {
    if (unit.isOrganization) return "bg-primary/10 text-primary";
    if (unit.isManagement) return "bg-secondary/10 text-secondary";
    if (unit.isDepartment) return "bg-accent/10 text-accent";
    if (unit.isPosition) return "bg-primary/10 text-primary";
    return "bg-neutral-200 text-neutral-600";
  };

  // Get user-friendly unit type name
  const getUnitTypeName = () => {
    if (unit.isOrganization) return "Организация";
    if (unit.isManagement) return "Управление";
    if (unit.isDepartment) return "Отдел";
    if (unit.isPosition) return "Должность";
    return "Элемент";
  };

  return (
    <div className="node-item">
      <div className="node-container">
        <div
          ref={unit.isPosition ? drop : undefined}
          className={`bg-white rounded-lg shadow-card p-4 w-72 dropzone ${isOver ? "highlight border-primary bg-primary/5" : ""}`}
        >
          <div className="flex items-center mb-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${getUnitColorClass()}`}
            >
              <span className="material-icons">{getUnitIcon()}</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="font-medium text-lg">{unit.name}</h3>
              <div className="flex items-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColorClass()}`}
                >
                  {getUnitTypeName()}
                </span>
                {unit.isPosition && unit.staffCount && (
                  <span className="text-xs text-neutral-400 ml-2">
                    Штат: {unit.staffCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex">
              <button className="p-1 text-neutral-300 hover:text-primary transition-colors">
                <span className="material-icons text-sm">edit</span>
              </button>
            </div>
          </div>

          {/* Organization logo - only for organizations */}
          {unit.isOrganization && (
            <div className="h-16 w-full bg-neutral-100 rounded flex items-center justify-center mb-2">
              {unit.logo ? (
                <img
                  src={unit.logo}
                  alt="Logo"
                  className="max-h-full max-w-full"
                />
              ) : (
                <span className="material-icons text-neutral-300">photo</span>
              )}
            </div>
          )}

          {/* Management/Department Head - only for management and departments */}
          {(unit.isDepartment || unit.isManagement) && headEmployee && (
            <div className="flex items-center p-2 bg-neutral-50 rounded mb-2">
              <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="material-icons text-neutral-400 text-sm">
                  person
                </span>
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm font-medium">{headEmployee.fullName}</p>
                <p className="text-xs text-neutral-400">Руководитель</p>
              </div>
            </div>
          )}

          {/* Employees - only for positions */}
          {unit.isPosition && employees.length > 0 && (
            <div className="employee-list">
              {employees.map((employee: Employee) => (
                <EmployeeItem key={employee.id} employee={employee} />
              ))}
            </div>
          )}

          {/* Add employee button - only for positions */}
          {unit.isPosition && (
            <button
              className="w-full mt-2 flex items-center justify-center p-2 border border-dashed border-neutral-200 text-neutral-400 rounded hover:bg-neutral-50 hover:text-primary transition-colors"
              onClick={() => setIsAddEmployeeModalOpen(true)}
            >
              <span className="material-icons text-sm mr-1">person_add</span>
              <span className="text-sm">Добавить сотрудника</span>
            </button>
          )}

          {/* Add child button */}
          <button
            className="w-full mt-2 flex items-center justify-center p-2 border border-dashed border-neutral-200 text-neutral-400 rounded hover:bg-neutral-50 hover:text-primary transition-colors"
            onClick={onAddChild}
          >
            <span className="material-icons text-sm mr-1">add</span>
            <span className="text-sm">Добавить</span>
          </button>
        </div>

        {/* Children nodes */}
        {unit.children.length > 0 && (
          <div className="node-children">
            {unit.children.map((child) => (
              <OrgUnitNode
                key={child.id}
                unit={child}
                onAddChild={() => onAddChild}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        positionId={unit.id}
        departmentId={unit.parentId}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: [`/api/positions/${unit.id}/employees`],
          });
          setIsAddEmployeeModalOpen(false);
        }}
      />
    </div>
  );
}
