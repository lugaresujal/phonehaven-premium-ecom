import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Package,
  Heart,
  MapPin,
  User,
  Wallet,
  Tag,
  Bell,
  LogOut,
  ChevronDown,
  ChevronUp,
  XCircle,
  Truck,
  Edit,
  Save,
  Plus,
  Trash2,
  X,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import { formatINR } from "@/lib/mock-data";
import innerbanner from "@/assets/images/innerbanner.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/store/wishlist";
import { isValidPhone } from "@/lib/store/auth";
import { useCms } from "@/lib/cms-store";


const tabs = [
  { icon: User, label: "Profile" },
  { icon: Package, label: "Orders" },
  { icon: Heart, label: "Wishlist" },
  { icon: MapPin, label: "Addresses" },
  { icon: Wallet, label: "Wallet" },
  { icon: Tag, label: "Coupons" },
  { icon: Bell, label: "Notifications" },
  { icon: LogOut, label: "Logout" },
];

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — House of Phones" },
      { property: "og:url", content: "/account" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),

  component: AccountPage,
});

function AccountPage() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelCustomReason, setCancelCustomReason] = useState<string>("");
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const { coupons } = useCms();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileError, setProfileError] = useState("");
  const { orders, loading, addresses, cancelOrder, refreshOrders, setOrders, setAddresses } = useOrders();
  const { items: wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Return request state
  const [returnModalOrder, setReturnModalOrder] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({
    selectedProducts: [] as string[],
    reason: "",
    description: "",
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Check if order has a return request
  const orderReturnStatus = (orderId: string) => {
    const r = (returns as any[]).find((ret: any) => ret.orderId === orderId || ret.order?.orderId === orderId);
    return r || null;
  };

  // Returns data fetched from backend
  const [returns, setReturns] = useState<any[]>([]);

  // Fetch returns for current user's orders
  const fetchReturns = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("hop_token") || "";
      const res = await fetch(`http://localhost:5000/api/returns?userId=${encodeURIComponent(user.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.returns)) {
        setReturns(data.returns);
      }
    } catch {
      // silent fail — returns are supplementary
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [user, orders]);

  const handleOpenReturnModal = (order: any) => {
    setReturnModalOrder(order);
    setReturnForm({
      selectedProducts: order.items?.map((i: any) => i.name) || [],
      reason: "",
      description: "",
    });
  };

  const handleSubmitReturn = async () => {
    if (!returnModalOrder || !returnForm.reason) return;
    setIsSubmittingReturn(true);
    try {
      const selectedItems = returnModalOrder.items?.filter((i: any) =>
        returnForm.selectedProducts.includes(i.name)
      ) || [];
      const productName = selectedItems.map((i: any) => i.name).join(", ");

      const token = localStorage.getItem("hop_token") || "";
      const res = await fetch("http://localhost:5000/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          orderId: returnModalOrder.id,
          userId: user?.id || "",
          customerName: user?.name || "Customer",
          customerEmail: user?.email || "",
          productName,
          reason: returnForm.reason,
          description: returnForm.description,
          refundAmount: returnModalOrder.totals?.total || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Return request submitted successfully! We'll review your request shortly.");
        setReturnModalOrder(null);
        fetchReturns();
        refreshOrders();
      } else {
        alert(data.message || "Failed to submit return request. Please try again.");
      }
    } catch {
      alert("Failed to submit return request. Please try again.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const isOrderReturnable = (status: string) => {
    const returnable = ["delivered"];
    return returnable.includes((status || "").toLowerCase());
  };

  // Form state for address
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "delivered":
        return "bg-green-500/10 text-green-600";
      case "in transit":
      case "shipped":
        return "bg-blue-500/10 text-blue-600";
      case "out for delivery":
        return "bg-orange-500/10 text-orange-600";
      case "packed":
        return "bg-purple-500/10 text-purple-600";
      case "confirmed":
        return "bg-indigo-500/10 text-indigo-600";
      case "processing":
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "cancellation requested":
        return "bg-amber-500/10 text-amber-600";
      case "cancelled":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const CANCELLATION_REASONS = [
    "Ordered by mistake",
    "Found a better price",
    "Changed my mind",
    "Delivery is taking too long",
    "Ordered the wrong product",
    "Other",
  ];

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId || o.orderId === orderId);
    if (order) {
      setCancelModalOrder(order);
      setCancelReason("");
      setCancelCustomReason("");
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const finalReason = cancelReason === "Other" ? cancelCustomReason.trim() : cancelReason;
    if (!finalReason) return;

    setIsCancelling(cancelModalOrder.id);
    try {
      const targetId = cancelModalOrder.orderId || cancelModalOrder.id;
      const res: any = await cancelOrder(targetId, finalReason);
      setCancelModalOrder(null);
      setCancelReason("");
      setCancelCustomReason("");
      setExpandedOrder(null);
      if (res && res.message) {
        alert(res.message);
      } else {
        alert("Order cancelled successfully!");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(null);
    }
  };

  const isOrderCancellable = (status: string) => {
    const nonCancellable = [
      "delivered",
      "out for delivery",
      "cancelled",
      "cancellation requested",
    ];
    return !nonCancellable.includes((status || "").toLowerCase());
  };

  // Address Management Functions
  const handleEditAddress = (index: number) => {
    const address = addresses[index];
    setAddressForm({
      fullName: address.fullName || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      phone: address.phone || '',
      email: address.email || '',
    });
    setEditingAddressIndex(index);
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (index: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(updatedAddresses);
      setEditingAddressIndex(null);
    }
  };

  const handleSaveAddress = () => {
    // Validate required fields
    if (!addressForm.fullName || !addressForm.line1 || !addressForm.city || 
        !addressForm.state || !addressForm.pincode || !addressForm.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingAddressIndex !== null) {
      // Update existing address
      const updatedAddresses = addresses.map((addr, index) => 
        index === editingAddressIndex ? { ...addressForm } : addr
      );
      setAddresses(updatedAddresses);
      alert('Address updated successfully!');
    } else {
      // Add new address
      setAddresses([...addresses, { ...addressForm }]);
      alert('Address added successfully!');
    }
    
    // Reset form
    resetAddressForm();
    setEditingAddressIndex(null);
    setShowAddAddress(false);
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: user?.name || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: user?.phone || '',
      email: user?.email || '',
    });
  };

  const handleCancelEdit = () => {
    resetAddressForm();
    setEditingAddressIndex(null);
    setShowAddAddress(false);
  };

  const handleAddNewAddress = () => {
    resetAddressForm();
    setEditingAddressIndex(null);
    setShowAddAddress(true);
  };

  const handleSaveProfile = () => {
    setProfileError("");
    if (profilePhone && !isValidPhone(profilePhone)) {
      setProfileError("Please enter a valid Indian phone number (e.g. 98765 43210).");
      return;
    }
    updateProfile({ phone: profilePhone.trim() });
    setEditingProfile(false);
    alert("Profile updated successfully!");
  };

  // If not logged in
  if (!loading && !user) {
    return (
      <PageLayout title="" subtitle="" crumbs={[]}>
        <section className="relative h-[220px] sm:h-[280px] md:h-[320px] flex items-center overflow-hidden -mt-[100px] sm:-mt-[120px] md:-mt-[150px]"
          style={{
            backgroundImage: `url(${innerbanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/35"></div>
          <div className="container-hop relative z-10 text-white">
            <div className="flex items-center gap-2 text-sm text-white/80 mb-5">
              <span>Home</span>
              <span>›</span>
              <span>Account</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl mb-4">My Account</h1>
            <p className="text-lg md:text-2xl text-white/90">Please login to view your account</p>
          </div>
        </section>
        
        <section className="container-hop py-20 text-center">
          <div className="max-w-md mx-auto">
            <User size={64} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-serif mb-3">Welcome Back!</h2>
            <p className="text-muted-foreground mb-8">Please login to access your account, orders, and wishlist.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"
            >
              Login Now
            </Link>
          </div>
        </section>
      </PageLayout>
    );
  }

  // Render account page
  return (
    <PageLayout title="" subtitle="" crumbs={[]}>
      {/* Banner */}
      <section
        className="relative h-[220px] sm:h-[280px] md:h-[340px] flex items-center overflow-hidden -mt-[100px] sm:-mt-[120px] md:-mt-[150px]"
        style={{
          backgroundImage: `url(${innerbanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/35"></div>

        <div className="container-hop relative z-10 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-5">
            <span>Home</span>
            <span>›</span>
            <span>Account</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl mb-4">
            My Account
          </h1>

          <p className="text-lg md:text-2xl text-white/90">
            {user?.name ? `Welcome back, ${user.name}` : "Manage your profile, orders and preferences."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-hop py-10 grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-card border border-border rounded-2xl p-3 h-fit">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                if (t.label === "Logout") {
                  handleLogout();
                } else {
                  setActiveTab(t.label);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                t.label === activeTab
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div>
          {activeTab === "Orders" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-3xl">Order History</h2>
                <button
                  onClick={() => refreshOrders()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-primary/30 transition-colors"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-serif mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                  <Link 
                    to="/shop" 
                    className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 rounded-full text-sm tracking-widest uppercase hover:bg-primary transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div 
                        className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            {order.orderId || order.id} · {new Date(order.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>

                          <p className="mt-1 font-medium text-lg">
                            {order.items?.length > 1
                              ? `${order.items[0]?.name || 'Order'} + ${order.items.length - 1} more items`
                              : order.items?.[0]?.name || 'Order'}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${getStatusColor(order.status)}`}
                          >
                            {order.status || 'Processing'}
                          </span>

                          <span className="font-serif text-xl">
                            {formatINR(order.totals?.total ?? 0)}
                          </span>

                          <button className="text-primary hover:text-primary/70 transition-colors">
                            {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>

                      {/* Order Details - Expanded */}
                      {expandedOrder === order.id && order.items && order.items.length > 0 && (
                        <div className="border-t border-border p-5 bg-muted/10">
                          <h4 className="text-sm font-medium mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.qty || 1}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">
                                    {formatINR((item.price || 0) * (item.qty || 1))}
                                  </p>
                                  {item.price && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatINR(item.price)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Order Summary */}
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>{formatINR(order.totals?.subtotal || 0)}</span>
                            </div>
                            {order.totals?.shipping && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatINR(order.totals.shipping)}</span>
                              </div>
                            )}
                            {order.totals?.tax && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{formatINR(order.totals.tax)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium mt-2 pt-2 border-t border-border">
                              <span>Total</span>
                              <span className="font-serif">{formatINR(order.totals?.total || 0)}</span>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          {order.address && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                              <div className="text-sm text-muted-foreground">
                                <p>{order.address.fullName}</p>
                                <p>{order.address.line1}</p>
                                {order.address.line2 && <p>{order.address.line2}</p>}
                                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                                <p>{order.address.phone}</p>
                              </div>
                            </div>
                          )}

                          {/* Track Order Button */}
                          <div className="mt-4 pt-4 border-t border-border">
                            <Link
                              to="/track-order"
                              search={{ orderId: order.orderId }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                              <Truck size={16} />
                              Track Order
                            </Link>
                          </div>

                          {/* Request Return Button */}
                          {isOrderReturnable(order.status) && !orderReturnStatus(order.orderId || order.id) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <button
                                onClick={() => handleOpenReturnModal(order)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors"
                              >
                                <RotateCcw size={16} />
                                Request Return
                              </button>
                            </div>
                          )}

                          {/* Return Status */}
                          {orderReturnStatus(order.orderId || order.id) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                                orderReturnStatus(order.orderId || order.id).status?.toLowerCase() === "refunded"
                                  ? "bg-green-500/10 text-green-600"
                                  : orderReturnStatus(order.orderId || order.id).status?.toLowerCase() === "approved"
                                  ? "bg-blue-500/10 text-blue-600"
                                  : orderReturnStatus(order.orderId || order.id).status?.toLowerCase() === "rejected"
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}>
                                <RotateCcw size={16} />
                                Return Status: {orderReturnStatus(order.orderId || order.id).status}
                              </div>
                            </div>
                          )}

                          {/* Cancel Order Button */}
                          {isOrderCancellable(order.status) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={isCancelling === order.id}
                                className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors ${
                                  isCancelling === order.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {isCancelling === order.id ? (
                                  <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={16} />
                                    Cancel Order
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Show cancelled status */}
                          {(order.status?.toLowerCase() === 'cancelled' || Boolean((order as any).cancellationReason)) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-xl text-sm font-medium">
                                <XCircle size={16} />
                                This order has been cancelled
                              </div>
                              {(order as any).cancellationReason && (
                                <p className="mt-2 text-sm text-muted-foreground ml-6">
                                  Reason: {(order as any).cancellationReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "Wishlist" && (
            <div>
              <h2 className="font-serif text-3xl mb-6">Your Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-serif mb-2">No items in wishlist</h3>
                  <p className="text-muted-foreground">Start adding your favorite products</p>
                  <Link to="/shop" className="text-primary hover:underline mt-4 inline-block">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {wishlist.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Profile" && (
            <div>
              <h2 className="font-serif text-3xl mb-6">Profile Details</h2>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-3xl">
                    {(user?.email || user?.name || "?").trim().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-medium">{user?.name || 'Guest User'}</p>
                    <p className="text-muted-foreground">{user?.email || 'guest@example.com'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    {editingProfile ? (
                      <div className="mt-2">
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => {
                            setProfilePhone(e.target.value);
                            setProfileError("");
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors text-sm"
                          placeholder="98765 43210"
                        />
                        {profileError && (
                          <p className="text-xs text-red-500 mt-1">{profileError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{user?.memberSince || '2024'}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  {editingProfile ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Save size={14} />
                        Save Phone
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setProfilePhone(user?.phone || "");
                          setProfileError("");
                        }}
                        className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingProfile(true);
                        setProfilePhone(user?.phone || "");
                      }}
                      className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Edit size={14} />
                      Edit Phone Number
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Addresses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-3xl">Saved Addresses</h2>
                <button
                  onClick={handleAddNewAddress}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  Add New Address
                </button>
              </div>

              {/* Address Form - Show when adding or editing */}
              {(showAddAddress || editingAddressIndex !== null) && (
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 rounded-full hover:bg-accent transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="Apartment, Suite, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="400001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/70 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={addressForm.email}
                        onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSaveAddress}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Save size={16} />
                      {editingAddressIndex !== null ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 && !showAddAddress ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-serif mb-2">No addresses saved</h3>
                  <p className="text-muted-foreground mb-6">Add your first address for faster checkout.</p>
                  <button
                    onClick={handleAddNewAddress}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={16} />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((a, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{a.fullName}</p>
                          <p className="text-sm text-muted-foreground mt-1">{a.line1}</p>
                          {a.line2 && <p className="text-sm text-muted-foreground">{a.line2}</p>}
                          <p className="text-sm text-muted-foreground">{a.city}, {a.state} — {a.pincode}</p>
                          <p className="text-sm text-muted-foreground mt-2">{a.phone}</p>
                          {a.email && <p className="text-sm text-muted-foreground break-all">{a.email}</p>}
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <button
                            onClick={() => handleEditAddress(i)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit size={14} />
                            Change Address
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(i)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Wallet" && (
            <div>
              <h2 className="font-serif text-3xl mb-6">Wallet Balance</h2>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Wallet size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-3xl font-serif mb-2">₹0.00</p>
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            </div>
          )}

          {activeTab === "Coupons" && (
            <div>
              <h2 className="font-serif text-3xl mb-6">Your Coupons</h2>
              {coupons && coupons.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((c) => (
                    <div key={c.id || c.code} className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                            {c.discountType === "percentage" || c.discountType === "Percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                          </span>
                          <h3 className="text-xl font-bold font-mono tracking-wider text-foreground">{c.code}</h3>
                        </div>
                        <Tag size={24} className="text-primary/60" />
                      </div>
                      <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-1">
                        {c.minOrder && <p>Min Order: ₹{c.minOrder}</p>}
                        {c.expiryDate && <p>Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-serif mb-2">No coupons available</h3>
                  <p className="text-muted-foreground">Check back later for special offers</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Notifications" && (
            <div>
              <h2 className="font-serif text-3xl mb-6">Notifications</h2>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-serif mb-2">No notifications</h3>
                <p className="text-muted-foreground">We'll keep you updated here</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmittingReturn && setReturnModalOrder(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-serif text-xl">Request Return</h3>
                <p className="text-sm text-muted-foreground mt-1">Order #{returnModalOrder.orderId}</p>
              </div>
              <button
                onClick={() => !isSubmittingReturn && setReturnModalOrder(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Product Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Select product(s) to return</label>
                <div className="space-y-2">
                  {returnModalOrder.items?.map((item: any, idx: number) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={returnForm.selectedProducts.includes(item.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReturnForm((f) => ({ ...f, selectedProducts: [...f.selectedProducts, item.name] }));
                          } else {
                            setReturnForm((f) => ({ ...f, selectedProducts: f.selectedProducts.filter((n) => n !== item.name) }));
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.qty || 1} · {formatINR(item.price)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="text-sm font-medium mb-3 block">Return reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Damaged product",
                    "Defective product",
                    "Wrong product received",
                    "Product not as described",
                    "Missing item/accessory",
                    "Other",
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReturnForm((f) => ({ ...f, reason }))}
                      className={`px-3 py-2 rounded-xl text-sm text-left border transition-colors ${
                        returnForm.reason === reason
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="text-sm font-medium mb-2 block">Additional details <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={returnForm.description}
                  onChange={(e) => setReturnForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell us more about the issue..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setReturnModalOrder(null)}
                disabled={isSubmittingReturn}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={isSubmittingReturn || !returnForm.reason || returnForm.selectedProducts.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isSubmittingReturn || !returnForm.reason || returnForm.selectedProducts.length === 0
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isSubmittingReturn ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Return Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isCancelling && setCancelModalOrder(null)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-serif text-xl">Cancel Order</h3>
                <p className="text-sm text-muted-foreground mt-1">Order #{cancelModalOrder.orderId}</p>
              </div>
              <button
                onClick={() => !isCancelling && setCancelModalOrder(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                Please select a reason for cancelling this order. This action cannot be undone.
              </p>

              {/* Reason Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Reason for Cancellation *</label>
                <div className="grid grid-cols-1 gap-2">
                  {CANCELLATION_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setCancelReason(reason)}
                      className={`px-4 py-3 rounded-xl text-sm text-left border transition-colors ${
                        cancelReason === reason
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Textarea */}
              {cancelReason === "Other" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Please specify your reason *</label>
                  <textarea
                    rows={3}
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="Enter your reason for cancellation..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setCancelModalOrder(null)}
                disabled={!!isCancelling}
                className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-muted/50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                disabled={!!isCancelling || !cancelReason || (cancelReason === "Other" && !cancelCustomReason.trim())}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isCancelling || !cancelReason || (cancelReason === "Other" && !cancelCustomReason.trim())
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isCancelling ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}