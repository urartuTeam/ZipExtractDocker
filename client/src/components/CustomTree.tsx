import React, { useState, useEffect } from "react";

// Определяем типы здесь, чтобы избежать проблем с импортом
interface Department {
  department_id: number;
  name: string;
  parent_department_id: number | null;
  parent_position_id: number | null;
  is_organization?: boolean;
  logo_path?: string | null;
}

interface Position {
  position_id: number;
  name: string;
  parent_position_id?: number | null;
  department_id?: number | null;
}

interface Employee {
  employee_id: number;
  full_name: string;
  position_id: number | null;
  department_id: number | null;
  manager_id: number | null;
}

// Создаем интерфейс для узла в иерархии
interface PositionNode {
  position: Position;
  employees: Employee[];
  children: PositionNode[];
  department?: Department;
}

// Интерфейс для пропсов компонента
interface CustomTreeProps {
  departments: Department[];
  positions: any[]; // Используем any для совместимости с positionsWithDepartments
  employees: Employee[];
  showThreeLevels?: boolean;
  onPositionClick?: (positionId: number) => void;
}

const PositionCard = ({ 
  node, 
  level = 0, 
  onPositionClick 
}: { 
  node: PositionNode; 
  level?: number;
  onPositionClick?: (positionId: number) => void;
}) => {
  const isOrganization = node.department?.is_organization;
  const backgroundColor = isOrganization ? "#f0f0f0" : "#ffffff";
  
  const handleClick = () => {
    if (onPositionClick) {
      onPositionClick(node.position.position_id);
    }
  };
  
  return (
    <div 
      className="position-card" 
      style={{ 
        backgroundColor, 
        padding: '8px', 
        margin: '4px', 
        borderRadius: '4px', 
        border: '1px solid #ddd',
        cursor: onPositionClick ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      <h3>{node.position.name}</h3>
      {node.employees.length > 0 && (
        <div>
          <strong>Сотрудники:</strong>
          <ul>
            {node.employees.map((emp) => (
              <li key={emp.employee_id}>{emp.full_name}</li>
            ))}
          </ul>
        </div>
      )}
      {node.children.length > 0 && level < 3 && (
        <div style={{ marginLeft: "20px" }}>
          {node.children.map((child) => (
            <PositionCard 
              key={child.position.position_id} 
              node={child} 
              level={level + 1} 
              onPositionClick={onPositionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomTree: React.FC<CustomTreeProps> = ({ departments, positions, employees, showThreeLevels = true, onPositionClick }) => {
  const [hierarchy, setHierarchy] = useState<PositionNode[]>([]);

  useEffect(() => {
    if (departments.length === 0 || positions.length === 0) {
      return;
    }

    // Находим Заместителя руководителя департамента
    const zamPosition = positions.find(p => p.name === "Заместитель руководителя департамента");
    if (!zamPosition) {
      console.log("Не найдена должность 'Заместитель руководителя департамента'");
      return;
    }

    // Находим Генерального директора
    const genDirector = positions.find(p => p.name === "Генеральный директор");
    if (!genDirector) {
      console.log("Не найдена должность 'Генеральный директор'");
      return;
    }

    // Находим организации
    const cifrolab = departments.find(d => d.name === "ООО \"Цифролаб\"");
    const msi = departments.find(d => d.name === "ГБУ МСИ");
    if (!cifrolab || !msi) {
      console.log("Не найдены организации ООО \"Цифролаб\" или ГБУ МСИ");
      return;
    }

    // Создаем узел для заместителя
    const zamNode: PositionNode = {
      position: zamPosition,
      employees: employees.filter(e => e.position_id === zamPosition.position_id),
      children: []
    };

    // Создаем узел для генерального директора
    const genDirectorNode: PositionNode = {
      position: genDirector,
      employees: employees.filter(e => e.position_id === genDirector.position_id),
      children: []
    };

    // Создаем узел для Цифролаб
    const cifrolabNode: PositionNode = {
      position: {
        position_id: cifrolab.department_id * 1000,
        name: cifrolab.name
      },
      employees: [],
      children: [genDirectorNode],
      department: cifrolab
    };

    // Находим детей для МСИ
    const msiChildren = departments.filter(d => d.parent_department_id === msi.department_id);
    console.log(`Для ГБУ МСИ найдено ${msiChildren.length} дочерних отделов`);

    // Создаем узел для МСИ
    const msiNode: PositionNode = {
      position: {
        position_id: msi.department_id * 1000,
        name: msi.name
      },
      employees: [],
      children: msiChildren.map(child => ({
        position: {
          position_id: child.department_id * 1000,
          name: child.name
        },
        employees: [],
        children: [],
        department: child
      })),
      department: msi
    };

    // Собираем вместе иерархию
    zamNode.children = [cifrolabNode, msiNode];

    setHierarchy([zamNode]);
  }, [departments, positions, employees]);

  if (departments.length === 0 || positions.length === 0) {
    return <div>Загрузка данных...</div>;
  }

  if (hierarchy.length === 0) {
    return <div>Построение организационной структуры...</div>;
  }

  return (
    <div className="custom-tree">
      <h2>Организационная структура</h2>
      <div className="tree-container">
        {hierarchy.map(node => (
          <PositionCard 
            key={node.position.position_id} 
            node={node} 
            onPositionClick={onPositionClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomTree;
