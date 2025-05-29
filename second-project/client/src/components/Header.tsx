import { useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  const isHRViewActive = !location.includes("projects");
  
  const handleViewToggle = (view: 'hr' | 'projects') => {
    if (view === 'hr') {
      setLocation('/');
    } else {
      setLocation('/projects');
    }
  };
  
  return (
    <header className="bg-primary text-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-medium">Система управления структурой</h1>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
          <button 
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              isHRViewActive ? 'bg-white text-primary font-medium' : 'text-white hover:bg-white/20'
            }`}
            onClick={() => handleViewToggle('hr')}
          >
            HR структура
          </button>
          <button 
            className={`px-3 py-1 rounded-full transition-all duration-200 ${
              !isHRViewActive ? 'bg-white text-primary font-medium' : 'text-white hover:bg-white/20'
            }`}
            onClick={() => handleViewToggle('projects')}
          >
            Проекты
          </button>
        </div>
      </div>
    </header>
  );
}
