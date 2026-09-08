import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Award,
  Heart,
  Users,
  CheckCircle,
  Star,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import mobilePhoneImg from "@/assets/images/mobile-phone.png";
import founderImg from "@/assets/images/founder.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — House of Phones" },
      {
        name: "description",
        content:
          "Since 2018, House of Phones has been Pune's most trusted destination for premium mobile retail.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),

  component: () => (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[320px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="About House of Phones"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            About Us
          </p>

          <h1 className="mt-3 font-serif text-5xl md:text-6xl">
            Our Story
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/90">
            A boutique built for the ones who care about detail.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="container-hop py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src={mobilePhoneImg}
                alt="Premium Smartphone Display"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>

            {/* Rating Badge */}
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-primary px-6 py-3 text-white shadow-xl sm:-right-5">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Est. 2018
              </p>
            </div>

            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              More than a store.
              <br />
              <span className="text-primary">A relationship.</span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Founded in Bibwewadi, Pune, House of Phones began with a simple
              idea — buying a phone should feel as premium as the phone itself.
              We hand-pick every device, verify every accessory and stand by
              every sale with dedicated after-care.
            </p>

            <p className="mt-4 leading-relaxed text-muted-foreground">
              Today, we serve thousands of loyal customers across India —
              students, corporates, professionals, and enthusiasts who trust us
              to bring them the best of Apple, Samsung, OnePlus, Google and more.
            </p>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  label: "100% Authentic",
                  color: "text-emerald-500",
                },
                {
                  icon: CheckCircle,
                  label: "Verified Devices",
                  color: "text-blue-500",
                },
                {
                  icon: Heart,
                  label: "Customer First",
                  color: "text-red-500",
                },
                {
                  icon: Award,
                  label: "Premium Quality",
                  color: "text-amber-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <button className="mt-8 rounded-full bg-primary px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl">
              Explore Our Collection
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-hop grid gap-6 py-10 md:grid-cols-3">
        {[
          {
            icon: Users,
            label: "12,000+",
            description: "Happy customers across India",
          },
          {
            icon: Award,
            label: "50+",
            description: "Global premium brands",
          },
          {
            icon: Heart,
            label: "8 years",
            description: "Of trust and excellence in Pune",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <stat.icon size={28} className="mx-auto text-primary" />

            <p className="mt-4 font-serif text-4xl">{stat.label}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {stat.description}
            </p>
          </div>
        ))}
      </section>

      {/* ========================================================= */}
      {/* MEET OUR FOUNDER */}
      {/* ========================================================= */}

      <section className="container-hop py-20 lg:py-28">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-muted/20 shadow-sm">
          <div className="grid items-center lg:grid-cols-2">
            
            {/* Founder Image */}
            <div className="relative bg-[#f5eadb] p-4 sm:p-6 lg:p-8">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={founderImg}
                  alt="Shailesh Attal - Founder of House of Phones"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* Founder Content */}
            <div className="px-6 py-12 sm:px-10 lg:px-14">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Meet Our Founder
                </p>
              </div>

              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                The Visionary
                <br />
                <span className="text-primary">Behind the Legacy.</span>
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                House of Phones is built on a simple belief — technology is
                more meaningful when it connects people with better
                experiences.
              </p>

              <p className="mt-4 leading-relaxed text-muted-foreground">
                With a passion for mobile technology and customer experience,
                our founder has worked to build House of Phones into a brand
                where trust, authenticity and service come first.
              </p>

              {/* Founder Highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Target className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Customer First
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Every decision starts with creating a better customer
                      experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Driven by Excellence
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Continuously improving products, service and the overall
                      shopping experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Built on Trust
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Genuine products, honest guidance and long-term
                      relationships.
                    </p>
                  </div>
                </div>
              </div>

              {/* Founder Quote */}
              <div className="mt-10 border-l-2 border-primary pl-5">
                <p className="font-serif text-xl italic leading-relaxed">
                  “My goal is simple — to connect people with technology that
                  empowers their everyday lives.”
                </p>

                <p className="mt-3 text-sm font-semibold text-primary">
                  — Shailesh Attal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Brand Message */}
      <section className="container-hop pb-20 lg:pb-28">
        <div className="rounded-[2rem] bg-primary px-6 py-14 text-center text-white sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">
            House of Phones
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
            Technology you love.
            <br />
            Service you can trust.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-white/80">
            More than just phones — we're here to build lasting relationships
            with every customer who walks through our doors.
          </p>
        </div>
      </section>
    </PageLayout>
  ),
});