import React from 'react';
import { Card } from '@/components/ui/card';
import { DatabaseTable } from '@/types';

const tables: DatabaseTable[] = [
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: 'PRIMARY KEY' },
      { name: 'username', type: 'VARCHAR(50)', constraints: 'NOT NULL, UNIQUE' },
      { name: 'email', type: 'VARCHAR(100)', constraints: 'NOT NULL, UNIQUE' },
      { name: 'password_hash', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' }
    ]
  },
  {
    name: 'posts',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: 'PRIMARY KEY' },
      { name: 'title', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'content', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'user_id', type: 'INTEGER', constraints: 'REFERENCES users(id)' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT NOW()' }
    ]
  }
];

export default function Database() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Connection Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">Database Connection</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-medium text-neutral-500">Host:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">postgres</div>
              
              <div className="text-sm font-medium text-neutral-500">Port:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">5432</div>
              
              <div className="text-sm font-medium text-neutral-500">Database:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">app_db</div>
              
              <div className="text-sm font-medium text-neutral-500">Username:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">app_user</div>
              
              <div className="text-sm font-medium text-neutral-500">Password:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">******</div>
              
              <div className="text-sm font-medium text-neutral-500">SSL Mode:</div>
              <div className="col-span-2 text-sm text-neutral-500 font-mono">disable</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-neutral-500 mb-3">Connection String</h3>
            <div className="bg-neutral-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <code className="text-neutral-600">postgres://app_user:secret@postgres:5432/app_db?sslmode=disable</code>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">Database Status</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
            <span className="text-success font-medium">Connected</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-100 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-1">Tables</div>
              <div className="text-xl font-semibold text-neutral-600">2</div>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Records</div>
              <div className="text-xl font-semibold text-neutral-600">15</div>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-1">Size</div>
              <div className="text-xl font-semibold text-neutral-600">2.4 MB</div>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-4">
              <div className="text-sm text-neutral-400 mb-1">Version</div>
              <div className="text-xl font-semibold text-neutral-600">PostgreSQL 15</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schema */}
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-500">Database Schema</h2>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-md font-medium text-neutral-500 mb-3">Tables</h3>
            <div className="space-y-6">
              {tables.map(table => (
                <div key={table.name}>
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="font-medium">{table.name}</span>
                  </div>
                  
                  <div className="bg-neutral-100 p-4 rounded-md overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pr-6 py-1">Column</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider pr-6 py-1">Type</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider py-1">Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {table.columns.map(column => (
                          <tr key={column.name}>
                            <td className="pr-6 py-1 font-mono">{column.name}</td>
                            <td className="pr-6 py-1">{column.type}</td>
                            <td className="py-1">{column.constraints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
