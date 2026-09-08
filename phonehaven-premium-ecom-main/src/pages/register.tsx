import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth, isValidEmail, isValidPhone } from "@/lib/store/auth";
import { GOOGLE_CLIENT_ID } from "@/lib/store";
import type { LoginRedirectState } from "@/lib/store/protected";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — House of Phones" },
      { name: "description", content: "Join House of Phones to track orders, save wishlists and unlock offers." },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: RegisterPage,
});

type Errors = Partial<Record<"name" | "email" | "phone" | "password" | "confirmPassword" | "form", string>>;

function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginRedirectState;

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined, form: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = "Please enter your full name (minimum 2 characters).";
    }
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (form.phone.trim() && !isValidPhone(form.phone)) {
      next.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!form.password) {
      next.password = "Password is required.";
    } else if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters.";
    }
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success("Account created successfully. Welcome to House of Phones!");
      navigate(state.from || "/account", { replace: true });
    } catch (err: any) {
      setErrors({ form: err?.message ?? "Could not create your account. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    setErrors({});
    try {
      await loginWithGoogle({ credential: credentialResponse.credential });
      toast.success("Account created with Google successfully!");
      navigate(state.from || "/account", { replace: true });
    } catch (err: any) {
      setErrors({ form: err?.message ?? "Google sign in failed. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputCls = (bad?: string) =>
    `w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none transition-colors ${bad ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`;

  return (
    <PageLayout bare>
      <section className="container-hop py-10 md:py-16 max-w-lg">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10">
          <h2 className="font-serif text-3xl">Create Your Account</h2>
          <p className="text-sm text-muted-foreground mt-2">Join the House of Phones community.</p>

          {/* Google Sign In */}
          {GOOGLE_CLIENT_ID && (
            <div className="mt-6 flex flex-col items-center">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrors({ form: "Google login could not be initialized." })}
                  text="signup_with"
                  shape="pill"
                  width="350"
                />
              </div>
              <div className="w-full flex items-center my-5 gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or register with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {errors.form && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Full Name *</label>
              <input placeholder="John Doe" value={form.name} onChange={set("name")} autoComplete="name" className={inputCls(errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email Address *</label>
              <input placeholder="name@example.com" value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" className={inputCls(errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number (Optional)</label>
              <input placeholder="9876543210" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" className={inputCls(errors.phone)} />
              {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  className={`${inputCls(errors.password)} pr-11`}
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
              {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  autoComplete="new-password"
                  className={`${inputCls(errors.confirmPassword)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Creating Account" : "Create Account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
