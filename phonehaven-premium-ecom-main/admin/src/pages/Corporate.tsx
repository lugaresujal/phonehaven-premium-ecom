import { Building2, Search, SlidersHorizontal, Eye, CheckCircle, XCircle, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { corporateAPI } from "../services/cms-api";

export function Corporate() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await corporateAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setClients((res as any).enquiries || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await corporateAPI.update(id, { status });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Active: "corporate-status-active",
      Approved: "corporate-status-active",
      "Pending Approval": "corporate-status-pending",
      New: "corporate-status-pending",
      Inactive: "corporate-status-inactive",
      Rejected: "corporate-status-inactive",
    };
    return styles[status] || "corporate-status-pending";
  };

  const activeCount = clients.filter((c) => c.status === "Active" || c.status === "Approved").length;
  const pendingCount = clients.filter((c) => c.status === "New" || c.status === "Pending Approval").length;

  return (
    <div className="corporate-page">
      <div className="page-heading corporate-heading">
        <div>
          <h1>Corporate</h1>
          <p>Manage corporate clients, bulk orders, and B2B relationships</p>
        </div>
      </div>

      {/* Stats */}
      <div className="corporate-stats">
        <div className="corporate-stat-card">
          <div className="corporate-stat-icon blue">
            <Building2 size={20} />
          </div>
          <div>
            <strong>{clients.length}</strong>
            <span>Total Requests</span>
          </div>
        </div>
        <div className="corporate-stat-card">
          <div className="corporate-stat-icon green">
            <Building2 size={20} />
          </div>
          <div>
            <strong>{activeCount}</strong>
            <span>Active / Approved</span>
          </div>
        </div>
        <div className="corporate-stat-card">
          <div className="corporate-stat-icon yellow">
            <Building2 size={20} />
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending Approval</span>
          </div>
        </div>
        <div className="corporate-stat-card">
          <div className="corporate-stat-icon purple">
            <Building2 size={20} />
          </div>
          <div>
            <strong>{clients.filter((c) => c.requirement).length}</strong>
            <span>Custom Quotes</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="corporate-toolbar">
        <div className="corporate-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search corporate clients by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="corporate-toolbar-right">
          <select
            className="corporate-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option value="New">New / Pending</option>
            <option value="Approved">Approved / Active</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button className="corporate-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="corporate-card">
        {loading ? (
          <div className="corporate-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading corporate clients...</p>
          </div>
        ) : error ? (
          <div className="corporate-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : clients.length > 0 ? (
          <table className="corporate-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Requirement</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="corporate-name">{client.companyName}</td>
                  <td>
                    <div>{client.contactPerson}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{client.email} {client.phone ? `| ${client.phone}` : ""}</div>
                  </td>
                  <td><span className="corporate-type">{client.requirement || "Bulk Order"}</span></td>
                  <td>
                    <span className={`corporate-status ${getStatusClass(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="corporate-date">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="corporate-actions">
                      <button
                        className="corporate-action-btn"
                        title="View"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {client.status !== "Approved" && (
                        <button
                          className="corporate-action-btn"
                          title="Approve"
                          onClick={() => handleStatusUpdate(client.id, "Approved")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {client.status !== "Rejected" && (
                        <button
                          className="corporate-action-btn"
                          title="Reject"
                          onClick={() => handleStatusUpdate(client.id, "Rejected")}
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="corporate-empty">
            <div className="corporate-empty-icon">
              <Building2 size={28} />
            </div>
            <h2>No corporate requests yet</h2>
            <p>B2B and corporate client enquiries will appear here.</p>
          </div>
        )}
      </div>

      {showModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{selectedClient.companyName}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Contact Person:</strong> {selectedClient.contactPerson}</div>
              <div><strong>Email:</strong> {selectedClient.email}</div>
              <div><strong>Phone:</strong> {selectedClient.phone || "Not provided"}</div>
              <div><strong>Requirement:</strong> {selectedClient.requirement || "Bulk Purchase"}</div>
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <strong>Message / Details:</strong>
                <p style={{ margin: "6px 0 0 0", whiteSpace: "pre-wrap" }}>{selectedClient.message || "No additional message"}</p>
              </div>
              <div><strong>Status:</strong> {selectedClient.status}</div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
