// Token storage key
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Set token in localStorage
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set user data in localStorage
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user has a specific role
export const hasRole = (role) => {
  const user = getUser();
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes(role);
};

// Check if user is an admin
export const isAdmin = () => {
  return hasRole('ROLE_ADMIN');
};

// Check if user is a manager
export const isManager = () => {
  return hasRole('ROLE_MANAGER') || hasRole('ROLE_ADMIN');
};

// Logout - clear localStorage
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
