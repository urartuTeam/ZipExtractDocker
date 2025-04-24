import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  activeTab: string;
}

export default function Header({ toggleSidebar, activeTab }: HeaderProps) {
  const getTitle = () => {
    switch (activeTab) {
      case '/':
        return 'Project Overview';
      case '/services':
        return 'Docker Services';
      case '/api':
        return 'API Endpoints';
      case '/database':
        return 'Database Configuration';
      case '/logs':
        return 'Service Logs';
      default:
        return 'Docker Development';
    }
  };

  return (
    <header className="w-full bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="lg:hidden text-neutral-500 focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-neutral-500">
            {getTitle()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-primary text-white hover:bg-primary-dark">
            <RefreshCw className="w-5 h-5 mr-1" />
            Restart
          </Button>
          <Button variant="outline" className="text-primary border border-primary hover:bg-neutral-100">
            <Zap className="w-5 h-5 mr-1" />
            Quick Start
          </Button>
        </div>
      </div>
    </header>
  );
}
