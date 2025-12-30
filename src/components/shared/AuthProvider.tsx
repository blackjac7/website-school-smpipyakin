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
  setUser: (user: User | null) => void; // Added setUser to context interface
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount (skip for login page)
  useEffect(() => {
    // Avoid re-running on every navigation to keep UI smooth
    if (hasInitialized) return;

    if (pathname !== "/login") {
      checkAuthStatus({ silent: false });
    } else {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [hasInitialized, pathname]);

  // Revalidate session on window focus without blocking the UI
  useEffect(() => {
    if (!hasInitialized) return;

    const handleFocus = () => {
      checkAuthStatus({ silent: true });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [hasInitialized]);

  const checkAuthStatus = async ({ silent }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      // Silent fetch for auth verification - don't show 401 errors in console
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      }).catch(() => {
        // If fetch fails completely, return a mock 401 response
        return new Response(JSON.stringify({ error: "Network error" }), {
          status: 401,
          statusText: "Unauthorized",
        });
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
      // Only log unexpected errors
      console.error("Unexpected auth check error:", error);
      setUser(null);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      setHasInitialized(true);
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
        // Enhanced error handling for security responses
        let errorMessage = "Username atau password salah";
        let errorDescription = "";

        switch (response.status) {
          case 429: // Rate limited
            errorMessage = "Terlalu banyak percobaan login";
            errorDescription = data.remainingAttempts
              ? `Sisa percobaan: ${data.remainingAttempts}. Coba lagi dalam ${Math.ceil(data.retryAfter / 60)} menit.`
              : `Silakan coba lagi dalam ${Math.ceil(data.retryAfter / 60)} menit.`;
            break;

          case 423: // Account locked
            errorMessage = "Akun sementara dikunci";
            errorDescription = `Akun dikunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(data.retryAfter / 3600)} jam.`;
            break;

          case 401: // Unauthorized
            errorMessage = "Login gagal";
            errorDescription = "Username, password, atau role tidak valid";
            break;

          case 400: // Bad request
            errorMessage = "Data tidak lengkap";
            errorDescription = "Pastikan semua field telah diisi dengan benar";
            break;

          default:
            errorMessage = "Login gagal";
            errorDescription =
              data.error || "Terjadi kesalahan yang tidak diketahui";
        }

        console.log("Login failed:", data.error); // Debug log
        showToast({
          type: "error",
          message: errorMessage,
          description: errorDescription,
          duration:
            response.status === 429 || response.status === 423 ? 8000 : 5000, // Longer duration for rate limit messages
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        type: "error",
        message: "Koneksi gagal",
        description:
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
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
    if (!user || !user.role) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    const normalizedUserRole = String(user.role).toLowerCase();
    const normalizedRoles = roleArray.map((r) => String(r).toLowerCase());
    return normalizedRoles.includes(normalizedUserRole);
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
        setUser, // Exposed setUser
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
