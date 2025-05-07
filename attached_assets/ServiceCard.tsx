import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getStatusClass, getHealthClass } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-neutral-50" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-500 font-semibold">{service.name === 'api' ? 'Express.js API' : 
          service.name === 'react' ? 'React Frontend' : 
          service.name === 'postgres' ? 'PostgreSQL' : 
          service.name === 'nginx' ? 'Nginx' : service.name}</h3>
        <div className="flex items-center">
          <div className={`${getStatusClass(service.status)} w-3 h-3 rounded-full mr-2`}></div>
          <span className={`text-sm ${getHealthClass(service.health)}`}>{service.health}</span>
        </div>
      </div>
      <div className="text-sm text-neutral-400">
        {Object.entries(service.details).map(([key, value]) => (
          <div key={key} className="flex justify-between mb-1">
            <span>{key}:</span>
            <span className="font-mono">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
