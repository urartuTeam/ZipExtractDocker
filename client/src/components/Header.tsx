import React from "react";
import { Button } from "@/components/ui/button";
import { LogInIcon, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => logoutMutation.mutate();

  const excludedPaths =
    location === "/" ||
    location === "/auth" ||
    location === "/projects" ||
    location.startsWith("/projects/") ||
    location === "/vacancies";

  return (
    <header className="w-full border-b border-neutral-200 h-[100px]">
        <div className="flex items-center justify-between header-with-image px-6 relative">
            <Button asChild
                    className="bg-transparent border-none p-0 absolute left-0 top-0 w-[30%] h-[100%] hover:bg-transparent">
                <Link to="/"></Link>
            </Button>
            <div className="flex items-center">
                {!excludedPaths && (
                    <button
                        onClick={toggleSidebar}
                        className="text-white focus:outline-none mr-4"
                    >
                        <Menu className="h-6 w-6"/>
                    </button>
                )}
            </div>
            <div className="flex items-center space-x-4">
                {!user ? (
                    <Button
                        asChild
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white/20"
                    >
                        <Link href="/auth">
                            <LogInIcon className="w-5 h-5 mr-2"/>
                            Войти
                        </Link>
                    </Button>
                ) : excludedPaths ? (
                    <Button
                        asChild
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white/20"
                    >
                        <Link href="/departments">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            Управление
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="bg-transparent border-white text-white hover:bg-white/20"
                    >
                        <LogOut className="w-5 h-5 mr-2"/>
                        Выйти
                    </Button>
                )}
            </div>
        </div>
        <style>{`
        .header-with-image {
          background-image: url('/admin-header-bg.png');
          background-color: #a40000;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          height: 100px;
        }
      `}</style>
    </header>
  );
}
