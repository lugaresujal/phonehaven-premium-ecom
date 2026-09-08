import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  GraduationCap, 
  Gift, 
  CreditCard, 
  Zap, 
  Sparkles, 
  Shield, 
  Clock, 
  Tag, 
  Star, 
  IndianRupee,
  TrendingUp,
  Calendar,
  Users,
  Smartphone,
  Headphones,
  Watch,
  ChevronRight
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products-store";
import { useCms } from "@/lib/cms-store";
import innerBanner from "@/assets/images/innerbanner.png";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals — House of Phones" },
      { name: "description", content: "Exclusive student discounts, exchange bonuses, cashback deals and promotional offers on premium smartphones and accessories." },
      { property: "og:title", content: "Offers — House of Phones" },
      { property: "og:description", content: "Unlock exclusive deals, student discounts and special offers." },
      { property: "og:url", content: "/offers" },
    ],
    links: [{ rel: "canonical", href: "/offers" }],
  }),
  component: Offers,
});

function Offers() {
  const [activeTab, setActiveTab] = useState("all");
  const [isVisible, setIsVisible] = useState(false);
  const { offers: cmsOffers } = useCms();
  const [apiOffers, setApiOffers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 12,
    minutes: 25,
    seconds: 15
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1;
        if (newSeconds < 0) {
          const newMinutes = prev.minutes - 1;
          if (newMinutes < 0) {
            const newHours = prev.hours - 1;
            if (newHours < 0) {
              const newDays = prev.days - 1;
              if (newDays < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
              return { days: newDays, hours: 23, minutes: 59, seconds: 59 };
            }
            return { days: prev.days, hours: newHours, minutes: 59, seconds: 59 };
          }
          return { days: prev.days, hours: prev.hours, minutes: newMinutes, seconds: 59 };
        }
        return { ...prev, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync cmsOffers when available
  useEffect(() => {
    if (cmsOffers && cmsOffers.length > 0) {
      const iconMap: Record<string, any> = {
        student: GraduationCap,
        exchange: Shield,
        cashback: CreditCard,
        emi: Clock,
        accessories: Headphones,
      };
      const colorMap: Record<string, string> = {
        student: "from-blue-500 to-blue-700",
        exchange: "from-emerald-500 to-teal-600",
        cashback: "from-purple-500 to-pink-600",
        emi: "from-rose-500 to-pink-600",
        accessories: "from-amber-500 to-orange-600",
      };
      const bgMap: Record<string, string> = {
        student: "bg-blue-50",
        exchange: "bg-emerald-50",
        cashback: "bg-purple-50",
        emi: "bg-rose-50",
        accessories: "bg-amber-50",
      };
      const mapped = cmsOffers.map((o) => {
        const cat = (o.applicableTo || o.category || "all").toLowerCase();
        return {
          id: o.id,
          apiId: o.id,
          title: o.title,
          description: o.description || "",
          icon: iconMap[cat] || Tag,
          color: colorMap[cat] || "from-gray-500 to-gray-600",
          bgColor: bgMap[cat] || "bg-gray-50",
          badge: o.badge || "Special Offer",
          details: o.details || o.description || "Limited time offer",
          category: cat === "all" ? "student" : cat,
          status: o.status,
        };
      });
      setApiOffers(mapped);
    }
  }, [cmsOffers]);

  // Fetch offers from backend API
  useEffect(() => {
    fetch("http://localhost:5000/api/offers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.offers)) {
          const mapped = data.offers
            .filter((o: any) => o.status === "Active")
            .map((o: any) => {
              const cat = (o.applicableTo || "all").toLowerCase();
              const categoryMap: Record<string, string> = {
                student: "student",
                exchange: "exchange",
                cashback: "cashback",
                emi: "cashback",
                accessories: "accessories",
              };
              const category = categoryMap[cat] || "all";
              const iconMap: Record<string, any> = {
                student: GraduationCap,
                exchange: Shield,
                cashback: CreditCard,
                emi: Clock,
                accessories: Headphones,
              };
              const colorMap: Record<string, string> = {
                student: "from-blue-500 to-blue-700",
                exchange: "from-emerald-500 to-teal-600",
                cashback: "from-purple-500 to-pink-600",
                emi: "from-rose-500 to-pink-600",
                accessories: "from-amber-500 to-orange-600",
              };
              const bgMap: Record<string, string> = {
                student: "bg-blue-50",
                exchange: "bg-emerald-50",
                cashback: "bg-purple-50",
                emi: "bg-rose-50",
                accessories: "bg-amber-50",
              };
              return {
                id: o.id,
                apiId: o.id,
                title: o.title,
                description: o.description || "",
                icon: iconMap[cat] || Tag,
                color: colorMap[cat] || "from-gray-500 to-gray-600",
                bgColor: bgMap[cat] || "bg-gray-50",
                badge: o.discountValue
                  ? `${o.discountValue}${o.discountType === "Percentage" || o.discountType === "percentage" ? "%" : " Off"}`
                  : "Special Offer",
                details: o.description || "Limited time offer",
                category,
                status: o.status,
              };
            });
          setApiOffers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Hardcoded website offers (fallback/default)
  const hardcodedOffers = [
    { id: 1, title: "Student Special: 10% Off", description: "Exclusive discount for students on all smartphones and accessories", icon: GraduationCap, color: "from-blue-500 to-blue-700", bgColor: "bg-blue-50", badge: "Student ID Required", details: "Show your valid student ID at checkout", category: "student" },
    { id: 2, title: "Student Exchange Bonus", description: "Extra ₹2,000 off when you exchange your old device", icon: Zap, color: "from-indigo-500 to-purple-600", bgColor: "bg-indigo-50", badge: "Limited Time", details: "Available on select devices", category: "student" },
    { id: 5, title: "Exchange Bonus Up to ₹10,000", description: "Get maximum value for your old device", icon: Shield, color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", badge: "Best Value", details: "Free valuation at our store", category: "exchange" },
    { id: 6, title: "Upgrade & Save", description: "Additional ₹5,000 off when you upgrade to latest models", icon: TrendingUp, color: "from-cyan-500 to-blue-600", bgColor: "bg-cyan-50", badge: "Premium", details: "For select premium devices", category: "exchange" },
    { id: 7, title: "10% Cashback on EMI", description: "Get 10% instant cashback on all EMI purchases", icon: CreditCard, color: "from-purple-500 to-pink-600", bgColor: "bg-purple-50", badge: "All Banks", details: "Minimum order ₹30,000", category: "cashback" },
    { id: 8, title: "No Cost EMI", description: "Buy now, pay later with zero interest", icon: Clock, color: "from-rose-500 to-pink-600", bgColor: "bg-rose-50", badge: "3-24 Months", details: "Available on all products", category: "cashback" },
    { id: 9, title: "Accessories Combo Offer", description: "Buy any 2 accessories and get 20% off", icon: Headphones, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-50", badge: "Combo Deal", details: "Mix and match", category: "accessories" },
    { id: 10, title: "Free Case with Phone", description: "Get a premium case free with every smartphone purchase", icon: Smartphone, color: "from-slate-500 to-gray-600", bgColor: "bg-slate-50", badge: "Limited", details: "While stocks last", category: "accessories" },
  ];

  // Merge: API offers first, then hardcoded offers not already in API (deduplicate by title)
  const existingTitles = new Set(apiOffers.map((o) => o.title));
  const allOffers = [...apiOffers, ...hardcodedOffers.filter((o) => !existingTitles.has(o.title))];

  // Group offers by category
  const offers = {
    student: allOffers.filter((o) => o.category === "student"),
    exchange: allOffers.filter((o) => o.category === "exchange"),
    cashback: allOffers.filter((o) => o.category === "cashback"),
    accessories: allOffers.filter((o) => o.category === "accessories"),
  };

  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <PageLayout bare>
      {/* Hero Banner - Mobile Responsive Fix */}
      <section className="relative aspect-[16/9] md:h-[320px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt="Offers Banner"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <span className="inline-block w-8 sm:w-10 md:w-12 h-px bg-white/60"></span>
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-white/80 font-light">
              Exclusive Deals
            </p>
          </div>

          <h1 className="mt-1 sm:mt-2 md:mt-3 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] sm:leading-[1.1] md:leading-tight">
            Offers
          </h1>

          <p className="mt-1 sm:mt-2 md:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/80 font-light leading-relaxed sm:leading-relaxed md:leading-relaxed">
            Unlock exclusive deals, student discounts, and special offers on premium smartphones and accessories.
          </p>
          
          <div className="mt-3 sm:mt-4 md:mt-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4">
            <span className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm text-white/80 border border-white/10">
              <Sparkles size={12} className="hidden sm:inline-block" />
              <Sparkles size={10} className="sm:hidden" />
              {allOffers.length}+ Active Offers
            </span>
            <span className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm text-white/80 border border-white/10">
              <Calendar size={12} className="hidden sm:inline-block" />
              <Calendar size={10} className="sm:hidden" />
              Limited Time
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-hop py-8 sm:py-10 md:py-12">
        {/* Category Tabs - Mobile Responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 md:mb-10">
          {[
            { id: 'all', label: 'All Offers', icon: Tag },
            { id: 'student', label: 'Student Offers', icon: GraduationCap },
            { id: 'exchange', label: 'Exchange', icon: Shield },
            { id: 'cashback', label: 'Cashback & EMI', icon: CreditCard },
            { id: 'accessories', label: 'Accessories', icon: Headphones }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={14} className="hidden sm:inline-block" />
              <tab.icon size={12} className="sm:hidden" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Student Offers Section */}
        <div className={`mb-8 sm:mb-10 md:mb-12 transition-all duration-700 ${
          activeTab === 'all' || activeTab === 'student' ? 'opacity-100' : 'opacity-50'
        }`}>
          {(activeTab === 'all' || activeTab === 'student') && (
            <>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <GraduationCap
  className="text-primary sm:hidden"
  size={22}
/>
                <GraduationCap className="text-primary hidden sm:inline-block" size={28} />
                <h2 className="font-serif text-2xl sm:text-3xl">Student Offers</h2>
                <span className="text-[8px] sm:text-xs bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">For Students</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {offers.student.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Other Offers Grid */}
        <div className={`transition-all duration-700 ${
          activeTab === 'all' ? 'opacity-100' : 'opacity-50'
        }`}>
          {activeTab === 'all' && (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl mb-4 sm:mb-5 md:mb-6">More Great Deals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {[...offers.exchange, ...offers.cashback, ...offers.accessories].map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tab-specific content */}
        {activeTab === 'exchange' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {offers.exchange.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {activeTab === 'cashback' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {offers.cashback.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {activeTab === 'accessories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {offers.accessories.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {/* Featured Products on Offer */}
        <div className="mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-10 md:pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl">Products on Offer</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Grab these deals before they're gone</p>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-primary hover:gap-3 transition-all">
              View All <ChevronRight size={14} className="hidden sm:inline-block" />
              <ChevronRight size={12} className="sm:hidden" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 bg-red-500 text-white text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                  -15% OFF
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-10 sm:mt-11 md:mt-12 p-4 sm:p-5 md:p-6 rounded-2xl bg-card border border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
            * Terms and conditions apply. Offers are subject to change without prior notice. Student discount valid only on presentation of valid student ID. EMI options available with select banks. Exchange bonus subject to device condition assessment.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

// Offer Card Component - Mobile Responsive
function OfferCard({ offer }: { offer: any }) {
  const Icon = offer.icon;
  
  return (
    <div className={`group relative rounded-2xl ${offer.bgColor || 'bg-card'} border border-border/50 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden`}>
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-gradient-to-br ${offer.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
          <Icon size={18} className="sm:hidden" />
          <Icon size={20} className="hidden sm:inline-block md:hidden" />
          <Icon size={22} className="hidden md:inline-block" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg">{offer.title}</h3>
            <span className={`text-[8px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white/60 backdrop-blur-sm border border-border/30 whitespace-nowrap`}>
              {offer.badge}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{offer.description}</p>
          <p className="text-[10px] sm:text-xs text-foreground/70 mt-1 sm:mt-2 flex items-center gap-1">
            <Tag size={10} className="sm:hidden text-primary" />
            <Tag size={12} className="hidden sm:inline-block text-primary" />
            {offer.details}
          </p>
        </div>
      </div>
      
      {/* Hover arrow indicator */}
      <div className="absolute bottom-3 sm:bottom-3.5 md:bottom-4 right-3 sm:right-3.5 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ChevronRight size={16} className="sm:hidden text-primary" />
        <ChevronRight size={18} className="hidden sm:inline-block md:hidden text-primary" />
        <ChevronRight size={20} className="hidden md:inline-block text-primary" />
      </div>
    </div>
  );
}