import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useCms } from "@/lib/cms-store";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Headphones, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
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

interface BrandConfig {
  tagline: string;
  bgGradient: string;
  borderColor: string;
  hoverBorder: string;
  shadowGlow: string;
  radialGlow: string;
  textColor: string;
  taglineColor: string;
  actionColor: string;
  accentColor: string;
  isLight?: boolean;
  deviceType: "apple" | "samsung" | "oneplus" | "oppo" | "vivo" | "google" | "xiaomi" | "motorola" | "realme" | "honor" | "nokia" | "nothing";
}

const BRAND_CONFIGS: Record<string, BrandConfig> = {
  "Apple": {
    tagline: "Innovation in your hands.",
    bgGradient: "bg-gradient-to-br from-[#1c1c1f] via-[#111114] to-[#070709]",
    borderColor: "border-white/10",
    hoverBorder: "hover:border-white/25",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(255,255,255,0.07)]",
    radialGlow: "rgba(255,255,255,0.08)",
    textColor: "text-white",
    taglineColor: "text-zinc-400",
    actionColor: "text-zinc-300 group-hover:text-white",
    accentColor: "#ffffff",
    deviceType: "apple",
  },
  "Samsung": {
    tagline: "Powering a smarter tomorrow.",
    bgGradient: "bg-gradient-to-br from-[#0c1938] via-[#071128] to-[#030713]",
    borderColor: "border-blue-900/40",
    hoverBorder: "hover:border-blue-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(37,99,235,0.22)]",
    radialGlow: "rgba(37,99,235,0.22)",
    textColor: "text-white",
    taglineColor: "text-blue-200/70",
    actionColor: "text-blue-300 group-hover:text-blue-100",
    accentColor: "#3b82f6",
    deviceType: "samsung",
  },
  "OnePlus": {
    tagline: "Never Settle.",
    bgGradient: "bg-gradient-to-br from-[#220d0f] via-[#150608] to-[#0a0203]",
    borderColor: "border-red-900/35",
    hoverBorder: "hover:border-red-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(239,68,68,0.2)]",
    radialGlow: "rgba(239,68,68,0.18)",
    textColor: "text-white",
    taglineColor: "text-red-200/70",
    actionColor: "text-red-300 group-hover:text-red-100",
    accentColor: "#ef4444",
    deviceType: "oneplus",
  },
  "Oppo": {
    tagline: "Inspiration Ahead.",
    bgGradient: "bg-gradient-to-br from-[#0a2318] via-[#06170f] to-[#020b06]",
    borderColor: "border-emerald-900/40",
    hoverBorder: "hover:border-emerald-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(16,185,129,0.2)]",
    radialGlow: "rgba(16,185,129,0.2)",
    textColor: "text-white",
    taglineColor: "text-emerald-200/70",
    actionColor: "text-emerald-300 group-hover:text-emerald-100",
    accentColor: "#10b981",
    deviceType: "oppo",
  },
  "Vivo": {
    tagline: "Vivo Life.",
    bgGradient: "bg-gradient-to-br from-[#0e1d36] via-[#081224] to-[#040913]",
    borderColor: "border-sky-900/40",
    hoverBorder: "hover:border-sky-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(56,189,248,0.2)]",
    radialGlow: "rgba(56,189,248,0.2)",
    textColor: "text-white",
    taglineColor: "text-sky-200/70",
    actionColor: "text-sky-300 group-hover:text-sky-100",
    accentColor: "#38bdf8",
    deviceType: "vivo",
  },
  "Google": {
    tagline: "Helpful by design.",
    bgGradient: "bg-gradient-to-br from-[#faf8f5] via-[#f3efe7] to-[#e9e3d7]",
    borderColor: "border-[#dfd8cc]",
    hoverBorder: "hover:border-zinc-400/80",
    shadowGlow: "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12)]",
    radialGlow: "rgba(66,133,244,0.08)",
    textColor: "text-zinc-900",
    taglineColor: "text-zinc-600",
    actionColor: "text-zinc-800 group-hover:text-zinc-950",
    accentColor: "#4285f4",
    isLight: true,
    deviceType: "google",
  },
  "Xiaomi": {
    tagline: "Smarter Living.",
    bgGradient: "bg-gradient-to-br from-[#291408] via-[#1a0c04] to-[#0d0502]",
    borderColor: "border-amber-900/35",
    hoverBorder: "hover:border-amber-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(249,115,22,0.2)]",
    radialGlow: "rgba(249,115,22,0.18)",
    textColor: "text-white",
    taglineColor: "text-amber-200/70",
    actionColor: "text-amber-300 group-hover:text-amber-100",
    accentColor: "#f97316",
    deviceType: "xiaomi",
  },
  "Motorola": {
    tagline: "Hello tomorrow.",
    bgGradient: "bg-gradient-to-br from-[#11192e] via-[#0b101f] to-[#050810]",
    borderColor: "border-indigo-950/40",
    hoverBorder: "hover:border-indigo-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(99,102,241,0.2)]",
    radialGlow: "rgba(99,102,241,0.18)",
    textColor: "text-white",
    taglineColor: "text-indigo-200/70",
    actionColor: "text-indigo-300 group-hover:text-indigo-100",
    accentColor: "#6366f1",
    deviceType: "motorola",
  },
  "Realme": {
    tagline: "Dare to Leap.",
    bgGradient: "bg-gradient-to-br from-[#1f1906] via-[#141003] to-[#090701]",
    borderColor: "border-yellow-950/40",
    hoverBorder: "hover:border-yellow-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(234,179,8,0.2)]",
    radialGlow: "rgba(234,179,8,0.18)",
    textColor: "text-white",
    taglineColor: "text-yellow-200/70",
    actionColor: "text-yellow-300 group-hover:text-yellow-100",
    accentColor: "#eab308",
    deviceType: "realme",
  },
  "Honor": {
    tagline: "Go beyond.",
    bgGradient: "bg-gradient-to-br from-[#142033] via-[#0d1624] to-[#060b13]",
    borderColor: "border-cyan-950/40",
    hoverBorder: "hover:border-cyan-400/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(6,182,212,0.2)]",
    radialGlow: "rgba(6,182,212,0.18)",
    textColor: "text-white",
    taglineColor: "text-cyan-200/70",
    actionColor: "text-cyan-300 group-hover:text-cyan-100",
    accentColor: "#06b6d4",
    deviceType: "honor",
  },
  "Nokia": {
    tagline: "Connecting people.",
    bgGradient: "bg-gradient-to-br from-[#0e223c] via-[#081628] to-[#040b15]",
    borderColor: "border-sky-900/40",
    hoverBorder: "hover:border-sky-500/50",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(14,165,233,0.2)]",
    radialGlow: "rgba(14,165,233,0.2)",
    textColor: "text-white",
    taglineColor: "text-sky-200/70",
    actionColor: "text-sky-300 group-hover:text-sky-100",
    accentColor: "#0ea5e9",
    deviceType: "nokia",
  },
  "Nothing": {
    tagline: "Less but better.",
    bgGradient: "bg-gradient-to-br from-[#161619] via-[#0e0e11] to-[#060608]",
    borderColor: "border-neutral-800",
    hoverBorder: "hover:border-neutral-500/60",
    shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(255,255,255,0.08)]",
    radialGlow: "rgba(255,255,255,0.1)",
    textColor: "text-white",
    taglineColor: "text-neutral-400",
    actionColor: "text-neutral-300 group-hover:text-white",
    accentColor: "#ffffff",
    deviceType: "nothing",
  },
};

// Subtle device render element displayed on the right edge of each card
function DeviceSilhouette({ type, accent, isLight }: { type: BrandConfig["deviceType"]; accent: string; isLight?: boolean }) {
  const strokeColor = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)";
  const fillColor = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)";

  return (
    <div className="absolute right-[-15px] top-[-10px] bottom-[-10px] w-36 sm:w-40 md:w-44 pointer-events-none opacity-40 group-hover:opacity-65 transition-all duration-400 ease-out group-hover:scale-105 overflow-hidden flex items-center justify-end">
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-lg"
      >
        {/* Device Outer Chassis */}
        <rect
          x="35"
          y="15"
          width="135"
          height="190"
          rx="26"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Inner Screen Edge / Edge Highlight */}
        <rect
          x="39"
          y="19"
          width="127"
          height="182"
          rx="22"
          stroke={strokeColor}
          strokeWidth="0.75"
          strokeDasharray="2 4"
        />

        {/* Camera modules by brand signature */}
        {type === "apple" && (
          <g>
            {/* Apple Triangular Triple Camera Island */}
            <rect x="45" y="25" width="62" height="66" rx="18" fill="rgba(255,255,255,0.06)" stroke={strokeColor} strokeWidth="1" />
            <circle cx="62" cy="42" r="10" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="62" cy="42" r="4" fill={accent} opacity="0.6" />
            <circle cx="62" cy="74" r="10" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="62" cy="74" r="4" fill={accent} opacity="0.6" />
            <circle cx="89" cy="58" r="10" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="89" cy="58" r="4" fill={accent} opacity="0.6" />
            <circle cx="89" cy="38" r="3" fill="rgba(255,255,255,0.5)" />
          </g>
        )}

        {type === "samsung" && (
          <g>
            {/* Samsung Galaxy Vertical Floating Lenses */}
            <circle cx="58" cy="40" r="12" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="58" cy="40" r="5" fill={accent} opacity="0.7" />
            <circle cx="58" cy="72" r="12" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="58" cy="72" r="5" fill={accent} opacity="0.7" />
            <circle cx="58" cy="104" r="12" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="58" cy="104" r="5" fill={accent} opacity="0.7" />
            <circle cx="82" cy="56" r="4" stroke={strokeColor} strokeWidth="1" fill="rgba(255,255,255,0.4)" />
          </g>
        )}

        {type === "google" && (
          <g>
            {/* Google Pixel Camera Bar Visor */}
            <rect x="25" y="45" width="135" height="34" rx="10" fill="rgba(0,0,0,0.12)" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="48" y="52" width="42" height="20" rx="10" fill="rgba(0,0,0,0.5)" />
            <circle cx="58" cy="62" r="6" fill={accent} opacity="0.8" />
            <circle cx="78" cy="62" r="6" fill="#34a853" opacity="0.8" />
            <circle cx="106" cy="62" r="4" fill="#ea4335" opacity="0.8" />
          </g>
        )}

        {(type === "oneplus" || type === "oppo" || type === "vivo" || type === "honor" || type === "nokia") && (
          <g>
            {/* Circular Camera Module Dial */}
            <circle cx="78" cy="70" r="32" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="78" cy="70" r="28" stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="66" cy="58" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="66" cy="58" r="3" fill={accent} opacity="0.8" />
            <circle cx="90" cy="58" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="90" cy="58" r="3" fill={accent} opacity="0.8" />
            <circle cx="66" cy="82" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="66" cy="82" r="3" fill={accent} opacity="0.8" />
            <circle cx="90" cy="82" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="90" cy="82" r="3" fill={accent} opacity="0.8" />
          </g>
        )}

        {(type === "xiaomi" || type === "realme" || type === "motorola") && (
          <g>
            {/* Rectangular Matrix Camera Island */}
            <rect x="45" y="30" width="58" height="76" rx="16" fill="rgba(0,0,0,0.3)" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="74" cy="52" r="14" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.6)" />
            <circle cx="74" cy="52" r="6" fill={accent} opacity="0.8" />
            <circle cx="62" cy="84" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="62" cy="84" r="3" fill={accent} opacity="0.8" />
            <circle cx="86" cy="84" r="8" stroke={strokeColor} strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />
            <circle cx="86" cy="84" r="3" fill={accent} opacity="0.8" />
          </g>
        )}

        {type === "nothing" && (
          <g>
            {/* Nothing Glyph Interface LEDs and Dual Lenses */}
            <circle cx="58" cy="46" r="10" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.5)" />
            <circle cx="58" cy="46" r="4" fill="#fff" opacity="0.8" />
            <circle cx="58" cy="74" r="10" stroke={strokeColor} strokeWidth="2" fill="rgba(0,0,0,0.5)" />
            <circle cx="58" cy="74" r="4" fill="#fff" opacity="0.8" />
            {/* Glyph light strips */}
            <path d="M 45 30 A 28 28 0 0 1 100 50" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            <path d="M 104 60 L 104 110" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M 50 140 C 70 140 85 155 85 175" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="95" y1="180" x2="110" y2="180" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          </g>
        )}
      </svg>
    </div>
  );
}

function BrandsComponent() {
  const { brands } = useCms();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, searchQuery]);

  return (
    <PageLayout bare>
      {/* Hero Banner — Exact Same as Accessories Page */}
      <section className="relative inner-banner md:h-[320px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Brands Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-primary-foreground">
          <p className="text-xs md:text-sm tracking-[0.3em] text-primary-foreground/80">Premium Collection</p>
          <h1 className="mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-6xl">All Brands</h1>
          <p className="mt-2 md:mt-4 max-w-2xl text-sm md:text-lg text-primary-foreground/90">
            From iconic names to the latest innovations, explore the best smartphone brands in the world — only at House of Phones.
          </p>
        </div>
      </section>

      {/* 2. Existing Benefits Section */}
      <section className="bg-[#f8f5ee] border-b border-[#e8dfd2] py-4 sm:py-5">
        <div className="container-hop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355] shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-stone-900 leading-tight">Free Shipping</p>
                <p className="text-[11px] text-stone-500 mt-0.5">On all orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-stone-900 leading-tight">100% Original</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Genuine Products</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355] shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-stone-900 leading-tight">Easy Returns</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Hassle Free</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8b7355]/10 flex items-center justify-center text-[#8b7355] shrink-0">
                <Headphones size={18} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-stone-900 leading-tight">Dedicated Support</p>
                <p className="text-[11px] text-stone-500 mt-0.5">We're here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "OUR BRANDS" / "Choose Your Favourite Brand" Header + Search */}
      <section id="choose-brand" className="pt-12 sm:pt-16 pb-6 bg-[#faf8f5]">
        <div className="container-hop">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#8b7355]">
                  OUR BRANDS
                </span>
                <span className="inline-block w-8 h-px bg-[#8b7355]/50" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight">
                Choose Your Favourite Brand
              </h2>

              <p className="mt-2 text-xs sm:text-sm md:text-base text-stone-500 font-light">
                12+ leading brands. Endless possibilities.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-72 lg:w-80">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brands..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-full bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/15 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ✨ NEW PREMIUM BRAND CARDS SECTION ✨ */}
      <section className="pb-16 sm:pb-20 md:pb-24 bg-[#faf8f5]">
        <div className="container-hop">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-md mx-auto">
              <p className="text-base font-medium text-stone-700">No brands found matching "{searchQuery}"</p>
              <p className="text-xs text-stone-500 mt-1.5">Try searching for Apple, Samsung, OnePlus, Google, etc.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 text-xs font-medium text-[#8b7355] hover:text-stone-900 border border-[#8b7355]/30 rounded-full hover:bg-stone-50 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredBrands.map((b) => {
                const logoSrc = brandLogos[b.name] || b.logo || applelogo;
                const config: BrandConfig = BRAND_CONFIGS[b.name] || {
                  tagline: b.tagline || "Discover innovation.",
                  bgGradient: "bg-gradient-to-br from-[#181512] via-[#100e0c] to-[#080706]",
                  borderColor: "border-white/10",
                  hoverBorder: "hover:border-[#8b7355]/50",
                  shadowGlow: "hover:shadow-[0_16px_36px_-6px_rgba(139,115,85,0.2)]",
                  radialGlow: "rgba(139,115,85,0.15)",
                  textColor: "text-white",
                  taglineColor: "text-zinc-400",
                  actionColor: "text-[#c4b89a] group-hover:text-white",
                  accentColor: "#8b7355",
                  deviceType: "apple",
                };

                return (
                  <Link
                    key={b.slug}
                    to="/shop"
                    search={{ q: b.name }}
                    className="group block focus:outline-none focus:ring-2 focus:ring-[#8b7355]/40 rounded-2xl"
                  >
                    <div
                      className={`
                        relative
                        ${config.bgGradient}
                        ${config.borderColor}
                        ${config.hoverBorder}
                        ${config.shadowGlow}
                        border
                        rounded-2xl
                        p-4
                        sm:p-5
                        md:p-6
                        min-h-[180px]
                        sm:min-h-[200px]
                        md:min-h-[220px]
                        flex
                        flex-col
                        justify-between
                        overflow-hidden
                        transition-all
                        duration-350
                        ease-out
                        hover:-translate-y-1.5
                        cursor-pointer
                      `}
                    >
                      {/* Subtle Brand-Specific Radial Glow Overlay */}
                      <div
                        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at 80% 20%, ${config.radialGlow}, transparent 70%)`,
                        }}
                      />

                      {/* Brand Device Silhouette Visual on Right */}
                      <DeviceSilhouette
                        type={config.deviceType}
                        accent={config.accentColor}
                        isLight={config.isLight}
                      />

                      {/* Top Row: Brand Logo Container */}
                      <div className="relative z-10">
                        <div className="h-10 sm:h-12 flex items-center justify-start">
                          <img
                            src={logoSrc}
                            alt={`${b.name} logo`}
                            className={`
                              max-h-8
                              sm:max-h-10
                              max-w-[100px]
                              sm:max-w-[120px]
                              object-contain
                              object-left
                              transition-transform
                              duration-350
                              ease-out
                              group-hover:scale-105
                              ${config.isLight ? "mix-blend-multiply" : "filter brightness-110 contrast-125"}
                            `}
                          />
                        </div>
                      </div>

                      {/* Middle Content: Brand Name & Tagline */}
                      <div className="relative z-10 my-auto pt-2 pb-3">
                        <h3
                          className={`
                            font-sans
                            text-base
                            sm:text-lg
                            md:text-xl
                            font-semibold
                            ${config.textColor}
                            tracking-tight
                            leading-snug
                          `}
                        >
                          {b.name}
                        </h3>
                        <p
                          className={`
                            mt-1
                            text-[11px]
                            sm:text-xs
                            md:text-[13px]
                            ${config.taglineColor}
                            font-light
                            leading-relaxed
                            line-clamp-2
                          `}
                        >
                          {config.tagline}
                        </p>
                      </div>

                      {/* Bottom Action: "View Products →" */}
                      <div className="relative z-10 pt-2 border-t border-white/5">
                        <div
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            text-[11px]
                            sm:text-xs
                            font-medium
                            tracking-wide
                            ${config.actionColor}
                            transition-all
                            duration-300
                          `}
                        >
                          <span>View Products</span>
                          <ArrowRight
                            size={13}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Explore Premium Accessories Section */}
      <section className="container-hop pt-4 sm:pt-6 pb-16 sm:pb-20 md:pb-24">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1f1814] via-[#2a221c] to-[#1f1814] border border-[#3d3126] p-8 sm:p-10 md:p-12 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.35)]">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8b7355]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#c4b89a] font-medium">
                MORE THAN JUST PHONES
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mt-2">
                Explore Premium Accessories
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-light mt-2.5 leading-relaxed">
                Cases, chargers, earbuds, wearables and more — everything you need, all in one place.
              </p>
            </div>

            <Link
              to="/accessories"
              className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#8b7355] hover:bg-[#7a634b] text-white text-xs sm:text-sm font-medium tracking-wider uppercase shadow-lg shadow-[#8b7355]/30 hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap group shrink-0"
            >
              Shop Accessories
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

