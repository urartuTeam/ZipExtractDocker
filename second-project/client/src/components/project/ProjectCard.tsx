import { Project } from '@shared/schema';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  employeeCount: number;
  onClick: () => void;
}

export default function ProjectCard({ project, employeeCount, onClick }: ProjectCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };
  
  // For display purposes we show some sample team members
  // In a real app, these would come from the API
  const teamMembers = [
    { initials: "КА", color: "bg-primary" },
    { initials: "ИП", color: "bg-secondary" },
    { initials: "СМ", color: "bg-accent" },
  ];
  
  const formattedDate = project.createdAt 
    ? format(new Date(project.createdAt), 'dd.MM.yyyy')
    : 'н/д';
  
  return (
    <div 
      className="bg-white rounded-lg shadow-card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="material-icons text-primary">rocket_launch</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium text-lg">{project.name}</h3>
          <div className="flex items-center text-xs text-neutral-400">
            <span className="material-icons text-xs mr-1">people</span>
            <span>{employeeCount} сотрудников</span>
          </div>
        </div>
      </div>
      
      <div className="flex -space-x-2 mb-3">
        {teamMembers.map((member, index) => (
          <div 
            key={index}
            className={`w-8 h-8 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-medium`}
          >
            {member.initials}
          </div>
        ))}
        
        {employeeCount > teamMembers.length && (
          <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center text-white text-xs">
            +{employeeCount - teamMembers.length}
          </div>
        )}
      </div>
      
      <div className="text-xs text-neutral-400">
        <p>Создан: {formattedDate}</p>
        <p>Статус: {project.status === 'active' ? 'Активный' : project.status}</p>
      </div>
    </div>
  );
}
