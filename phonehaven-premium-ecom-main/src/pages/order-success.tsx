import { createFileRoute } from "@tanstack/react-router";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Package, MessageCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSettings } from "@/lib/store/settings-store";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [{ title: "Order Placed — House of Phones" }, { property: "og:url", content: "/order-success" }],
    links: [{ rel: "canonical", href: "/order-success" }],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const location = useLocation();
  const { settings } = useSettings();
  const currentOrderId = (location.state as { orderId?: string } | null)?.orderId ?? "HOP-2087341";
  
  const storeName = settings.storeName || "House of Phones";
  const rawWa = (settings.whatsappNumber || "9637671118").replace(/\D/g, "");
  const cleanWaNumber = rawWa.startsWith("91") && rawWa.length === 12 ? rawWa : `91${rawWa}`;

  const waText = encodeURIComponent(
    `Hi ${storeName}! I just placed order #${currentOrderId}. Please confirm my order details.`
  );

  return (
    <PageLayout bare>
      <section className="container-hop py-24 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 text-success grid place-items-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="mt-6 font-serif text-4xl">Thank you for your order!</h1>
        <p className="mt-3 text-muted-foreground">
          Your order <span className="font-medium text-foreground">#{currentOrderId}</span> has been placed successfully. A confirmation email will be sent shortly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${cleanWaNumber}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-[#20ba5a] transition-colors shadow-md"
          >
            <MessageCircle size={16} /> Confirm on WhatsApp
          </a>
          <Link to="/account" className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"><Package size={16} /> View Orders</Link>
          <Link to="/shop" className="inline-flex items-center gap-2 border border-foreground px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors">Continue Shopping</Link>
        </div>
      </section>
    </PageLayout>
  );
}
