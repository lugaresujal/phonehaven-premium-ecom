import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { GraduationCap, Check, ChevronRight } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";

export const Route = createFileRoute("/student-offer")({
  head: () => ({
    meta: [
      { title: "Student Offer — House of Phones" },
      { name: "description", content: "Extra 5% off + free premium case for students with valid ID." },
      { property: "og:url", content: "/student-offer" },
    ],
    links: [{ rel: "canonical", href: "/student-offer" }],
  }),
  component: () => (
    <PageLayout bare>
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Student Offer" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="studentPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#studentPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <Link to="/offers" className="hover:text-white/90">Offers</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Student</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Student Program</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Special pricing for the future — because your first flagship should feel like a gift.</p>
        </div>
      </section>

      <section className="container-hop py-10 grid md:grid-cols-3 gap-6">
        {[
          { t: "5% Extra Off", d: "Instantly applied on any smartphone above ₹30,000." },
          { t: "Free Premium Case", d: "Every student order ships with a designer case worth ₹2,499." },
          { t: "No-Cost EMI", d: "Split your payment over 6-12 months with zero interest." },
        ].map((c) => (
          <div key={c.t} className="rounded-3xl bg-card border border-border p-8">
            <GraduationCap size={28} className="text-primary" />
            <h3 className="mt-4 font-serif text-2xl">{c.t}</h3>
            <p className="mt-2 text-muted-foreground text-sm">{c.d}</p>
          </div>
        ))}
      </section>
      <section className="container-hop pb-16">
        <div className="rounded-3xl bg-foreground text-background p-10">
          <h2 className="font-serif text-3xl">How to redeem</h2>
          <ol className="mt-6 grid md:grid-cols-3 gap-6">
            {["Sign in with your student email", "Add your favourite device to cart", "Upload your student ID at checkout"].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="w-9 h-9 rounded-full bg-brand-light text-foreground grid place-items-center font-serif shrink-0">{i + 1}</span>
                <p className="pt-1.5">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PageLayout>
  ),
});
