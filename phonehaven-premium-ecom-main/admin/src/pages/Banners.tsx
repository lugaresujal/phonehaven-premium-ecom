import {
  CalendarDays,
  Image,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { bannersAPI } from "../services/cms-api";
import { ImageUploader } from "../components/common/ImageUploader";

const EF = {
  title: "",
  subtitle: "",
  position: "Homepage",
  image: "",
  buttonText: "",
  link: "",
  startDate: "",
  endDate: "",
  sortOrder: "0",
  status: "Active",
};

export function Banners() {
  const [banners, setBanners] = useState<any[]>([]);
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
      const res = await bannersAPI.getAll();
      setBanners((res as any).banners || []);
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

  const openEdit = (b: any) => {
    setEditItem(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      position: b.position || "Homepage",
      image: b.image || "",
      buttonText: b.buttonText || "",
      link: b.link || "",
      startDate: b.startDate ? b.startDate.slice(0, 10) : "",
      endDate: b.endDate ? b.endDate.slice(0, 10) : "",
      sortOrder: String(b.sortOrder ?? 0),
      status: b.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Banner title is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        position: form.position,
        image: form.image || undefined,
        buttonText: form.buttonText || undefined,
        link: form.link || undefined,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        sortOrder: Number(form.sortOrder || 0),
        status: form.status,
      };
      if (editItem) await bannersAPI.update(editItem.id, payload);
      else await bannersAPI.create(payload);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: any) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await bannersAPI.delete(b.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = banners.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = banners.filter((b) => b.status === "Active").length;
  const scheduledCount = banners.filter((b) => b.status === "Scheduled").length;

  return (
    <div className="banners-page">
      <div className="page-heading banners-heading">
        <div>
          <h1>Banners</h1>
          <p>Manage homepage banners and promotional content for House of Phones.</p>
        </div>
        <button type="button" className="primary-button" onClick={openAdd}>
          <Plus size={17} />
          Add Banner
        </button>
      </div>

      <div className="banners-stats">
        <div className="banner-stat-card">
          <div className="banner-stat-icon blue">
            <Image size={21} />
          </div>
          <div>
            <span>Total Banners</span>
            <strong>{banners.length}</strong>
          </div>
        </div>
        <div className="banner-stat-card">
          <div className="banner-stat-icon green">
            <Image size={21} />
          </div>
          <div>
            <span>Active Banners</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
        <div className="banner-stat-card">
          <div className="banner-stat-icon yellow">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Scheduled</span>
            <strong>{scheduledCount}</strong>
          </div>
        </div>
      </div>

      <div className="banners-toolbar">
        <div className="banners-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="banners-toolbar-right">
          <select
            className="banners-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Scheduled</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="banners-card">
        {loading ? (
          <div className="banners-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading banners...</p>
          </div>
        ) : error ? (
          <div className="banners-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="banners-table">
            <thead>
              <tr>
                <th>Banner Title</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((banner) => (
                <tr key={banner.id}>
                  <td className="banners-title">
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt=""
                        style={{
                          width: 60,
                          height: 38,
                          objectFit: "cover",
                          borderRadius: 4,
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {banner.title}
                  </td>
                  <td>{banner.position || "Homepage"}</td>
                  <td>
                    <span className={`banners-status ${banner.status.toLowerCase()}`}>
                      {banner.status}
                    </span>
                  </td>
                  <td className="banners-date">
                    {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="banners-actions">
                      <button className="banners-action-btn" title="Edit" onClick={() => openEdit(banner)}>
                        <Edit size={16} />
                      </button>
                      <button className="banners-action-btn" title="Delete" onClick={() => handleDelete(banner)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="banners-empty">
            <div className="banners-empty-icon">
              <Image size={28} />
            </div>
            <h2>No banners to display</h2>
            <p>Homepage banners created from the admin panel will appear here.</p>
            <div className="banners-empty-actions">
              <button type="button" className="primary-button" onClick={openAdd}>
                <Plus size={17} />
                Add Banner
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
              <h2>{editItem ? "Edit Banner" : "Add Banner"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Banner Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Next-Gen Smartphones"
                />
              </div>
              <div className="settings-form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Experience the future in the palm of your hand"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Location / Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  >
                    <option value="Homepage">Homepage Hero</option>
                    <option value="Category">Category Banner</option>
                    <option value="Footer">Promo Banner</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Scheduled</option>
                  </select>
                </div>
              </div>
              <ImageUploader
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                label="Banner Image"
                previewHeight={120}
              />
              <p style={{ fontSize: 11, color: "#888", margin: 0 }}>Recommended size: 1920 x 1080px for best quality</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Target Link</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="/shop"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Add Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
