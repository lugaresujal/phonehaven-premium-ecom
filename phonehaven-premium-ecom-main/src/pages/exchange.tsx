import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { RefreshCw, Check, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import { useState } from "react";

const BRANDS: Record<string, string[]> = {
  Apple: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13"],
  Samsung: ["Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24", "Galaxy A56", "Galaxy A36", "Galaxy A16"],
  OnePlus: ["OnePlus 13", "OnePlus 13R", "OnePlus 12", "OnePlus 12R", "OnePlus Nord CE4", "OnePlus Nord 4"],
  Xiaomi: ["Xiaomi 15", "Xiaomi 14", "Redmi Note 14 Pro+", "Redmi Note 14 Pro", "Redmi Note 14", "Poco X7 Pro"],
  Oppo: ["Oppo Find X8", "Oppo Reno 12", "Oppo A5 Pro", "Oppo A3 Pro"],
  Vivo: ["Vivo X200 Pro", "Vivo X200", "Vivo V40", "Vivo V40 SE", "Vivo T3"],
  Realme: ["Realme GT 7 Pro", "Realme 14 Pro+", "Realme 14 Pro", "Realme 13"],
  Google: ["Pixel 9 Pro", "Pixel 9", "Pixel 8a", "Pixel 8"],
  Motorola: ["Motorola Edge 50 Pro", "Motorola Edge 50 Ultra", "Moto G85", "Moto G75"],
  Nothing: ["Nothing Phone (3a)", "Nothing Phone (2a)", "Nothing Phone (2)"],
  Honor: ["Honor Magic 7 Pro", "Honor 300 Pro", "Honor X9b"],
  Nokia: ["Nokia G42", "Nokia G22"],
};

const STORAGE_OPTIONS = ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

const CONDITION_OPTIONS = [
  { value: "like-new", label: "Like New — No scratches, fully functional" },
  { value: "good", label: "Good — Minor scratches, fully functional" },
  { value: "fair", label: "Fair — Visible wear, works fine" },
  { value: "poor", label: "Poor — Heavy damage or partially functional" },
  { value: "not-working", label: "Not Working — Does not power on" },
];

export const Route = createFileRoute("/exchange")({
  head: () => ({
    meta: [
      { title: "Exchange Offer — Upgrade to the Latest | House of Phones" },
      { name: "description", content: "Get the best value for your old phone. Instant quote and hassle-free exchange." },
      { property: "og:url", content: "/exchange" },
    ],
    links: [{ rel: "canonical", href: "/exchange" }],
  }),
  component: () => {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      brand: "",
      model: "",
      storage: "",
      condition: "",
      notes: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
      if (!formData.brand) newErrors.brand = "Brand is required";
      if (!formData.model) newErrors.model = "Model is required";
      if (!formData.storage) newErrors.storage = "Storage is required";
      if (!formData.condition) newErrors.condition = "Condition is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "brand") next.model = "";
        return next;
      });
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      if (submitError) setSubmitError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      setSubmitError("");
      try {
        const productName = `${formData.brand} ${formData.model} ${formData.storage}`;
        const conditionLabel = CONDITION_OPTIONS.find((c) => c.value === formData.condition)?.label || formData.condition;
        const reason = formData.notes.trim() ? `Condition: ${conditionLabel}. Notes: ${formData.notes.trim()}` : `Condition: ${conditionLabel}`;
        const res = await fetch("http://localhost:5000/api/exchanges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.fullName.trim(),
            customerEmail: formData.email.trim(),
            productName,
            reason,
            requestedReplacement: null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSubmitted(true);
          setFormData({ fullName: "", email: "", brand: "", model: "", storage: "", condition: "", notes: "" });
        } else {
          setSubmitError(data.message || "Something went wrong. Please try again.");
        }
      } catch {
        setSubmitError("Failed to connect to server. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
    <PageLayout bare>
      <section className="relative aspect-[16/9] md:h-[280px] md:aspect-auto overflow-hidden">
        <img src={innerBanner} alt="Exchange Offer" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="exchangePattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#exchangePattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <Link to="/offers" className="hover:text-white/90">Offers</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Exchange</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Exchange Your Phone</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Give your current phone a new home. Get instant credit toward your next upgrade.</p>
        </div>
      </section>

      <section className="container-hop py-10 grid lg:grid-cols-2 gap-10">
        <div className="bg-card border border-border rounded-3xl p-8">
          <p className="text-xs uppercase tracking-widest text-primary">Instant Quote</p>
          <h2 className="mt-2 font-serif text-3xl">Tell us about your device</h2>

          {submitted ? (
            <div className="mt-8 p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in-up">
              <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-serif text-green-700">Exchange Request Submitted Successfully</h3>
              <p className="mt-2 text-green-600/80 max-w-md mx-auto">
                Your exchange request has been received. Our team will review the details and contact you regarding the next steps.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="animate-fade-in-up">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.fullName ? "border-red-500" : "border-border"}`}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div className="animate-fade-in-up animate-delay-100">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.email ? "border-red-500" : "border-border"}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="animate-fade-in-up animate-delay-200">
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Brand *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${!formData.brand && errors.brand ? "border-red-500" : "border-border"}`}
                >
                  <option value="">Select Brand</option>
                  {Object.keys(BRANDS).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
              </div>

              <div className="animate-fade-in-up animate-delay-300">
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Model *</label>
                <div className="relative">
                  <select
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    disabled={!formData.brand}
                    className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${!formData.brand ? "opacity-50 cursor-not-allowed text-muted-foreground" : "cursor-pointer"} ${errors.model ? "border-red-500" : "border-border"}`}
                  >
                    <option value="">{formData.brand ? "Select Model" : "Select Brand first"}</option>
                    {formData.brand && BRANDS[formData.brand]?.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className={`w-4 h-4 ${!formData.brand ? "text-muted-foreground/50" : "text-muted-foreground"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="animate-fade-in-up animate-delay-[400ms]">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Storage *</label>
                  <select
                    value={formData.storage}
                    onChange={(e) => handleChange("storage", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.storage ? "border-red-500" : "border-border"}`}
                  >
                    <option value="">Select Storage</option>
                    {STORAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.storage && <p className="mt-1 text-xs text-red-500">{errors.storage}</p>}
                </div>
                <div className="animate-fade-in-up animate-delay-[500ms]">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange("condition", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.condition ? "border-red-500" : "border-border"}`}
                  >
                    <option value="">Select Condition</option>
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition}</p>}
                </div>
              </div>

              <div className="animate-fade-in-up animate-delay-[600ms]">
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Additional Notes</label>
                <textarea
                  placeholder="Any scratches, damage, or other details about your device (optional)"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-fade-in-up">
                  <AlertCircle size={16} />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase transition-all ${
                  isSubmitting
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "hover:bg-primary hover:scale-[1.01]"
                }`}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Get My Quote"
                )}
              </button>
            </form>
          )}
        </div>
        <div>
          <RefreshCw size={32} className="text-primary" />
          <h2 className="mt-4 font-serif text-3xl">How it works</h2>
          <ol className="mt-6 space-y-4">
            {["Get an instant estimate online", "Confirm at checkout — new phone ships to you", "Hand over old phone at delivery — value adjusted"].map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center font-serif">{i + 1}</span>
                <p className="pt-1.5">{s}</p>
              </li>
            ))}
          </ol>
          <ul className="mt-8 space-y-2 text-sm">
            {["Certified device inspection", "Best-in-market exchange values", "No paperwork, no hassle"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check size={16} className="text-success" />{f}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageLayout>
  );
  },
});
