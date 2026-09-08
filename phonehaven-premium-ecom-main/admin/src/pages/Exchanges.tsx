import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Search,
  SlidersHorizontal,
  XCircle,
  Eye,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { exchangesAPI } from "../services/cms-api";

export function Exchanges() {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedExchange, setSelectedExchange] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await exchangesAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setExchanges((res as any).exchanges || []);
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
      await exchangesAPI.update(id, { status });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "exchange-status-pending",
      Requested: "exchange-status-pending",
      Approved: "exchange-status-approved",
      "Replacement Sent": "exchange-status-sent",
      Completed: "exchange-status-sent",
      Rejected: "exchange-status-rejected",
    };
    return styles[status] || "exchange-status-pending";
  };

  const pendingCount = exchanges.filter((e) => e.status === "Requested" || e.status === "Pending").length;
  const approvedCount = exchanges.filter((e) => e.status === "Approved").length;
  const sentCount = exchanges.filter((e) => e.status === "Replacement Sent" || e.status === "Completed").length;

  return (
    <div className="exchanges-page">
      <div className="page-heading exchanges-heading">
        <div>
          <h1>Exchanges</h1>
          <p>Manage customer product exchange and replacement requests.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="exchanges-stats">
        <div className="exchange-stat-card">
          <div className="exchange-stat-icon blue">
            <ArrowLeftRight size={21} />
          </div>
          <div>
            <span>Total Exchanges</span>
            <strong>{exchanges.length}</strong>
          </div>
        </div>
        <div className="exchange-stat-card">
          <div className="exchange-stat-icon yellow">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending Requests</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
        <div className="exchange-stat-card">
          <div className="exchange-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>
        <div className="exchange-stat-card">
          <div className="exchange-stat-icon purple">
            <PackageCheck size={21} />
          </div>
          <div>
            <span>Replacement Sent</span>
            <strong>{sentCount}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="exchanges-toolbar">
        <div className="exchanges-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="exchanges-toolbar-right">
          <select
            className="exchanges-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option value="Requested">Requested / Pending</option>
            <option value="Approved">Approved</option>
            <option value="Replacement Sent">Replacement Sent</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="exchanges-card">
        {loading ? (
          <div className="exchanges-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading exchange requests...</p>
          </div>
        ) : error ? (
          <div className="exchanges-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : exchanges.length > 0 ? (
          <table className="exchanges-table">
            <thead>
              <tr>
                <th>Exchange ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Replacement Requested</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.map((exchange) => (
                <tr key={exchange.id}>
                  <td className="exchange-order">{exchange.exchangeId || exchange.order?.orderId || "—"}</td>
                  <td>{exchange.customerName}</td>
                  <td>{exchange.productName}</td>
                  <td>{exchange.requestedReplacement || "Same Model / Colour"}</td>
                  <td>
                    <span className={`exchange-status ${getStatusClass(exchange.status)}`}>
                      {exchange.status}
                    </span>
                  </td>
                  <td className="exchange-date">
                    {exchange.createdAt ? new Date(exchange.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="exchange-actions">
                      <button
                        className="exchange-action-btn"
                        title="View"
                        onClick={() => {
                          setSelectedExchange(exchange);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {exchange.status !== "Approved" && exchange.status !== "Replacement Sent" && (
                        <button
                          className="exchange-action-btn"
                          title="Approve"
                          onClick={() => handleStatusUpdate(exchange.id, "Approved")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {exchange.status === "Approved" && (
                        <button
                          className="exchange-action-btn"
                          title="Mark Replacement Sent"
                          onClick={() => handleStatusUpdate(exchange.id, "Replacement Sent")}
                        >
                          <PackageCheck size={16} />
                        </button>
                      )}
                      {exchange.status !== "Rejected" && (
                        <button
                          className="exchange-action-btn"
                          title="Reject"
                          onClick={() => handleStatusUpdate(exchange.id, "Rejected")}
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
          <div className="exchanges-empty">
            <div className="exchanges-empty-icon">
              <XCircle size={28} />
            </div>
            <h2>No exchange requests</h2>
            <p>Customer exchange and replacement requests will appear here once submitted.</p>
          </div>
        )}
      </div>

      {showModal && selectedExchange && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Exchange #{selectedExchange.exchangeId}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Customer:</strong> {selectedExchange.customerName} ({selectedExchange.customerEmail || "No email"})</div>
              <div><strong>Original Product:</strong> {selectedExchange.productName}</div>
              <div><strong>Reason:</strong> {selectedExchange.reason}</div>
              <div><strong>Replacement Requested:</strong> {selectedExchange.requestedReplacement || "Same Model"}</div>
              <div><strong>Status:</strong> {selectedExchange.status}</div>
              <div><strong>Requested On:</strong> {new Date(selectedExchange.createdAt).toLocaleString("en-IN")}</div>
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
