import { HelpCircle, Plus, Search, SlidersHorizontal, Edit, Trash2, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { faqsAPI } from "../services/cms-api";

const EF = { question: "", answer: "", category: "General", sortOrder: "0", status: "Active" };

export function FAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await faqsAPI.getAll();
      setFaqs((res as any).faqs || []);
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

  const openEdit = (f: any) => {
    setEditItem(f);
    setForm({
      question: f.question || "",
      answer: f.answer || "",
      category: f.category || "General",
      sortOrder: String(f.sortOrder ?? 0),
      status: f.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Question and answer are both required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        sortOrder: Number(form.sortOrder || 0),
        status: form.status,
      };
      if (editItem) await faqsAPI.update(editItem.id, payload);
      else await faqsAPI.create(payload);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: any) => {
    if (!window.confirm(`Delete this FAQ?`)) return;
    try {
      await faqsAPI.delete(f.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleStatus = async (f: any) => {
    const nextStatus = f.status === "Active" ? "Inactive" : "Active";
    try {
      await faqsAPI.update(f.id, { status: nextStatus });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = faqs.filter((f) => {
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || f.status === statusFilter;
    const matchCategory = categoryFilter === "All Categories" || f.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const categoriesList = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));

  return (
    <div className="faqs-page">
      <div className="page-heading faqs-heading">
        <div>
          <h1>FAQs</h1>
          <p>Manage frequently asked questions and answers</p>
        </div>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={18} />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="faqs-stats">
        <div className="faq-stat-card">
          <div className="faq-stat-icon blue">
            <HelpCircle size={20} />
          </div>
          <div>
            <strong>{faqs.length}</strong>
            <span>Total FAQs</span>
          </div>
        </div>
        <div className="faq-stat-card">
          <div className="faq-stat-icon green">
            <HelpCircle size={20} />
          </div>
          <div>
            <strong>{faqs.filter((f) => f.status === "Active").length}</strong>
            <span>Published / Active</span>
          </div>
        </div>
        <div className="faq-stat-card">
          <div className="faq-stat-icon yellow">
            <HelpCircle size={20} />
          </div>
          <div>
            <strong>{faqs.filter((f) => f.status !== "Active").length}</strong>
            <span>Inactive / Drafts</span>
          </div>
        </div>
        <div className="faq-stat-card">
          <div className="faq-stat-icon purple">
            <HelpCircle size={20} />
          </div>
          <div>
            <strong>{categoriesList.length}</strong>
            <span>Categories</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="faqs-toolbar">
        <div className="faqs-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="faqs-toolbar-right">
          <select
            className="faqs-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            className="faqs-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All Categories</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="faqs-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="faqs-card">
        {loading ? (
          <div className="faqs-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading FAQs...</p>
          </div>
        ) : error ? (
          <div className="faqs-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="faqs-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((faq) => (
                <tr key={faq.id}>
                  <td className="faq-question">{faq.question}</td>
                  <td><span className="faq-category">{faq.category || "General"}</span></td>
                  <td>
                    <span className={`faq-status ${faq.status === "Active" ? "faq-status-published" : "faq-status-draft"}`}>
                      {faq.status}
                    </span>
                  </td>
                  <td className="faq-date">
                    {faq.createdAt ? new Date(faq.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="faq-actions">
                      <button className="faq-action-btn" title="Edit" onClick={() => openEdit(faq)}>
                        <Edit size={16} />
                      </button>
                      {faq.status === "Active" ? (
                        <button
                          className="faq-action-btn"
                          title="Deactivate"
                          onClick={() => toggleStatus(faq)}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className="faq-action-btn"
                          title="Activate"
                          onClick={() => toggleStatus(faq)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="faq-action-btn" title="Delete" onClick={() => handleDelete(faq)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="faqs-empty">
            <div className="faqs-empty-icon">
              <HelpCircle size={28} />
            </div>
            <h2>No FAQs added yet</h2>
            <p>Add frequently asked questions to help your customers find answers quickly.</p>
            <div className="faqs-empty-actions">
              <button className="primary-button" onClick={openAdd}>
                <Plus size={18} />
                Add FAQ
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
              <h2>{editItem ? "Edit FAQ" : "Add FAQ"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. How do I claim warranty on my device?"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="General, Shipping, Warranty"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="settings-form-group">
                <label>Answer *</label>
                <textarea
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Type the answer here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Add FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
