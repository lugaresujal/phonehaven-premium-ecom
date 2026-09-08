import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./auth";

/** Serializable action to resume after a successful login. */
export type PendingAction =
  | { type: "wishlist"; productId: string }
  | { type: "buyNow"; slug: string; color?: string; storage?: string }
  | { type: "checkout" }
  | { type: "none" };

export type LoginRedirectState = {
  from?: string;
  pendingAction?: PendingAction;
  reason?: string;
};

/**
 * Gate a protected action behind authentication.
 * Returns a function: when signed in it runs the action, otherwise it sends the
 * user to /login remembering where they were and what they were doing.
 */
export function useProtectedAction() {
  const { isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return React.useCallback(
    (pendingAction: PendingAction, run: () => void, message = "Please sign in to continue.") => {
      if (initializing) return;
      if (isAuthenticated) {
        run();
        return;
      }
      toast.info(message);
      const state: LoginRedirectState = {
        from: location.pathname + location.search,
        pendingAction,
        reason: message,
      };
      navigate("/login", { state });
    },
    [isAuthenticated, initializing, navigate, location],
  );
}
