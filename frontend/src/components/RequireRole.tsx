import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/session";
import type { Role } from "@/lib/types";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24" data-testid="auth-loading">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === "employer" ? "/employer/dashboard" : "/student/dashboard"} replace />;
  }
  return <>{children}</>;
}
