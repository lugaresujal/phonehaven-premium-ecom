import { FileText, Plus, Search, SlidersHorizontal, Edit, Trash2, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { blogAPI } from "../services/cms-api";
import { ImageUploader } from "../components/common/ImageUploader";

const EF = {
  title: "",
  slug: "",
  content: "",
  featuredImage: "",
  author: "House of Phones Team",
  status: "Draft",
  publishDate: "",
};

export function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
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
      const res = await blogAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setPosts((res as any).posts || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditItem(null);
    setForm(EF);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditItem(p);
    setForm({
      title: p.title || "",
      slug: p.slug || "",
      content: p.content || "",
      featuredImage: p.featuredImage || "",
      author: p.author || "House of Phones Team",
      status: p.status || "Draft",
      publishDate: p.publishDate ? p.publishDate.slice(0, 10) : "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Post title is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        content: form.content || undefined,
        featuredImage: form.featuredImage || undefined,
        author: form.author || undefined,
        status: form.status,
        publishDate: form.publishDate ? new Date(form.publishDate) : undefined,
      };
      if (editItem) await blogAPI.update(editItem.id, payload);
      else await blogAPI.create(payload);
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Delete blog post "${p.title}"?`)) return;
    try {
      await blogAPI.delete(p.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Published: "blog-status-published",
      Draft: "blog-status-draft",
      Scheduled: "blog-status-scheduled",
    };
    return styles[status] || "blog-status-draft";
  };

  const publishedCount = posts.filter((p) => p.status === "Published").length;
  const draftCount = posts.filter((p) => p.status === "Draft").length;

  return (
    <div className="blog-page">
      <div className="page-heading blog-heading">
        <div>
          <h1>Blog</h1>
          <p>Manage your blog posts and content</p>
        </div>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="blog-stats">
        <div className="blog-stat-card">
          <div className="blog-stat-icon blue">
            <FileText size={20} />
          </div>
          <div>
            <strong>{posts.length}</strong>
            <span>Total Posts</span>
          </div>
        </div>
        <div className="blog-stat-card">
          <div className="blog-stat-icon green">
            <FileText size={20} />
          </div>
          <div>
            <strong>{publishedCount}</strong>
            <span>Published</span>
          </div>
        </div>
        <div className="blog-stat-card">
          <div className="blog-stat-icon yellow">
            <FileText size={20} />
          </div>
          <div>
            <strong>{draftCount}</strong>
            <span>Drafts</span>
          </div>
        </div>
        <div className="blog-stat-card">
          <div className="blog-stat-icon purple">
            <FileText size={20} />
          </div>
          <div>
            <strong>{posts.filter((p) => p.status === "Scheduled").length}</strong>
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="blog-toolbar">
        <div className="blog-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="blog-toolbar-right">
          <select
            className="blog-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Scheduled</option>
          </select>
          <button className="blog-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="blog-card">
        {loading ? (
          <div className="blog-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="blog-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : posts.length > 0 ? (
          <table className="blog-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="blog-title">
                    {post.featuredImage && (
                      <img
                        src={post.featuredImage}
                        alt=""
                        style={{
                          width: 36,
                          height: 24,
                          objectFit: "cover",
                          borderRadius: 3,
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {post.title}
                  </td>
                  <td><span className="blog-category">{post.author || "Admin"}</span></td>
                  <td>
                    <span className={`blog-status-badge ${getStatusClass(post.status)}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="blog-date">
                    {post.publishDate
                      ? new Date(post.publishDate).toLocaleDateString("en-IN")
                      : new Date(post.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div className="blog-actions">
                      <button className="blog-action-btn" title="Edit" onClick={() => openEdit(post)}>
                        <Edit size={16} />
                      </button>
                      <button className="blog-action-btn" title="Delete" onClick={() => handleDelete(post)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="blog-empty">
            <div className="blog-empty-icon">
              <FileText size={28} />
            </div>
            <h2>No blog posts yet</h2>
            <p>Create your first blog post to share with your customers.</p>
            <div className="blog-empty-actions">
              <button className="primary-button" onClick={openAdd}>
                <Plus size={18} />
                Create Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>{editItem ? "Edit Post" : "Create Post"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Post Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. iPhone 16 Pro Max Full Review"
                />
              </div>
              <div className="settings-form-group">
                <label>Slug (URL key)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="iphone-16-pro-max-full-review (auto if empty)"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder="House of Phones Team"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </div>
              </div>
              <ImageUploader
                value={form.featuredImage}
                onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))}
                label="Featured Image"
                previewHeight={60}
              />
              <div className="settings-form-group">
                <label>Content (Markdown / Text)</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write post content here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
