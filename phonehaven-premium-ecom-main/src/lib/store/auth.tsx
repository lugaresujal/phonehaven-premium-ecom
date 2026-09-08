import * as React from "react";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";

const API_BASE_URL = "http://localhost:5000/api/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider: "password" | "google";
  memberSince: string;
};

const TOKEN_KEY = "hop_token";
const USER_KEY = "hop_user";

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e.trim());
export const isValidPhone = (p: string) => /^(\+91[-\s]?)?[6-9]\d{9}$/.test(p.replace(/\s|-/g, ""));

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (identifier: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  loginWithGoogle: (payload: { credential?: string; email?: string; name?: string; googleId?: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "email">>) => void;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => readJSON<User | null>(USER_KEY, null));
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = React.useState(true);

  // Initialize and verify session with backend
  React.useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = readJSON<User | null>(USER_KEY, null);

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setInitializing(false);
        return;
      }

      if (storedUser) {
        setUser(storedUser);
        setToken(storedToken);
      }

      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            writeJSON(USER_KEY, data.user);
          }
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          removeKey(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn("Could not verify session with backend:", err);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, []);

  // Multi-tab storage synchronization
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        const updatedToken = localStorage.getItem(TOKEN_KEY);
        const updatedUser = readJSON<User | null>(USER_KEY, null);
        setToken(updatedToken);
        setUser(updatedUser);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = React.useCallback<AuthContextValue["login"]>(async (identifier, password) => {
    const cleanId = identifier.trim();
    if (!cleanId) throw new AuthError("missing_identifier", "Please enter your email address.");
    if (!password) throw new AuthError("missing_password", "Please enter your password.");

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new AuthError("invalid_credentials", data.message || "Incorrect email or password.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      writeJSON(USER_KEY, data.user);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("network_error", err.message || "Unable to connect to server. Please try again.");
    }
  }, []);

  const register = React.useCallback<AuthContextValue["register"]>(async ({ name, email, phone, password }) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) throw new AuthError("missing_name", "Please enter your full name.");
    if (!isValidEmail(cleanEmail)) throw new AuthError("invalid_email", "Enter a valid email address.");
    if (phone && !isValidPhone(phone)) throw new AuthError("invalid_phone", "Enter a valid 10-digit mobile number.");
    if (password.length < 6) throw new AuthError("weak_password", "Password must be at least 6 characters.");

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: phone?.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new AuthError("register_failed", data.message || "Could not create account. Please try again.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      writeJSON(USER_KEY, data.user);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("network_error", err.message || "Unable to connect to server. Please try again.");
    }
  }, []);

  const loginWithGoogle = React.useCallback<AuthContextValue["loginWithGoogle"]>(async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new AuthError("google_failed", data.message || "Google authentication failed.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      writeJSON(USER_KEY, data.user);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("network_error", err.message || "Google sign-in failed. Please try again.");
    }
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    removeKey(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = React.useCallback<AuthContextValue["updateProfile"]>((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      writeJSON(USER_KEY, next);
      return next;
    });
  }, []);

  const forgotPassword = React.useCallback<AuthContextValue["forgotPassword"]>(async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      throw new AuthError("invalid_email", "Please enter a valid email address.");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new AuthError("forgot_password_failed", data.message || "Failed to process forgot password.");
      }

      return data.message;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("network_error", err.message || "Unable to connect to server. Please try again.");
    }
  }, []);

  const resetPassword = React.useCallback<AuthContextValue["resetPassword"]>(async (email, resetToken, newPassword) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = resetToken.trim();

    if (!cleanEmail) throw new AuthError("missing_email", "Please provide your email address.");
    if (!cleanOtp) throw new AuthError("missing_otp", "Please enter the 6-digit verification code.");
    if (newPassword.length < 6) throw new AuthError("weak_password", "Password must be at least 6 characters.");

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new AuthError("reset_failed", data.message || "Failed to reset password. Please check your verification code.");
      }
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      throw new AuthError("network_error", err.message || "Unable to connect to server. Please try again.");
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: !!user,
      token,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      forgotPassword,
      resetPassword,
    }),
    [user, initializing, token, login, register, loginWithGoogle, logout, updateProfile, forgotPassword, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
