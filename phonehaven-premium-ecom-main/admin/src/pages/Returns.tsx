import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  PackageX,
  Search,
  SlidersHorizontal,
  XCircle,
  Eye,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { returnsAPI } from "../services/cms-api";

export function Returns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await returnsAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setReturns((res as any).returns || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (id: string, status: string, refundStatus?: string) => {
    try {
      await returnsAPI.update(id, { status, ...(refundStatus ? { refundStatus } : {}) });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "return-status-pending",
      Requested: "return-status-pending",
      Approved: "return-status-approved",
      Refunded: "return-status-refunded",
      Rejected: "return-status-rejected",
    };
    return styles[status] || "return-status-pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
      case "Requested":
        return <Clock3 size={14} />;
      case "Approved":
        return <CheckCircle size={14} />;
      case "Refunded":
        return <IndianRupee size={14} />;
      case "Rejected":
        return <XCircle size={14} />;
      default:
        return <Clock3 size={14} />;
    }
  };

  const pendingCount = returns.filter((r) => r.status === "Pending" || r.status === "Requested").length;
  const approvedCount = returns.filter((r) => r.status === "Approved").length;
  const totalRefunds = returns
    .filter((r) => r.status === "Refunded" || r.refundStatus === "Refunded")
    .reduce((acc, r) => acc + (r.refundAmount || 0), 0);

  return (
    <div className="returns-page">
      <div className="page-heading returns-heading">
        <div>
          <h1>Returns & Refunds</h1>
          <p>Manage product returns, refund requests and return approvals.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="returns-stats">
        <div className="return-stat-card">
          <div className="return-stat-icon blue">
            <PackageX size={21} />
          </div>
          <div>
            <span>Total Returns</span>
            <strong>{returns.length}</strong>
          </div>
        </div>
        <div className="return-stat-card">
          <div className="return-stat-icon yellow">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending Requests</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
        <div className="return-stat-card">
          <div className="return-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Approved Returns</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>
        <div className="return-stat-card">
          <div className="return-stat-icon purple">
            <IndianRupee size={21} />
          </div>
          <div>
            <span>Total Refunds</span>
            <strong>₹{totalRefunds.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="returns-toolbar">
        <div className="returns-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by return ID, customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="returns-toolbar-right">
          <select
            className="returns-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option value="Requested">Requested / Pending</option>
            <option value="Approved">Approved</option>
            <option value="Refunded">Refunded</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="returns-card">
        {loading ? (
          <div className="returns-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading return requests...</p>
          </div>
        ) : error ? (
          <div className="returns-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : returns.length > 0 ? (
          <table className="returns-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Refund</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((returnItem) => (
                <tr key={returnItem.id}>
                  <td className="return-order">{returnItem.returnId || returnItem.order?.orderId || "—"}</td>
                  <td>{returnItem.customerName}</td>
                  <td>{returnItem.productName}</td>
                  <td><span className="return-reason">{returnItem.reason}</span></td>
                  <td>
                    <span className={`return-status ${getStatusClass(returnItem.status)}`}>
                      {getStatusIcon(returnItem.status)}
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="return-amount">
                    {returnItem.refundAmount ? `₹${returnItem.refundAmount.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="return-date">
                    {returnItem.createdAt ? new Date(returnItem.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="return-actions">
                      <button
                        className="return-action-btn"
                        title="View Details"
                        onClick={() => {
                          setSelectedReturn(returnItem);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {returnItem.status !== "Approved" && (
                        <button
                          className="return-action-btn"
                          title="Approve"
                          onClick={() => handleStatusUpdate(returnItem.id, "Approved")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {returnItem.status !== "Rejected" && (
                        <button
                          className="return-action-btn"
                          title="Reject"
                          onClick={() => handleStatusUpdate(returnItem.id, "Rejected")}
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
          <div className="returns-empty">
            <div className="returns-empty-icon">
              <XCircle size={28} />
            </div>
            <h2>No return requests</h2>
            <p>Customer return and refund requests will appear here once submitted.</p>
          </div>
        )}
      </div>

      {showModal && selectedReturn && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Return Request #{selectedReturn.returnId}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Customer:</strong> {selectedReturn.customerName} ({selectedReturn.customerEmail || "No email"})</div>
              <div><strong>Product:</strong> {selectedReturn.productName}</div>
              <div><strong>Reason:</strong> {selectedReturn.reason}</div>
              <div><strong>Details:</strong> {selectedReturn.description || "None provided"}</div>
              <div><strong>Status:</strong> {selectedReturn.status}</div>
              <div><strong>Refund Status:</strong> {selectedReturn.refundStatus}</div>
              {selectedReturn.refundAmount && (
                <div><strong>Refund Amount:</strong> ₹{selectedReturn.refundAmount.toLocaleString("en-IN")}</div>
              )}
              <div><strong>Requested On:</strong> {new Date(selectedReturn.createdAt).toLocaleString("en-IN")}</div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  handleStatusUpdate(selectedReturn.id, "Refunded", "Refunded");
                  setShowModal(false);
                }}
              >
                Mark as Refunded
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
