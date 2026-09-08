import { Boxes, Search, TrendingDown, TrendingUp, AlertTriangle, Loader2, X, Minus, Plus, PackageX } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { inventoryAPI } from "../services/cms-api";
import { getAccessoryImage } from "../lib/accessory-image-map";

export function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [adjustMode, setAdjustMode] = useState<"adjust" | "set">("adjust");
  const [quickAdjusting, setQuickAdjusting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const r = await inventoryAPI.getAll({ ...(search ? { search } : {}), ...(stockFilter !== "All" ? { stockStatus: stockFilter } : {}) });
      setProducts((r as any).products || []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [search, stockFilter]);
  useEffect(() => { load(); }, [load]);

  const openAdjust = async (p: any) => {
    setSelectedProduct(p); setChange(""); setReason(""); setAdjustMode("adjust"); setShowModal(true);
    try { const r = await inventoryAPI.getLogs(p.id); setLogs((r as any).logs || []); } catch { setLogs([]); }
  };

  const handleQuickAdjust = async (p: any, delta: number, label: string) => {
    setQuickAdjusting(p.id + label);
    try {
      await inventoryAPI.adjustStock(p.id, { change: delta, reason: label, staffNote: label });
      load();
    } catch (e: any) { alert(e.message); } finally { setQuickAdjusting(null); }
  };

  const handleAdjust = async () => {
    if (adjustMode === "set") {
      const target = Number(change);
      if (isNaN(target) || target < 0) return;
      const delta = target - selectedProduct.stock;
      if (delta === 0) { setShowModal(false); return; }
      setSaving(true);
      try {
        await inventoryAPI.adjustStock(selectedProduct.id, { change: delta, reason: reason || `Set stock to ${target}`, staffNote: reason || `Set stock to ${target}` });
        setShowModal(false); load();
      } catch (e: any) { alert(e.message); } finally { setSaving(false); }
    } else {
      if (!change) return;
      setSaving(true);
      try {
        await inventoryAPI.adjustStock(selectedProduct.id, { change: Number(change), reason, staffNote: reason });
        setShowModal(false); load();
      } catch (e: any) { alert(e.message); } finally { setSaving(false); }
    }
  };

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const stockTag = (stock: number) => {
    if (stock === 0) return <span className="inventory-status inventory-status-out">Out of Stock</span>;
    if (stock <= 5) return <span className="inventory-status inventory-status-low">Low Stock</span>;
    return <span className="inventory-status inventory-status-stock">In Stock</span>;
  };

  return (
    <div className="inventory-page">
      <div className="page-heading inventory-heading">
        <div><h1>Inventory</h1><p>Track and manage stock levels for all products.</p></div>
      </div>
      <div className="inventory-stats">
        <div className="inventory-stat-card"><div className="inventory-stat-icon blue"><Boxes size={20} /></div><div><strong>{products.length}</strong><span>Total Products</span></div></div>
        <div className="inventory-stat-card"><div className="inventory-stat-icon green"><TrendingUp size={20} /></div><div><strong>{products.filter(p => p.stock > 5).length}</strong><span>In Stock</span></div></div>
        <div className="inventory-stat-card"><div className="inventory-stat-icon yellow"><AlertTriangle size={20} /></div><div><strong>{lowStock}</strong><span>Low Stock</span></div></div>
        <div className="inventory-stat-card"><div className="inventory-stat-icon red"><TrendingDown size={20} /></div><div><strong>{outOfStock}</strong><span>Out of Stock</span></div></div>
      </div>
      <div className="inventory-toolbar">
        <div className="inventory-search"><Search size={18} /><input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="inventory-toolbar-right">
          <select className="inventory-filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}><option value="All">All Stock</option><option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out of Stock</option></select>
        </div>
      </div>
      <div className="inventory-card">
        {loading ? (<div className="inventory-empty"><Loader2 size={28} className="spin" /><p>Loading inventory...</p></div>)
        : error ? (<div className="inventory-empty"><p style={{ color: "red" }}>{error}</p><button className="primary-button" onClick={load}>Retry</button></div>)
        : products.length > 0 ? (
          <table className="inventory-table"><thead><tr><th>Product Name</th><th>SKU</th><th>Current Stock</th><th>Status</th><th>Quick Actions</th><th>More</th></tr></thead>
            <tbody>{products.map(p => (
              <tr key={p.id}>
                <td className="inventory-name">{(() => { const img = getAccessoryImage(p) || p.image; return img ? <img src={img} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4, marginRight: 8, verticalAlign: "middle" }} /> : null; })()}{p.name}</td>
                <td>{p.sku || "—"}</td>
                <td><strong style={{ fontSize: 16 }}>{p.stock}</strong></td>
                <td>{stockTag(p.stock)}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      className="inv-qty-btn inv-qty-dec"
                      disabled={quickAdjusting === p.id + "dec" || p.stock <= 0}
                      onClick={() => handleQuickAdjust(p, -1, "dec")}
                      title="Decrease by 1"
                    >
                      {quickAdjusting === p.id + "dec" ? <Loader2 size={13} className="spin" /> : <Minus size={13} />}
                    </button>
                    <span className="inv-qty-display">{p.stock}</span>
                    <button
                      className="inv-qty-btn inv-qty-inc"
                      disabled={quickAdjusting === p.id + "inc"}
                      onClick={() => handleQuickAdjust(p, 1, "inc")}
                      title="Increase by 1"
                    >
                      {quickAdjusting === p.id + "inc" ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
                    </button>
                    <button
                      className="inv-qty-btn inv-qty-zero"
                      disabled={p.stock === 0 || quickAdjusting === p.id + "zero"}
                      onClick={() => handleQuickAdjust(p, -p.stock, "Set to 0")}
                      title="Set to 0 (Out of Stock)"
                    >
                      {quickAdjusting === p.id + "zero" ? <Loader2 size={13} className="spin" /> : <PackageX size={13} />}
                    </button>
                  </div>
                </td>
                <td>
                  <button className="inventory-action-btn" onClick={() => openAdjust(p)}>Adjust</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div className="inventory-empty"><div className="inventory-empty-icon"><Boxes size={28} /></div><h2>No products found</h2><p>Try adjusting your search query or filter options.</p></div>
        )}
      </div>
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h2>Adjust Stock: {selectedProduct.name}</h2><button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button></div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f9fa", padding: "12px 16px", borderRadius: 8 }}>
                <span style={{ color: "#555", fontSize: 13 }}>Current Stock</span>
                <strong style={{ fontSize: 22 }}>{selectedProduct.stock}</strong>
              </div>

              <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid #e1e4e8" }}>
                <button
                  style={{ flex: 1, padding: "8px 0", border: "none", background: adjustMode === "adjust" ? "#111" : "#f8f9fa", color: adjustMode === "adjust" ? "#fff" : "#555", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
                  onClick={() => { setAdjustMode("adjust"); setChange(""); }}
                >Adjust By</button>
                <button
                  style={{ flex: 1, padding: "8px 0", border: "none", background: adjustMode === "set" ? "#111" : "#f8f9fa", color: adjustMode === "set" ? "#fff" : "#555", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
                  onClick={() => { setAdjustMode("set"); setChange(""); }}
                >Set Stock</button>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#777", fontWeight: 500 }}>Quick Adjust</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[{ v: -10, l: "-10" }, { v: -5, l: "-5" }, { v: -1, l: "-1" }, { v: 1, l: "+1" }, { v: 5, l: "+5" }, { v: 10, l: "+10" }].map(q => (
                    <button
                      key={q.v}
                      className={`inv-preset-btn ${q.v > 0 ? "positive" : "negative"}`}
                      onClick={() => {
                        if (adjustMode === "set") {
                          const target = Math.max(0, selectedProduct.stock + q.v);
                          setChange(String(target));
                        } else {
                          setChange(String(q.v));
                        }
                      }}
                    >{q.l}</button>
                  ))}
                  <button
                    className="inv-preset-btn zero"
                    disabled={selectedProduct.stock === 0}
                    onClick={() => {
                      if (adjustMode === "set") { setChange("0"); }
                      else { setChange(String(-selectedProduct.stock)); }
                    }}
                  >Out of Stock</button>
                </div>
              </div>

              {adjustMode === "adjust" ? (
                <div className="settings-form-group">
                  <label>Quantity Change (negative to reduce)</label>
                  <input type="number" value={change} onChange={e => setChange(e.target.value)} placeholder="e.g. 10 or -5" />
                </div>
              ) : (
                <div className="settings-form-group">
                  <label>Set Stock To</label>
                  <input type="number" value={change} onChange={e => setChange(e.target.value)} placeholder="e.g. 50" min="0" />
                  {change && !isNaN(Number(change)) && (
                    <span style={{ fontSize: 12, color: "#777", marginTop: 2, display: "block" }}>
                      Will {Number(change) > selectedProduct.stock ? "add" : "remove"} {Math.abs(Number(change) - selectedProduct.stock)} units
                    </span>
                  )}
                </div>
              )}

              <div className="settings-form-group">
                <label>Reason</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Stock received, damaged, sold, etc." />
              </div>

              {logs.length > 0 && (
                <div><strong style={{ fontSize: 13 }}>Recent Logs</strong>
                  <table style={{ width: "100%", fontSize: 12, marginTop: 6 }}>
                    <thead><tr><th>Change</th><th>Reason</th><th>Date</th></tr></thead>
                    <tbody>{logs.slice(0, 5).map((l: any) => (<tr key={l.id}><td>{l.change > 0 ? "+" : ""}{l.change}</td><td>{l.reason || "—"}</td><td>{new Date(l.createdAt).toLocaleDateString()}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-button" onClick={handleAdjust} disabled={saving || !change}>{saving ? <Loader2 size={16} className="spin" /> : null}{adjustMode === "set" ? "Set Stock" : "Apply Adjustment"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
