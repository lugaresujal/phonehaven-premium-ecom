import {
  Package, Plus, Search, Eye, Edit, Trash2, Copy, X, Loader2, Smartphone, Headphones, Palette, Check, Cpu, AlignLeft, Images, Upload
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { productsAPI, brandsAPI, categoriesAPI, uploadImage } from "../services/cms-api";
import { getAccessoryImage } from "../lib/accessory-image-map";
import { ImageUploader } from "../components/common/ImageUploader";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=100&q=80";

const PRESET_COLORS = [
  "Black", "White", "Blue", "Green", "Red", "Pink", "Orange", "Purple", "Yellow",
  "Silver", "Gold", "Gray", "Graphite", "Titanium", "Natural Titanium", "Desert Titanium",
  "Rose Gold", "Sky Blue", "Light Blue", "Dark Blue", "Navy Blue",
  "Mint Green", "Forest Green", "Lavender", "Violet",
  "Cream", "Beige", "Brown", "Bronze", "Copper", "Coral", "Teal",
  "Midnight", "Starlight",
];

const COLOR_HEX: Record<string, string> = {
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Blue": "#3b82f6",
  "Green": "#22c55e",
  "Red": "#ef4444",
  "Pink": "#ec4899",
  "Orange": "#f97316",
  "Purple": "#a855f7",
  "Yellow": "#eab308",
  "Silver": "#c0c0c0",
  "Gold": "#d4a017",
  "Gray": "#6b7280",
  "Graphite": "#4b5563",
  "Titanium": "#8a8d93",
  "Natural Titanium": "#b0b3b8",
  "Desert Titanium": "#c2a67a",
  "Rose Gold": "#b76e79",
  "Sky Blue": "#87ceeb",
  "Light Blue": "#93c5fd",
  "Dark Blue": "#1e3a5f",
  "Navy Blue": "#1e3a8a",
  "Mint Green": "#98fb98",
  "Forest Green": "#228b22",
  "Lavender": "#b57edc",
  "Violet": "#7c3aed",
  "Cream": "#fffdd0",
  "Beige": "#f5f5dc",
  "Brown": "#8b4513",
  "Bronze": "#cd7f32",
  "Copper": "#b87333",
  "Coral": "#ff7f50",
  "Teal": "#0d9488",
  "Midnight": "#191970",
  "Starlight": "#f5e6cc",
};

const LIGHT_COLORS = new Set(["White", "Silver", "Sky Blue", "Light Blue", "Cream", "Beige", "Mint Green", "Starlight", "Natural Titanium", "Rose Gold"]);
const PRESET_RAM = ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB"];
const PRESET_STORAGE = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];

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
  shortDescription: "",
  description: "",
  status: "Active"
};

function ChipSelector({ label, icon, options, selected, onChange }: {
  label: string;
  icon?: React.ReactNode;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };
  return (
    <div className="settings-form-group">
      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
        {icon} {label}
        {selected.length > 0 && (
          <span style={{
            fontSize: 10,
            background: "rgba(99,102,241,0.15)",
            color: "var(--primary)",
            padding: "2px 8px",
            borderRadius: 10,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}>
            {selected.length} selected
          </span>
        )}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 8,
                border: active ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                background: active
                  ? "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.08))"
                  : "var(--card)",
                color: active ? "var(--primary)" : "var(--foreground)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: active
                  ? "0 1px 3px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 1px 2px rgba(0,0,0,0.04)",
                transform: active ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.background = "rgba(99,102,241,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--card)";
                }
              }}
            >
              {active && <Check size={13} strokeWidth={2.5} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [variantPricing, setVariantPricing] = useState<Record<string, { price: string; mrp: string; stock: string }>>({});
  const [removedCombos, setRemovedCombos] = useState<Set<string>>(new Set());
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [colorUrlInputs, setColorUrlInputs] = useState<Record<string, string>>({});
  const colorFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync colorImages with selectedColors
  useEffect(() => {
    setColorImages((prev) => {
      const next: Record<string, string[]> = {};
      for (const c of selectedColors) {
        next[c] = prev[c] || [];
      }
      const prevKeys = Object.keys(prev).sort().join(",");
      const nextKeys = Object.keys(next).sort().join(",");
      if (prevKeys !== nextKeys) return next;
      return prev;
    });
  }, [selectedColors]);

  const removeCombo = (key: string) => {
    setRemovedCombos((prev) => new Set([...prev, key]));
    setVariantPricing((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Auto-generate variant pricing combos when RAM/Storage chips change
  useEffect(() => {
    if (form.type !== "Shop" || selectedRam.length === 0 || selectedStorage.length === 0) {
      if (Object.keys(variantPricing).length > 0) setVariantPricing({});
      return;
    }
    const newKeys = new Set<string>();
    const next: Record<string, { price: string; mrp: string; stock: string }> = {};
    for (const r of selectedRam) {
      for (const s of selectedStorage) {
        const key = `${r}|${s}`;
        if (removedCombos.has(key)) continue;
        newKeys.add(key);
        next[key] = variantPricing[key] || {
          price: form.price || "",
          mrp: form.mrp || form.price || "",
          stock: form.stock || "10",
        };
      }
    }
    // Only update if keys actually changed
    const prevKeys = Object.keys(variantPricing).sort().join(",");
    const nextKeys = Object.keys(next).sort().join(",");
    if (prevKeys !== nextKeys) {
      setVariantPricing(next);
    }
  }, [selectedRam, selectedStorage, form.type, removedCombos]);

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
    setSelectedColors([]);
    setSelectedRam([]);
    setSelectedStorage([]);
    setVariantPricing({});
    setRemovedCombos(new Set());
    setColorImages({});
    setColorUrlInputs({});
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
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      status: p.status || "Active",
    });
    setFormError("");
    setSelectedColors(Array.isArray(p.colors) ? p.colors : []);
    if (Array.isArray(p.ram)) {
      setSelectedRam(p.ram);
    } else if (typeof p.ram === "string" && p.ram) {
      setSelectedRam(p.ram.split(",").map((s: string) => s.trim()).filter(Boolean));
    } else {
      setSelectedRam([]);
    }
    setSelectedStorage(Array.isArray(p.storage) ? p.storage : []);
    // Load existing variant pricing
    const loaded: Record<string, { price: string; mrp: string; stock: string }> = {};
    if (Array.isArray(p.variants)) {
      for (const v of p.variants) {
        if (v.ram && v.storage) {
          const key = `${v.ram}|${v.storage}`;
          loaded[key] = {
            price: String(v.price ?? ""),
            mrp: String(v.mrp ?? ""),
            stock: String(v.stock ?? "10"),
          };
        }
      }
    }
    setVariantPricing(loaded);
    // Load existing color variant images
    const loadedColorImages: Record<string, string[]> = {};
    if (Array.isArray(p.colorVariants)) {
      for (const cv of p.colorVariants) {
        if (cv.colorName && Array.isArray(cv.images) && cv.images.length > 0) {
          loadedColorImages[cv.colorName] = cv.images;
        }
      }
    }
    setColorImages(loadedColorImages);
    setRemovedCombos(new Set());
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
      // Build variants array from variant pricing state
      const variants = [];
      if (form.type === "Shop" && selectedRam.length > 0 && selectedStorage.length > 0) {
        for (const key of Object.keys(variantPricing)) {
          const vp = variantPricing[key];
          if (vp && vp.price) {
            const [r, s] = key.split("|");
            variants.push({
              ram: r,
              storage: s,
              price: Number(vp.price),
              mrp: Number(vp.mrp || vp.price),
              stock: Number(vp.stock || 0),
            });
          }
        }
      }

      const payload: Record<string, any> = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        stock: Number(form.stock || 0),
        type: form.type || "Shop",
        brandId: form.brand || undefined,
        categoryId: form.category || undefined,
        image: form.image || undefined,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        colors: selectedColors,
        ram: selectedRam.length > 0 ? selectedRam.join(", ") : undefined,
        storage: selectedStorage,
        variants: variants.length > 0 ? variants : [],
        status: form.status,
      };

      let productId: string;
      if (editProduct) {
        await productsAPI.update(editProduct.id, payload);
        productId = editProduct.id;
      } else {
        const res = await productsAPI.create(payload);
        productId = res.product?.id;
      }

      // Save color-specific images via existing API
      if (productId && form.type === "Shop" && selectedColors.length > 0) {
        const colorVariantsPayload = selectedColors.map((c) => ({
          colorName: c,
          images: colorImages[c] || [],
          stock: 0,
        }));
        await productsAPI.saveColorVariants(productId, colorVariantsPayload);
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
            <p style={{ color: "#dc2626" }}>{error}</p>
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
                <th>Colors</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isShop = product.type === "Shop" || product.category?.name === "Smartphones";
                const productColors: string[] = Array.isArray(product.colors) ? product.colors : [];
                return (
                  <tr key={product.id}>
                    <td className="product-name">
                      <img
                        src={(!isShop ? getAccessoryImage(product) : null) || product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        style={{
                          width: 48,
                          height: 48,
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
                          color: isShop ? "#1d4ed8" : "#7c3aed",
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
                      {productColors.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                          {productColors.slice(0, 4).map((c: string) => (
                            <span
                              key={c}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                lineHeight: 1,
                              }}
                              title={c}
                            >
                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  background: COLOR_HEX[c] || "#999",
                                  border: LIGHT_COLORS.has(c) ? "1px solid #d1d5db" : "1px solid transparent",
                                  flexShrink: 0,
                                  display: "inline-block",
                                }}
                                aria-hidden="true"
                              />
                              <span style={{ whiteSpace: "nowrap" }}>{c}</span>
                            </span>
                          ))}
                          {productColors.length > 4 && (
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                              +{productColors.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>—</span>
                      )}
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
                          aria-label="View on Customer Site"
                          onClick={() => window.open(`http://localhost:5173/product/${product.slug}`, "_blank")}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Edit"
                          aria-label="Edit Product"
                          onClick={() => openEdit(product)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Duplicate"
                          aria-label="Duplicate Product"
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
                              shortDescription: product.shortDescription || "",
                              description: product.description || "",
                              status: "Draft",
                            });
                            setEditProduct(null);
                            setSelectedColors(Array.isArray(product.colors) ? product.colors : []);
                            if (Array.isArray(product.ram)) {
                              setSelectedRam(product.ram);
                            } else if (typeof product.ram === "string" && product.ram) {
                              setSelectedRam(product.ram.split(",").map((s: string) => s.trim()).filter(Boolean));
                            } else {
                              setSelectedRam([]);
                            }
                            setSelectedStorage(Array.isArray(product.storage) ? product.storage : []);
                            // Copy variant pricing
                            const dupVariants: Record<string, { price: string; mrp: string; stock: string }> = {};
                            if (Array.isArray(product.variants)) {
                              for (const v of product.variants) {
                                if (v.ram && v.storage) {
                                  const key = `${v.ram}|${v.storage}`;
                                  dupVariants[key] = {
                                    price: String(v.price ?? ""),
                                    mrp: String(v.mrp ?? ""),
                                    stock: String(v.stock ?? "0"),
                                  };
                                }
                              }
                            }
                            setVariantPricing(dupVariants);
                            // Copy color images
                            const dupColorImages: Record<string, string[]> = {};
                            if (Array.isArray(product.colorVariants)) {
                              for (const cv of product.colorVariants) {
                                if (cv.colorName && Array.isArray(cv.images) && cv.images.length > 0) {
                                  dupColorImages[cv.colorName] = [...cv.images];
                                }
                              }
                            }
                            setColorImages(dupColorImages);
                            setRemovedCombos(new Set());
                            setShowModal(true);
                          }}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="product-action-btn"
                          title="Delete"
                          aria-label="Delete Product"
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
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "grid", gap: 14, overflowY: "auto", flex: 1 }}>
              {formError && <p style={{ color: "#dc2626", margin: 0 }}>{formError}</p>}

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

              <ImageUploader
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                label="Main Product Image"
              />

              <div className="settings-form-group">
                <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <AlignLeft size={13} /> Short Description
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  placeholder="Brief tagline (e.g. 'A17 Pro chip. 48MP camera system.')"
                />
              </div>

              <div className="settings-form-group">
                <label>Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Full product description..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              {form.type === "Shop" && (
                <>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <ChipSelector
                      label="Colors"
                      icon={<Palette size={13} style={{ color: "var(--primary)" }} />}
                      options={PRESET_COLORS}
                      selected={selectedColors}
                      onChange={setSelectedColors}
                    />
                  </div>

                  {selectedColors.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                        <Images size={13} style={{ color: "var(--primary)" }} /> Color Images
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {selectedColors.map((c) => {
                          const images = colorImages[c] || [];
                          const urlVal = colorUrlInputs[c] || "";
                          return (
                            <div key={c} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{c} Images</span>
                                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{images.length} image{images.length !== 1 ? "s" : ""}</span>
                              </div>
                              {images.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                                  {images.map((url, idx) => (
                                    <div key={idx} style={{ position: "relative" }}>
                                      <img
                                        src={url}
                                        alt={`${c} ${idx + 1}`}
                                        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setColorImages((prev) => ({
                                            ...prev,
                                            [c]: prev[c].filter((_, i) => i !== idx),
                                          }));
                                        }}
                                        style={{
                                          position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%",
                                           border: "none", background: "#dc2626", color: "#fff", fontSize: 10, cursor: "pointer",
                                          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                                        }}
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                  <input
                                    ref={(el) => { (colorFileRefs.current[c] = el); }}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={async (e) => {
                                      const files = e.target.files;
                                      if (!files || files.length === 0) return;
                                      setUploadingColor(c);
                                      try {
                                        const urls = await Promise.all(
                                          Array.from(files).map((file) => uploadImage(file))
                                        );
                                        setColorImages((prev) => ({
                                          ...prev,
                                          [c]: [...(prev[c] || []), ...urls],
                                        }));
                                      } catch (err: any) {
                                        alert(err.message || "Upload failed");
                                      } finally {
                                        setUploadingColor(null);
                                        if (e.target) e.target.value = "";
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    disabled={uploadingColor === c}
                                    onClick={() => colorFileRefs.current[c]?.click()}
                                    style={{
                                      width: "100%", padding: "8px 12px", fontSize: 11, fontWeight: 600,
                                      border: "2px dashed var(--border)", borderRadius: 8, background: "transparent",
                                      color: uploadingColor === c ? "var(--muted-foreground)" : "var(--foreground)",
                                      cursor: uploadingColor === c ? "wait" : "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    }}
                                  >
                                    {uploadingColor === c ? (
                                      <><Loader2 size={13} className="spin" /> Uploading...</>
                                    ) : (
                                      <><Upload size={13} /> Upload from Computer</>
                                    )}
                                  </button>
                                </div>
                                <div style={{ flex: 1, display: "flex", gap: 4 }}>
                                  <input
                                    type="url"
                                    value={urlVal}
                                    onChange={(e) => setColorUrlInputs((prev) => ({ ...prev, [c]: e.target.value }))}
                                    placeholder="Paste image URL"
                                    style={{
                                      flex: 1, padding: "8px 10px", fontSize: 11, borderRadius: 8,
                                      border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    disabled={!urlVal.trim()}
                                    onClick={() => {
                                      const trimmed = urlVal.trim();
                                      if (!trimmed) return;
                                      setColorImages((prev) => ({
                                        ...prev,
                                        [c]: [...(prev[c] || []), trimmed],
                                      }));
                                      setColorUrlInputs((prev) => ({ ...prev, [c]: "" }));
                                    }}
                                    style={{
                                      padding: "8px 12px", fontSize: 11, fontWeight: 600, borderRadius: 8,
                                      border: "1px solid var(--primary)", background: urlVal.trim() ? "rgba(99,102,241,0.1)" : "transparent",
                                      color: urlVal.trim() ? "var(--primary)" : "var(--muted-foreground)",
                                      cursor: urlVal.trim() ? "pointer" : "not-allowed",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <ChipSelector
                      label="RAM"
                      icon={<Cpu size={13} style={{ color: "var(--primary)" }} />}
                      options={PRESET_RAM}
                      selected={selectedRam}
                      onChange={setSelectedRam}
                    />
                    <ChipSelector
                      label="Storage"
                      icon={<Package size={13} style={{ color: "var(--primary)" }} />}
                      options={PRESET_STORAGE}
                      selected={selectedStorage}
                      onChange={setSelectedStorage}
                    />
                  </div>

                  {selectedRam.length > 0 && selectedStorage.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                        <Cpu size={13} style={{ color: "var(--primary)" }} /> Variant Pricing
                        <span style={{
                          fontSize: 10,
                          background: "rgba(6,95,70,0.15)",
                           color: "#065f46",
                          padding: "2px 8px",
                          borderRadius: 10,
                          fontWeight: 700,
                        }}>
                          {Object.keys(variantPricing).length} combos
                        </span>
                      </label>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>RAM</th>
                              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Storage</th>
                              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Price (₹)</th>
                              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>MRP (₹)</th>
                              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Stock</th>
                              <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontWeight: 600 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedRam.flatMap((r) =>
                              selectedStorage.map((s) => {
                                const key = `${r}|${s}`;
                                if (removedCombos.has(key)) return null;
                                const vp = variantPricing[key] || { price: "", mrp: "", stock: "10" };
                                return (
                                  <tr key={key}>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", fontWeight: 500 }}>{r}</td>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", fontWeight: 500 }}>{s}</td>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
                                      <input
                                        type="number"
                                        value={vp.price}
                                        onChange={(e) => setVariantPricing((prev) => ({ ...prev, [key]: { ...prev[key], price: e.target.value } }))}
                                        placeholder="Price"
                                        style={{ width: "100%", padding: "4px 6px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                                      />
                                    </td>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
                                      <input
                                        type="number"
                                        value={vp.mrp}
                                        onChange={(e) => setVariantPricing((prev) => ({ ...prev, [key]: { ...prev[key], mrp: e.target.value } }))}
                                        placeholder="MRP"
                                        style={{ width: "100%", padding: "4px 6px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                                      />
                                    </td>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>
                                      <input
                                        type="number"
                                        value={vp.stock}
                                        onChange={(e) => setVariantPricing((prev) => ({ ...prev, [key]: { ...prev[key], stock: e.target.value } }))}
                                        placeholder="Stock"
                                        style={{ width: "100%", padding: "4px 6px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                                      />
                                    </td>
                                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                                      <button
                                        type="button"
                                        onClick={() => removeCombo(key)}
                                        title="Remove combination"
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: 24,
                                          height: 24,
                                          borderRadius: 6,
                                           border: "1px solid rgba(220,38,38,0.3)",
                                           background: "rgba(220,38,38,0.08)",
                                           color: "#dc2626",
                                          cursor: "pointer",
                                          fontSize: 14,
                                          fontWeight: 700,
                                          lineHeight: 1,
                                          transition: "all 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = "rgba(220,38,38,0.18)";
                                          e.currentTarget.style.borderColor = "rgba(220,38,38,0.5)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                                          e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)";
                                        }}
                                      >
                                        ×
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

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

            <div className="modal-footer" style={{ flexShrink: 0 }}>
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
