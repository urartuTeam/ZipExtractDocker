import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Project,
    EmployeeProject,
    Employee,
    Department,
    Position,
} from "@shared/schema";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import ProjectTree from "@/components/ProjectTree";
import ProjectSidebar from "@/components/ProjectSidebar";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function UserProjectDetails() {
    const { projectId: projectIdStr } = useParams<{ projectId: string }>();
    const projectId = parseInt(projectIdStr || "0");
    const { user } = useAuth();
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [secondProjectId, setSecondProjectId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const [roleSelectionModal, setRoleSelectionModal] = useState<{
        isOpen: boolean;
        employeeId: number;
        fromProjectId: number;
        toProjectId: number;
        parentRoleId: number;
        childRoles: any[];
    } | null>(null);

    // Метод для показа второго проекта
    const showSecondProject = (projectId: number) => {
        setSecondProjectId(projectId);
        setSidebarVisible(false);
    };

    // Обработчик перемещения сотрудника с проверкой ролей
    const handleMoveEmployee = (employeeId: number, targetRoleId?: number) => {
        if (!secondProjectId) return;

        // Получаем текущую роль сотрудника
        const currentEmployee = projectEmployeesWithDetails.find(
            (emp) => emp.employee_id === employeeId,
        );
        const currentRoleId = currentEmployee?.role_id;

        // Если есть роли и нужно проверить совместимость
        if (projectRoles && currentRoleId && targetRoleId) {
            const currentRole = projectRoles.find((r) => r.id === currentRoleId);
            const targetRole = projectRoles.find((r) => r.id === targetRoleId);

            // Проверяем, отличаются ли родительские группы ролей
            if (currentRole?.parent_id !== targetRole?.parent_id) {
                // Находим дочерние роли целевой группы
                const childRoles = projectRoles.filter(
                    (r) => r.parent_id === targetRoleId,
                );

                if (childRoles.length > 0) {
                    // Открываем модальное окно для выбора дочерней роли
                    setRoleSelectionModal({
                        isOpen: true,
                        employeeId,
                        fromProjectId: projectId,
                        toProjectId: secondProjectId,
                        parentRoleId: targetRoleId,
                        childRoles,
                    });
                    return;
                }
            }
        }

        // Если проверка не нужна или роли совместимы, перемещаем сразу
        moveEmployeeMutation.mutate({
            employeeId,
            fromProjectId: projectId,
            toProjectId: secondProjectId,
            roleId: targetRoleId,
        });
    };

    // Обработчик выбора роли в модальном окне
    const handleRoleSelection = async (selectedRoleId: number) => {
        if (!roleSelectionModal) return;

        // ВАЖНО: НЕ используем moveEmployeeMutation, а делаем прямой UPDATE
        const updateEmployeeProject = async () => {
            try {
                // Находим текущую роль сотрудника
                const currentEmployee = [
                    ...projectEmployeesWithDetails,
                    ...secondProjectEmployeesWithDetails,
                ].find((emp) => emp.employee_id === roleSelectionModal.employeeId);

                const currentRoleId = currentEmployee?.role_id;
                const currentProjectId = projectEmployeesWithDetails.find(
                    (emp) => emp.employee_id === roleSelectionModal.employeeId,
                )
                    ? projectId
                    : secondProjectId;

                console.log("DEBUG: Отправляю запрос с параметрами:", {
                    employee_id: roleSelectionModal.employeeId,
                    current_project_id: currentProjectId,
                    current_role_id: currentRoleId,
                    new_project_id: roleSelectionModal.toProjectId,
                    new_role_id: selectedRoleId,
                });

                const response = await fetch(
                    `/api/employeeprojects/${roleSelectionModal.employeeId}/${currentProjectId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            employee_id: roleSelectionModal.employeeId,
                            current_project_id: currentProjectId,
                            current_role_id: currentRoleId,
                            new_project_id: roleSelectionModal.toProjectId,
                            new_role_id: selectedRoleId,
                            project_id: roleSelectionModal.toProjectId,
                            role_id: selectedRoleId,
                        }),
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Ошибка при обновлении");
                }

                console.log("SUCCESS: Сотрудник перемещен с UPDATE, без DELETE!");

                toast({
                    title: "Сотрудник перемещен",
                    description: "Сотрудник успешно перемещен с новой ролью",
                });
            } catch (error) {
                console.error("Ошибка при обновлении сотрудника:", error);
                toast({
                    title: "Ошибка",
                    description: error instanceof Error ? error.message : "Неизвестная ошибка",
                    variant: "destructive",
                });
            }
        };

        await updateEmployeeProject();

        // ПРИНУДИТЕЛЬНО перезагружаем данные проектов
        await queryClient.invalidateQueries({
            queryKey: [`/api/employeeprojects/project/${projectId}`],
        });

        if (secondProjectId) {
            await queryClient.invalidateQueries({
                queryKey: [`/api/employeeprojects/project/${secondProjectId}`],
            });
        }

        setRoleSelectionModal(null);
    };

    // Обработчик для показа модального окна выбора роли
    const handleShowRoleSelectionModal = (
        employeeId: number,
        fromProjectId: number,
        toProjectId: number,
        parentRoleId: number,
    ) => {
        console.log("DEBUG: handleShowRoleSelectionModal вызван с параметрами:", {
            employeeId,
            fromProjectId,
            toProjectId,
            parentRoleId,
        });

        // ВАЖНО: Сотрудник уже мог быть перемещен автоматически drag-and-drop логикой!
        // Нужно найти, в каком проекте он сейчас находится на самом деле
        const currentEmployeeProject = [
            ...projectEmployeesWithDetails,
            ...secondProjectEmployeesWithDetails,
        ].find((emp) => emp.employee_id === employeeId);

        const actualCurrentProjectId = currentEmployeeProject
            ? projectEmployeesWithDetails.find(
                (emp) => emp.employee_id === employeeId,
            )
                ? projectId
                : secondProjectId
            : fromProjectId;

        console.log(
            "DEBUG: Сотрудник сейчас находится в проекте:",
            actualCurrentProjectId,
        );

        // Находим дочерние роли для выбранного блока
        const childRoles = projectRoles.filter((r) => r.parent_id === parentRoleId);
        console.log("DEBUG: Найденные дочерние роли:", childRoles);

        const modalState = {
            isOpen: true,
            employeeId,
            fromProjectId: actualCurrentProjectId || fromProjectId,
            toProjectId,
            parentRoleId,
            childRoles,
        };

        console.log("DEBUG: Устанавливаю состояние модального окна:", modalState);
        setRoleSelectionModal(modalState);
    };

    // Мутация для перемещения сотрудника между проектами
    const moveEmployeeMutation = useMutation({
        mutationFn: async ({
                               employeeId,
                               fromProjectId,
                               toProjectId,
                               roleId,
                           }: {
            employeeId: number;
            fromProjectId: number;
            toProjectId: number;
            roleId?: number;
        }) => {
            console.log("🔄 Перемещение сотрудника:", {
                employeeId,
                fromProjectId,
                toProjectId,
                roleId,
            });

            // Удаляем из старого проекта
            const deleteResponse = await fetch(
                `/api/employeeprojects/${employeeId}/${fromProjectId}`,
                {
                    method: "DELETE",
                },
            );
            console.log("❌ Удаление из проекта:", deleteResponse.status);

            // Добавляем в новый проект
            const response = await fetch("/api/employeeprojects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: employeeId,
                    project_id: toProjectId,
                    role_id: roleId || null,
                }),
            });

            console.log("✅ Добавление в новый проект:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка при перемещении сотрудника");
            }

            return response.json();
        },
        onSuccess: () => {
            // Обновляем данные обоих проектов
            queryClient.invalidateQueries({
                queryKey: [`/api/employeeprojects/project/${projectId}`],
            });
            if (secondProjectId) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/employeeprojects/project/${secondProjectId}`],
                });
            }

            toast({
                title: "Сотрудник перемещен",
                description: "Сотрудник успешно перемещен между проектами",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Ошибка",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Запрос проекта
    const { data: projectResponse, isLoading: isLoadingProject } = useQuery<{
        status: string;
        data: Project;
    }>({
        queryKey: [`/api/projects/${projectId}`],
        enabled: !!projectId && !isNaN(projectId),
    });

    // Запрос данных сотрудников проекта
    const {
        data: projectEmployeesResponse,
        isLoading: isLoadingProjectEmployees,
    } = useQuery<{ status: string; data: EmployeeProject[] }>({
        queryKey: [`/api/employeeprojects/project/${projectId}`],
        enabled: !!projectId && !isNaN(projectId),
    });

    // Запрос всех сотрудников
    const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{
        status: string;
        data: Employee[];
    }>({
        queryKey: ["/api/employees"],
    });

    // Запрос всех должностей
    const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{
        status: string;
        data: Position[];
    }>({
        queryKey: ["/api/positions"],
    });

    // Запрос всех отделов
    const { data: departmentsResponse, isLoading: isLoadingDepartments } =
        useQuery<{ status: string; data: Department[] }>({
            queryKey: ["/api/departments"],
        });

    // Запрос ролей проекта
    const { data: projectRolesResponse, isLoading: isLoadingProjectRoles } =
        useQuery<{
            status: string;
            data: any[];
        }>({
            queryKey: ["/api/project-roles"],
        });

    // Запрос всех проектов для сайдбара
    const { data: allProjectsResponse, isLoading: isLoadingAllProjects } =
        useQuery<{
            status: string;
            data: any[];
        }>({
            queryKey: ["/api/projects"],
        });

    const isLoading =
        isLoadingProject ||
        isLoadingProjectEmployees ||
        isLoadingEmployees ||
        isLoadingPositions ||
        isLoadingDepartments ||
        isLoadingProjectRoles ||
        isLoadingAllProjects;

    // Подготавливаем данные
    const projectData = projectResponse?.data;
    const projectEmployees = projectEmployeesResponse?.data || [];
    const allEmployees = employeesResponse?.data || [];
    const allPositions = positionsResponse?.data || [];
    const allDepartments = departmentsResponse?.data || [];
    const projectRoles = projectRolesResponse?.data || [];
    const allProjects = allProjectsResponse?.data || [];

    // Запросы для второго проекта (если выбран)
    const { data: secondProjectResponse, isLoading: isLoadingSecondProject } =
        useQuery<{
            status: string;
            data: Project;
        }>({
            queryKey: [`/api/projects/${secondProjectId}`],
            enabled: !!secondProjectId,
        });

    const {
        data: secondProjectEmployeesResponse,
        isLoading: isLoadingSecondProjectEmployees,
    } = useQuery<{
        status: string;
        data: EmployeeProject[];
    }>({
        queryKey: [`/api/employeeprojects/project/${secondProjectId}`],
        enabled: !!secondProjectId,
    });

    // Получаем полную информацию о сотрудниках проекта
    const projectEmployeesWithDetails = projectEmployees.map(
        (ep: EmployeeProject) => {
            const employee = allEmployees.find(
                (e) => e.employee_id === ep.employee_id,
            );
            const position = allPositions.find(
                (p) => p.position_id === employee?.position_id,
            );
            const department = allDepartments.find(
                (d) => d.department_id === employee?.department_id,
            );

            return {
                ...ep,
                employeeDetails: employee,
                positionName: position?.name || "Неизвестная должность",
                departmentName: department?.name || "Неизвестный отдел",
            };
        },
    );

    // Подготавливаем данные для второго проекта
    const secondProjectData = secondProjectResponse?.data;
    const secondProjectEmployees = secondProjectEmployeesResponse?.data || [];

    const secondProjectEmployeesWithDetails = secondProjectEmployees.map(
        (ep: EmployeeProject) => {
            const employee = allEmployees.find(
                (e) => e.employee_id === ep.employee_id,
            );
            const position = allPositions.find(
                (p) => p.position_id === employee?.position_id,
            );
            const department = allDepartments.find(
                (d) => d.department_id === employee?.department_id,
            );

            return {
                employee_id: ep.employee_id,
                role_id: ep.role_id,
                employeeDetails: employee,
                positionName: position?.name || "Неизвестная должность",
                departmentName: department?.name || "Неизвестный отдел",
            };
        },
    );

    // Если данные еще загружаются
    if (isLoading) {
        return (
            <div className="flex h-screen">
                <div className="w-80 border-r">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="flex-1 p-6">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-64 w-full mb-6" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    // Если проект не найден
    if (!projectData) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Проект не найден
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Проект с ID {projectId} не существует или был удален
                    </p>
                    <Link href="/projects">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Вернуться к списку проектов
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-screen bg-gray-50">
                {/* Левый сайдбар со списком проектов (скрываемый) */}
                {sidebarVisible && (
                    <div className="w-80 bg-white shadow-lg">
                        <ProjectSidebar
                            projects={allProjects}
                            currentProjectId={projectData.project_id}
                            onHideSidebar={() => setSidebarVisible(false)}
                            onProjectClick={showSecondProject}
                        />
                    </div>
                )}

                {/* Основное содержимое */}
                <div className="flex-1 overflow-auto" style={{ zoom: 0.7 }}>
                    <div className="p-6">
                        {/* Заголовок */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Кнопка показа сайдбара (только когда он скрыт) */}
                                {!sidebarVisible && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSidebarVisible(true)}
                                        className="flex items-center space-x-2"
                                    >
                                        <Menu className="h-4 w-4" />
                                        <span>Показать список проектов</span>
                                    </Button>
                                )}

                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {projectData.name}
                                    </h1>
                                    <p className="text-gray-600">
                                        {projectData.description}
                                        {secondProjectId &&
                                            " • Перетащите сотрудников между проектами"}
                                    </p>
                                </div>
                            </div>

                            {/*<div className="flex items-center space-x-2">*/}
                            {/*    {user && (*/}
                            {/*        <Link href={`/admin/projects/${projectId}`}>*/}
                            {/*            <Button*/}
                            {/*                variant="default"*/}
                            {/*                className="flex items-center space-x-2"*/}
                            {/*            >*/}
                            {/*                <span>Админ панель</span>*/}
                            {/*                <ArrowRight className="h-4 w-4" />*/}
                            {/*            </Button>*/}
                            {/*        </Link>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        </div>

                        {/* Древовидное отображение проекта */}
                        {secondProjectId && secondProjectData ? (
                            // Показываем два дерева рядом с возможностью drag-and-drop
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <ProjectTree
                                        project={projectData}
                                        employees={projectEmployeesWithDetails}
                                        roles={projectRoles}
                                        isDragEnabled={true}
                                        isDropTarget={true}
                                        onMoveEmployee={(employeeId, roleId) => {
                                            // Сотрудник перетаскивается ИЗ второго проекта В первый
                                            moveEmployeeMutation.mutate({
                                                employeeId,
                                                fromProjectId: secondProjectId!,
                                                toProjectId: projectData.project_id,
                                                roleId,
                                            });
                                        }}
                                        onShowRoleSelectionModal={handleShowRoleSelectionModal}
                                    />
                                </div>

                                <div className="flex-1">
                                    <ProjectTree
                                        project={secondProjectData}
                                        employees={secondProjectEmployeesWithDetails}
                                        roles={projectRoles}
                                        isDragEnabled={true}
                                        isDropTarget={true}
                                        onMoveEmployee={(employeeId, roleId) => {
                                            // Сотрудник перетаскивается ИЗ первого проекта ВО второй
                                            moveEmployeeMutation.mutate({
                                                employeeId,
                                                fromProjectId: projectId,
                                                toProjectId: secondProjectData.project_id,
                                                roleId,
                                            });
                                        }}
                                        onShowRoleSelectionModal={handleShowRoleSelectionModal}
                                    />
                                </div>
                            </div>
                        ) : (
                            // Показываем одно дерево на всю ширину без drag-and-drop
                            <div className="max-w-5xl mx-auto">
                                <ProjectTree
                                    project={projectData}
                                    employees={projectEmployeesWithDetails}
                                    roles={projectRoles}
                                    isDragEnabled={false}
                                    isDropTarget={false}
                                    onShowRoleSelectionModal={handleShowRoleSelectionModal}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальное окно выбора роли */}
            {roleSelectionModal && roleSelectionModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Выберите роль</h3>
                            <button
                                onClick={() => setRoleSelectionModal(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Выберите роль для сотрудника в новом проекте:
                        </p>

                        <div className="space-y-2 mb-4">
                            {roleSelectionModal.childRoles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelection(role.id)}
                                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                >
                                    {role.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setRoleSelectionModal(null)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DndProvider>
    );
}
