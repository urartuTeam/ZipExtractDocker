import { QueryClient } from "@tanstack/react-query";
import { Employee } from "@shared/schema";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  
  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => (context: { queryKey: any[] }) => Promise<T | null> = ({
  on401,
}) => {
  return async ({ queryKey }) => {
    const [url] = queryKey;
    const res = await fetch(url);
    
    if (res.status === 401) {
      if (on401 === "returnNull") {
        return null;
      } else {
        throw new Error("Unauthorized");
      }
    }
    
    await throwIfResNotOk(res);
    return res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
    },
  },
});

/**
 * Format employee full name
 */
export function formatEmployeeName(employee: Employee): string {
  if (!employee) return "";

  const parts = [employee.lastName, employee.firstName, employee.middleName];
  return parts.filter(Boolean).join(" ").trim();
}

/**
 * Gets initials from employee name
 */
export function getEmployeeInitials(employee: Employee): string {
  if (!employee) return "";

  // Берем первые буквы фамилии и имени
  const lastNameInitial = employee.lastName ? employee.lastName.charAt(0) : "";
  const firstNameInitial = employee.firstName ? employee.firstName.charAt(0) : "";

  return `${lastNameInitial}${firstNameInitial}`;
}

/**
 * Generate a random color for employee avatar
 * Used for demonstration purposes only
 */
export function getRandomAvatarColor(): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
