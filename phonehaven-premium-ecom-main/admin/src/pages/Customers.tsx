import {
  Search,
  SlidersHorizontal,
  Users,
  Eye,
  UserCheck,
  UserX,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { customersAPI } from "../services/cms-api";

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await customersAPI.getAll({ ...(search ? { search } : {}) });
      setCustomers((res as any).customers || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusToggle = async (customer: any) => {
    const newStatus = customer.status === "Blocked" ? "Active" : "Blocked";
    try {
      await customersAPI.updateStatus(customer.id, newStatus);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Active: "customer-status-active",
      Inactive: "customer-status-inactive",
      Blocked: "customer-status-blocked",
    };
    return styles[status] || "customer-status-active";
  };

  const filtered = customers.filter((c) => {
    if (statusFilter === "All Status") return true;
    return (c.status || "Active") === statusFilter;
  });

  const activeCount = customers.filter((c) => (c.status || "Active") === "Active").length;
  const newCount = customers.filter((c) => {
    const joinedDate = new Date(c.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return joinedDate >= sevenDaysAgo;
  }).length;

  return (
    <div className="customers-page">
      <div className="page-heading">
        <div>
          <h1>Customers</h1>
          <p>Manage House of Phones customers and their activity.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="customers-stats">
        <div className="customer-stat-card">
          <div className="customer-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat-icon green">
            <Users size={21} />
          </div>
          <div>
            <span>New (Last 7 Days)</span>
            <strong>{newCount}</strong>
          </div>
        </div>
        <div className="customer-stat-card">
          <div className="customer-stat-icon purple">
            <Users size={21} />
          </div>
          <div>
            <span>Active Customers</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
      </div>

      <div className="customers-toolbar">
        <div className="customers-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="customers-toolbar-right">
          <select
            className="customers-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Blocked</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="customers-card">
        {loading ? (
          <div className="customers-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="customers-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>
                    <span className={`customer-status ${getStatusClass(customer.status || "Active")}`}>
                      {customer.status || "Active"}
                    </span>
                  </td>
                  <td>{customer.orders?.length || customer._count?.orders || 0}</td>
                  <td className="customer-joined">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="customer-actions">
                      <button
                        className="customer-action-btn"
                        title="View Details"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowModal(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      {customer.status === "Blocked" ? (
                        <button
                          className="customer-action-btn"
                          title="Unblock"
                          onClick={() => handleStatusToggle(customer)}
                        >
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button
                          className="customer-action-btn"
                          title="Block"
                          onClick={() => handleStatusToggle(customer)}
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="customers-empty">
            <div className="customers-empty-icon">
              <Users size={28} />
            </div>
            <h2>No customers to display</h2>
            <p>Customers who create accounts or place orders will appear here.</p>
          </div>
        )}
      </div>

      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 12 }}>
              <div><strong>Name:</strong> {selectedCustomer.name}</div>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Phone:</strong> {selectedCustomer.phone || "Not provided"}</div>
              <div><strong>Status:</strong> {selectedCustomer.status || "Active"}</div>
              <div><strong>Joined:</strong> {new Date(selectedCustomer.createdAt).toLocaleString("en-IN")}</div>
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div>
                  <strong>Addresses:</strong>
                  <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
                    {selectedCustomer.addresses.map((a: any) => (
                      <li key={a.id}>{a.street}, {a.city}, {a.state} - {a.pincode}</li>
                    ))}
                  </ul>
                </div>
              )}
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
