import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE_URL = "http://localhost:5000/api";

export const DEFAULT_STORE_SETTINGS: Record<string, string> = {
  storeName: "House of Phones",
  storeTagline: "Premium Smartphones & Accessories",
  storeAddress: "Shop No. 8 & 9, Saraswati Mini Market, Bibwewadi, Pune – 411037",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411037",
  country: "India",
  storeEmail: "houseofphones92@gmail.com",
  supportEmail: "houseofphones92@gmail.com",
  alternateEmail: "",
  storePhone: "+91 9637671118",
  whatsappNumber: "+91 9637671118",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata (UTC +5:30)",
  freeShippingThreshold: "999",
  standardShippingFee: "49",
  expressShippingFee: "99",
  returnPolicyDays: "7",
  lowStockThreshold: "5",
  gstRate: "18",
  instagramUrl: "https://www.instagram.com/houseofphonesofficial",
  facebookUrl: "https://www.facebook.com/HouseOfPhones",
  youtubeUrl: "https://www.youtube.com/@houseofphoneofficial",
  twitterUrl: "",
  storeSince: "2024",
  businessType: "Retail Store",
  storeStatus: "Active",
  businessHoursWeekday: "10:00 AM – 9:00 PM",
  businessHoursSunday: "11:00 AM – 7:00 PM",
  sessionTimeout: "60",
  require2FA: "Disabled",
  orderEmailNotifications: "true",
  enquiryEmailNotifications: "true",
  newsletterSubscriptions: "false",
  processingTime: "1 - 2 Business Days",
  shippingPolicy: "Standard Shipping",
  deliverTo: "All Across India",
  estimatedDelivery: "3 - 7 Business Days",
  cashOnDelivery: "true",
  orderTracking: "true",
  storePickup: "false",
  pickupTiming: "10:00 AM – 9:00 PM",
  loginNotifications: "true",
  activeSessions: "1",
  lastPasswordChange: "",
  cancellationPolicy: "7 Days Easy Cancellation",
};

type SettingsContextType = {
  settings: Record<string, string>;
  loading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
  isFeatureEnabled: (key: string) => boolean;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: { ...DEFAULT_STORE_SETTINGS },
  loading: false,
  getSetting: (key, defaultValue = "") => DEFAULT_STORE_SETTINGS[key] ?? defaultValue,
  isFeatureEnabled: (key) => DEFAULT_STORE_SETTINGS[key] === "true",
  refreshSettings: async () => {},
});

let moduleCache: Record<string, string> = { ...DEFAULT_STORE_SETTINGS };

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({ ...moduleCache });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        const merged = { ...DEFAULT_STORE_SETTINGS, ...data.settings };
        moduleCache = merged;
        setSettings(merged);
      }
    } catch {
      // Keep cache / defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = useCallback(
    (key: string, defaultValue: string = ""): string => {
      return settings[key] ?? DEFAULT_STORE_SETTINGS[key] ?? defaultValue;
    },
    [settings]
  );

  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      const val = settings[key] ?? DEFAULT_STORE_SETTINGS[key];
      return val === "true";
    },
    [settings]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getSetting,
        isFeatureEnabled,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function getSyncedSettings(): Record<string, string> {
  return moduleCache;
}
