"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import { LoadingEffect } from "@/components/shared";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackUrl?: string;
}

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
    return <LoadingEffect />;
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
