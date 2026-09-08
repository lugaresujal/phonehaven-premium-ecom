import { Save, Globe, Mail, Truck, Shield, Eye, EyeOff, Loader2, Check, Building2, Clock, Store, CalendarDays, Share2, ExternalLink, Phone, MessageCircle, Headphones, AtSign, MapPin, ShoppingBag, KeyRound, Lock, Bell, Activity, ChevronRight, Smartphone } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { settingsAPI } from "../services/cms-api";

const DEFAULTS: Record<string, string> = {
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
};

function SecurityPasswordCard({ onPasswordChanged }: { onPasswordChanged?: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdate = async () => {
    if (!current || !newPass || !confirm) { setPwMsg("All fields are required."); return; }
    if (newPass.length < 6) { setPwMsg("New password must be at least 6 characters."); return; }
    if (newPass !== confirm) { setPwMsg("New passwords do not match."); return; }
    setPwLoading(true);
    setPwMsg("");
    try {
      const token = localStorage.getItem("adminToken") || "";
      const res = await fetch("/api/staff/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwMsg(data.message || "Failed to update password.");
      } else {
        setPwMsg("Password updated successfully.");
        setCurrent(""); setNewPass(""); setConfirm("");
        if (onPasswordChanged) onPasswordChanged();
      }
    } catch {
      setPwMsg("Failed to connect to server. Please try again.");
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(""), 4000);
    }
  };

  return (
    <div className="settings-form">
      <div className="settings-form-group">
        <label>Current Password</label>
        <div className="settings-pw-field">
          <input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Enter current password" />
          <button type="button" className="settings-pw-eye" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
      </div>
      <div className="settings-form-group">
        <label>New Password</label>
        <div className="settings-pw-field">
          <input type={showNew ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Enter new password" />
          <button type="button" className="settings-pw-eye" onClick={() => setShowNew(!showNew)}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
      </div>
      <div className="settings-form-group">
        <label>Confirm New Password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" />
      </div>
      {pwMsg && <p className={`settings-pw-msg ${pwMsg.includes("success") ? "ok" : "err"}`}>{pwMsg}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="primary-button" onClick={handleUpdate} disabled={pwLoading}>
          {pwLoading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />} {pwLoading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState("General");
  const [settings, setSettings] = useState<Record<string, string>>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get();
      if (res.settings && Object.keys(res.settings).length > 0) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await settingsAPI.save(settings);
      if (res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "General", icon: Globe, label: "General" },
    { id: "Contact", icon: Mail, label: "Contact & Email" },
    { id: "Store", icon: Truck, label: "Store & Shipping" },
    { id: "Security", icon: Shield, label: "Security" },
  ];

  return (
    <div className="settings-page">
      <div className="page-heading settings-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your store configuration, preferences and system settings.</p>
        </div>
        <div className="settings-header-actions">
          <button
            className="settings-preview-btn"
            title="Preview Store"
            onClick={() => window.open("http://localhost:5173", "_blank")}
          >
            <Eye size={17} />
            Preview Store
          </button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} className="spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="settings-card" style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={32} className="spin" />
        </div>
      ) : (
        <>
          {/* ============ GENERAL TAB ============ */}
          {activeTab === "General" && (
            <div className="settings-grid">
              <div className="settings-card settings-card-main">
                <div className="settings-section">
                  <h3>General Settings</h3>
                  <p>Configure your store details and basic information.</p>
                  <div className="settings-form">
                    <div className="settings-form-group">
                      <label>Store Name</label>
                      <input type="text" value={settings.storeName || ""} onChange={(e) => update("storeName", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label>Store Tagline</label>
                      <input type="text" value={settings.storeTagline || ""} onChange={(e) => update("storeTagline", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label>Store Address</label>
                      <textarea rows={3} value={settings.storeAddress || ""} onChange={(e) => update("storeAddress", e.target.value)} />
                    </div>
                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>City</label>
                        <input type="text" value={settings.city || ""} onChange={(e) => update("city", e.target.value)} />
                      </div>
                      <div className="settings-form-group">
                        <label>State</label>
                        <input type="text" value={settings.state || ""} onChange={(e) => update("state", e.target.value)} />
                      </div>
                    </div>
                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Pincode</label>
                        <input type="text" value={settings.pincode || ""} onChange={(e) => update("pincode", e.target.value)} />
                      </div>
                      <div className="settings-form-group">
                        <label>Country</label>
                        <input type="text" value={settings.country || ""} onChange={(e) => update("country", e.target.value)} />
                      </div>
                    </div>
                    <div className="settings-form-row">
                      <div className="settings-form-group">
                        <label>Currency</label>
                        <select value={settings.currency || "INR (₹)"} onChange={(e) => update("currency", e.target.value)}>
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                        </select>
                      </div>
                      <div className="settings-form-group">
                        <label>Timezone</label>
                        <select value={settings.timezone || "Asia/Kolkata (UTC +5:30)"} onChange={(e) => update("timezone", e.target.value)}>
                          <option>Asia/Kolkata (UTC +5:30)</option>
                          <option>Asia/Dubai (UTC +4:00)</option>
                          <option>America/New_York (UTC -5:00)</option>
                          <option>Europe/London (UTC +0:00)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card-side">
                <div className="settings-card settings-side-card settings-side-store">
                  <div className="settings-side-illustration">
                    <div className="settings-illust-shop">
                      <Store size={32} strokeWidth={1.2} />
                      <div className="settings-illust-awning" />
                    </div>
                  </div>
                  <div className="settings-side-header">
                    <Building2 size={18} />
                    <h4>Store Information</h4>
                  </div>
                  <div className="settings-side-body">
                    <div className="settings-info-row">
                      <span className="settings-info-label">Store Since</span>
                      <span className="settings-info-value">{settings.storeSince || "—"}</span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Business Type</span>
                      <span className="settings-info-value">{settings.businessType || "—"}</span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Store Status</span>
                      <span className="settings-info-value settings-status-active">{settings.storeStatus || "Active"}</span>
                    </div>
                  </div>
                </div>

                <div className="settings-card settings-side-card settings-side-hours">
                  <div className="settings-side-illustration">
                    <div className="settings-illust-calendar">
                      <CalendarDays size={28} strokeWidth={1.2} />
                      <div className="settings-illust-clock-overlay">
                        <Clock size={14} strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  <div className="settings-side-header">
                    <Clock size={18} />
                    <h4>Business Hours</h4>
                  </div>
                  <div className="settings-side-body">
                    <div className="settings-info-row">
                      <span className="settings-info-label">Mon – Sat</span>
                      <input type="text" className="settings-inline-input" value={settings.businessHoursWeekday || ""} onChange={(e) => update("businessHoursWeekday", e.target.value)} />
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Sunday</span>
                      <input type="text" className="settings-inline-input" value={settings.businessHoursSunday || ""} onChange={(e) => update("businessHoursSunday", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="settings-card settings-side-card settings-side-social">
                  <div className="settings-side-illustration">
                    <div className="settings-illust-network">
                      <Share2 size={26} strokeWidth={1.2} />
                      <div className="settings-illust-dot settings-illust-dot-1" />
                      <div className="settings-illust-dot settings-illust-dot-2" />
                      <div className="settings-illust-dot settings-illust-dot-3" />
                    </div>
                  </div>
                  <div className="settings-side-header">
                    <Globe size={18} />
                    <h4>Social Links</h4>
                  </div>
                  <div className="settings-side-body">
                    {[
                      { label: "Instagram", url: settings.instagramUrl, handle: "houseofphonesofficial", color: "#E1306C" },
                      { label: "Facebook", url: settings.facebookUrl, handle: "House of Phones", color: "#1877F2" },
                      { label: "YouTube", url: settings.youtubeUrl, handle: "@houseofphoneofficial", color: "#FF0000" },
                    ].map((s) => (
                      <div key={s.label} className="settings-social-row">
                        <div className="settings-social-left">
                          <div className="settings-social-badge" style={{ background: s.color }}>
                            {s.label.charAt(0)}
                          </div>
                          <div className="settings-social-text">
                            <span className="settings-social-name">{s.label}</span>
                            <span className="settings-social-handle">{s.handle}</span>
                          </div>
                        </div>
                        <a
                          href={s.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="settings-social-link"
                          title={`Open ${s.label}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ CONTACT & EMAIL TAB ============ */}
          {activeTab === "Contact" && (
            <div className="settings-grid-2col">
              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <Phone size={20} />
                    <div>
                      <h3>Store Contact Information</h3>
                      <p>Update your store contact details</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-form-group">
                      <label><Phone size={14} /> Phone Number</label>
                      <input type="text" value={settings.storePhone || ""} onChange={(e) => update("storePhone", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label><MessageCircle size={14} /> WhatsApp Number</label>
                      <input type="text" value={settings.whatsappNumber || ""} onChange={(e) => update("whatsappNumber", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label><Headphones size={14} /> Support Email</label>
                      <input type="email" value={settings.supportEmail || ""} onChange={(e) => update("supportEmail", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label><AtSign size={14} /> Alternate Email <span className="settings-label-optional">(Optional)</span></label>
                      <input type="email" value={settings.alternateEmail || ""} onChange={(e) => update("alternateEmail", e.target.value)} placeholder="alternate@example.com" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <Mail size={20} />
                    <div>
                      <h3>Email Settings</h3>
                      <p>Configure email preferences and notifications</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-form-group">
                      <label>Store Email</label>
                      <input type="email" value={settings.storeEmail || ""} onChange={(e) => update("storeEmail", e.target.value)} />
                    </div>
                    <div className="settings-divider" />
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Order Email Notifications</span>
                        <span className="settings-toggle-desc">Receive email for new orders</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.orderEmailNotifications === "true" ? "on" : ""}`} onClick={() => update("orderEmailNotifications", settings.orderEmailNotifications === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Enquiry Email Notifications</span>
                        <span className="settings-toggle-desc">Receive email for new enquiries</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.enquiryEmailNotifications === "true" ? "on" : ""}`} onClick={() => update("enquiryEmailNotifications", settings.enquiryEmailNotifications === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Newsletter Subscriptions</span>
                        <span className="settings-toggle-desc">Receive newsletter subscriptions</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.newsletterSubscriptions === "true" ? "on" : ""}`} onClick={() => update("newsletterSubscriptions", settings.newsletterSubscriptions === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ STORE & SHIPPING TAB ============ */}
          {activeTab === "Store" && (
            <div className="settings-grid-3col">
              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <Truck size={20} />
                    <div>
                      <h3>Shipping Settings</h3>
                      <p>Configure your shipping preferences</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-form-group">
                      <label>Default Shipping Charge</label>
                      <div className="settings-input-with-prefix"><span className="settings-input-prefix">₹</span><input type="number" value={settings.standardShippingFee || ""} onChange={(e) => update("standardShippingFee", e.target.value)} /></div>
                    </div>
                    <div className="settings-form-group">
                      <label>Free Shipping Above</label>
                      <div className="settings-input-with-prefix"><span className="settings-input-prefix">₹</span><input type="number" value={settings.freeShippingThreshold || ""} onChange={(e) => update("freeShippingThreshold", e.target.value)} /></div>
                    </div>
                    <div className="settings-form-group">
                      <label>Processing Time</label>
                      <select value={settings.processingTime || "1 - 2 Business Days"} onChange={(e) => update("processingTime", e.target.value)}>
                        <option>1 - 2 Business Days</option>
                        <option>2 - 3 Business Days</option>
                        <option>3 - 5 Business Days</option>
                      </select>
                    </div>
                    <div className="settings-form-group">
                      <label>Shipping Policy</label>
                      <select value={settings.shippingPolicy || "Standard Shipping"} onChange={(e) => update("shippingPolicy", e.target.value)}>
                        <option>Standard Shipping</option>
                        <option>Express Shipping</option>
                        <option>Same Day Delivery</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <MapPin size={20} />
                    <div>
                      <h3>Delivery Settings</h3>
                      <p>Manage your delivery preferences</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-form-group">
                      <label>Deliver To</label>
                      <select value={settings.deliverTo || "All Across India"} onChange={(e) => update("deliverTo", e.target.value)}>
                        <option>All Across India</option>
                        <option>Metro Cities Only</option>
                        <option>Selected States</option>
                      </select>
                    </div>
                    <div className="settings-form-group">
                      <label>Estimated Delivery Time</label>
                      <select value={settings.estimatedDelivery || "3 - 7 Business Days"} onChange={(e) => update("estimatedDelivery", e.target.value)}>
                        <option>1 - 3 Business Days</option>
                        <option>3 - 7 Business Days</option>
                        <option>5 - 10 Business Days</option>
                      </select>
                    </div>
                    <div className="settings-divider" />
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Cash on Delivery</span>
                        <span className="settings-toggle-desc">Enable COD for orders</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.cashOnDelivery === "true" ? "on" : ""}`} onClick={() => update("cashOnDelivery", settings.cashOnDelivery === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Order Tracking</span>
                        <span className="settings-toggle-desc">Enable order tracking</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.orderTracking === "true" ? "on" : ""}`} onClick={() => update("orderTracking", settings.orderTracking === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <ShoppingBag size={20} />
                    <div>
                      <h3>Store Pickup</h3>
                      <p>Configure store pickup options</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Store Pickup</span>
                        <span className="settings-toggle-desc">Enable store pickup</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.storePickup === "true" ? "on" : ""}`} onClick={() => update("storePickup", settings.storePickup === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-form-group">
                      <label>Store Address</label>
                      <textarea rows={3} value={settings.storeAddress || ""} onChange={(e) => update("storeAddress", e.target.value)} />
                    </div>
                    <div className="settings-form-group">
                      <label><Clock size={14} /> Pickup Timing</label>
                      <input type="text" value={settings.pickupTiming || ""} onChange={(e) => update("pickupTiming", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ SECURITY TAB ============ */}
          {activeTab === "Security" && (
            <div className="settings-grid-3col">
              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <KeyRound size={20} />
                    <div>
                      <h3>Password</h3>
                      <p>Change your account password</p>
                    </div>
                  </div>
                  <SecurityPasswordCard onPasswordChanged={load} />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <Shield size={20} />
                    <div>
                      <h3>Login Security</h3>
                      <p>Manage your login security</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Two-Factor Authentication</span>
                        <span className="settings-toggle-desc">Add extra security to your account</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.require2FA === "Enabled (Recommended)" ? "on" : ""}`} onClick={() => update("require2FA", settings.require2FA === "Enabled (Recommended)" ? "Disabled" : "Enabled (Recommended)")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Login Notifications</span>
                        <span className="settings-toggle-desc">Get notified about new logins</span>
                      </div>
                      <button type="button" className={`settings-toggle ${settings.loginNotifications === "true" ? "on" : ""}`} onClick={() => update("loginNotifications", settings.loginNotifications === "true" ? "false" : "true")}>
                        <span className="settings-toggle-knob" />
                      </button>
                    </div>
                    <div className="settings-divider" />
                    <div className="settings-nav-row">
                      <div className="settings-nav-left">
                        <Smartphone size={16} />
                        <div>
                          <span className="settings-toggle-label">Active Sessions</span>
                          <span className="settings-toggle-desc">{settings.activeSessions || "1"} device</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="settings-nav-arrow" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-section">
                  <div className="settings-section-header">
                    <Activity size={20} />
                    <div>
                      <h3>Account Activity</h3>
                      <p>Monitor your account activity</p>
                    </div>
                  </div>
                  <div className="settings-form">
                    <div className="settings-info-row">
                      <span className="settings-info-label">Last Login</span>
                      <span className="settings-info-value">Today, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Last Password Change</span>
                      <span className="settings-info-value">{settings.lastPasswordChange ? new Date(settings.lastPasswordChange).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Account Status</span>
                      <span className="settings-info-value settings-status-active">{settings.storeStatus || "Active"}</span>
                    </div>
                    <div className="settings-divider" />
                    <div className="settings-nav-row">
                      <div className="settings-nav-left">
                        <Bell size={16} />
                        <span className="settings-toggle-label">Login History</span>
                      </div>
                      <ChevronRight size={16} className="settings-nav-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
