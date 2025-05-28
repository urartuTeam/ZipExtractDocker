import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ProjectRolesManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RoleTreeNode extends ProjectRole {
    children?: RoleTreeNode[];
}

export default function ProjectRolesManager({
                                                open,
                                                onOpenChange,
                                            }: ProjectRolesManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingRole, setEditingRole] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [newRoleName, setNewRoleName] = useState("");

    // Получение ролей проектов
    const { data: rolesResponse, isLoading } = useQuery<{
        status: string;
        data: ProjectRole[];
    }>({
        queryKey: ["/api/project-roles"],
        enabled: open,
    });

    const roles = rolesResponse?.data || [];

    // Создание роли
    const createRole = useMutation({
        mutationFn: async (roleData: { name: string; parent_id?: number }) => {
            const response = await fetch("/api/project-roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(roleData),
            });
            if (!response.ok) {
                throw new Error("Failed to create role");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/project-roles"] });
            setNewRoleName("");
            toast({
                title: "Роль создана",
                description: "Новая роль проекта успешно добавлена",
            });
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось создать роль",
                variant: "destructive",
            });
        },
    });

    // Обновление роли
    const updateRole = useMutation({
        mutationFn: async ({ id, name }: { id: number; name: string }) => {
            const response = await fetch(`/api/project-roles/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error("Failed to update role");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/project-roles"] });
            setEditingRole(null);
            setEditingName("");
            toast({
                title: "Роль обновлена",
                description: "Название роли успешно изменено",
            });
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить роль",
                variant: "destructive",
            });
        },
    });

    // Удаление роли
    const deleteRole = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api/project-roles/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete role");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/project-roles"] });
            toast({
                title: "Роль удалена",
                description: "Роль проекта успешно удалена",
            });
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось удалить роль",
                variant: "destructive",
            });
        },
    });

    // Обновление статуса is_rp
    const updateIsRp = useMutation({
        mutationFn: async ({ id, is_rp }: { id: number; is_rp: boolean }) => {
            const response = await fetch(`/api/project-roles/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_rp }),
            });
            if (!response.ok) {
                throw new Error("Failed to update role status");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/project-roles"] });
            toast({
                title: "Статус обновлен",
                description: "Статус роли успешно изменен",
            });
        },
        onError: () => {
            toast({
                title: "Ошибка",
                description: "Не удалось обновить статус роли",
                variant: "destructive",
            });
        },
    });

    // Построение дерева ролей
    const buildRoleTree = (roles: ProjectRole[]): RoleTreeNode[] => {
        const roleMap = new Map<number, RoleTreeNode>();
        const rootRoles: RoleTreeNode[] = [];

        // Создаем карту всех ролей
        roles.forEach((role) => {
            roleMap.set(role.id, { ...role, children: [] });
        });

        // Строим дерево
        roles.forEach((role) => {
            const node = roleMap.get(role.id)!;
            if (role.parent_id === null) {
                rootRoles.push(node);
            } else {
                const parent = roleMap.get(role.parent_id);
                if (parent) {
                    parent.children?.push(node);
                }
            }
        });

        return rootRoles;
    };

    const roleTree = buildRoleTree(roles);

    // Логика для чекбоксов is_rp
    const checkedRoles = roles.filter(role => role.parent_id === null && role.is_rp);
    const hasCheckedRole = checkedRoles.length > 0;

    // Обработчик изменения чекбокса
    const handleCheckboxChange = (roleId: number, isChecked: boolean) => {
        updateIsRp.mutate({ id: roleId, is_rp: isChecked });
    };

    // Проверка, должен ли чекбокс быть отключен
    const isCheckboxDisabled = (roleId: number) => {
        if (!hasCheckedRole) return false; // Если никто не отмечен, все активны
        return !roles.find(r => r.id === roleId)?.is_rp; // Отключен, если сам не отмечен, но кто-то другой отмечен
    };

    // Начать редактирование роли
    const startEditing = (role: ProjectRole) => {
        setEditingRole(role.id);
        setEditingName(role.name);
    };

    // Сохранить изменения
    const saveEdit = () => {
        if (editingRole && editingName.trim()) {
            updateRole.mutate({ id: editingRole, name: editingName.trim() });
        }
    };

    // Отменить редактирование
    const cancelEdit = () => {
        setEditingRole(null);
        setEditingName("");
    };

    // Создать корневую роль
    const createRootRole = () => {
        if (newRoleName.trim()) {
            createRole.mutate({ name: newRoleName.trim() });
        }
    };

    // Создать дочернюю роль
    const createChildRole = (parentId: number) => {
        const childName = prompt("Введите название дочерней роли:");
        if (childName?.trim()) {
            createRole.mutate({ name: childName.trim(), parent_id: parentId });
        }
    };

    // Компонент для отображения узла дерева
    const RoleNode = ({ role, level = 0 }: { role: RoleTreeNode; level?: number }) => {
        const isEditing = editingRole === role.id;

        return (
            <div className="mb-2">
                <div
                    className="flex items-center gap-2 p-3 border rounded-lg bg-white hover:bg-gray-50"
                    style={{ marginLeft: `${level * 32}px` }}
                >
                    {isEditing ? (
                        <>
                            <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") cancelEdit();
                                }}
                                autoFocus
                            />
                            <Button size="sm" onClick={saveEdit} disabled={updateRole.isPending}>
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Чекбокс только для корневых ролей */}
                            {level === 0 && (
                                <Checkbox
                                    checked={role.is_rp || false}
                                    disabled={isCheckboxDisabled(role.id)}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(role.id, checked as boolean)
                                    }
                                    className="mr-2"
                                />
                            )}
                            <span className="flex-1 font-medium">{role.name}</span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => createChildRole(role.id)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(role)}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteRole.mutate(role.id)}
                                disabled={deleteRole.isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
                {role.children?.map((child) => (
                    <RoleNode key={child.id} role={child} level={level + 1} />
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Управление ролями проектов</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Добавление новой корневой роли */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Добавить группу ролей</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Название новой группы ролей..."
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") createRootRole();
                                    }}
                                />
                                <Button
                                    onClick={createRootRole}
                                    disabled={!newRoleName.trim() || createRole.isPending}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить группу
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Дерево ролей */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Структура ролей</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8">Загрузка ролей...</div>
                            ) : roleTree.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Роли не найдены. Создайте первую группу ролей.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {roleTree.map((role) => (
                                        <RoleNode key={role.id} role={role} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}