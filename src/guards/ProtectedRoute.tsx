import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth/auth.store";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);

  // 1. If not logged in at all, kick them to the login screen
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Normalize roles just in case your backend sends lowercase
  const userRole = user.role?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  // 2. If their role isn't in the allowed list, send them back to the traffic controller
  if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  // 3. If they pass the checks, render the protected pages
  return <Outlet />;
}