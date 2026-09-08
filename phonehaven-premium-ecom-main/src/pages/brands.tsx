import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useCms } from "@/lib/cms-store";
import { ArrowRight, Sparkles, Shield } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import applelogo from "@/assets/images/apple.png";
import googlelogo from "@/assets/images/google.png";
import honorlogo from "@/assets/images/honor.png";
import motorolalogo from "@/assets/images/motorola.png";
import nokialogo from "@/assets/images/nokia.png";
import nothinglogo from "@/assets/images/nothing.png";
import onepluslogo from "@/assets/images/oneplus.png";
import oppologo from "@/assets/images/oppo.png";
import realmelogo from "@/assets/images/realme.png";
import samsunglogo from "@/assets/images/samsung.png";
import vivologo from "@/assets/images/vivo.png";
import xiaomilogo from "@/assets/images/xiaomi.png";

const brandLogos: Record<string, any> = {
  "Apple": applelogo,
  "Samsung": samsunglogo,
  "OnePlus": onepluslogo,
  "Google": googlelogo,
  "Xiaomi": xiaomilogo,
  "Oppo": oppologo,
  "Vivo": vivologo,
  "Realme": realmelogo,
  "Motorola": motorolalogo,
  "Nothing": nothinglogo,
  "Honor": honorlogo,
  "Nokia": nokialogo,
};

// Darker, richer brand colors
const brandColors: Record<string, { bg: string; border: string; hover: string; text: string; glow: string }> = {
  "Apple": {
    bg: "bg-[#2a2a2e]",
    border: "border-[#3a3a3e]",
    hover: "hover:border-[#007aff]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(0,122,255,0.3)]"
  },
  "Samsung": {
    bg: "bg-[#1a2040]",
    border: "border-[#2a3060]",
    hover: "hover:border-[#1428a0]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(20,40,160,0.3)]"
  },
  "OnePlus": {
    bg: "bg-[#3d1515]",
    border: "border-[#5a2020]",
    hover: "hover:border-[#b22222]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(178,34,34,0.3)]"
  },
  "Google": {
    bg: "bg-[#1a1a2e]",
    border: "border-[#2a2a4e]",
    hover: "hover:border-[#4285f4]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(66,133,244,0.3)]"
  },
  "Xiaomi": {
    bg: "bg-[#3d1a0a]",
    border: "border-[#5a2a15]",
    hover: "hover:border-[#ff6b00]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(255,107,0,0.3)]"
  },
  "Oppo": {
    bg: "bg-[#1a1a1a]",
    border: "border-[#333333]",
    hover: "hover:border-[#666666]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(255,255,255,0.1)]"
  },
  "Vivo": {
    bg: "bg-[#0d1a33]",
    border: "border-[#1a2a55]",
    hover: "hover:border-[#0047ab]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(0,71,171,0.3)]"
  },
  "Realme": {
    bg: "bg-[#3d1a08]",
    border: "border-[#5a2a0d]",
    hover: "hover:border-[#ff8c00]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(255,140,0,0.3)]"
  },
  "Motorola": {
    bg: "bg-[#2a1535]",
    border: "border-[#3d1a55]",
    hover: "hover:border-[#5c2d91]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(92,45,145,0.3)]"
  },
  "Nothing": {
    bg: "bg-[#0a0a0a]",
    border: "border-[#222222]",
    hover: "hover:border-[#ffffff]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(255,255,255,0.15)]"
  },
  "Honor": {
    bg: "bg-[#0d1a2a]",
    border: "border-[#1a2a45]",
    hover: "hover:border-[#0047ab]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(0,71,171,0.3)]"
  },
  "Nokia": {
    bg: "bg-[#0d1a2e]",
    border: "border-[#1a2a50]",
    hover: "hover:border-[#005aff]",
    text: "text-white",
    glow: "shadow-[0_4px_15px_-4px_rgba(0,90,255,0.3)]"
  }
};

function BrandsComponent() {
  const { brands } = useCms();
  return (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[320px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Brands Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="brandPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brandPattern)" />
          </svg>
        </div>

        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-2 md:mb-3">
            <span className="inline-block w-8 md:w-12 h-px bg-white/60"></span>
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/80 font-light">
              Premium Collection
            </p>
          </div>

          <h1 className="mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] sm:leading-[1.1] md:leading-tight">
            Our Brands
          </h1>

          <p className="mt-2 sm:mt-3 md:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/80 font-light leading-relaxed sm:leading-relaxed md:leading-relaxed">
            Every brand you love, curated in one boutique. Discover the latest from the world's most innovative tech creators.
          </p>

          <div className="mt-4 sm:mt-5 md:mt-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm text-white/80 border border-white/10">
              <Sparkles size={12} className="hidden sm:inline-block" />
              <Sparkles size={10} className="sm:hidden" />
              {brands.length}+ Premium Brands
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm text-white/80 border border-white/10">
              <Shield size={12} className="hidden sm:inline-block" />
              <Shield size={10} className="sm:hidden" />
              100% Authentic
            </span>
          </div>
        </div>
      </section>

      {/* Brand Logo Showcase - Dark Premium Theme */}
      <section className="bg-gradient-to-b from-[#1a1410] via-[#1f1814] to-[#15100d] py-14 sm:py-20">
        <div className="container-hop">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8b7355] font-medium mb-2">
              Explore Our Collection
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#e8dccf]">
              Trusted by the Best
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#a0846a] max-w-xl mx-auto">
              We partner with the world's leading technology brands to bring you authentic devices and accessories.
            </p>
          </div>

          {/* Logo Grid with Dark Brand Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
            {brands.map((b) => {
              const colors = brandColors[b.name] || {
                bg: "bg-[#1a1410]",
                border: "border-[#2a221c]",
                hover: "hover:border-[#8b7355]",
                text: "text-white",
                glow: "shadow-[0_4px_15px_-4px_rgba(139,115,85,0.2)]"
              };
              const logoSrc = brandLogos[b.name] || b.logo || applelogo;

              return (
                <Link
                  key={b.slug}
                  to="/shop"
                  className="group"
                >
                  <div className={`
                    relative 
                    ${colors.bg}
                    rounded-2xl 
                    border-2 
                    ${colors.border}
                    p-6 
                    sm:p-7 
                    md:p-8 
                    flex 
                    flex-col 
                    items-center 
                    justify-center 
                    transition-all 
                    duration-300 
                    ${colors.glow}
                    ${colors.hover} 
                    hover:-translate-y-1.5 
                    hover:shadow-2xl
                    overflow-hidden
                  `}>
                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Subtle Inner Border Glow */}
                    <div className="absolute inset-[2px] rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-300 pointer-events-none" />

                    {/* Logo Container with Dark Background */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center relative z-10">
                      <div className="absolute inset-0 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300" />
                      <img
                        src={logoSrc}
                        alt={b.name}
                        className="max-w-[70%] max-h-[70%] object-contain transition-all duration-300 group-hover:scale-110 relative z-10 brightness-100 group-hover:brightness-110"
                      />
                    </div>

                    {/* Brand Name with White Text */}
                    <h3 className={`
                      mt-4 
                      text-xs 
                      sm:text-sm 
                      font-semibold 
                      ${colors.text}
                      transition-all 
                      duration-300 
                      tracking-tight
                      relative
                      z-10
                      opacity-80
                      group-hover:opacity-100
                    `}>
                      {b.name}
                    </h3>

                    {/* Brand Color Indicator - Colored Line */}
                    <div className={`
                      mt-3 
                      w-8 
                      h-0.5 
                      rounded-full 
                      transition-all 
                      duration-300 
                      group-hover:w-12
                      bg-white/20
                      group-hover:bg-white/40
                      relative
                      z-10
                    `} />

                    {/* Shop Now Text */}
                    <div className="mt-2 text-[10px] text-white/30 font-light relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                      Shop Now →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section - Dark Theme */}
      <section className="container-hop py-14 sm:py-20">
        <div className="text-center p-8 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1f1814] via-[#2a221c] to-[#1f1814] border-2 border-[#3a3028] shadow-[0_4px_30px_-8px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#e8dccf]">Can't find your brand?</h3>
              <p className="text-sm sm:text-base text-[#a0846a] mt-2">We source premium devices from all leading manufacturers.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-[#8b7355] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm tracking-widest uppercase hover:bg-[#7a634b] transition-colors shadow-lg shadow-[#8b7355]/30 whitespace-nowrap"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Shop by Brand — House of Phones" },
      {
        name: "description",
        content:
          "Explore Apple, Samsung, OnePlus, Google Pixel, Nothing and more at House of Phones.",
      },
      { property: "og:url", content: "/brands" },
    ],
    links: [{ rel: "canonical", href: "/brands" }],
  }),

  component: BrandsComponent,
});