import {
  CalendarDays,
  Copy,
  Plus,
  Search,
  SlidersHorizontal,
  TicketPercent,
  Edit,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { couponsAPI } from "../services/cms-api";

const EF = {
  code: "",
  description: "",
  discountType: "Percentage",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  expiryDate: "",
  status: "Active",
};

export function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await couponsAPI.getAll();
      setCoupons((res as any).coupons || []);
    } catch (e: any) {
      setError(e.message);
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

  const openEdit = (c: any) => {
    setEditItem(c);
    setForm({
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "Percentage",
      discountValue: String(c.discountValue || ""),
      minOrderAmount: String(c.minOrderAmount || "0"),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : "",
      status: c.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      setFormError("Coupon code is required");
      return;
    }
    if (!form.discountValue) {
      setFormError("Discount value is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
        status: form.status,
      };
      if (editItem) await couponsAPI.update(editItem.id, payload);
      else await couponsAPI.create(payload);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: any) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      await couponsAPI.delete(c.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Active: "coupon-status-active",
      Expired: "coupon-status-expired",
      Used: "coupon-status-used",
    };
    return styles[status] || "coupon-status-active";
  };

  const filtered = coupons.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
    const matchType = typeFilter === "All Types" || c.discountType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const activeCount = coupons.filter((c) => c.status === "Active").length;
  const usedCount = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const expiringSoonCount = coupons.filter((c) => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    const now = new Date();
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  return (
    <div className="coupons-page">
      <div className="page-heading coupons-heading">
        <div>
          <h1>Coupons</h1>
          <p>Create and manage discount coupons for House of Phones customers.</p>
        </div>
        <button type="button" className="primary-button" onClick={openAdd}>
          <Plus size={17} />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="coupons-stats">
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon blue">
            <TicketPercent size={20} />
          </div>
          <div>
            <strong>{coupons.length}</strong>
            <span>Total Coupons</span>
          </div>
        </div>
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon green">
            <TicketPercent size={20} />
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Active Coupons</span>
          </div>
        </div>
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon purple">
            <Copy size={20} />
          </div>
          <div>
            <strong>{usedCount}</strong>
            <span>Times Redeemed</span>
          </div>
        </div>
        <div className="coupon-stat-card">
          <div className="coupon-stat-icon yellow">
            <CalendarDays size={20} />
          </div>
          <div>
            <strong>{expiringSoonCount}</strong>
            <span>Expiring Soon</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="coupons-toolbar">
        <div className="coupons-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="coupons-toolbar-right">
          <select
            className="coupons-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Inactive</option>
          </select>
          <select
            className="coupons-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Types</option>
            <option value="Percentage">Percentage</option>
            <option value="Fixed">Fixed</option>
          </select>
          <button className="coupons-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="coupons-card">
        {loading ? (
          <div className="coupons-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading coupons...</p>
          </div>
        ) : error ? (
          <div className="coupons-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Status</th>
                <th>Used</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="coupon-code">{coupon.code}</td>
                  <td>
                    <span className="coupon-type">{coupon.discountType}</span>
                  </td>
                  <td className="coupon-value">
                    {coupon.discountType === "Percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td>
                    <span className={`coupon-status ${getStatusClass(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td>{coupon.usedCount || 0}</td>
                  <td className="coupon-expiry">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td>
                    <div className="coupon-actions">
                      <button className="coupon-action-btn" title="Edit" onClick={() => openEdit(coupon)}>
                        <Edit size={16} />
                      </button>
                      <button className="coupon-action-btn" title="Delete" onClick={() => handleDelete(coupon)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="coupons-empty">
            <div className="coupons-empty-icon">
              <TicketPercent size={28} />
            </div>
            <h2>No coupons to display</h2>
            <p>Coupons created from the admin panel will appear here.</p>
            <div className="coupons-empty-actions">
              <button type="button" className="primary-button" onClick={openAdd}>
                <Plus size={17} />
                Create Coupon
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editItem ? "Edit Coupon" : "Create Coupon"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. WELCOME10"
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
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    placeholder="10"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Expired</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="settings-form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
