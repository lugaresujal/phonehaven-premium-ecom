import { FolderTree, Plus, Search, Edit, Trash2, X, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { categoriesAPI } from "../services/cms-api";
import { ImageUploader } from "../components/common/ImageUploader";
const EF = { name: "", slug: "", description: "", image: "", icon: "", status: "Active", sortOrder: "0" };
export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
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
    setLoading(true); setError("");
    try { const r = await categoriesAPI.getAll(); setCategories((r as any).categories || []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const openAdd = () => { setEditItem(null); setForm(EF); setFormError(""); setShowModal(true); };
  const openEdit = (c: any) => { setEditItem(c); setForm({ name: c.name, slug: c.slug, description: c.description || "", image: c.image || "", icon: c.icon || "", status: c.status, sortOrder: String(c.sortOrder ?? 0) }); setFormError(""); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Category name is required"); return; }
    setSaving(true); setFormError("");
    try {
      const payload = { name: form.name, slug: form.slug || undefined, description: form.description || undefined, image: form.image || undefined, icon: form.icon || undefined, status: form.status, sortOrder: Number(form.sortOrder) };
      if (editItem) await categoriesAPI.update(editItem.id, payload); else await categoriesAPI.create(payload);
      setShowModal(false); load();
    } catch (e: any) { setFormError(e.message); } finally { setSaving(false); }
  };
  const handleDelete = async (c: any) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try { await categoriesAPI.delete(c.id); load(); } catch (e: any) { alert(e.message); }
  };
  return (
    <div className="categories-page">
      <div className="page-heading categories-heading">
        <div><h1>Categories</h1><p>Organize House of Phones products and accessories into categories.</p></div>
        <button type="button" className="primary-button" onClick={openAdd}><Plus size={17} /> Add Category</button>
      </div>
      <div className="categories-stats">
        <div className="category-stat-card"><div className="category-stat-icon blue"><FolderTree size={20} /></div><div><strong>{categories.length}</strong><span>Total Categories</span></div></div>
        <div className="category-stat-card"><div className="category-stat-icon green"><FolderTree size={20} /></div><div><strong>{categories.filter(c => c.status === "Active").length}</strong><span>Active</span></div></div>
        <div className="category-stat-card"><div className="category-stat-icon red"><FolderTree size={20} /></div><div><strong>{categories.filter(c => c.status === "Inactive").length}</strong><span>Inactive</span></div></div>
      </div>
      <div className="categories-toolbar">
        <div className="categories-search"><Search size={18} /><input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="categories-toolbar-right">
          <select className="categories-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All Status</option><option>Active</option><option>Inactive</option></select>
        </div>
      </div>
      <div className="categories-card">
        {loading ? (<div className="categories-empty"><Loader2 size={28} className="spin" /><p>Loading...</p></div>)
        : error ? (<div className="categories-empty"><p style={{ color: "red" }}>{error}</p><button className="primary-button" onClick={load}>Retry</button></div>)
        : filtered.length > 0 ? (
          <table className="categories-table"><thead><tr><th>Category Name</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(c => (
              <tr key={c.id}>
                <td className="categories-name">{c.name}</td>
                <td className="categories-slug">{c.slug}</td>
                <td>{c._count?.products ?? 0}</td>
                <td><span className={`categories-status ${c.status === "Active" ? "active" : "inactive"}`}>{c.status}</span></td>
                <td><div className="categories-actions">
                  <button className="categories-action-btn" title="Edit" onClick={() => openEdit(c)}><Edit size={16} /></button>
                  <button className="categories-action-btn" title="Delete" onClick={() => handleDelete(c)}><Trash2 size={16} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div className="categories-empty"><div className="categories-empty-icon"><FolderTree size={28} /></div><h2>No categories found</h2><p>Add your first category.</p>
            <div className="categories-empty-actions"><button className="primary-button" onClick={openAdd}><Plus size={17} /> Add Category</button></div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h2>{editItem ? "Edit Category" : "Add Category"}</h2><button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group"><label>Category Name *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Smartphones" /></div>
              <div className="settings-form-group"><label>Slug</label><input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="smartphones (auto if empty)" /></div>
              <div className="settings-form-group"><label>Icon (Lucide name)</label><input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Smartphone" /></div>
              <ImageUploader
                value={form.image}
                onChange={(url) => setForm(f => ({ ...f, image: url }))}
                label="Category Image"
                previewHeight={50}
              />
              <div className="settings-form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Category description..." rows={3} style={{ resize: "vertical" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group"><label>Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" /></div>
                <div className="settings-form-group"><label>Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option>Active</option><option>Inactive</option></select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={16} className="spin" /> : null}{editItem ? "Save Changes" : "Add Category"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
