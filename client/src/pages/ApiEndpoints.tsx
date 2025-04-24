import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Endpoint } from '@/types';

const endpoints: Endpoint[] = [
  { id: '1', method: 'GET', path: '/api/users', description: 'Get all users', status: 'implemented' },
  { id: '2', method: 'GET', path: '/api/users/:id', description: 'Get user by ID', status: 'implemented' },
  { id: '3', method: 'POST', path: '/api/users', description: 'Create new user', status: 'implemented' },
  { id: '4', method: 'PUT', path: '/api/users/:id', description: 'Update user', status: 'implemented' },
  { id: '5', method: 'DELETE', path: '/api/users/:id', description: 'Delete user', status: 'implemented' },
  { id: '6', method: 'GET', path: '/api/posts', description: 'Get all posts', status: 'implemented' },
  { id: '7', method: 'GET', path: '/api/posts/:id', description: 'Get post by ID', status: 'implemented' },
  { id: '8', method: 'POST', path: '/api/posts', description: 'Create new post', status: 'implemented' }
];

export default function ApiEndpoints() {
  const { data = endpoints } = useQuery({
    queryKey: ['/api/endpoints'],
    queryFn: async () => {
      // In a real app, we would fetch this from an API
      return endpoints;
    }
  });

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">API Endpoints</h2>
          <p className="mt-1 text-sm text-neutral-400">Express.js API endpoints for React frontend integration</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Endpoint</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {data.map(endpoint => (
                <tr key={endpoint.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge method={endpoint.method} className="px-2 py-1 text-xs font-semibold rounded-md">
                      {endpoint.method}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-neutral-500">{endpoint.path}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{endpoint.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge variant="success" className="px-2 py-1 text-xs rounded-md">
                      {endpoint.status === 'implemented' ? 'Implemented' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">API Documentation</h2>
        </div>
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Request Example</h3>
            <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre className="text-neutral-600">
{`fetch('http://localhost/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-neutral-500 mb-3">Response Example</h3>
            <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre className="text-neutral-600">
{`{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2023-07-15T10:30:00Z"
    },
    {
      "id": 2,
      "username": "janedoe",
      "email": "jane@example.com",
      "created_at": "2023-07-16T08:15:00Z"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
