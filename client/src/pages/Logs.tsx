import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockLogs = [
  { service: 'postgres', timestamp: '2023-09-10 10:15:32', message: 'database system is ready to accept connections' },
  { service: 'api', timestamp: '2023-09-10 10:15:35', message: 'Express server started on port 9000' },
  { service: 'api', timestamp: '2023-09-10 10:15:35', message: 'Connected to PostgreSQL database' },
  { service: 'react', timestamp: '2023-09-10 10:15:40', message: 'Starting the development server...' },
  { service: 'react', timestamp: '2023-09-10 10:15:45', message: 'Webpack compiled successfully' },
  { service: 'nginx', timestamp: '2023-09-10 10:15:50', message: '/docker-entrypoint.sh: Configuration complete; ready for start up' },
  { service: 'api', timestamp: '2023-09-10 10:16:12', message: 'GET /api/users 200 15.243 ms' },
  { service: 'api', timestamp: '2023-09-10 10:16:15', message: 'GET /api/posts 200 12.817 ms' },
  { service: 'api', timestamp: '2023-09-10 10:16:30', message: 'POST /api/users 201 52.634 ms' },
  { service: 'postgres', timestamp: '2023-09-10 10:16:30', message: 'INSERT INTO users (username, email, password_hash) VALUES (...) RETURNING id' },
  { service: 'api', timestamp: '2023-09-10 10:16:45', message: 'GET /api/users/1 200 8.432 ms' },
  { service: 'api', timestamp: '2023-09-10 10:17:00', message: 'PUT /api/users/1 200 38.721 ms' },
  { service: 'postgres', timestamp: '2023-09-10 10:17:00', message: "UPDATE users SET email = '...' WHERE id = 1" },
  { service: 'api', timestamp: '2023-09-10 10:17:15', message: 'POST /api/posts 201 45.123 ms' },
  { service: 'postgres', timestamp: '2023-09-10 10:17:15', message: 'INSERT INTO posts (title, content, user_id) VALUES (...) RETURNING id' },
  { service: 'api', timestamp: '2023-09-10 10:17:30', message: 'GET /api/posts/1 200 7.891 ms' },
  { service: 'api', timestamp: '2023-09-10 10:17:45', message: 'GET /api/users 200 11.543 ms' },
  { service: 'react', timestamp: '2023-09-10 10:18:00', message: '[HMR] Waiting for update signal from WDS...' },
  { service: 'react', timestamp: '2023-09-10 10:18:15', message: 'Compiled successfully!' }
];

export default function Logs() {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [logs, setLogs] = useState(mockLogs);

  const filteredLogs = selectedService === 'all' 
    ? logs 
    : logs.filter(log => log.service === selectedService);

  const refresh = () => {
    // In a real app, we would fetch fresh logs here
    console.log('Refreshing logs...');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogColor = (service: string) => {
    switch(service) {
      case 'postgres': return 'text-green-400';
      case 'api': return 'text-green-400';
      case 'react': return 'text-green-400';
      case 'nginx': return 'text-green-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-500">Service Logs</h2>
        <div className="flex space-x-2">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded-md w-40">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="postgres">postgres</SelectItem>
              <SelectItem value="api">api</SelectItem>
              <SelectItem value="react">react</SelectItem>
              <SelectItem value="nginx">nginx</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="px-3 py-1.5 rounded-md bg-white text-primary border border-primary text-sm hover:bg-neutral-100"
            onClick={refresh}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          
          <Button 
            variant="destructive" 
            className="px-3 py-1.5 rounded-md text-sm"
            onClick={clearLogs}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      <div className="bg-neutral-800 text-white font-mono text-sm p-4 h-96 overflow-y-auto">
        <div className="space-y-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <div key={index}>
                <span className={getLogColor(log.service)}>[{log.service}]</span>{' '}
                <span className="text-blue-300">{log.timestamp}</span>{' '}
                {log.message}
              </div>
            ))
          ) : (
            <div className="text-neutral-400 text-center mt-8">No logs to display</div>
          )}
        </div>
      </div>
    </div>
  );
}
