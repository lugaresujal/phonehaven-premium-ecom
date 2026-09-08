import {
  CalendarDays,
  Percent,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { offersAPI } from "../services/cms-api";
import { ImageUploader } from "../components/common/ImageUploader";

// Hardcoded offers matching the main website's offers page exactly
const WEBSITE_OFFERS = [
  {
    id: 1,
    title: "Student Special: 10% Off",
    description: "Exclusive discount for students on all smartphones and accessories",
    badge: "Student ID Required",
    category: "Student",
    discountType: "Percentage",
    discountValue: 10,
    status: "Active",
  },
  {
    id: 2,
    title: "Student Exchange Bonus",
    description: "Extra ₹2,000 off when you exchange your old device",
    badge: "Limited Time",
    category: "Student",
    discountType: "Fixed",
    discountValue: 2000,
    status: "Active",
  },
  {
    id: 5,
    title: "Exchange Bonus Up to ₹10,000",
    description: "Get maximum value for your old device",
    badge: "Best Value",
    category: "Exchange",
    discountType: "Fixed",
    discountValue: 10000,
    status: "Active",
  },
  {
    id: 6,
    title: "Upgrade & Save",
    description: "Additional ₹5,000 off when you upgrade to latest models",
    badge: "Premium",
    category: "Exchange",
    discountType: "Fixed",
    discountValue: 5000,
    status: "Active",
  },
  {
    id: 7,
    title: "10% Cashback on EMI",
    description: "Get 10% instant cashback on all EMI purchases",
    badge: "All Banks",
    category: "Cashback",
    discountType: "Percentage",
    discountValue: 10,
    status: "Active",
  },
  {
    id: 8,
    title: "No Cost EMI",
    description: "Buy now, pay later with zero interest",
    badge: "3-24 Months",
    category: "Cashback",
    discountType: "Percentage",
    discountValue: 0,
    status: "Active",
  },
  {
    id: 9,
    title: "Accessories Combo Offer",
    description: "Buy any 2 accessories and get 20% off",
    badge: "Combo Deal",
    category: "Accessories",
    discountType: "Percentage",
    discountValue: 20,
    status: "Active",
  },
  {
    id: 10,
    title: "Free Case with Phone",
    description: "Get a premium case free with every smartphone purchase",
    badge: "Limited",
    category: "Accessories",
    discountType: "Fixed",
    discountValue: 0,
    status: "Active",
  },
];

const EF = { title: "", description: "", subtitle: "", badge: "", discountType: "Percentage", discountValue: "", couponCode: "", bannerImage: "", applicableTo: "all", startDate: "", endDate: "", status: "Active" };

export function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await offersAPI.getAll();
      const apiOffers = (res as any).offers || [];
      // Merge API offers with website offers, deduplicating by title
      const existingTitles = new Set(apiOffers.map((o: any) => o.title));
      const merged = [
        ...apiOffers,
        ...WEBSITE_OFFERS.filter((o) => !existingTitles.has(o.title)),
      ];
      setOffers(merged);
    } catch {
      // If API fails, fall back to website offers
      setOffers(WEBSITE_OFFERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditItem(null);
    setForm(EF);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (o: any) => {
    setEditItem(o);
    setForm({
      title: o.title || "",
      description: o.description || "",
      subtitle: o.description || o.subtitle || "",
      badge: o.badge || "",
      discountType: o.discountType || "Percentage",
      discountValue: o.discountValue ? String(o.discountValue) : "",
      couponCode: o.couponCode || "",
      bannerImage: o.bannerImage || "",
      applicableTo: o.applicableTo || "all",
      startDate: o.startDate ? o.startDate.slice(0, 10) : "",
      endDate: o.endDate ? o.endDate.slice(0, 10) : "",
      status: o.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Offer title is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || form.subtitle || undefined,
        subtitle: form.subtitle || undefined,
        badge: form.badge || undefined,
        discountType: form.discountType,
        discountValue: form.discountValue ? Number(form.discountValue) : undefined,
        couponCode: form.couponCode || undefined,
        bannerImage: form.bannerImage || undefined,
        applicableTo: form.applicableTo || "all",
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        status: form.status,
      };
      if (editItem) await offersAPI.update(editItem.id, payload);
      else await offersAPI.create(payload);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o: any) => {
    if (!window.confirm(`Delete offer "${o.title}"?`)) return;
    try {
      await offersAPI.delete(o.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleStatus = async (o: any) => {
    const nextStatus = o.status === "Active" ? "Inactive" : "Active";
    try {
      await offersAPI.update(o.id, { status: nextStatus });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Active: "offer-status-active",
      Scheduled: "offer-status-scheduled",
      Expired: "offer-status-expired",
      Inactive: "offer-status-inactive",
    };
    return styles[status] || "offer-status-active";
  };

  const filtered = offers.filter((o) => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.description && o.description.toLowerCase().includes(search.toLowerCase())) ||
      (o.couponCode && o.couponCode.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All Status" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="offers-page">
      <div className="page-heading offers-heading">
        <div>
          <h1>Offers</h1>
          <p>Manage promotional offers and discounts for House of Phones.</p>
        </div>
        <button type="button" className="primary-button" onClick={openAdd}>
          <Plus size={17} />
          Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="offers-stats">
        <div className="offer-stat-card">
          <div className="offer-stat-icon blue">
            <Percent size={21} />
          </div>
          <div>
            <span>Total Offers</span>
            <strong>{offers.length}</strong>
          </div>
        </div>
        <div className="offer-stat-card">
          <div className="offer-stat-icon green">
            <Percent size={21} />
          </div>
          <div>
            <span>Active Offers</span>
            <strong>{offers.filter((o) => o.status === "Active").length}</strong>
          </div>
        </div>
        <div className="offer-stat-card">
          <div className="offer-stat-icon purple">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Inactive / Expired</span>
            <strong>{offers.filter((o) => o.status !== "Active").length}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="offers-toolbar">
        <div className="offers-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="offers-toolbar-right">
          <select
            className="offers-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Scheduled</option>
            <option>Expired</option>
            <option>Inactive</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="offers-card">
        {loading ? (
          <div className="offers-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading offers...</p>
          </div>
        ) : error ? (
          <div className="offers-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="offers-table">
            <thead>
              <tr>
                <th>Offer Name</th>
                <th>Discount</th>
                <th>Category</th>
                <th>Status</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((offer) => (
                <tr key={offer.id}>
                  <td className="offer-name">
                    <div>
                      <strong>{offer.title}</strong>
                      {offer.description && (
                        <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>{offer.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="offer-discount">
                    {offer.discountValue
                      ? `${offer.discountValue}${offer.discountType === "Percentage" ? "%" : " flat"}`
                      : "—"}
                  </td>
                  <td className="offer-code">{(offer.applicableTo && offer.applicableTo !== "all" ? offer.applicableTo.charAt(0).toUpperCase() + offer.applicableTo.slice(1) : null) || offer.category || offer.couponCode || "—"}</td>
                  <td>
                    <span className={`offer-status ${getStatusClass(offer.status)}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="offer-expiry">
                    {offer.endDate ? new Date(offer.endDate).toLocaleDateString("en-IN") : "No expiry"}
                  </td>
                  <td>
                    <div className="offer-actions">
                      <button className="offer-action-btn" title="Edit" onClick={() => openEdit(offer)}>
                        <Edit size={16} />
                      </button>
                      {offer.status === "Active" ? (
                        <button
                          className="offer-action-btn"
                          title="Deactivate"
                          onClick={() => toggleStatus(offer)}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className="offer-action-btn"
                          title="Activate"
                          onClick={() => toggleStatus(offer)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="offer-action-btn" title="Delete" onClick={() => handleDelete(offer)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="offers-empty">
            <div className="offers-empty-icon">
              <Percent size={28} />
            </div>
            <h2>No offers to display</h2>
            <p>Promotional offers created from the admin panel will appear here.</p>
            <div className="offers-empty-actions">
              <button type="button" className="primary-button" onClick={openAdd}>
                <Plus size={17} />
                Create Offer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>{editItem ? "Edit Offer" : "Create Offer"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Offer Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Summer Mega Sale"
                />
              </div>
              <div className="settings-form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Get up to 30% off on flagship devices"
                />
              </div>
              <div className="settings-form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Full description shown on the website"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    placeholder="20"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Category</label>
                  <select
                    value={form.applicableTo}
                    onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value }))}
                  >
                    <option value="all">All</option>
                    <option value="student">Student</option>
                    <option value="exchange">Exchange</option>
                    <option value="cashback">Cashback</option>
                    <option value="emi">EMI</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Coupon Code (optional)</label>
                  <input
                    type="text"
                    value={form.couponCode}
                    onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value }))}
                    placeholder="SUMMER20"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Scheduled</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="settings-form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <ImageUploader
                value={form.bannerImage}
                onChange={(url) => setForm((f) => ({ ...f, bannerImage: url }))}
                label="Banner Image"
                previewHeight={60}
              />
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
