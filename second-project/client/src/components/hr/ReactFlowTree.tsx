import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    NodeTypes,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "@/index.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
    Plus,
    Building,
    Users,
    UserCircle,
    Briefcase,
    Edit,
    X,
    Trash,
    UserPlus,
} from "lucide-react";

// Типы узлов дерева
const NODE_TYPES = {
    DEPARTMENT: "department",
    MANAGEMENT: "management",
    POSITION: "position",
    ORGANIZATION: "organization",
    EMPLOYEE: "employee",
};

// Интерфейсы для данных
interface OrgUnit {
    id: number;
    type: string;
    type_id: number;
    parentId: number | null;
    positionX: number;
    positionY: number;
    headEmployeeId?: number | null;
    headPositionId?: number | null;
    title: string;
    position: { x: number; y: number };
    headEmployee?: Employee | null;
    headPosition?: Position | null;
}

interface Employee {
    id: number;
    fullName: string;
    positionId?: number | null;
}

// Кастомный узел для организационной единицы
const OrgUnitNode = ({ data }: { data: any }) => {
    const {
        id,
        label,
        type,
        onAddChild,
        onEdit,
        employee,
        setSelectedPositionForEmployees,
        setShowPositionEmployeesModal,
        setSelectedManagementForEmployees,
        setShowManagementEmployeesModal,
    } = data;
    const [showMenu, setShowMenu] = useState(false);

    const getNodeColor = (type: string) => {
        switch (type) {
            case "organization":
                return "bg-green-100 border-green-300";
            case "department":
                return "bg-yellow-100 border-yellow-300";
            case "management":
                return "bg-blue-100 border-blue-300";
            case "position":
                return "bg-purple-100 border-purple-300";
            default:
                return "bg-gray-100 border-gray-300";
        }
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case "organization":
                return <Building className="w-4 h-4" />;
            case "department":
                return <Users className="w-4 h-4" />;
            case "management":
                return <UserCircle className="w-4 h-4" />;
            case "position":
                return <Briefcase className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const handleAddChild = (childType: string) => {
        data.onAddChild?.(data.id, childType);
        setShowMenu(false);
    };
    console.log();
    return (
        <div
            className={`px-4 py-2 shadow-md rounded-md border-2 ${getNodeColor(data.type)} min-w-[150px] relative`}
        >
            <Handle
                type="target"
                position={Position.Top}
                id="target"
                className="w-3 h-3 !bg-gray-400"
            />

            <div className="flex items-center gap-2 mb-1">
                {getNodeIcon(data.type)}
                <div className="text-sm font-semibold">{data.label}</div>
            </div>

            {/* Отображение назначенного руководителя для управлений и департаментов */}
            {(data.type === "management" || data.type === "department") && (
                <>
                    {(!data.managerInfo ||
                        (!data.managerInfo.positionName &&
                            !data.managerInfo.employeeName)) && (
                        <div className="mt-1 text-xs text-gray-400 italic">
                            Руководящая должность еще не определена
                        </div>
                    )}
                    {data.managerInfo?.positionName &&
                        !data.managerInfo?.employeeName && (
                            <div className="mt-1 text-xs text-gray-400 italic">
                                Руководитель не назначен
                            </div>
                        )}
                    {data.managerInfo?.positionName &&
                        data.managerInfo?.employeeName && (
                            <div className="mt-1 text-xs text-blue-600">
                                <div className="text-gray-500">
                                    {data.managerInfo.positionName}
                                </div>
                                <div className="font-medium">
                                    {data.managerInfo.employeeName}
                                </div>
                            </div>
                        )}
                </>
            )}

            {(data.type === "management" || data.type === "department") &&
                !data.managerInfo && (
                    <div className="mt-1 text-xs text-gray-400 italic"></div>
                )}

            {/* Отображение назначенного сотрудника для должностей */}

            {data.type === "position" && data.assignedEmployeeName && (
                <div className="mt-1 text-xs text-purple-600 font-medium">
                    {data.assignedEmployeeName.includes(",")
                        ? // Если несколько сотрудников, показываем каждого на отдельной строке
                          data.assignedEmployeeName
                              .split(", ")
                              .map((name, index) => (
                                  <div key={index}>{name}</div>
                              ))
                        : // Если один сотрудник, показываем обычным образом
                          data.assignedEmployeeName}
                </div>
            )}

            {data.type === "position" && !data.assignedEmployeeName && (
                <div className="mt-1 text-xs text-gray-400 italic">
                    Вакантная должность
                </div>
            )}
            <div className="flex gap-1 mt-2">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 bg-white rounded hover:bg-gray-50 border"
                    title="Добавить дочерний элемент"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                    alert(123);
                    e.stopPropagation();
                    if (data.onEdit) {
                        // Передаем id узла из данных data.typeId если есть, иначе используем 1
                        data.onEdit(data.id, data.type, data.typeId || 1);
                    }
                }}
            >
                <Edit size={14} />
            </button>

            {/* Кнопка управления сотрудниками для должностей */}
            {data.type === "position" && (
                <button
                    className="absolute top-8 right-2 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Кнопка нажата", data.id);
                        console.log(
                            "setSelectedPositionForEmployees:",
                            setSelectedPositionForEmployees,
                        );
                        console.log(
                            "setShowPositionEmployeesModal:",
                            setShowPositionEmployeesModal,
                        );
                        if (
                            setSelectedPositionForEmployees &&
                            setShowPositionEmployeesModal
                        ) {
                            setSelectedPositionForEmployees(data.id);
                            setShowPositionEmployeesModal(true);
                        } else {
                            console.error("Функции не найдены в данных узла!");
                        }
                    }}
                >
                    <UserPlus size={14} />
                </button>
            )}

            {/* Кнопка управления сотрудниками для управлений */}
            {data.type === "management" && (
                <button
                    className="absolute top-8 right-2 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Кнопка управления нажата", data.id);
                        if (
                            setSelectedManagementForEmployees &&
                            setShowManagementEmployeesModal
                        ) {
                            setSelectedManagementForEmployees(data.id);
                            setShowManagementEmployeesModal(true);
                        } else {
                            console.error("Функции для управления не найдены!");
                        }
                    }}
                >
                    <UserPlus size={14} />
                </button>
            )}

            {/* Кнопка управления сотрудниками для департаментов (желтые блоки) */}
            {data.type === "department" && (
                <button
                    className="absolute top-8 right-2 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Кнопка департамента нажата", data.id);
                        if (
                            setSelectedManagementForEmployees &&
                            setShowManagementEmployeesModal
                        ) {
                            setSelectedManagementForEmployees(data.id);
                            setShowManagementEmployeesModal(true);
                        } else {
                            console.error(
                                "Функции для департамента не найдены!",
                            );
                        }
                    }}
                >
                    <UserPlus size={14} />
                </button>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                className="w-3 h-3 !bg-gray-400"
            />

            {showMenu && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 flex gap-2 p-2 bg-white rounded-lg shadow-lg border z-50">
                    <button
                        onClick={() => handleAddChild("organization")}
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить организацию"
                    >
                        <Building className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAddChild("department")}
                        className="w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить отдел"
                    >
                        <Users className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAddChild("position")}
                        className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить должность"
                    >
                        <Briefcase className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAddChild("employee")}
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить сотрудника"
                    >
                        <UserCircle className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Типы узлов
const nodeTypes: NodeTypes = {
    orgUnit: OrgUnitNode,
};

// Начальные узлы и связи
const initialNodes: Node[] = [
    {
        id: "1",
        type: "orgUnit",
        position: { x: 250, y: 25 },
        data: {
            label: "Организация",
            type: "organization",
            onAddChild: (id: string) => console.log("Add child to", id),
        },
    },
];

const initialEdges: Edge[] = [];

export default function ReactFlowTree() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeCounter = useRef(1000);
    // Состояния для модального окна редактирования
    const [showEditModal, setShowEditModal] = useState(false);
    const [editNodeId, setEditNodeId] = useState<number | null>(null);
    const [editNodeType, setEditNodeType] = useState<string>("");
    const [selectedEditItemId, setSelectedEditItemId] = useState<number | null>(
        null,
    );
    const [editNodeName, setEditNodeName] = useState("");
    // Отдельное состояние для модального окна управлений
    const [showManagementEmployeesModal, setShowManagementEmployeesModal] =
        useState(false);
    const [selectedManagementForEmployees, setSelectedManagementForEmployees] =
        useState<number | null>(null);
    const [selectedEmployeeForManagement, setSelectedEmployeeForManagement] =
        useState<number | null>(null);
    const [selectedPositionForManagement, setSelectedPositionForManagement] =
        useState<number | null>(null);

    // Состояние для модального окна назначения сотрудника
    const [showAssignEmployeeModal, setShowAssignEmployeeModal] =
        useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
        null,
    );

    // Состояния для улучшенного интерфейса выбора сотрудников
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>(
        [],
    );
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

    const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
        null,
    );

    const [showCreateOrganizationModal, setShowCreateOrganizationModal] =
        useState(false);
    const [showCreateDepartmentModal, setShowCreateDepartmentModal] =
        useState(false);
    const [showCreatePositionModal, setShowCreatePositionModal] =
        useState(false);
    const [showCreateManagementModal, setShowCreateManagementModal] =
        useState(false);

    const [selectedPositionForEmployees, setSelectedPositionForEmployees] =
        useState<number | null>(null);
    const [showPositionEmployeesModal, setShowPositionEmployeesModal] =
        useState(false);
    const [selectedEmployeeForAssignment, setSelectedEmployeeForAssignment] =
        useState<number | null>(null);

    useEffect(() => {
        const enhancedNodes = initialNodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onAddChild: (id: string, type: string) => {
                    console.log("Add", type, "to", id);
                },
                onEdit: (id: string) => {
                    console.log("Edit", id);
                },
                setSelectedPositionForEmployees,
                setShowPositionEmployeesModal,
                setSelectedManagementForEmployees,
                setShowManagementEmployeesModal,
            },
        }));
        setNodes(enhancedNodes);
    }, []);

    // Запросы для получения данных
    // Загрузка узлов из БД
    const { data: orgUnits, isLoading: isLoadingOrgUnits } = useQuery<
        OrgUnit[]
    >({
        queryKey: ["/api/org-units"],
        queryFn: () => fetch("/api/org-units").then((res) => res.json()),
    });

    // Загрузка сотрудников из БД
    const { data: employees, isLoading: isLoadingEmployees } = useQuery<
        Employee[]
    >({
        queryKey: ["/api/employees"],
        queryFn: () => fetch("/api/employees").then((res) => res.json()),
        select: (data) =>
            data.map((emp: any) => ({
                ...emp,
                name: emp.fullName, // подмена
            })),
    });

    // Получение должностей из отдельной таблицы
    const { data: positions } = useQuery({
        queryKey: ["/api/positions"],
        queryFn: () => fetch("/api/positions").then((res) => res.json()),
    });

    // Получение отделов из отдельной таблицы
    const { data: departments } = useQuery({
        queryKey: ["/api/departments"],
        queryFn: () => fetch("/api/departments").then((res) => res.json()),
    });

    // Получение управлений из отдельной таблицы
    const { data: managements } = useQuery({
        queryKey: ["/api/managements"],
        queryFn: () => fetch("/api/managements").then((res) => res.json()),
    });

    // Получение организаций из отдельной таблицы
    const { data: organizations } = useQuery({
        queryKey: ["/api/organizations"],
        queryFn: () => fetch("/api/organizations").then((res) => res.json()),
    });

    // Получение назначений сотрудников для отображения в блоках
    const { data: employeeAssignments = [] } = useQuery({
        queryKey: ["/api/employee-positions"],
        queryFn: () =>
            fetch("/api/employee-positions?all=true").then((res) => res.json()),
    });

    // Мутации для создания узлов
    const queryClient = useQueryClient();

    const createOrgUnitMutation = useMutation({
        mutationFn: async (newUnit: any) => {
            const response = await apiRequest("/api/org-units", {
                method: "POST",
                body: JSON.stringify(newUnit),
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
        },
    });

    // Обработчик подключения узлов
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // Функция сохранения позиции узла
    const saveNodePosition = async (nodeId: string, x: number, y: number) => {
        try {
            const response = await fetch(`/api/org-units/${nodeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    positionX: x,
                    positionY: y,
                }),
            });

            if (!response.ok) {
                console.error("Ошибка при сохранении позиции узла");
            }
        } catch (error) {
            console.error("Ошибка при сохранении позиции:", error);
        }
    };

    // Функция удаления блока
    const handleDeleteBlock = async () => {
        console.log(editNodeId);
        if (!editNodeId) return;
        console.log(editNodeId);

        console.log(editNodeId);
        if (
            !window.confirm(
                "Вы уверены, что хотите удалить этот блок? Это действие нельзя отменить.",
            )
        )
            return;
        console.log(editNodeId);
        try {
            const response = await fetch(`/api/org-units/${editNodeId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Обновляем кэш
            await queryClient.invalidateQueries({
                queryKey: ["/api/org-units"],
            });

            // Обновляем кэш
            await queryClient.invalidateQueries({
                queryKey: ["/api/org-units"],
            });

            // Закрываем модальное окно
            setShowEditModal(false);
            setEditNodeId(null);
            setEditNodeType("");
            setSelectedEditItemId(null);
        } catch (error) {
            console.error("Ошибка при удалении блока:", error);
            alert(
                "Ошибка при удалении блока. Возможно, у блока есть дочерние элементы.",
            );
        }
    };

    // Состояние для отслеживания начальных позиций узлов
    const [dragStartPositions, setDragStartPositions] = useState<
        Record<string, { x: number; y: number }>
    >({});

    // Обработчик начала перемещения узла
    const onNodeDragStart = useCallback(
        (event: React.MouseEvent, node: Node) => {
            setDragStartPositions((prev) => ({
                ...prev,
                [node.id]: { x: node.position.x, y: node.position.y },
            }));
        },
        [],
    );

    // Обработчик окончания перемещения узла
    const onNodeDragStop = useCallback(
        (event: React.MouseEvent, node: Node) => {
            const startPosition = dragStartPositions[node.id];
            if (startPosition) {
                // Проверяем, действительно ли узел был перемещен
                const moved =
                    startPosition.x !== node.position.x ||
                    startPosition.y !== node.position.y;
                if (moved) {
                    saveNodePosition(node.id, node.position.x, node.position.y);
                }
                // Очищаем сохраненную позицию
                setDragStartPositions((prev) => {
                    const newState = { ...prev };
                    delete newState[node.id];
                    return newState;
                });
            }
        },
        [dragStartPositions],
    );

    // Состояния для модальных окон создания
    const [showAddModal, setShowAddModal] = useState(false);
    const [newNodeType, setNewNodeType] = useState<string>("");
    const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
    const [newNodeName, setNewNodeName] = useState("");
    const [departmentType, setDepartmentType] = useState<
        "department" | "management"
    >("department");
    const [showAddMenu, setShowAddMenu] = useState<string | null>(null);

    const [selectedParentId, setSelectedParentId] = useState<string | null>(
        null,
    );
    const [modalType, setModalType] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Добавление дочернего узла (теперь открывает меню выбора)
    const addChildNode = useCallback(
        (parentId: string, nodeType: string = "position") => {
            //alert(parentId);
            setSelectedParentId(parentId);
            setNewNodeParentId(parentId); // <--- вот это добавь
            setModalType(nodeType);
            switch (nodeType) {
                case NODE_TYPES.DEPARTMENT:
                    setNewNodeType(NODE_TYPES.DEPARTMENT);
                    break;
                case NODE_TYPES.MANAGEMENT:
                    setNewNodeType(NODE_TYPES.MANAGEMENT);
                    break;
                case NODE_TYPES.POSITION:
                    setNewNodeType(NODE_TYPES.POSITION);
                    break;
                case NODE_TYPES.ORGANIZATION:
                    setNewNodeType(NODE_TYPES.ORGANIZATION);
                    break;
                default:
                    setNewNodeType("employee");
            }
            setShowAddModal(true);
        },
        [],
    );

    // Функция для открытия модального окна редактирования
    const handleOpenEditModal = useCallback(
        (nodeId: number, nodeType: string, currentTypeId: number) => {
            setEditNodeId(nodeId);
            setEditNodeType(nodeType);
            setSelectedEditItemId(currentTypeId);
            setShowEditModal(true);
        },
        [],
    );

    // Загрузка существующих данных в React Flow
    React.useEffect(() => {
        if (
            orgUnits &&
            employees &&
            positions &&
            departments &&
            organizations &&
            managements &&
            employeeAssignments
        ) {
            const flowNodes: Node[] = [];
            const flowEdges: Edge[] = [];

            // Создаем карты для быстрого поиска
            const positionMap = new Map(
                (positions as any[])?.map((p: any) => [p.id, p]) || [],
            );
            const departmentMap = new Map(
                (departments as any[])?.map((d: any) => [d.id, d]) || [],
            );
            const organizationMap = new Map(
                (organizations as any[])?.map((o: any) => [o.id, o]) || [],
            );
            const managementMap = new Map(
                (managements as any[])?.map((m: any) => [m.id, m]) || [],
            );
            const employeeMap = new Map(
                (employees as any[])?.map((e: any) => [e.id, e]) || [],
            );

            // Преобразуем orgUnits в узлы React Flow
            (orgUnits as any[]).forEach((unit: OrgUnit) => {
                let label = "";
                let employee = null;

                switch (unit.type) {
                    case "position":
                        const position = positionMap.get(unit.type_id);
                        label = (position as any)?.name || "Позиция";
                        break;
                    case "department":
                        const department = departmentMap.get(unit.type_id);
                        label = (department as any)?.name || "Отдел";
                        break;
                    case "organization":
                        const organization = organizationMap.get(unit.type_id);
                        label = (organization as any)?.name || "Организация";
                        break;
                    case "management":
                        const management = managementMap.get(unit.type_id);
                        label = (management as any)?.name || "Управление";
                        break;
                }

                // Найдем назначенного сотрудника
                if (unit.headEmployeeId) {
                    const emp = employeeMap.get(unit.headEmployeeId);
                    employee = (emp as any)?.fullName;
                }

                // Найдем информацию о назначенных сотрудниках
                let managerInfo = null;
                let assignedEmployeeName = null;

                if (unit.type === "management" || unit.type === "department") {
                    const assignment = employeeAssignments?.find(
                        (assign) => assign.orgUnitId === unit.id,
                    );

                    if (assignment) {
                        const assignedEmployee = employees?.find(
                            (emp) => emp.id === assignment.employeeId,
                        );
                        const assignedPosition = positions?.find(
                            (pos) => pos.id === assignment.positionId,
                        );

                        if (assignedEmployee && assignedPosition) {
                            managerInfo = {
                                employeeName: assignedEmployee.fullName,
                                positionName: assignedPosition.name,
                            };
                        }
                    }
                } else if (unit.type === "position") {
                    // Для должностей показываем только ФИО назначенного сотрудника
                    // Ищем назначения по positionId (который равен unit.type_id для должностей)
                    const positionAssignments = employeeAssignments?.filter(
                        (assign) => assign.positionId === unit.type_id,
                    );

                    console.log(
                        `Position unit ${unit.id}, type_id: ${unit.type_id}, assignments:`,
                        positionAssignments,
                    );

                    if (positionAssignments && positionAssignments.length > 0) {
                        // Получаем список всех назначенных сотрудников (убираем дубликаты)
                        const assignedEmployees = [
                            ...new Set(
                                positionAssignments
                                    .map((assignment) => {
                                        const employee = employees?.find(
                                            (emp) =>
                                                emp.id ===
                                                assignment.employeeId,
                                        );
                                        return employee
                                            ? employee.fullName
                                            : "";
                                    })
                                    .filter((name) => name), // Убираем пустые строки
                            ),
                        ]; // Убираем дубликаты имен

                        if (assignedEmployees.length === 1) {
                            assignedEmployeeName = assignedEmployees[0];
                            console.log(
                                `Found single employee: ${assignedEmployeeName}`,
                            );
                        } else {
                            // Для нескольких сотрудников показываем все имена через запятую
                            assignedEmployeeName = assignedEmployees.join(", ");
                            console.log(
                                `Found multiple employees: ${assignedEmployeeName}`,
                            );
                        }
                    } else {
                        console.log(
                            `No assignments found for position ${unit.type_id}`,
                        );
                    }
                }

                const flowNode: Node = {
                    id: unit.id.toString(),
                    type: "orgUnit",
                    position: {
                        x: unit.positionX || 0,
                        y: unit.positionY || 0,
                    },
                    data: {
                        label,
                        type: unit.type,
                        employee,
                        id: unit.id,
                        typeId: unit.type_id,
                        managerInfo,
                        assignedEmployeeName,
                        onAddChild: addChildNode,
                        onEdit: handleOpenEditModal,
                        setSelectedPositionForEmployees,
                        setShowPositionEmployeesModal,
                        setSelectedManagementForEmployees,
                        setShowManagementEmployeesModal,
                    },
                };

                flowNodes.push(flowNode);

                // Создаем связи между узлами
                if (unit.parentId) {
                    const flowEdge: Edge = {
                        id: `e${unit.parentId}-${unit.id}`,
                        source: unit.parentId.toString(),
                        target: unit.id.toString(),
                        sourceHandle: "source",
                        targetHandle: "target",
                        animated: false,
                        type: "smoothstep",
                        style: { stroke: "#999" },
                    };
                    flowEdges.push(flowEdge);
                }
            });

            setNodes(flowNodes);
            setEdges(flowEdges);
        }
    }, [
        orgUnits,
        employees,
        positions,
        departments,
        organizations,
        managements,
        employeeAssignments,
    ]);

    // Создание новой организации
    const handleCreateOrganization = useCallback(
        async (name: string, logoPath?: string) => {
            try {
                // Создаем новую организацию
                const newOrganization = await apiRequest("/api/organizations", {
                    method: "POST",
                    body: JSON.stringify({ name, logoPath }),
                });

                // Создаем org_unit
                const newOrgUnit = await createOrgUnitMutation.mutateAsync({
                    type: "organization",
                    type_id: newOrganization.id,
                    parentId: newNodeParentId
                        ? parseInt(newNodeParentId)
                        : null,
                    positionX: 300 + Math.random() * 200,
                    positionY: 200 + Math.random() * 100,
                });

                setShowCreateOrganizationModal(false);
                queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
            } catch (error) {
                console.error("Ошибка при создании организации:", error);
            }
        },
        [newNodeParentId, createOrgUnitMutation, queryClient],
    );

    // Создание нового отдела
    const handleCreateDepartment = useCallback(
        async (name: string, logoPath?: string) => {
            try {
                const newDepartment = await apiRequest("/api/departments", {
                    method: "POST",
                    body: JSON.stringify({ name, logoPath }),
                });

                const newOrgUnit = await createOrgUnitMutation.mutateAsync({
                    type: "department",
                    type_id: newDepartment.id,
                    parentId: newNodeParentId
                        ? parseInt(newNodeParentId)
                        : null,
                    positionX: 300 + Math.random() * 200,
                    positionY: 200 + Math.random() * 100,
                });

                setShowCreateDepartmentModal(false);
                queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
            } catch (error) {
                console.error("Ошибка при создании отдела:", error);
            }
        },
        [newNodeParentId, createOrgUnitMutation, queryClient],
    );

    // Создание нового управления
    const handleCreateManagement = useCallback(
        async (name: string, logoPath?: string) => {
            try {
                const newManagement = await apiRequest("/api/managements", {
                    method: "POST",
                    body: JSON.stringify({ name, logoPath }),
                });

                const newOrgUnit = await createOrgUnitMutation.mutateAsync({
                    type: "management",
                    type_id: newManagement.id,
                    parentId: newNodeParentId
                        ? parseInt(newNodeParentId)
                        : null,
                    positionX: 300 + Math.random() * 200,
                    positionY: 200 + Math.random() * 100,
                });

                setShowCreateManagementModal(false);
                queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
            } catch (error) {
                console.error("Ошибка при создании управления:", error);
            }
        },
        [newNodeParentId, createOrgUnitMutation, queryClient],
    );

    // Создание новой должности
    const handleCreatePosition = useCallback(
        async (name: string) => {
            try {
                const newPosition = await apiRequest("/api/positions", {
                    method: "POST",
                    body: JSON.stringify({ name }),
                });

                const newOrgUnit = await createOrgUnitMutation.mutateAsync({
                    type: "position",
                    type_id: newPosition.id,
                    parentId: newNodeParentId
                        ? parseInt(newNodeParentId)
                        : null,
                    positionX: 300 + Math.random() * 200,
                    positionY: 200 + Math.random() * 100,
                });

                setShowCreatePositionModal(false);
                queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
            } catch (error) {
                console.error("Ошибка при создании должности:", error);
            }
        },
        [newNodeParentId, createOrgUnitMutation, queryClient],
    );

    const [selectedExistingId, setSelectedExistingId] = useState<number | null>(
        null,
    );

    const handleCreateNode = async () => {
        if (!selectedExistingId) return;

        // Проверяем, не существует ли уже такой блок у данного родителя
        const existingNode = orgUnits?.find(
            (unit) =>
                unit.parentId === newNodeParentId &&
                unit.type === newNodeType &&
                unit.type_id === selectedExistingId,
        );

        if (existingNode) {
            alert(
                "Блок с таким типом и названием уже существует у данного родителя!",
            );
            return;
        }

        // Получаем выбранный элемент из соответствующего списка
        let selectedItem;
        if (newNodeType === NODE_TYPES.ORGANIZATION) {
            selectedItem = organizations?.find(
                (item) => item.id === selectedExistingId,
            );
        } else if (newNodeType === NODE_TYPES.DEPARTMENT) {
            selectedItem = departments?.find(
                (item) => item.id === selectedExistingId,
            );
        } else if (newNodeType === NODE_TYPES.MANAGEMENT) {
            selectedItem = managements?.find(
                (item) => item.id === selectedExistingId,
            );
        } else if (newNodeType === NODE_TYPES.POSITION) {
            selectedItem = positions?.find(
                (item) => item.id === selectedExistingId,
            );
        } else if (newNodeType === NODE_TYPES.EMPLOYEE) {
            selectedItem = employees?.find(
                (item) => item.id === selectedExistingId,
            );
        }

        if (!selectedItem) return;

        try {
            if (newNodeType === NODE_TYPES.EMPLOYEE) {
                // Отправка данных на /api/employee-positions
                const response = await fetch("/api/employee-positions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        employeeId: selectedExistingId,
                        orgUnitId: newNodeParentId, // или newNodeParentId, если подходит
                    }),
                });

                if (!response.ok) {
                    console.error(
                        "Ошибка при создании назначения сотрудника:",
                        await response.text(),
                    );
                    return;
                }

                // После успешного создания:
                queryClient.invalidateQueries({
                    queryKey: ["/api/employee-positions"],
                });
                setShowAddModal(false);
                setShowAddMenu(null);
                setSelectedExistingId(null);
                setNewNodeType("");
                setNewNodeParentId(null);
                return; // прерываем дальнейшее выполнение
            }

            // Определяем флаги на основе типа
            const isOrganization = newNodeType === NODE_TYPES.ORGANIZATION;
            const isDepartment = newNodeType === NODE_TYPES.DEPARTMENT;
            const isManagement = newNodeType === NODE_TYPES.MANAGEMENT;
            const isPosition = newNodeType === NODE_TYPES.POSITION;

            // Координаты для нового узла
            const parentNode = nodes.find(
                (node) => node.id === newNodeParentId?.toString(),
            );
            const posX = parentNode ? parentNode.position.x : 400;
            const posY = parentNode ? parentNode.position.y + 150 : 50;
            const response = await fetch("/api/org-units", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: newNodeType,
                    type_id: selectedExistingId,
                    parentId: newNodeParentId
                        ? parseInt(newNodeParentId)
                        : null,
                    staffCount: 1,
                    positionX: posX,
                    positionY: posY,
                }),
            });

            if (response.ok) {
                const newNode = await response.json();

                // Обновляем список узлов локально, используя имя выбранного элеме��та
                const selectedItemName = selectedItem?.name || "Новый узел";
                setNodes((prevNodes) => [
                    ...prevNodes,
                    {
                        id: newNode.id.toString(),
                        type: "orgUnit",
                        position: { x: posX, y: posY },
                        data: {
                            label: selectedItemName,
                            type: newNode.type,
                            employee: null,
                            id: newNode.id,
                            typeId: selectedExistingId,
                            onAddChild: addChildNode,
                            onEdit: handleOpenEditModal,
                            setSelectedPositionForEmployees,
                            setShowPositionEmployeesModal,
                            setSelectedManagementForEmployees,
                            setShowManagementEmployeesModal,
                        },
                    },
                ]);

                // Принудительно обновляем данные соответствующего типа
                if (newNodeType === "organization") {
                    queryClient.invalidateQueries({
                        queryKey: ["/api/organizations"],
                    });
                } else if (newNodeType === "department") {
                    queryClient.invalidateQueries({
                        queryKey: ["/api/departments"],
                    });
                } else if (newNodeType === "management") {
                    queryClient.invalidateQueries({
                        queryKey: ["/api/managements"],
                    });
                } else if (newNodeType === "position") {
                    queryClient.invalidateQueries({
                        queryKey: ["/api/positions"],
                    });
                }

                if (newNodeParentId) {
                    setEdges((prevEdges) => [
                        ...prevEdges,
                        {
                            id: `edge-${newNodeParentId}-${newNode.id}`,
                            source: newNodeParentId.toString(),
                            target: newNode.id.toString(),
                            type: "smoothstep",
                            animated: false,
                        },
                    ]);
                }

                // Закрываем модальное окно и сбрасываем состояния
                setShowAddModal(false);
                setShowAddMenu(null);
                setSelectedExistingId(null);
                setNewNodeType("");
                setNewNodeParentId(null);
            } else {
                console.error(
                    "Ошибка при создании узла:",
                    await response.text(),
                );
            }
        } catch (error) {
            console.error("Ошибка при обращении к API:", error);
        }
    };

    if (isLoadingOrgUnits || isLoadingEmployees) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-lg">
                    Загрузка организационной структуры...
                </div>
            </div>
        );
    }

    // Назначение сотрудника для управления
    const handleAssignEmployee = async () => {
        if (!selectedUnitId || !selectedEmployeeId) return;

        try {
            // Если выбрана должность, сначала обновим должность сотрудника
            if (selectedPositionId) {
                await fetch(`/api/employees/${selectedEmployeeId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        positionId: selectedPositionId,
                    }),
                });
            }

            // Обновляем управление, назначая сотрудника
            const response = await fetch(`/api/org-units/${selectedUnitId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    headEmployeeId: selectedEmployeeId,
                }),
            });

            if (response.ok) {
                // Обновляем узел локально
                setNodes((prevNodes: Node[]) =>
                    prevNodes.map((node) => {
                        if (node.id === selectedUnitId) {
                            const updatedEmployee =
                                employees?.find(
                                    (e) => e.id === selectedEmployeeId,
                                ) || null;

                            const updatedPosition =
                                positions?.find(
                                    (p) => p.id === selectedPositionId,
                                ) || null;

                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    headEmployee: updatedEmployee,
                                    headPosition: updatedPosition,
                                },
                            } satisfies Node;
                        }
                        return node;
                    }),
                );

                // Закрываем модальное окно и сбрасываем выбранные значения
                setShowAssignEmployeeModal(false);
                setSelectedEmployeeId(null);
                setSelectedPositionId(null);
                setSelectedUnitId(null);

                // Обновляем данные из API
                fetch("/api/org-units")
                    .then((res) => res.json())
                    .then((data) => {
                        // Данные обновятся автоматически через хук React Query
                    });
            } else {
                console.error(
                    "Ошибка при назначении сотрудника:",
                    await response.text(),
                );
            }
        } catch (error) {
            console.error("Ошибка при обращении к API:", error);
        }
    };

    // Удаление узла из БД
    const handleDeleteNode = async () => {
        if (!editNodeId) return;

        try {
            const response = await fetch(`/api/org-units/${editNodeId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Удаляем узел локально
                setNodes((prevNodes) =>
                    prevNodes.filter((node) => node.id !== editNodeId),
                );

                // Закрываем модальное окно
                setShowEditModal(false);
            } else {
                console.error(
                    "Ошибка при удалении узла:",
                    await response.text(),
                );
            }
        } catch (error) {
            console.error("Ошибка при обращении к API:", error);
        }
    };

    // Обновление узла в БД
    const handleUpdateNode = async () => {
        if (!editNodeId || !editNodeName.trim()) return;

        try {
            // Находим текущий узел для проверки типа
            const currentNode = nodes.find((n) => n.id === editNodeId);

            // Для управлений отправляем назначение сотрудника
            if (
                currentNode?.type === "management" ||
                currentNode?.type === "department"
            ) {
                if (selectedEmployeeId) {
                    const assignmentData = {
                        employeeId: selectedEmployeeId,
                        orgUnitId: editNodeId,
                    };

                    console.log(
                        "Отправляем назначение сотрудника:",
                        assignmentData,
                    );

                    const response = await fetch(`/api/employee-positions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(assignmentData),
                    });

                    if (response.ok) {
                        // Обновляем данные
                        queryClient.invalidateQueries({
                            queryKey: ["/api/org-units"],
                        });
                        queryClient.invalidateQueries({
                            queryKey: ["/api/employees"],
                        });

                        setShowEditModal(false);
                        setEditNodeId(null);
                        setEditNodeName("");
                        setSelectedEmployeeId(null);
                        setSelectedPositionId(null);
                        return;
                    } else {
                        const errorText = await response.text();
                        console.error(
                            "Ошибка при назначении сотрудника:",
                            errorText,
                        );
                        return;
                    }
                }
            }

            // Для остальных типов обновляем только название
            let requestBody: any = { name: editNodeName };

            console.log("Отправляем обновление названия:", requestBody);

            const response = await fetch(`/api/org-units/${editNodeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Обновляем данные
                queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
                queryClient.invalidateQueries({ queryKey: ["/api/employees"] });

                // Закрываем модальное окно и сбрасываем состояние
                setShowEditModal(false);
                setSelectedEmployeeId(null);
                setSelectedPositionId(null);
            } else {
                const errorText = await response.text();
                console.error("Ошибка при обновлении узла:", errorText);
            }
        } catch (error) {
            console.error("Ошибка при обращении к API:", error);
        }
    };

    const editNode = nodes.find((n) => n.id === editNodeId);
    // Проверяем, является ли это управлением (department с isManagement=true)
    const isManagement = editNode?.type === "department";

    return (
        <div className="w-full h-full">
            <div className="mb-4 p-4 bg-white border-b flex gap-2">
                <button
                    onClick={() => {
                        setNewNodeParentId(null);
                        setShowCreateOrganizationModal(true);
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                    + Организация
                </button>
                <button
                    onClick={() => {
                        setNewNodeParentId(null);
                        setShowCreateDepartmentModal(true);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                    + Отдел
                </button>
                <button
                    onClick={() => {
                        setNewNodeParentId(null);
                        setShowCreateManagementModal(true);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                    + Управление
                </button>
                <button
                    onClick={() => {
                        setNewNodeParentId(null);
                        setShowCreatePositionModal(true);
                    }}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                >
                    + Позиция
                </button>
            </div>

            <div style={{ width: "100%", height: "calc(100% - 80px)" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background />
                </ReactFlow>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">
                            Добавить{" "}
                            {newNodeType === NODE_TYPES.DEPARTMENT
                                ? "отдел"
                                : newNodeType === NODE_TYPES.POSITION
                                  ? "должность"
                                  : newNodeType === NODE_TYPES.ORGANIZATION
                                    ? "организацию"
                                    : "сотрудника"}
                        </h3>
                        {newNodeType !== "EMPLOYEE" ? (
                            <div className="mb-4">
                                {/* Кнопки выбора типа отдела */}
                                {newNodeType === NODE_TYPES.DEPARTMENT && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Тип подразделения
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                                    departmentType ===
                                                    "department"
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                                                }`}
                                                onClick={() =>
                                                    setDepartmentType(
                                                        "department",
                                                    )
                                                }
                                            >
                                                <Users
                                                    className="inline-block mr-2"
                                                    size={16}
                                                />
                                                Отдел
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                                                    departmentType ===
                                                    "management"
                                                        ? "border-purple-500 bg-purple-50 text-purple-700"
                                                        : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                                                }`}
                                                onClick={() =>
                                                    setDepartmentType(
                                                        "management",
                                                    )
                                                }
                                            >
                                                <Building
                                                    className="inline-block mr-2"
                                                    size={16}
                                                />
                                                Управление
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Выберите из существующих 1
                                </label>

                                {/* Поле поиска */}
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        placeholder="Поиск..."
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onClick={() => setSearchTerm("")}
                                    />
                                </div>

                                {/* Красивый список */}
                                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                                    {(() => {
                                        console.log("newNodeType", newNodeType);
                                        let items = [] as any[];
                                        if (
                                            newNodeType ===
                                            NODE_TYPES.ORGANIZATION
                                        ) {
                                            items = organizations || [];
                                        } else if (
                                            newNodeType === NODE_TYPES.EMPLOYEE
                                        ) {
                                            items = employees ?? [];
                                        } else if (
                                            newNodeType ===
                                            NODE_TYPES.DEPARTMENT
                                        ) {
                                            items =
                                                departments?.filter(
                                                    (dept: any) =>
                                                        departmentType ===
                                                        "department"
                                                            ? !dept.isManagment
                                                            : dept.isManagment,
                                                ) || [];
                                        } else if (
                                            newNodeType === NODE_TYPES.POSITION
                                        ) {
                                            items = positions || [];
                                        }
                                        console.log(employees);
                                        // Фильтруем по поисковому термину
                                        const filteredItems = items.filter(
                                            (item: any) => {
                                                const name =
                                                    item?.name ||
                                                    item?.fullName;
                                                return name
                                                    ?.toLowerCase()
                                                    .includes(
                                                        searchTerm.toLowerCase(),
                                                    );
                                            },
                                        );

                                        return filteredItems.length > 0 ? (
                                            filteredItems.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                                                        selectedExistingId ===
                                                        item.id
                                                            ? "bg-blue-50 border-blue-300"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedExistingId(
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </div>
                                                    {item.logoPath && (
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            Лого:{" "}
                                                            {item.logoPath}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-gray-500 text-center">
                                                {searchTerm
                                                    ? "Ничего не найдено"
                                                    : "Нет доступных элементов"}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Выберите сотрудника
                                </label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedExistingId || ""}
                                    onChange={(e) =>
                                        setSelectedExistingId(
                                            Number(e.target.value),
                                        )
                                    }
                                >
                                    <option value="">Выберите...</option>
                                    {employees?.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={async () => {
                                    if (
                                        editNodeId &&
                                        window.confirm(
                                            "Вы уверены, что хотите удалить этот блок? Это действие нельзя отменить.",
                                        )
                                    ) {
                                        try {
                                            await apiRequest(
                                                `/api/org-units/${editNodeId}`,
                                                {
                                                    method: "DELETE",
                                                },
                                            );

                                            // Обновляем кэш
                                            queryClient.invalidateQueries({
                                                queryKey: ["/api/org-units"],
                                            });

                                            setShowEditModal(false);
                                            setEditNodeId(null);
                                            setEditNodeType("");
                                            setSelectedEditItemId(null);
                                        } catch (error) {
                                            console.error(
                                                "Ошибка при удалении блока:",
                                                error,
                                            );
                                            alert(
                                                "Ошибка при удалении блока. Возможно, у блока есть дочерние элементы.",
                                            );
                                        }
                                    }
                                }}
                            >
                                Удалить
                            </button>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                onClick={() => setShowAddModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={handleCreateNode}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для назначения сотрудника */}
            {showAssignEmployeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-lg font-medium mb-4">
                            Назначить сотрудника
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Сотрудник
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedEmployeeId || ""}
                                onChange={(e) =>
                                    setSelectedEmployeeId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            >
                                <option value="">Выберите сотрудника</option>
                                {employees?.map((employee) => (
                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Должность
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedPositionId || ""}
                                onChange={(e) =>
                                    setSelectedPositionId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            >
                                <option value="">Выберите до �жность</option>
                                {positions?.map((position) => (
                                    <option
                                        key={position.id}
                                        value={position.id}
                                    >
                                        {position.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                onClick={() => {
                                    setShowAssignEmployeeModal(false);
                                    setSelectedEmployeeId(null);
                                    setSelectedPositionId(null);
                                    setSelectedUnitId(null);
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={handleAssignEmployee}
                                disabled={!selectedEmployeeId}
                            >
                                Назначить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для редактирования узла */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                                Редактировать ячейку
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowEditModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Название
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editNodeName}
                                onChange={(e) =>
                                    setEditNodeName(e.target.value)
                                }
                                placeholder="Введите название..."
                            />
                        </div>

                        {/* Дополнительные поля для управления */}
                        {(() => {
                            return (
                                isManagement && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Руководящая должность
                                            </label>
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedPositionId || ""}
                                                onChange={(e) =>
                                                    setSelectedPositionId(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Выберите должность
                                                </option>
                                                {positions?.map((position) => (
                                                    <option
                                                        key={position.id}
                                                        value={position.id}
                                                    >
                                                        {position.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Назначить сотрудника
                                            </label>
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedEmployeeId || ""}
                                                onChange={(e) =>
                                                    setSelectedEmployeeId(
                                                        e.target.value
                                                            ? Number(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Выберите сотрудника
                                                </option>
                                                {employees?.map((employee) => (
                                                    <option
                                                        key={employee.id}
                                                        value={employee.id}
                                                    >
                                                        {employee.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )
                            );
                        })()}

                        <div className="flex justify-between">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                                onClick={handleDeleteNode}
                            >
                                <Trash size={16} className="mr-1" />
                                Удалить
                            </button>

                            <div className="flex space-x-2">
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Отмена
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    onClick={handleUpdateNode}
                                    disabled={!editNodeName.trim()}
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для управления сотрудниками в управлениях */}
            {showManagementEmployeesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Управление сотрудниками
                            </h3>
                            <button
                                onClick={() => {
                                    setShowManagementEmployeesModal(false);
                                    setSelectedManagementForEmployees(null);
                                    setSelectedEmployeeForManagement(null);
                                    setSelectedPositionForManagement(null);
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Список назначенных руководителей */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Назначенный руководитель
                            </label>
                            <div className="border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                                {(() => {
                                    const unitAssignments =
                                        employeeAssignments?.filter(
                                            (assignment) =>
                                                assignment.orgUnitId ===
                                                selectedManagementForEmployees,
                                        ) || [];

                                    return unitAssignments.length > 0 ? (
                                        unitAssignments.map((assignment) => {
                                            const employee = employees?.find(
                                                (emp) =>
                                                    emp.id ===
                                                    assignment.employeeId,
                                            );
                                            return (
                                                employee && (
                                                    <div
                                                        key={assignment.id}
                                                        className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                                                    >
                                                        <div className="text-sm">
                                                            <div className="font-medium">
                                                                {
                                                                    employee.fullName
                                                                }
                                                            </div>
                                                            <div className="text-gray-500 text-xs">
                                                                {(() => {
                                                                    const position =
                                                                        positions?.find(
                                                                            (
                                                                                pos,
                                                                            ) =>
                                                                                pos.id ===
                                                                                assignment.positionId,
                                                                        );
                                                                    return (
                                                                        position?.name ||
                                                                        "Должность не указана"
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                            onClick={async () => {
                                                                try {
                                                                    await apiRequest(
                                                                        `/api/employee-positions/${assignment.employeeId}/${assignment.orgUnitId}`,
                                                                        {
                                                                            method: "DELETE",
                                                                        },
                                                                    );
                                                                    queryClient.invalidateQueries(
                                                                        {
                                                                            queryKey:
                                                                                [
                                                                                    "/api/employee-positions",
                                                                                ],
                                                                        },
                                                                    );
                                                                    // Обновляем данные организационной структуры
                                                                    queryClient.invalidateQueries(
                                                                        {
                                                                            queryKey:
                                                                                [
                                                                                    "/api/org-units",
                                                                                ],
                                                                        },
                                                                    );
                                                                } catch (error) {
                                                                    console.error(
                                                                        "Ошибка при удалении назначения:",
                                                                        error,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                )
                                            );
                                        })
                                    ) : (
                                        <div className="p-3 text-gray-500 text-center text-sm">
                                            Руководитель не назначен
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Добавление нового руководителя */}
                        {(() => {
                            const existingAssignments =
                                employeeAssignments?.filter(
                                    (assignment) =>
                                        assignment.orgUnitId ===
                                        selectedManagementForEmployees,
                                ) || [];

                            // Для управлений проверяем, что уже назначен только один человек
                            if (existingAssignments.length >= 1) {
                                return (
                                    <div className="mb-4">
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                                            На управление может быть назначен
                                            только один руководитель
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Выберите должность
                                        </label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={
                                                selectedPositionForManagement ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setSelectedPositionForManagement(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Выберите должность
                                            </option>
                                            {positions?.map((position) => (
                                                <option
                                                    key={position.id}
                                                    value={position.id}
                                                >
                                                    {position.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Выберите сотрудника
                                        </label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={
                                                selectedEmployeeForManagement ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setSelectedEmployeeForManagement(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Выберите сотрудника
                                            </option>
                                            {employees?.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.fullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                onClick={() => {
                                    setShowManagementEmployeesModal(false);
                                    setSelectedManagementForEmployees(null);
                                    setSelectedEmployeeForManagement(null);
                                    setSelectedPositionForManagement(null);
                                }}
                            >
                                Закрыть
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                onClick={async () => {
                                    if (
                                        selectedEmployeeForManagement &&
                                        selectedManagementForEmployees &&
                                        selectedPositionForManagement
                                    ) {
                                        try {
                                            await apiRequest(
                                                `/api/employee-positions`,
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        employeeId:
                                                            selectedEmployeeForManagement,
                                                        orgUnitId:
                                                            selectedManagementForEmployees,
                                                        positionId:
                                                            selectedPositionForManagement,
                                                    }),
                                                },
                                            );

                                            queryClient.invalidateQueries({
                                                queryKey: [
                                                    "/api/employee-positions",
                                                ],
                                            });
                                            // Обновляем данные организационной структуры
                                            queryClient.invalidateQueries({
                                                queryKey: ["/api/org-units"],
                                            });

                                            // Закрываем модальное окно и сбрасываем состояние
                                            setSelectedEmployeeForManagement(
                                                null,
                                            );
                                            setSelectedPositionForManagement(
                                                null,
                                            );
                                            setShowManagementEmployeesModal(
                                                false,
                                            );
                                            setSelectedManagementForEmployees(
                                                null,
                                            );

                                            console.log(
                                                "Руководитель успешно назначен на управление!",
                                            );
                                        } catch (error) {
                                            console.error(
                                                "Ошибка при назначении руководителя:",
                                                error,
                                            );
                                        }
                                    }
                                }}
                                disabled={
                                    !selectedEmployeeForManagement ||
                                    !selectedPositionForManagement
                                }
                            >
                                Назначить руководителя
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для управления сотрудниками должности */}
            {showPositionEmployeesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4">
                            Управление сотрудниками должности
                        </h3>

                        {/* Показываем назначенных сотрудников */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Назначенные сотрудники
                            </label>
                            <div className="border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                                {(() => {
                                    const selectedOrgUnit = orgUnits?.find(
                                        (unit) =>
                                            unit.id ===
                                            selectedPositionForEmployees,
                                    );

                                    if (selectedOrgUnit?.type === "position") {
                                        const positionId =
                                            selectedOrgUnit?.type_id;
                                        // Ищем сотрудников через employee_positions таблицу
                                        const positionAssignments =
                                            employeeAssignments?.filter(
                                                (assign) =>
                                                    assign.positionId ===
                                                    positionId,
                                            ) || [];

                                        const positionEmployees =
                                            positionAssignments
                                                .map((assignment) => {
                                                    return employees?.find(
                                                        (emp) =>
                                                            emp.id ===
                                                            assignment.employeeId,
                                                    );
                                                })
                                                .filter((emp) => emp); // Убираем undefined

                                        return positionEmployees.length > 0 ? (
                                            positionEmployees.map(
                                                (employee) => (
                                                    <div
                                                        key={employee.id}
                                                        className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                                                    >
                                                        <span className="text-sm">
                                                            {employee.fullName}
                                                        </span>
                                                        <button
                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                            onClick={async () => {
                                                                try {
                                                                    // Находим назначе �ие в employee_positions для удаления
                                                                    const assignmentToDelete =
                                                                        positionAssignments.find(
                                                                            (
                                                                                assign,
                                                                            ) =>
                                                                                assign.employeeId ===
                                                                                employee.id,
                                                                        );

                                                                    if (
                                                                        assignmentToDelete
                                                                    ) {
                                                                        await fetch(
                                                                            `/api/employee-positions/${assignmentToDelete.employeeId}/${assignmentToDelete.orgUnitId}`,
                                                                            {
                                                                                method: "DELETE",
                                                                            },
                                                                        );

                                                                        queryClient.invalidateQueries(
                                                                            {
                                                                                queryKey:
                                                                                    [
                                                                                        "/api/employee-positions",
                                                                                    ],
                                                                            },
                                                                        );
                                                                        queryClient.invalidateQueries(
                                                                            {
                                                                                queryKey:
                                                                                    [
                                                                                        "/api/org-units",
                                                                                    ],
                                                                            },
                                                                        );
                                                                    }
                                                                } catch (error) {
                                                                    console.error(
                                                                        "Ошибка при удалении сотрудника:",
                                                                        error,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="p-3 text-gray-500 text-center text-sm">
                                                Нет назначенных сотрудников
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>

                        {/* Добавление сотрудников с поиском и множественным выбором */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Добавить сотрудников
                            </label>

                            {/* Поле поиска */}
                            <input
                                type="text"
                                placeholder="Поиск сотрудников..."
                                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={employeeSearchTerm}
                                onChange={(e) =>
                                    setEmployeeSearchTerm(e.target.value)
                                }
                            />

                            {/* Список сотрудников с чекбоксами */}
                            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto bg-gray-50">
                                {employees
                                    ?.filter(
                                        (emp) =>
                                            !emp.positionId &&
                                            emp.fullName
                                                .toLowerCase()
                                                .includes(
                                                    employeeSearchTerm.toLowerCase(),
                                                ),
                                    )
                                    .map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center p-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`employee-${employee.id}`}
                                                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                checked={selectedEmployeeIds.includes(
                                                    employee.id,
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedEmployeeIds([
                                                            ...selectedEmployeeIds,
                                                            employee.id,
                                                        ]);
                                                    } else {
                                                        setSelectedEmployeeIds(
                                                            selectedEmployeeIds.filter(
                                                                (id) =>
                                                                    id !==
                                                                    employee.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`employee-${employee.id}`}
                                                className="flex-1 text-sm text-gray-700 cursor-pointer"
                                            >
                                                {employee.fullName}
                                            </label>
                                        </div>
                                    ))}
                                {employees?.filter(
                                    (emp) =>
                                        !emp.positionId &&
                                        emp.fullName
                                            .toLowerCase()
                                            .includes(
                                                employeeSearchTerm.toLowerCase(),
                                            ),
                                ).length === 0 && (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        {employeeSearchTerm
                                            ? "Сотрудники не найдены"
                                            : "Нет доступных сотрудников"}
                                    </div>
                                )}
                            </div>

                            {/* Показать количество выбранных */}
                            {selectedEmployeeIds.length > 0 && (
                                <div className="mt-2 text-sm text-blue-600">
                                    Выбрано сотрудников:{" "}
                                    {selectedEmployeeIds.length}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                onClick={() => {
                                    setShowPositionEmployeesModal(false);
                                    setSelectedPositionForEmployees(null);
                                    setSelectedEmployeeForAssignment(null);
                                    // Очищаем состояния нового интерфейса
                                    setSelectedEmployeeIds([]);
                                    setEmployeeSearchTerm("");
                                }}
                            >
                                Закрыть
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                onClick={async () => {
                                    if (
                                        selectedEmployeeIds.length > 0 &&
                                        selectedPositionForEmployees
                                    ) {
                                        try {
                                            const orgUnit = orgUnits?.find(
                                                (unit) =>
                                                    unit.id ===
                                                    selectedPositionForEmployees,
                                            );

                                            if (
                                                orgUnit &&
                                                orgUnit.type === "position"
                                            ) {
                                                // Назначаем всех выбранных сотрудников через employee_positions
                                                for (const employeeId of selectedEmployeeIds) {
                                                    await fetch(
                                                        `/api/employee-positions`,
                                                        {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type":
                                                                    "application/json",
                                                            },
                                                            body: JSON.stringify(
                                                                {
                                                                    employeeId:
                                                                        employeeId,
                                                                    orgUnitId:
                                                                        selectedPositionForEmployees, // id организационной единицы
                                                                    positionId:
                                                                        orgUnit.type_id, // id должности
                                                                    isHead: false,
                                                                },
                                                            ),
                                                        },
                                                    );
                                                }

                                                queryClient.invalidateQueries({
                                                    queryKey: [
                                                        "/api/employee-positions",
                                                    ],
                                                });
                                                // Обновляем данные организационной структуры
                                                queryClient.invalidateQueries({
                                                    queryKey: [
                                                        "/api/org-units",
                                                    ],
                                                });
                                                console.log(
                                                    `Назначено сотрудников: ${selectedEmployeeIds.length}`,
                                                );
                                            }

                                            // Очищаем состояние
                                            setSelectedEmployeeIds([]);
                                            setEmployeeSearchTerm("");
                                            setSelectedEmployeeForAssignment(
                                                null,
                                            );
                                            setShowPositionEmployeesModal(
                                                false,
                                            );
                                            setSelectedPositionForEmployees(
                                                null,
                                            );
                                        } catch (error) {
                                            console.error(
                                                "Ошибка при назначении сотрудников:",
                                                error,
                                            );
                                        }
                                    }
                                }}
                                disabled={selectedEmployeeIds.length === 0}
                            >
                                Назначить ({selectedEmployeeIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования блока */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">
                                Редактировать блок
                            </h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditNodeId(null);
                                    setEditNodeType("");
                                    setSelectedEditItemId(null);
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editNodeType === "position" &&
                                    "Выберите должность"}
                                {editNodeType === "department" &&
                                    "Выберите отдел"}
                                {editNodeType === "management" &&
                                    "Выберите управление"}
                                {editNodeType === "organization" &&
                                    "Выберите организацию"}
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedEditItemId || ""}
                                onChange={(e) =>
                                    setSelectedEditItemId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            >
                                <option value="">Выберите...</option>
                                {editNodeType === "position" &&
                                    positions?.map((position: any) => (
                                        <option
                                            key={position.id}
                                            value={position.id}
                                        >
                                            {position.name}
                                        </option>
                                    ))}
                                {editNodeType === "department" &&
                                    departments?.map((department: any) => (
                                        <option
                                            key={department.id}
                                            value={department.id}
                                        >
                                            {department.name}
                                        </option>
                                    ))}
                                {editNodeType === "management" &&
                                    managements?.map((management: any) => (
                                        <option
                                            key={management.id}
                                            value={management.id}
                                        >
                                            {management.name}
                                        </option>
                                    ))}
                                {editNodeType === "organization" &&
                                    organizations?.map((organization: any) => (
                                        <option
                                            key={organization.id}
                                            value={organization.id}
                                        >
                                            {organization.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditNodeId(null);
                                    setEditNodeType("");
                                    setSelectedEditItemId(null);
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                onClick={(e) => {
                                    e.preventDefault();
                                    void handleDeleteBlock();
                                }}
                            >
                                Удалить
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={async () => {
                                    if (editNodeId && selectedEditItemId) {
                                        try {
                                            await apiRequest(
                                                `/api/org-units/${editNodeId}`,
                                                {
                                                    method: "PUT",
                                                    body: JSON.stringify({
                                                        type_id:
                                                            selectedEditItemId,
                                                    }),
                                                },
                                            );

                                            // Обновляем кэш
                                            queryClient.invalidateQueries({
                                                queryKey: ["/api/org-units"],
                                            });

                                            setShowEditModal(false);
                                            setEditNodeId(null);
                                            setEditNodeType("");
                                            setSelectedEditItemId(null);
                                        } catch (error) {
                                            console.error(
                                                "Ошибка при редактировании блока:",
                                                error,
                                            );
                                        }
                                    }
                                }}
                                disabled={!selectedEditItemId}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
