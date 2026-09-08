import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { useSettings } from "@/lib/store/settings-store";

const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "Shop", to: "/shop" },
      { label: "Brands", to: "/brands" },
      { label: "Accessories", to: "/accessories" },
      { label: "Offers", to: "/offers" },
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Track Order", to: "/track-order" },
      { label: "Shipping Policy", to: "/shipping-policy" },
      { label: "Returns & Refunds", to: "/refund-policy" },
      { label: "Warranty Policy", to: "/warranty-policy" },
      { label: "Repair Services", to: "/repair" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Exchange Offer", to: "/exchange" },
      { label: "Student Offer", to: "/student-offer" },
      { label: "Corporate Purchase", to: "/corporate" },
      { label: "Blog", to: "/blog" },
    ],
  },
];

export function Footer() {
  const { settings } = useSettings();

  const storeName = settings.storeName || "House of Phones";
  const storeTagline = settings.storeTagline || "Your trusted destination for premium smartphones and accessories, curated for the discerning connoisseur.";
  const storePhone = settings.storePhone || "+91 9637671118";
  const cleanPhone = storePhone.replace(/\s+/g, "");
  const whatsappNum = (settings.whatsappNumber || "9637671118").replace(/\D/g, "");
  const cleanWaNumber = whatsappNum.startsWith("91") && whatsappNum.length === 12 ? whatsappNum : `91${whatsappNum}`;
  const storeEmail = settings.supportEmail || settings.storeEmail || "houseofphones92@gmail.com";
  const storeAddress = settings.storeAddress || "Shop No. 8 & 9, Saraswati Mini Market, Bibwewadi, Pune – 411037";
  const city = settings.city || "Pune";
  const state = settings.state || "Maharashtra";
  const country = settings.country || "India";
  const pincode = settings.pincode || "411037";

  const instagramUrl = settings.instagramUrl || "https://www.instagram.com/houseofphonesofficial";
  const facebookUrl = settings.facebookUrl || "https://www.facebook.com/HouseOfPhones";
  const youtubeUrl = settings.youtubeUrl || "https://www.youtube.com/@houseofphoneofficial";

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="container-hop py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl md:text-3xl text-brand-light">Stay in the loop</p>
            <p className="text-sm text-background/70 mt-1">Be the first to hear about flagship launches, exclusive drops &amp; offers.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing!");
            }}
            className="flex w-full md:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="px-4 py-2.5 rounded-full bg-background/10 border border-background/20 text-background placeholder:text-background/50 text-sm focus:outline-none focus:border-brand-light flex-1 min-w-0"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-brand-light text-foreground text-xs uppercase tracking-widest font-semibold hover:bg-brand-light/90 transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="container-hop py-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <div className="md:-ml-12 -ml-4">
            <Logo />
          </div>
          <p className="mt-5 text-sm text-background/70 leading-relaxed max-w-xs">
            {storeTagline}
          </p>
          <div className="mt-6 flex gap-3">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook" className="w-9 h-9 grid place-items-center rounded-full border border-background/20 hover:border-brand-light hover:text-brand-light transition-colors">
              <Facebook size={15} />
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram" className="w-9 h-9 grid place-items-center rounded-full border border-background/20 hover:border-brand-light hover:text-brand-light transition-colors">
              <Instagram size={15} />
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube" className="w-9 h-9 grid place-items-center rounded-full border border-background/20 hover:border-brand-light hover:text-brand-light transition-colors">
              <Youtube size={15} />
            </a>
            <a href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hi ${storeName}, I have an inquiry.`)}`} target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp" className="w-9 h-9 grid place-items-center rounded-full border border-background/20 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white transition-colors">
              <MessageCircle size={15} />
            </a>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-[13px] uppercase tracking-[0.22em] text-brand-light mb-4">{c.title}</p>
            <ul className="space-y-2.5 text-sm text-background/75">
              {c.links.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-brand-light transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-[13px] uppercase tracking-[0.22em] text-brand-light mb-4">Store Location</p>
          <address className="not-italic text-sm text-background/75 leading-relaxed space-y-2.5">
            <div className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-light" />
              <a href={`https://www.google.com/maps?q=${encodeURIComponent(storeAddress)}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-light transition-colors">
                {storeAddress}<br />
                {city} – {pincode}, {state}, {country}
              </a>
            </div>
            <div className="flex gap-2">
              <Phone size={16} className="mt-0.5 shrink-0 text-brand-light" />
              <a href={`tel:${cleanPhone}`} className="hover:text-brand-light">{storePhone}</a>
            </div>
            <div className="flex gap-2">
              <Mail size={16} className="mt-0.5 shrink-0 text-brand-light" />
              <a href={`mailto:${storeEmail}`} className="hover:text-brand-light">{storeEmail}</a>
            </div>
            <div className="flex gap-2">
              <MessageCircle size={16} className="mt-0.5 shrink-0 text-green-400" />
              <a href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hi ${storeName}`)}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">WhatsApp Us</a>
            </div>
          </address>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-hop py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/60">
          <p>© {new Date().getFullYear()} {storeName}. All Rights Reserved.</p>
          <p>Crafted with care in {city}, {country}.</p>
        </div>
      </div>
    </footer>
  );
}
