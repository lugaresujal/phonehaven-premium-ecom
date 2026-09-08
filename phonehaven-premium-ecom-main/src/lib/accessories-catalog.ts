// Shared accessories catalog — single source of truth for Home, Shop, Accessories, Cart, Wishlist.
import { PageLayout } from "@/components/layout/PageLayout";
import { ProductCard } from "@/components/ProductCard";
import innerBanner from "@/assets/images/innerbanner.png";
import iphone16cover from "@/assets/images/iphone16-cover.png";
import iphone16cover1 from "@/assets/images/iphone16-cover1.png";
import iphone16promaxcover from "@/assets/images/iphone16promax-cover.png";
import iphone17cover from "@/assets/images/iphone17-cover.png";
import iphone17cover2 from "@/assets/images/iphone17-cover2.png";
import iphone17procover from "@/assets/images/iphone17pro-cover.png";
import iphone15screenguard from "@/assets/images/iphone15screenguard.png";
import iphone15promaxscreenguard from "@/assets/images/iphone15promaxscreenguard.png";
import iphone16screenguard from "@/assets/images/iphone16screenguard.png";
import iphone16promaxscreenguard from "@/assets/images/iphone16promaxscreenguard.png";
import iphone17screenguard from "@/assets/images/iphone17screenguard.png";
import iphone17promaxscreenguard from "@/assets/images/iphone17promaxscreenguard.png";
import xiaomipowerbank from "@/assets/images/xiaomi powerbank.png";
import ugreenpowerbank from "@/assets/images/ugreen powerbank.png";
import androidnormalpowerbank from "@/assets/images/androidnormalpowerbank.png";
import iphonepowerbank from "@/assets/images/iphone powerbank.png";
import androidandiphonefastchargercombo from "@/assets/images/androidandiphonefastchargercombo.png";
import androidfastcharger from "@/assets/images/androidfastcharger.png";
import iphonefastcharger from "@/assets/images/iphonefastcharger.png";
import wirelessearbuds from "@/assets/images/wirelessearbuds.png";
import wirelesserbuds1 from "@/assets/images/wirelessearbuds1.png";
import wirelesserbuds2 from "@/assets/images/wirelessearbuds2.png";
import wirelesserbuds3 from "@/assets/images/wirelessearbuds3.png";
import smartwaches1 from "@/assets/images/smartwatches1.png";
import smartwaches2 from "@/assets/images/smartwatches2.png";
import smartwaches3 from "@/assets/images/smartwatches3.png";
import smartwaches4 from "@/assets/images/smartwatches4.png";
import koreanbag from "@/assets/images/koreanbag.png";
import wirelesskeyboardandmouse from "@/assets/images/wirelessmouseandkeyboard.png";
import type { Product } from "./mock-data";

// ✅ CATEGORIES - EXACTLY MATCHING WITH SHOP BY CATEGORY SECTION
export const accessoryCategories = [
  "Power Banks",
  "Fast Chargers",
  "Wireless Earbuds",
  "iPhone Covers",
  "Screen Guards",
  "Smartwatches",
  "Korean Bags",
  "Wireless Keyboard & Mouse"
];

type RawAccessory = {
  id: string; slug: string; name: string; brand: string; category: string;
  image: string; price: number; mrp?: number; originalPrice?: number;
  rating: number; reviews: number; stock: number;
};

// Sample accessories data with imported images
const rawAccessories: RawAccessory[] = [
  // ✅ iPhone Covers - ALL UNDER ₹500
  {
    id: "acc-1",
    slug: "iphone-16-pro-max-silicone-case",
    name: "iPhone 16 Pro Max Silicone Case",
    brand: "Apple",
    category: "iPhone Covers",
    image: iphone16promaxcover,
    price: 399,
    mrp: 499,
    rating: 4.8,
    reviews: 120,
    stock: 50,
  },
  {
    id: "acc-2",
    slug: "iphone-16-silicone-case",
    name: "iPhone 16 Silicone Case",
    brand: "Apple",
    category: "iPhone Covers",
    image: iphone16cover,
    price: 349,
    mrp: 449,
    rating: 4.7,
    reviews: 120,
    stock: 45,
  },
  {
    id: "acc-3",
    slug: "iphone-16-clear-case",
    name: "iPhone 16 Clear Case",
    brand: "Spigen",
    category: "iPhone Covers",
    image: iphone16cover1,
    price: 279,
    mrp: 349,
    rating: 4.6,
    reviews: 120,
    stock: 60,
  },
  {
    id: "acc-4",
    slug: "iphone-17-pro-carbon-fiber-case",
    name: "iPhone 17 Pro Carbon Fiber Case",
    brand: "Pitaka",
    category: "iPhone Covers",
    image: iphone17procover,
    price: 449,
    mrp: 549,
    rating: 4.9,
    reviews: 120,
    stock: 25,
  },
  {
    id: "acc-5",
    slug: "iphone-17-silicone-case",
    name: "iPhone 17 Silicone Case",
    brand: "Apple",
    category: "iPhone Covers",
    image: iphone17cover,
    price: 379,
    mrp: 479,
    rating: 4.8,
    reviews: 120,
    stock: 40,
  },
  {
    id: "acc-6",
    slug: "iphone-17-clear-case",
    name: "iPhone 17 Clear Case",
    brand: "Spigen",
    category: "iPhone Covers",
    image: iphone17cover2,
    price: 299,
    mrp: 369,
    rating: 4.5,
    reviews: 120,
    stock: 55,
  },

  // Screen Guards
  {
    id: "acc-7",
    slug: "iphone-15-screen-guard",
    name: "iPhone 15 Screen Guard",
    brand: "Spigen",
    category: "Screen Guards",
    image: iphone15screenguard,
    price: 999,
    mrp: 1499,
    rating: 4.5,
    reviews: 120,
    stock: 100,
  },
  {
    id: "acc-8",
    slug: "iphone-15-pro-max-screen-guard",
    name: "iPhone 15 Pro Max Screen Guard",
    brand: "Belkin",
    category: "Screen Guards",
    image: iphone15promaxscreenguard,
    price: 1499,
    mrp: 1999,
    rating: 4.4,
    reviews: 120,
    stock: 80,
  },
  {
    id: "acc-9",
    slug: "iphone-16-screen-guard",
    name: "iPhone 16 Screen Guard",
    brand: "Spigen",
    category: "Screen Guards",
    image: iphone16screenguard,
    price: 1099,
    mrp: 1599,
    rating: 4.6,
    reviews: 120,
    stock: 90,
  },
  {
    id: "acc-10",
    slug: "iphone-16-pro-max-screen-guard",
    name: "iPhone 16 Pro Max Screen Guard",
    brand: "Belkin",
    category: "Screen Guards",
    image: iphone16promaxscreenguard,
    price: 1599,
    mrp: 2099,
    rating: 4.7,
    reviews: 120,
    stock: 75,
  },
  {
    id: "acc-11",
    slug: "iphone-17-screen-guard",
    name: "iPhone 17 Screen Guard",
    brand: "Spigen",
    category: "Screen Guards",
    image: iphone17screenguard,
    price: 1199,
    mrp: 1699,
    rating: 4.6,
    reviews: 120,
    stock: 85,
  },
  {
    id: "acc-12",
    slug: "iphone-17-pro-max-screen-guard",
    name: "iPhone 17 Pro Max Screen Guard",
    brand: "Belkin",
    category: "Screen Guards",
    image: iphone17promaxscreenguard,
    price: 1699,
    mrp: 2199,
    rating: 4.8,
    reviews: 120,
    stock: 70,
  },

  // Power Banks
  {
    id: "acc-13",
    slug: "xiaomi-20000mah-power-bank",
    name: "Xiaomi 20000mAh Power Bank",
    brand: "Xiaomi",
    category: "Power Banks",
    image: xiaomipowerbank,
    price: 3999,
    mrp: 4999,
    rating: 4.8,
    reviews: 120,
    stock: 40,
  },
  {
    id: "acc-14",
    slug: "ugreen-10000mah-power-bank",
    name: "UGREEN 10000mAh Power Bank",
    brand: "UGREEN",
    category: "Power Banks",
    image: ugreenpowerbank,
    price: 2999,
    mrp: 3499,
    rating: 4.6,
    reviews: 120,
    stock: 55,
  },
  {
    id: "acc-15",
    slug: "android-normal-power-bank",
    name: "Android Normal Power Bank",
    brand: "Samsung",
    category: "Power Banks",
    image: androidnormalpowerbank,
    price: 2499,
    originalPrice: 2999,
    rating: 4.7,
    reviews: 120,
    stock: 45,
  },
  {
    id: "acc-16",
    slug: "iphone-power-bank",
    name: "iPhone Power Bank",
    brand: "Apple",
    category: "Power Banks",
    image: iphonepowerbank,
    price: 1999,
    originalPrice: 2499,
    rating: 4.5,
    reviews: 120,
    stock: 70,
  },

  // Fast Chargers
  {
    id: "acc-17",
    slug: "android-iphone-fast-charger-combo",
    name: "Android & iPhone Fast Charger Combo",
    brand: "Anker",
    category: "Fast Chargers",
    image: androidandiphonefastchargercombo,
    price: 2999,
    originalPrice: 3999,
    rating: 4.7,
    reviews: 120,
    stock: 45,
  },
  {
    id: "acc-18",
    slug: "android-fast-charger",
    name: "Android Fast Charger",
    brand: "Samsung",
    category: "Fast Chargers",
    image: androidfastcharger,
    price: 399,
    originalPrice: 599,
    rating: 4.5,
    reviews: 120,
    stock: 70,
  },
  {
    id: "acc-19",
    slug: "iphone-fast-charger",
    name: "iPhone Fast Charger",
    brand: "Apple",
    category: "Fast Chargers",
    image: iphonefastcharger,
    price: 1999,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 120,
    stock: 60,
  },

  // Wireless Earbuds
  {
    id: "acc-20",
    slug: "pro-wireless-earbuds",
    name: "Pro Wireless Earbuds",
    brand: "Apple",
    category: "Wireless Earbuds",
    image: wirelessearbuds,
    price: 14999,
    originalPrice: 18999,
    rating: 4.9,
    reviews: 120,
    stock: 30,
  },
  {
    id: "acc-21",
    slug: "premium-wireless-earbuds",
    name: "Premium Wireless Earbuds",
    brand: "Samsung",
    category: "Wireless Earbuds",
    image: wirelesserbuds1,
    price: 9999,
    originalPrice: 12999,
    rating: 4.7,
    reviews: 120,
    stock: 40,
  },
  {
    id: "acc-22",
    slug: "sport-wireless-earbuds",
    name: "Sport Wireless Earbuds",
    brand: "Boat",
    category: "Wireless Earbuds",
    image: wirelesserbuds2,
    price: 3999,
    originalPrice: 4999,
    rating: 4.6,
    reviews: 120,
    stock: 50,
  },
  {
    id: "acc-23",
    slug: "budget-wireless-earbuds",
    name: "Budget Wireless Earbuds",
    brand: "Noise",
    category: "Wireless Earbuds",
    image: wirelesserbuds3,
    price: 1999,
    originalPrice: 2499,
    rating: 4.4,
    reviews: 120,
    stock: 65,
  },

  // Smartwatches
  {
    id: "acc-24",
    slug: "smart-watch-series-9",
    name: "Smart Watch Series 9",
    brand: "Apple",
    category: "Smartwatches",
    image: smartwaches1,
    price: 45999,
    originalPrice: 49999,
    rating: 4.9,
    reviews: 120,
    stock: 20,
  },
  {
    id: "acc-25",
    slug: "smart-watch-classic",
    name: "Smart Watch Classic",
    brand: "Samsung",
    category: "Smartwatches",
    image: smartwaches2,
    price: 29999,
    originalPrice: 34999,
    rating: 4.8,
    reviews: 120,
    stock: 25,
  },
  {
    id: "acc-26",
    slug: "fitness-smart-watch",
    name: "Fitness Smart Watch",
    brand: "Fitbit",
    category: "Smartwatches",
    image: smartwaches3,
    price: 4999,
    originalPrice: 5999,
    rating: 4.7,
    reviews: 120,
    stock: 30,
  },
  {
    id: "acc-27",
    slug: "budget-smart-watch",
    name: "Budget Smart Watch",
    brand: "Noise",
    category: "Smartwatches",
    image: smartwaches4,
    price: 4999,
    originalPrice: 5999,
    rating: 4.5,
    reviews: 120,
    stock: 40,
  },

  // Korean Bags
  {
    id: "acc-28",
    slug: "premium-korean-laptop-bag",
    name: "Premium Korean Laptop Bag",
    brand: "Sleek",
    category: "Korean Bags",
    image: koreanbag,
    price: 250,
    originalPrice: 499,
    rating: 4.6,
    reviews: 120,
    stock: 30,
  },

  // Wireless Keyboard & Mouse
  {
    id: "acc-29",
    slug: "wireless-keyboard-mouse-set",
    name: "Wireless Keyboard & Mouse Set",
    brand: "Apple",
    category: "Wireless Keyboard & Mouse",
    image: wirelesskeyboardandmouse,
    price: 14999,
    originalPrice: 17999,
    rating: 4.8,
    reviews: 120,
    stock: 20,
  }
];

/** Normalised accessory catalog (mrp/originalPrice unified, gallery + specs derived). */
export const catalogAccessories: Product[] = rawAccessories.map((a) => {
  const mrp = a.mrp ?? a.originalPrice ?? a.price;
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    brand: a.brand,
    category: a.category,
    price: a.price,
    mrp,
    image: a.image,
    images: [a.image],
    rating: a.rating,
    reviews: a.reviews,
    stock: a.stock,
    type: a.category,
    tags: ["accessory"],
    highlights: [
      `Genuine ${a.brand} quality`,
      `Designed for ${a.category.toLowerCase()}`,
      "1 Year warranty & easy returns",
    ],
  } satisfies Product;
});

/** Premium cover products surfaced by the Shop "Premium Covers" filter - genuine imported iPhone covers */
export const coverProducts: Product[] = catalogAccessories.filter(
  (a) => a.category === "iPhone Covers"
);