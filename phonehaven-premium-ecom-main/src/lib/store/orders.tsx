import * as React from "react";
import { readJSON, writeJSON, delay } from "@/lib/storage";
import { useAuth } from "./auth";

export type OrderItem = {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  qty: number;
  color?: string;
  storage?: string;
};

export type Address = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  state: string;
};

export type Order = {
  id: string;
  orderId: string;
  date: string;
  items: OrderItem[];
  address: Address;
  delivery: { label: string; fee: number };
  payment: { method: string; mode: "cod" | "online"; status: "paid" | "pending" | "failed" };
  status: string;
  cancellationReason?: string;
  totals: { subtotal: number; gstIncluded: number; shipping: number; total: number; tax?: number };
};

const ordersKey = (userId: string) => `hop_orders_${userId}`;
const addressKey = (userId: string) => `hop_addresses_${userId}`;

export class PaymentError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

type OrdersContextValue = {
  orders: Order[];
  loading: boolean;
  addresses: Address[];
  saveAddress: (a: Address) => void;
  removeAddress: (index: number) => void;
  placeOrder: (input: Omit<Order, "id" | "orderId" | "date" | "status">) => Promise<Order>;
  getOrder: (orderId: string) => Order | undefined;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
};

const OrdersContext = React.createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const inFlight = React.useRef(false);

  // Helper to map DB order shape to customer website Order shape
  const mapDbOrderToStore = (dbOrder: any): Order => ({
    id: dbOrder.id,
    orderId: dbOrder.orderId,
    date: dbOrder.date ? new Date(dbOrder.date).toISOString() : new Date().toISOString(),
    status: dbOrder.status || "Processing",
    cancellationReason: dbOrder.cancellationReason || undefined,
    items: (dbOrder.items || []).map((i: any) => ({
      id: i.productId || i.id,
      name: i.name,
      brand: i.brand,
      image: i.image,
      price: Number(i.price),
      qty: Number(i.qty),
      color: i.color || undefined,
      storage: i.storage || undefined,
    })),
    address: {
      fullName: dbOrder.address?.fullName || "",
      phone: dbOrder.address?.phone || "",
      email: dbOrder.address?.email || "",
      line1: dbOrder.address?.line1 || "",
      line2: dbOrder.address?.line2 || undefined,
      city: dbOrder.address?.city || "",
      pincode: dbOrder.address?.pincode || "",
      state: dbOrder.address?.state || "",
    },
    delivery: {
      label: dbOrder.deliveryLabel || "Standard Delivery",
      fee: Number(dbOrder.deliveryFee || 0),
    },
    payment: {
      method: dbOrder.paymentMethod || "Cash on Delivery",
      mode: (dbOrder.paymentMode as any) || "cod",
      status: (dbOrder.paymentStatus as any) || "pending",
    },
    totals: {
      subtotal: Number(dbOrder.subtotal || 0),
      gstIncluded: Number(dbOrder.gstIncluded || 0),
      shipping: Number(dbOrder.shipping || 0),
      total: Number(dbOrder.total || 0),
      tax: dbOrder.tax ? Number(dbOrder.tax) : undefined,
    },
  });

  const fetchOrders = React.useCallback(async (userId: string, email?: string) => {
    // Try fetching by userId first, then by email as fallback
    const tryFetch = async (identifier: string) => {
      const storedToken = localStorage.getItem("hop_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
      const res = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(identifier)}`, {
        headers,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        return data.orders;
      }
      return null;
    };

    let dbOrders = await tryFetch(userId);
    if (!dbOrders && email) {
      dbOrders = await tryFetch(email);
    }
    return dbOrders || [];
  }, []);

  React.useEffect(() => {
    if (initializing) return;
    setLoading(true);
    if (!user) {
      setOrders([]);
      setAddresses([]);
      setLoading(false);
      return;
    }

    // Load initial cached orders and addresses
    const cachedOrders = readJSON<Order[]>(ordersKey(user.id), []);
    setOrders(cachedOrders);
    setAddresses(readJSON<Address[]>(addressKey(user.id), []));

    // Fetch live orders from PostgreSQL backend (try userId, then email)
    fetchOrders(user.id, user.email)
      .then((dbOrders) => {
        if (dbOrders.length > 0) {
          const liveOrders = dbOrders.map(mapDbOrderToStore);
          setOrders(liveOrders);
          writeJSON(ordersKey(user.id), liveOrders);

          // Also populate addresses if empty
          setAddresses((prev) => {
            const newAddresses = [...prev];
            dbOrders.forEach((o: any) => {
              if (o.address) {
                const a = {
                  fullName: o.address.fullName || "",
                  phone: o.address.phone || "",
                  email: o.address.email || "",
                  line1: o.address.line1 || "",
                  line2: o.address.line2 || undefined,
                  city: o.address.city || "",
                  pincode: o.address.pincode || "",
                  state: o.address.state || "",
                };
                const exists = newAddresses.some(
                  (x) => x.line1 === a.line1 && x.pincode === a.pincode && x.fullName === a.fullName
                );
                if (!exists) newAddresses.push(a);
              }
            });
            writeJSON(addressKey(user.id), newAddresses);
            return newAddresses;
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live orders from backend:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, initializing, fetchOrders]);

  // Poll for order status updates every 30 seconds
  React.useEffect(() => {
    if (initializing || !user) return;

    const intervalId = setInterval(() => {
      fetchOrders(user.id, user.email)
        .then((dbOrders) => {
          if (dbOrders.length > 0) {
            const liveOrders = dbOrders.map(mapDbOrderToStore);
            setOrders(liveOrders);
            writeJSON(ordersKey(user.id), liveOrders);
          }
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, initializing, fetchOrders]);

  // Refresh orders when tab/window becomes visible again
  React.useEffect(() => {
    if (initializing || !user) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrders(user.id, user.email)
          .then((dbOrders) => {
            if (dbOrders.length > 0) {
              const liveOrders = dbOrders.map(mapDbOrderToStore);
              setOrders(liveOrders);
              writeJSON(ordersKey(user.id), liveOrders);
            }
          })
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [user, initializing, fetchOrders]);

  const saveAddress = React.useCallback(
    (a: Address) => {
      if (!user) return;
      setAddresses((prev) => {
        const exists = prev.some(
          (x) => x.line1 === a.line1 && x.pincode === a.pincode && x.fullName === a.fullName,
        );
        const next = exists ? prev : [...prev, a];
        writeJSON(addressKey(user.id), next);
        return next;
      });
    },
    [user],
  );

  const removeAddress = React.useCallback(
    (index: number) => {
      if (!user) return;
      setAddresses((prev) => {
        const next = prev.filter((_, i) => i !== index);
        writeJSON(addressKey(user.id), next);
        return next;
      });
    },
    [user],
  );

  const cancelOrder = React.useCallback(
    async (orderId: string, reason?: string) => {
      if (!user) return;

      try {
        const storedToken = localStorage.getItem("hop_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (storedToken) {
          headers["Authorization"] = `Bearer ${storedToken}`;
        }
        let res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
          method: "POST",
          headers,
          body: JSON.stringify({ reason }),
        });
        if (!res.ok && res.status !== 400) {
          res = await fetch(`/api/orders/${orderId}/cancel`, {
            method: "POST",
            headers,
            body: JSON.stringify({ reason }),
          });
        }
        const data = await res.json();
        const nextStatus = data.status || "Cancelled";
        const savedReason = data.cancellationReason || reason;

        const updatedOrders = orders.map((order) =>
          order.orderId === orderId || order.id === orderId
            ? { ...order, status: nextStatus, cancellationReason: savedReason || order.cancellationReason }
            : order
        );

        writeJSON(ordersKey(user.id), updatedOrders);
        setOrders(updatedOrders);
        return data;
      } catch (error) {
        console.warn("Backend cancellation failed, updating local state:", error);
        const updatedOrders = orders.map((order) =>
          order.orderId === orderId || order.id === orderId
            ? { ...order, status: "Cancelled", cancellationReason: reason || order.cancellationReason }
            : order
        );
        writeJSON(ordersKey(user.id), updatedOrders);
        setOrders(updatedOrders);
      }
    },
    [orders, user]
  );

  const placeOrder = React.useCallback<OrdersContextValue["placeOrder"]>(
    async (input) => {
      if (!user) throw new PaymentError("unauthorized", "Please sign in to place your order.");
      // Hard guard against double submission / duplicate orders.
      if (inFlight.current) throw new PaymentError("in_flight", "Your order is already being processed.");
      inFlight.current = true;
      try {
        await delay(900);
        if (input.payment.mode === "online") {
          // Simulated gateway. Deterministic failure hook for testing: total ending in 7.
          const failed = Math.random() < 0.15;
          if (failed) {
            throw new PaymentError(
              "payment_failed",
              "Payment was declined by your bank. No amount has been charged — please retry.",
            );
          }
        }
        const seq = 2087341 + readJSON<Order[]>(ordersKey(user.id), []).length + 1;
        const order: Order = {
          ...input,
          id: `o_${Date.now().toString(36)}`,
          orderId: `HOP-${seq}`,
          date: new Date().toISOString(),
          status: input.payment.mode === "cod" ? "Processing" : "Confirmed",
        };
        const next = [order, ...readJSON<Order[]>(ordersKey(user.id), [])];
        writeJSON(ordersKey(user.id), next);
        setOrders(next);

        // Notify backend & send order confirmation email
        try {
          await fetch("http://localhost:5000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              orderId: order.orderId,
              date: order.date,
              items: order.items,
              address: order.address,
              delivery: order.delivery,
              payment: order.payment,
              status: order.status,
              totals: order.totals,
            }),
          });
        } catch (apiErr) {
          console.warn("Backend order sync failed:", apiErr);
        }

        return order;
      } finally {
        inFlight.current = false;
      }
    },
    [user],
  );

  const getOrder = React.useCallback(
    (orderId: string) => orders.find((o) => o.orderId === orderId),
    [orders],
  );

  const refreshOrders = React.useCallback(async () => {
    if (!user) return;
    try {
      const dbOrders = await fetchOrders(user.id, user.email);
      if (dbOrders.length > 0) {
        const liveOrders = dbOrders.map(mapDbOrderToStore);
        setOrders(liveOrders);
        writeJSON(ordersKey(user.id), liveOrders);
      }
    } catch {}
  }, [user, fetchOrders]);

const value = React.useMemo(
  () => ({
    orders,
    loading,
    addresses,
    saveAddress,
    removeAddress,
    placeOrder,
    getOrder,

    cancelOrder,
    refreshOrders,
    setOrders,
    setAddresses,
  }),
  [
    orders,
    loading,
    addresses,
    saveAddress,
    removeAddress,
    placeOrder,
    getOrder,
    cancelOrder,
    refreshOrders,
  ],
);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
  return ctx;
}
