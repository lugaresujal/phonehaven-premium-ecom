import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChevronRight } from "lucide-react";
import { useCms, type BlogPostItem } from "@/lib/cms-store";
import innerBanner from "@/assets/images/innerbanner.png";

const defaultPosts: BlogPostItem[] = [
  { t: "iPhone 16 Pro Review: The Titanium Refinement", title: "iPhone 16 Pro Review: The Titanium Refinement", d: "Jun 22, 2026", i: "1511707171634-5f897ff02aa9", e: "Six weeks in with Apple's latest — and it just keeps getting better." },
  { t: "Best Cases for Galaxy S24 Ultra", title: "Best Cases for Galaxy S24 Ultra", d: "Jun 15, 2026", i: "1585123334904-845d60e97b29", e: "From MagSafe leather to military-grade — our top picks tested." },
  { t: "Buying a Phone on GST: A Corporate Guide", title: "Buying a Phone on GST: A Corporate Guide", d: "May 30, 2026", i: "1546027658-7aa750153465", e: "Everything CFOs need to know before scaling device procurement." },
  { t: "OnePlus 12R vs Pixel 9: Which one wins?", title: "OnePlus 12R vs Pixel 9: Which one wins?", d: "May 12, 2026", i: "1592286927505-1def25115558", e: "A head-to-head at ₹40k — camera, battery and everyday feel." },
  { t: "Why We Recommend Tempered Glass on Day One", title: "Why We Recommend Tempered Glass on Day One", d: "Apr 28, 2026", i: "1580910051074-3eb694886505", e: "The maths of avoiding a screen replacement." },
  { t: "5G in Pune: Which Bands, Which Phones", title: "5G in Pune: Which Bands, Which Phones", d: "Apr 12, 2026", i: "1616348436168-de43ad0db179", e: "The definitive local guide." },
];

function BlogComponent() {
  const { blogs } = useCms();
  const displayPosts = blogs.length > 0 ? blogs : defaultPosts;

  return (
    <PageLayout bare>
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Blog" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="blogPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#blogPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Blog</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">The Journal</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Reviews, guides & tech insights from our team.</p>
        </div>
      </section>

      <section className="container-hop py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((p) => {
          const title = p.title || p.t || "Blog Post";
          const imgSrc = (p.i && p.i.startsWith("http"))
            ? p.i
            : `https://images.unsplash.com/photo-${p.i || "1511707171634-5f897ff02aa9"}?auto=format&fit=crop&w=800&q=80`;

          return (
            <Link key={title} to="/blog" className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-xl transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={imgSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.d}</p>
                <p className="mt-2 font-serif text-xl group-hover:text-primary">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.e}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </PageLayout>
  );
}

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — Tech Insights | House of Phones" },
      { name: "description", content: "Reviews, buying guides and industry news from the House of Phones team." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogComponent,
});
