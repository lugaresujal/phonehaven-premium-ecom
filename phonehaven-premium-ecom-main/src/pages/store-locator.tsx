import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { MapPin, Phone, Clock } from "lucide-react";
import { useCms } from "@/lib/cms-store";

function StoreLocatorComponent() {
  const { stores } = useCms();
  const activeStore = stores.length > 0 ? stores[0] : null;

  return (
    <PageLayout title="Find Us" subtitle="Come experience the boutique first-hand." crumbs={[{ label: "Store Locator" }]}>
      <section className="container-hop py-10 grid lg:grid-cols-2 gap-10">
        <div className="rounded-3xl overflow-hidden bg-card border border-border">
          <iframe
            title="map"
            src={activeStore?.mapLink || "https://www.google.com/maps?q=Bibwewadi+Pune&output=embed"}
            className="w-full h-[500px]"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-serif text-3xl">{activeStore ? activeStore.name : "Flagship — Bibwewadi, Pune"}</h2>
          <div className="space-y-4 text-sm">
            <p className="flex gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              {activeStore ? `${activeStore.address}, ${activeStore.city} – ${activeStore.pincode || ""}, ${activeStore.state}` : "Shop No. 8 & 9, Saraswati Mini Market, Near Bibwewadi Police Station, Pune – 411037, Maharashtra, India"}
            </p>
            <p className="flex gap-3">
              <Phone size={18} className="text-primary shrink-0 mt-0.5" />
              {activeStore?.phone || "+91 98765 43210"}
            </p>
            <p className="flex gap-3">
              <Clock size={18} className="text-primary shrink-0 mt-0.5" />
              {activeStore ? `${activeStore.openingHours || "10:30 AM"} – ${activeStore.closingHours || "9:00 PM"}` : "Mon – Sat · 10:30 AM – 9:00 PM\nSun · 11:00 AM – 7:00 PM"}
            </p>
          </div>
          <a
            href={activeStore?.mapLink || "https://maps.google.com/?q=Bibwewadi+Pune"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"
          >
            Get Directions
          </a>
        </div>
      </section>
    </PageLayout>
  );
}

export const Route = createFileRoute("/store-locator")({
  head: () => ({
    meta: [
      { title: "Store Locator — House of Phones, Pune" },
      { name: "description", content: "Visit our flagship boutique in Bibwewadi, Pune." },
      { property: "og:url", content: "/store-locator" },
    ],
    links: [{ rel: "canonical", href: "/store-locator" }],
  }),
  component: StoreLocatorComponent,
});
