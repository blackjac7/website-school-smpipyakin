import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: string;
  name?: string;
  email?: string;
  permissions: string[];
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

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
        // Mark that we have a valid session
        if (typeof window !== "undefined") {
          localStorage.setItem("hasSession", "true");
        }
      } else {
        // Clear session marker
        if (typeof window !== "undefined") {
          localStorage.removeItem("hasSession");
        }
        // Only log unexpected errors (not 401)
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

  const login = async (
    username: string,
    password: string,
    role: string,
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

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.role) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    const normalizedUserRole = String(user.role).toLowerCase();
    const normalizedRoles = roleArray.map((r) => String(r).toLowerCase());
    return normalizedRoles.includes(normalizedUserRole);
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
