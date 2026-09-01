// Libraries
import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthFallbackSkeleton } from "./auth-fallback-skeleton";
// Stores
import { useTokenStore } from "@/stores/token/token.store";

export default function AuthLayout() {
  const accessToken = useTokenStore((s) => s.accessToken);
  const location = useLocation();

  if (accessToken) return <Navigate to="/home" replace />;

  return (
    <Suspense fallback={<AuthFallbackSkeleton pathname={location.pathname} />}>
      <Outlet />
    </Suspense>
  );
}
