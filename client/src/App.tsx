import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Departments from "@/pages/Departments";
import Positions from "@/pages/Positions";
import Employees from "@/pages/Employees";
import Projects from "@/pages/Projects";
import Leaves from "@/pages/Leaves";
import { useLocation } from 'wouter';

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/departments" component={Departments} />
      <Route path="/positions" component={Positions} />
      <Route path="/employees" component={Employees} />
      <Route path="/projects" component={Projects} />
      <Route path="/leaves" component={Leaves} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="h-screen flex overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={toggleSidebar} activeTab={location} />
            
            <main className="flex-1 overflow-y-auto bg-neutral-100 p-6">
              <Router />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
