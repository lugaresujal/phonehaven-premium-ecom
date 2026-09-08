import * as React from "react";
import { toast } from "sonner";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";
import { findProductById, type Product } from "@/lib/mock-data";
import { useAuth } from "./auth";

export type CartLine = {
  /** Stable line key: product + variant. */
  key: string;
  id: string;
  qty: number;
  color?: string;
  storage?: string;
};

export type CartItem = CartLine & { product: Product };

export const MAX_QTY_PER_LINE = 5;

const guestKey = "hop_cart_guest";
const cartKey = (userId?: string | null) => (userId ? `hop_cart_${userId}` : guestKey);

export const lineKey = (id: string, color?: string, storage?: string) =>
  [id, color ?? "-", storage ?? "-"].join("|");

function hydrate(lines: CartLine[]): CartItem[] {
  return lines
    .map((l) => {
      const product = findProductById(l.id);
      if (!product) return null; // product no longer sold — silently dropped
      return { ...l, product };
    })
    .filter(Boolean) as CartItem[];
}

type AddInput = {
  product: Product;
  qty?: number;
  color?: string;
  storage?: string;
};

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  add: (input: AddInput) => boolean;
  setQty: (key: string, qty: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  hasLine: (id: string, color?: string, storage?: string) => boolean;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load + merge guest cart into the user cart on login.
  React.useEffect(() => {
    if (initializing) return;
    setLoading(true);
    const own = readJSON<CartLine[]>(cartKey(user?.id), []);
    let merged = own;
    if (user) {
      const guest = readJSON<CartLine[]>(guestKey, []);
      if (guest.length) {
        const map = new Map(own.map((l) => [l.key, { ...l }]));
        guest.forEach((g) => {
          const existing = map.get(g.key);
          if (existing) existing.qty = Math.min(MAX_QTY_PER_LINE, existing.qty + g.qty);
          else map.set(g.key, g);
        });
        merged = Array.from(map.values());
        removeKey(guestKey);
        writeJSON(cartKey(user.id), merged);
      }
    }
    setLines(merged);
    setLoading(false);
  }, [user, initializing]);

  const persist = React.useCallback(
    (next: CartLine[]) => {
      writeJSON(cartKey(user?.id), next);
      return next;
    },
    [user],
  );

  const items = React.useMemo(() => hydrate(lines), [lines]);

  const add = React.useCallback<CartContextValue["add"]>(
    ({ product, qty = 1, color, storage }) => {
      if (product.stock <= 0) {
        toast.error("This product is currently out of stock.");
        return false;
      }
      const key = lineKey(product.id, color, storage);
      let ok = true;
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        const currentQty = existing?.qty ?? 0;
        const cap = Math.min(MAX_QTY_PER_LINE, product.stock);
        const nextQty = Math.min(cap, currentQty + qty);
        if (existing && nextQty === currentQty) {
          toast.info(`You can order a maximum of ${cap} unit${cap > 1 ? "s" : ""} of this item.`);
          ok = false;
          return prev;
        }
        // Duplicate products are merged into a single line instead of duplicated.
        const next = existing
          ? prev.map((l) => (l.key === key ? { ...l, qty: nextQty } : l))
          : [...prev, { key, id: product.id, qty: nextQty, color, storage }];
        return persist(next);
      });
      return ok;
    },
    [persist],
  );

  const setQty = React.useCallback<CartContextValue["setQty"]>(
    (key, qty) => {
      setLines((prev) => {
        const line = prev.find((l) => l.key === key);
        if (!line) return prev;
        const product = findProductById(line.id);
        const cap = Math.min(MAX_QTY_PER_LINE, product?.stock ?? MAX_QTY_PER_LINE);
        const safe = Math.max(1, Math.min(cap, Math.floor(Number(qty) || 1)));
        if (safe === line.qty) return prev;
        return persist(prev.map((l) => (l.key === key ? { ...l, qty: safe } : l)));
      });
    },
    [persist],
  );

  const increment = React.useCallback(
    (key: string) => {
      const line = lines.find((l) => l.key === key);
      if (line) setQty(key, line.qty + 1);
    },
    [lines, setQty],
  );

  const decrement = React.useCallback(
    (key: string) => {
      const line = lines.find((l) => l.key === key);
      if (line) setQty(key, line.qty - 1);
    },
    [lines, setQty],
  );

  const remove = React.useCallback<CartContextValue["remove"]>(
    (key) => setLines((prev) => persist(prev.filter((l) => l.key !== key))),
    [persist],
  );

  const clear = React.useCallback(() => setLines(() => persist([])), [persist]);

  const hasLine = React.useCallback(
    (id: string, color?: string, storage?: string) => lines.some((l) => l.key === lineKey(id, color, storage)),
    [lines],
  );

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  const value = React.useMemo(
    () => ({ items, loading, count, subtotal, add, setQty, increment, decrement, remove, clear, hasLine }),
    [items, loading, count, subtotal, add, setQty, increment, decrement, remove, clear, hasLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
