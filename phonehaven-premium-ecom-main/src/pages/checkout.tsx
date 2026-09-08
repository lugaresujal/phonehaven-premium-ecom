import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Truck, Wallet, Loader2, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { formatINR } from "@/lib/mock-data";
import { useCart } from "@/lib/store/cart";
import { useAuth } from "@/lib/store/auth";
import { useOrders, type Address } from "@/lib/store/orders";
import { useSettings } from "@/lib/store/settings-store";
import {
  computeTotals,
  getDeliveryOptions,
  getPaymentOptions,
  buyNowAsCartItems,
  clearBuyNow,
  readBuyNow,
} from "@/lib/checkout";
import innerBanner from "@/assets/images/innerbanner.png";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — House of Phones" },
      { name: "description", content: "Complete your purchase securely with UPI, Cards, Net Banking or COD." },
      { property: "og:url", content: "/checkout" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const { placeOrder, saveAddress, addresses } = useOrders();
  const { settings } = useSettings();

  const isBuyNow = !!readBuyNow();
  const items = useMemo(() => (isBuyNow ? buyNowAsCartItems() : cart.items), [isBuyNow, cart.items]);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  const deliveryOpts = useMemo(() => getDeliveryOptions(subtotal, settings), [subtotal, settings]);
  const paymentOpts = useMemo(() => getPaymentOptions(settings), [settings]);

  const last = addresses[addresses.length - 1];
  const [form, setForm] = useState<Address>({
    fullName: last?.fullName ?? user?.name ?? "",
    phone: last?.phone ?? user?.phone ?? "",
    email: last?.email ?? user?.email ?? "",
    line1: last?.line1 ?? "",
    city: last?.city ?? "",
    pincode: last?.pincode ?? "",
    state: last?.state ?? "",
  });
  const set = (k: keyof Address) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const [delivery, setDelivery] = useState(deliveryOpts[0]?.id ?? "standard");
  const [payment, setPayment] = useState(paymentOpts[0]?.id ?? "cod");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryOpt = deliveryOpts.find((d) => d.id === delivery) ?? deliveryOpts[0];
  const paymentOpt = paymentOpts.find((p) => p.id === payment) ?? paymentOpts[0];
  const totals = computeTotals(subtotal, deliveryOpt.fee);

  const validate = () => {
    if (items.length === 0) return "Your cart is empty.";
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!/^(\+91[-\s]?)?[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g, ""))) return "Please enter a valid 10-digit phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email.trim())) return "Please enter a valid email address.";
    if (!form.line1.trim()) return "Please enter your address.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!/^\d{6}$/.test(form.pincode.trim())) return "Please enter a valid 6-digit pincode.";
    if (!form.state.trim()) return "Please enter your state.";
    const oos = items.find((i) => i.product.stock <= 0);
    if (oos) return `${oos.product.name} is out of stock. Please remove it to continue.`;
    return null;
  };

  const onPlaceOrder = async () => {
    if (submitting) return;
    const msg = validate();
    setError(msg);
    if (msg) return;
    setSubmitting(true);
    try {
      const order = await placeOrder({
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          image: i.product.image,
          price: i.product.price,
          qty: i.qty,
          color: i.color,
          storage: i.storage,
        })),
        address: form,
        delivery: { label: deliveryOpt.label, fee: deliveryOpt.fee },
        payment: {
          method: paymentOpt.label,
          mode: paymentOpt.mode,
          status: paymentOpt.mode === "cod" ? "pending" : "paid",
        },
        totals: {
          subtotal: totals.subtotal,
          gstIncluded: totals.gstIncluded,
          shipping: totals.shipping,
          total: totals.total,
        },
      });
      saveAddress(form);
      if (isBuyNow) clearBuyNow();
      else cart.clear();
      toast.success("Order placed successfully!");
      navigate("/order-success", { state: { orderId: order.orderId }, replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="" crumbs={[]}>
  <div className="relative w-full h-[180px] sm:h-[230px] md:h-[300px] lg:h-[320px] overflow-hidden -mt-[100px] sm:-mt-[120px] md:-mt-[156px]">
    
    {/* Background Banner */}
    <img
      src={innerBanner}
      alt="Checkout Banner"
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* Dark overlay - text clearly visible karne ke liye */}
    <div className="absolute inset-0 bg-black/25" />

    {/* Text */}
    <div className="relative z-10 h-full container-hop flex flex-col justify-center">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm md:text-base text-white/80 mb-5">
        <Link to="/home" className="hover:text-white">
          Home
        </Link>

        <span>›</span>

        <Link to="/cart" className="hover:text-white">
          Cart
        </Link>

        <span>›</span>

        <span className="text-white">
          Checkout
        </span>
      </div>

      {/* Heading */}
      <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
        Checkout
      </h1>

    </div>
  </div>


      <section className="container-hop py-10 grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-8">
          <Card title="1. Shipping Address">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" placeholder="Rohan Kulkarni" value={form.fullName} onChange={set("fullName")} />
              <Field label="Phone" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} />
              <Field label="Email" placeholder="you@example.com" full value={form.email} onChange={set("email")} />
              <Field label="Address Line" placeholder="Flat / House / Building" full value={form.line1} onChange={set("line1")} />
              <Field label="City" placeholder="Pune" value={form.city} onChange={set("city")} />
              <Field label="Pincode" placeholder="411037" value={form.pincode} onChange={set("pincode")} />
              <Field label="State" placeholder="Maharashtra" full value={form.state} onChange={set("state")} />
            </div>
          </Card>

          <Card title="2. Delivery Method">
            <div className="space-y-3">
              {deliveryOpts.map((o) => (
                <label key={o.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === o.id}
                    onChange={() => setDelivery(o.id)}
                    className="accent-primary"
                  />
                  {o.id === "pickup" ? <Wallet size={20} className="text-primary" /> : <Truck size={20} className="text-primary" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{o.label}</p>
                    <p className="text-xs text-muted-foreground">{o.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card title="3. Payment Method">
            <div className="space-y-3">
              {paymentOpts.map((m) => (
                <label key={m.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-primary"
                  />
                  <CreditCard size={18} className="text-primary" />
                  <span className="font-medium text-sm">{m.label}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-28">
          <p className="font-serif text-xl mb-4">Order Total</p>

          {items.length > 0 && (
            <div className="space-y-3 mb-4">
              {items.map((i) => (
                <div key={i.key} className="flex items-center gap-3">
                  <img src={i.product.image} alt={i.product.name} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.qty}</p>
                  </div>
                  <span className="text-sm">{formatINR(i.product.price * i.qty)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>Included ({formatINR(totals.gstIncluded)})</span></div>
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between items-baseline"><span className="font-medium">Total</span><span className="font-serif text-2xl">{formatINR(totals.total)}</span></div>

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {items.length === 0 ? (
            <Link to="/shop" className="mt-6 w-full inline-flex items-center justify-center bg-foreground text-background py-4 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors">
              Continue Shopping
            </Link>
          ) : (
            <button
              onClick={onPlaceOrder}
              disabled={submitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Placing Order" : "Place Order"}
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground text-center">By placing your order, you agree to our Terms & Privacy Policy.</p>
        </aside>
      </section>


    </PageLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <p className="font-serif text-lg mb-5">{title}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  full,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  full?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}