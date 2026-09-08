import {
  MessageSquareText,
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { reviewsAPI } from "../services/cms-api";

export function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewsAPI.getAll({
        ...(search ? { search } : {}),
        ...(statusFilter !== "All Status" ? { status: statusFilter } : {}),
      });
      setReviews((res as any).reviews || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await reviewsAPI.updateStatus(id, { status: newStatus });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await reviewsAPI.delete(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusClass = (status: string) => {
    const styles: Record<string, string> = {
      Approved: "review-status-approved",
      Pending: "review-status-pending",
      Rejected: "review-status-rejected",
    };
    return styles[status] || "review-status-pending";
  };

  const renderStars = (rating: number) => {
    return (
      <span className="review-stars">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "review-star-filled" : "review-star-empty"}
            fill={i < rating ? "#f59e0b" : "none"}
          />
        ))}
      </span>
    );
  };

  const filtered = reviews.filter((r) => {
    if (ratingFilter === "All Ratings") return true;
    const num = parseInt(ratingFilter);
    return r.rating === num;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="reviews-page">
      <div className="page-heading reviews-heading">
        <div>
          <h1>Reviews & Ratings</h1>
          <p>Manage customer reviews and ratings for House of Phones products.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="reviews-stats">
        <div className="review-stat-card">
          <div className="review-stat-icon blue">
            <MessageSquareText size={21} />
          </div>
          <div>
            <span>Total Reviews</span>
            <strong>{reviews.length}</strong>
          </div>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-icon yellow">
            <Star size={21} />
          </div>
          <div>
            <span>Average Rating</span>
            <strong>{avgRating}</strong>
          </div>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-icon purple">
            <MessageSquareText size={21} />
          </div>
          <div>
            <span>Pending Reviews</span>
            <strong>{reviews.filter((r) => r.status === "Pending").length}</strong>
          </div>
        </div>
        <div className="review-stat-card">
          <div className="review-stat-icon green">
            <Star size={21} />
          </div>
          <div>
            <span>5 Star Reviews</span>
            <strong>{reviews.filter((r) => r.rating === 5).length}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="reviews-toolbar">
        <div className="reviews-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer, title or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="reviews-toolbar-right">
          <select
            className="reviews-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <select
            className="reviews-filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option>All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <button type="button" className="filter-button">
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </div>

      <div className="reviews-card">
        {loading ? (
          <div className="reviews-empty">
            <Loader2 size={28} className="spin" />
            <p>Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="reviews-empty">
            <p style={{ color: "red" }}>{error}</p>
            <button className="primary-button" onClick={load}>
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id}>
                  <td className="review-customer">
                    {review.customerName || review.user?.name || "Anonymous Customer"}
                  </td>
                  <td>{review.product?.name || "Product"}</td>
                  <td>{renderStars(review.rating)}</td>
                  <td className="review-comment">
                    {review.title && <strong>{review.title}: </strong>}
                    {review.body || "—"}
                  </td>
                  <td>
                    <span className={`review-status ${getStatusClass(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="review-date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td>
                    <div className="review-actions">
                      {review.status !== "Approved" && (
                        <button
                          className="review-action-btn"
                          title="Approve"
                          onClick={() => handleStatusChange(review.id, "Approved")}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {review.status !== "Rejected" && (
                        <button
                          className="review-action-btn"
                          title="Reject"
                          onClick={() => handleStatusChange(review.id, "Rejected")}
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        className="review-action-btn"
                        title="Delete"
                        onClick={() => handleDelete(review.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="reviews-empty">
            <div className="reviews-empty-icon">
              <MessageSquareText size={28} />
            </div>
            <h2>No reviews to display</h2>
            <p>Customer reviews and ratings will appear here once customers submit them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
