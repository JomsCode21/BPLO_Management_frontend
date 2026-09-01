import { useAuthStore } from "@/stores/auth/auth.store";
import { Navigate } from "react-router-dom";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === "evaluator" || user?.role === "EVALUATOR") {
    return <Navigate to="/home/evaluator/dashboard" replace />;
  }

  if (user?.role === "super_admin" || user?.role === "SUPER_ADMIN") {
    return <Navigate to="/home/super_admin/dashboard" replace />;
  }

  if (user?.role === "inspector" || user?.role === "INSPECTOR") {
    return <Navigate to="/home/inspector/dashboard" replace />;
  }

  if (user?.role === "bplo_admin" || user?.role === "BPLO_ADMIN") {
    return <Navigate to="/home/bplo_admin/dashboard" replace />;
  }

  if (
    user?.role === "department_treasurer" ||
    user?.role === "DEPARTMENT_TREASURER"
  ) {
    return <Navigate to="/home/department_treasurer/dashboard" replace />;
  }

  if (user?.role === "main_treasurer" || user?.role === "MAIN_TREASURER") {
    return <Navigate to="/home/main_treasurer/dashboard" replace />;
  }

  if (user?.role === "business_owner" || user?.role === "BUSINESS_OWNER") {
    return <Navigate to="/home/user/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}
