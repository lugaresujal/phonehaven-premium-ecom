import {
  GST_RATE,
  gstIncludedIn,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  EXPRESS_SHIPPING_FEE,
  findProductById,
  type Product,
} from "@/lib/mock-data";
import type { CartItem } from "@/lib/store/cart";


export { GST_RATE, gstIncludedIn };

export type DeliveryOption = {
  id: string;
  label: string;
  description: string;
  fee: number;
  days: string;
  sub: string;
};

export const deliveryOptions: DeliveryOption[] = [
  { id: "standard", label: "Standard Delivery", description: "Delivered in 5-7 business days", fee: 0, days: "5-7 days", sub: "Free" },
  { id: "express", label: "Express Delivery", description: "Delivered in 2-3 business days", fee: 99, days: "2-3 days", sub: "₹99" },
  { id: "overnight", label: "Overnight Delivery", description: "Next business day delivery", fee: 199, days: "1 day", sub: "₹199" },
];

export function getDeliveryOptions(subtotal: number, settings: Record<string, string>): DeliveryOption[] {
  const threshold = Number(settings.freeShippingThreshold) || FREE_SHIPPING_THRESHOLD;
  const stdFee = Number(settings.standardShippingFee) || STANDARD_SHIPPING_FEE;
  const expFee = Number(settings.expressShippingFee) || EXPRESS_SHIPPING_FEE;
  const isFree = subtotal >= threshold;
  const estDelivery = settings.estimatedDelivery || "3 - 7 Business Days";

  const options: DeliveryOption[] = [
    {
      id: "standard",
      label: "Standard Delivery",
      description: `Delivered in ${estDelivery}`,
      fee: isFree ? 0 : stdFee,
      days: estDelivery,
      sub: isFree ? "Free" : `₹${stdFee}`,
    },
    {
      id: "express",
      label: "Express Delivery",
      description: "Delivered in 1-3 business days",
      fee: expFee,
      days: "1-3 days",
      sub: `₹${expFee}`,
    },
  ];
  if (settings.storePickup === "true") {
    const pickupTiming = settings.pickupTiming || "10:00 AM – 9:00 PM";
    options.push({
      id: "pickup",
      label: "Store Pickup",
      description: `Pick up from store (${pickupTiming})`,
      fee: 0,
      days: "Same day",
      sub: "Free",
    });
  }
  return options;
}

export type PaymentOption = {
  id: string;
  label: string;
  icon: string;
  mode: "cod" | "online";
  description?: string;
};

export const paymentOptions: PaymentOption[] = [
  { id: "cod", label: "Cash on Delivery", icon: "Wallet", mode: "cod", description: "Pay when you receive" },
  { id: "upi", label: "UPI Payment", icon: "Smartphone", mode: "online", description: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: "CreditCard", mode: "online", description: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: "Building2", mode: "online", description: "All major banks" },
];

export function getPaymentOptions(settings: Record<string, string>): PaymentOption[] {
  if (settings.cashOnDelivery === "false") {
    return paymentOptions.filter((o) => o.id !== "cod");
  }
  return paymentOptions;
}

export type Totals = {
  subtotal: number;
  shipping: number;
  gstIncluded: number;
  total: number;
};

export function computeTotals(subtotal: number, shippingFee = 0): Totals {
  const shipping = shippingFee;
  const total = Math.max(0, subtotal + shipping);
  const gstIncluded = gstIncludedIn(total);
  return { subtotal, shipping, gstIncluded, total };
}

const BUY_NOW_KEY = "hop_buynow";

type BuyNowLine = {
  id: string;
  qty: number;
  color?: string;
  storage?: string;
};

export function setBuyNow(line: BuyNowLine) {
  try {
    sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(line));
  } catch {
    /* noop */
  }
}

export function readBuyNow(): (BuyNowLine & { product: Product }) | null {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    if (!raw) return null;
    const line = JSON.parse(raw) as BuyNowLine;
    const product = findProductById(line.id);
    if (!product) return null;
    return { ...line, product };
  } catch {
    return null;
  }
}

export function clearBuyNow() {
  try {
    sessionStorage.removeItem(BUY_NOW_KEY);
  } catch {
    /* noop */
  }
}

export function buyNowAsCartItems(): CartItem[] {
  const bn = readBuyNow();
  if (!bn) return [];
  return [
    {
      key: `buynow|${bn.id}`,
      id: bn.id,
      qty: bn.qty,
      color: bn.color,
      storage: bn.storage,
      product: bn.product,
    },
  ];
}
