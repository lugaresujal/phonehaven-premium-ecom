import React, { createContext, useContext, useState, useCallback } from "react";

const API_BASE_URL = "/api";

export type Review = {
  id: string;
  reviewId?: string;
  productId: string;
  userId?: string;
  userName?: string;
  customerName?: string;
  rating: number;
  title?: string;
  body?: string;
  reviewText?: string;
  images: string[];
  reviewImages?: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { name: string; image: string };
  user?: { id: string; name: string; email: string };
};

type ReviewsContextType = {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (productId: string) => Promise<void>;
  submitReview: (data: {
    productId: string;
    rating: number;
    title?: string;
    body: string;
    images?: string[];
    reviewImages?: string[];
  }) => Promise<{ success: boolean; message?: string }>;
  updateReview: (id: string, data: {
    rating?: number;
    title?: string;
    body?: string;
    images?: string[];
    reviewImages?: string[];
  }) => Promise<{ success: boolean; message?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; message?: string }>;
  userReviewForProduct: (productId: string, userId: string) => Review | undefined;
  clearReviews: () => void;
};

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("hop_token");

  const fetchReviews = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews?productId=${encodeURIComponent(productId)}&status=Approved`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReview = useCallback(async (reviewData: {
    productId: string;
    rating: number;
    title?: string;
    body: string;
    images?: string[];
    reviewImages?: string[];
  }) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Please sign in to submit a review" };
    }

    try {
      const imgList = reviewData.reviewImages || reviewData.images || [];
      const payload = {
        ...reviewData,
        images: imgList,
        reviewImages: imgList,
      };

      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Refetch reviews to get the updated list
        await fetchReviews(reviewData.productId);
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to submit review" };
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  }, [fetchReviews]);

  const updateReview = useCallback(async (id: string, updateData: {
    rating?: number;
    title?: string;
    body?: string;
    images?: string[];
  }) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Please sign in to update your review" };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updateData } : r))
        );
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to update review" };
    } catch (err: any) {
      console.error("Failed to update review:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: "Please sign in to delete your review" };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r.id !== id));
        return { success: true };
      }
      return { success: false, message: data.message || "Failed to delete review" };
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const userReviewForProduct = useCallback((productId: string, userId: string) => {
    return reviews.find(
      (r) => r.productId === productId && r.userId === userId
    );
  }, [reviews]);

  const clearReviews = useCallback(() => {
    setReviews([]);
    setError(null);
  }, []);

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        error,
        fetchReviews,
        submitReview,
        updateReview,
        deleteReview,
        userReviewForProduct,
        clearReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
