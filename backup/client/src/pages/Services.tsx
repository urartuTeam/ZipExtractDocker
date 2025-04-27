import React, { useState } from 'react';
import { useServiceStatus } from '@/hooks/useServiceStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStatusClass } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default function Services() {
  const { services } = useServiceStatus();
  const [activeService, setActiveService] = useState<string | null>(null);

  const activeServiceData = activeService ? services.find(s => s.id === activeService) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Service List */}
      <div className="col-span-1 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">Docker Services</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {services.map(service => (
            <div 
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`px-6 py-4 hover:bg-neutral-50 cursor-pointer ${activeService === service.id ? 'bg-primary-light/10' : ''}`}
            >
              <div className="flex items-center">
                <div className={`${getStatusClass(service.status)} w-3 h-3 rounded-full mr-3`}></div>
                <span className="text-neutral-500 font-medium">{service.name}</span>
                <span className="ml-auto text-sm text-neutral-400">{service.port}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow">
        {!activeService ? (
          <div className="flex h-full items-center justify-center p-10 text-neutral-400">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Select a service to view details</p>
            </div>
          </div>
        ) : activeServiceData?.id === 'postgres' ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-neutral-500">PostgreSQL Service</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="success">Start</Button>
                <Button size="sm" variant="destructive">Stop</Button>
                <Button size="sm" className="bg-warning text-white hover:bg-opacity-90">Restart</Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Configuration</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">Image:</div>
                    <div className="col-span-2 text-neutral-600">postgres:15</div>
                    
                    <div className="text-neutral-400">Container Name:</div>
                    <div className="col-span-2 text-neutral-600">project-postgres-1</div>
                    
                    <div className="text-neutral-400">Port Mapping:</div>
                    <div className="col-span-2 text-neutral-600">5432:5432</div>
                    
                    <div className="text-neutral-400">Database:</div>
                    <div className="col-span-2 text-neutral-600">app_db</div>
                    
                    <div className="text-neutral-400">Username:</div>
                    <div className="col-span-2 text-neutral-600">app_user</div>
                    
                    <div className="text-neutral-400">Password:</div>
                    <div className="col-span-2 text-neutral-600">******</div>
                    
                    <div className="text-neutral-400">Volume:</div>
                    <div className="col-span-2 text-neutral-600">postgres_data:/var/lib/postgresql/data</div>
                    
                    <div className="text-neutral-400">Network:</div>
                    <div className="col-span-2 text-neutral-600">app-network</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Connection String</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <code className="text-neutral-600">postgres://app_user:secret@postgres:5432/app_db?sslmode=disable</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-neutral-500 mb-2">Database Schema</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="text-neutral-600">
                    <div>/* Sample schema structure */</div>
                    <div className="mt-2">
                      <span className="text-primary-dark">CREATE TABLE</span> users (
                      <div className="pl-4">id <span className="text-secondary-dark">SERIAL</span> <span className="text-primary-dark">PRIMARY KEY</span>,</div>
                      <div className="pl-4">username <span className="text-secondary-dark">VARCHAR(50)</span> <span className="text-primary-dark">NOT NULL</span> <span className="text-primary-dark">UNIQUE</span>,</div>
                      <div className="pl-4">email <span className="text-secondary-dark">VARCHAR(100)</span> <span className="text-primary-dark">NOT NULL</span> <span className="text-primary-dark">UNIQUE</span>,</div>
                      <div className="pl-4">password_hash <span className="text-secondary-dark">VARCHAR(100)</span> <span className="text-primary-dark">NOT NULL</span>,</div>
                      <div className="pl-4">created_at <span className="text-secondary-dark">TIMESTAMP</span> <span className="text-primary-dark">DEFAULT</span> <span className="text-primary-dark">NOW</span>()</div>
                      );
                    </div>
                    <div className="mt-2">
                      <span className="text-primary-dark">CREATE TABLE</span> posts (
                      <div className="pl-4">id <span className="text-secondary-dark">SERIAL</span> <span className="text-primary-dark">PRIMARY KEY</span>,</div>
                      <div className="pl-4">title <span className="text-secondary-dark">VARCHAR(100)</span> <span className="text-primary-dark">NOT NULL</span>,</div>
                      <div className="pl-4">content <span className="text-secondary-dark">TEXT</span> <span className="text-primary-dark">NOT NULL</span>,</div>
                      <div className="pl-4">user_id <span className="text-secondary-dark">INTEGER</span> <span className="text-primary-dark">REFERENCES</span> users(id),</div>
                      <div className="pl-4">created_at <span className="text-secondary-dark">TIMESTAMP</span> <span className="text-primary-dark">DEFAULT</span> <span className="text-primary-dark">NOW</span>()</div>
                      );
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeServiceData?.id === 'api' ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-neutral-500">Express.js API Service</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="success">Start</Button>
                <Button size="sm" variant="destructive">Stop</Button>
                <Button size="sm" className="bg-warning text-white hover:bg-opacity-90">Restart</Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Configuration</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">Build:</div>
                    <div className="col-span-2 text-neutral-600">Custom Dockerfile</div>
                    
                    <div className="text-neutral-400">Container Name:</div>
                    <div className="col-span-2 text-neutral-600">project-api-1</div>
                    
                    <div className="text-neutral-400">Port Mapping:</div>
                    <div className="col-span-2 text-neutral-600">9000:9000</div>
                    
                    <div className="text-neutral-400">Volume:</div>
                    <div className="col-span-2 text-neutral-600">./api:/app</div>
                    
                    <div className="text-neutral-400">Network:</div>
                    <div className="col-span-2 text-neutral-600">app-network</div>
                    
                    <div className="text-neutral-400">Depends On:</div>
                    <div className="col-span-2 text-neutral-600">postgres</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Environment Variables</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">DATABASE_URL:</div>
                    <div className="col-span-2 text-neutral-600">postgres://app_user:secret@postgres:5432/app_db?sslmode=disable</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-neutral-500 mb-2">API Endpoints</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">GET</div>
                    <div className="col-span-2 text-neutral-600">/api/users</div>
                    
                    <div className="text-neutral-400">GET</div>
                    <div className="col-span-2 text-neutral-600">/api/users/:id</div>
                    
                    <div className="text-neutral-400">POST</div>
                    <div className="col-span-2 text-neutral-600">/api/users</div>
                    
                    <div className="text-neutral-400">PUT</div>
                    <div className="col-span-2 text-neutral-600">/api/users/:id</div>
                    
                    <div className="text-neutral-400">DELETE</div>
                    <div className="col-span-2 text-neutral-600">/api/users/:id</div>
                    
                    <div className="text-neutral-400">GET</div>
                    <div className="col-span-2 text-neutral-600">/api/posts</div>
                    
                    <div className="text-neutral-400">GET</div>
                    <div className="col-span-2 text-neutral-600">/api/posts/:id</div>
                    
                    <div className="text-neutral-400">POST</div>
                    <div className="col-span-2 text-neutral-600">/api/posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeServiceData?.id === 'react' ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-neutral-500">React Frontend Service</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="success">Start</Button>
                <Button size="sm" variant="destructive">Stop</Button>
                <Button size="sm" className="bg-warning text-white hover:bg-opacity-90">Restart</Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Configuration</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">Image:</div>
                    <div className="col-span-2 text-neutral-600">node:18</div>
                    
                    <div className="text-neutral-400">Container Name:</div>
                    <div className="col-span-2 text-neutral-600">project-react-1</div>
                    
                    <div className="text-neutral-400">Port Mapping:</div>
                    <div className="col-span-2 text-neutral-600">3000:3000</div>
                    
                    <div className="text-neutral-400">Volume:</div>
                    <div className="col-span-2 text-neutral-600">./react:/app</div>
                    
                    <div className="text-neutral-400">Working Dir:</div>
                    <div className="col-span-2 text-neutral-600">/app</div>
                    
                    <div className="text-neutral-400">Command:</div>
                    <div className="col-span-2 text-neutral-600">sh -c "if [ ! -d node_modules ]; then npm install; fi && npm start -- --host 0.0.0.0"</div>
                    
                    <div className="text-neutral-400">Network:</div>
                    <div className="col-span-2 text-neutral-600">app-network</div>
                    
                    <div className="text-neutral-400">Depends On:</div>
                    <div className="col-span-2 text-neutral-600">api</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Environment Variables</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">REACT_APP_API_URL:</div>
                    <div className="col-span-2 text-neutral-600">http://api:9000</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-neutral-500 mb-2">Development Server</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="text-neutral-600">
                    <div>React app is running in development mode</div>
                    <div className="mt-2">
                      <span className="text-neutral-400">Local:</span> http://localhost:3000
                    </div>
                    <div>
                      <span className="text-neutral-400">Network:</span> http://172.17.0.5:3000
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeServiceData?.id === 'nginx' ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-neutral-500">Nginx Service</h2>
              <div className="flex space-x-2">
                <Button size="sm" variant="success">Start</Button>
                <Button size="sm" variant="destructive">Stop</Button>
                <Button size="sm" className="bg-warning text-white hover:bg-opacity-90">Restart</Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-md font-medium text-neutral-500 mb-2">Configuration</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-neutral-400">Image:</div>
                    <div className="col-span-2 text-neutral-600">nginx:alpine</div>
                    
                    <div className="text-neutral-400">Container Name:</div>
                    <div className="col-span-2 text-neutral-600">project-nginx-1</div>
                    
                    <div className="text-neutral-400">Port Mapping:</div>
                    <div className="col-span-2 text-neutral-600">80:80</div>
                    
                    <div className="text-neutral-400">Volume:</div>
                    <div className="col-span-2 text-neutral-600">./nginx/default.conf:/etc/nginx/conf.d/default.conf</div>
                    
                    <div className="text-neutral-400">Network:</div>
                    <div className="col-span-2 text-neutral-600">app-network</div>
                    
                    <div className="text-neutral-400">Depends On:</div>
                    <div className="col-span-2 text-neutral-600">api, react</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-neutral-500 mb-2">Nginx Configuration</h3>
                <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <div className="text-neutral-600">
                    <div>server {'{'}</div>
                    <div className="pl-4">listen 80;</div>
                    <div className="pl-4">server_name localhost;</div>
                    <div className="pl-4"></div>
                    <div className="pl-4"># Frontend</div>
                    <div className="pl-4">location / {'{'}</div>
                    <div className="pl-8">proxy_pass http://react:3000;</div>
                    <div className="pl-8">proxy_http_version 1.1;</div>
                    <div className="pl-8">proxy_set_header Upgrade $http_upgrade;</div>
                    <div className="pl-8">proxy_set_header Connection 'upgrade';</div>
                    <div className="pl-8">proxy_set_header Host $host;</div>
                    <div className="pl-8">proxy_cache_bypass $http_upgrade;</div>
                    <div className="pl-4">{'}'}</div>
                    <div className="pl-4"></div>
                    <div className="pl-4"># API</div>
                    <div className="pl-4">location /api {'{'}</div>
                    <div className="pl-8">proxy_pass http://api:9000;</div>
                    <div className="pl-8">proxy_http_version 1.1;</div>
                    <div className="pl-8">proxy_set_header Upgrade $http_upgrade;</div>
                    <div className="pl-8">proxy_set_header Connection 'upgrade';</div>
                    <div className="pl-8">proxy_set_header Host $host;</div>
                    <div className="pl-8">proxy_cache_bypass $http_upgrade;</div>
                    <div className="pl-4">{'}'}</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
