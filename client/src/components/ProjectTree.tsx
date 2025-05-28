import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Crown, User, Building2, Code, TestTube } from "lucide-react";
import {Employee, Project, project_roles, projectsRelations} from "@shared/schema";
import { useDrag, useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ProjectRole {
    id: number;
    name: string;
    parent_id: number | null;
    is_rp: boolean;
}

interface EmployeeWithDetails {
    employee_id: number;
    role_id: number | null;
    employeeDetails: Employee;
    positionName: string;
    departmentName: string;
}

interface ProjectTreeProps {
    project: Project;
    employees: EmployeeWithDetails[];
    roles: ProjectRole[];
    isDragEnabled?: boolean;
    isDropTarget?: boolean;
    onMoveEmployee?: (employeeId: number, roleId?: number) => void;
    onShowRoleSelectionModal?: (
        employeeId: number,
        fromProjectId: number,
        toProjectId: number,
        parentRoleId: number,
    ) => void;
}

const ProjectTree: React.FC<ProjectTreeProps> = ({
                                                     project,
                                                     employees,
                                                     roles,
                                                     isDragEnabled = false,
                                                     isDropTarget = false,
                                                     onMoveEmployee,
                                                     onShowRoleSelectionModal,
                                                 }) => {
    const projectRoles = roles;
    // Группируем сотрудников по ролям
    const rpRole = roles.find((role) => role.is_rp);
    const rpEmployee = employees.find(
        (emp) => rpRole && emp.role_id === rpRole.id,
    );

    const employeesByRole: { [roleId: number]: EmployeeWithDetails[] } = {};
    const employeesWithoutRole: EmployeeWithDetails[] = [];

    employees.forEach((emp) => {
        if (emp.role_id && emp.role_id !== rpRole?.id) {
            if (!employeesByRole[emp.role_id]) {
                employeesByRole[emp.role_id] = [];
            }
            employeesByRole[emp.role_id].push(emp);
        } else if (!emp.role_id) {
            employeesWithoutRole.push(emp);
        }
    });

    // Группируем роли по родительским
    const parentRoles = roles.filter(
        (role) => role.parent_id === null && !role.is_rp,
    );

    const roleGroups = parentRoles
        .map((parentRole) => {
            const childRoles = roles.filter(
                (role) => role.parent_id === parentRole.id,
            );
            const roleEmployees: EmployeeWithDetails[] = [];

            childRoles.forEach((childRole) => {
                if (employeesByRole[childRole.id]) {
                    roleEmployees.push(...employeesByRole[childRole.id]);
                }
            });

            return {
                parentRole,
                childRoles,
                employees: roleEmployees,
            };
        })
        .filter((group) => group.employees.length > 0);

    // Если нет групп, создаем группы для всех ролей с сотрудниками
    if (roleGroups.length === 0) {
        Object.keys(employeesByRole).forEach((roleIdStr) => {
            const roleId = parseInt(roleIdStr);
            const role = roles.find((r) => r.id === roleId);
            if (role) {
                roleGroups.push({
                    parentRole: role,
                    childRoles: [],
                    employees: employeesByRole[roleId],
                });
            }
        });
    }

    const getIconForRole = (roleName: string) => {
        if (
            roleName.toLowerCase().includes("разработк") ||
            roleName.toLowerCase().includes("программ")
        ) {
            return <Code className="h-4 w-4 text-blue-600" />;
        }
        if (
            roleName.toLowerCase().includes("тестир") ||
            roleName.toLowerCase().includes("qa")
        ) {
            return <TestTube className="h-4 w-4 text-green-600" />;
        }
        return <Users className="h-4 w-4 text-purple-600" />;
    };
    console.log(projectRoles);
    const EmployeeCard = ({
                              employee,
                              isRP = false,
                          }: {
        employee: EmployeeWithDetails;
        isRP?: boolean;
    }) => {
        const currentRole = roles.find((r) => r.id === employee.role_id);
        const parentRoleId = currentRole?.parent_id || null;
        const roleName = currentRole?.name || null;

        const [{ isDragging }, drag] = useDrag(
            () => ({
                type: "employee",
                item: {
                    employeeId: employee.employee_id,
                    roleId: employee.role_id,
                    parentRoleId: parentRoleId,
                    currentProjectId: project.project_id,
                },
                canDrag: isDragEnabled,
                collect: (monitor) => ({
                    isDragging: monitor.isDragging(),
                }),
            }),
            [
                employee.employee_id,
                employee.role_id,
                parentRoleId,
                project.project_id,
                isDragEnabled,
            ]
        );

        const isManager =
            roleName?.toLowerCase().includes("руководитель") || isRP;

        return (
            <div
                ref={drag}
                className={cn(
                    "flex items-center space-x-2 p-2 rounded transition-all bg-gray-50",
                    isManager ? "bg-pink-50" : "bg-gray-50",
                    isDragEnabled && "cursor-move hover:shadow-md",
                    isDragging && "opacity-50 transform rotate-2"
                )}
            >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {employee.employeeDetails?.photo_url ? (
                        <img
                            src={employee.employeeDetails.photo_url}
                            alt="Фото сотрудника"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="h-4 w-4 text-gray-400" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">
                        {employee.employeeDetails?.full_name || "Неизвестный сотрудник"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {isRP ? "Руководитель проекта" : roleName || employee.positionName}
                    </div>
                </div>
            </div>
        );
    };

    // Компонент для drop zone РП
    const RPDropZone = ({
                            rpEmployee,
                            rpRole,
                        }: {
        rpEmployee: EmployeeWithDetails | undefined;
        rpRole: ProjectRole | undefined;
    }) => {
        const [{ isOver }, drop] = useDrop({
            accept: "employee",
            drop: (item: { employeeId: number }) => {
                if (!isDragEnabled || !onMoveEmployee || !rpRole) return;

                // Проверяем, есть ли уже РП
                if (rpEmployee) {
                    toast({
                        title: "Ошибка",
                        description:
                            "РП в данном проекте уже назначен. Сначала освободите роль.",
                        variant: "destructive",
                    });
                    return;
                }

                // Назначаем сотрудника на роль РП
                onMoveEmployee(item.employeeId, rpRole.id);
            },
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
            }),
        });

        if (rpEmployee) {
            return (
                <div className="flex items-center space-x-2">
                    {/* Круглый аватар */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {rpEmployee.employeeDetails?.photo_url ? (
                            <img
                                src={rpEmployee.employeeDetails.photo_url}
                                alt="Фото сотрудника"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="h-4 w-4 text-gray-400" />
                        )}
                    </div>

                    {/* Информация о сотруднике */}
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">
                            {rpEmployee.employeeDetails?.full_name || "Неизвестный сотрудник"}
                        </div>
                        <div className="text-xs text-gray-600">Руководитель проекта</div>
                    </div>
                </div>
            );
        }

        return (
            <div
                ref={drop}
                className={cn(
                    "text-center py-2 transition-colors",
                    isOver && isDragEnabled
                        ? "bg-blue-100 border-2 border-dashed border-blue-300 rounded"
                        : "",
                )}
            >
                <div className="flex items-center justify-center space-x-1 mb-1">
                    <Crown className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Руководитель проекта</span>
                </div>
                <div className="text-sm text-gray-400">
                    {isOver && isDragEnabled ? "Назначить РП" : "РП не назначен"}
                </div>
            </div>
        );
    };

    const RoleGroupCard = ({
                               group,
                               employees,
                           }: {
        group: {
            parentRole: ProjectRole;
            childRoles: ProjectRole[];
            employees: EmployeeWithDetails[];
        };
        employees: EmployeeWithDetails[];
    }) => {
        const [{ isOver }, drop] = useDrop<
            {
                employeeId: number;
                roleId: number | null;
                parentRoleId: number | null;
                currentProjectId: number;
            },
            void,
            { isOver: boolean }
        >(
            () => ({
                accept: "employee",
                drop: (item) => {
                    if (onMoveEmployee && item.currentProjectId !== project.project_id) {
                        // Проверяем, отличаются ли родительские блоки
                        console.log(
                            "DEBUG: Сравниваю блоки:",
                            item.parentRoleId,
                            "vs",
                            group.parentRole.id,
                        );
                        console.log(
                            "DEBUG: onShowRoleSelectionModal доступен:",
                            !!onShowRoleSelectionModal,
                        );
                        if (item.parentRoleId !== group.parentRole.id) {
                            console.log("DEBUG: Разные блоки - показываем модалку", item);
                            // Вызываем специальный обработчик для показа модального окна
                            if (onShowRoleSelectionModal) {
                                console.log("DEBUG: Вызываю onShowRoleSelectionModal");
                                onShowRoleSelectionModal(
                                    item.employeeId,
                                    item.currentProjectId,
                                    project.project_id,
                                    group.parentRole.id,
                                );
                            } else {
                                console.error("DEBUG: onShowRoleSelectionModal не найден!");
                            }
                            // ВАЖНО: НЕ вызываем onMoveEmployee здесь! Только через модальное окно
                        } else {
                            console.log(
                                "DEBUG: Тот же блок - меняем только project_id",
                                item,
                            );
                            onMoveEmployee(item.employeeId, item.roleId); // Передаем текущую роль, меняем только проект
                        }
                    }
                },
                canDrop: (item) =>
                    isDropTarget && item.currentProjectId !== project.project_id,
                collect: (monitor) => ({
                    isOver: monitor.isOver(),
                }),
            }),
            [group.parentRole.id, isDropTarget, onMoveEmployee, project.project_id],
        );

        return (
            <Card
                ref={drop}
                className={cn(
                    "border-gray-200 p-3 transition-all",
                    isDropTarget && "hover:border-blue-300",
                    isOver && "border-blue-500 bg-blue-50",
                )}
                style={{ minWidth: "220px", maxWidth: "260px" }}
            >
                {/* Заголовок группы */}
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
                    {getIconForRole(group.parentRole.name)}
                    <h3 className="font-medium text-sm text-gray-800">
                        {group.parentRole.name}
                    </h3>
                </div>

                {/* Сотрудники группы */}
                <div className="space-y-2">
                    {employees.map((employee) => (
                        <EmployeeCard key={employee.employee_id} employee={employee} />
                    ))}
                    {isOver && (
                        <div className="p-2 border-2 border-dashed border-blue-300 rounded text-center text-xs text-blue-600">
                            Отпустите для назначения роли
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    const UnassignedEmployeesCard = ({
                                         employees,
                                     }: {
        employees: EmployeeWithDetails[];
    }) => {
        const [{ isOver }, drop] = useDrop<
            {
                employeeId: number;
                roleId: number | null;
                parentRoleId: number | null;
                currentProjectId: number;
            },
            void,
            { isOver: boolean }
        >(
            () => ({
                accept: "employee",
                drop: (item) => {
                    if (onMoveEmployee && item.currentProjectId !== project.project_id) {
                        alert(
                            `Перемещаю сотрудника ${item.employeeId} из блока ${item.parentRoleId} в проект ${project.project_id} без роли`,
                        );
                        console.log("item без роли", item);
                        onMoveEmployee(item.employeeId, undefined); // undefined означает удаление роли
                    }
                },
                canDrop: (item) =>
                    isDropTarget && item.currentProjectId !== project.project_id,
                collect: (monitor) => ({
                    isOver: monitor.isOver(),
                }),
            }),
            [isDropTarget, onMoveEmployee, project.project_id],
        );

        return (
            <Card
                ref={drop}
                className={cn(
                    "border-dashed border-gray-300 p-3 transition-all",
                    isDropTarget && "hover:border-blue-300",
                    isOver && "border-blue-500 bg-blue-50",
                )}
                style={{ minWidth: "220px", maxWidth: "260px" }}
            >
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100">
                    <Users className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-sm text-gray-600">
                        Без назначенных ролей
                    </h3>
                </div>

                <div className="space-y-2">
                    {employees.map((employee) => (
                        <EmployeeCard key={employee.employee_id} employee={employee} />
                    ))}
                    {isOver && (
                        <div className="p-2 border-2 border-dashed border-blue-300 rounded text-center text-xs text-blue-600">
                            Отпустите для снятия роли
                        </div>
                    )}
                    {employees.length === 0 && !isOver && isDropTarget && (
                        <div className="p-4 text-center text-xs text-gray-400">
                            Перетащите сюда для снятия роли
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="relative bg-white">
            {/* Корневая карточка проекта */}
            <div className="flex justify-center mb-6">
                <Card className="border border-gray-200 p-0 max-w-xs overflow-hidden">
                    {/* Красный заголовок */}
                    <div className="bg-red-600 text-white text-center py-2 px-4">
                        <h2 className="text-sm font-semibold">Проект {project.name}</h2>
                    </div>

                    {/* Белое содержимое */}
                    <div className="bg-white p-3">
                        {/* Руководитель проекта */}
                        <div
                            className="mb-2 pb-2"
                            style={{ borderBottom: "1px solid #ccc" }}
                        >
                            <RPDropZone rpEmployee={rpEmployee} rpRole={rpRole} />
                        </div>

                        {/* Количество участников */}
                        <div className="text-xs text-gray-600">
                            Количество участников: {employees.length}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Соединительные линии от корня */}
            {roleGroups.length > 0 && (
                <div className="flex justify-center mb-3">
                    <div className="w-px h-8 bg-gray-300"></div>
                </div>
            )}

            {/* Горизонтальная линия */}
            {roleGroups.length > 1 && (
                <div className="flex justify-center mb-3">
                    <div
                        className="h-px bg-gray-300"
                        style={{ width: `${Math.min(roleGroups.length * 240, 600)}px` }}
                    ></div>
                </div>
            )}

            {/* Вертикальные линии к группам */}
            {roleGroups.length > 0 && (
                <div className="flex justify-center mb-3">
                    <div
                        className="flex"
                        style={{ width: `${Math.min(roleGroups.length * 240, 600)}px` }}
                    >
                        {roleGroups.map((_, index) => (
                            <div key={index} className="flex-1 flex justify-center">
                                <div className="w-px h-8 bg-gray-300"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Группы ролей */}
            <div className="flex flex-wrap justify-center gap-3">
                {roleGroups.map((group, index) => (
                    <RoleGroupCard
                        key={index}
                        group={group}
                        employees={group.employees}
                    />
                ))}

                {/* Сотрудники без ролей */}
                {(employeesWithoutRole.length > 0 || isDropTarget) && (
                    <UnassignedEmployeesCard employees={employeesWithoutRole} />
                )}
            </div>
        </div>
    );
};

export default ProjectTree;
