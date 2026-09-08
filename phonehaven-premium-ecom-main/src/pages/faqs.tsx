import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useCms } from "@/lib/cms-store";
import innerBanner from "@/assets/images/innerbanner.png";

const defaultFaqs: [string, string][] = [
  ["Do you sell 100% original products?", "Yes. Every device and accessory we sell is sourced directly from authorized distributors and brand-authorized channels."],
  ["What is your return policy?", "You have 7 days from delivery for a full refund on unopened, unused products in original condition."],
  ["Do you offer EMI?", "Yes, we support No-Cost EMI on all major credit and debit cards, along with cardless EMI options."],
  ["Is exchange available on all phones?", "Exchange is available on most smartphones. Add your device on the exchange page to see instant value."],
  ["How long does delivery take?", "Standard delivery in 2-4 business days across India. Same-day dispatch for orders before 2 PM in Pune."],
  ["Do you provide GST invoices?", "Absolutely. We provide GST-compliant B2B invoices for corporate purchases."],
];

function FaqsComponent() {
  const { faqs: cmsFaqs } = useCms();
  const [open, setOpen] = useState<number | null>(0);

  const displayFaqs: [string, string][] = cmsFaqs.length > 0
    ? cmsFaqs.map((f) => [f.q || f.question || "", f.a || f.answer || ""])
    : defaultFaqs;

  return (
    <PageLayout bare>
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="FAQs" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="faqsPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#faqsPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">FAQs</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Frequently Asked Questions</h1>
        </div>
      </section>

      <section className="container-hop py-10 max-w-3xl">
        <div className="space-y-3">
          {displayFaqs.map(([q, a], i) => (
            <div
              key={q}
              className={`bg-card border border-border rounded-2xl overflow-hidden animate-fade-in-up ${
                i === 1 ? "animate-delay-100" : i === 2 ? "animate-delay-200" : i === 3 ? "animate-delay-300" : i === 4 ? "animate-delay-400" : i === 5 ? "animate-delay-400" : ""
              }`}
            >
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium">{q}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — House of Phones" },
      { name: "description", content: "Common questions on ordering, delivery, exchange and warranty." },
      { property: "og:url", content: "/faqs" },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
  }),
  component: FaqsComponent,
});
