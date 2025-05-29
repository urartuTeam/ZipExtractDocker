import React from 'react';
import { useLocation } from 'wouter';
import ProjectView from '@/components/project/ProjectView';
import ReactFlowTree from '../components/hr/ReactFlowTree';

export default function Home() {
  const [location] = useLocation();
  const isProjectView = location.includes('projects');

  return (
    <div className="h-full">
      <div className="h-[calc(100vh-60px)] overflow-auto">
        {isProjectView ? <ProjectView /> : <ReactFlowTree />}
      </div>
    </div>
  );
}
