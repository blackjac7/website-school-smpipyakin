"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import { SimpleLoading } from "@/components/shared";

/**
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** The child components to render if the user is authorized. */
  children: ReactNode;
  /** An array of roles allowed to access this route. */
  requiredRoles?: string[];
  /** An array of permissions required to access this route. */
  requiredPermissions?: string[];
  /** The URL to redirect to if the user is not authenticated. */
  fallbackUrl?: string;
}

/**
 * ProtectedRoute component.
 * Wraps components that require authentication and specific roles/permissions.
 * Redirects unauthenticated or unauthorized users to appropriate pages.
 * @param {ProtectedRouteProps} props - The component props.
 * @returns {JSX.Element | null} The children if authorized, otherwise null or a loading indicator.
 */
export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackUrl = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.push(fallbackUrl);
        return;
      }

      // Check role requirements
      if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        // User doesn't have required role, redirect
        router.push("/unauthorized");
        return;
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every((permission) =>
          hasPermission(permission)
        );

        if (!hasAllPermissions) {
          // User doesn't have required permissions, redirect
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [
    user,
    isLoading,
    hasRole,
    hasPermission,
    requiredRoles,
    requiredPermissions,
    router,
    fallbackUrl,
  ]);

  // Show loading while checking authentication
  if (isLoading) {
    return <SimpleLoading />;
  }

  // Don't render children if user is not authenticated or authorized
  if (!user) {
    return null;
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return null;
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      return null;
    }
  }

  return <>{children}</>;
}
