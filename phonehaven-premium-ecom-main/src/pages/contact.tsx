import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/store/settings-store";
import innerBanner from "@/assets/images/innerbanner.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — House of Phones" },
      {
        name: "description",
        content: "Get in touch — visit, call, WhatsApp or email us.",
      },
      {
        property: "og:url",
        content: "/contact",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),

  component: ContactPage,
});

function ContactPage() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [lastSubmission, setLastSubmission] = useState<{
    waUrl: string;
    gmailUrl: string;
  } | null>(null);

  const storeName = settings.storeName || "House of Phones";
  const storePhone = settings.storePhone || "+91 9637671118";
  const cleanPhone = storePhone.replace(/\s+/g, "");
  const whatsappNum = (settings.whatsappNumber || "9637671118").replace(/\D/g, "");
  const cleanWaNumber = whatsappNum.startsWith("91") && whatsappNum.length === 12 ? whatsappNum : `91${whatsappNum}`;
  const storeEmail = settings.supportEmail || settings.storeEmail || "houseofphones92@gmail.com";
  const storeAddress = settings.storeAddress || "Shop No. 8 & 9, Saraswati Mini Market, Bibwewadi, Pune – 411037";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) return;

    const waMessage = `Hi ${storeName},\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waMessage)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(storeEmail)}&su=${encodeURIComponent(subject || "Contact Form Inquiry")}&body=${encodeURIComponent(waMessage)}`;

    setLastSubmission({ waUrl, gmailUrl });

    // ✅ Synchronous trigger for WhatsApp
    const anchor = document.createElement("a");
    anchor.href = waUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // ✅ Synchronous trigger for Gmail Web Compose
    const gmailAnchor = document.createElement("a");
    gmailAnchor.href = gmailUrl;
    gmailAnchor.target = "_blank";
    gmailAnchor.rel = "noopener noreferrer";
    document.body.appendChild(gmailAnchor);
    gmailAnchor.click();
    document.body.removeChild(gmailAnchor);

    // ✅ Backend Nodemailer dispatch
    setLoading(true);
    setSuccess("");
    setError("");

    fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, subject, message }),
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type");
        let data: any = {};
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        }
        if (response.ok) {
          setSuccess("✅ Your message was sent via Email & opened in WhatsApp & Gmail!");
        } else {
          setSuccess("✅ Message opened on WhatsApp & Gmail! (Email note: " + (data.message || "Processing") + ")");
        }
      })
      .catch(() => {
        setSuccess("✅ Opened in WhatsApp & Gmail! (Ensure backend is running for automated email).");
      })
      .finally(() => {
        setLoading(false);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      });
  };

  return (
    <PageLayout>
      {/* Hero Banner */}
      <section className="relative h-[220px] md:h-[360px] overflow-hidden">
        <img
          src={innerBanner}
          alt="Contact Us"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container-hop relative z-10 flex h-full flex-col justify-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">
            Contact Us
          </p>

          <h1 className="mt-3 font-serif text-5xl md:text-6xl">
            Get in Touch
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/90">
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section - Changed order for mobile */}
      <section className="container-hop py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Form - First on mobile, second on desktop */}
          <div className="order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-3xl p-8 space-y-4"
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (optional)"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm"
              />

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm min-h-[140px]"
              />

              {/* ✅ Success Message - COMMENTED OUT (Remove nahi, sirf comment) */}
              {/* 
              {success && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-3 text-sm space-y-3">
                  <p className="font-medium">{success}</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href={lastSubmission?.waUrl || "https://wa.me/919637671118"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <MessageCircle size={14} /> Open in WhatsApp
                    </a>
                    <a
                      href={lastSubmission?.gmailUrl || "https://mail.google.com/mail/?view=cm&fs=1&to=houseofphones92@gmail.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Mail size={14} /> Open in Gmail
                    </a>
                  </div>
                </div>
              )}
              */}

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* Contact Details - Second on mobile, first on desktop */}
          <div className="order-2 lg:order-1 space-y-4">
            {[
              {
                icon: MapPin,
                t: "Address",
                d: storeAddress,
                href: `https://www.google.com/maps?q=${encodeURIComponent(storeAddress)}`,
                external: true,
              },
              {
                icon: Phone,
                t: "Phone",
                d: storePhone,
                href: `tel:${cleanPhone}`,
                external: false,
              },
              {
                icon: Mail,
                t: "Email",
                d: storeEmail,
                href: `mailto:${storeEmail}`,
                external: true,
              },
              {
                icon: MessageCircle,
                t: "WhatsApp",
                d: `Click to chat on ${storePhone}`,
                href: `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hi ${storeName}, I have an inquiry.`)}`,
                external: true,
              },
            ].map((c) => (
              <a
                key={c.t}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="flex gap-4 bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <c.icon size={18} />
                </div>

                <div>
                  <p className="font-medium flex items-center gap-2">
                    {c.t}
                    {c.t === "WhatsApp" && (
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-normal">
                        Click to Redirect
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {c.d}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="container-hop pb-16">
        <div
          id="map"
          className="rounded-3xl overflow-hidden bg-card border border-border shadow-sm"
        >
          <div className="relative w-full h-[350px] md:h-[450px]">
            <iframe
              title="House of Phones Store Location"
              src="https://www.google.com/maps?q=Shop+No.+8+%26+9,+Saraswati+Mini+Market,+Bibwewadi,+Pune+411037&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}