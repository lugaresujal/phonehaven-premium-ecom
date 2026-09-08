import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Wrench, Battery, Smartphone as SmartIcon, ShieldCheck, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import innerBanner from "@/assets/images/innerbanner.png";
import { useState } from "react";

export const Route = createFileRoute("/repair")({
  head: () => ({
    meta: [
      { title: "Repair Services — House of Phones" },
      { name: "description", content: "Screen replacement, battery swap, water damage recovery — by certified technicians." },
      { property: "og:url", content: "/repair" },
    ],
    links: [{ rel: "canonical", href: "/repair" }],
  }),
  component: () => {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      deviceModel: "",
      issue: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const services = [
      { t: "Screen Replacement", d: "OEM displays with 6-month warranty.", icon: SmartIcon },
      { t: "Battery Replacement", d: "Restore full-day battery life.", icon: Battery },
      { t: "Water Damage", d: "Micro-cleaning and diagnostic rescue.", icon: Wrench },
      { t: "Full Diagnostic", d: "60-point health check — free.", icon: ShieldCheck },
    ];

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.deviceModel.trim()) newErrors.deviceModel = "Device model is required";
      if (!formData.issue.trim()) newErrors.issue = "Please describe the issue";
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
        const res = await fetch("http://localhost:5000/api/repairs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.fullName.trim(),
            customerEmail: formData.email.trim(),
            customerPhone: formData.phone.trim(),
            deviceName: formData.deviceModel.trim(),
            issue: formData.issue.trim(),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSubmitted(true);
          setFormData({ fullName: "", email: "", phone: "", deviceModel: "", issue: "" });
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
          <img src={innerBanner} alt="Repair Services" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="repairPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)"><circle cx="30" cy="30" r="1" fill="#fff" /></pattern></defs>
              <rect width="100%" height="100%" fill="url(#repairPattern)" />
            </svg>
          </div>
          <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white px-4 sm:px-6 md:px-8">
            <nav className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 md:mb-3" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/90">Home</Link>
              <ChevronRight size={12} />
              <span className="text-white/90">Repair</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Repair Services</h1>
            <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-white/80 font-light leading-relaxed">Certified technicians. Genuine parts. Same-day service in Pune.</p>
          </div>
        </section>

        <section className="container-hop py-10 grid md:grid-cols-4 gap-5">
          {services.map((c, i) => (
            <div
              key={c.t}
              className={`group rounded-2xl bg-card border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in-up ${
                i === 1 ? "animate-delay-100" : i === 2 ? "animate-delay-200" : i === 3 ? "animate-delay-300" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:scale-110 transition-transform duration-300">
                <c.icon size={24} />
              </div>
              <p className="mt-4 font-medium">{c.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </section>

        <section className="container-hop pb-16">
          <div className="rounded-3xl bg-card border border-border p-10 animate-fade-in-up animate-delay-200">
            <h2 className="font-serif text-3xl">Book a Repair</h2>

            {submitted ? (
              <div className="mt-8 p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-serif text-green-700">Repair Request Submitted Successfully</h3>
                <p className="mt-2 text-green-600/80 max-w-md mx-auto">
                  Your repair request has been received. Our team will get in touch with you regarding the next steps.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className={`px-4 py-3 rounded-xl bg-background border text-sm w-full ${errors.fullName ? "border-red-500" : "border-border"}`}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`px-4 py-3 rounded-xl bg-background border text-sm w-full ${errors.phone ? "border-red-500" : "border-border"}`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`px-4 py-3 rounded-xl bg-background border text-sm w-full ${errors.email ? "border-red-500" : "border-border"}`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="Device Model"
                      value={formData.deviceModel}
                      onChange={(e) => handleChange("deviceModel", e.target.value)}
                      className={`px-4 py-3 rounded-xl bg-background border text-sm w-full ${errors.deviceModel ? "border-red-500" : "border-border"}`}
                    />
                    {errors.deviceModel && <p className="mt-1 text-xs text-red-500">{errors.deviceModel}</p>}
                  </div>
                  <div>
                    <input
                      placeholder="Issue (short description)"
                      value={formData.issue}
                      onChange={(e) => handleChange("issue", e.target.value)}
                      className={`px-4 py-3 rounded-xl bg-background border text-sm w-full ${errors.issue ? "border-red-500" : "border-border"}`}
                    />
                    {errors.issue && <p className="mt-1 text-xs text-red-500">{errors.issue}</p>}
                  </div>
                </div>

                {submitError && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={16} />
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`mt-6 px-8 py-3.5 rounded-full text-sm tracking-widest uppercase transition-colors ${
                    isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:bg-primary"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </PageLayout>
    );
  },
});
