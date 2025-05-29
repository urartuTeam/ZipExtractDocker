import React from 'react';

interface MenuProps {
  children: React.ReactNode;
}

export function Menu({ children }: MenuProps) {
  return (
    <div className="menu rounded shadow-lg bg-white overflow-hidden">
      {children}
    </div>
  );
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function MenuItem({ children, onClick, disabled, destructive }: MenuItemProps) {
  return (
    <button
      className={`menu-item w-full text-left px-4 py-2 text-sm transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${destructive ? 'text-red-600 hover:bg-red-50' : 'hover:bg-gray-100'}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="h-px bg-gray-200 my-1"></div>;
}

export function MenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium text-gray-500 px-4 py-2 border-b">
      {children}
    </div>
  );
}