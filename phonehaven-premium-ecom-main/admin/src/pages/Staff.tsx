import { UserCog, Plus, Search, SlidersHorizontal, Edit, Trash2, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { staffAPI } from "../services/cms-api";

const EF = { name: "", email: "", phone: "", role: "Staff", password: "", status: "Active" };

export function Staff() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState(EF);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await staffAPI.getAll();
      setStaffList((res as any).staff || []);
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
      email: s.email || "",
      phone: s.phone || "",
      role: s.role || "Staff",
      password: "",
      status: s.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required");
      return;
    }
    if (!editItem && !form.password) {
      setFormError("Password is required for new staff");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      if (editItem) await staffAPI.update(editItem.id, payload);
      else await staffAPI.create(payload);

      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: any) => {
    if (!window.confirm(`Delete staff member "${s.name}"?`)) return;
    try {
      await staffAPI.delete(s.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const toggleStatus = async (s: any) => {
    const nextStatus = s.status === "Active" ? "Inactive" : "Active";
    try {
      await staffAPI.update(s.id, { status: nextStatus });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Active: "staff-status-active",
      Pending: "staff-status-pending",
      Inactive: "staff-status-inactive",
    };
    return styles[status] || "staff-status-active";
  };

  const filtered = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
    const matchRole = roleFilter === "All Roles" || s.role === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const activeCount = staffList.filter((s) => s.status === "Active").length;
  const rolesCount = new Set(staffList.map((s) => s.role)).size;

  return (
    <div className="staff-page">
      <div className="page-heading staff-heading">
        <div>
          <h1>Staff</h1>
          <p>Manage admin staff, roles, and permissions</p>
        </div>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="staff-stats">
        <div className="staff-stat-card">
          <div className="staff-stat-icon blue">
            <UserCog size={20} />
          </div>
          <div>
            <strong>{staffList.length}</strong>
            <span>Total Staff</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon green">
            <UserCog size={20} />
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Active</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon yellow">
            <UserCog size={20} />
          </div>
          <div>
            <strong>{staffList.filter((s) => s.status !== "Active").length}</strong>
            <span>Inactive / Pending</span>
          </div>
        </div>
        <div className="staff-stat-card">
          <div className="staff-stat-icon purple">
            <UserCog size={20} />
          </div>
          <div>
            <strong>{rolesCount}</strong>
            <span>Unique Roles</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="staff-toolbar">
        <div className="staff-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search staff members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="staff-toolbar-right">
          <select
            className="staff-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            className="staff-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All Roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Staff</option>
            <option>Support</option>
          </select>
          <button className="staff-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="staff-card">
        {loading ? (
          <div className="staff-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading staff...</p>
          </div>
        ) : error ? (
          <div className="staff-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td className="staff-name">{member.name}</td>
                  <td>{member.email}</td>
                  <td><span className="staff-role">{member.role}</span></td>
                  <td>
                    <span className={`staff-status ${getStatusClass(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="staff-joined">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="staff-actions">
                      <button className="staff-action-btn" title="Edit" onClick={() => openEdit(member)}>
                        <Edit size={16} />
                      </button>
                      {member.status === "Active" ? (
                        <button
                          className="staff-action-btn"
                          title="Deactivate"
                          onClick={() => toggleStatus(member)}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          className="staff-action-btn"
                          title="Activate"
                          onClick={() => toggleStatus(member)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button className="staff-action-btn" title="Delete" onClick={() => handleDelete(member)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="staff-empty">
            <div className="staff-empty-icon">
              <UserCog size={28} />
            </div>
            <h2>No staff members found</h2>
            <p>Add staff members to manage your admin panel.</p>
            <div className="staff-empty-actions">
              <button className="primary-button" onClick={openAdd}>
                <Plus size={18} />
                Add Staff Member
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editItem ? "Edit Staff" : "Add Staff Member"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <div className="settings-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div className="settings-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="rahul@houseofphones.com"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Staff</option>
                    <option>Support</option>
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
                  </select>
                </div>
              </div>
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
                <label>{editItem ? "Change Password (optional)" : "Password *"}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editItem ? "Leave empty to keep current" : "Min 6 characters"}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editItem ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
