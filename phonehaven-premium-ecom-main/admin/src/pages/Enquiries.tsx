import { MessageSquare, Search, SlidersHorizontal, Eye, Trash2, CheckCircle, Clock, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { enquiriesAPI } from "../services/cms-api";

export function Enquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await enquiriesAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setEnquiries((res as any).enquiries || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    try {
      await enquiriesAPI.update(id, { status, ...(notes !== undefined ? { adminNotes: notes } : {}) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await enquiriesAPI.delete(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      New: "enquiry-status-pending",
      "In Progress": "enquiry-status-progress",
      Resolved: "enquiry-status-resolved",
    };
    return styles[status] || "enquiry-status-pending";
  };

  const newCount = enquiries.filter((e) => e.status === "New").length;
  const inProgressCount = enquiries.filter((e) => e.status === "In Progress").length;
  const resolvedCount = enquiries.filter((e) => e.status === "Resolved").length;

  return (
    <div className="enquiries-page">
      <div className="page-heading enquiries-heading">
        <div>
          <h1>Enquiries</h1>
          <p>Manage customer enquiries and support tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="enquiries-stats">
        <div className="enquiry-stat-card">
          <div className="enquiry-stat-icon blue">
            <MessageSquare size={20} />
          </div>
          <div>
            <strong>{enquiries.length}</strong>
            <span>Total Enquiries</span>
          </div>
        </div>
        <div className="enquiry-stat-card">
          <div className="enquiry-stat-icon yellow">
            <MessageSquare size={20} />
          </div>
          <div>
            <strong>{newCount}</strong>
            <span>New / Pending</span>
          </div>
        </div>
        <div className="enquiry-stat-card">
          <div className="enquiry-stat-icon purple">
            <MessageSquare size={20} />
          </div>
          <div>
            <strong>{inProgressCount}</strong>
            <span>In Progress</span>
          </div>
        </div>
        <div className="enquiry-stat-card">
          <div className="enquiry-stat-icon green">
            <MessageSquare size={20} />
          </div>
          <div>
            <strong>{resolvedCount}</strong>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="enquiries-toolbar">
        <div className="enquiries-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search enquiries by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="enquiries-toolbar-right">
          <select
            className="enquiries-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <button className="enquiries-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="enquiries-card">
        {loading ? (
          <div className="enquiries-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading enquiries...</p>
          </div>
        ) : error ? (
          <div className="enquiries-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : enquiries.length > 0 ? (
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td className="enquiry-customer">
                    <div><strong>{enquiry.name}</strong></div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{enquiry.email} {enquiry.phone ? `| ${enquiry.phone}` : ""}</div>
                  </td>
                  <td className="enquiry-subject">{enquiry.subject || "General Inquiry"}</td>
                  <td>
                    <span className={`enquiry-status ${getStatusClass(enquiry.status)}`}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="enquiry-date">
                    {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="enquiry-actions">
                      <button
                        className="enquiry-action-btn"
                        title="View"
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setAdminNotes(enquiry.adminNotes || "");
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {enquiry.status !== "In Progress" && enquiry.status !== "Resolved" && (
                        <button
                          className="enquiry-action-btn"
                          title="Mark In Progress"
                          onClick={() => handleStatusUpdate(enquiry.id, "In Progress")}
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      {enquiry.status !== "Resolved" && (
                        <button
                          className="enquiry-action-btn"
                          title="Resolve"
                          onClick={() => handleStatusUpdate(enquiry.id, "Resolved")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        className="enquiry-action-btn"
                        title="Delete"
                        onClick={() => handleDelete(enquiry.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="enquiries-empty">
            <div className="enquiries-empty-icon">
              <MessageSquare size={28} />
            </div>
            <h2>No enquiries yet</h2>
            <p>Customer enquiries and contact submissions will appear here.</p>
          </div>
        )}
      </div>

      {showModal && selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>Enquiry from {selectedEnquiry.name}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Email:</strong> <a href={`mailto:${selectedEnquiry.email}`}>{selectedEnquiry.email}</a></div>
              {selectedEnquiry.phone && <div><strong>Phone:</strong> <a href={`tel:${selectedEnquiry.phone}`}>{selectedEnquiry.phone}</a></div>}
              <div><strong>Subject:</strong> {selectedEnquiry.subject || "General Inquiry"}</div>
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <strong>Message:</strong>
                <p style={{ margin: "6px 0 0 0", whiteSpace: "pre-wrap" }}>{selectedEnquiry.message}</p>
              </div>
              <div><strong>Status:</strong> {selectedEnquiry.status}</div>
              <div className="settings-form-group">
                <label>Admin Notes / Action Taken</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record resolution notes..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  handleStatusUpdate(selectedEnquiry.id, selectedEnquiry.status, adminNotes);
                  setShowModal(false);
                }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
