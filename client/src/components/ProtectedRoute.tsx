import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component?: React.ComponentType;
  children?: React.ReactNode | ((params: any) => React.ReactNode);
}

export function ProtectedRoute({ path, component: Component, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Дополнительная проверка для административных маршрутов
  const isAdminRoute = path.startsWith('/admin/');
  const isAdmin = user.role === 'admin';

  if (isAdminRoute && !isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {Component ? <Component /> : children}
    </Route>
  );
}