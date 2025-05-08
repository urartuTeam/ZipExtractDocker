import React from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface NavItemProps {
  path: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ path, icon, label, isActive, onClick }: NavItemProps) => (
  <a
    onClick={onClick}
    className={cn(
      'group flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer',
      isActive 
        ? 'bg-primary text-white' 
        : 'text-neutral-500 hover:bg-neutral-100'
    )}
  >
    <div 
      className={cn(
        'mr-3 h-6 w-6',
        isActive 
          ? 'text-white' 
          : 'text-neutral-400 group-hover:text-neutral-500'
      )}
    >
      {icon}
    </div>
    {label}
  </a>
);

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { logoutMutation, user } = useAuth();
  // Проверка на администратора теперь также включает проверку по имени пользователя
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  const navItems = [
    {
      path: '/organization',
      label: 'Структура',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 7h6m-6 4h6m-6 4h6" />
        </svg>
      )
    },
    {
      path: '/departments',
      label: 'Отделы',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      path: '/organizations',
      label: 'Организации',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      path: '/positions',
      label: 'Должности',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/employees',
      label: 'Сотрудники',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      path: '/admin/projects',
      label: 'Проекты',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      path: '/leaves',
      label: 'Отпуска',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const navigate = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div 
      className={cn(
        'fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-white border-r border-neutral-200 lg:static lg:inset-0 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.983 16.957V18.943H20.194V16.957H13.983M2.983 16.957V18.943H9.983V16.957H2.983M8.983 12.957V14.943H15.194V12.957H8.983M13.983 8.957V10.943H20.194V8.957H13.983M2.983 8.957V10.943H9.983V8.957H2.983M8.983 4.957V6.943H15.194V4.957H8.983M18.983 4.957C19.49 4.957 19.983 5.45 19.983 5.957V10.943C19.983 11.45 19.49 11.943 18.983 11.943H15.983V12.957C15.983 13.464 15.49 13.957 14.983 13.957H8.983C8.476 13.957 7.983 13.464 7.983 12.957V11.943H4.983C4.476 11.943 3.983 11.45 3.983 10.943V5.957C3.983 5.45 4.476 4.957 4.983 4.957H7.983V5.957C7.983 6.464 8.476 6.957 8.983 6.957H14.983C15.49 6.957 15.983 6.464 15.983 5.957V4.957H18.983M4.983 16.957C4.476 16.957 3.983 17.45 3.983 17.957V20.943C3.983 21.45 4.476 21.943 4.983 21.943H9.983C10.49 21.943 10.983 21.45 10.983 20.943V17.957C10.983 17.45 10.49 16.957 9.983 16.957H4.983M18.983 16.957C18.476 16.957 17.983 17.45 17.983 17.957V20.943C17.983 21.45 18.476 21.943 18.983 21.943H19.983C20.49 21.943 20.983 21.45 20.983 20.943V17.957C20.983 17.45 20.49 16.957 19.983 16.957H18.983Z" />
          </svg>
          <span className="ml-2 text-xl font-semibold text-neutral-500">HR System</span>
        </div>
        <button onClick={onToggle} className="lg:hidden">
          <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="mt-5 px-3 flex-grow">
        <div className="space-y-1">
          {navItems
            .filter(item => {
              // Отображаем пункты меню с префиксом /admin/ только для администраторов
              if (item.path.startsWith('/admin/') && !isAdmin) {
                return false;
              }
              return true;
            })
            .map((item) => (
              <NavItem 
                key={item.path}
                path={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location === item.path}
                onClick={() => navigate(item.path)}
              />
            ))
          }
        </div>
      </nav>
      
      {/* Нижняя часть боковой панели */}
      <div className="px-3 py-4 border-t border-neutral-200 mt-auto">
        <div className="space-y-2">
          <a 
            onClick={() => navigate('/')}
            className="group flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer text-neutral-500 hover:bg-neutral-100"
          >
            <div className="mr-3 h-6 w-6 text-neutral-400 group-hover:text-neutral-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            На главную
          </a>
          
          <a 
            onClick={() => navigate('/settings')}
            className={cn(
              'group flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer',
              location === '/settings' 
                ? 'bg-primary text-white' 
                : 'text-neutral-500 hover:bg-neutral-100'
            )}
          >
            <div className={cn(
              'mr-3 h-6 w-6',
              location === '/settings' 
                ? 'text-white' 
                : 'text-neutral-400 group-hover:text-neutral-500'
            )}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Настройки
          </a>
          
          <a 
            onClick={handleLogout}
            className="group flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer text-neutral-500 hover:bg-neutral-100"
          >
            <div className="mr-3 h-6 w-6 text-neutral-400 group-hover:text-neutral-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            Выйти
          </a>
        </div>
      </div>
    </div>
  );
}
