import { Wrench, Search, SlidersHorizontal, Eye, CheckCircle, XCircle, Clock, Loader2, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { repairsAPI } from "../services/cms-api";

export function Repairs() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await repairsAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setRepairs((res as any).repairs || []);
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
      await repairsAPI.update(id, { status });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "repair-status-pending",
      Requested: "repair-status-pending",
      Accepted: "repair-status-accepted",
      "In Progress": "repair-status-progress",
      Completed: "repair-status-completed",
      Cancelled: "repair-status-cancelled",
    };
    return styles[status] || "repair-status-pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
      case "Requested":
        return <Clock size={14} />;
      case "Accepted":
        return <CheckCircle size={14} />;
      case "In Progress":
        return <Wrench size={14} />;
      case "Completed":
        return <CheckCircle size={14} />;
      case "Cancelled":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const pendingCount = repairs.filter((r) => r.status === "Requested" || r.status === "Pending").length;
  const acceptedCount = repairs.filter((r) => r.status === "Accepted").length;
  const inProgressCount = repairs.filter((r) => r.status === "In Progress").length;
  const completedCount = repairs.filter((r) => r.status === "Completed").length;

  return (
    <div className="repairs-page">
      <div className="page-heading repairs-heading">
        <div>
          <h1>Repairs</h1>
          <p>Manage customer repair requests and service status</p>
        </div>
      </div>

      {/* Stats */}
      <div className="repairs-stats">
        <div className="repair-stat-card">
          <div className="repair-stat-icon blue">
            <Wrench size={20} />
          </div>
          <div>
            <strong>{repairs.length}</strong>
            <span>Total Requests</span>
          </div>
        </div>
        <div className="repair-stat-card">
          <div className="repair-stat-icon yellow">
            <Wrench size={20} />
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>
        <div className="repair-stat-card">
          <div className="repair-stat-icon purple">
            <CheckCircle size={20} />
          </div>
          <div>
            <strong>{acceptedCount}</strong>
            <span>Accepted</span>
          </div>
        </div>
        <div className="repair-stat-card">
          <div className="repair-stat-icon purple">
            <Wrench size={20} />
          </div>
          <div>
            <strong>{inProgressCount}</strong>
            <span>In Progress</span>
          </div>
        </div>
        <div className="repair-stat-card">
          <div className="repair-stat-icon green">
            <Wrench size={20} />
          </div>
          <div>
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="repairs-toolbar">
        <div className="repairs-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search repair requests by customer or device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="repairs-toolbar-right">
          <select
            className="repairs-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option value="Requested">Requested / Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="repairs-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="repairs-card">
        {loading ? (
          <div className="repairs-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading repair requests...</p>
          </div>
        ) : error ? (
          <div className="repairs-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : repairs.length > 0 ? (
          <table className="repairs-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Device</th>
                <th>Issue / Type</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.id}>
                  <td className="repair-customer">{repair.customerName}</td>
                  <td>{repair.deviceName}</td>
                  <td><span className="repair-type">{repair.issue}</span></td>
                  <td>
                    <span className={`repair-status ${getStatusClass(repair.status)}`}>
                      {getStatusIcon(repair.status)}
                      {repair.status}
                    </span>
                  </td>
                  <td className="repair-amount">
                    {repair.finalCost
                      ? `₹${repair.finalCost.toLocaleString("en-IN")}`
                      : repair.estimatedCost
                      ? `~₹${repair.estimatedCost.toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="repair-date">
                    {repair.createdAt ? new Date(repair.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="repair-actions">
                      <button
                        className="repair-action-btn"
                        title="View"
                        onClick={() => {
                          setSelectedRepair(repair);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {(repair.status === "Requested" || repair.status === "Pending") && (
                        <button
                          className="repair-action-btn"
                          title="Accept Repair"
                          onClick={() => handleStatusUpdate(repair.id, "Accepted")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {repair.status === "Accepted" && (
                        <button
                          className="repair-action-btn"
                          title="Start Repair"
                          onClick={() => handleStatusUpdate(repair.id, "In Progress")}
                        >
                          <Wrench size={16} />
                        </button>
                      )}
                      {repair.status !== "Completed" && repair.status !== "Requested" && repair.status !== "Pending" && (
                        <button
                          className="repair-action-btn"
                          title="Mark Completed"
                          onClick={() => handleStatusUpdate(repair.id, "Completed")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {repair.status !== "Cancelled" && (
                        <button
                          className="repair-action-btn"
                          title="Cancel"
                          onClick={() => handleStatusUpdate(repair.id, "Cancelled")}
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
          <div className="repairs-empty">
            <div className="repairs-empty-icon">
              <Wrench size={28} />
            </div>
            <h2>No repair requests yet</h2>
            <p>Customer repair requests will appear here once submitted.</p>
          </div>
        )}
      </div>

      {showModal && selectedRepair && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Repair #{selectedRepair.repairId}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Customer:</strong> {selectedRepair.customerName} ({selectedRepair.customerPhone || selectedRepair.customerEmail || "No contact"})</div>
              <div><strong>Device:</strong> {selectedRepair.deviceName}</div>
              <div><strong>Issue:</strong> {selectedRepair.issue}</div>
              <div><strong>Description:</strong> {selectedRepair.description || "None provided"}</div>
              <div><strong>Technician:</strong> {selectedRepair.technician || "Unassigned"}</div>
              <div><strong>Status:</strong> {selectedRepair.status}</div>
              <div><strong>Estimated Cost:</strong> {selectedRepair.estimatedCost ? `₹${selectedRepair.estimatedCost}` : "Pending evaluation"}</div>
              <div><strong>Final Cost:</strong> {selectedRepair.finalCost ? `₹${selectedRepair.finalCost}` : "—"}</div>
              <div><strong>Requested:</strong> {new Date(selectedRepair.createdAt).toLocaleString("en-IN")}</div>
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
