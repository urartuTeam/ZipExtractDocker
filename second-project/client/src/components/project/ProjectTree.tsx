import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDrop } from "react-dnd";
import { Employee, ProjectRole } from "@shared/schema";
import EmployeeItem from "../hr/EmployeeItem";

interface ProjectTreeProps {
  projectId: number;
  roles: ProjectRole[];
}

export default function ProjectTree({ projectId, roles }: ProjectTreeProps) {
  // For each role, fetch employees assigned to it
  const getEmployeesForRole = (roleId: number) => {
    // In a real application, this would be an API call
    return useQuery({
      queryKey: [`/api/project-roles/${roleId}/employees`],
      // Simulated for this example
      queryFn: async () => {
        // Mock data
        return [
          {
            id: 1,
            fullName: "Иван",
            positionId: 1,
            departmentId: 1,
          },
          {
            id: 2,
            fullName: "Анна",
            positionId: 2,
            departmentId: 1,
          },
        ] as Employee[];
      },
    });
  };

  return (
    <div className="tree-view flex justify-center p-4">
      {/* Project Tree Root */}
      <div className="node-item">
        <div className="node-container">
          {/* Project Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4 w-72">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-icons text-primary">
                  rocket_launch
                </span>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-medium text-lg">Проект {projectId}</h3>
              </div>
            </div>
          </div>

          {/* Project Roles */}
          <div className="node-children">
            {roles.map((role) => (
              <ProjectRoleNode
                key={role.id}
                role={role}
                getEmployees={getEmployeesForRole}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectRoleNodeProps {
  role: ProjectRole;
  getEmployees: (roleId: number) => any;
}

function ProjectRoleNode({ role, getEmployees }: ProjectRoleNodeProps) {
  const { data: employees = [] } = getEmployees(role.id);

  // Set up drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: "employee",
    drop: (item: { employee: Employee }) => {
      handleEmployeeDrop(item.employee);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleEmployeeDrop = (employee: Employee) => {
    // In a real application, this would make an API call to assign the employee to this role
    console.log(`Assign employee ${employee.id} to role ${role.id}`);
  };

  // Determine icon and color based on role name (simplified version)
  const getRoleIcon = () => {
    const name = role.name.toLowerCase();
    if (name.includes("руководител")) return "supervisor_account";
    if (name.includes("разработчик") || name.includes("developer"))
      return "code";
    if (name.includes("дизайнер") || name.includes("designer")) return "brush";
    if (name.includes("тестировщик") || name.includes("qa"))
      return "bug_report";
    return "assignment_ind";
  };

  const getRoleColor = () => {
    const name = role.name.toLowerCase();
    if (name.includes("руководител")) return "bg-secondary/10 text-secondary";
    if (name.includes("frontend") || name.includes("фронтенд"))
      return "bg-accent/10 text-accent";
    if (name.includes("backend") || name.includes("бэкенд"))
      return "bg-primary/10 text-primary";
    return "bg-neutral-200/80 text-neutral-600";
  };

  return (
    <div className="node-item">
      <div
        ref={drop}
        className={`bg-white rounded-lg border border-neutral-200 p-4 w-72 dropzone ${
          isOver ? "highlight border-primary bg-primary/5" : ""
        }`}
      >
        <div className="flex items-center mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor()}`}
          >
            <span className="material-icons">{getRoleIcon()}</span>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-medium text-lg">{role.name}</h3>
          </div>
        </div>

        {/* Role Employees */}
        <div className="employee-list">
          {employees.map((employee: Employee) => (
            <EmployeeItem key={employee.id} employee={employee} />
          ))}
        </div>
      </div>
    </div>
  );
}
