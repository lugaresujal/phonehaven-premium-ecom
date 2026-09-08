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
  cancelOrder: (orderId: string) => Promise<void>;
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

  React.useEffect(() => {
    if (initializing) return;
    setLoading(true);
    if (!user) {
      setOrders([]);
      setAddresses([]);
      setLoading(false);
      return;
    }
    setOrders(readJSON<Order[]>(ordersKey(user.id), []));
    setAddresses(readJSON<Address[]>(addressKey(user.id), []));
    setLoading(false);
  }, [user, initializing]);

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
  async (orderId: string) => {
    if (!user) return;

    await delay(300);

    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status: "Cancelled" }
        : order
    );

    writeJSON(ordersKey(user.id), updatedOrders);
    setOrders(updatedOrders);
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
  ],
);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
  return ctx;
}
