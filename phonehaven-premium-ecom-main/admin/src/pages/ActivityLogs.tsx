import { Activity, Search, SlidersHorizontal, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { activityLogsAPI } from "../services/cms-api";

export function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await activityLogsAPI.getAll({
        ...(search ? { search } : {}),
        ...(moduleFilter !== "All Modules" ? { module: moduleFilter } : {}),
      });
      setLogs((res as any).logs || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, moduleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = logs.filter((l) => new Date(l.createdAt) >= today).length;
  const modulesList = Array.from(new Set(logs.map((l) => l.module).filter(Boolean)));

  return (
    <div className="activitylogs-page">
      <div className="page-heading activitylogs-heading">
        <div>
          <h1>Activity Logs</h1>
          <p>Track all admin actions, user activities, and system events</p>
        </div>
        <div className="activitylogs-header-actions">
          <button className="activitylogs-refresh-btn" onClick={load}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="activitylogs-stats">
        <div className="activitylog-stat-card">
          <div className="activitylog-stat-icon blue">
            <Activity size={20} />
          </div>
          <div>
            <strong>{logs.length}</strong>
            <span>Total Activities</span>
          </div>
        </div>
        <div className="activitylog-stat-card">
          <div className="activitylog-stat-icon green">
            <Activity size={20} />
          </div>
          <div>
            <strong>{todayCount}</strong>
            <span>Today</span>
          </div>
        </div>
        <div className="activitylog-stat-card">
          <div className="activitylog-stat-icon purple">
            <Activity size={20} />
          </div>
          <div>
            <strong>{modulesList.length}</strong>
            <span>Active Modules</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="activitylogs-toolbar">
        <div className="activitylogs-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search activities by description or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="activitylogs-toolbar-right">
          <select
            className="activitylogs-filter-select"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option>All Modules</option>
            {modulesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button className="activitylogs-filter-btn">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="activitylogs-card">
        {loading ? (
          <div className="activitylogs-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading activity logs...</p>
          </div>
        ) : error ? (
          <div className="activitylogs-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : logs.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
                <th>Performed By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td><strong>{log.action}</strong></td>
                  <td><span className="blog-category">{log.module}</span></td>
                  <td>{log.description}</td>
                  <td>{log.staffName || log.staff?.name || "System / Admin"}</td>
                  <td>{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="activitylogs-empty">
            <div className="activitylogs-empty-icon">
              <Activity size={28} />
            </div>
            <h2>No activities logged yet</h2>
            <p>All admin actions and system events will be recorded here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
