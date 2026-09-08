import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck, Shield, Clock, CreditCard, AlertTriangle, Phone, Mail, MessageCircle, Package, Search, Truck, CheckCircle2, ClipboardList, FileText, Wrench, Headphones, MapPin, Globe } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";

const policies = {
  privacy: {
    t: "Privacy Policy",
    d: "How we collect, use and protect your data.",
    s: [
      ["Information We Collect", "We collect information you provide directly (account, orders, addresses) and technical data (device, cookies) to deliver our services."],
      ["How We Use Data", "To fulfil orders, provide support, personalize offers and improve our website. We never sell your data."],
      ["Data Security", "Industry-standard encryption in transit and at rest. Access is restricted to authorized personnel."],
      ["Your Rights", "You may request access, correction or deletion of your personal data at any time via info@houseofphones.com."],
    ],
  },
  terms: {
    t: "Terms & Conditions",
    d: "The terms governing your use of our website and services.",
    s: [
      ["Acceptance", "By using our site you agree to these terms. If you disagree, please discontinue use."],
      ["Orders", "All orders are subject to acceptance and availability. Prices include GST unless stated otherwise."],
      ["Warranty", "Manufacturer warranty applies to all devices. Refer to the individual product page for details."],
      ["Governing Law", "These terms are governed by the laws of India, with jurisdiction in the courts of Pune."],
    ],
  },
  shipping: {
    t: "Shipping Policy",
    d: "Delivery timelines and pincode coverage.",
    s: [
      ["Delivery Areas", "We deliver across India via trusted courier partners."],
      ["Timelines", "Standard: 2-4 business days. Express: next business day. Store pickup available in Pune."],
      ["Charges", "Free standard shipping on orders above ₹499. Express is ₹149."],
      ["Tracking", "You'll receive tracking details by SMS and email as soon as your order ships."],
    ],
  },
  refund: {
    t: "Refund Policy",
    d: "Our fair and simple return policy.",
    s: [
      ["Eligibility", "Returns accepted within 7 days for unopened items in original condition."],
      ["Process", "Initiate a return from your account or contact us — we'll arrange pickup."],
      ["Refunds", "Credited to your original payment method within 5-7 business days of pickup."],
      ["Exclusions", "Opened accessories and personalized items are non-returnable unless defective."],
    ],
  },
  warranty: {
    t: "Warranty Policy",
    d: "Manufacturer and extended warranty details.",
    s: [
      ["Standard", "All devices carry a 1-year manufacturer warranty unless specified otherwise."],
      ["Coverage", "Manufacturing defects and hardware failures under normal use."],
      ["Claims", "Reach out to our support team with your invoice — we'll coordinate with the brand's service centre."],
      ["Extended Plans", "Optional 1-2 year extended plans available at checkout."],
    ],
  },
} as const;

type PolicyKey = keyof typeof policies;

function PolicyView({ k }: { k: PolicyKey }) {
  const p = policies[k];
  return (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img
          src={innerBanner}
          alt={p.t}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="policyPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#policyPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">{p.t}</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">
            {p.t}
          </h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            {p.d}
          </p>
        </div>
      </section>

      <section className="container-hop py-10 max-w-3xl space-y-8">
        {p.s.map(([h, b]) => (
          <div key={h}>
            <h2 className="font-serif text-2xl">{h}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{b}</p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-6 border-t border-border">Last updated: July 2026</p>
      </section>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Premium Returns & Refunds Policy View                              */
/* ------------------------------------------------------------------ */

function RefundPolicyView() {
  const steps = [
    { num: "01", title: "Request Return", desc: "Select the order from My Account and submit a return request with your reason.", icon: ClipboardList },
    { num: "02", title: "Request Review", desc: "Our team reviews your request for eligibility within 24-48 hours.", icon: Search },
    { num: "03", title: "Pickup", desc: "If approved, we arrange a free pickup from your address at a convenient time.", icon: Truck },
    { num: "04", title: "Quality Check", desc: "The returned product is inspected to verify its condition and eligibility.", icon: Package },
    { num: "05", title: "Refund", desc: "Once approved, the refund is initiated to your original payment method.", icon: CreditCard },
  ];

  return (
    <PageLayout bare>
      {/* Hero Banner — unchanged */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Returns & Refunds" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="refundPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#refundPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Returns & Refunds</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Returns & Refunds</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            Our fair and simple return policy — designed to make returns hassle-free.
          </p>
        </div>
      </section>

      {/* 7-Day Return Policy Highlight */}
      <section className="container-hop py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 md:p-12">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
            <ShieldCheck size={120} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
              <ShieldCheck size={14} />
              7-Day Return Policy
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3">Easy Returns Within 7 Days</h2>
            <p className="text-muted-foreground leading-relaxed">
              Not satisfied with your purchase? You can return most items within <strong className="text-foreground">7 days of delivery</strong> for a full refund. We believe in making your shopping experience risk-free and convenient.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Eligibility</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Return Eligibility</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Within 7 Days", desc: "Product must be within the 7-day return window from the date of delivery." },
              { title: "Original Condition", desc: "Product should be unused, undamaged, and in its original condition." },
              { title: "Original Packaging", desc: "Original packaging and accessories should be retained where applicable." },
              { title: "Proof of Purchase", desc: "Order details or invoice may be required to process the return." },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Returns Work — 5 Steps */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">How It Works</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-8">How Returns Work</h2>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-4 pb-8 last:pb-0 relative">
                {/* Vertical connector */}
                {i < steps.length - 1 && (
                  <div className="absolute left-5 top-12 w-px h-[calc(100%-2rem)] bg-border" />
                )}
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0 text-sm font-medium">
                  {step.num}
                </div>
                <div className="pt-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Refund Information</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Refund Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 grid place-items-center mb-3">
                <CreditCard size={20} />
              </div>
              <h3 className="font-medium mb-2">Refund Method</h3>
              <p className="text-sm text-muted-foreground">
                Refunds are processed through the original payment method used at checkout. For COD orders, refunds are transferred to your bank account.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 grid place-items-center mb-3">
                <Clock size={20} />
              </div>
              <h3 className="font-medium mb-2">Refund Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Refunds are initiated within <strong>5–7 business days</strong> after the returned product is received and approved at our facility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Returnable / Exclusions */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Exclusions</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Non-Returnable Items</h2>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 mb-3">The following items are generally not eligible for return:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Opened accessories (cases, screen guards, chargers, cables, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Personalized or custom-configured items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Items returned after the 7-day return period
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Products that do not meet the return condition requirements
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong className="text-foreground">Note:</strong> These exclusions do not apply if the product is defective or damaged on arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Damaged / Defective Product */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Damaged / Defective</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Received a Damaged or Defective Product?</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              We're sorry about that. If your product arrives damaged, defective, or not as described, please contact our support team or raise a return request as soon as possible.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Please provide your order details and, if possible, photos of the issue so we can process your request quickly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/account"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Package size={16} />
                Go to My Orders
              </Link>
              <a
                href="https://wa.me/919637671118"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-500/20 transition-colors"
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help? */}
      <section className="container-hop pb-12">
        <div className="max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-10">
            <div className="absolute top-4 right-4 opacity-10">
              <Phone size={100} className="text-background" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Need Help with a Return or Refund?</h2>
              <p className="text-background/70 mb-6 max-w-lg">
                Our support team is here to assist you with any return or refund queries. Reach out through any of the channels below.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+919637671118"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Phone size={16} />
                  +91 9637671118
                </a>
                <a
                  href="mailto:houseofphones92@gmail.com"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Mail size={16} />
                  houseofphones92@gmail.com
                </a>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="container-hop text-xs text-muted-foreground pb-8 max-w-3xl">Last updated: July 2026</p>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Premium Warranty Policy View                                       */
/* ------------------------------------------------------------------ */

function WarrantyPolicyView() {
  const cards = [
    {
      num: "01",
      title: "Manufacturer Warranty",
      desc: "All devices carry a 1-year manufacturer warranty unless specified otherwise.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      num: "02",
      title: "What's Covered",
      desc: "Manufacturing defects and hardware failures under normal use.",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      num: "03",
      title: "Warranty Claims",
      desc: "Reach out to our support team with your invoice — we'll coordinate with the brand's service centre.",
      icon: Wrench,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
    },
    {
      num: "04",
      title: "Extended Warranty Plans",
      desc: "Optional 1–2 year extended plans available at checkout.",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <PageLayout bare>
      {/* Hero Banner — unchanged */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Warranty Policy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="warrantyPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#warrantyPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Warranty Policy</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Warranty Policy</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            Manufacturer and extended warranty details for your peace of mind.
          </p>
        </div>
      </section>

      {/* Hero Highlight */}
      <section className="container-hop py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 md:p-12 animate-fade-in-up">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
            <Shield size={120} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
              <ShieldCheck size={14} />
              Warranty Protection
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3">Understand Your Device Warranty</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every device you purchase from House of Phones comes with manufacturer warranty coverage. We're here to help you make the most of it.
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Info Cards */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Warranty Details</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-8">Your Warranty at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <div
                key={card.num}
                className={`group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in-up ${
                  i === 1 ? "animate-delay-100" : i === 2 ? "animate-delay-200" : i === 3 ? "animate-delay-300" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} grid place-items-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{card.num}</span>
                    <h3 className="font-medium mt-0.5">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Need to Claim Warranty? */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Claim Process</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Need to Claim Warranty?</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-medium">How to Claim</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Have your invoice ready and contact our support team. We will coordinate with the brand's service centre on your behalf.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Keep your purchase invoice or order confirmation handy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Contact our support team with your order details</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>We'll coordinate with the brand's service centre</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:min-w-[200px]">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Headphones size={16} />
                  Contact Support
                </Link>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-500/10 text-green-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-500/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help? */}
      <section className="container-hop pb-12">
        <div className="max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-10">
            <div className="absolute top-4 right-4 opacity-10">
              <Phone size={100} className="text-background" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Questions About Your Warranty?</h2>
              <p className="text-background/70 mb-6 max-w-lg">
                Our support team is here to help with any warranty queries. Reach out through any of the channels below.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+919637671118"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Phone size={16} />
                  +91 9637671118
                </a>
                <a
                  href="mailto:houseofphones92@gmail.com"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Mail size={16} />
                  houseofphones92@gmail.com
                </a>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="container-hop text-xs text-muted-foreground pb-8 max-w-3xl">Last updated: July 2026</p>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Premium Shipping Policy View                                       */
/* ------------------------------------------------------------------ */

function ShippingPolicyView() {
  const cards = [
    {
      num: "01",
      title: "Delivery Areas",
      desc: "We deliver across India via trusted courier partners.",
      icon: Globe,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      num: "02",
      title: "Delivery Timelines",
      desc: null,
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-500/10",
      details: [
        { label: "Standard", value: "2–4 business days" },
        { label: "Express", value: "Next business day" },
        { label: "Store Pickup", value: "Available in Pune" },
      ],
    },
    {
      num: "03",
      title: "Shipping Charges",
      desc: null,
      icon: CreditCard,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
      details: [
        { label: "Standard Shipping", value: "Free on orders above ₹499" },
        { label: "Express Shipping", value: "₹149" },
      ],
    },
    {
      num: "04",
      title: "Order Tracking",
      desc: "You'll receive tracking details by SMS and email as soon as your order ships.",
      icon: Search,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <PageLayout bare>
      {/* Hero Banner — unchanged */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Shipping Policy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="shippingPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#shippingPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Shipping Policy</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Shipping Policy</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            Delivery timelines and pincode coverage.
          </p>
        </div>
      </section>

      {/* Hero Highlight */}
      <section className="container-hop py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 md:p-12 animate-fade-in-up">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
            <Truck size={120} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
              <Truck size={14} />
              Fast & Reliable Shipping
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3">We Deliver Across India</h2>
            <p className="text-muted-foreground leading-relaxed">
              From our store in Pune to your doorstep anywhere in India — we partner with trusted courier partners to ensure your order arrives safely and on time.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Info Cards */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Shipping Details</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-8">Your Shipping at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <div
                key={card.num}
                className={`group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in-up ${
                  i === 1 ? "animate-delay-100" : i === 2 ? "animate-delay-200" : i === 3 ? "animate-delay-300" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} grid place-items-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{card.num}</span>
                    <h3 className="font-medium mt-0.5">{card.title}</h3>
                    {card.desc && (
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{card.desc}</p>
                    )}
                    {card.details && (
                      <div className="mt-2 space-y-1.5">
                        {card.details.map((d) => (
                          <div key={d.label} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{d.label}</span>
                            <span className={`font-medium ${d.label === "Standard Shipping" ? "text-green-600" : d.label === "Express Shipping" ? "text-orange-600" : "text-foreground"}`}>
                              {d.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Pickup Section */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Store Pickup</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Pick Up From Our Store</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-medium">Bibwewadi, Pune</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Prefer to pick up your order in person? Store pickup is available from our Bibwewadi, Pune location. Your order will be ready within 2 hours of placement.
                </p>
                <a
                  href="https://www.google.com/maps?q=Shop+No.+8+%26+9,+Saraswati+Mini+Market,+Bibwewadi,+Pune+411037"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <MapPin size={14} />
                  View on Google Maps
                </a>
              </div>
              <div className="flex flex-col gap-3 md:min-w-[200px]">
                <div className="bg-green-500/10 text-green-700 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium">Store Pickup</p>
                  <p className="text-xs text-green-600/80 mt-1">Free · Ready in 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Your Order CTA */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Order Tracking</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Track Your Order</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <Package size={20} />
                  </div>
                  <h3 className="font-medium">Real-Time Tracking</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You'll receive tracking details by SMS and email as soon as your order ships. Follow your package from our store to your doorstep.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Order confirmation via SMS and email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Shipping updates with live tracking link</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Delivery notification on arrival</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:min-w-[200px]">
                <Link
                  to="/track-order"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Search size={16} />
                  Track Your Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help? */}
      <section className="container-hop pb-12">
        <div className="max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-10">
            <div className="absolute top-4 right-4 opacity-10">
              <Phone size={100} className="text-background" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Questions About Shipping?</h2>
              <p className="text-background/70 mb-6 max-w-lg">
                Our support team is here to help with any shipping queries. Reach out through any of the channels below.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+919637671118"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Phone size={16} />
                  +91 9637671118
                </a>
                <a
                  href="mailto:houseofphones92@gmail.com"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Mail size={16} />
                  houseofphones92@gmail.com
                </a>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="container-hop text-xs text-muted-foreground pb-8 max-w-3xl">Last updated: July 2026</p>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Premium Privacy Policy View                                        */
/* ------------------------------------------------------------------ */

function PrivacyPolicyView() {
  return (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Privacy Policy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="privacyPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#privacyPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Privacy Policy</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Privacy Policy</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            How we collect, use and protect your data.
          </p>
        </div>
      </section>

      {/* Hero Highlight */}
      <section className="container-hop py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 md:p-12 animate-fade-in-up">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
            <Shield size={120} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
              <ShieldCheck size={14} />
              Your Privacy Matters
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3">We Respect Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              At House of Phones, your privacy is a priority. This policy explains what information we collect, how we use it, and the rights you have over your data.
            </p>
          </div>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Information We Collect</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">What We Collect</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-medium">Your Information</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information you provide directly and technical data to deliver our services and improve your experience.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Account details (name, email, phone)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Order history and addresses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    <span>Device and browsing data (cookies)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Use Data */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">How We Use Data</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Why We Use Your Data</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your data to fulfil orders, provide support, personalize offers and improve our website. We never sell your data.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Order fulfillment and delivery</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Customer support and communication</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Personalized offers and recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Website improvement and analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Data Security</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">How We Protect Your Data</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-medium">Industry-Standard Security</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Industry-standard encryption in transit and at rest. Access is restricted to authorized personnel.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:min-w-[200px]">
                <div className="bg-green-500/10 text-green-700 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium">Encrypted & Secure</p>
                  <p className="text-xs text-green-600/80 mt-1">Your data is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Your Rights</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Your Data Rights</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may request access, correction or deletion of your personal data at any time via info@houseofphones.com.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Request access to your personal data</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Request correction of inaccurate data</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                <span>Request deletion of your data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help? */}
      <section className="container-hop pb-12">
        <div className="max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-10">
            <div className="absolute top-4 right-4 opacity-10">
              <Phone size={100} className="text-background" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Questions About Your Privacy?</h2>
              <p className="text-background/70 mb-6 max-w-lg">
                Our support team is here to help with any privacy queries. Reach out through any of the channels below.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+919637671118"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Phone size={16} />
                  +91 9637671118
                </a>
                <a
                  href="mailto:houseofphones92@gmail.com"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Mail size={16} />
                  houseofphones92@gmail.com
                </a>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="container-hop text-xs text-muted-foreground pb-8 max-w-3xl">Last updated: July 2026</p>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Premium Terms & Conditions Policy View                             */
/* ------------------------------------------------------------------ */

function TermsPolicyView() {
  return (
    <PageLayout bare>
      {/* Hero Banner */}
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Terms & Conditions" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="termsPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
                <circle cx="30" cy="30" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#termsPattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Terms & Conditions</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Terms & Conditions</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">
            The terms governing your use of our website and services.
          </p>
        </div>
      </section>

      {/* Hero Highlight */}
      <section className="container-hop py-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 md:p-12 animate-fade-in-up">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-10">
            <FileText size={120} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
              <FileText size={14} />
              Legal Terms
            </div>
            <h2 className="font-serif text-2xl md:text-3xl mb-3">Website Terms of Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using our website and services, you agree to the terms outlined below. Please read them carefully before placing an order.
            </p>
          </div>
        </div>
      </section>

      {/* Acceptance */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Acceptance</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Acceptance of Terms</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="font-medium">Agree to Terms</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  By using our site you agree to these terms. If you disagree, please discontinue use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Orders</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Order Terms</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <ClipboardList size={20} />
                  </div>
                  <h3 className="font-medium">Order Acceptance & Availability</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All orders are subject to acceptance and availability. Prices include GST unless stated otherwise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Warranty</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Warranty Information</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-medium">Manufacturer Warranty</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Manufacturer warranty applies to all devices. Refer to the individual product page for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governing Law */}
      <section className="container-hop pb-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block w-10 h-0.5 bg-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-medium">Governing Law</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl mb-6">Governing Law</h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <Globe size={20} />
                  </div>
                  <h3 className="font-medium">Jurisdiction</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by the laws of India, with jurisdiction in the courts of Pune.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Need Help? */}
      <section className="container-hop pb-12">
        <div className="max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-8 md:p-10">
            <div className="absolute top-4 right-4 opacity-10">
              <Phone size={100} className="text-background" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-3">Questions About Our Terms?</h2>
              <p className="text-background/70 mb-6 max-w-lg">
                Our support team is here to help with any queries about our terms and conditions. Reach out through any of the channels below.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+919637671118"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Phone size={16} />
                  +91 9637671118
                </a>
                <a
                  href="mailto:houseofphones92@gmail.com"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <Mail size={16} />
                  houseofphones92@gmail.com
                </a>
                <a
                  href="https://wa.me/919637671118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background/10 text-background px-5 py-2.5 rounded-full text-sm font-medium hover:bg-background/20 transition-colors"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="container-hop text-xs text-muted-foreground pb-8 max-w-3xl">Last updated: July 2026</p>
    </PageLayout>
  );
}

export { PolicyView, PrivacyPolicyView, TermsPolicyView, RefundPolicyView, WarrantyPolicyView, ShippingPolicyView, policies };
