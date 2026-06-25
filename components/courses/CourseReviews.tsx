"use client";

import { useState, useTransition } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Star, Send, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { submitReview, deleteReview } from "@/lib/actions/reviews";

interface Review {
  _id: string;
  courseId: string | null;
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  rating: number | null;
  comment: string | null;
  _createdAt: string;
}

interface CourseReviewsProps {
  courseId: string;
  courseSlug: string;
  reviews: Review[];
}

function StarRating({
  rating,
  interactive = false,
  size = "md",
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const sizeClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  isOwn,
  courseSlug,
}: {
  review: Review;
  isOwn: boolean;
  courseSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteReview(review._id, courseSlug);
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
        isOwn
          ? "border-blue-600/20 bg-blue-600/[0.03]"
          : "border-slate-200 bg-white hover:border-slate-200"
      }`}
    >
      <div className="flex items-start gap-4">
        {review.userImage ? (
          <img
            src={review.userImage}
            alt={review.userName ?? "User"}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {(review.userName ?? "A").charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800 text-sm">
                {review.userName ?? "Anonymous"}
              </span>
              {isOwn && (
                <span className="text-[10px] font-medium text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <span className="text-xs text-slate-600 shrink-0">
              {timeAgo(review._createdAt)}
            </span>
          </div>

          <div className="mt-1">
            <StarRating rating={review.rating ?? 0} size="sm" />
          </div>

          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>
      </div>

      {isOwn && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

function ReviewForm({
  courseId,
  courseSlug,
  existingReview,
}: {
  courseId: string;
  courseSlug: string;
  existingReview?: {
    _id: string;
    rating: number | null;
    comment: string | null;
  } | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isEditing = !!existingReview;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    startTransition(async () => {
      const result = await submitReview(
        courseId,
        courseSlug,
        rating,
        comment.trim(),
      );
      if (!result.success) {
        setError(result.error ?? "Something went wrong");
      } else {
        if (!isEditing) {
          setRating(0);
          setComment("");
        }
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5"
    >
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        {isEditing ? "Update Your Review" : "Write a Review"}
      </h3>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Rating
        </label>
        <StarRating rating={rating} interactive size="lg" onRate={setRating} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Share your experience with this course..."
          className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600/30 resize-none transition-all"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-600">{comment.length}/1000</p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isEditing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}

export function CourseReviews({
  courseId,
  courseSlug,
  reviews,
}: CourseReviewsProps) {
  const { userId } = useAuth();
  const { user } = useUser();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const userReview = userId ? reviews.find((r) => r.userId === userId) : null;
  const otherReviews = reviews.filter((r) => r.userId !== userId);

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Reviews
        </h2>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </span>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-8 p-6 rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <div className="text-5xl font-black text-slate-800 tracking-tight">
              {avgRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-slate-500 mt-1">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-3 text-right">
                  {star}
                </span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {userId && (
        <ReviewForm
          courseId={courseId}
          courseSlug={courseSlug}
          existingReview={
            userReview
              ? {
                  _id: userReview._id,
                  rating: userReview.rating,
                  comment: userReview.comment,
                }
              : null
          }
        />
      )}

      {!userId && (
        <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Sign in to leave a review</p>
        </div>
      )}

      {(userReview || otherReviews.length > 0) && (
        <div className="space-y-4">
          {userReview && (
            <ReviewCard review={userReview} isOwn courseSlug={courseSlug} />
          )}
          {otherReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              isOwn={false}
              courseSlug={courseSlug}
            />
          ))}
        </div>
      )}

      {reviews.length === 0 && userId && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-600">
            No reviews yet. Be the first to review this course!
          </p>
        </div>
      )}
    </div>
  );
}
