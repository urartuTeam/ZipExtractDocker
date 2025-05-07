import { useState } from "react";
import { Route, Switch } from "wouter";
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
import UserProjects from "./pages/UserProjects";
import AdminProjects from "./pages/AdminProjects";
import UserProjectDetails from "./pages/UserProjectDetails";
import AdminProjectDetails from "./pages/AdminProjectDetails";
import Leaves from "./pages/Leaves";
import AuthPage from "./pages/AuthPage";
import Settings from "./pages/Settings";
import OrganizationStructure from "./pages/OrganizationStructure";
import Vacancies from "./pages/Vacancies";
import { useLocation } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
    const [location] = useLocation();

    return (
        <Switch>
            <Route path="/" component={Home} />
            <ProtectedRoute path="/departments" component={Departments} />
            <ProtectedRoute path="/positions" component={Positions} />
            <ProtectedRoute path="/employees" component={Employees} />
            <Route path="/projects" component={UserProjects} />
            <Route path="/projects/:id">
                {(params) => <UserProjectDetails params={params} />}
            </Route>
            <ProtectedRoute path="/admin/projects" component={AdminProjects} />
            <ProtectedRoute path="/admin/projects/:id">
                {(params) => <AdminProjectDetails params={params} />}
            </ProtectedRoute>
            <ProtectedRoute path="/leaves" component={Leaves} />
            <ProtectedRoute
                path="/organization"
                component={OrganizationStructure}
            />
            <ProtectedRoute path="/settings" component={Settings} />
            <Route path="/vacancies" component={Vacancies} />
            <Route path="/vacancies/:id" component={Vacancies} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
        </Switch>
    );
}

function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [location] = useLocation();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const hideSidebar =
        location === "/" ||
        location === "/auth" ||
        location === "/projects" ||
        location.startsWith("/projects/") ||
        location === "/vacancies";

    const hideHeader = location === "/auth"; // Добавляем условие для скрытия header

    return (
        <div className="h-screen flex flex-col">
            {!hideHeader && <Header toggleSidebar={toggleSidebar} />}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {!hideSidebar && (
                    <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
                )}
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
