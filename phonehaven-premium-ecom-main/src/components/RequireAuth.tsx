import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/store/auth";
import type { LoginRedirectState, PendingAction } from "@/lib/store/protected";

/** Full-page loader shown while the stored session is being validated. */
function SessionLoading() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Checking your session…</p>
      </div>
    </div>
  );
}

export function RequireAuth({
  children,
  pendingAction = { type: "none" },
  reason = "Please sign in to continue.",
}: {
  children: React.ReactNode;
  pendingAction?: PendingAction;
  reason?: string;
}) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <SessionLoading />;

  if (!isAuthenticated) {
    const state: LoginRedirectState = {
      from: location.pathname + location.search,
      pendingAction,
      reason,
    };
    return <Navigate to="/login" state={state} replace />;
  }

  return <>{children}</>;
}
