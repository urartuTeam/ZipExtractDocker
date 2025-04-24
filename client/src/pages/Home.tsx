import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronDown, Users, UserCircle, Building, User, LogInIcon } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import OrganizationTree from "@/components/OrganizationTree";

// Типы данных для структуры организации
type Department = {
  department_id: number;
  name: string;
  parent_department_id: number | null;
}

type Position = {
  position_id: number;
  name: string;
  department_id: number;
  staff_units: number;
  current_count: number;
  vacancies: number;
}

type Employee = {
  employee_id: number;
  full_name: string;
  position_id: number;
  manager_id: number | null;
  department_id: number;
  email?: string;
  phone?: string;
}

type PositionDepartment = {
  position_link_id: number;
  position_id: number;
  department_id: number;
  sort: number;
}

export default function Home() {
  const { user } = useAuth();
  const [expandedDepartments, setExpandedDepartments] = useState<{[key: number]: boolean}>({1: true}); // Автоматически раскрываем корневой отдел
  const [expandedPositions, setExpandedPositions] = useState<{[key: string]: boolean}>({});

  // Запрос на получение общего количества отделов
  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<{status: string, data: Department[]}>({
    queryKey: ['/api/departments'],
  });

  // Запрос на получение общего количества сотрудников
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery<{status: string, data: Employee[]}>({
    queryKey: ['/api/employees'],
  });

  // Запрос на получение общего количества проектов
  const { data: projectsResponse, isLoading: isLoadingProjects } = useQuery<{status: string, data: any[]}>({
    queryKey: ['/api/projects'],
  });

  // Получаем данные должностей
  const { data: positionsResponse, isLoading: isLoadingPositions } = useQuery<{status: string, data: Position[]}>({
    queryKey: ['/api/positions'],
  });
  
  // Получаем данные о связях должностей и отделов
  const { data: positionDepartmentsResponse, isLoading: isLoadingPositionDepartments } = useQuery<{status: string, data: PositionDepartment[]}>({
    queryKey: ['/api/positiondepartments'],
  });

  const departments = departmentsResponse?.data || [];
  const employees = employeesResponse?.data || [];
  const positions = positionsResponse?.data || [];
  const positionDepartments = positionDepartmentsResponse?.data || [];
  
  const isLoading = isLoadingDepartments || isLoadingEmployees || isLoadingProjects || isLoadingPositions || isLoadingPositionDepartments;

  const toggleDepartment = (departmentId: number) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [departmentId]: !prev[departmentId]
    }));
  };
  
  const togglePosition = (positionDepartmentKey: string) => {
    setExpandedPositions(prev => ({
      ...prev,
      [positionDepartmentKey]: !prev[positionDepartmentKey]
    }));
  };
  
  // Получаем корневые отделы (без родителя)
  const getRootDepartments = () => {
    return departments?.filter(dept => dept.parent_department_id === null) || [];
  };

  // Получаем следующий уровень отделов (первые подчиненные администрации)
  const getFirstLevelDepartments = () => {
    const rootDepartments = getRootDepartments();
    if (rootDepartments.length === 0) return [];

    // Возвращаем подчиненные отделы администрации
    return departments?.filter(dept => 
      dept.parent_department_id === rootDepartments[0].department_id
    ) || [];
  };
  
  // Получаем дочерние отделы для указанного отдела
  const getChildDepartments = (parentId: number) => {
    return departments?.filter(dept => dept.parent_department_id === parentId) || [];
  };
  
  // Получаем должности для указанного отдела
  const getPositionsForDepartment = (departmentId: number) => {
    const positionLinks = positionDepartments?.filter(pd => pd.department_id === departmentId) || [];
    
    return positionLinks.map(link => {
      const position = positions?.find(p => p.position_id === link.position_id);
      return {
        ...link,
        positionName: position?.name || 'Неизвестная должность'
      };
    });
  };
  
  // Получаем сотрудников для указанной должности в указанном отделе
  const getEmployeesForPositionInDepartment = (positionId: number, departmentId: number) => {
    return employees?.filter(emp => 
      emp.position_id === positionId && emp.department_id === departmentId
    ) || [];
  };

  // Функция для рендеринга организационной структуры в виде более наглядного дерева
  const renderOrgTree = (department: Department) => {
    const positions = getPositionsForDepartment(department.department_id);
    const childDepartments = getChildDepartments(department.department_id);
    const isExpanded = expandedDepartments[department.department_id] || false;
    
    return (
      <div className="org-node">
        {/* Заголовок отдела */}
        <div 
          className="bg-[#a40000] text-white px-4 py-2 rounded-md cursor-pointer mb-2 flex items-center justify-between"
          onClick={() => toggleDepartment(department.department_id)}
        >
          <div className="font-bold">{department.name}</div>
          <div>
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 ml-2" /> : 
              <ChevronRight className="h-4 w-4 ml-2" />
            }
          </div>
        </div>
        
        {isExpanded && (
          <div className="pl-6 border-l-2 border-gray-300 ml-4">
            {/* Должности и сотрудники */}
            {positions.length > 0 && (
              <div className="mb-4">
                {positions.map(positionLink => {
                  const positionDeptKey = `${positionLink.position_id}-${department.department_id}`;
                  const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                  const positionEmployees = getEmployeesForPositionInDepartment(
                    positionLink.position_id, 
                    department.department_id
                  );
                  
                  return (
                    <div key={positionDeptKey} className="mb-2">
                      <div 
                        className="bg-[#f0e6e6] border-[#a40000] border px-3 py-1 rounded cursor-pointer flex items-center justify-between"
                        onClick={() => togglePosition(positionDeptKey)}
                      >
                        <div className="font-medium text-[#a40000]">{positionLink.positionName}</div>
                        <div>
                          {isPositionExpanded ? 
                            <ChevronDown className="h-4 w-4 ml-2 text-[#a40000]" /> : 
                            <ChevronRight className="h-4 w-4 ml-2 text-[#a40000]" />
                          }
                        </div>
                      </div>
                      
                      {isPositionExpanded && (
                        <div className="pl-4 border-l border-gray-300 ml-3 mt-1">
                          {positionEmployees.length > 0 ? (
                            positionEmployees.map(employee => (
                              <div 
                                key={employee.employee_id} 
                                className="bg-white border border-gray-200 px-3 py-1 rounded my-1 flex items-center"
                              >
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{employee.full_name}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500 italic py-1">Нет сотрудников</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Подчиненные отделы */}
            {childDepartments.length > 0 && (
              <div className="grid gap-4">
                {childDepartments.map((childDept, index) => (
                  <div key={`child-${childDept.department_id}-${index}`}>
                    {renderOrgTree(childDept)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Рендер отдела и его содержимого (старый способ)
  const renderDepartment = (department: Department, level: number = 0) => {
    const isExpanded = expandedDepartments[department.department_id] || false;
    const childDepartments = getChildDepartments(department.department_id);
    const positions = getPositionsForDepartment(department.department_id);
    
    return (
      <div key={`dept-${department.department_id}-${level}`} className="ml-4">
        <div 
          className="flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md"
          onClick={() => toggleDepartment(department.department_id)}
        >
          {isExpanded ? 
            <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
            <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
          }
          <Building className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{department.name}</span>
        </div>
        
        {isExpanded && (
          <div className="ml-6 border-l-2 border-neutral-200 pl-4 py-2">
            {/* Должности в отделе */}
            {positions.length > 0 ? (
              positions.map(positionLink => {
                const positionDeptKey = `${positionLink.position_id}-${department.department_id}`;
                const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                const positionEmployees = getEmployeesForPositionInDepartment(
                  positionLink.position_id, 
                  department.department_id
                );
                
                return (
                  <div key={positionDeptKey} className="mb-2">
                    <div 
                      className="flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md"
                      onClick={() => togglePosition(positionDeptKey)}
                    >
                      {isPositionExpanded ? 
                        <ChevronDown className="h-4 w-4 mr-2 text-neutral-500" /> : 
                        <ChevronRight className="h-4 w-4 mr-2 text-neutral-500" />
                      }
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      <span>{positionLink.positionName}</span>
                    </div>
                    
                    {isPositionExpanded && (
                      <div className="ml-6 border-l-2 border-neutral-200 pl-4 py-2">
                        {/* Сотрудники на должности */}
                        {positionEmployees.length > 0 ? (
                          positionEmployees.map(employee => (
                            <div 
                              key={employee.employee_id} 
                              className="flex items-center p-2 hover:bg-neutral-100 rounded-md"
                            >
                              <User className="h-5 w-5 mr-2 text-green-500" />
                              <span>{employee.full_name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-neutral-500 italic pl-7">Нет сотрудников на этой должности</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-neutral-500 italic pl-7">Нет должностей в этом отделе</div>
            )}
            
            {/* Дочерние отделы */}
            {childDepartments.length > 0 && (
              <div className="mt-4">
                <div className="font-medium mb-2 pl-2">Подчиненные отделы:</div>
                {childDepartments.map(childDept => renderDepartment(childDept, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Верхняя панель с логотипами и названием */}
      <div className="bg-[#a40000] text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 mr-2">
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="text-xl font-bold">ГРАДОСТРОИТЕЛЬНЫЙ КОМПЛЕКС</span>
        </div>
        
        <div className="text-center flex-1 text-2xl font-bold">
          Система управления персоналом
        </div>
        
        <div>
          {!user ? (
            <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <Link href="/auth">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Войти
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {user.username}
            </Button>
          )}
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        {/* Организационная структура */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-8 w-3/4 ml-4" />
              <Skeleton className="h-8 w-2/3 ml-8" />
              <Skeleton className="h-8 w-1/2 ml-8" />
            </div>
          ) : getFirstLevelDepartments().length > 0 ? (
            <div className="org-tree-container">
              {/* Полное дерево организации */}
              <div className="org-tree-view">
                {/* Генеральный директор */}
                <div className="org-tree-top">
                  <div className="org-node-card main">
                    <div className="org-node-header">ГЕНЕРАЛЬНЫЙ ДИРЕКТОР</div>
                  </div>
                  
                  {/* Вертикальная линия */}
                  <div className="org-vertical-line"></div>
                </div>
                
                {/* Руководство и Администрация */}
                <div className="org-tree-level-1">
                  {getRootDepartments().map((rootDept) => (
                    <div key={`level1-${rootDept.department_id}`} className="org-node-card">
                      <div className="org-node-header">{rootDept.name}</div>
                      
                      {/* Показываем должности для корневого отдела */}
                      <div className="org-node-positions">
                        {getPositionsForDepartment(rootDept.department_id).map((position) => {
                          const positionDeptKey = `${position.position_id}-${rootDept.department_id}`;
                          const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                          const employees = getEmployeesForPositionInDepartment(
                            position.position_id, 
                            rootDept.department_id
                          );
                          
                          return (
                            <div key={positionDeptKey} className="org-position">
                              <div 
                                className="org-position-header"
                                onClick={() => togglePosition(positionDeptKey)}
                              >
                                <span>{position.positionName}</span>
                                <span>
                                  {isPositionExpanded ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </span>
                              </div>
                              
                              {isPositionExpanded && employees.length > 0 && (
                                <div className="org-employees-list">
                                  {employees.map(employee => (
                                    <div key={employee.employee_id} className="org-employee">
                                      {employee.full_name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Вертикальная линия */}
                <div className="org-vertical-line"></div>
                
                {/* Уровень 2: Отделы, подчиненные Администрации и Руководству */}
                <div className="org-tree-level-2">
                  {getRootDepartments().map((rootDept) => (
                    <div key={`root-deps-${rootDept.department_id}`} className="org-subtree">
                      <div className="org-subtree-title">{rootDept.name}</div>
                      <div className="org-subtree-departments">
                        {getChildDepartments(rootDept.department_id).map((dept) => (
                          <div key={`dept-${dept.department_id}`} className="org-node-card">
                            <div className="org-node-header">{dept.name}</div>
                            
                            {/* Должности отдела */}
                            <div className="org-node-positions">
                              {getPositionsForDepartment(dept.department_id).map((position) => {
                                const positionDeptKey = `${position.position_id}-${dept.department_id}`;
                                const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                                const employees = getEmployeesForPositionInDepartment(
                                  position.position_id, 
                                  dept.department_id
                                );
                                
                                return (
                                  <div key={positionDeptKey} className="org-position">
                                    <div 
                                      className="org-position-header"
                                      onClick={() => togglePosition(positionDeptKey)}
                                    >
                                      <span>{position.positionName}</span>
                                      <span>
                                        {isPositionExpanded ? 
                                          <ChevronDown className="h-4 w-4" /> : 
                                          <ChevronRight className="h-4 w-4" />
                                        }
                                      </span>
                                    </div>
                                    
                                    {isPositionExpanded && employees.length > 0 && (
                                      <div className="org-employees-list">
                                        {employees.map(employee => (
                                          <div key={employee.employee_id} className="org-employee">
                                            {employee.full_name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Уровень 3: Показать подотделы текущего отдела, если они есть */}
                            {getChildDepartments(dept.department_id).length > 0 && (
                              <div className="org-subtree-level-3">
                                <div className="org-vertical-line small"></div>
                                <div className="org-subtree-departments">
                                  {getChildDepartments(dept.department_id).map((subDept) => (
                                    <div key={`subdept-${subDept.department_id}`} className="org-node-card small">
                                      <div className="org-node-header">{subDept.name}</div>
                                      
                                      {/* Должности подотдела */}
                                      <div className="org-node-positions small">
                                        {getPositionsForDepartment(subDept.department_id).map((position) => {
                                          const positionDeptKey = `${position.position_id}-${subDept.department_id}`;
                                          const isPositionExpanded = expandedPositions[positionDeptKey] || false;
                                          
                                          return (
                                            <div key={positionDeptKey} className="org-position small">
                                              <div 
                                                className="org-position-header small"
                                                onClick={() => togglePosition(positionDeptKey)}
                                              >
                                                <span>{position.positionName}</span>
                                                <span>
                                                  {isPositionExpanded ? 
                                                    <ChevronDown className="h-3 w-3" /> : 
                                                    <ChevronRight className="h-3 w-3" />
                                                  }
                                                </span>
                                              </div>
                                              
                                              {isPositionExpanded && (
                                                <div className="org-employees-list small">
                                                  {getEmployeesForPositionInDepartment(
                                                    position.position_id, 
                                                    subDept.department_id
                                                  ).map(employee => (
                                                    <div key={employee.employee_id} className="org-employee small">
                                                      {employee.full_name}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {/* Уровень 4 и глубже: Показать подотделы */}
                                      {getChildDepartments(subDept.department_id).length > 0 && (
                                        <div className="org-subtree-level-4">
                                          <div className="org-vertical-line mini"></div>
                                          <div className="org-subtree-departments mini">
                                            {getChildDepartments(subDept.department_id).map((deepDept) => (
                                              <div key={`deepdept-${deepDept.department_id}`} className="org-node-card mini">
                                                <div className="org-node-header mini">{deepDept.name}</div>
                                                <div className="org-node-positions mini">
                                                  {getPositionsForDepartment(deepDept.department_id).length > 0 && (
                                                    <div className="org-position-count">
                                                      ({getPositionsForDepartment(deepDept.department_id).length} {getPositionsForDepartment(deepDept.department_id).length === 1 ? 'должность' : 'должностей'})
                                                    </div>
                                                  )}
                                                  {/* Пятый уровень и глубже показываем только счетчиком */}
                                                  {getChildDepartments(deepDept.department_id).length > 0 && (
                                                    <div className="org-sublevel-indicator">
                                                      + еще {getChildDepartments(deepDept.department_id).length} {getChildDepartments(deepDept.department_id).length === 1 ? 'подотдел' : 'подотделов'}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <Building className="h-16 w-16 mx-auto mb-3 text-neutral-300" />
              <p className="text-lg">Нет доступных данных о структуре организации</p>
              {!user && (
                <Button asChild className="mt-4" variant="default">
                  <Link href="/auth">Войти для управления</Link>
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Статистика в нижней части страницы */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Отделы</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-2xl font-bold">
              {isLoadingDepartments ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                departments.length || 0
              )}
            </div>
            <Button asChild className="mt-2 w-full" variant="outline">
              <Link href="/departments">Просмотреть все отделы</Link>
            </Button>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Сотрудники</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">
              {isLoadingEmployees ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                employees.length || 0
              )}
            </div>
            <Button asChild className="mt-2 w-full" variant="outline">
              <Link href="/employees">Просмотреть всех сотрудников</Link>
            </Button>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Проекты</h3>
              <svg className="h-5 w-5 text-[#a40000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-2xl font-bold">
              {isLoadingProjects ? (
                <span className="text-gray-400">Загрузка...</span>
              ) : (
                projectsResponse?.data.length || 0
              )}
            </div>
            <Button asChild className="mt-2 w-full" variant="outline">
              <Link href="/projects">Просмотреть все проекты</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}