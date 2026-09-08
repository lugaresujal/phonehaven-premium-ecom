import {
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Search,
  SlidersHorizontal,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { paymentAPI, type PaymentRecord } from "../services/api";

export function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [methodFilter, setMethodFilter] = useState<string>("All Methods");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentAPI.getAll();
      if (res && res.payments) {
        setPayments(res.payments);
      } else {
        setPayments([]);
      }
    } catch (err: any) {
      console.error("Failed to load payments:", err);
      setError(err.message || "Failed to load payments from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusClass = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "successful":
      case "completed":
      case "paid":
        return "payments-status-success";
      case "pending":
        return "payments-status-pending";
      case "failed":
        return "payments-status-failed";
      case "refunded":
        return "payments-status-refunded";
      default:
        return "payments-status-pending";
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const s = (p.status || "").toLowerCase();
      const m = (p.method || "").toLowerCase();
      const statusMatch =
        statusFilter === "All Status" ||
        s === statusFilter.toLowerCase() ||
        (statusFilter === "Completed" && (s === "completed" || s === "successful" || s === "paid"));

      const methodMatch =
        methodFilter === "All Methods" ||
        m.includes(methodFilter.toLowerCase());

      const term = searchTerm.toLowerCase().trim();
      if (!term) return statusMatch && methodMatch;

      const idMatch = (p.id || "").toLowerCase().includes(term);
      const orderMatch = (p.orderId || "").toLowerCase().includes(term);
      const customerMatch = (p.customer || "").toLowerCase().includes(term);

      return statusMatch && methodMatch && (idMatch || orderMatch || customerMatch);
    });
  }, [payments, statusFilter, methodFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalRev = payments
      .filter((p) => p.orderStatus?.toLowerCase() !== "cancelled")
      .reduce((sum, p) => sum + p.amount, 0);

    const successful = payments.filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "completed" || s === "successful" || s === "paid";
    }).length;

    const pending = payments.filter((p) => (p.status || "").toLowerCase() === "pending").length;
    const failed = payments.filter((p) => (p.status || "").toLowerCase() === "failed" || p.orderStatus?.toLowerCase() === "cancelled").length;
    const refunded = payments.filter((p) => (p.status || "").toLowerCase() === "refunded").length;

    return { totalRev, successful, pending, failed, refunded };
  }, [payments]);

  const formatCurrency = (val: number | undefined | null) => {
    return `₹${Number(val || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Transaction ID,Order ID,Customer,Amount,Method,Status,Date"]
        .concat(
          payments.map(
            (p) =>
              `"${p.id}","${p.orderId}","${p.customer}",${p.amount},"${p.method}","${p.status}","${p.date}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HOP_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="payments-page">
      <div className="page-heading payments-heading">
        <div>
          <h1>Payments & Transactions</h1>
          <p>Monitor customer Cash on Delivery payments, transaction status, and order totals.</p>
        </div>
        <div className="payments-header-actions">
          <button
            className="payments-refresh-btn"
            onClick={fetchPayments}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={17} className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="payments-export-btn" onClick={handleExport}>
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="payments-stats">
        <div 
          className="payment-stat-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 18px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            minWidth: "0",
            flexShrink: 0,
            flex: "1 1 0",
          }}
        >
          <div 
            className="payment-stat-icon green"
            style={{
              flexShrink: 0,
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#065f46",
            }}
          >
            <IndianRupee size={21} />
          </div>
          <div style={{ 
            minWidth: "0", 
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}>
            <span 
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#6b7280",
                display: "block",
                lineHeight: "1.4",
              }}
            >
              Total Revenue (COD & Orders)
            </span>
            <strong 
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
                display: "block",
                lineHeight: "1.2",
              }}
            >
              {formatCurrency(stats.totalRev)}
            </strong>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="payment-stat-icon emerald">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Completed Payments</span>
            <strong>{stats.successful}</strong>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="payment-stat-icon yellow">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Pending (COD)</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="payment-stat-icon red">
            <XCircle size={21} />
          </div>
          <div>
            <span>Cancelled / Failed</span>
            <strong>{stats.failed}</strong>
          </div>
        </div>
        <div className="payment-stat-card">
          <div className="payment-stat-icon purple">
            <ArrowUpRight size={21} />
          </div>
          <div>
            <span>Refunded</span>
            <strong>{stats.refunded}</strong>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "18px",
            backgroundColor: "#fee2e2",
            border: "1px solid #f87171",
            borderRadius: "8px",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>Error loading payments:</strong> {error}
          </div>
          <button
            onClick={fetchPayments}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="payments-toolbar">
        <div className="payments-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by transaction ID, order ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="payments-filter-group">
          <select
            className="payments-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Completed">Completed / Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed / Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
          <select
            className="payments-filter-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All Methods">All Methods</option>
            <option value="Cash on Delivery">Cash on Delivery (COD)</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
          <button
            type="button"
            className="payments-filter-btn"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All Status");
              setMethodFilter("All Methods");
            }}
          >
            <SlidersHorizontal size={17} />
            Reset
          </button>
        </div>
      </div>

      {/* Conditional Rendering: Table OR Empty State */}
      <div className="payments-card">
        {loading && payments.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#666" }}>
            <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "500" }}>Loading payments data from PostgreSQL...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          // ✅ TABLE MODE
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id || payment.orderId}>
                  <td className="payments-txn-id">{payment.id}</td>
                  <td className="payments-order-id">{payment.orderId}</td>
                  <td>{payment.customer}</td>
                  <td className="payments-amount">{formatCurrency(payment.amount)}</td>
                  <td>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                      {payment.method}
                    </span>
                  </td>
                  <td>
                    <span className={`payments-status-badge ${getStatusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>
                      {payment.orderStatus}
                    </span>
                  </td>
                  <td className="payments-date">{formatDate(payment.date)}</td>
                  <td>
                    <div className="payments-actions">
                      <button
                        className="payments-action-btn"
                        title="View Payment Details"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // ❌ EMPTY STATE
          <div className="payments-empty">
            <div className="payments-empty-icon">
              <CreditCard size={28} />
            </div>
            <h2>No transactions to display</h2>
            <p>Customer payment transactions will appear here once orders are placed and payments are recorded.</p>
            <div className="payments-empty-actions">
              <button
                className="payments-empty-action-btn"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All Status");
                  fetchPayments();
                }}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedPayment(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                Payment Transaction Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Transaction ID:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>{selectedPayment.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Associated Order:</span>
                <span style={{ fontWeight: "600", color: "#2563eb" }}>#{selectedPayment.orderId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Customer Name:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>{selectedPayment.customer}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Payment Method:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>{selectedPayment.method} ({selectedPayment.mode})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Payment Status:</span>
                <span className={`payments-status-badge ${getStatusClass(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Order Lifecycle Status:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>{selectedPayment.orderStatus}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Transaction Date:</span>
                <span style={{ color: "#111827" }}>{formatDate(selectedPayment.date)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "6px",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: "#2563eb" }}>{formatCurrency(selectedPayment.amount)}</span>
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="filter-button"
                onClick={() => setSelectedPayment(null)}
                style={{ padding: "8px 20px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}