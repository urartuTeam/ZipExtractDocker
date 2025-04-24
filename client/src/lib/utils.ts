import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusClass(status: string) {
  return {
    'running': 'bg-success',
    'stopped': 'bg-error',
    'restarting': 'bg-warning',
  }[status] || 'bg-neutral-300';
}

export function getHealthClass(health: string) {
  return {
    'healthy': 'text-success',
    'unhealthy': 'text-error',
    'starting': 'text-warning',
  }[health] || 'text-neutral-300';
}
