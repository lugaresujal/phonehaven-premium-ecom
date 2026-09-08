// CMS API Service — All Admin Module API calls
const API_BASE = "/api";

function getToken(): string {
  return localStorage.getItem("adminToken") || "";
}

async function apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.message || "Image upload failed");
  return data.url;
}

export const brandsAPI = {
  getAll: () => apiCall("/brands"),
  create: (data: Record<string, unknown>) => apiCall("/brands", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/brands/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/brands/${id}`, { method: "DELETE" }),
};

export const categoriesAPI = {
  getAll: () => apiCall("/categories"),
  create: (data: Record<string, unknown>) => apiCall("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/categories/${id}`, { method: "DELETE" }),
};

export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/products${qs}`);
  },
  getById: (id: string) => apiCall(`/products/${id}`),
  create: (data: Record<string, unknown>) => apiCall("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/products/${id}`, { method: "DELETE" }),
};

export const inventoryAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/inventory${qs}`);
  },
  adjustStock: (id: string, data: { change: number; reason?: string; staffNote?: string }) =>
    apiCall(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  getLogs: (id: string) => apiCall(`/inventory/${id}/logs`),
};

export const customersAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/customers${qs}`);
  },
  getById: (id: string) => apiCall(`/customers/${id}`),
  updateStatus: (id: string, status: string) =>
    apiCall(`/customers/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const offersAPI = {
  getAll: () => apiCall("/offers"),
  create: (data: Record<string, unknown>) => apiCall("/offers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/offers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/offers/${id}`, { method: "DELETE" }),
};

export const couponsAPI = {
  getAll: () => apiCall("/coupons"),
  create: (data: Record<string, unknown>) => apiCall("/coupons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/coupons/${id}`, { method: "DELETE" }),
};

export const bannersAPI = {
  getAll: () => apiCall("/banners"),
  create: (data: Record<string, unknown>) => apiCall("/banners", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/banners/${id}`, { method: "DELETE" }),
};

export const blogAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/blog${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/blog", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/blog/${id}`, { method: "DELETE" }),
};

export const faqsAPI = {
  getAll: () => apiCall("/faqs"),
  create: (data: Record<string, unknown>) => apiCall("/faqs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/faqs/${id}`, { method: "DELETE" }),
};

export const reviewsAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/reviews${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/reviews", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id: string, data: { status?: string; featured?: boolean }) =>
    apiCall(`/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/reviews/${id}`, { method: "DELETE" }),
};

export const returnsAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/returns${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/returns", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/returns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const repairsAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/repairs${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/repairs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/repairs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const exchangesAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/exchanges${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/exchanges", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/exchanges/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const storesAPI = {
  getAll: () => apiCall("/stores"),
  create: (data: Record<string, unknown>) => apiCall("/stores", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/stores/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/stores/${id}`, { method: "DELETE" }),
};

export const enquiriesAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/enquiries${qs}`);
  },
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/enquiries/${id}`, { method: "DELETE" }),
};

export const corporateAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/corporate${qs}`);
  },
  create: (data: Record<string, unknown>) => apiCall("/corporate", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiCall(`/corporate/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const staffAPI = {
  getAll: () => apiCall("/staff"),
  create: (data: Record<string, unknown>) => apiCall("/staff", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiCall(`/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/staff/${id}`, { method: "DELETE" }),
};

export const activityLogsAPI = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiCall(`/activity-logs${qs}`);
  },
  log: (data: { staffName?: string; action: string; module: string; recordId?: string; description: string }) =>
    apiCall("/activity-logs", { method: "POST", body: JSON.stringify(data) }),
};

export const settingsAPI = {
  get: () => apiCall("/settings"),
  save: (data: Record<string, string>) => apiCall("/settings", { method: "PUT", body: JSON.stringify(data) }),
};

export const notificationsAPI = {
  getAll: () => apiCall("/notifications"),
  getUnreadCount: () => apiCall("/notifications/unread-count"),
  markAsRead: (id: string) => apiCall(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiCall("/notifications/read-all", { method: "PATCH" }),
};

