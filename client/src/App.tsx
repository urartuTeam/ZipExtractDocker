import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import Positions from "./pages/Positions";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Leaves from "./pages/Leaves";
import AuthPage from "./pages/AuthPage";
import OrganizationStructure from "./pages/OrganizationStructure";
import { useLocation } from 'wouter';
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/departments" component={Departments} />
      <ProtectedRoute path="/positions" component={Positions} />
      <ProtectedRoute path="/employees" component={Employees} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/leaves" component={Leaves} />
      <ProtectedRoute path="/organization" component={OrganizationStructure} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Не показываем Sidebar и Header на странице авторизации
  if (location === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} activeTab={location} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout>
            <Router />
          </AppLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
