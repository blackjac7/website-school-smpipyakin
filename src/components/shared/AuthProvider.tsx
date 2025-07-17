"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import LogoutAnimation from "./LogoutAnimation";
import ToastNotification from "./ToastNotification";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  email?: string;
  avatar?: string;
  permissions: string[];
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
  duration?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  showToast: (toast: Omit<Toast, "id">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount (skip for login page)
  useEffect(() => {
    // Don't check auth status on login page to avoid unnecessary 401 errors
    if (pathname !== "/login") {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
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
    } catch (error) {
      // Only log network errors, not authentication failures
      console.error("Auth check network error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

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
        showToast({
          type: "success",
          message: "Login berhasil",
          description: `Selamat datang, ${data.user.name || data.user.username}!`,
          duration: 3000,
        });

        // Add delay to ensure cookie is set before redirect
        setTimeout(() => {
          // Redirect to appropriate dashboard
          router.push(`/dashboard-${role}`);
        }, 500);

        return true;
      } else {
        console.log("Login failed:", data.error); // Debug log
        showToast({
          type: "error",
          message: "Login gagal",
          description: data.error || "Username atau password salah",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        type: "error",
        message: "Login gagal",
        description: "Terjadi kesalahan jaringan",
        duration: 5000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast = { id, ...toast };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      // Show animation
      setShowAnimation(true);

      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear user state
      setUser(null);

      // Show success toast
      showToast({
        type: "success",
        message: "Logout berhasil",
        description: "Anda telah keluar dari sistem",
        duration: 3000,
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      showToast({
        type: "error",
        message: "Logout gagal",
        description: "Terjadi kesalahan saat logout",
        duration: 3000,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    // Set flag for logout success message
    sessionStorage.setItem("justLoggedOut", "true");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggingOut,
        login,
        logout,
        hasPermission,
        hasRole,
        showToast,
      }}
    >
      {children}

      {/* Logout Animation */}
      <LogoutAnimation
        isVisible={showAnimation}
        onComplete={handleAnimationComplete}
      />

      {/* Toast Notifications */}
      <ToastNotification
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: removeToast,
        }))}
        onClose={removeToast}
      />
    </AuthContext.Provider>
  );
}
