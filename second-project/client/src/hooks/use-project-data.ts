import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Project, ProjectRole, Employee, ProjectWithRoles } from '@shared/schema';

export function useProjectsData() {
  // Fetch all projects
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['/api/projects'],
  });
  
  return {
    projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
    refetch: refetchProjects
  };
}

export function useProjectData(projectId: number) {
  // Fetch project details
  const { 
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject
  } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  // Fetch project roles
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    isError: isErrorRoles
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/roles`],
    enabled: !!projectId,
  });
  
  // For each role, we need to fetch the employees
  const employeeQueries = roles.map((role: ProjectRole) => {
    return useQuery({
      queryKey: [`/api/project-roles/${role.id}/employees`],
      enabled: !!role.id,
    });
  });
  
  const isLoadingEmployees = employeeQueries.some(query => query.isLoading);
  const isErrorEmployees = employeeQueries.some(query => query.isError);
  
  // Combine project with roles and employees
  const projectWithRoles = useMemo(() => {
    if (!project || !roles.length) return null;
    
    const projectData: ProjectWithRoles = {
      ...project,
      roles: roles.map((role: ProjectRole, index) => ({
        ...role,
        employees: employeeQueries[index]?.data || []
      }))
    };
    
    return projectData;
  }, [project, roles, employeeQueries]);
  
  return {
    project: projectWithRoles,
    isLoading: isLoadingProject || isLoadingRoles || isLoadingEmployees,
    isError: isErrorProject || isErrorRoles || isErrorEmployees
  };
}
