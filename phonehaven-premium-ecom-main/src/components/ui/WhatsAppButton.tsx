import { MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/store/settings-store";

export function WhatsAppButton() {
  const { settings } = useSettings();
  const rawNum = (settings.whatsappNumber || "9637671118").replace(/\D/g, "");
  const phoneNumber = rawNum.startsWith("91") && rawNum.length === 12 ? rawNum : `91${rawNum}`;
  const storeName = settings.storeName || "House of Phones";
  const defaultMessage = encodeURIComponent(
    `Hi ${storeName}! I have an inquiry about a product.`
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366]/80 text-white px-3 py-2.5 rounded-full shadow-lg hover:scale-105 hover:bg-[#25D366] hover:opacity-100 transition-all duration-300 group"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="text-sm font-medium tracking-wide max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out">
        Chat on WhatsApp
      </span>
    </a>
  );
}
