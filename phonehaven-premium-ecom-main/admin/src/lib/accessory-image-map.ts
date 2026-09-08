// Maps accessory product slugs to their correct local images from the main website.
// These are the exact same images used in src/lib/accessories-catalog.ts

import iphone16cover from "@main-assets/iphone16-cover.png";
import iphone16cover1 from "@main-assets/iphone16-cover1.png";
import iphone16promaxcover from "@main-assets/iphone16promax-cover.png";
import iphone17cover from "@main-assets/iphone17-cover.png";
import iphone17cover2 from "@main-assets/iphone17-cover2.png";
import iphone17procover from "@main-assets/iphone17pro-cover.png";
import iphone15screenguard from "@main-assets/iphone15screenguard.png";
import iphone15promaxscreenguard from "@main-assets/iphone15promaxscreenguard.png";
import iphone16screenguard from "@main-assets/iphone16screenguard.png";
import iphone16promaxscreenguard from "@main-assets/iphone16promaxscreenguard.png";
import iphone17screenguard from "@main-assets/iphone17screenguard.png";
import iphone17promaxscreenguard from "@main-assets/iphone17promaxscreenguard.png";
import xiaomipowerbank from "@main-assets/xiaomi powerbank.png";
import ugreenpowerbank from "@main-assets/ugreen powerbank.png";
import androidnormalpowerbank from "@main-assets/androidnormalpowerbank.png";
import iphonepowerbank from "@main-assets/iphone powerbank.png";
import androidandiphonefastchargercombo from "@main-assets/androidandiphonefastchargercombo.png";
import androidfastcharger from "@main-assets/androidfastcharger.png";
import iphonefastcharger from "@main-assets/iphonefastcharger.png";
import wirelessearbuds from "@main-assets/wirelessearbuds.png";
import wirelesserbuds1 from "@main-assets/wirelessearbuds1.png";
import wirelesserbuds2 from "@main-assets/wirelessearbuds2.png";
import wirelesserbuds3 from "@main-assets/wirelessearbuds3.png";
import smartwaches1 from "@main-assets/smartwatches1.png";
import smartwaches2 from "@main-assets/smartwatches2.png";
import smartwaches3 from "@main-assets/smartwatches3.png";
import smartwaches4 from "@main-assets/smartwatches4.png";
import koreanbag from "@main-assets/koreanbag.png";
import wirelesskeyboardandmouse from "@main-assets/wirelessmouseandkeyboard.png";

// Map: product slug -> correct local image
// These slugs match exactly what's defined in src/lib/accessories-catalog.ts
export const accessoryImageMap: Record<string, string> = {
  "iphone-16-pro-max-silicone-case": iphone16promaxcover,
  "iphone-16-silicone-case": iphone16cover,
  "iphone-16-clear-case": iphone16cover1,
  "iphone-17-pro-carbon-fiber-case": iphone17procover,
  "iphone-17-silicone-case": iphone17cover,
  "iphone-17-clear-case": iphone17cover2,
  "iphone-15-screen-guard": iphone15screenguard,
  "iphone-15-pro-max-screen-guard": iphone15promaxscreenguard,
  "iphone-16-screen-guard": iphone16screenguard,
  "iphone-16-pro-max-screen-guard": iphone16promaxscreenguard,
  "iphone-17-screen-guard": iphone17screenguard,
  "iphone-17-pro-max-screen-guard": iphone17promaxscreenguard,
  "xiaomi-20000mah-power-bank": xiaomipowerbank,
  "ugreen-10000mah-power-bank": ugreenpowerbank,
  "android-normal-power-bank": androidnormalpowerbank,
  "iphone-power-bank": iphonepowerbank,
  "android-iphone-fast-charger-combo": androidandiphonefastchargercombo,
  "android-fast-charger": androidfastcharger,
  "iphone-fast-charger": iphonefastcharger,
  "pro-wireless-earbuds": wirelessearbuds,
  "premium-wireless-earbuds": wirelesserbuds1,
  "sport-wireless-earbuds": wirelesserbuds2,
  "budget-wireless-earbuds": wirelesserbuds3,
  "smart-watch-series-9": smartwaches1,
  "smart-watch-classic": smartwaches2,
  "fitness-smart-watch": smartwaches3,
  "budget-smart-watch": smartwaches4,
  "premium-korean-laptop-bag": koreanbag,
  "wireless-keyboard-mouse-set": wirelesskeyboardandmouse,
  "iphone-16-pro-max-cover": iphone16promaxcover,
  "iphone-16-pro-128gb-cover": iphone16cover,
  "iphone-16-128gb-cover": iphone16cover1,
  "iphone-15-128gb-cover": iphone16cover,
  "premium-leather-cover": iphone16promaxcover,
  "carbon-fiber-cover": iphone17procover,
  "acc-magsafe-leather-case-iphone-16-pro": iphone16promaxcover,
  "acc-airpods-pro-2nd-gen-usb-c": wirelessearbuds,
  "acc-apple-watch-series-10-gps-42mm": smartwaches1,
  "acc-samsung-45w-super-fast-charger": androidfastcharger,
  "acc-galaxy-buds3-pro": wirelesserbuds1,
  "acc-anker-20-000mah-powercore": xiaomipowerbank,
  "acc-nothing-ear-2": wirelesserbuds2,
  "acc-jbl-flip-6-bluetooth-speaker": wirelesserbuds3,
  "acc-premium-tempered-glass-universal": iphone15screenguard,
  "acc-braided-usb-c-to-lightning-cable": iphonefastcharger,
  "acc-magsafe-wireless-car-charger": androidfastcharger,
  "acc-silicone-case-iphone-15": iphone16cover,
};

// Map: product name -> correct local image (for products that may not have matching slugs)
export const accessoryNameImageMap: Record<string, string> = {
  "iPhone 16 Pro Max Silicone Case": iphone16promaxcover,
  "iPhone 16 Silicone Case": iphone16cover,
  "iPhone 16 Clear Case": iphone16cover1,
  "iPhone 17 Pro Carbon Fiber Case": iphone17procover,
  "iPhone 17 Silicone Case": iphone17cover,
  "iPhone 17 Clear Case": iphone17cover2,
  "iPhone 15 Screen Guard": iphone15screenguard,
  "iPhone 15 Pro Max Screen Guard": iphone15promaxscreenguard,
  "iPhone 16 Screen Guard": iphone16screenguard,
  "iPhone 16 Pro Max Screen Guard": iphone16promaxscreenguard,
  "iPhone 17 Screen Guard": iphone17screenguard,
  "iPhone 17 Pro Max Screen Guard": iphone17promaxscreenguard,
  "Xiaomi 20000mAh Power Bank": xiaomipowerbank,
  "UGREEN 10000mAh Power Bank": ugreenpowerbank,
  "Android Normal Power Bank": androidnormalpowerbank,
  "iPhone Power Bank": iphonepowerbank,
  "Android & iPhone Fast Charger Combo": androidandiphonefastchargercombo,
  "Android Fast Charger": androidfastcharger,
  "iPhone Fast Charger": iphonefastcharger,
  "Pro Wireless Earbuds": wirelessearbuds,
  "Premium Wireless Earbuds": wirelesserbuds1,
  "Sport Wireless Earbuds": wirelesserbuds2,
  "Budget Wireless Earbuds": wirelesserbuds3,
  "Smart Watch Series 9": smartwaches1,
  "Smart Watch Classic": smartwaches2,
  "Fitness Smart Watch": smartwaches3,
  "Budget Smart Watch": smartwaches4,
  "Premium Korean Laptop Bag": koreanbag,
  "Wireless Keyboard & Mouse Set": wirelesskeyboardandmouse,
  "iPhone 16 Pro Max Cover": iphone16promaxcover,
  "iPhone 16 Pro 128GB Cover": iphone16cover,
  "iPhone 16 128GB Cover": iphone16cover1,
  "iPhone 15 128GB Cover": iphone16cover,
  "Premium Leather Cover": iphone16promaxcover,
  "Carbon Fiber Cover": iphone17procover,
  "MagSafe Leather Case — iPhone 16 Pro": iphone16promaxcover,
  "AirPods Pro (2nd Gen) USB-C": wirelessearbuds,
  "Apple Watch Series 10 GPS 42mm": smartwaches1,
  "Samsung 45W Super Fast Charger": androidfastcharger,
  "Galaxy Buds3 Pro": wirelesserbuds1,
  "Anker 20,000mAh PowerCore": xiaomipowerbank,
  "Nothing Ear (2)": wirelesserbuds2,
  "JBL Flip 6 Bluetooth Speaker": wirelesserbuds3,
  "Premium Tempered Glass — Universal": iphone15screenguard,
  "Braided USB-C to Lightning Cable": iphonefastcharger,
  "MagSafe Wireless Car Charger": androidfastcharger,
  "Silicone Case — iPhone 15": iphone16cover,
};

/**
 * Get the correct image for an accessory product.
 * Tries slug match first, then name match. Returns the original image if no match found.
 */
export function getAccessoryImage(product: { slug?: string; name: string; image?: string }): string {
  if (product.slug && accessoryImageMap[product.slug]) {
    return accessoryImageMap[product.slug];
  }
  if (accessoryNameImageMap[product.name]) {
    return accessoryNameImageMap[product.name];
  }
  return product.image || "";
}
