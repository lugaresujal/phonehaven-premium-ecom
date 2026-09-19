import { Star } from "lucide-react";
import { useReviews } from "@/lib/store/reviews";

type RatingSummaryProps = {
  productId: string;
  averageRating: number;
  totalReviews: number;
};

export function RatingSummary({ productId, averageRating, totalReviews }: RatingSummaryProps) {
  const { reviews } = useReviews();

  // Filter reviews to only those belonging to this specific product
  const productReviews = reviews.filter((review) => review.productId === productId);

  // Calculate rating distribution: use actual reviews if available, or simulate realistic breakdown from stored rating
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    if (productReviews.length > 0) {
      const count = productReviews.filter((r) => r.rating === stars).length;
      const percentage = (count / productReviews.length) * 100;
      return { stars, count, percentage };
    }
    // Realistic distribution fallback based on averageRating and totalReviews
    const r = Math.max(1, Math.min(5, averageRating || 4.5));
    const dist = Math.abs(stars - r);
    const weight = Math.exp(-dist * 1.6);
    // Normalized approx percentages
    const allWeights = [5, 4, 3, 2, 1].map((s) => Math.exp(-Math.abs(s - r) * 1.6));
    const sumW = allWeights.reduce((a, b) => a + b, 0);
    const percentage = Math.round((weight / sumW) * 100);
    const count = Math.round((percentage / 100) * (totalReviews || 0));
    return { stars, count, percentage };
  });

  // Use actual average from product-specific reviews if available, otherwise use product's stored rating
  const actualAverage = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : averageRating;

  const displayAverage = Math.round(actualAverage * 10) / 10;

  // Use product-specific review count for display
  const displayCount = productReviews.length > 0 ? productReviews.length : totalReviews;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/70">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Average Rating */}
        <div className="text-center sm:text-left">
          <div className="flex items-baseline gap-1 justify-center sm:justify-start">
            <span className="text-4xl font-serif font-bold text-foreground">
              {displayAverage.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">/5</span>
          </div>
          <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= Math.round(displayAverage)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {displayCount} review{displayCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full space-y-1.5">
          {distribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 text-right">
                {stars} ★
              </span>
              <div className="flex-1 h-2.5 bg-accent/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
