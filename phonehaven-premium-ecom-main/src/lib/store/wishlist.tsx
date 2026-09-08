import * as React from "react";
import { readJSON, writeJSON, removeKey } from "@/lib/storage";
import { findProductById, type Product } from "@/lib/mock-data";
import { useAuth } from "./auth";

const guestKey = "hop_wishlist_guest";
const wKey = (userId?: string | null) => (userId ? `hop_wishlist_${userId}` : guestKey);

type WishlistContextValue = {
  ids: string[];
  items: Product[];
  loading: boolean;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  /** Returns true when the product ended up in the wishlist. */
  toggle: (id: string) => boolean;
  clear: () => void;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const [ids, setIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (initializing) return;
    setLoading(true);
    const own = readJSON<string[]>(wKey(user?.id), []);
    let merged = own;
    if (user) {
      const guest = readJSON<string[]>(guestKey, []);
      if (guest.length) {
        merged = Array.from(new Set([...own, ...guest]));
        removeKey(guestKey);
        writeJSON(wKey(user.id), merged);
      }
    }
    // De-duplicate and drop unknown products.
    merged = Array.from(new Set(merged)).filter((id) => !!findProductById(id));
    setIds(merged);
    setLoading(false);
  }, [user, initializing]);

  const persist = React.useCallback(
    (next: string[]) => {
      writeJSON(wKey(user?.id), next);
      return next;
    },
    [user],
  );

  const has = React.useCallback((id: string) => ids.includes(id), [ids]);

  const add = React.useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev : persist([...prev, id]))),
    [persist],
  );

  const remove = React.useCallback(
    (id: string) => setIds((prev) => persist(prev.filter((x) => x !== id))),
    [persist],
  );

  const toggle = React.useCallback(
    (id: string) => {
      const next = !ids.includes(id);
      if (next) add(id);
      else remove(id);
      return next;
    },
    [ids, add, remove],
  );

  const clear = React.useCallback(() => setIds(() => persist([])), [persist]);

  const items = React.useMemo(
    () => ids.map((id) => findProductById(id)).filter(Boolean) as Product[],
    [ids],
  );

  const value = React.useMemo(
    () => ({ ids, items, loading, has, add, remove, toggle, clear }),
    [ids, items, loading, has, add, remove, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
