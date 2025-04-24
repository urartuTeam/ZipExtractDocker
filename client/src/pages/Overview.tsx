import React from 'react';
import { useServiceStatus } from '@/hooks/useServiceStatus';
import ServiceCard from '@/components/ServiceCard';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function Overview() {
  const { services } = useServiceStatus();
  const [_, setLocation] = useLocation();

  const goToService = (serviceId: string) => {
    setLocation('/services');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Project Info */}
      <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-neutral-500 mb-4">Project Structure</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="font-mono text-sm bg-neutral-100 p-4 rounded-lg overflow-x-auto">
              <div className="text-neutral-500">
                <div>📁 <span className="text-primary-dark">project-root</span></div>
                <div>&nbsp;&nbsp;├── 📁 <span className="text-secondary">api</span> - Express.js backend</div>
                <div>&nbsp;&nbsp;├── 📁 <span className="text-secondary">react</span> - React frontend</div>
                <div>&nbsp;&nbsp;├── 📁 <span className="text-secondary">nginx</span> - Nginx configuration</div>
                <div>&nbsp;&nbsp;├── 📄 <span className="text-neutral-400">docker-compose.yaml</span> - Services configuration</div>
                <div>&nbsp;&nbsp;└── 📄 <span className="text-neutral-400">Dockerfile</span> - API service build file</div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-mono text-sm bg-neutral-100 p-4 rounded-lg h-full">
              <p className="text-neutral-500 mb-2"><strong>Docker Architecture:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-500">
                <li><span className="text-success font-semibold">PostgreSQL</span> - Database service</li>
                <li><span className="text-success font-semibold">Express.js API</span> - Backend service</li>
                <li><span className="text-success font-semibold">React</span> - Frontend client</li>
                <li><span className="text-success font-semibold">Nginx</span> - Reverse proxy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Cards */}
      {services.map(service => (
        <ServiceCard key={service.id} service={service} onClick={() => goToService(service.id)} />
      ))}

      {/* Quick Actions */}
      <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-neutral-500 mb-4">Quick Commands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-100 rounded-lg">
            <h3 className="font-medium text-neutral-500 mb-2">Start all services</h3>
            <pre className="bg-neutral-500 text-white p-3 rounded-md font-mono text-sm">docker-compose up -d</pre>
          </div>
          <div className="p-4 bg-neutral-100 rounded-lg">
            <h3 className="font-medium text-neutral-500 mb-2">Stop all services</h3>
            <pre className="bg-neutral-500 text-white p-3 rounded-md font-mono text-sm">docker-compose down</pre>
          </div>
          <div className="p-4 bg-neutral-100 rounded-lg">
            <h3 className="font-medium text-neutral-500 mb-2">Restart specific service</h3>
            <pre className="bg-neutral-500 text-white p-3 rounded-md font-mono text-sm">docker-compose restart [service]</pre>
          </div>
          <div className="p-4 bg-neutral-100 rounded-lg">
            <h3 className="font-medium text-neutral-500 mb-2">View logs</h3>
            <pre className="bg-neutral-500 text-white p-3 rounded-md font-mono text-sm">docker-compose logs -f [service]</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
