import React, { useEffect, useState } from "react";
import { Star, Send, MessageSquarePlus, X } from "lucide-react";
import { toast } from "react-toastify";
import { reviewService, Review } from "../services/reviewService";

const REVIEW_LIMIT_KEY = "last_review_submitted_at";
const ONE_HOUR = 60 * 60 * 1000;

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    const data = await reviewService.getApprovedReviews();
    setReviews(data || []);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const canSubmitReview = () => {
    const lastSubmittedAt = localStorage.getItem(REVIEW_LIMIT_KEY);

    if (!lastSubmittedAt) return true;

    const timePassed = Date.now() - Number(lastSubmittedAt);
    return timePassed >= ONE_HOUR;
  };

  const getRemainingMinutes = () => {
    const lastSubmittedAt = localStorage.getItem(REVIEW_LIMIT_KEY);

    if (!lastSubmittedAt) return 0;

    const remaining = ONE_HOUR - (Date.now() - Number(lastSubmittedAt));
    return Math.max(1, Math.ceil(remaining / 60000));
  };

  const submitReview = async () => {
    if (!canSubmitReview()) {
      toast.error(
        `You can add another review after ${getRemainingMinutes()} minute(s).`
      );
      return;
    }

    if (!customerName.trim()) return toast.error("Please enter your name");

    if (!customerContact.trim()) {
      return toast.error("Please enter mobile or email");
    }

    if (!message.trim()) {
      return toast.error("Please write your review");
    }

    setSubmitting(true);

    const result = await reviewService.submitReview({
      customer_name: customerName.trim(),
      customer_contact: customerContact.trim(),
      rating,
      message: message.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Failed to submit review");
      return;
    }

    localStorage.setItem(REVIEW_LIMIT_KEY, String(Date.now()));

    toast.success("Review submitted! It will appear after 24-48 hours.");

    setCustomerName("");
    setCustomerContact("");
    setRating(5);
    setMessage("");
    setShowModal(false);
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-cyan-600 font-bold text-sm mb-2 tracking-wide">
            CUSTOMER REVIEWS
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Built on Trust and Gamer Satisfaction
          </h2>

          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Real feedback from our customers.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Share Experience
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-white/20">
            <p className="text-gray-600">
              No reviews yet. Be the first to add one.
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden min-h-[230px] sm:min-h-[260px]">
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-r from-orange-50 via-orange-50/80 to-transparent z-10 pointer-events-none" />

            <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-l from-orange-50 via-orange-50/80 to-transparent z-10 pointer-events-none" />

            <div
              className="flex gap-4 py-3 sm:gap-6 w-max animate-review-scroll will-change-transform transform-gpu"
              style={{
                animationDuration: `${Math.max(reviews.length * 5, 20)}s`,
              }}
            >
              {[...reviews, ...reviews].map((review, index) => (
                <div
                  key={`${review.id}-${index}`}
                  className="w-[280px] sm:w-[340px] shrink-0"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Add Your Review
                </h3>

                <p className="text-sm text-gray-500">
                  It will appear after 24-48 hours.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile or Email
                </label>

                <input
                  type="text"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="Mobile or email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating
                </label>

                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            value <= rating
                              ? "text-yellow-400 fill-yellow-400 scale-110"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review
                </label>

                <div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your experience..."
                    rows={5}
                    maxLength={160}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-none bg-white shadow-sm"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      Keep it short and helpful.
                    </p>

                    <span
                      className={`text-[11px] sm:text-xs font-semibold px-2 py-1 rounded-full ${
                        message.length > 145
                          ? "bg-orange-50 text-orange-500"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {message.length}/160
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={submitReview}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-orange-500 hover:to-red-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />

                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                One review allowed every 1 hour on this device. Reviews will
                appear after 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="group relative bg-white rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-white/70 md:hover:shadow-2xl md:hover:-translate-y-1 transition-shadow duration-300 min-h-[210px] sm:min-h-[230px] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-400" />

      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-extrabold shadow-md shrink-0">
          {review.customer_name?.charAt(0)?.toUpperCase() || "G"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                {review.customer_name}
              </h3>

              <p className="text-[11px] sm:text-xs text-green-600 font-bold mt-0.5">
                Verified Customer
              </p>
            </div>

            <span className="text-[10px] sm:text-[11px] text-gray-400 shrink-0">
              {new Date(review.created_at).toLocaleString([], {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              index < review.rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>

      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-5">
        “{review.message}”
      </p>
    </div>
  );
};

export default ReviewsSection;