import { Employee } from '@shared/schema';

/**
 * Format employee full name
 */
export function formatEmployeeName(employee: Employee): string {
  if (!employee) return '';
  
  return employee.fullName || '';
}

/**
 * Gets initials from employee name
 */
export function getEmployeeInitials(employee: Employee): string {
  if (!employee || !employee.fullName) return '';
  
  // Разбиваем полное имя на части и берем первые буквы
  const nameParts = employee.fullName.split(' ').filter(part => part.length > 0);
  if (nameParts.length === 0) return '';
  
  // Берем первые буквы первого и последнего имени
  const firstInitial = nameParts[0].charAt(0).toUpperCase();
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}`;
}

/**
 * Generate a random color for employee avatar
 * Used for demonstration purposes only
 */
export function getRandomAvatarColor(): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}