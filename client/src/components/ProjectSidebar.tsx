import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@shared/schema";
import { FolderOpen, Users, ChevronRight, X } from "lucide-react";

interface ProjectWithEmployeeCount extends Project {
    employeeCount: number;
}

interface ProjectSidebarProps {
    projects: ProjectWithEmployeeCount[];
    currentProjectId: number;
    onHideSidebar: () => void;
    onProjectClick: (projectId: number) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
                                                           projects,
                                                           currentProjectId,
                                                           onHideSidebar,
                                                           onProjectClick,
                                                       }) => {
    // Фильтруем проекты, исключая текущий
    const otherProjects = projects.filter(project => project.project_id !== currentProjectId);

    return (
        <Card className="h-full border-r">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FolderOpen className="h-5 w-5" />
                        <span>Проекты</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onHideSidebar}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-120px)]">
                    <div className="space-y-1 p-3">
                        {otherProjects.map((project) => (
                            <Button
                                key={project.project_id}
                                variant="ghost"
                                onClick={() => onProjectClick(project.project_id)}
                                className="w-full justify-start h-auto p-3 hover:bg-gray-100"
                            >
                                <div className="flex items-center space-x-3 w-full">
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-sm truncate text-gray-900">
                                            {project.name}
                                        </div>
                                        {project.description && (
                                            <div className="text-xs truncate mt-1 text-gray-500">
                                                {project.description}
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Users className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                        {project.employeeCount} сотрудников
                      </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ProjectSidebar;