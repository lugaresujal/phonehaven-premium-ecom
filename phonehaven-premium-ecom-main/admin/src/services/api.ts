const API_BASE_URL = '/api';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const finalHeaders = {
    ...headers,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: finalHeaders,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const productAPI = {
  getAll: () => apiCall('/products'),
  getById: (id: number) => apiCall(`/products/${id}`),
  create: (data: any) => apiCall('/products', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: any) => apiCall(`/products/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiCall(`/products/${id}`, { 
    method: 'DELETE' 
  }),
};

// ============================================
// CATEGORIES API
// ============================================
export const categoryAPI = {
  getAll: () => apiCall('/categories'),
  getById: (id: number) => apiCall(`/categories/${id}`),
  create: (data: any) => apiCall('/categories', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  update: (id: number, data: any) => apiCall(`/categories/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (id: number) => apiCall(`/categories/${id}`, { 
    method: 'DELETE' 
  }),
};

// ============================================
// ORDERS TYPES & API
// ============================================
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  qty: number;
  color?: string | null;
  storage?: string | null;
}

export interface OrderAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  state: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  date: string;
  status: string;
  cancellationReason?: string | null;
  subtotal: number;
  gstIncluded: number;
  shipping: number;
  total: number;
  tax?: number | null;
  deliveryLabel: string;
  deliveryFee: number;
  paymentMethod: string;
  paymentMode: string;
  paymentStatus: string;
  addressId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  address?: OrderAddress;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export const orderAPI = {
  test: () => apiCall("/orders-test"),
  getAll: (): Promise<OrdersResponse> => apiCall("/orders"),
  getById: (orderId: string): Promise<{ success: boolean; order: Order }> => apiCall(`/orders/${orderId}`),
  updateStatus: (orderId: string, status: string, paymentStatus?: string): Promise<{ success: boolean; message: string; order: Order }> =>
    apiCall(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, paymentStatus }),
    }),
  cancel: (orderId: string, reason?: string): Promise<{ success: boolean; message: string; status: string; order: Order }> =>
    apiCall(`/orders/${orderId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// ============================================
// DASHBOARD TYPES & API
// ============================================
export interface DashboardCounts {
  pending: number;
  processing: number;
  confirmed: number;
  packed: number;
  shipped: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  cancellationRequested: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  customers: number;
  products: number;
  counts?: DashboardCounts;
  statusBreakdown?: Record<string, number>;
  recentOrders: any[];
}

export const dashboardAPI = {
  getStats: (): Promise<{ success: boolean; stats: DashboardStats }> => apiCall("/dashboard/stats"),
  getOrders: (): Promise<OrdersResponse> => apiCall("/orders"),
};

// ============================================
// PAYMENTS API (COD ONLY FOR NOW)
// ============================================
export interface PaymentRecord {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: string;
  mode: string;
  status: string;
  orderStatus: string;
  date: string;
}

export const paymentAPI = {
  getAll: async (): Promise<{ success: boolean; payments: PaymentRecord[] }> => {
    const res = await orderAPI.getAll();
    const payments: PaymentRecord[] = (res.orders || []).map((o) => ({
      id: `TXN-${(o.orderId || o.id).replace("HOP-", "")}`,
      orderId: o.orderId || o.id,
      customer: o.address?.fullName || "Customer",
      amount: Number(o.total || 0),
      method: o.paymentMethod || "Cash on Delivery",
      mode: o.paymentMode || "cod",
      status: o.paymentStatus || (o.status === "Delivered" ? "Completed" : "Pending"),
      orderStatus: o.status,
      date: o.date || o.createdAt,
    }));
    return { success: true, payments };
  },
};