export interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'restarting';
  health: 'healthy' | 'unhealthy' | 'starting';
  port: string;
  details: Record<string, string>;
  logs: string[];
}

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'implemented' | 'pending';
}

export interface DatabaseTable {
  name: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
  }[];
}
