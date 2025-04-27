import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

// Данные для тестового отображения
const organizationData = {
  topPosition: {
    title: "ЗАМЕСТИТЕЛЬ РУКОВОДИТЕЛЯ ДЕПАРТАМЕНТА",
    name: "Иванов Иван Иванович"
  },
  level1: [
    {
      title: "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР",
      name: "Василий Иванович Васильев",
      width: "80%"
    },
    {
      title: "ИСПОЛНИТЕЛЬНЫЙ ДИРЕКТОР",
      name: "Петров Петр Петрович",
      width: "20%"
    }
  ],
  level2: {
    left: [
      {
        name: "Отдел продаж",
        positions: [
          { position_id: 8, name: "Руководитель отдела продаж" },
          { position_id: 15, name: "Менеджер по продажам" }
        ],
        employees: [
          { employee_id: 8, full_name: "Морозов Виталий Андреевич", position_id: 8, department_id: 8 },
          { employee_id: 20, full_name: "Егоров Евгений Олегович", position_id: 15, department_id: 8 }
        ],
        children: [
          {
            name: "Отдел работы с ключевыми клиентами",
            positions: [
              { position_id: 15, name: "Менеджер по продажам" }
            ],
            employees: [
              { employee_id: 21, full_name: "Захаров Павел Андреевич", position_id: 15, department_id: 20 }
            ],
            children: [
              { department_id: 22, name: "Группа сопровождения государственных клиентов", parent_department_id: 17 },
              { department_id: 23, name: "Группа сопровождения корпоративных клиентов", parent_department_id: 17 }
            ]
          },
          {
            name: "Отдел по работе с регионами",
            positions: [
              { position_id: 15, name: "Менеджер по продажам" }
            ],
            employees: [
              { employee_id: 22, full_name: "Тимофеев Денис Игоревич", position_id: 15, department_id: 21 }
            ]
          }
        ]
      },
      {
        name: "Отдел маркетинга",
        positions: [
          { position_id: 9, name: "Руководитель отдела маркетинга" },
          { position_id: 16, name: "Маркетолог" }
        ],
        employees: [
          { employee_id: 9, full_name: "Волков Дмитрий Сергеевич", position_id: 9, department_id: 9 },
          { employee_id: 23, full_name: "Кузнецова Мария Сергеевна", position_id: 16, department_id: 9 }
        ]
      }
    ],
    right: [
      {
        name: "Дирекция по продуктам",
        positions: [
          { position_id: 4, name: "Директор по продуктам" }
        ],
        employees: [
          { employee_id: 4, full_name: "Сидоров Сидор Сидорович", position_id: 4, department_id: 4 }
        ],
        children: [
          {
            name: "Отдел аналитики",
            positions: [
              { position_id: 10, name: "Руководитель отдела аналитики" },
              { position_id: 11, name: "Аналитик" }
            ],
            employees: [
              { employee_id: 10, full_name: "Лебедев Алексей Викторович", position_id: 10, department_id: 10 },
              { employee_id: 11, full_name: "Козлов Игорь Владимирович", position_id: 11, department_id: 10 }
            ]
          },
          {
            name: "Отдел управления продуктами",
            positions: [
              { position_id: 12, name: "Специалист по продуктам" }
            ],
            employees: [
              { employee_id: 13, full_name: "Морозова Екатерина Александровна", position_id: 12, department_id: 13 }
            ]
          }
        ]
      },
      {
        name: "Дирекция по развитию",
        positions: [
          { position_id: 5, name: "Директор по развитию" }
        ],
        employees: [
          { employee_id: 5, full_name: "Кузнецов Александр Николаевич", position_id: 5, department_id: 5 }
        ],
        children: [
          {
            name: "Отдел инноваций",
            positions: [
              { position_id: 13, name: "Директор по инновациям" }
            ],
            employees: [
              { employee_id: 15, full_name: "Соколова Ольга Викторовна", position_id: 13, department_id: 15 }
            ]
          },
          {
            name: "Отдел международного сотрудничества",
            positions: [
              { position_id: 14, name: "Специалист по развитию" }
            ],
            employees: [
              { employee_id: 16, full_name: "Федоров Максим Андреевич", position_id: 14, department_id: 16 }
            ]
          }
        ]
      },
      {
        name: "Управление производства",
        positions: [
          { position_id: 6, name: "Руководитель управления производства" }
        ],
        employees: [
          { employee_id: 6, full_name: "Смирнов Василий Игоревич", position_id: 6, department_id: 6 }
        ]
      },
      {
        name: "Управление контроля качества",
        positions: [
          { position_id: 7, name: "Руководитель управления контроля качества" }
        ],
        employees: [
          { employee_id: 7, full_name: "Соколов Андрей Петрович", position_id: 7, department_id: 7 }
        ]
      }
    ]
  }
};

const OrganizationTree: React.FC = () => {
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
          {organizationData.level2.left.map((dept, index) => (
            <div key={`left-${index}`} className="branch" style={{ width: `${100/organizationData.level2.left.length}%` }}>
              <DepartmentCard 
                name={dept.name}
                positions={dept.positions}
                employees={dept.employees}
              />
              
              {dept.children && dept.children.length > 0 && (
                <div className="department-children">
                  <div className="child-departments">
                    {dept.children.map((childDept, childIndex) => (
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
          {organizationData.level2.right.map((dept, index) => (
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
                    {dept.children.map((childDept, childIndex) => (
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