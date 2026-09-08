import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/lib/store/auth";
import { useWishlist } from "@/lib/store/wishlist";
import { GOOGLE_CLIENT_ID } from "@/lib/store";
import type { LoginRedirectState } from "@/lib/store/protected";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — House of Phones" },
      { name: "description", content: "Sign in to access your orders, wishlist and personalised offers." },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, initializing } = useAuth();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginRedirectState;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resume = () => {
    const pending = state.pendingAction;
    if (pending?.type === "wishlist") {
      wishlist.add(pending.productId);
      toast.success("Saved to your wishlist");
    }
    navigate(state.from || "/account", { replace: true });
  };

  useEffect(() => {
    if (!initializing && isAuthenticated) navigate(state.from || "/account", { replace: true });
  }, [initializing, isAuthenticated]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!identifier.trim()) return setError("Please enter your email address.");
    if (!password) return setError("Please enter your password.");
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      toast.success("Welcome back!");
      resume();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    setError(null);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google.");
      }
      await loginWithGoogle({ credential: credentialResponse.credential });
      toast.success("Welcome back!");
      resume();
    } catch (err: any) {
      setError(err?.message ?? "Google sign in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <PageLayout bare>
      <section className="container-hop py-10 md:py-16 grid lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl">
        <div className="hidden lg:block rounded-3xl bg-gradient-to-br from-[#efe4d3] to-[#d9c4a4] p-10">
          <p className="text-xs uppercase tracking-widest text-primary">Welcome back</p>
          <h1 className="mt-3 font-serif text-4xl">Sign in to your account</h1>
          <p className="mt-4 text-foreground/70">Access your orders, wishlist, wallet and personalized offers.</p>
        </div>
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10">
          <h2 className="font-serif text-2xl">Sign In</h2>
          {state.reason && !error && (
            <p className="mt-3 text-sm text-primary">{state.reason}</p>
          )}

          <form className="space-y-4 mt-6" onSubmit={onSubmit} noValidate>
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                placeholder="name@example.com"
                inputMode="email"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Signing In" : "Sign In"}
            </button>
          </form>

          {/* Google Sign In */}
          {GOOGLE_CLIENT_ID && (
            <div className="mt-5 flex flex-col items-center">
              <div className="w-full flex items-center mb-5 gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login could not be initialized or was canceled.")}
                  text="continue_with"
                  shape="pill"
                  width="350"
                />
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground text-center">
            New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
