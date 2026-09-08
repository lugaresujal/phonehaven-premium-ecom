import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { CheckCircle2, Truck, PackageCheck, Home, Package, Send, AlertTriangle, XCircle, Search, RefreshCw, ChevronRight } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import { useState, useEffect } from "react";
import { formatINR } from "@/lib/mock-data";
import { useSettings } from "@/lib/store/settings-store";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [{ title: "Track Order — House of Phones" }, { property: "og:url", content: "/track-order" }],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: Track,
});

function Track() {
  const { settings } = useSettings();
  const orderTrackingEnabled = settings.orderTracking !== "false";
  const [orderIdInput, setOrderIdInput] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Read search params or initial default
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qOrderId = urlParams.get("orderId");
    if (qOrderId) {
      setOrderIdInput(qOrderId);
      fetchOrder(qOrderId);
    }
  }, []);

  const fetchOrder = async (idToFetch: string) => {
    const cleanId = idToFetch.trim();
    if (!cleanId) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const res = await fetch(`http://localhost:5000/api/orders/${cleanId}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError(data.message || `No order found with ID #${cleanId}`);
      }
    } catch (err: any) {
      console.error("Tracking error:", err);
      setOrder(null);
      setError("Failed to connect to tracking server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      fetchOrder(orderIdInput.trim());
    }
  };

  // Helper to determine step completion based on DB status
  const getTrackingSteps = (currentStatus: string, dateStr: string) => {
    const s = (currentStatus || "").toLowerCase();
    const statusLevels: Record<string, number> = {
      pending: 1,
      processing: 2,
      confirmed: 2,
      packed: 3,
      shipped: 4,
      "in transit": 4,
      "out for delivery": 5,
      delivered: 6,
    };

    const currentLevel = statusLevels[s] || 2;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Recently";

    return [
      {
        t: "Order Placed",
        d: formattedDate,
        icon: CheckCircle2,
        done: currentLevel >= 1,
        active: currentLevel === 1,
      },
      {
        t: "Order Confirmed",
        d: currentLevel >= 2 ? "Confirmed by House of Phones" : "Pending Confirmation",
        icon: CheckCircle2,
        done: currentLevel >= 2,
        active: currentLevel === 2,
      },
      {
        t: "Packed",
        d: currentLevel >= 3 ? "Package inspected & packed" : "Awaiting packing",
        icon: Package,
        done: currentLevel >= 3,
        active: currentLevel === 3,
      },
      {
        t: "Shipped / In Transit",
        d: currentLevel >= 4 ? "Handed over to courier partner" : "Expected soon",
        icon: Truck,
        done: currentLevel >= 4,
        active: currentLevel === 4,
      },
      {
        t: "Out for Delivery",
        d: currentLevel >= 5 ? "Courier executive out for delivery" : "Upcoming step",
        icon: Send,
        done: currentLevel >= 5,
        active: currentLevel === 5,
      },
      {
        t: "Delivered",
        d: currentLevel >= 6 ? "Package delivered to customer" : "Estimated upon dispatch",
        icon: Home,
        done: currentLevel >= 6,
        active: currentLevel === 6,
      },
    ];
  };

  // Calculate expected delivery date based on order date and status
  const getExpectedDelivery = (order: any): string | null => {
    const s = (order.status || "").toLowerCase();
    if (s === "cancelled" || s === "cancellation requested") return null;
    if (s === "delivered") return null;

    const orderDate = order.date || order.createdAt;
    if (!orderDate) return null;

    const base = new Date(orderDate);
    let daysToAdd = 4; // default: 4 business days

    switch (s) {
      case "pending":
      case "processing":
      case "confirmed":
        daysToAdd = 4;
        break;
      case "packed":
        daysToAdd = 3;
        break;
      case "shipped":
      case "in transit":
        daysToAdd = 2;
        break;
      case "out for delivery":
        daysToAdd = 1;
        break;
    }

    // Skip weekends
    let added = 0;
    const delivery = new Date(base);
    while (added < daysToAdd) {
      delivery.setDate(delivery.getDate() + 1);
      const day = delivery.getDay();
      if (day !== 0 && day !== 6) added++;
    }

    return delivery.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <PageLayout bare>
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Track Your Order" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="trackPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#trackPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Track Order</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Track Your Order</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Enter your order ID to view live delivery status.</p>
        </div>
      </section>

      {/* Track Order Form */}
      {!orderTrackingEnabled ? (
        <section className="container-hop py-10 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <AlertTriangle size={40} className="mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="text-lg font-serif mb-1">Order Tracking Unavailable</h3>
            <p className="text-sm text-muted-foreground">Order tracking is currently disabled. Please contact support for assistance.</p>
          </div>
        </section>
      ) : (
      <section className="container-hop py-10 max-w-3xl">
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            placeholder="Order ID (e.g. HOP-2087344)"
            className="flex-1 px-5 py-3.5 rounded-full bg-card border border-border text-sm outline-none focus:border-primary"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !orderIdInput.trim()}
            className="px-8 py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors flex items-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            Track
          </button>
        </form>

        {loading && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <RefreshCw size={32} className="mx-auto text-primary animate-spin mb-3" />
            <p className="text-muted-foreground font-medium">Fetching real-time tracking information...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl p-8 text-center">
            <XCircle size={36} className="mx-auto mb-2 text-red-500" />
            <h3 className="text-lg font-serif mb-1">Order Not Found</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {order && !loading && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-border flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order #{order.orderId || order.id}</p>
                <p className="mt-1 font-serif text-2xl">
                  {order.items && order.items.length > 0 ? order.items[0].name : "Order Package"}
                  {order.items && order.items.length > 1 ? ` + ${order.items.length - 1} more items` : ""}
                </p>
                {order.address && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivering to: {order.address.fullName} ({order.address.city}, {order.address.state})
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-widest font-semibold">
                  {order.status}
                </span>
                <p className="text-sm font-serif mt-2">{formatINR(order.total || 0)}</p>
              </div>
            </div>

            {/* Expected Delivery Date */}
            {getExpectedDelivery(order) && (
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Expected Delivery: <span className="font-medium text-foreground">{getExpectedDelivery(order)}</span>
                </p>
              </div>
            )}

            {/* If Order is Cancelled or Cancellation Requested */}
            {(order.status?.toLowerCase() === "cancelled" || order.status?.toLowerCase() === "cancellation requested") ? (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                {order.status?.toLowerCase() === "cancelled" ? (
                  <>
                    <XCircle size={32} className="mx-auto text-red-500 mb-2" />
                    <h4 className="text-base font-semibold text-red-700">Order Cancelled</h4>
                    <p className="text-sm text-red-600/90 mt-1">This order has been cancelled and will not be delivered.</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                    <h4 className="text-base font-semibold text-amber-700">Cancellation Requested</h4>
                    <p className="text-sm text-amber-600/90 mt-1">Your cancellation request is being processed by our support team.</p>
                  </>
                )}
              </div>
            ) : (
              <ol className="relative pl-2">
                {getTrackingSteps(order.status, order.date || order.createdAt).map((s, i, arr) => (
                  <li key={s.t} className="flex gap-4 pb-6 last:pb-0 relative">
                    <div
                      className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${
                        s.done ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                      }`}
                    >
                      <s.icon size={18} />
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-px h-full ${
                          s.done ? "bg-primary/40" : "bg-border"
                        }`}
                      />
                    )}
                    <div>
                      <p className={`font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-sm">Enter your Order ID (from your confirmation email or Profile → Orders) above to track its live status.</p>
          </div>
        )}
      </section>
      )}
    </PageLayout>
  );
}