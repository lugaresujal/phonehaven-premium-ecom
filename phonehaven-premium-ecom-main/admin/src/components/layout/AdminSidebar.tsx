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
  ChevronDown,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import houseOfPhonesLogo from '../../assets/house-of-phones-logo.png';

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

interface SidebarGroup {
  heading: string;
  items: typeof menuItems;
}

const sidebarItemLabels: Record<string, string> = {
  "/customers": "All Customers",
};

const sidebarGroups: SidebarGroup[] = [
  {
    heading: "Overview",
    items: menuItems.filter((item) => item.path === "/"),
  },
  {
    heading: "Sales",
    items: menuItems.filter((item) =>
      ["/orders", "/payments"].includes(item.path)
    ),
  },
  {
    heading: "Catalog",
    items: menuItems.filter((item) =>
      ["/products", "/inventory", "/brands", "/categories", "/offers", "/coupons", "/banners"].includes(item.path)
    ),
  },
  {
    heading: "Customers",
    items: menuItems.filter((item) =>
      ["/customers", "/reviews"].includes(item.path)
    ),
  },
  {
    heading: "Support & Operations",
    items: menuItems.filter((item) =>
      ["/returns", "/repairs", "/exchanges", "/enquiries"].includes(item.path)
    ),
  },
  {
    heading: "Content & Stores",
    items: menuItems.filter((item) =>
      ["/blog", "/faqs", "/stores", "/corporate"].includes(item.path)
    ),
  },
  {
    heading: "Administration",
    items: menuItems.filter((item) =>
      ["/staff", "/activity-logs", "/settings"].includes(item.path)
    ),
  },
];

export function AdminSidebar() {
  const { mobileOpen, closeMobile } = useSidebar();
  const location = useLocation();

  const isGroupActive = useCallback(
    (items: typeof menuItems) => items.some((item) => location.pathname === item.path),
    [location.pathname]
  );

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sidebarGroups.forEach((group) => {
      initial[group.heading] = !isGroupActive(group.items);
    });
    return initial;
  });

  useEffect(() => {
    setCollapsedGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      sidebarGroups.forEach((group) => {
        if (isGroupActive(group.items)) {
          if (prev[group.heading]) {
            next[group.heading] = false;
            changed = true;
          }
        } else if (!prev[group.heading]) {
          // Collapse non-active groups for accordion behavior
          next[group.heading] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [location.pathname, isGroupActive]);

  const toggleGroup = (heading: string) => {
    setCollapsedGroups((prev) => {
      const isCurrentlyCollapsed = prev[heading];
      if (isCurrentlyCollapsed) {
        // Opening this group — collapse all others, expand this one (accordion)
        const next: Record<string, boolean> = {};
        sidebarGroups.forEach((group) => {
          next[group.heading] = group.heading !== heading;
        });
        return next;
      }
      // Closing this group
      return { ...prev, [heading]: true };
    });
  };

  return (
    <>
      <div className={`admin-sidebar-overlay${mobileOpen ? " visible" : ""}`} onClick={closeMobile} />
      <aside className={`admin-sidebar${mobileOpen ? " mobile-open" : ""}`}>
        <div className="admin-sidebar-logo">
          <img 
            src={houseOfPhonesLogo} 
            alt="House of Phones" 
            className="admin-logo-img"
          />
          <div>
            <h2>House of Phones</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {sidebarGroups.map((group) => {
            const collapsed = collapsedGroups[group.heading] ?? false;
            const groupPanelId = `sidebar-group-${group.heading.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <div key={group.heading} className="admin-sidebar-group">
                <button
                  className="admin-sidebar-group-toggle"
                  onClick={() => toggleGroup(group.heading)}
                  aria-expanded={!collapsed}
                  aria-controls={groupPanelId}
                >
                  <span>{group.heading}</span>
                  <ChevronDown size={14} />
                </button>
                <div
                  id={groupPanelId}
                  className="admin-sidebar-group-items"
                  role="group"
                  aria-label={group.heading}
                  style={{ maxHeight: collapsed ? 0 : `${group.items.length * 44 + 10}px` }}
                >
                  {group.items.map((item) => {
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
                        <span>{sidebarItemLabels[item.path] || item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
