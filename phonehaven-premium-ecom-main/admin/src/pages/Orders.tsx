import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  RefreshCw,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  AlertTriangle,
  Send,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { orderAPI, type Order } from "../services/api";
import { returnsAPI } from "../services/cms-api";

const ORDER_STATUSES = [
  "Processing",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [modalNewStatus, setModalNewStatus] = useState<string>("");
  const [returns, setReturns] = useState<any[]>([]);

  const fetchReturns = async () => {
    try {
      const res = await returnsAPI.getAll();
      if (res && res.returns) {
        setReturns(res.returns);
      }
    } catch {
      // silent fail
    }
  };

  const getOrderReturn = (orderId: string) => {
    return returns.find((r: any) => r.orderId === orderId || r.order?.orderId === orderId) || null;
  };

  const handleUpdateReturnStatus = async (returnId: string, newStatus: string) => {
    try {
      await returnsAPI.update(returnId, { status: newStatus });
      fetchReturns();
      alert(`Return status updated to "${newStatus}".`);
    } catch (err: any) {
      alert("Failed to update return status: " + (err.message || "Unknown error"));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getAll();
      if (res && res.orders) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReturns();
  }, []);

  const handleAddOrder = () => {
    alert("To create a new order, customers can place orders through the House of Phones store, or use the checkout API.");
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await orderAPI.updateStatus(orderId, newStatus);
      if (res && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId || o.id === orderId ? res.order : o))
        );
        if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.id === orderId)) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderId}?`)) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await orderAPI.cancel(orderId, "Cancelled by Admin");
      if (res && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId || o.id === orderId ? res.order : o))
        );
        if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.id === orderId)) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      alert("Failed to cancel order: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setModalNewStatus(order.status);
    try {
      const res = await orderAPI.getById(order.orderId || order.id);
      if (res && res.order) {
        setSelectedOrder(res.order);
        setModalNewStatus(res.order.status);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === res.order.orderId || o.id === res.order.id ? res.order : o))
        );
      }
    } catch (err) {
      console.warn("Could not fetch fresh order details:", err);
    }
  };

  const getStatusClass = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return "order-status-pending";
      case "processing":
        return "order-status-processing";
      case "confirmed":
        return "order-status-processing";
      case "packed":
        return "order-status-shipped";
      case "shipped":
        return "order-status-shipped";
      case "out for delivery":
        return "order-status-pending";
      case "delivered":
        return "order-status-delivered";
      case "cancelled":
        return "order-status-cancelled";
      case "cancellation requested":
        return "order-status-pending";
      default:
        return "order-status-processing";
    }
  };

  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return <Clock size={14} />;
      case "processing":
        return <Clock size={14} />;
      case "confirmed":
        return <CheckCircle size={14} />;
      case "packed":
        return <Package size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "out for delivery":
        return <Send size={14} />;
      case "delivered":
        return <PackageCheck size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      case "cancellation requested":
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const s = (order.status || "").toLowerCase();
      const filter = statusFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "All Status" ||
        s === filter ||
        (filter === "processing" && (s === "processing" || s === "confirmed"));

      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const orderIdMatch = (order.orderId || order.id || "").toLowerCase().includes(term);
      const customerMatch = (order.address?.fullName || "").toLowerCase().includes(term);
      const phoneMatch = (order.address?.phone || "").toLowerCase().includes(term);
      const emailMatch = (order.address?.email || "").toLowerCase().includes(term);
      const cityMatch = (order.address?.city || "").toLowerCase().includes(term);

      return matchesStatus && (orderIdMatch || customerMatch || phoneMatch || emailMatch || cityMatch);
    });
  }, [orders, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const processing = orders.filter((o) => {
      const s = (o.status || "").toLowerCase();
      return s === "processing" || s === "confirmed" || s === "packed";
    }).length;
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    return { total, pending, processing, delivered };
  }, [orders]);

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
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="orders-page">
      <div className="page-heading orders-heading">
        <div>
          <h1>Orders</h1>
          <p>Manage and track all House of Phones orders from PostgreSQL.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="filter-button"
            onClick={fetchOrders}
            disabled={loading}
            title="Refresh orders"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="primary-button" onClick={handleAddOrder}>
            <ShoppingCart size={17} />
            New Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="orders-stats">
        <div className="order-stat-card">
          <div className="order-stat-icon blue">
            <ShoppingCart size={21} />
          </div>
          <div>
            <span>Total Orders</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-icon yellow">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-icon purple">
            <Truck size={21} />
          </div>
          <div>
            <span>Processing / In Transit</span>
            <strong>{stats.processing}</strong>
          </div>
        </div>
        <div className="order-stat-card">
          <div className="order-stat-icon green">
            <PackageCheck size={21} />
          </div>
          <div>
            <span>Delivered</span>
            <strong>{stats.delivered}</strong>
          </div>
        </div>
      </div>

      {/* Error Banner */}
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
            <strong>Error loading orders:</strong> {error}
          </div>
          <button
            onClick={fetchOrders}
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
      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by order ID, customer, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="orders-toolbar-right">
          <select
            className="orders-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Processing">Processing / Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            className="filter-button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All Status");
            }}
          >
            <SlidersHorizontal size={17} />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Conditional Rendering: Table OR Empty State */}
      <div className="orders-card">
        {loading && orders.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#666" }}>
            <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "500" }}>Loading orders from PostgreSQL database...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          // ✅ TABLE MODE
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status / Change</th>
                <th>Items</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const totalItemQty =
                  order.items?.reduce((sum, item) => sum + (item.qty || 1), 0) ||
                  order.items?.length ||
                  0;
                const isUpdating = updatingOrderId === (order.orderId || order.id);

                return (
                  <tr key={order.id || order.orderId}>
                    <td className="order-id">{order.orderId || order.id}</td>
                    <td>
                      <div>
                        <strong>{order.address?.fullName || "Customer"}</strong>
                        {order.address?.city && (
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            {order.address.city}, {order.address.state}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="order-amount">{formatCurrency(order.total)}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                        <span className={`order-status ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        {getOrderReturn(order.id) && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            background: getOrderReturn(order.id).status === "Approved" || getOrderReturn(order.id).status === "Completed" ? "#dcfce7" : getOrderReturn(order.id).status === "Rejected" ? "#fee2e2" : "#fef3c7",
                            color: getOrderReturn(order.id).status === "Approved" || getOrderReturn(order.id).status === "Completed" ? "#166534" : getOrderReturn(order.id).status === "Rejected" ? "#991b1b" : "#92400e",
                          }}>
                            <RotateCcw size={11} />
                            Return: {getOrderReturn(order.id).status}
                          </span>
                        )}
                        {order.status === "Cancellation Requested" && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            background: "#fef3c7",
                            color: "#92400e",
                          }}>
                            <AlertTriangle size={11} />
                            Pending Admin Review
                          </span>
                        )}
                        <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleUpdateStatus(order.orderId || order.id, e.target.value)}
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #d1d5db",
                              background: "#f9fafb",
                              cursor: "pointer",
                              color: "#374151",
                              fontWeight: "500",
                            }}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                      </div>
                    </td>
                    <td>{totalItemQty} {totalItemQty === 1 ? "item" : "items"}</td>
                    <td className="order-date">{formatDate(order.date || order.createdAt)}</td>
                    <td>
                      <div className="order-actions">
                        <button
                          className="order-action-btn"
                          title="View Order Details"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="order-action-btn"
                          title="Cancel Order"
                          onClick={() => handleCancelOrder(order.orderId || order.id)}
                          disabled={order.status === "Cancelled"}
                          style={{ opacity: order.status === "Cancelled" ? 0.4 : 1 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          // ❌ EMPTY STATE
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <ShoppingCart size={28} />
            </div>
            <h2>No orders to display</h2>
            <p>
              {searchTerm || statusFilter !== "All Status"
                ? "No orders match your current search or filter criteria."
                : "Orders placed through the House of Phones website will appear here in real-time."}
            </p>
            <div className="orders-empty-actions">
              <button
                className="orders-empty-action-btn"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All Status");
                  fetchOrders();
                }}
              >
                <RefreshCw size={17} />
                Refresh / Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                    Order #{selectedOrder.orderId || selectedOrder.id}
                  </h2>
                  <span className={`order-status ${getStatusClass(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                  Placed on {formatDate(selectedOrder.date || selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Update Bar inside modal */}
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e40af" }}>
                  Manage Order Status:
                </div>
                <div style={{ fontSize: "12px", color: "#3b82f6" }}>
                  Currently: <strong>{selectedOrder.status}</strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={modalNewStatus || selectedOrder.status}
                  onChange={(e) => setModalNewStatus(e.target.value)}
                  style={{
                    height: "36px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #93c5fd",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (modalNewStatus && modalNewStatus !== selectedOrder.status) {
                      handleUpdateStatus(selectedOrder.orderId || selectedOrder.id, modalNewStatus);
                    }
                  }}
                  disabled={updatingOrderId === (selectedOrder.orderId || selectedOrder.id) || !modalNewStatus || modalNewStatus === selectedOrder.status}
                  style={{
                    padding: "0 14px",
                    height: "36px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    opacity: (!modalNewStatus || modalNewStatus === selectedOrder.status) ? 0.5 : 1,
                  }}
                >
                  {updatingOrderId === (selectedOrder.orderId || selectedOrder.id) ? "Saving..." : "Update"}
                </button>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151", textTransform: "uppercase" }}>
                  Customer Information
                </h4>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                  {selectedOrder.address?.fullName || "Customer"}
                </div>
                {selectedOrder.address?.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
                    <Phone size={14} />
                    {selectedOrder.address.phone}
                  </div>
                )}
                {selectedOrder.address?.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#4b5563", marginTop: "4px" }}>
                    <Mail size={14} />
                    {selectedOrder.address.email}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151", textTransform: "uppercase" }}>
                  Shipping Address
                </h4>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "13px", color: "#4b5563" }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div>{selectedOrder.address?.line1}</div>
                    {selectedOrder.address?.line2 && <div>{selectedOrder.address.line2}</div>}
                    <div>
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                Items Ordered ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderBottom: idx < (selectedOrder.items?.length || 0) - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", background: "#f3f4f6" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div style={{ width: "44px", height: "44px", background: "#f3f4f6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Package size={20} color="#9ca3af" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {item.brand && <span>{item.brand} • </span>}
                            Qty: {item.qty}
                            {item.storage && <span> • {item.storage}</span>}
                            {item.color && <span> • {item.color}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                        {formatCurrency(item.price * item.qty)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "16px", color: "#6b7280", textAlign: "center" }}>No items listed</div>
                )}
              </div>
            </div>

            {/* Payment & Totals */}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: "10px",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151", textTransform: "uppercase" }}>
                  Payment Method
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                  <CreditCard size={18} color="#2563eb" />
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentMode})
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  Status: <span style={{ fontWeight: "600", textTransform: "capitalize", color: selectedOrder.paymentStatus === "Completed" ? "#059669" : "#d97706" }}>{selectedOrder.paymentStatus}</span>
                </div>
                {selectedOrder.deliveryLabel && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                    Delivery: <strong>{selectedOrder.deliveryLabel}</strong>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#4b5563", marginBottom: "6px" }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#4b5563", marginBottom: "6px" }}>
                  <span>Shipping / Delivery:</span>
                  <span>{formatCurrency(selectedOrder.shipping || selectedOrder.deliveryFee)}</span>
                </div>
                {selectedOrder.gstIncluded ? (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                    <span>GST (Included):</span>
                    <span>{formatCurrency(selectedOrder.gstIncluded)}</span>
                  </div>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#111827",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "8px",
                    marginTop: "8px",
                  }}
                >
                  <span>Total Amount:</span>
                  <span style={{ color: "#2563eb" }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Return Information */}
            {getOrderReturn(selectedOrder.id) && (() => {
              const ret = getOrderReturn(selectedOrder.id);
              const RETURN_STATUSES = ["Requested", "Approved", "Rejected", "Pickup Scheduled", "Picked Up", "Refund Initiated", "Completed"];
              return (
                <div style={{
                  background: "#fffbeb",
                  border: "1px solid #fbbf24",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px",
                }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "600", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
                    <RotateCcw size={16} />
                    Return Request
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                    <div><span style={{ color: "#6b7280" }}>Return ID:</span> <strong>{ret.returnId || ret.id}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>Status:</span> <strong>{ret.status}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>Product:</span> {ret.productName}</div>
                    <div><span style={{ color: "#6b7280" }}>Reason:</span> {ret.reason}</div>
                    {ret.description && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Details:</span> {ret.description}</div>}
                    <div><span style={{ color: "#6b7280" }}>Requested:</span> {new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    {ret.refundAmount && <div><span style={{ color: "#6b7280" }}>Refund Amount:</span> ₹{Number(ret.refundAmount).toLocaleString("en-IN")}</div>}
                  </div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Update Status:</span>
                    <select
                      value={ret.status}
                      onChange={(e) => handleUpdateReturnStatus(ret.id, e.target.value)}
                      style={{
                        height: "32px",
                        padding: "0 8px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      {RETURN_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })()}

            {/* Cancellation Details */}
            {(selectedOrder.status?.toLowerCase() === "cancelled" || Boolean(selectedOrder.cancellationReason)) && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#991b1b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <XCircle size={16} />
                  Cancellation Details
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#6b7280" }}>Status:</span>{" "}
                    <strong style={{ color: "#991b1b" }}>{selectedOrder.status}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280" }}>Cancellation Reason:</span>{" "}
                    <strong style={{ color: "#7f1d1d", wordBreak: "break-word" }}>
                      {selectedOrder.cancellationReason || "Not specified"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {selectedOrder.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(selectedOrder.orderId || selectedOrder.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #f87171",
                      background: "#fee2e2",
                      color: "#991b1b",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
              <button
                type="button"
                className="filter-button"
                onClick={() => setSelectedOrder(null)}
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