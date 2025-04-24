import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Overview from "@/pages/Overview";
import Services from "@/pages/Services";
import ApiEndpoints from "@/pages/ApiEndpoints";
import Database from "@/pages/Database";
import Logs from "@/pages/Logs";
import { useLocation } from 'wouter';

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/services" component={Services} />
      <Route path="/api" component={ApiEndpoints} />
      <Route path="/database" component={Database} />
      <Route path="/logs" component={Logs} />
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
