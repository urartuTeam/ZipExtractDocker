import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import ProjectTree from './ProjectTree';
import { Employee } from '@shared/schema';

interface ProjectDetailProps {
  projectId: number;
  onBack: () => void;
}

export default function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'team'>('structure');
  
  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
  });
  
  // Fetch project roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: [`/api/projects/${projectId}/roles`],
  });
  
  // Fetch employees for each role
  const employeesInRoles = useQuery({
    queryKey: [`/api/project/${projectId}/employees`],
    enabled: roles.length > 0,
    // In a real app, we would fetch the actual data
    // This is simulated for the example
    queryFn: async () => {
      // Mock data
      const result: Record<number, Employee[]> = {};
      
      for (const role of roles) {
        // Fetch employees for this role
        const response = await fetch(`/api/project-roles/${role.id}/employees`);
        const employees = await response.json();
        result[role.id] = employees;
      }
      
      return result;
    }
  });
  
  if (isLoadingProject || isLoadingRoles) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center py-8">
        <p>Проект не найден</p>
        <Button onClick={onBack} className="mt-4">Вернуться к списку</Button>
      </div>
    );
  }
  
  const formattedDate = project.createdAt 
    ? format(new Date(project.createdAt), 'dd.MM.yyyy')
    : 'н/д';
  
  return (
    <div>
      {/* Project Header */}
      <div className="flex items-center mb-6">
        <button 
          className="mr-3 p-2 bg-white rounded-full shadow-sm hover:bg-neutral-50 transition-colors"
          onClick={onBack}
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-medium">{project.name}</h2>
          <p className="text-neutral-400">Создан: {formattedDate} • Статус: {project.status}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 font-medium ${
              activeTab === 'structure' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            onClick={() => setActiveTab('structure')}
          >
            Структура проекта
          </button>
          <button
            className={`pb-2 px-1 font-medium ${
              activeTab === 'team' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
            onClick={() => setActiveTab('team')}
          >
            Команда проекта
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'structure' ? (
        <div className="bg-white rounded-lg shadow-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Структура проекта</h3>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <span className="material-icons">edit</span>
            </button>
          </div>
          
          <ProjectTree projectId={projectId} roles={roles} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Команда проекта</h3>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <span className="material-icons">person_add</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Сотрудник</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Должность</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Отдел</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Роль в проекте</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {/* In a real app, we would show actual team members here */}
                <tr className="border-b border-neutral-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-2">
                        <span className="material-icons text-neutral-400 text-sm">person</span>
                      </div>
                      <span className="text-sm">Иванов Сергей Петрович</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">Технический директор</td>
                  <td className="py-3 px-4 text-sm">Управление разработки</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs">Руководитель проекта</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 text-neutral-400 hover:text-primary transition-colors">
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button className="p-1 text-neutral-400 hover:text-error transition-colors">
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-2">
                        <span className="material-icons text-neutral-400 text-sm">person</span>
                      </div>
                      <span className="text-sm">Козлов Алексей Иванович</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">Разработчик React</td>
                  <td className="py-3 px-4 text-sm">Отдел Frontend</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">Frontend Разработчик</span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="p-1 text-neutral-400 hover:text-primary transition-colors">
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button className="p-1 text-neutral-400 hover:text-error transition-colors">
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
