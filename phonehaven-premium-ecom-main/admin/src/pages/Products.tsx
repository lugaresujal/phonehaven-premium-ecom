import {
  Package, Plus, Search, Eye, Edit, Trash2, Copy, X, Loader2, Smartphone, Headphones
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { productsAPI, brandsAPI, categoriesAPI } from "../services/cms-api";
import { getAccessoryImage } from "../lib/accessory-image-map";
import { ImageUploader } from "../components/common/ImageUploader";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=100&q=80";

const EMPTY_FORM = {
  name: "",
  sku: "",
  price: "",
  mrp: "",
  stock: "10",
  type: "Shop",
  brand: "",
  category: "",
  image: "",
  description: "",
  status: "Active"
};

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "All" && statusFilter !== "All Status") params.status = statusFilter;
      if (typeFilter !== "All" && typeFilter !== "All Types") params.type = typeFilter;
      if (categoryFilter !== "All Categories" && categoryFilter !== "All") params.category = categoryFilter;

      const [pRes, bRes, cRes] = await Promise.all([
        productsAPI.getAll(params),
        brandsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setProducts((pRes as any).products || []);
      setBrands((bRes as any).brands || []);
      setCategories((cRes as any).categories || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const availableCategories = useMemo(() => {
    if (typeFilter === "Shop") {
      return categories.filter((c) => c.name.toLowerCase().includes("phone") || c.name.toLowerCase().includes("smart") || c.name === "Smartphones");
    }
    if (typeFilter === "Accessories") {
      return categories.filter((c) => c.name !== "Smartphones");
    }
    return categories;
  }, [categories, typeFilter]);

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    setCategoryFilter("All Categories");
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name || "",
      sku: p.sku || "",
      price: String(p.price || ""),
      mrp: String(p.mrp || ""),
      stock: String(p.stock ?? 0),
      type: p.type || (p.category?.name === "Smartphones" ? "Shop" : "Accessories"),
      brand: p.brandId || "",
      category: p.categoryId || "",
      image: p.image || "",
      description: p.description || "",
      status: p.status || "Active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (!form.price) {
      setFormError("Price is required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        stock: Number(form.stock || 0),
        type: form.type || "Shop",
        brandId: form.brand || undefined,
        categoryId: form.category || undefined,
        image: form.image || undefined,
        description: form.description || undefined,
        status: form.status,
      };

      if (editProduct) {
        await productsAPI.update(editProduct.id, payload);
      } else {
        await productsAPI.create(payload);
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await productsAPI.delete(p.id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const formatINR = (n: number) => "INR " + Number(n).toLocaleString("en-IN");
  const getStatusClass = (s: string) =>
    ({ Active: "product-status-active", Inactive: "product-status-inactive", Draft: "product-status-draft" }[s] || "");

  const shopCount = products.filter((p) => p.type === "Shop" || p.category?.name === "Smartphones").length;
  const accessoriesCount = products.filter((p) => p.type === "Accessories" || p.category?.name !== "Smartphones").length;

  return (
    <div className="products-page">
      <div className="page-heading products-heading">
        <div>
          <h1>Products Catalog</h1>
          <p>Manage all customer-facing Shop smartphones and Accessories inventory.</p>
        </div>
        <button type="button" className="primary-button" onClick={openAdd}>
          <Plus size={17} /> Add Product
        </button>
      </div>

      <div className="products-stats">
        <div className="product-stat-card">
          <div className="product-stat-icon blue"><Package size={21} /></div>
          <div><span>Total Displayed</span><strong>{products.length}</strong></div>
        </div>
        <div className="product-stat-card">
          <div className="product-stat-icon green"><Smartphone size={21} /></div>
          <div><span>Shop Products</span><strong>{shopCount}</strong></div>
        </div>
        <div className="product-stat-card">
          <div className="product-stat-icon purple"><Headphones size={21} /></div>
          <div><span>Accessories</span><strong>{accessoriesCount}</strong></div>
        </div>
        <div className="product-stat-card">
          <div className="product-stat-icon yellow"><Package size={21} /></div>
          <div><span>Out of Stock</span><strong>{products.filter((p) => p.stock === 0).length}</strong></div>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by product name, SKU, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="products-toolbar-right" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="products-filter-select"
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Shop">Shop</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select
            className="products-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="products-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="products-card">
        {loading ? (
          <div className="products-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="products-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>Retry</button>
          </div>
        ) : products.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Type</th>
                <th>Brand</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isShop = product.type === "Shop" || product.category?.name === "Smartphones";
                return (
                  <tr key={product.id}>
                    <td className="product-name">
                      <img
                        src={(!isShop ? getAccessoryImage(product) : null) || product.image || FALLBACK_IMAGE}
                        alt=""
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: "cover",
                          borderRadius: 6,
                          marginRight: 10,
                          verticalAlign: "middle",
                          border: "1px solid rgba(255,255,255,0.1)",
                          backgroundColor: "#1e293b",
                        }}
                      />
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                          backgroundColor: isShop ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
                          color: isShop ? "#60a5fa" : "#c084fc",
                        }}
                      >
                        {isShop ? "Shop" : "Accessories"}
                      </span>
                    </td>
                    <td>{product.brand?.name || "—"}</td>
                    <td>{product.category?.name || "—"}</td>
                    <td className="product-sku">{product.sku || "—"}</td>
                    <td className="product-price">{formatINR(product.price)}</td>
                    <td className="product-stock">
                      <span style={{ color: product.stock === 0 ? "#ef4444" : "inherit", fontWeight: product.stock === 0 ? "bold" : "normal" }}>
                        {product.stock} {product.stock === 0 ? "(Out)" : "units"}
                      </span>
                    </td>
                    <td>
                      <span className={`product-status ${getStatusClass(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="product-action-btn"
                          title="View on Customer Site"
                          onClick={() => window.open(`http://localhost:5173/product/${product.slug}`, "_blank")}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Edit"
                          onClick={() => openEdit(product)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Duplicate"
                          onClick={() => {
                            setForm({
                              name: product.name + " (Copy)",
                              sku: "",
                              price: String(product.price),
                              mrp: String(product.mrp || product.price),
                              stock: "0",
                              type: product.type || (isShop ? "Shop" : "Accessories"),
                              brand: product.brandId || "",
                              category: product.categoryId || "",
                              image: (!isShop ? getAccessoryImage(product) : null) || product.image || "",
                              description: product.description || "",
                              status: "Draft",
                            });
                            setEditProduct(null);
                            setShowModal(true);
                          }}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Delete"
                          onClick={() => handleDelete(product)}
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
          <div className="products-empty">
            <div className="products-empty-icon"><Package size={28} /></div>
            <h2>No products found</h2>
            <p>Try adjusting your search query or filter options.</p>
            <div className="products-empty-actions">
              <button
                type="button"
                className="categories-empty-action-btn"
                onClick={() => {
                  setTypeFilter("All");
                  setCategoryFilter("All Categories");
                  setStatusFilter("All");
                  setSearch("");
                }}
              >
                Reset All Filters
              </button>
              <button type="button" className="primary-button" onClick={openAdd}>
                <Plus size={17} /> Add Product
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}

              <div className="settings-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. iPhone 16 Pro 128GB"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="Shop">Shop (Phone)</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>Price (INR) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="79900"
                  />
                </div>
                <div className="settings-form-group">
                  <label>MRP (INR)</label>
                  <input
                    type="number"
                    value={form.mrp}
                    onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                    placeholder="89900"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="settings-form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="IP16-128"
                  />
                </div>
                <div className="settings-form-group">
                  <label>Stock (Units)</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="settings-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <ImageUploader
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                label="Product Image"
              />

              <div className="settings-form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="categories-empty-action-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : null}
                {editProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
