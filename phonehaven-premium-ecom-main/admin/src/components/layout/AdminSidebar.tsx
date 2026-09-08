import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Boxes,
  Tags,
  FolderTree,
  Percent,
  TicketPercent,
  Image,
  FileText,
  HelpCircle,
  Star,
  RotateCcw,
  Wrench,
  ArrowLeftRight,
  Store,
  MessageSquare,
  Building2,
  UserCog,
  Activity,
  Settings,
  CreditCard,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";

export const menuItems = [
  {
    label: "Dashboard",
    icon: BarChart3,
    path: "/",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    label: "Payments",
    icon: CreditCard,
    path: "/payments",
  },
  {
    label: "Products",
    icon: Package,
    path: "/products",
  },
  {
    label: "Inventory",
    icon: Boxes,
    path: "/inventory",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    label: "Brands",
    icon: Tags,
    path: "/brands",
  },
  {
    label: "Categories",
    icon: FolderTree,
    path: "/categories",
  },
  {
    label: "Offers",
    icon: Percent,
    path: "/offers",
  },
  {
    label: "Coupons",
    icon: TicketPercent,
    path: "/coupons",
  },
  {
    label: "Banners",
    icon: Image,
    path: "/banners",
  },
  {
    label: "Blog",
    icon: FileText,
    path: "/blog",
  },
  {
    label: "FAQs",
    icon: HelpCircle,
    path: "/faqs",
  },
  {
    label: "Reviews",
    icon: Star,
    path: "/reviews",
  },
  {
    label: "Returns & Refunds",
    icon: RotateCcw,
    path: "/returns",
  },
  {
    label: "Repairs",
    icon: Wrench,
    path: "/repairs",
  },
  {
    label: "Exchanges",
    icon: ArrowLeftRight,
    path: "/exchanges",
  },
  {
    label: "Stores",
    icon: Store,
    path: "/stores",
  },
  {
    label: "Enquiries",
    icon: MessageSquare,
    path: "/enquiries",
  },
  {
    label: "Corporate",
    icon: Building2,
    path: "/corporate",
  },
  {
    label: "Staff",
    icon: UserCog,
    path: "/staff",
  },
  {
    label: "Activity Logs",
    icon: Activity,
    path: "/activity-logs",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function AdminSidebar() {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <div className={`admin-sidebar-overlay${mobileOpen ? " visible" : ""}`} onClick={closeMobile} />
      <aside className={`admin-sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-logo-mark">H</div>
          <div>
            <h2>House of Phones</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `admin-sidebar-item${isActive ? " active" : ""}`
                }
                onClick={closeMobile}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
