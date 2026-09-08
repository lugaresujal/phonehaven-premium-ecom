import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const API_BASE = "/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider: string;
  memberSince: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  googleSignIn: (credential: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem("adminToken");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("adminToken");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Login failed." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Registration failed." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const googleSignIn = async (credential: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "Google sign-in failed." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message || "Failed to send reset code." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message || "Failed to reset password." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleSignIn,
        forgotPassword,
        resetPassword,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
