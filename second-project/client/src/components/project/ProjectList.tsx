import { useState } from 'react';
import { Project } from '@shared/schema';
import ProjectCard from './ProjectCard';
import AddProjectModal from './AddProjectModal';
import { useQuery } from '@tanstack/react-query';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: number) => void;
  onCreateSuccess: () => void;
}

export default function ProjectList({ projects, onSelectProject, onCreateSuccess }: ProjectListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Load employees for each project
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });
  
  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };
  
  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    onCreateSuccess();
  };
  
  // Get employee count for each project - in a real app this would be an API call
  const getEmployeeCount = (projectId: number) => {
    // Mocked data - in a real app, this would come from the API
    const counts: Record<number, number> = {};
    projects.forEach((project, index) => {
      counts[project.id] = 3 + index;
    });
    
    return counts[projectId] || 0;
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Project cards */}
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          employeeCount={getEmployeeCount(project.id)}
          onClick={() => onSelectProject(project.id)}
        />
      ))}
      
      {/* Add Project Button */}
      <div 
        className="bg-white rounded-lg border-2 border-dashed border-neutral-200 p-4 flex flex-col items-center justify-center text-neutral-400 hover:text-primary hover:border-primary transition-colors cursor-pointer"
        onClick={handleAddProject}
      >
        <span className="material-icons text-3xl mb-2">add_circle_outline</span>
        <span className="font-medium">Добавить проект</span>
      </div>
      
      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
