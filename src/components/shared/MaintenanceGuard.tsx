import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isMaintenanceMode } from "@/lib/siteSettings";
import { MAINTENANCE_EXCLUDED_ROUTES } from "@/lib/constants";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function MaintenanceGuard() {
  // Check if maintenance mode is enabled
  const maintenanceEnabled = await isMaintenanceMode();
  
  if (!maintenanceEnabled) {
    return null;
  }

  // Get current path from headers (set by middleware)
  const headersList = await headers();
  const currentPath = headersList.get("x-current-path") || "/";

  // Check if the current path is excluded from maintenance
  const isExcluded = MAINTENANCE_EXCLUDED_ROUTES.some((route) =>
    currentPath.startsWith(route)
  );

  if (isExcluded) {
    return null;
  }

  // Check if user is admin (admins bypass maintenance)
  const user = await getAuthenticatedUser();
  
  if (user && isAdminRole(user.role)) {
    return null;
  }

  // Redirect to maintenance page
  redirect("/maintenance");
}
