import {
  IndianRupee,
  ShoppingCart,
  Users,
  Clock,
  Package,
  Eye,
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  dashboardAPI,
  type DashboardStats,
  type Order,
} from "../services/api";

interface SalesDataPoint {
  date: string;
  sales: number;
  label: string;
}

interface TopProduct {
  name: string;
  brand: string;
  image: string;
  qty: number;
  revenue: number;
}

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#10b981",
  Processing: "#f59e0b",
  Shipped: "#3b82f6",
  Confirmed: "#6366f1",
  Cancelled: "#ef4444",
  Packed: "#8b5cf6",
  "Out for Delivery": "#06b6d4",
  Pending: "#6b7280",
  "Cancellation Requested": "#f43f5e",
};

const PIE_COLORS = [
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#6366f1",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#6b7280",
  "#f43f5e",
];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    customers: 0,
    products: 0,
    statusBreakdown: {},
    recentOrders: [],
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("all");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, ordersRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getOrders(),
      ]);
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (ordersRes && ordersRes.orders) {
        setAllOrders(ordersRes.orders);
      }
    } catch (err: any) {
      console.error("Dashboard failed to load:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (val: number | undefined | null) => {
    return `₹${Number(val || 0).toLocaleString("en-IN")}`;
  };

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return allOrders;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateRange === "month") {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (dateRange === "year") {
      cutoff.setFullYear(now.getFullYear() - 1);
    }
    return allOrders.filter((o) => new Date(o.date || o.createdAt) >= cutoff);
  }, [allOrders, dateRange]);

  // Compute sales over time
  const salesOverTime = useMemo<SalesDataPoint[]>(() => {
    const salesMap = new Map<string, number>();
    filteredOrders.forEach((order) => {
      if (order.status === "Cancelled") return;
      const d = new Date(order.date || order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      salesMap.set(key, (salesMap.get(key) || 0) + Number(order.total || 0));
    });
    const points: SalesDataPoint[] = [];
    salesMap.forEach((sales, date) => {
      const d = new Date(date);
      points.push({
        date,
        sales,
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      });
    });
    points.sort((a, b) => a.date.localeCompare(b.date));
    if (points.length === 0) {
      return [{ date: "No Data", sales: 0, label: "No Data" }];
    }
    // If too many points, aggregate by week
    if (points.length > 20) {
      const weekMap = new Map<string, { sales: number; label: string }>();
      points.forEach((p) => {
        const d = new Date(p.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split("T")[0];
        const existing = weekMap.get(key);
        if (existing) {
          existing.sales += p.sales;
        } else {
          weekMap.set(key, {
            sales: p.sales,
            label: weekStart.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
          });
        }
      });
      const result: SalesDataPoint[] = [];
      weekMap.forEach((val, key) => {
        result.push({ date: key, sales: val.sales, label: val.label });
      });
      result.sort((a, b) => a.date.localeCompare(b.date));
      return result;
    }
    return points;
  }, [filteredOrders]);

  // Compute top selling products
  const topProducts = useMemo<TopProduct[]>(() => {
    const productMap = new Map<
      string,
      { name: string; brand: string; image: string; qty: number; revenue: number }
    >();
    filteredOrders.forEach((order) => {
      if (order.status === "Cancelled") return;
      (order.items || []).forEach((item) => {
        const key = item.productId || item.name;
        const existing = productMap.get(key);
        if (existing) {
          existing.qty += item.qty || 1;
          existing.revenue += (item.price || 0) * (item.qty || 1);
        } else {
          productMap.set(key, {
            name: item.name,
            brand: item.brand,
            image: item.image,
            qty: item.qty || 1,
            revenue: (item.price || 0) * (item.qty || 1),
          });
        }
      });
    });
    const products = Array.from(productMap.values());
    products.sort((a, b) => b.revenue - a.revenue);
    return products.slice(0, 5);
  }, [filteredOrders]);

  // Compute order status for donut chart
  const orderStatusData = useMemo<OrderStatusData[]>(() => {
    if (!stats.statusBreakdown) return [];
    return Object.entries(stats.statusBreakdown)
      .filter(([, count]) => Number(count) > 0)
      .map(([name, count], i) => ({
        name,
        value: Number(count),
        color: STATUS_COLORS[name] || PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [stats.statusBreakdown]);

  // KPI values from filtered data
  const kpiData = useMemo(() => {
    const pendingCount =
      (stats.counts?.pending || 0) +
      (stats.counts?.processing || 0) +
      (stats.counts?.confirmed || 0);
    return {
      totalOrders: filteredOrders.length,
      totalSales: filteredOrders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
      customers: stats.customers,
      pendingOrders: pendingCount,
    };
  }, [filteredOrders, stats]);

  return (
    <div className="db-page">
      {/* Header */}
      <div className="db-header">
        <div className="db-header-left">
          <h1 className="db-title">Dashboard</h1>
          <p className="db-subtitle">Welcome to House of Phones Admin Panel.</p>
        </div>
        <div className="db-header-right">
          <div className="db-date-filter">
            {(
              [
                ["week", "This Week"],
                ["month", "This Month"],
                ["year", "This Year"],
                ["all", "All Time"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                className={`db-date-btn${dateRange === key ? " active" : ""}`}
                onClick={() => setDateRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className="db-refresh-btn"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="db-error">
          <div>
            <strong>Error loading dashboard:</strong> {error}
          </div>
          <button className="db-error-retry" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="db-kpi-row">
        <div className="db-kpi-card">
          <div className="db-kpi-icon orders">
            <ShoppingCart size={22} />
          </div>
          <div className="db-kpi-info">
            <span className="db-kpi-label">Total Orders</span>
            <strong className="db-kpi-value">{kpiData.totalOrders}</strong>
          </div>
        </div>

        <div className="db-kpi-card">
          <div className="db-kpi-icon sales">
            <IndianRupee size={22} />
          </div>
          <div className="db-kpi-info">
            <span className="db-kpi-label">Total Sales</span>
            <strong className="db-kpi-value">{formatCurrency(kpiData.totalSales)}</strong>
          </div>
        </div>

        <div className="db-kpi-card">
          <div className="db-kpi-icon customers">
            <Users size={22} />
          </div>
          <div className="db-kpi-info">
            <span className="db-kpi-label">Total Customers</span>
            <strong className="db-kpi-value">{kpiData.customers}</strong>
          </div>
        </div>

        <div className="db-kpi-card">
          <div className="db-kpi-icon pending">
            <Clock size={22} />
          </div>
          <div className="db-kpi-info">
            <span className="db-kpi-label">Pending Orders</span>
            <strong className="db-kpi-value">{kpiData.pendingOrders}</strong>
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Overview + Recent Orders */}
      <div className="db-grid-2col">
        {/* Sales Overview */}
        <div className="db-panel">
          <div className="db-panel-header">
            <h2 className="db-panel-title">
              <TrendingUp size={18} style={{ marginRight: 8 }} />
              Sales Overview
            </h2>
          </div>
          <div className="db-panel-body chart-body">
            {salesOverTime.length > 0 && salesOverTime[0].date !== "No Data" ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F2219" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2F2219" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2F2219"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="db-empty">
                <TrendingUp size={36} />
                <p>Sales data will appear here once orders are placed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="db-panel">
          <div className="db-panel-header">
            <h2 className="db-panel-title">Order Status</h2>
            <Link to="/orders" className="db-panel-link">
              <Eye size={16} />
            </Link>
          </div>
          <div className="db-panel-body chart-body">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="42%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} orders`, name]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={44}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: 12, color: "#555" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="db-empty">
                <PieChartIcon size={36} />
                <p>Order status data will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Selling Products + Recent Orders */}
      <div className="db-grid-2col">
        {/* Top Selling Products */}
        <div className="db-panel">
          <div className="db-panel-header">
            <h2 className="db-panel-title">
              <Package size={18} style={{ marginRight: 8 }} />
              Top Selling Products
            </h2>
          </div>
          <div className="db-panel-body">
            {topProducts.length > 0 ? (
              <div className="db-top-products">
                {topProducts.map((product, i) => (
                  <div key={i} className="db-top-product-item">
                    <div className="db-top-product-img">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <Package size={20} color="#999" />
                      )}
                    </div>
                    <div className="db-top-product-info">
                      <span className="db-top-product-name">{product.name}</span>
                      <span className="db-top-product-brand">{product.brand}</span>
                    </div>
                    <div className="db-top-product-stats">
                      <span className="db-top-product-qty">{product.qty} sold</span>
                      <span className="db-top-product-revenue">{formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-empty">
                <Package size={36} />
                <p>Top selling products will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="db-panel">
          <div className="db-panel-header">
            <h2 className="db-panel-title">Recent Orders</h2>
            <Link to="/orders" className="db-panel-link">
              <Eye size={16} />
            </Link>
          </div>
          <div className="db-panel-body">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="db-orders-list">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.orderId || order.id} className="db-order-item">
                    <div className="db-order-left">
                      <span className="db-order-id">#{order.orderId || order.id}</span>
                      <span className="db-order-customer">
                        {order.customerName || order.address?.fullName || "Customer"}
                      </span>
                    </div>
                    <div className="db-order-right">
                      <span className="db-order-amount">{formatCurrency(order.total)}</span>
                      <span
                        className="db-order-status"
                        style={{
                          backgroundColor: getStatusBg(order.status),
                          color: getStatusText(order.status),
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-empty">
                <Clock size={36} />
                <p>Recent orders will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    Confirmed: "#e0e7ff",
    Processing: "#fef3c7",
    Delivered: "#d1fae5",
    Cancelled: "#fee2e2",
    Shipped: "#dbeafe",
    Packed: "#ede9fe",
    "Out for Delivery": "#cffafe",
    Pending: "#f3f4f6",
    "Cancellation Requested": "#ffe4e6",
  };
  return map[status] || "#f3f4f6";
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    Confirmed: "#4338ca",
    Processing: "#b45309",
    Delivered: "#065f46",
    Cancelled: "#991b1b",
    Shipped: "#1d4ed8",
    Packed: "#5b21b6",
    "Out for Delivery": "#0e7490",
    Pending: "#374151",
    "Cancellation Requested": "#be123c",
  };
  return map[status] || "#374151";
}
