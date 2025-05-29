import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ManagementBlock from "./ManagementBlock";
import {
  Plus,
  Briefcase,
  Building,
  Users,
  UserCircle,
  User,
  UserPlus,
  Edit,
  Trash,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

// Интерфейс для узла из БД
interface OrgUnit {
  id: number;
  type: string;
  type_id: number;
  parentId: number | null;
  positionX: number;
  positionY: number;
  headEmployeeId?: number | null;
}

// Интерфейс для сотрудника
interface Employee {
  id: number;
  fullName: string;
  positionId?: number | null;
}

// Интерфейс для должности
interface Position {
  id: number;
  name: string;
}

// Интерфейс для узла дерева в UI
interface TreeNode {
  id: number;
  title: string;
  position: { x: number; y: number };
  parentId: number | null;
  type: string;
  headEmployee?: Employee | null;
  headPosition?: Position | null;
}

// Типы узлов дерева
const NODE_TYPES = {
  DEPARTMENT: "department",
  MANAGEMENT: "management",
  POSITION: "position",
  ORGANIZATION: "organization",
};

export default function SimpleDragTree() {
  const queryClient = useQueryClient();

  // Загрузка узлов из БД
  const { data: orgUnits, isLoading: isLoadingOrgUnits } = useQuery<OrgUnit[]>({
    queryKey: ["/api/org-units"],
    queryFn: () => fetch("/api/org-units").then((res) => res.json()),
  });

  // Загрузка сотрудников из БД
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<
    Employee[]
  >({
    queryKey: ["/api/employees"],
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
    queryFn: () => fetch("/api/employee-positions").then((res) => res.json()),
  });

  // Трансформация данных из БД в формат узлов дерева
  const [nodes, setNodes] = useState<TreeNode[]>([]);

  // Состояние для показа выпадающих меню добавления
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);

  // Состояние для модального окна создания нового узла
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(
    null,
  );
  const [isManagement, setIsManagement] = useState(false);
  const [departmentType, setDepartmentType] = useState<
    "department" | "management"
  >("department");
  const [searchTerm, setSearchTerm] = useState("");

  // Состояние для модального окна назначения сотрудника
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );

  // Состояние для группового перетаскивания
  const [groupDragMode, setGroupDragMode] = useState<number | null>(null);
  const [lastClickTime, setLastClickTime] = useState<{ [key: number]: number }>(
    {},
  );

  // Состояние для отображения линий выравнивания
  const [alignmentLines, setAlignmentLines] = useState<{
    horizontal: number[];
    vertical: number[];
  }>({ horizontal: [], vertical: [] });

  // Функция для получения всех дочерних узлов
  const getChildNodes = (parentId: number): TreeNode[] => {
    const children: TreeNode[] = [];
    nodes.forEach((node) => {
      if (node.parentId === parentId) {
        children.push(node);
        children.push(...getChildNodes(node.id));
      }
    });
    return children;
  };

  // Функция для обработки двойного клика
  const handleNodeClick = (nodeId: number) => {
    const currentTime = Date.now();
    const lastTime = lastClickTime[nodeId] || 0;

    if (currentTime - lastTime < 300) {
      // Двойной клик за 300мс
      setGroupDragMode(nodeId);
      console.log(`Включен режим группового перетаскивания для узла ${nodeId}`);
    } else {
      setGroupDragMode(null);
    }

    setLastClickTime((prev) => ({
      ...prev,
      [nodeId]: currentTime,
    }));
  };

  // Функция для вычисления линий выравнивания
  const calculateAlignmentLines = (
    draggedNodeId: number,
    currentPosition: { x: number; y: number },
  ) => {
    const SNAP_THRESHOLD = 10; // Порог привязки в пикселях
    const horizontalLines: number[] = [];
    const verticalLines: number[] = [];

    nodes.forEach((node) => {
      if (node.id === draggedNodeId) return;

      // Для горизонтального выравнивания - используем центр ячейки (по X)
      const nodeCenter = {
        x: node.position.x + 100, // Половина ширины узла (200px)
      };

      // Для вертикального выравнивания - используем верхний край ячейки (по Y)
      const nodeTop = {
        y: node.position.y, // Верхний край узла
      };

      const draggedCenter = {
        x: currentPosition.x + 100, // Центр перетаскиваемого узла
      };

      const draggedTop = {
        y: currentPosition.y, // Верхний край перетаскиваемого узла
      };

      // Проверяем горизонтальное выравнивание (по верхнему краю Y)
      if (Math.abs(nodeTop.y - draggedTop.y) < SNAP_THRESHOLD) {
        horizontalLines.push(nodeTop.y);
      }

      // Проверяем вертикальное выравнивание (по центру X)
      if (Math.abs(nodeCenter.x - draggedCenter.x) < SNAP_THRESHOLD) {
        verticalLines.push(nodeCenter.x);
      }
    });

    setAlignmentLines({
      horizontal: horizontalLines.filter(
        (value, index, self) => self.indexOf(value) === index,
      ), // Убираем дубли
      vertical: verticalLines.filter(
        (value, index, self) => self.indexOf(value) === index,
      ),
    });
  };

  const [alignedNodes, setAlignedNodes] = useState<{ [id: number]: boolean }>(
    {},
  );

  // Состояние для модального окна редактирования узла
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNodeId, setEditNodeId] = useState<number | null>(null);
  const [editNodeName, setEditNodeName] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(
    null,
  );
  const [selectedEmployeeForAssignment, setSelectedEmployeeForAssignment] =
    useState<number | null>(null);
  const [showPositionEmployeesModal, setShowPositionEmployeesModal] =
    useState(false);
  const [selectedPositionForEmployees, setSelectedPositionForEmployees] =
    useState<number | null>(null);

  // Отдельное состояние для модального окна управлений
  const [showManagementEmployeesModal, setShowManagementEmployeesModal] =
    useState(false);
  const [selectedManagementForEmployees, setSelectedManagementForEmployees] =
    useState<number | null>(null);
  const [selectedEmployeeForManagement, setSelectedEmployeeForManagement] =
    useState<number | null>(null);
  const [selectedPositionForManagement, setSelectedPositionForManagement] =
    useState<number | null>(null);

  // Состояние для отслеживания скрытых узлов
  const [hiddenNodes, setHiddenNodes] = useState<number[]>([]);

  // Состояние для масштабирования
  const [zoom, setZoom] = useState(1);

  // Состояние для масштабирования
  const [scale, setScale] = useState(1);

  // Загружаем данные из БД при их получении
  // Получение информации о сотрудниках с их должностями
  const getEmployeeWithPosition = useCallback(
    (employeeId?: number | null) => {
      if (!employeeId || !employees || !positions) return null;

      const employee = employees.find((e) => e.id === employeeId);
      if (!employee) return null;

      const position = positions.find((p) => p.id === employee.positionId);

      return {
        employee,
        position: position || null,
      };
    },
    [employees, positions],
  );

  // Обновление данных из БД при их получении
  useEffect(() => {
    if (orgUnits && orgUnits.length > 0 && employees && positions) {
      // Преобразуем узлы из БД в формат для отображения
      const treeNodes = orgUnits.map((unit) => {
        // Получаем информацию о сотруднике, если он назначен
        const employeeInfo = getEmployeeWithPosition(unit.headEmployeeId);

        return {
          id: unit.id,
          title: unit.name,
          position: {
            x: unit.positionX || 200 + unit.id * 100, // Если positionX не задан, используем расчетное значение
            y: unit.positionY || (unit.parentId ? 200 : 50), // Если positionY не задан, корневые узлы выше
          },
          parentId: unit.parentId,
          type: unit.type,
          headEmployee: employeeInfo ? employeeInfo.employee : null,
          headPosition: employeeInfo ? employeeInfo.position : null,
        };
      });

      setNodes(treeNodes);
    }
  }, [orgUnits, employees, positions, getEmployeeWithPosition]);

  // Для отрисовки линий соединения
  const nodeRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Функция для сохранения позиции в базе данных
  const saveNodePosition = async (id: number, x: number, y: number) => {
    try {
      // Используем апи для обновления узла организационной структуры
      const response = await fetch(`/api/org-units/${id}`, {
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
        console.error("Ошибка при сохранении позиции:", await response.text());
      }
    } catch (error) {
      console.error("Ошибка при обращении к API:", error);
    }
  };

  // Обновление позиции узла при перетаскивании (только локально)
  const handleDrag = (id: number, data: { x: number; y: number }) => {
    // Обновляем только локальное состояние во время перетаскивания
    setNodes(
      nodes.map((node) =>
        node.id === id ? { ...node, position: { x: data.x, y: data.y } } : node,
      ),
    );
  };

  // Сохранение позиции узла при завершении перетаскивания
  const handleDragStop = (id: number, data: { x: number; y: number }) => {
    // Сохраняем позицию узла в базе данных только при отпускании мыши
    saveNodePosition(id, data.x, data.y);
  };

  // Показать меню добавления для определенного узла
  const handleShowAddMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAddMenu((prevId) => (prevId === id ? null : id));
  };

  // Открытие модального окна для создания нового узла
  const handleOpenAddModal = (nodeType: string, parentNodeId: number) => {
    setNewNodeType(nodeType);
    setParentId(parentNodeId);
    setSelectedExistingId(null);
    setIsManagement(false);
    setShowAddModal(true);
    setShowAddMenu(null);
  };

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
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (node.id === selectedUnitId) {
              const updatedEmployee = employees?.find(
                (e) => e.id === selectedEmployeeId,
              );
              const updatedPosition = positions?.find(
                (p) => p.id === selectedPositionId,
              );
              return {
                ...node,
                headEmployee: updatedEmployee || null,
                headPosition: updatedPosition || null,
              };
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

  // Создание нового узла в БД
  // Функция для открытия модального окна редактирования
  const handleOpenEditModal = (nodeId: number) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditNodeId(nodeId);
      setEditNodeName(node.title);
      setShowEditModal(true);
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

          console.log("Отправляем назначение сотрудника:", assignmentData);

          const response = await fetch(`/api/employee-positions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assignmentData),
          });

          if (response.ok) {
            // Обновляем данные
            queryClient.invalidateQueries({ queryKey: ["/api/org-units"] });
            queryClient.invalidateQueries({ queryKey: ["/api/employees"] });

            setShowEditModal(false);
            setEditNodeId(null);
            setEditNodeName("");
            setSelectedEmployeeId(null);
            setSelectedPositionId(null);
            return;
          } else {
            const errorText = await response.text();
            console.error("Ошибка при назначении сотрудника:", errorText);
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
        console.error("Ошибка при удалении узла:", await response.text());
      }
    } catch (error) {
      console.error("Ошибка при обращении к API:", error);
    }
  };

  const handleCreateNode = async () => {
    if (!selectedExistingId) return;

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
      selectedItem = positions?.find((item) => item.id === selectedExistingId);
    }

    if (!selectedItem) return;

    try {
      // Определяем флаги на основе типа
      const isOrganization = newNodeType === NODE_TYPES.ORGANIZATION;
      const isDepartment = newNodeType === NODE_TYPES.DEPARTMENT;
      const isManagement = newNodeType === NODE_TYPES.MANAGEMENT;
      const isPosition = newNodeType === NODE_TYPES.POSITION;

      // Координаты для нового узла
      const parentNode = nodes.find((node) => node.id === parentId);
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
          parentId: parentId,
          staffCount: 1,
          positionX: posX,
          positionY: posY,
        }),
      });

      if (response.ok) {
        const newNode = await response.json();

        // Обновляем список узлов локально, используя имя выбранного элемента
        const selectedItemName = selectedItem?.name || "Новый узел";
        setNodes((prevNodes) => [
          ...prevNodes,
          {
            id: newNode.id,
            title: selectedItemName,
            position: { x: posX, y: posY },
            parentId: newNode.parentId,
            type: newNode.type,
          },
        ]);

        // Принудительно обновляем данные соответствующего типа
        if (newNodeType === "organization") {
          queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
        } else if (newNodeType === "department") {
          queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
        } else if (newNodeType === "management") {
          queryClient.invalidateQueries({ queryKey: ["/api/managements"] });
        } else if (newNodeType === "position") {
          queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
        }

        // Закрываем модальное окно и сбрасываем состояния
        setShowAddModal(false);
        setShowAddMenu(null);
        setSelectedExistingId(null);
        setNewNodeType("");
        setParentId(null);
      } else {
        console.error("Ошибка при создании узла:", await response.text());
      }
    } catch (error) {
      console.error("Ошибка при обращении к API:", error);
    }
  };

  // Отрисовка соединительных линий
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#94a3b8";
    context.lineWidth = 2;

    nodes.forEach((node) => {
      if (node.parentId) {
        const parent = nodes.find((n) => n.id === node.parentId);
        // Проверяем, что узел и его родитель не скрыты
        if (
          parent &&
          nodeRefs.current[parent.id] &&
          nodeRefs.current[node.id] &&
          !hiddenNodes.includes(node.parentId as number) &&
          !hiddenNodes.includes(node.id) &&
          // Дополнительная проверка, что элементы действительно видимы в DOM
          nodeRefs.current[parent.id]?.offsetParent !== null &&
          nodeRefs.current[node.id]?.offsetParent !== null
        ) {
          const parentEl = nodeRefs.current[parent.id];
          const childEl = nodeRefs.current[node.id];

          if (parentEl && childEl) {
            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const fromX =
              (parentRect.left + parentRect.width / 2 - containerRect.left) /
              scale;
            const fromY =
              (parentRect.top + parentRect.height - containerRect.top) / scale;

            const toX =
              (childRect.left + childRect.width / 2 - containerRect.left) /
              scale;
            const toY = (childRect.top - containerRect.top) / scale;

            const middleY = fromY + (toY - fromY) / 2;

            context.beginPath();
            context.moveTo(fromX, fromY);
            context.lineTo(fromX, middleY);
            context.lineTo(toX, middleY);
            context.lineTo(toX, toY);
            context.stroke();
          }
        }
      }
    });

    // Отрисовка линий выравнивания
    if (
      alignmentLines.horizontal.length > 0 ||
      alignmentLines.vertical.length > 0
    ) {
      context.save();
      context.strokeStyle = "#3b82f6"; // Синий цвет для линий выравнивания
      context.lineWidth = 1;
      context.setLineDash([5, 5]); // Пунктирная линия

      // Горизонтальные линии выравнивания
      alignmentLines.horizontal.forEach((y) => {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      });

      // Вертикальные линии выравнивания
      alignmentLines.vertical.forEach((x) => {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      });

      context.restore();
    }
  }, [nodes, scale, alignmentLines]);

  if (isLoadingOrgUnits || isLoadingEmployees) {
    return (
      <div className="flex items-center justify-center h-full">Загрузка...</div>
    );
  }

  // Обработчик события колесика мыши для масштабирования
  const handleWheel = (e: React.WheelEvent) => {
    // Предотвращаем стандартное поведение прокрутки
    e.preventDefault();
    e.stopPropagation();

    // Определяем направление прокрутки
    const delta = e.deltaY > 0 ? -0.1 : 0.1;

    // Ограничиваем масштаб в пределах от 0.5 до 2.0
    const newScale = Math.min(Math.max(scale + delta, 0.5), 2.0);

    setScale(newScale);
  };

  return (
    <div
      className="main-tree-block relative w-full h-full bg-gray-50 overflow-auto"
      onWheel={handleWheel}
    >
      {/* Область дерева с зумом */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          position: "relative",
          padding: `${16 / scale}px`,
        }}
        onWheel={handleWheel}
      >
        {/* Канвас для линий связи */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Узлы дерева */}
        {nodes.map(
          (node) =>
            // Скрываем узлы, родители которых находятся в списке скрытых
            !hiddenNodes.includes(node.parentId as number) && (
              <Draggable
                key={node.id}
                position={node.position}
                onDrag={(e, data) => {
                  // Вычисляем линии выравнивания
                  calculateAlignmentLines(node.id, data);

                  // Если включен групповой режим для этого узла, перемещаем его с дочерними
                  if (groupDragMode === node.id) {
                    const childNodes = getChildNodes(node.id);
                    const deltaX = data.x - node.position.x;
                    const deltaY = data.y - node.position.y;

                    // Обновляем позицию родительского узла
                    setNodes((prevNodes) =>
                      prevNodes.map((n) =>
                        n.id === node.id
                          ? { ...n, position: { x: data.x, y: data.y } }
                          : n,
                      ),
                    );

                    // Обновляем позиции всех дочерних узлов
                    setNodes((prevNodes) =>
                      prevNodes.map((n) => {
                        const isChild = childNodes.some(
                          (child) => child.id === n.id,
                        );
                        if (isChild) {
                          return {
                            ...n,
                            position: {
                              x: n.position.x + deltaX,
                              y: n.position.y + deltaY,
                            },
                          };
                        }
                        return n;
                      }),
                    );
                  } else {
                    handleDrag(node.id, data);
                  }

                  const currentY = data.y;

                  const siblings = nodes.filter(
                    (n) => n.parentId === node.parentId && n.id !== node.id,
                  );

                  const isAligned = siblings.some((s) => {
                    const siblingEl = nodeRefs.current[s.id];
                    return (
                      siblingEl && Math.abs(siblingEl.offsetTop - currentY) < 3
                    );
                  });

                  setAlignedNodes((prev) => ({
                    ...prev,
                    [node.id]: isAligned,
                  }));
                }}
                onStop={(e, data) => {
                  // Очищаем линии выравнивания
                  setAlignmentLines({ horizontal: [], vertical: [] });

                  // Если включен групповой режим для этого узла, сохраняем позиции дочерних элементов
                  if (groupDragMode === node.id) {
                    const childNodes = getChildNodes(node.id);

                    // Сохраняем позицию родительского узла
                    handleDragStop(node.id, data);

                    // Сохраняем позиции всех дочерних узлов с их текущими позициями
                    childNodes.forEach((child) => {
                      const currentChild = nodes.find((n) => n.id === child.id);
                      if (currentChild) {
                        handleDragStop(child.id, currentChild.position);
                      }
                    });

                    // Отключаем групповой режим после завершения перетаскивания
                    setGroupDragMode(null);
                  } else {
                    handleDragStop(node.id, data);
                  }
                }}
                bounds="parent"
              >
                <div
                  ref={(el) => (nodeRefs.current[node.id] = el)}
                  className={`absolute cursor-move p-4 rounded shadow ${
                    node.type === NODE_TYPES.ORGANIZATION
                      ? "bg-green-50 border-l-4 border-green-500"
                      : node.type === NODE_TYPES.DEPARTMENT
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : node.type === NODE_TYPES.MANAGEMENT
                          ? "bg-purple-50 border-l-4 border-purple-500"
                          : "bg-orange-50 border-l-4 border-orange-500"
                  }
              ${alignedNodes[node.id] ? "border border-dashed border-yellow-400" : ""}
              ${groupDragMode === node.id ? "ring-2 ring-blue-400 bg-blue-100" : ""}`}
                  style={{ width: 200 }}
                  onClick={() => handleNodeClick(node.id)}
                  onDragOver={(e) => {
                    // Разрешаем drop для всех типов блоков кроме организации
                    if (node.type !== NODE_TYPES.ORGANIZATION) {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#3b82f6";
                      e.currentTarget.style.borderWidth = "2px";
                      e.currentTarget.style.borderStyle = "dashed";
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.border = "";
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.style.border = "";

                    // Сбрасываем все стили drag & drop для всех элементов
                    const allNodes =
                      document.querySelectorAll('[style*="border"]');
                    allNodes.forEach((node) => {
                      if (node instanceof HTMLElement) {
                        node.style.border = "";
                        node.style.borderColor = "";
                        node.style.borderWidth = "";
                        node.style.borderStyle = "";
                      }
                    });

                    try {
                      const dragData = JSON.parse(
                        e.dataTransfer.getData("application/json"),
                      );

                      // Перемещение сотрудника между управлениями/отделами
                      if (
                        dragData.type === "assigned-employee" &&
                        (node.type === NODE_TYPES.MANAGEMENT ||
                          node.type === NODE_TYPES.DEPARTMENT) &&
                        dragData.sourceOrgUnitId !== node.id
                      ) {
                        // Получаем должность, назначенную в целевом блоке управления
                        const targetPositionId = node.headPosition?.id || null;

                        // Удаляем старое назначение
                        await apiRequest(
                          `/api/employee-positions/${dragData.employeeId}/${dragData.sourceOrgUnitId}`,
                          {
                            method: "DELETE",
                          },
                        );

                        // Создаем новое назначение с должностью из целевого блока управления
                        await apiRequest(`/api/employee-positions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            employeeId: dragData.employeeId,
                            orgUnitId: node.id,
                            positionId: targetPositionId,
                          }),
                        });

                        queryClient.invalidateQueries({
                          queryKey: ["/api/employee-positions"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["/api/employees"],
                        });
                        console.log(
                          "Сотрудник успешно перемещен между управлениями!",
                        );
                      }

                      // Перемещение сотрудника из должности в управление/отдел
                      else if (
                        dragData.type === "position-employee" &&
                        (node.type === NODE_TYPES.MANAGEMENT ||
                          node.type === NODE_TYPES.DEPARTMENT)
                      ) {
                        // Получаем должность, назначенную в целевом блоке управления
                        const targetPositionId = node.headPosition?.id || null;

                        // Сначала убираем сотрудника с должности
                        await apiRequest(
                          `/api/employees/${dragData.employeeId}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              positionId: null,
                            }),
                          },
                        );

                        // Затем назначаем его в управление с должностью из целевого блока
                        await apiRequest(`/api/employee-positions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            employeeId: dragData.employeeId,
                            orgUnitId: node.id,
                            positionId: targetPositionId,
                          }),
                        });

                        queryClient.invalidateQueries({
                          queryKey: ["/api/employee-positions"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["/api/employees"],
                        });
                        console.log(
                          "Сотрудник успешно перемещен из должности в управление!",
                        );
                      }

                      // Перемещение сотрудника в должность (желтый блок)
                      else if (
                        (dragData.type === "assigned-employee" ||
                          dragData.type === "position-employee") &&
                        node.type === NODE_TYPES.POSITION
                      ) {
                        const targetOrgUnit = orgUnits?.find(
                          (unit) => unit.id === node.id,
                        );
                        if (!targetOrgUnit) return;

                        // Если сотрудник из управления - удаляем старое назначение
                        if (dragData.type === "assigned-employee") {
                          await apiRequest(
                            `/api/employee-positions/${dragData.employeeId}/${dragData.sourceOrgUnitId}`,
                            {
                              method: "DELETE",
                            },
                          );
                        }

                        // Назначаем сотрудника на новую должность
                        await apiRequest(
                          `/api/employees/${dragData.employeeId}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              positionId: targetOrgUnit.type_id,
                            }),
                          },
                        );

                        queryClient.invalidateQueries({
                          queryKey: ["/api/employee-positions"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["/api/employees"],
                        });
                        console.log(
                          "Сотрудник успешно перемещен на должность!",
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Ошибка при перемещении сотрудника:",
                        error,
                      );
                    }
                  }}
                >
                  {/* Кнопка редактирования в правом верхнем углу */}
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(node.id);
                    }}
                  >
                    <Edit size={14} />
                  </button>

                  {/* Кнопка управления сотрудниками для должностей */}
                  {node.type === "position" && (
                    <button
                      className="absolute top-2 right-8 text-blue-500 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPositionForEmployees(node.id);
                        setShowPositionEmployeesModal(true);
                      }}
                    >
                      <UserPlus size={14} />
                    </button>
                  )}

                  {/* Кнопка скрытия/показа дочерних элементов (глаз) */}
                  {nodes.some(
                    (childNode) => childNode.parentId === node.id,
                  ) && (
                    <button
                      className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Если узел в списке скрытых, удалить его оттуда, иначе добавить
                        const collectDescendants = (id: number): number[] => {
                          const children = nodes.filter(
                            (n) => n.parentId === id,
                          );
                          const descendantIds = children.flatMap((child) =>
                            collectDescendants(child.id),
                          );
                          return [id, ...descendantIds];
                        };

                        if (hiddenNodes.includes(node.id)) {
                          const descendants = collectDescendants(node.id);
                          setHiddenNodes(
                            hiddenNodes.filter(
                              (id) => !descendants.includes(id),
                            ),
                          );
                        } else {
                          const descendants = collectDescendants(node.id);
                          setHiddenNodes([...hiddenNodes, ...descendants]);
                        }
                      }}
                    >
                      {hiddenNodes.includes(node.id) ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  )}

                  <div className="font-medium text-sm">{node.title}</div>

                  {/* Список назначенных сотрудников для должностей */}
                  {node.type === "position" &&
                    (() => {
                      const positionOrgUnit = orgUnits?.find(
                        (unit) => unit.id === node.id,
                      );
                      const positionEmployees =
                        employees?.filter(
                          (emp) => emp.positionId === positionOrgUnit?.type_id,
                        ) || [];

                      return (
                        positionEmployees.length > 0 && (
                          <div className="mt-2 border-t pt-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Сотрудники:
                            </div>
                            <div className="space-y-1">
                              {positionEmployees.map((employee) => (
                                <div
                                  key={employee.id}
                                  className="text-xs bg-white px-2 py-1 rounded border cursor-move hover:bg-gray-50"
                                  draggable={true}
                                  onDragStart={(e) => {
                                    e.stopPropagation(); // Останавливаем всплытие события
                                    const originalNode = orgUnits?.find(
                                      (unit) => unit.id === node.id,
                                    );
                                    e.dataTransfer.setData(
                                      "application/json",
                                      JSON.stringify({
                                        type: "position-employee",
                                        employeeId: employee.id,
                                        sourcePositionId: originalNode?.type_id,
                                      }),
                                    );
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation(); // Предотвращаем активацию Draggable
                                  }}
                                  onDragEnd={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                    // Сбрасываем все стили drag & drop
                                    const allNodes =
                                      document.querySelectorAll(
                                        '[style*="border"]',
                                      );
                                    allNodes.forEach((node) => {
                                      if (node instanceof HTMLElement) {
                                        node.style.border = "";
                                      }
                                    });
                                  }}
                                >
                                  {employee.fullName}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}

                  {/* Информация о сотруднике и его должности */}
                  {node.headEmployee && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-xs font-medium">
                        {node.headEmployee.fullName.charAt(0)}
                      </div>
                      {node.headPosition && (
                        <div className="text-xs text-gray-500 italic">
                          {node.headPosition.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Отображение назначенных сотрудников для синих блоков управления и департаментов */}
                  {(node.type === NODE_TYPES.MANAGEMENT ||
                    node.type === NODE_TYPES.DEPARTMENT) &&
                    (() => {
                      const unitAssignments =
                        employeeAssignments?.filter(
                          (assignment) => assignment.orgUnitId === node.id,
                        ) || [];

                      return (
                        unitAssignments.length > 0 && (
                          <div className="mt-2 border-t pt-2">
                            <div className="text-xs text-gray-600 mb-1">
                              Назначенные:
                            </div>
                            <div className="space-y-1">
                              {unitAssignments.map((assignment) => {
                                const employee = employees?.find(
                                  (emp) => emp.id === assignment.employeeId,
                                );
                                const position = positions?.find(
                                  (pos) => pos.id === assignment.positionId,
                                );
                                return (
                                  employee && (
                                    <div
                                      key={assignment.id}
                                      className="text-xs bg-white px-2 py-1 rounded border cursor-move hover:bg-gray-50"
                                      draggable={true}
                                      onDragStart={(e) => {
                                        e.stopPropagation(); // Останавливаем всплытие события
                                        e.dataTransfer.setData(
                                          "application/json",
                                          JSON.stringify({
                                            type: "assigned-employee",
                                            employeeId: employee.id,
                                            sourceOrgUnitId:
                                              assignment.orgUnitId,
                                            positionId: assignment.positionId,
                                            assignmentId: assignment.id,
                                          }),
                                        );
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      onMouseDown={(e) => {
                                        e.stopPropagation(); // Предотвращаем активацию Draggable
                                      }}
                                      onDragEnd={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                        // Сбрасываем все стили drag & drop
                                        const allNodes =
                                          document.querySelectorAll(
                                            '[style*="border"]',
                                          );
                                        allNodes.forEach((node) => {
                                          if (node instanceof HTMLElement) {
                                            node.style.border = "";
                                          }
                                        });
                                      }}
                                    >
                                      <div className="font-medium">
                                        {employee.fullName}
                                      </div>
                                      {position && (
                                        <div className="text-gray-500 italic">
                                          {position.name}
                                        </div>
                                      )}
                                    </div>
                                  )
                                );
                              })}
                            </div>
                          </div>
                        )
                      );
                    })()}

                  {/* Кнопка User+ для управлений и департаментов */}
                  {(node.type === NODE_TYPES.MANAGEMENT ||
                    node.type === NODE_TYPES.DEPARTMENT) && (
                    <button
                      className="absolute top-2 right-8 text-blue-500 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedManagementForEmployees(node.id);
                        setShowManagementEmployeesModal(true);
                      }}
                    >
                      <UserPlus size={14} />
                    </button>
                  )}

                  {/* Кнопка добавления с выпадающим меню */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <button
                      className="bg-white rounded-full border border-gray-300 p-1 hover:bg-gray-100"
                      onClick={(e) => handleShowAddMenu(node.id, e)}
                    >
                      <Plus size={14} />
                    </button>

                    {/* Выпадающее меню добавления */}
                    {showAddMenu === node.id && (
                      <div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white rounded-lg shadow-xl border border-gray-300 p-2 z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
                        style={{ zIndex: 9999 }}
                      >
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 bg-green-100 rounded-full hover:bg-green-200"
                            title="Добавить организацию"
                            onClick={() =>
                              handleOpenAddModal(
                                NODE_TYPES.ORGANIZATION,
                                node.id,
                              )
                            }
                          >
                            <Building size={16} />
                          </button>
                          <button
                            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"
                            title="Добавить отдел"
                            onClick={() =>
                              handleOpenAddModal(NODE_TYPES.DEPARTMENT, node.id)
                            }
                          >
                            <Users size={16} />
                          </button>
                          <button
                            className="p-2 bg-orange-100 rounded-full hover:bg-orange-200"
                            title="Добавить должность"
                            onClick={() =>
                              handleOpenAddModal(NODE_TYPES.POSITION, node.id)
                            }
                          >
                            <Briefcase size={16} />
                          </button>
                          <button
                            className="p-2 bg-purple-100 rounded-full hover:bg-purple-200"
                            title="Добавить сотрудника"
                            onClick={() =>
                              handleOpenAddModal("EMPLOYEE", node.id)
                            }
                          >
                            <UserCircle size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Draggable>
            ),
        )}
      </div>

      {/* Модальные окна (вне области зума) */}
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
                          departmentType === "department"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                        onClick={() => setDepartmentType("department")}
                      >
                        <Users className="inline-block mr-2" size={16} />
                        Отдел
                      </button>
                      <button
                        type="button"
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                          departmentType === "management"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                        }`}
                        onClick={() => setDepartmentType("management")}
                      >
                        <Building className="inline-block mr-2" size={16} />
                        Управление
                      </button>
                    </div>
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите из существующих
                </label>

                {/* Поле поиска */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={() => setSearchTerm("")}
                  />
                </div>

                {/* Красивый список */}
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                  {(() => {
                    let items: any[] = [];

                    if (newNodeType === NODE_TYPES.ORGANIZATION) {
                      items = organizations || [];
                    } else if (newNodeType === NODE_TYPES.DEPARTMENT) {
                      items =
                        departments?.filter((dept: any) =>
                          departmentType === "department"
                            ? !dept.isManagment
                            : dept.isManagment,
                        ) || [];
                    } else if (newNodeType === NODE_TYPES.POSITION) {
                      items = positions || [];
                    }

                    // Фильтруем по поисковому термину
                    const filteredItems = items.filter((item: any) =>
                      item.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    );

                    return filteredItems.length > 0 ? (
                      filteredItems.map((item: any) => (
                        <div
                          key={item.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                            selectedExistingId === item.id
                              ? "bg-blue-50 border-blue-300"
                              : ""
                          }`}
                          onClick={() => setSelectedExistingId(item.id)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.logoPath && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Лого: {item.logoPath}
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
                    setSelectedExistingId(Number(e.target.value))
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
            <h3 className="text-lg font-medium mb-4">Назначить сотрудника</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сотрудник
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEmployeeId || ""}
                onChange={(e) =>
                  setSelectedEmployeeId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Выберите сотрудника</option>
                {employees?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
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
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">Выберите должность</option>
                {positions?.map((position) => (
                  <option key={position.id} value={position.id}>
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
              <h3 className="text-lg font-medium">Редактировать ячейку</h3>
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
                onChange={(e) => setEditNodeName(e.target.value)}
                placeholder="Введите название..."
              />
            </div>

            {/* Дополнительные поля для управления */}
            {(() => {
              const editNode = nodes.find((n) => n.id === editNodeId);
              // Проверяем, является ли это управлением (department с isManagement=true)
              const isManagement = editNode?.type === "department";
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
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">Выберите должность</option>
                        {positions?.map((position) => (
                          <option key={position.id} value={position.id}>
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
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">Выберите сотрудника</option>
                        {employees?.map((employee) => (
                          <option key={employee.id} value={employee.id}>
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

      {/* Модальное окно для управления сотрудниками должности */}
      {showPositionEmployeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Управление сотрудниками 1</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowPositionEmployeesModal(false);
                  setSelectedPositionForEmployees(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Список привязанных сотрудников */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {(() => {
                  const selectedOrgUnit = orgUnits?.find(
                    (unit) => unit.id === selectedPositionForEmployees,
                  );
                  return selectedOrgUnit?.type === "position"
                    ? "Назначенные сотрудники"
                    : "Назначенный руководитель";
                })()}
              </label>
              <div className="border border-gray-300 rounded-md max-h-32 overflow-y-auto">
                {(() => {
                  const selectedOrgUnit = orgUnits?.find(
                    (unit) => unit.id === selectedPositionForEmployees,
                  );

                  if (selectedOrgUnit?.type === "position") {
                    // Логика для должностей (как было)
                    const positionId = selectedOrgUnit?.type_id;
                    const positionEmployees =
                      employees?.filter(
                        (emp) => emp.positionId === positionId,
                      ) || [];

                    return positionEmployees.length > 0 ? (
                      positionEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                        >
                          <span className="text-sm">{employee.fullName}</span>
                          <button
                            className="text-red-500 hover:text-red-700 text-xs"
                            onClick={async () => {
                              try {
                                await apiRequest(
                                  `/api/employees/${employee.id}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ positionId: null }),
                                  },
                                );
                                queryClient.invalidateQueries({
                                  queryKey: ["/api/employees"],
                                });
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
                      ))
                    ) : (
                      <div className="p-3 text-gray-500 text-center text-sm">
                        Нет назначенных сотрудников
                      </div>
                    );
                  } else {
                    // Логика для управлений/департаментов
                    const unitAssignments =
                      employeeAssignments?.filter(
                        (assignment) =>
                          assignment.orgUnitId === selectedPositionForEmployees,
                      ) || [];

                    return unitAssignments.length > 0 ? (
                      unitAssignments.map((assignment) => {
                        const employee = employees?.find(
                          (emp) => emp.id === assignment.employeeId,
                        );
                        return (
                          employee && (
                            <div
                              key={assignment.id}
                              className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                            >
                              <span className="text-sm">
                                {employee.fullName}
                              </span>
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
                                    queryClient.invalidateQueries({
                                      queryKey: ["/api/employee-positions"],
                                    });
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
                        Нет назначенного руководителя
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Добавление нового сотрудника */}
            {(() => {
              const selectedOrgUnit = orgUnits?.find(
                (unit) => unit.id === selectedPositionForEmployees,
              );
              const isManagementUnit =
                selectedOrgUnit?.type === "department" ||
                selectedOrgUnit?.type === "management";
              const existingAssignments =
                employeeAssignments?.filter(
                  (assignment) =>
                    assignment.orgUnitId === selectedPositionForEmployees,
                ) || [];

              // Для управлений проверяем, что уже назначен только один человек
              if (isManagementUnit && existingAssignments.length >= 1) {
                return (
                  <div className="mb-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                      На управление может быть назначен только один руководитель
                    </div>
                  </div>
                );
              }

              return (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isManagementUnit
                      ? "Назначить руководителя"
                      : "Добавить сотрудника"}
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployeeForAssignment || ""}
                    onChange={(e) =>
                      setSelectedEmployeeForAssignment(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Выберите сотрудника</option>
                    {employees
                      ?.filter((emp) => !emp.positionId)
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.fullName}
                        </option>
                      ))}
                  </select>
                </div>
              );
            })()}

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowPositionEmployeesModal(false);
                  setSelectedPositionForEmployees(null);
                  setSelectedEmployeeForAssignment(null);
                }}
              >
                Закрыть
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={async () => {
                  if (
                    selectedEmployeeForAssignment &&
                    selectedPositionForEmployees
                  ) {
                    try {
                      const orgUnit = orgUnits?.find(
                        (unit) => unit.id === selectedPositionForEmployees,
                      );

                      if (orgUnit && orgUnit.type === "position") {
                        // Логика для должностей (как было)
                        await apiRequest(
                          `/api/employees/${selectedEmployeeForAssignment}`,
                          {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              positionId: orgUnit.type_id,
                            }),
                          },
                        );

                        queryClient.invalidateQueries({
                          queryKey: ["/api/employees"],
                        });
                        console.log("Сотрудник успешно назначен на должность!");
                      } else if (
                        orgUnit &&
                        (orgUnit.type === "department" ||
                          orgUnit.type === "management")
                      ) {
                        // Логика для управлений и департаментов
                        await apiRequest(`/api/employee-positions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            employeeId: selectedEmployeeForAssignment,
                            orgUnitId: selectedPositionForEmployees,
                          }),
                        });

                        queryClient.invalidateQueries({
                          queryKey: ["/api/employee-positions"],
                        });
                        console.log(
                          "Руководитель успешно назначен на управление!",
                        );
                      }

                      // Закрываем модальное окно и сбрасываем состояние
                      setSelectedEmployeeForAssignment(null);
                      setShowPositionEmployeesModal(false);
                      setSelectedPositionForEmployees(null);
                    } catch (error) {
                      console.error("Ошибка при назначении сотрудника:", error);
                    }
                  }
                }}
                disabled={!selectedEmployeeForAssignment}
              >
                {(() => {
                  const selectedOrgUnit = orgUnits?.find(
                    (unit) => unit.id === selectedPositionForEmployees,
                  );
                  return selectedOrgUnit?.type === "department" ||
                    selectedOrgUnit?.type === "management"
                    ? "Назначить руководителя"
                    : "Добавить";
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для управления сотрудниками в управлениях */}
      {showManagementEmployeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Управление сотрудниками</h3>
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
                        assignment.orgUnitId === selectedManagementForEmployees,
                    ) || [];

                  return unitAssignments.length > 0 ? (
                    unitAssignments.map((assignment) => {
                      const employee = employees?.find(
                        (emp) => emp.id === assignment.employeeId,
                      );
                      return (
                        employee && (
                          <div
                            key={assignment.id}
                            className="px-3 py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center"
                          >
                            <span className="text-sm">{employee.fullName}</span>
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
                                  queryClient.invalidateQueries({
                                    queryKey: ["/api/employee-positions"],
                                  });
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
                    assignment.orgUnitId === selectedManagementForEmployees,
                ) || [];

              // Для управлений проверяем, что уже назначен только один человек
              if (existingAssignments.length >= 1) {
                return (
                  <div className="mb-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                      На управление может быть назначен только один руководитель
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
                      value={selectedPositionForManagement || ""}
                      onChange={(e) =>
                        setSelectedPositionForManagement(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Выберите должность</option>
                      {positions?.map((position) => (
                        <option key={position.id} value={position.id}>
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
                      value={selectedEmployeeForManagement || ""}
                      onChange={(e) =>
                        setSelectedEmployeeForManagement(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Выберите сотрудника</option>
                      {employees
                        ?.filter((emp) => !emp.positionId)
                        .map((employee) => (
                          <option key={employee.id} value={employee.id}>
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
                      await apiRequest(`/api/employee-positions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          employeeId: selectedEmployeeForManagement,
                          orgUnitId: selectedManagementForEmployees,
                          positionId: selectedPositionForManagement,
                        }),
                      });

                      queryClient.invalidateQueries({
                        queryKey: ["/api/employee-positions"],
                      });

                      // Закрываем модальное окно и сбрасываем состояние
                      setSelectedEmployeeForManagement(null);
                      setSelectedPositionForManagement(null);
                      setShowManagementEmployeesModal(false);
                      setSelectedManagementForEmployees(null);

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
    </div>
  );
}
