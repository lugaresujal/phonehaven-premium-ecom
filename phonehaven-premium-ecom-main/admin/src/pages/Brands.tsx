import { Tag, Plus, Search, Edit, Trash2, X, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { brandsAPI } from "../services/cms-api";
import { ImageUploader } from "../components/common/ImageUploader";

import appleLogo from "@main-assets/apple.png";
import samsungLogo from "@main-assets/samsung.png";
import oneplusLogo from "@main-assets/oneplus.png";
import googleLogo from "@main-assets/google.png";
import xiaomiLogo from "@main-assets/xiaomi.png";
import oppoLogo from "@main-assets/oppo.png";
import vivoLogo from "@main-assets/vivo.png";
import realmeLogo from "@main-assets/realme.png";
import motorolaLogo from "@main-assets/motorola.png";
import nothingLogo from "@main-assets/nothing.png";
import honorLogo from "@main-assets/honor.png";
import nokiaLogo from "@main-assets/nokia.png";

const brandLogos: Record<string, string> = {
  "apple": appleLogo,
  "samsung": samsungLogo,
  "oneplus": oneplusLogo,
  "google": googleLogo,
  "xiaomi": xiaomiLogo,
  "oppo": oppoLogo,
  "vivo": vivoLogo,
  "realme": realmeLogo,
  "motorola": motorolaLogo,
  "nothing": nothingLogo,
  "honor": honorLogo,
  "nokia": nokiaLogo,
};
const EF = { name: "", slug: "", tagline: "", logo: "", description: "", status: "Active" };
export function Brands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await brandsAPI.getAll(); setBrands((r as any).brands || []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setEditItem(null); setForm(EF); setFormError(""); setShowModal(true); };
  const openEdit = (b: any) => { setEditItem(b); setForm({ name: b.name, slug: b.slug, tagline: b.tagline || "", logo: b.logo || "", description: b.description || "", status: b.status }); setFormError(""); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Brand name is required"); return; }
    setSaving(true); setFormError("");
    try {
      const payload = { name: form.name, slug: form.slug || undefined, tagline: form.tagline || undefined, logo: form.logo || undefined, description: form.description || undefined, status: form.status };
      if (editItem) await brandsAPI.update(editItem.id, payload); else await brandsAPI.create(payload);
      setShowModal(false); load();
    } catch (e: any) { setFormError(e.message); } finally { setSaving(false); }
  };
  const handleDelete = async (b: any) => {
    if (!window.confirm(`Delete brand "${b.name}"?`)) return;
    try { await brandsAPI.delete(b.id); load(); } catch (e: any) { alert(e.message); }
  };
  return (
    <div className="brands-page">
      <div className="page-heading brands-heading">
        <div><h1>Brands</h1><p>Manage phone and accessory brands.</p></div>
        <button type="button" className="primary-button" onClick={openAdd}><Plus size={17} /> Add Brand</button>
      </div>
      <div className="brands-stats">
        <div className="brand-stat-card"><div className="brand-stat-icon blue"><Tag size={20} /></div><div><strong>{brands.length}</strong><span>Total Brands</span></div></div>
        <div className="brand-stat-card"><div className="brand-stat-icon green"><Tag size={20} /></div><div><strong>{brands.filter(b => b.status === "Active").length}</strong><span>Active</span></div></div>
        <div className="brand-stat-card"><div className="brand-stat-icon red"><Tag size={20} /></div><div><strong>{brands.filter(b => b.status === "Inactive").length}</strong><span>Inactive</span></div></div>
      </div>
      <div className="brands-toolbar">
        <div className="brands-search"><Search size={18} /><input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className="brands-card">
        {loading ? (<div className="brands-empty"><Loader2 size={28} className="spin" /><p>Loading...</p></div>)
        : error ? (<div className="brands-empty"><p style={{ color: "red" }}>{error}</p><button className="primary-button" onClick={load}>Retry</button></div>)
        : filtered.length > 0 ? (
          <table className="brands-table"><thead><tr><th>Brand Name</th><th>Slug</th><th>Tagline</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(b => (
              <tr key={b.id}>
                <td className="brands-name">{(() => { const logoSrc = b.logo || brandLogos[b.name?.toLowerCase()] || ""; return logoSrc ? <img src={logoSrc} alt="" style={{ width: 28, height: 28, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} /> : null; })()}{b.name}</td>
                <td className="brands-slug">{b.slug}</td>
                <td>{b.tagline || "—"}</td>
                <td><span className={`brands-status ${b.status === "Active" ? "active" : "inactive"}`}>{b.status}</span></td>
                <td><div className="brands-actions">
                  <button className="brands-action-btn" title="Edit" onClick={() => openEdit(b)}><Edit size={16} /></button>
                  <button className="brands-action-btn" title="Delete" onClick={() => handleDelete(b)}><Trash2 size={16} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div className="brands-empty"><div className="brands-empty-icon"><Tag size={28} /></div><h2>No brands found</h2><p>Add your first brand.</p>
            <div className="brands-empty-actions"><button className="primary-button" onClick={openAdd}><Plus size={17} /> Add Brand</button></div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h2>{editItem ? "Edit Brand" : "Add Brand"}</h2><button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group"><label>Brand Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Apple" /></div>
              <div className="settings-form-group"><label>Slug</label><input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="apple (auto-generated if empty)" /></div>
              <div className="settings-form-group"><label>Tagline</label><input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Think Different" /></div>
              <ImageUploader
                value={form.logo}
                onChange={(url) => setForm(f => ({ ...f, logo: url }))}
                label="Brand Logo"
                previewHeight={50}
              />
              <div className="settings-form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brand description..." rows={3} style={{ resize: "vertical" }} /></div>
              <div className="settings-form-group"><label>Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={16} className="spin" /> : null}{editItem ? "Save Changes" : "Add Brand"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
