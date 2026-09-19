import { useState } from "react";
import { Star, Trash2, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useReviews, type Review } from "@/lib/store/reviews";
import { useAuth } from "@/lib/store/auth";

type ReviewListProps = {
  productId: string;
};

export function ReviewList({ productId }: ReviewListProps) {
  const { reviews, loading, deleteReview } = useReviews();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Filter reviews strictly for this product
  const productReviews = reviews.filter((review) => review.productId === productId);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setDeletingId(reviewId);
    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success("Review deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete review");
      }
    } catch (err) {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const resolveReviewerName = (review: Review): string => {
    // If the review belongs to the currently logged in user, always show their latest name
    if (user && (review.userId === user.id || review.user?.id === user.id) && user.name) {
      return user.name.trim();
    }
    // Registered user profile from review.user relation
    if (review.user?.name && review.user.name.trim()) {
      return review.user.name.trim();
    }
    // Saved userName from authenticated review submission
    if (review.userName && review.userName.trim() && !isGenericName(review.userName)) {
      return review.userName.trim();
    }
    // Saved customerName from authenticated review submission
    if (review.customerName && review.customerName.trim() && !isGenericName(review.customerName)) {
      return review.customerName.trim();
    }
    return "Verified Buyer";
  };

  const isGenericName = (name: string): boolean => {
    const lower = name.toLowerCase().trim();
    return (
      lower === "customer" ||
      lower === "user" ||
      lower === "anonymous" ||
      lower.includes("@")
    );
  };

  const formatReviewDateTime = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const normalizeImageUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const clean = url.startsWith("/") ? url : `/${url}`;
    if (clean.startsWith("/uploads/")) {
      return `/api${clean}`;
    }
    return clean;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (productReviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {productReviews.map((review) => {
        const isOwnReview = user && (review.userId === user.id || review.user?.id === user.id);
        const reviewerName = resolveReviewerName(review);
        const rawImages = (Array.isArray(review.reviewImages) && review.reviewImages.length > 0)
          ? review.reviewImages
          : (Array.isArray(review.images) ? review.images : []);
        const reviewImages = rawImages
          .map(normalizeImageUrl)
          .filter((url) => Boolean(url && url.trim().length > 0));

        return (
          <div
            key={review.id || review.reviewId}
            className="p-5 sm:p-6 rounded-2xl bg-card border border-border/70 space-y-3.5 shadow-sm"
          >
            {/* Review Header: User Name + Star Rating */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* User Avatar Initial */}
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                  {reviewerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {reviewerName}
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={10} /> Verified Buyer
                    </span>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 bg-accent/40 px-2.5 py-1 rounded-full border border-border/50">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-foreground">
                  {review.rating}.0
                </span>
              </div>
            </div>

            {/* Review Title */}
            {review.title && (
              <h4 className="text-sm font-semibold text-foreground">
                {review.title}
              </h4>
            )}

            {/* Review Body */}
            {(review.body || review.reviewText) && (
              <p className="text-sm text-foreground/90 leading-relaxed">
                "{review.body || review.reviewText}"
              </p>
            )}

            {/* Uploaded Review Product Images */}
            {reviewImages.length > 0 && (
              <div className="pt-1">
                <div className="flex flex-wrap gap-2.5">
                  {reviewImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setExpandedImage(img)}
                      className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary/60 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <img
                        src={img}
                        alt={`Uploaded product image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Hide broken image container if image is unreachable
                          const target = e.currentTarget.parentElement;
                          if (target) target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1 shadow">
                          <ImageIcon size={12} /> View
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Review Date & Time */}
            <div className="pt-1 text-xs text-muted-foreground">
              Reviewed on:{" "}
              <span className="font-medium text-foreground/90">
                {formatReviewDateTime(review.createdAt)}
              </span>
            </div>

            {/* Delete Action (only for own review) */}
            {isOwnReview && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <button
                  onClick={() => handleDelete(review.id || review.reviewId || "")}
                  disabled={deletingId === (review.id || review.reviewId)}
                  className="inline-flex items-center gap-1.5 text-[11px] text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {deletingId === (review.id || review.reviewId) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete Review
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <button
            type="button"
            onClick={() => setExpandedImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Close image preview"
          >
            ✕
          </button>
          <div className="max-w-3xl max-h-[85vh] p-2 bg-card/20 rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={expandedImage}
              alt="Uploaded review photo preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
