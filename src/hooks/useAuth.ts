import { useState, useEffect } from "react";

/**
 * User interface representing the authenticated user.
 */
interface User {
  id: string;
  username: string;
  role: string;
  name?: string;
  email?: string;
  permissions: string[];
}

/**
 * Interface for the return value of useAuth hook.
 */
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

/**
 * Custom hook for handling authentication.
 * Manages user state, login, logout, and permission checking.
 * @returns {UseAuthReturn} Authentication object containing user state and methods.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount (skip for login page)
  useEffect(() => {
    // Only check auth if not on login page to avoid unnecessary 401 errors
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Checks if the user is currently authenticated by verifying the token with the server.
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // 401 is expected when user is not authenticated, don't log as error
        if (response.status !== 401) {
          console.error("Auth check failed with status:", response.status);
        }
        setUser(null);
      }
    } catch (err) {
      // Only log network errors, not authentication failures
      console.error("Auth check network error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs in a user with the provided credentials.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @param {string} role - The role the user is logging in as.
   * @returns {Promise<boolean>} - True if login was successful, false otherwise.
   */
  const login = async (
    username: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return true;
      } else {
        setError(data.error || "Login failed");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user.
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);

      // Redirect to login page
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Checks if the current user has a specific permission.
   * @param {string} permission - The permission to check.
   * @returns {boolean} - True if the user has the permission, false otherwise.
   */
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  /**
   * Checks if the current user has a specific role or one of a list of roles.
   * @param {string | string[]} roles - The role or array of roles to check.
   * @returns {boolean} - True if the user has the role (or one of the roles), false otherwise.
   */
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
  };
}
