import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";

type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

type Position = {
  position_id: number;
  name: string;
  positionName?: string;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  department_id: number;
}

// Вертикальная линия-соединитель
const VerticalLine = () => {
  return <div className="org-vertical-line"></div>;
};

// Карточка для верхней должности
const TopPositionCard = ({ title, name }: { title: string, name: string }) => {
  return (
    <div className="top-position">
      <div className="top-position-title">{title}</div>
      <div className="position-divider"></div>
      <div className="top-position-name">{name}</div>
    </div>
  );
};

// Карточка для должности
const PositionCard = ({ title, name, isMain = false }: { title: string, name: string, isMain?: boolean }) => {
  return (
    <div className={`position-card ${isMain ? 'main' : ''}`}>
      <div className="position-title">{title}</div>
      <div className="position-divider"></div>
      <div className="position-name">{name}</div>
    </div>
  );
};

// Карточка департамента
const DepartmentCard = ({ name, positions, employees }: { 
  name: string, 
  positions: Position[], 
  employees: Employee[] 
}) => {
  return (
    <div className="department-group">
      <div className="department-card">
        <div className="department-title">{name}</div>
      </div>
      
      <div className="position-employees-list">
        {positions.map((position) => {
          const positionEmployees = employees.filter(emp => emp.position_id === position.position_id);
          return positionEmployees.map(employee => (
            <div key={`${position.position_id}-${employee.employee_id}`} className="position-employee-card">
              <div className="position-title-small">{position.name}</div>
              <div className="position-divider-small"></div>
              <div className="position-name-small">{employee.full_name}</div>
            </div>
          ));
        })}
      </div>
    </div>
  );
};

// Дочерний отдел
const ChildDepartment = ({ 
  name, 
  positions, 
  employees, 
  childDepartments 
}: { 
  name: string, 
  positions: Position[], 
  employees: Employee[],
  childDepartments?: Department[] 
}) => {
  return (
    <div className="child-department">
      <div className="child-department-card">
        <div className="department-title">{name}</div>
      </div>
      
      <div className="position-employees-list">
        {positions.map((position) => {
          const positionEmployees = employees.filter(emp => emp.position_id === position.position_id);
          return positionEmployees.map(employee => (
            <div key={`${position.position_id}-${employee.employee_id}`} className="position-employee-card">
              <div className="position-title-small">{position.name}</div>
              <div className="position-divider-small"></div>
              <div className="position-name-small">{employee.full_name}</div>
            </div>
          ));
        })}
      </div>
      
      {childDepartments && childDepartments.length > 0 && (
        <div className="deep-children">
          {childDepartments.map(dept => (
            <div key={dept.department_id} className="deep-child">
              {dept.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrganizationTree: React.FC = () => {
  // Загрузка отделов из БД
  const { data: departmentsResponse } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });
  const departments = departmentsResponse?.data || [];

  // Загрузка должностей из БД
  const { data: positionsResponse } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  const positions = positionsResponse?.data || [];

  // Загрузка сотрудников из БД
  const { data: employeesResponse } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });
  const employees = employeesResponse?.data || [];

  // Находим топовых сотрудников (без родительских отделов - высший менеджмент)
  const topDepartments = departments.filter(dept => dept.parent_department_id === null);
  
  // Строим структуру организации
  const buildOrgStructure = () => {
    // Находим топовых руководителей (директора и т.д.)
    const topManagers = employees.filter(emp => {
      const empPosition = positions.find(pos => pos.position_id === emp.position_id);
      return empPosition && (
        empPosition.name.toLowerCase().includes('директор') || 
        empPosition.name.toLowerCase().includes('руководител')
      );
    });

    // Для демонстрации - используем первые два руководителя для верхнего уровня
    const topLevel = topManagers.slice(0, 2);
    const genDirector = topLevel[0];
    const execDirector = topLevel[1];

    // Получаем позиции руководителей
    const genDirectorPosition = positions.find(pos => pos.position_id === genDirector?.position_id);
    const execDirectorPosition = positions.find(pos => pos.position_id === execDirector?.position_id);

    // Находим отделы второго уровня
    const secondLevelDepartments = departments.filter(dept => topDepartments.some(top => top.department_id === dept.parent_department_id));
    
    // Получаем левую и правую ветви (20% и 80%)
    const leftSideDepartments = secondLevelDepartments.slice(0, Math.ceil(secondLevelDepartments.length * 0.2));
    const rightSideDepartments = secondLevelDepartments.slice(Math.ceil(secondLevelDepartments.length * 0.2));

    // Формируем дочерние отделы для каждого отдела второго уровня
    const getChildDepartments = (parentId: number) => {
      return departments.filter(dept => dept.parent_department_id === parentId);
    };

    // Получаем должности для отдела
    const getDepartmentPositions = (deptId: number) => {
      const deptEmployees = employees.filter(emp => emp.department_id === deptId);
      const positionIds = [...new Set(deptEmployees.map(emp => emp.position_id))];
      return positions.filter(pos => positionIds.includes(pos.position_id));
    };

    // Получаем сотрудников для отдела
    const getDepartmentEmployees = (deptId: number) => {
      return employees.filter(emp => emp.department_id === deptId);
    };

    // Формируем левую сторону структуры
    const leftSide = leftSideDepartments.map(dept => {
      const deptPositions = getDepartmentPositions(dept.department_id);
      const deptEmployees = getDepartmentEmployees(dept.department_id);
      const children = getChildDepartments(dept.department_id).map(childDept => {
        const childPositions = getDepartmentPositions(childDept.department_id);
        const childEmployees = getDepartmentEmployees(childDept.department_id);
        const deepChildren = getChildDepartments(childDept.department_id);
        
        return {
          ...childDept,
          positions: childPositions,
          employees: childEmployees,
          children: deepChildren
        };
      });

      return {
        ...dept,
        positions: deptPositions,
        employees: deptEmployees,
        children
      };
    });

    // Формируем правую сторону структуры
    const rightSide = rightSideDepartments.map(dept => {
      const deptPositions = getDepartmentPositions(dept.department_id);
      const deptEmployees = getDepartmentEmployees(dept.department_id);
      const children = getChildDepartments(dept.department_id).map(childDept => {
        const childPositions = getDepartmentPositions(childDept.department_id);
        const childEmployees = getDepartmentEmployees(childDept.department_id);
        
        return {
          ...childDept,
          positions: childPositions,
          employees: childEmployees
        };
      });

      return {
        ...dept,
        positions: deptPositions,
        employees: deptEmployees,
        children
      };
    });

    return {
      topPosition: {
        title: topManagers[2]?.position_id 
          ? (positions.find(p => p.position_id === topManagers[2].position_id)?.name || "ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА")
          : "ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА",
        name: topManagers[2]?.full_name || "Иванов Иван Иванович"
      },
      level1: [
        {
          title: genDirectorPosition?.name || "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР",
          name: genDirector?.full_name || "Василий Иванович Васильев",
          width: "80%"
        },
        {
          title: execDirectorPosition?.name || "ИСПОЛНИТЕЛЬНЫЙ ДИРЕКТОР",
          name: execDirector?.full_name || "Петров Петр Петрович",
          width: "20%"
        }
      ],
      level2: {
        left: leftSide,
        right: rightSide
      }
    };
  };

  // Построение организационной структуры на основе данных из БД
  const [organizationData, setOrganizationData] = useState<any>(null);

  useEffect(() => {
    if (departments.length > 0 && positions.length > 0 && employees.length > 0) {
      const orgData = buildOrgStructure();
      setOrganizationData(orgData);
    }
  }, [departments, positions, employees]);

  // Если данные еще не загружены, показываем сообщение о загрузке
  if (!organizationData) {
    return <div className="loading-message">Загрузка структуры организации...</div>;
  }

  return (
    <div className="org-tree-container">
      {/* Верхний уровень: ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА */}
      <div className="org-tree-top">
        <TopPositionCard 
          title={organizationData.topPosition.title} 
          name={organizationData.topPosition.name} 
        />
        <VerticalLine />
      </div>
      
      {/* Уровень 1: ГЕНЕРАЛЬНЫЙ ДИРЕКТОР и ИСПОЛНИТЕЛЬНЫЙ ДИРЕКТОР */}
      <div className="org-level-1">
        <div 
          className="org-right-branch" 
          style={{ width: organizationData.level1[0].width }}
        >
          <PositionCard 
            title={organizationData.level1[0].title} 
            name={organizationData.level1[0].name} 
            isMain 
          />
        </div>
        
        <div 
          className="org-left-branch" 
          style={{ width: organizationData.level1[1].width }}
        >
          <PositionCard 
            title={organizationData.level1[1].title} 
            name={organizationData.level1[1].name} 
          />
        </div>
      </div>
      
      {/* Уровень 2: Департаменты */}
      <div className="org-level-2">
        {/* Левая ветвь от ИСПОЛНИТЕЛЬНОГО ДИРЕКТОРА */}
        <div className="branch-group" style={{ width: "20%" }}>
          {organizationData.level2.left.map((dept: any, index: number) => (
            <div key={`left-${index}`} className="branch" style={{ width: `${100/organizationData.level2.left.length}%` }}>
              <DepartmentCard 
                name={dept.name}
                positions={dept.positions}
                employees={dept.employees}
              />
              
              {dept.children && dept.children.length > 0 && (
                <div className="department-children">
                  <div className="child-departments">
                    {dept.children.map((childDept: any, childIndex: number) => (
                      <ChildDepartment 
                        key={`left-child-${index}-${childIndex}`}
                        name={childDept.name}
                        positions={childDept.positions}
                        employees={childDept.employees}
                        childDepartments={childDept.children}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Правая ветвь от ГЕНЕРАЛЬНОГО ДИРЕКТОРА */}
        <div className="branch-group" style={{ width: "80%" }}>
          {organizationData.level2.right.map((dept: any, index: number) => (
            <div 
              key={`right-${index}`} 
              className="branch" 
              style={{ width: index < 2 ? "35%" : "15%" }}
            >
              <DepartmentCard 
                name={dept.name}
                positions={dept.positions}
                employees={dept.employees}
              />
              
              {dept.children && dept.children.length > 0 && (
                <div className="department-children">
                  <div className="child-departments">
                    {dept.children.map((childDept: any, childIndex: number) => (
                      <ChildDepartment 
                        key={`right-child-${index}-${childIndex}`}
                        name={childDept.name}
                        positions={childDept.positions}
                        employees={childDept.employees}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationTree;