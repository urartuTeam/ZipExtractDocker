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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
    Plus,
    Building,
    Users,
    UserCircle,
    Briefcase,
    Edit,
    UserPlus,
} from "lucide-react";

// Типы узлов дерева
const NODE_TYPES = {
    DEPARTMENT: "department",
    MANAGEMENT: "management",
    POSITION: "position",
    ORGANIZATION: "organization",
};

// Интерфейсы для данных
interface OrgUnit {
    id: number;
    type: string;
    type_id: number;
    parent_id: number | null;
    position_x: number;
    position_y: number;
    head_employee_id?: number | null;
    head_position_id?: number | null;
    title: string;
    position: { x: number; y: number };
}

// Кастомный узел для организационной единицы
const OrgUnitNode = ({ data }: { data: any }) => {
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

            {/* Отображение назначенных сотрудников */}
            {data.employees && data.employees.length > 0 && (
                <div className="mt-1 text-xs text-blue-600">
                    {data.employees.map((emp: any, idx: number) => (
                        <div key={idx} className="font-medium">
                            {emp.full_name}
                        </div>
                    ))}
                </div>
            )}

            {data.type === "position" && (!data.employees || data.employees.length === 0) && (
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
                    e.stopPropagation();
                    if (data.onEdit) {
                        data.onEdit(data.id, data.type, data.type_id || 1);
                    }
                }}
            >
                <Edit size={14} />
            </button>

            {/* Кнопка управления сотрудниками */}
            <button
                className="absolute top-8 right-2 text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (data.onManageEmployees) {
                        data.onManageEmployees(data.id);
                    }
                }}
            >
                <UserPlus size={14} />
            </button>

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
                        onClick={() => handleAddChild("management")}
                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить управление"
                    >
                        <UserCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleAddChild("position")}
                        className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                        title="Добавить должность"
                    >
                        <Briefcase className="w-4 h-4" />
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

// Начальные узлы
const initialNodes: Node[] = [
    {
        id: "1",
        type: "orgUnit",
        position: { x: 250, y: 25 },
        data: {
            label: "Корневая организация",
            type: "organization",
            onAddChild: () => {},
            onEdit: () => {},
            onManageEmployees: () => {},
        },
    },
];

const initialEdges: Edge[] = [];

export default function OrgFlowTree() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const nodeCounter = useRef(1000);

    // Состояния для модальных окон
    const [showEditModal, setShowEditModal] = useState(false);
    const [editNodeId, setEditNodeId] = useState<number | null>(null);
    const [editNodeType, setEditNodeType] = useState<string>("");

    const queryClient = useQueryClient();

    // Загрузка данных организационных единиц
    const { data: orgUnitsData, isLoading } = useQuery({
        queryKey: ["/api/org-units"],
        enabled: false, // Пока отключим, создадим API позже
    });

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    // Обработчики для добавления дочерних узлов
    const handleAddChild = useCallback((parentId: string, childType: string) => {
        const newNodeId = `${nodeCounter.current++}`;
        const parentNode = nodes.find(n => n.id === parentId);
        
        if (!parentNode) return;

        const newNode: Node = {
            id: newNodeId,
            type: "orgUnit",
            position: {
                x: parentNode.position.x + (Math.random() - 0.5) * 200,
                y: parentNode.position.y + 150,
            },
            data: {
                label: `Новый ${childType}`,
                type: childType,
                onAddChild: handleAddChild,
                onEdit: handleEdit,
                onManageEmployees: handleManageEmployees,
            },
        };

        const newEdge: Edge = {
            id: `${parentId}-${newNodeId}`,
            source: parentId,
            target: newNodeId,
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
    }, [nodes, setNodes, setEdges]);

    // Обработчик редактирования узла
    const handleEdit = useCallback((nodeId: string, nodeType: string, typeId: number) => {
        setEditNodeId(Number(nodeId));
        setEditNodeType(nodeType);
        setShowEditModal(true);
    }, []);

    // Обработчик управления сотрудниками
    const handleManageEmployees = useCallback((nodeId: string) => {
        console.log("Управление сотрудниками для узла:", nodeId);
        // Здесь будет логика для управления сотрудниками
    }, []);

    // Обновляем обработчики в узлах
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onAddChild: handleAddChild,
                    onEdit: handleEdit,
                    onManageEmployees: handleManageEmployees,
                },
            }))
        );
    }, [handleAddChild, handleEdit, handleManageEmployees]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background variant={"dots" as any} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}