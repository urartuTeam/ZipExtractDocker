import { useQuery } from '@tanstack/react-query';
import { Service } from '@/types';

const defaultServices: Service[] = [
  {
    id: 'postgres',
    name: 'postgres',
    status: 'running',
    health: 'healthy',
    port: '5432',
    details: {
      'Host': 'postgres:5432',
      'Database': 'app_db',
      'User': 'app_user'
    },
    logs: []
  },
  {
    id: 'api',
    name: 'api',
    status: 'running',
    health: 'healthy',
    port: '9000',
    details: {
      'Port': '9000',
      'URL': 'http://localhost:9000',
      'Status': 'Connected to database'
    },
    logs: []
  },
  {
    id: 'react',
    name: 'react',
    status: 'running',
    health: 'healthy',
    port: '3000',
    details: {
      'Port': '3000',
      'URL': 'http://localhost:3000',
      'Mode': 'Development'
    },
    logs: []
  },
  {
    id: 'nginx',
    name: 'nginx',
    status: 'running',
    health: 'healthy',
    port: '80',
    details: {
      'Port': '80',
      'Config': '/etc/nginx/conf.d/default.conf',
      'Status': 'Active'
    },
    logs: []
  }
];

export function useServiceStatus() {
  const { data: services = defaultServices, isLoading, error } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      try {
        // In a real application, we would fetch this from an API
        // For now, return the static data
        return defaultServices;
      } catch (error) {
        console.error('Error fetching services:', error);
        return defaultServices;
      }
    }
  });

  return {
    services,
    isLoading,
    error
  };
}
