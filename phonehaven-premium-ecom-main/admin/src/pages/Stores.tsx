import { Store, Plus, Search, SlidersHorizontal, Edit, Trash2, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { storesAPI } from "../services/cms-api";

const EF = {
  name: "",
  address: "",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "",
  phone: "",
  email: "",
  openingHours: "10:00 AM",
  closingHours: "9:00 PM",
  mapLink: "",
  status: "Active",
};

export function Stores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await storesAPI.getAll();
      setStores((res as any).stores || []);
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

  const openEdit = (s: any) => {
    setEditItem(s);
    setForm({
      name: s.name || "",
      address: s.address || "",
      city: s.city || "",
      state: s.state || "",
      pincode: s.pincode || "",
      phone: s.phone || "",
      email: s.email || "",
      openingHours: s.openingHours || "10:00 AM",
      closingHours: s.closingHours || "9:00 PM",
      mapLink: s.mapLink || "",
      status: s.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setFormError("Name, address, city, state and pincode are required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editItem) await storesAPI.update(editItem.id, form);
      else await storesAPI.create(form);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!window.confirm(`Delete store "${s.name}"?`)) return;
    try {
      await storesAPI.delete(s.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleStatus = async (s: any) => {
    const nextStatus = s.status === "Active" ? "Inactive" : "Active";
    try {
      await storesAPI.update(s.id, { status: nextStatus });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
    const matchCity = cityFilter === "All Cities" || s.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const citiesList = Array.from(new Set(stores.map((s) => s.city).filter(Boolean)));

  return (
    <div className="stores-page">
      <div className="page-heading stores-heading">
        <div>
          <h1>Stores</h1>
          <p>Manage physical store locations and information</p>
        </div>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={18} />
          Add Store
        </button>
      </div>

      {/* Stats */}
      <div className="stores-stats">
        <div className="store-stat-card">
          <div className="store-stat-icon blue">
            <Store size={20} />
          </div>
          <div>
            <strong>{stores.length}</strong>
            <span>Total Stores</span>
          </div>
        </div>
        <div className="store-stat-card">
          <div className="store-stat-icon green">
            <Store size={20} />
          </div>
          <div>
            <strong>{stores.filter((s) => s.status === "Active").length}</strong>
            <span>Active</span>
          </div>
        </div>
        <div className="store-stat-card">
          <div className="store-stat-icon yellow">
            <Store size={20} />
          </div>
          <div>
            <strong>{stores.filter((s) => s.status === "Inactive").length}</strong>
            <span>Inactive</span>
          </div>
        </div>
        <div className="store-stat-card">
          <div className="store-stat-icon purple">
            <Store size={20} />
          </div>
          <div>
            <strong>{citiesList.length}</strong>
            <span>Cities</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="stores-toolbar">
        <div className="stores-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search stores by name, city or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="stores-toolbar-right">
          <select
            className="stores-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            className="stores-filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option>All Cities</option>
            {citiesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="stores-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="stores-card">
        {loading ? (
          <div className="stores-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading stores...</p>
          </div>
        ) : error ? (
          <div className="stores-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="stores-table">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((store) => (
                <tr key={store.id}>
                  <td className="store-name">{store.name}</td>
                  <td><span className="store-city">{store.city}</span></td>
                  <td className="store-address">{store.address}</td>
                  <td>{store.phone || "—"}</td>
                  <td>
                    <span className={`store-status ${store.status === "Active" ? "store-status-active" : "store-status-inactive"}`}>
                      {store.status}
                    </span>
                  </td>
                  <td>
                    <div className="store-actions">
                      <button className="store-action-btn" title="Edit" onClick={() => openEdit(store)}>
                        <Edit size={16} />
                      </button>
                      {store.status === "Active" ? (
                        <button
                          className="store-action-btn"
                          title="Deactivate"
                          onClick={() => toggleStatus(store)}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className="store-action-btn"
                          title="Activate"
                          onClick={() => toggleStatus(store)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="store-action-btn" title="Delete" onClick={() => handleDelete(store)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="stores-empty">
            <div className="stores-empty-icon">
              <Store size={28} />
            </div>
            <h2>No stores added yet</h2>
            <p>Add your physical store locations to display on your website.</p>
            <div className="stores-empty-actions">
              <button className="primary-button" onClick={openAdd}>
                <Plus size={18} />
                Add Store
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
              <h2>{editItem ? "Edit Store" : "Add Store"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bandra Flagship Store"
                />
              </div>
              <div className="settings-form-group">
                <label>Address *</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="123, Linking Road, Bandra West"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div className="settings-form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="settings-form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                    placeholder="400050"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="bandra@houseofphones.com"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Opening Hours</label>
                  <input
                    type="text"
                    value={form.openingHours}
                    onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))}
                    placeholder="10:00 AM"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Closing Hours</label>
                  <input
                    type="text"
                    value={form.closingHours}
                    onChange={(e) => setForm((f) => ({ ...f, closingHours: e.target.value }))}
                    placeholder="9:30 PM"
                  />
                </div>
              </div>
              <div className="settings-form-group">
                <label>Google Maps Link</label>
                <input
                  type="url"
                  value={form.mapLink}
                  onChange={(e) => setForm((f) => ({ ...f, mapLink: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Add Store"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
