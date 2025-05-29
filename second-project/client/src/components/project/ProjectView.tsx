import { useState } from 'react';
import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';
import { useQuery } from '@tanstack/react-query';

export default function ProjectView() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const { 
    data: projects, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['/api/projects'],
  });
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-400">Загрузка проектов...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-error">
          <div className="text-5xl mb-4">⚠️</div>
          <p>Ошибка загрузки проектов</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded" 
            onClick={() => refetch()}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }
  
  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
  };
  
  const handleBackToList = () => {
    setSelectedProjectId(null);
  };
  
  const handleCreateProjectSuccess = () => {
    refetch();
  };
  
  return (
    <div className="h-full">
      {selectedProjectId ? (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToList}
        />
      ) : (
        <ProjectList
          projects={projects}
          onSelectProject={handleSelectProject}
          onCreateSuccess={handleCreateProjectSuccess}
        />
      )}
    </div>
  );
}
