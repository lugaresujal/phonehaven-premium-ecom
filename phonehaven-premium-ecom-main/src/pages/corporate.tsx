import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Briefcase, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import { useState } from "react";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Purchase — House of Phones" },
      { name: "description", content: "Bulk pricing, GST invoicing, dedicated account managers and rollout support." },
      { property: "og:url", content: "/corporate" },
    ],
    links: [{ rel: "canonical", href: "/corporate" }],
  }),
  component: () => {
    const [formData, setFormData] = useState({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      quantity: "",
      requirement: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.requirement.trim()) newErrors.requirement = "Please describe your requirement";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      if (submitError) setSubmitError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setIsSubmitting(true);
      setSubmitError("");
      try {
        const res = await fetch("http://localhost:5000/api/corporate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: formData.companyName.trim(),
            contactPerson: formData.contactPerson.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            requirement: formData.requirement.trim(),
            message: formData.quantity.trim() ? `Quantity: ${formData.quantity.trim()}` : null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSubmitted(true);
          setFormData({ companyName: "", contactPerson: "", email: "", phone: "", quantity: "", requirement: "" });
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
        <img src={innerBanner} alt="Corporate Purchase" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="corporatePattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#corporatePattern)" />
          </svg>
        </div>
        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white/90">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/90">Corporate</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Corporate Solutions</h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Equip your team with the world's best devices, on your terms.</p>
        </div>
      </section>

      <section className="container-hop py-10 grid lg:grid-cols-[1fr_1.2fr] gap-10">
        <div className="bg-card border border-border rounded-3xl p-8">
          <Briefcase size={28} className="text-primary" />
          <h2 className="mt-4 font-serif text-3xl">Request a Quote</h2>

          {submitted ? (
            <div className="mt-8 p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center animate-fade-in-up">
              <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-serif text-green-700">Enquiry Submitted Successfully</h3>
              <p className="mt-2 text-green-600/80 max-w-md mx-auto">
                Your corporate enquiry has been received. Our team will review the details and contact you regarding the next steps.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Company Name *" value={formData.companyName} onChange={(v) => handleChange("companyName", v)} error={errors.companyName} />
                <Input label="Contact Person *" value={formData.contactPerson} onChange={(v) => handleChange("contactPerson", v)} error={errors.contactPerson} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Business Email *" type="email" value={formData.email} onChange={(v) => handleChange("email", v)} error={errors.email} />
                <Input label="Phone *" type="tel" value={formData.phone} onChange={(v) => handleChange("phone", v)} error={errors.phone} />
              </div>
              <Input label="Quantity Required" type="number" value={formData.quantity} onChange={(v) => handleChange("quantity", v)} />
              <div>
                <textarea
                  placeholder="Devices / models required *"
                  value={formData.requirement}
                  onChange={(e) => handleChange("requirement", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-background border text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none ${errors.requirement ? "border-red-500" : "border-border"}`}
                />
                {errors.requirement && <p className="mt-1 text-xs text-red-500">{errors.requirement}</p>}
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
                className={`py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase transition-all ${
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
                  "Send Enquiry"
                )}
              </button>
            </form>
          )}
        </div>
        <div>
          <h2 className="font-serif text-3xl">Why brands choose us</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              ["Volume Pricing", "Aggressive tiered discounts starting from 10 units."],
              ["GST B2B Invoices", "Full input-tax credit compliant invoicing."],
              ["Dedicated Manager", "One point of contact through the rollout."],
              ["Same-day Dispatch", "PAN-India delivery from our Pune warehouse."],
              ["Custom Engraving", "Personalize corporate gifts and executive devices."],
              ["MDM Ready", "Pre-configured with Apple Business Manager or Samsung Knox."],
            ].map(([t, d]) => (
              <div key={t} className="p-6 rounded-2xl bg-white border-2 border-[#8A6A4A]/30 text-black hover:shadow-md transition-shadow">
                <p className="font-medium">{t}</p>
                <p className="text-sm text-black/70 mt-1.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
    );
  },
});

function Input({ label, value, onChange, type = "text", error }: { label: string; value: string; onChange: (v: string) => void; type?: string; error?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${error ? "border-red-500" : "border-border"}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
