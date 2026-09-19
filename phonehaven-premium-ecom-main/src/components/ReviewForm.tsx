import { useState, useRef } from "react";
import { Star, Upload, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useReviews } from "@/lib/store/reviews";
import { useAuth } from "@/lib/store/auth";

type ReviewFormProps = {
  productId: string;
  onReviewSubmitted?: () => void;
};

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user, token } = useAuth();
  const { submitReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const activeToken = token || localStorage.getItem("hop_token");
    if (!activeToken) {
      toast.error("Please sign in to upload photos");
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image file`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB size limit`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          toast.error(data.message || `Failed to upload ${file.name}`);
        }
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeToken = token || localStorage.getItem("hop_token");
    if (!activeToken) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!body.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        images,
        reviewImages: images,
      });

      if (result.success) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setTitle("");
        setBody("");
        setImages([]);
        onReviewSubmitted?.();
      } else {
        toast.error(result.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 rounded-2xl bg-accent/30 border border-border/50 text-center">
        <p className="text-sm text-muted-foreground mb-3">Sign in to write a review</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Write a Review
      </h3>

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Your Rating *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Title (Optional) */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Review Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          maxLength={100}
        />
      </div>

      {/* Review Body */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Your Review *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience with this product. What did you like or dislike?"
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          required
        />
        <p className="text-[10px] text-muted-foreground text-right">
          {body.length}/1000
        </p>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          Add Photos (optional, max 5)
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
              <img src={img} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground mt-1">Upload</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Accepted formats: JPG, PNG, WebP. Max size: 5MB per image.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || uploading || rating === 0 || !body.trim()}
        className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check size={14} />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}
