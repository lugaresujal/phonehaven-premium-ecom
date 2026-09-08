import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, UserCircle, X, Phone, Mail, Building2, CheckCheck, LogOut, Sparkles, Menu } from "lucide-react";
import { notificationsAPI } from "../../services/cms-api";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { menuItems } from "./AdminSidebar";
import { AskAIChat } from "../ai/AskAIChat";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  module: string | null;
  recordId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function AdminHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAdminAuth();
  const { toggleMobile } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate("/login", { replace: true });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsAPI.getAll();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Load notifications on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showProfile && !showNotifications && !showSearchResults) return;
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile, showNotifications, showSearchResults]);

  const handleBellClick = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      setLoadingNotifications(true);
      await fetchNotifications();
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const data = await notificationsAPI.markAsRead(id);
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const data = await notificationsAPI.markAllRead();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Silently fail
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-hamburger"
          onClick={toggleMobile}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="admin-search" ref={searchRef}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearchResults(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowSearchResults(false);
                setSearchQuery("");
              }
              if (e.key === "Enter") {
                const filtered = menuItems.filter((item) =>
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (filtered.length > 0) {
                  navigate(filtered[0].path);
                  setSearchQuery("");
                  setShowSearchResults(false);
                }
              }
            }}
          />
          {showSearchResults && searchQuery.length > 0 && (
            <div className="admin-search-results">
              {(() => {
                const filtered = menuItems.filter((item) =>
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (filtered.length === 0) {
                  return <div className="admin-search-empty">No results found</div>;
                }
                return filtered.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      className="admin-search-item"
                      onClick={() => {
                        navigate(item.path);
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="admin-header-right">
        {/* Ask AI Button */}
        <button
          type="button"
          className="admin-ai-btn"
          onClick={() => setShowAI(true)}
          aria-label="Ask AI"
        >
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>

        {/* Notification Bell */}
        <div className="admin-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className="admin-header-icon"
            aria-label="Notifications"
            onClick={handleBellClick}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button type="button" className="notif-mark-all" onClick={handleMarkAllRead}>
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-dropdown-body">
                {loadingNotifications ? (
                  <div className="notif-empty">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.isRead ? "notif-unread" : ""}`}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n.id);
                      }}
                    >
                      <div className="notif-item-icon">
                        {n.type === "success" ? (
                          <span className="notif-dot notif-dot-success" />
                        ) : n.type === "warning" ? (
                          <span className="notif-dot notif-dot-warning" />
                        ) : (
                          <span className="notif-dot notif-dot-info" />
                        )}
                      </div>
                      <div className="notif-item-content">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-message">{n.message}</div>
                        <div className="notif-item-time">{formatTime(n.createdAt)}</div>
                      </div>
                      {!n.isRead && (
                        <div className="notif-item-unread-dot" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="admin-profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            <UserCircle size={34} />
            <div className="admin-profile-info">
              <strong>{user?.name || "Admin"}</strong>
              <span>{user?.email || "Administrator"}</span>
            </div>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  <UserCircle size={48} />
                </div>
                <div>
                  <h3>{user?.name || "Admin"}</h3>
                  <p>{user?.provider === "google" ? "Google Account" : "Admin"}</p>
                </div>
                <button
                  type="button"
                  className="profile-dropdown-close"
                  onClick={() => setShowProfile(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-body">
                <div className="profile-field">
                  <Mail size={16} />
                  <div>
                    <span className="profile-field-label">Email</span>
                    <span className="profile-field-value">{user?.email || ""}</span>
                  </div>
                </div>
                {user?.phone && (
                  <div className="profile-field">
                    <Phone size={16} />
                    <div>
                      <span className="profile-field-label">Phone</span>
                      <span className="profile-field-value">{user.phone}</span>
                    </div>
                  </div>
                )}
                {user?.memberSince && (
                  <div className="profile-field">
                    <Building2 size={16} />
                    <div>
                      <span className="profile-field-label">Member Since</span>
                      <span className="profile-field-value">{user.memberSince}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-body">
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AskAIChat open={showAI} onClose={() => setShowAI(false)} />
    </header>
  );
}
