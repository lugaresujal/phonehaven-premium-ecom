import { Link } from "@tanstack/react-router";
import { Link as RRLink, useNavigate, useLocation } from "react-router-dom";
import { MapPin, Phone, Package, User, Heart, ShoppingBag, Search, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/store/auth";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useSettings } from "@/lib/store/settings-store";
import { formatINR } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";

const nav = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Brands", to: "/brands" },
  { label: "Accessories", to: "/accessories" },
  { label: "Offers", to: "/offers" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const { allProducts } = useProducts();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const { count } = useCart();
  const { ids } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlistCount = ids.length;

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return allProducts
      .filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [q, allProducts]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(term)}`);
  };

  // Lock body scroll while the mobile drawer is open — prevents background scroll/jump.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const storePhone = settings.storePhone || "+91 9637671118";
  const cleanPhone = storePhone.replace(/\s+/g, "");
  const storeCity = settings.city || "Pune";
  const storeState = settings.state || "Maharashtra";
  const storeAddress = settings.storeAddress || `${storeCity}, ${storeState}`;
  const isTrackingEnabled = settings.orderTracking !== "false";

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50">
        {/* Top info bar */}
        <div className="hidden md:block bg-foreground text-background/90 text-sm">
          <div className="container-hop flex items-center justify-between min-h-[40px] pt-3 pb-2">
            <div className="flex items-center gap-6">
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(storeAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-2 hover:text-brand-light transition-colors"
              >
                <MapPin size={14} /> {storeCity}, {storeState}
              </a>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 py-2 hover:text-brand-light transition-colors"
              >
                <Phone size={14} /> {storePhone}
              </a>
            </div>
            <div className="flex items-center gap-6">
              {isTrackingEnabled && (
                <Link
                  to="/track-order"
                  className={`inline-flex items-center gap-1.5 py-2 transition-colors ${location.pathname === "/track-order" ? "text-brand-light font-semibold" : "hover:text-brand-light"}`}
                  aria-current={location.pathname === "/track-order" ? "page" : undefined}
                >
                  <Package size={14} /> Track Order
                </Link>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="py-2 hover:text-brand-light">Sign In / Register</Link>
              )}
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="bg-background/85 backdrop-blur-xl border-b border-border">
          <div className="container-hop grid grid-cols-[auto_1fr_auto] items-center gap-4 h-20 md:h-24">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden p-2 rounded-full hover:bg-accent"
                aria-label={open ? "Close menu" : "Menu"}
                aria-expanded={open}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Logo />
            </div>

            <nav className="hidden lg:flex items-center justify-center gap-9 h-full">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: "text-foreground after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-primary" }}
                  className="relative text-[13px] tracking-[0.18em] uppercase font-medium transition-colors text-foreground/80 hover:text-primary"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2.5 rounded-full hover:bg-accent"
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
              <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-accent relative" aria-label="Wishlist">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2.5 rounded-full hover:bg-accent relative" aria-label="Cart">
                <ShoppingBag size={18} />
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 grid place-items-center">
                  {count > 99 ? "99+" : count}
                </span>
              </Link>
              <Link
                to="/account"
                activeProps={{ className: "p-2.5 rounded-full bg-primary/10 hidden sm:inline-flex" }}
                className="p-2.5 rounded-full hover:bg-accent hidden sm:inline-flex"
                aria-label={isAuthenticated ? `Account — ${user?.email ?? ""}` : "Account"}
                title={isAuthenticated ? user?.email : "Account"}
                aria-current="page"
              >
                {isAuthenticated ? (
                  <span className="h-[18px] min-w-[18px] px-[3px] rounded-full bg-primary text-primary-foreground text-[11px] font-semibold grid place-items-center leading-none">
                    {initial}
                  </span>
                ) : (
                  <User size={18} />
                )}
              </Link>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-border bg-background">
              <div className="container-hop py-4">
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                  <Search size={18} className="text-muted-foreground shrink-0" />
                  <input
                    ref={searchRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search phones, brands, accessories…"
                    className="flex-1 min-w-0 bg-transparent text-sm py-2 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-foreground text-background text-xs tracking-widest uppercase hover:bg-primary transition-colors"
                  >
                    Search
                  </button>
                </form>

                {q.trim() && (
                  <div className="mt-3 border-t border-border pt-3">
                    {results.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No products found for “{q}”.</p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {results.map((p) => (
                          <li key={p.id}>
                            <RRLink
                              to={`/product/${p.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 py-2.5 hover:bg-accent/50 rounded-lg px-1"
                            >
                              <img src={p.image} alt={p.name} loading="lazy" className="h-10 w-10 rounded-md object-cover" />
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm truncate">{p.name}</span>
                                <span className="block text-xs text-muted-foreground">{p.brand}</span>
                              </span>
                              <span className="text-sm font-medium shrink-0">{formatINR(p.price)}</span>
                            </RRLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}


          {open && (
            <>
            <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
            <div className="lg:hidden border-t border-border bg-background max-h-[calc(100vh-6rem)] overflow-y-auto relative z-50">
              <div className="container-hop py-4 flex flex-col gap-1">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-sm uppercase tracking-wider"
                  >
                    {n.label}
                  </Link>
                ))}
                <div className="mt-2 pt-3 border-t border-border flex flex-col gap-1">
                  <RRLink
                    to="/track-order"
                    onClick={() => setOpen(false)}
                    className={`py-2.5 text-sm uppercase tracking-wider ${location.pathname === "/track-order" ? "text-primary font-semibold" : ""}`}
                    aria-current={location.pathname === "/track-order" ? "page" : undefined}
                  >
                    Track Order
                  </RRLink>
                  {isAuthenticated ? (
                    <>
                      <RRLink to="/account" onClick={() => setOpen(false)} className="py-2.5 text-sm uppercase tracking-wider">
                        My Account
                      </RRLink>
                      <button
                        onClick={() => {
                          setOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="py-2.5 text-left text-sm uppercase tracking-wider"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <RRLink to="/login" onClick={() => setOpen(false)} className="py-2.5 text-sm uppercase tracking-wider">
                      Sign In / Register
                    </RRLink>
                  )}
                </div>
              </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}