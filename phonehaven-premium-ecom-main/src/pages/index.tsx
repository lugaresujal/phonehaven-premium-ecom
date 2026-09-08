import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, BadgeCheck, Truck, RotateCcw, Sparkles, Zap, Star, Quote, ChevronLeft, ChevronRight, Battery, Wifi, Smartphone, Clock, TrendingUp, Award, Headphones, Watch, Camera, Laptop, Gamepad2, Heart } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { brands, categories, formatINR } from "@/lib/mock-data";
import { useProducts } from "@/lib/products-store";
import { useCms } from "@/lib/cms-store";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useProtectedAction } from "@/lib/store/protected";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import samsungs24BgImg from "@/assets/images/samsungs24-bg-img.png";
import iphone17ProMaxBgImg from "@/assets/images/iphone17promax-bg-img.png";
import oneplus12BgImg from "@/assets/images/oneplus12-bg-img.png";
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
import wirelessearbuds from "@/assets/images/wirelessearbuds.png";
import temperredglass from "@/assets/images/temperredglass.png";
import powerbanks from "@/assets/images/powerbanks.png";
import mobilecovers from "@/assets/images/mobilecovers.png";
import fastcharges from "@/assets/images/fastcharges.png";
import visitbanner from "@/assets/images/visitus-bg-banner.png";
import offerbanner from "@/assets/images/offerbanner.png";
import deviceprotectionbgimg from "@/assets/images/deviceprotection-bg-img.png";
import protectionaudiobgimg from "@/assets/images/protectionaudio-bg-img.png";
import smartwatches from "@/assets/images/smartwatches2.png";
import koreanbag from "@/assets/images/koreanbag.png";
import wirelessmouseandkeyboard from "@/assets/images/wirelessmouseandkeyboard.png";
import iphone16cover from "@/assets/images/iphone16-cover.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "House of Phones — Premium Smartphones & Accessories | Pune" },
      { name: "description", content: "Discover the iPhone 16 Pro, Galaxy S24 Ultra, OnePlus 12 and more. Premium mobile retail with exchange, EMI and doorstep delivery across India." },
      { property: "og:title", content: "House of Phones — Premium Mobile Boutique" },
      { property: "og:description", content: "Curated smartphones and luxury accessories. Trusted by thousands in Pune since 2018." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { add: addToCart } = useCart();
  const wishlist = useWishlist();
  const guard = useProtectedAction();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body, html {
        overflow-x: hidden !important;
        max-width: 100vw !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // ✅ AUTO-SLIDER USEFFECT - 5 CARDS VERSION
  useEffect(() => {
    const container = document.getElementById('category-slider');
    if (!container) return;

    let autoScrollInterval: NodeJS.Timeout;
    let isPaused = false;

    const startAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null as any;
      }
      autoScrollInterval = setInterval(() => {
        if (!isPaused && container) {
          const cardWidth = container.querySelector('.category-slide')?.clientWidth || 0;
          const gap = 16;
          const maxScroll = container.scrollWidth - container.clientWidth;
          const scrollAmount = (cardWidth + gap) * 2; // 2 cards jump

          if (container.scrollLeft >= maxScroll - 10) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += scrollAmount;
          }
        }
      }, 3000);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null as any;
      }
    };

    const handleMouseEnter = () => {
      isPaused = true;
      stopAutoScroll();
    };

    const handleMouseLeave = () => {
      isPaused = false;
      startAutoScroll();
    };

    const handleTouchStart = () => {
      isPaused = true;
      stopAutoScroll();
    };

    const handleTouchEnd = () => {
      isPaused = false;
      startAutoScroll();
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    startAutoScroll();

    return () => {
      stopAutoScroll();
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-08-15T23:59:59').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { products, accessories } = useProducts();
  const { brands: cmsBrands, categories: cmsCategories, banners: cmsBanners } = useCms();

  const newArrivals = products.slice(0, 5);
  const bestSellers = products.slice(4, 9);
  const trending = products.slice(9, 14);
  const featuredAcc = accessories.slice(0, 5);

  const [popularTab, setPopularTab] = useState("New Arrivals");

  const getPopularProducts = () => {
    switch (popularTab) {
      case "Best Sellers":
        return bestSellers;
      case "Trending Now":
        return trending;
      default:
        return newArrivals;
    }
  };

  const logoMap: Record<string, any> = {
    apple: applelogo,
    samsung: samsunglogo,
    oneplus: onepluslogo,
    google: googlelogo,
    xiaomi: xiaomilogo,
    oppo: oppologo,
    vivo: vivologo,
    realme: realmelogo,
    motorola: motorolalogo,
    nothing: nothinglogo,
    honor: honorlogo,
    nokia: nokialogo,
  };

  const brandLogos = (cmsBrands.length > 0 ? cmsBrands : brands).map((b) => ({
    name: b.name,
    logo: logoMap[b.slug.toLowerCase()] || b.logo || applelogo,
    slug: b.slug,
  }));

  const categoryImageMap: Record<string, any> = {
    // Slugs from mock-data.ts baseline categories
    tablets: mobilecovers,
    laptops: koreanbag,
    smartwatches: smartwatches,
    audio: wirelessearbuds,
    // Power Banks — all slug variants
    "power-banks": powerbanks,
    powerbanks: powerbanks,
    "power banks": powerbanks,
    "power-bank": powerbanks,
    // Chargers / Fast Chargers — all slug variants
    chargers: fastcharges,
    "fast-chargers": fastcharges,
    "fast-charger": fastcharges,
    fastchargers: fastcharges,
    "fast chargers": fastcharges,
    // Earbuds / Wireless Earbuds — all slug variants
    earbuds: wirelessearbuds,
    "wireless-earbuds": wirelessearbuds,
    "wireless earbuds": wirelessearbuds,
    wirelessearbuds: wirelessearbuds,
    // Mobile Covers / Cases — all slug variants
    cases: mobilecovers,
    "mobile-covers": mobilecovers,
    "mobile covers": mobilecovers,
    mobilecovers: mobilecovers,
    covers: mobilecovers,
    "phone-cases": mobilecovers,
    // iPhone Covers — all slug variants
    "iphone-covers": iphone16cover,
    "iphone covers": iphone16cover,
    iphonecovers: iphone16cover,
    "iphone-cover": iphone16cover,
    "iphone cover": iphone16cover,
    // Screen Protectors / Tempered Glass / Screen Guards — all slug variants
    "screen-protectors": temperredglass,
    "screen protectors": temperredglass,
    "tempered-glass": temperredglass,
    "tempered glass": temperredglass,
    "screen-guard": temperredglass,
    "screen guard": temperredglass,
    "screen-guards": temperredglass,
    "screen guards": temperredglass,
    screenguards: temperredglass,
    // Smartwatches — all slug variants
    "smart-watches": smartwatches,
    "smart watches": smartwatches,
    watch: smartwatches,
    watches: smartwatches,
    // Laptop Bags / Korean Bags — all slug variants
    "laptop-bags": koreanbag,
    "laptop bags": koreanbag,
    laptopbags: koreanbag,
    "korean-bags": koreanbag,
    "korean bags": koreanbag,
    koreanbags: koreanbag,
    bags: koreanbag,
    // Wireless Mouse & Keyboard / Wireless Accessories — all slug variants
    "wireless-accessories": wirelessmouseandkeyboard,
    "wireless accessories": wirelessmouseandkeyboard,
    "wireless-mouse-keyboard": wirelessmouseandkeyboard,
    "wireless-mouse-&-keyboard": wirelessmouseandkeyboard,
    "mouse-keyboard": wirelessmouseandkeyboard,
    "mouse-and-keyboard": wirelessmouseandkeyboard,
    "wireless-keyboard-&-mouse": wirelessmouseandkeyboard,
    "wireless-keyboard-mouse": wirelessmouseandkeyboard,
    "wireless keyboard & mouse": wirelessmouseandkeyboard,
    "wireless keyboard mouse": wirelessmouseandkeyboard,
    "keyboard-mouse": wirelessmouseandkeyboard,
    "keyboard-&-mouse": wirelessmouseandkeyboard,
  };

  const categoryIconMap: Record<string, any> = {
    // Slugs from mock-data.ts baseline categories
    tablets: Laptop,
    laptops: Laptop,
    smartwatches: Watch,
    audio: Headphones,
    // Power Banks — all slug variants
    "power-banks": Battery,
    powerbanks: Battery,
    "power-bank": Battery,
    // Chargers — all slug variants
    chargers: Zap,
    "fast-chargers": Zap,
    "fast-charger": Zap,
    fastchargers: Zap,
    // Earbuds — all slug variants
    earbuds: Headphones,
    "wireless-earbuds": Headphones,
    wirelessearbuds: Headphones,
    // Mobile Covers / Cases — all slug variants
    cases: ShieldCheck,
    "mobile-covers": ShieldCheck,
    mobilecovers: ShieldCheck,
    covers: ShieldCheck,
    "phone-cases": ShieldCheck,
    // Screen Protectors — all slug variants
    "screen-protectors": Sparkles,
    "tempered-glass": Sparkles,
    "screen-guard": Sparkles,
    // Smartwatches — all slug variants
    "smart-watches": Watch,
    "smart watches": Watch,
    watch: Watch,
    watches: Watch,
    // Laptop Bags / Korean Bags — all slug variants
    "laptop-bags": Laptop,
    "korean-bags": Laptop,
    koreanbags: Laptop,
    bags: Laptop,
    // Wireless Mouse & Keyboard — all slug variants
    "wireless-accessories": Wifi,
    "wireless-mouse-keyboard": Wifi,
    "wireless-mouse-&-keyboard": Wifi,
    "mouse-keyboard": Wifi,
    "mouse-and-keyboard": Wifi,
  };

  const EXCLUDED_CATEGORY_SLUGS = ["smartphones", "accessories", "premium-covers", "premium covers", "premiumcovers"];

  const categoriesData = (cmsCategories.length > 0 ? cmsCategories : categories)
    .filter((c) => !EXCLUDED_CATEGORY_SLUGS.includes(c.slug.toLowerCase()))
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      image: categoryImageMap[c.slug.toLowerCase()] || powerbanks,
      icon: categoryIconMap[c.slug.toLowerCase()] || Battery,
      categoryFilter: c.name,
    }));

  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultSlides = [
    {
      title: "iPhone 16 Pro Max",
      subtitle: "Titanium. So robust. So light. So Pro.",
      description: "Camera Control. 4K 120 fps Dolby Vision. A18 Pro chip. Experience peak Apple innovation.",
      image: iphone17ProMaxBgImg,
      cta: "Shop Now",
      link: "/product/iphone-16-pro-max"
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      subtitle: "The Ultimate AI Experience.",
      description: "Galaxy AI. S Pen. 200MP camera. The most powerful Galaxy ever — exclusively at House of Phones.",
      image: samsungs24BgImg,
      cta: "Shop Now",
      link: "/product/galaxy-s24-ultra"
    },
    {
      title: "OnePlus 12",
      subtitle: "Flagship Killer Evolved.",
      description: "Snapdragon 8 Gen 3. Hasselblad camera. 100W charging. Redefining flagship performance.",
      image: oneplus12BgImg,
      cta: "Shop Now",
      link: "/product/oneplus-12"
    }
  ];

  const optimizeBannerImageUrl = (url: any): any => {
    if (!url || typeof url !== "string") return url;
    if (url.includes("images.unsplash.com")) {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set("auto", "format");
        parsed.searchParams.set("fit", "crop");
        parsed.searchParams.set("w", "2560");
        parsed.searchParams.set("q", "95");
        return parsed.toString();
      } catch {
        return url;
      }
    }
    return url;
  };

  const slides = cmsBanners.length > 0
    ? cmsBanners.map((b, idx) => {
        const defaultSlide = defaultSlides[idx % defaultSlides.length];
        return {
          title: b.title || defaultSlide.title,
          subtitle: b.subtitle || b.description || defaultSlide.subtitle,
          description: b.description || defaultSlide.description,
          image: optimizeBannerImageUrl(b.image) || defaultSlide.image,
          cta: b.buttonText || b.cta || defaultSlide.cta,
          link: b.link || defaultSlide.link,
        };
      })
    : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <PageLayout bare>
      {/* Full Screen Hero with Slider */}
      <section className="relative h-[81vh] md:h-screen p-4 md:p-6 lg:p-8">
        <div className="relative w-full h-full overflow-hidden rounded-3xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                willChange: "opacity",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 via-50% to-transparent z-10 pointer-events-none" />
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className="w-full h-full object-cover object-center banner-sharp"
                style={{
                  imageRendering: "-webkit-optimize-contrast",
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                }}
              />
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="container-hop w-full">
                  <div className="max-w-2xl text-white fade-in-up">
                    <p className="text-xs tracking-[0.35em] uppercase text-primary-light mb-4 flex items-center gap-2">
                      <span className="inline-block w-8 h-px bg-primary-light" /> New Arrival
                    </p>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
                      {slide.title}
                    </h1>
                    <p className="mt-4 font-serif text-xl md:text-2xl text-white/90">
                      {slide.subtitle}
                    </p>
                    <p className="mt-5 text-sm md:text-base text-white/80 max-w-md">
                      {slide.description}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to={slide.link}
                        className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-primary-light hover:text-white transition-colors"
                      >
                        {slide.cta} <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 border border-white/50 text-white px-7 py-3.5 rounded-full text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
                      >
                        Explore All
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors flex items-center justify-center text-white border border-white/30"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "w-8 bg-white"
                    : "w-4 bg-white/50 hover:bg-white/80"
                  }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors flex items-center justify-center text-white border border-white/30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* USP Strip */}
      <section className="container-hop mt-8 relative z-10 -mt-16">
        <div className="glass-card rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60 bg-white/95 backdrop-blur-sm shadow-xl">
          {[
            { icon: ShieldCheck, title: "100% Original", sub: "Sourced directly from brands" },
            { icon: BadgeCheck, title: "Best Price Guarantee", sub: "Get the best deals always" },
            { icon: Truck, title: "Free Delivery", sub: "On orders above ₹499" },
            { icon: RotateCcw, title: "Easy Returns", sub: "Hassle-free 7-day returns" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3 p-5">
              <div className="w-11 h-11 grid place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                <f.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.title}</p>
                <p className="text-xs text-muted-foreground truncate">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section - REDUCED CARD SIZE */}
      {/* Categories Section - AUTO SLIDER VERSION */}
      {/* Categories Section - AUTO SLIDER VERSION */}
      <section className="container-hop mt-24">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-purple-400/5 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-10 h-0.5 bg-primary"></span>
                <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Categories</span>
              </div>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl tracking-tight">
                Shop by <span className="text-primary">Category</span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm">
                Explore our curated collection of premium accessories and essentials
              </p>
            </div>
            <div className="flex justify-end">
              <Link
                to="/accessories"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#D4A574] text-white text-xs font-medium hover:bg-[#C4956A] hover:shadow-lg transition-all group hover:scale-105 flex-shrink-0 md:px-10 md:py-4 md:text-base"
              >
                View All
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Slider Container */}
          <div className="relative overflow-hidden">
            {/* Slider Track - Auto Scroll */}
            <div
              id="category-slider"
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth'
              }}
            >
              <style>{`
                #category-slider::-webkit-scrollbar {
                  display: none !important;
                }
              `}</style>

              {/* Duplicate categories for infinite loop - 3 times */}
              {[...categoriesData, ...categoriesData, ...categoriesData].map((category, index) => (
                <div
                  key={`${category.slug}-${index}`}
                  className="category-slide flex-shrink-0 w-[calc((100%-32px)/3)] md:w-[calc((100%-64px)/5)]"
                >

                  {/* Add responsive width using media query */}
                  <style>{`
    @media (min-width: 768px) {
      .category-slide {
        width: calc((100% - 64px) / 5) !important; /* 5 cards on desktop */
      }
    }
  `}</style>
                  <Link
                    to="/accessories"
                    search={{ category: category.categoryFilter }}
                    className="group relative rounded-2xl overflow-hidden h-[170px] md:h-auto md:aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-700/50 z-10"></div>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-20"></div>

                    {/* Icon */}
                    <div className="absolute top-3 right-3 z-30">
                      <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <category.icon size={14} className="text-white/80" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 p-3">
                      <h3 className="text-white text-xs font-semibold tracking-tight leading-tight">
                        {category.name.split(' / ')[0]}
                        {category.name.includes(' / ') && (
                          <span className="block text-[10px] font-normal text-white/60 mt-0.5">
                            {category.name.split(' / ').slice(1).join(' / ')}
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute bottom-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-x-2 group-hover:translate-x-0">
                      <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 transition-colors border border-white/15">
                        <ArrowRight size={12} className="text-white" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows and Explore All Categories Button */}
          <div className="relative flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => {
                const container = document.getElementById('category-slider');
                if (container) {
                  const cardWidth = container.querySelector('.category-slide')?.clientWidth || 0;
                  const gap = 16;
                  container.scrollLeft -= (cardWidth + gap) * 2; // 2 cards jump
                }
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-200"
              aria-label="Previous"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            <Link
              to="/accessories"
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-[10px] md:text-xs tracking-widest uppercase hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300"
            >
              Explore All Categories
              <ArrowRight size={12} className="md:size-14" />
            </Link>

            <button
              onClick={() => {
                const container = document.getElementById('category-slider');
                if (container) {
                  const cardWidth = container.querySelector('.category-slide')?.clientWidth || 0;
                  const gap = 16;
                  container.scrollLeft += (cardWidth + gap) * 2; // 2 cards jump
                }
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50 hover:scale-110 transition-all duration-300 border border-gray-200"
              aria-label="Next"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </div>
        </div>
      </section>
      {/* What's Popular Section */}
      <section className="container-hop mt-24">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 via-purple-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-gradient-to-tr from-amber-400/5 via-orange-400/5 to-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-primary to-primary/40"></span>
                <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  Curated Picks
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
                What's <span className="text-primary">Popular</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm">
                Discover the most sought-after products loved by our customers
              </p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#D4A574] text-white text-xs font-medium hover:bg-[#C4956A] hover:shadow-lg transition-all group hover:scale-105 md:px-10 md:py-4 md:text-base"
              >
                View All Products
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative mb-10">
            <div className="flex flex-wrap gap-2 md:gap-3 border-b border-border/50 pb-0">
              {[
                { label: "New Arrivals", icon: Sparkles },
                { label: "Best Sellers", icon: Award },
                { label: "Trending Now", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setPopularTab(tab.label)}
                  className={`group relative px-6 md:px-8 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2.5 rounded-t-2xl ${popularTab === tab.label
                      ? "text-primary bg-primary/5 border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <tab.icon size={16} className={popularTab === tab.label ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                  {tab.label}
                  {popularTab === tab.label && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {getPopularProducts().map((product) => (
              <div key={product.id} className="group">
                <Link
                  to={`/product/${product.slug || product.id}`}
                  className="block relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      {popularTab === "New Arrivals" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A574] text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-md">
                          <Sparkles size={10} />
                          New
                        </span>
                      )}
                      {popularTab === "Best Sellers" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A574] text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-md">
                          <Award size={10} />
                          Bestseller
                        </span>
                      )}
                      {popularTab === "Trending Now" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A574] text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-md">
                          <TrendingUp size={10} />
                          Trending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col">
                    <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category || "Accessory"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-serif font-bold text-foreground">
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          guard({ type: "none" }, () => {
                            addToCart({ product, qty: 1, color: product.colors?.[0], storage: product.storage?.[0] });
                            toast.success(`${product.name} added to cart`);
                          }, "Please create an account or log in first to add products to your cart.");
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4A574] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#C4956A] hover:shadow-lg transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          guard({ type: "wishlist", productId: product.id }, () => {
                            const added = wishlist.toggle(product.id);
                            toast.success(added ? "Added to wishlist" : "Removed from wishlist");
                          }, "Please create an account or log in first to add products to your wishlist.");
                        }}
                        className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-white/90 hover:shadow-lg transition-all duration-300 ${
                          wishlist.has(product.id) ? "text-red-500" : "text-foreground"
                        }`}
                      >
                        <Heart size={18} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Independence Day Offer Banner - Mobile Optimized
      <section className="container-hop mt-8 md:mt-24">
  <Link 
    to="/offers" 
    className="relative rounded-3xl overflow-hidden block transition-transform hover:scale-[1.02] duration-300"
  >
    <img
      src={offerbanner}
      alt="Independence Day Special Offer"
      className="w-full h-[140px] md:h-full object-cover"
    />
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto">
            <div className="flex items-center justify-center gap-1 md:gap-2 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg w-full md:w-auto">
              <span className="text-[8px] md:text-xs text-gray-700 font-medium whitespace-nowrap">OFFER ENDS IN:</span>
              <div className="flex items-center gap-0.5 md:gap-1 text-gray-800">
                <div className="text-center">
                  <span className="text-[10px] md:text-base font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="text-[5px] md:text-[8px] block leading-none text-gray-500">D</span>
                </div>
                <span className="text-[10px] md:text-base font-bold text-gray-400">:</span>
                <div className="text-center">
                  <span className="text-[10px] md:text-base font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[5px] md:text-[8px] block leading-none text-gray-500">H</span>
                </div>
                <span className="text-[10px] md:text-base font-bold text-gray-400">:</span>
                <div className="text-center">
                  <span className="text-[10px] md:text-base font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[5px] md:text-[8px] block leading-none text-gray-500">M</span>
                </div>
                <span className="text-[10px] md:text-base font-bold text-gray-400">:</span>
                <div className="text-center">
                  <span className="text-[10px] md:text-base font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[5px] md:text-[8px] block leading-none text-gray-500">S</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>*/}

      {/* Brands Section */}
      <section className="container-hop mt-8 md:mt-24">
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-10 h-0.5 bg-stone-400"></span>
                <span className="text-xs tracking-[0.35em] uppercase text-stone-500 font-medium">
                  Trusted Partners
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-stone-800">
                Shop by <span className="text-stone-600">Brand</span>
              </h2>
              <p className="text-stone-400 mt-2 max-w-xl text-sm">
                Explore products from the world's most trusted smartphone brands
              </p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
              <Link
                to="/brands"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#D4A574] text-white text-xs font-medium hover:bg-[#C4956A] hover:shadow-lg transition-all group hover:scale-105 md:px-10 md:py-4 md:text-base"
              >
                View All Brands
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <AutoScrollBrandCarouselNoScrollbar brands={brandLogos} />
        </div>
      </section>



      {/* Premium Accessories Section */}
      <section className="container-hop mt-24">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 via-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/5 via-cyan-400/5 to-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 via-purple-400/5 to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block w-10 h-0.5 bg-gradient-to-r from-primary to-purple-400"></span>
                <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium flex items-center gap-2">
                  <Headphones size={14} className="text-primary" />
                  Complete Your Setup
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
                Premium <span className="text-primary">Accessories</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl text-sm">
                Elevate your experience with our curated selection of premium accessories
              </p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
              <Link
                to="/accessories"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#D4A574] text-white text-xs font-medium hover:bg-[#C4956A] hover:shadow-lg transition-all group hover:scale-105 md:px-10 md:py-4 md:text-base"
              >
                Shop All Accessories
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {featuredAcc.map((product) => (
              <div key={product.id} className="group">
                <Link
                  to={`/product/${product.slug || product.id}`}
                  className="block relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-gray-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/30 to-accent/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A574] text-white text-[9px] font-semibold tracking-widest uppercase rounded-full shadow-md">
                        <Sparkles size={10} />
                        Premium
                      </span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col">
                    <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category || "Accessory"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-serif font-bold text-foreground">
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          guard({ type: "none" }, () => {
                            addToCart({ product, qty: 1, color: product.colors?.[0], storage: product.storage?.[0] });
                            toast.success(`${product.name} added to cart`);
                          }, "Please create an account or log in first to add products to your cart.");
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4A574] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#C4956A] hover:shadow-lg transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          guard({ type: "wishlist", productId: product.id }, () => {
                            const added = wishlist.toggle(product.id);
                            toast.success(added ? "Added to wishlist" : "Removed from wishlist");
                          }, "Please create an account or log in first to add products to your wishlist.");
                        }}
                        className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-white/90 hover:shadow-lg transition-all duration-300 ${
                          wishlist.has(product.id) ? "text-red-500" : "text-foreground"
                        }`}
                      >
                        <Heart size={18} fill={wishlist.has(product.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
            <Link
              to="/accessories"
              search={{ category: "Wireless Earbuds" }}
              className="group relative rounded-3xl overflow-hidden p-8 md:p-10 min-h-[220px] hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-500 hover:-translate-y-1"
              style={{
                backgroundImage: `url(${protectionaudiobgimg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-500"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Headphones size={28} className="text-white" />
                  </div>
                  <h3 className="text-white text-2xl md:text-3xl font-serif font-bold leading-tight">
                    Premium Audio
                  </h3>
                  <p className="text-white/70 text-sm mt-2">
                    Wireless earbuds & headphones
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors mt-4">
                  <span className="text-sm font-medium">Explore Collection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/accessories"
              search={{ category: "iPhone Covers" }}
              className="group relative rounded-3xl overflow-hidden p-8 md:p-10 min-h-[220px] hover:shadow-2xl hover:shadow-stone-500/30 transition-all duration-500 hover:-translate-y-1"
              style={{
                backgroundImage: `url(${deviceprotectionbgimg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-all duration-500"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <ShieldCheck size={28} className="text-white" />
                  </div>
                  <h3 className="text-white text-2xl md:text-3xl font-serif font-bold leading-tight">
                    Device Protection
                  </h3>
                  <p className="text-white/70 text-sm mt-2">
                    Cases, covers & screen protectors
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors mt-4">
                  <span className="text-sm font-medium">Explore Collection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-hop mt-24">
        <SectionHead eyebrow="Testimonials" title="Words from Our Customers" />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { n: "Rohan K.", t: "Corporate Buyer", q: "Best purchase experience for our 50-device rollout. GST invoicing was flawless." },
            { n: "Ananya P.", t: "Student", q: "Loved the student offer on my iPhone. Genuine product, delivered next day in Pune." },
            { n: "Vikram S.", t: "Professional", q: "The MagSafe accessories are top-notch. Feels like a proper luxury boutique." },
          ].map((r) => (
            <div key={r.n} className="rounded-2xl border-2 border-[#D4A574] p-8 relative overflow-hidden min-h-[220px] flex flex-col justify-between bg-white">
              <div className="relative z-10 flex flex-col h-full">
                <Quote size={28} className="text-[#D4A574]/70 mb-3" />
                <p className="text-gray-800 leading-relaxed flex-grow">{r.q}</p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.n}</p>
                    <p className="text-xs text-gray-600">{r.t}</p>
                  </div>
                  <div className="flex gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
{/* Store info */}
      <section className="container-hop mt-4 md:mt-10 lg:mt-12"> {/* Changed from mt-24 to smaller values */}
        <div className="rounded-3xl overflow-hidden border border-border">
          <div className="relative min-h-[350px] md:min-h-[400px] lg:min-h-[450px] flex items-center justify-center"
            style={{
              backgroundImage: `url(${visitbanner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center py-10 md:py-16 lg:py-20 px-4 sm:px-6 md:px-10 lg:px-14 w-full">
              <div className="max-w-2xl w-full">
                <div className="mb-4 md:mb-6">
                  <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white mb-2 md:mb-3">Visit Us</p>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold relative inline-block">
                    Find Us Here
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-primary-light to-primary-light/20 rounded-full"></span>
                  </h2>
                </div>
                <div className="mt-4 md:mt-6 space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-[#CBD5E1]">
                  <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="text-[#94A3B8] font-medium text-[10px] sm:text-xs">Address:</span>
                    <span className="text-center text-[11px] sm:text-sm">Shop No. 8 &amp; 9, Saraswati Mini Market, Bibwewadi, Pune – 411037</span>
                  </p>
                  <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="text-[#94A3B8] font-medium text-[10px] sm:text-xs">Phone:</span>
                    <span className="text-[11px] sm:text-sm">+91 98765 43210</span>
                  </p>
                  <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="text-[#94A3B8] font-medium text-[10px] sm:text-xs">Email:</span>
                    <span className="text-[11px] sm:text-sm">info@houseofphones.com</span>
                  </p>
                  <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="text-[#94A3B8] font-medium text-[10px] sm:text-xs">WhatsApp:</span>
                    <span className="text-[11px] sm:text-sm">Chat with us on +91 98765 43210</span>
                  </p>
                </div>
                <Link to="/contact#map" viewTransition
                  className="mt-5 md:mt-8 inline-flex items-center gap-2 bg-white text-[#0F172A] px-5 sm:px-6 md:px-7 py-2.5 sm:py-3 md:py-3.5 rounded-full text-[10px] sm:text-xs md:text-sm tracking-widest uppercase hover:bg-primary-light hover:text-white transition-colors shadow-lg hover:shadow-xl">
                  Get Directions <ArrowRight size={14} className="hidden sm:inline-block" />
                  <ArrowRight size={12} className="sm:hidden" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function AutoScrollBrandCarouselNoScrollbar({ brands }: { brands: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const speedRef = useRef(0.5);
  const [duplicatedBrands] = useState(() => [...brands, ...brands, ...brands]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const checkAndResetScroll = () => {
      if (!container) return;
      const firstSetWidth = container.scrollWidth / 3;
      if (container.scrollLeft >= firstSetWidth * 2) {
        container.scrollLeft = firstSetWidth;
      }
      if (container.scrollLeft <= 0) {
        container.scrollLeft = firstSetWidth;
      }
    };
    const scroll = () => {
      if (!container || isPaused) {
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }
      container.scrollLeft += speedRef.current;
      checkAndResetScroll();
      animationRef.current = requestAnimationFrame(scroll);
    };
    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);
  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  return (
    <div
      className="relative pt-4 pb-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute left-0 top-4 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-4 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      <div
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab'
        }}
      >
        <style>{`
          .overflow-x-auto::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .overflow-x-auto {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>
        {duplicatedBrands.map((brand, index) => (
          <Link
            key={`${brand.slug}-${index}`}
            to="/brands"
            className="group flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
          >
            <div className="flex flex-col items-center justify-center aspect-square">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain max-w-[85%] max-h-[85%] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { label: string; to: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs tracking-[0.35em] uppercase text-primary mb-2 flex items-center gap-2">
          <span className="inline-block w-6 h-px bg-primary" /> {eyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className="text-sm uppercase tracking-widest hover:text-primary inline-flex items-center gap-1.5">
          {action.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}