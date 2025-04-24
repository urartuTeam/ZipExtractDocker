import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import headerBg from '../assets/header-bg.png';

interface HeaderProps {
  toggleSidebar: () => void;
  activeTab: string;
}

export default function Header({ toggleSidebar, activeTab }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const getTitle = () => {
    switch (activeTab) {
      case '/':
        return 'Главная';
      case '/departments':
        return 'Отделы';
      case '/positions':
        return 'Должности';
      case '/employees':
        return 'Сотрудники';
      case '/projects':
        return 'Проекты';
      case '/leaves':
        return 'Отпуска';
      default:
        return 'Система управления персоналом';
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="w-full border-b border-neutral-200">
      <div className="flex items-center justify-between header-with-image px-6">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-white focus:outline-none mr-4">
            <Menu className="h-6 w-6" />
          </button>
          {/* Убираем заголовок */}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="hidden md:flex items-center">
                <User className="w-5 h-5 mr-2 text-white" />
                <span className="text-sm font-medium text-white">{user.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-white border-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </>
          )}
          {!user && (
            <Button asChild variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
              <Link href="/auth">Войти</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
