const API_URL = import.meta.env.VITE_API_URL;

export interface Review {
  id: string;
  customer_name: string;
  customer_contact?: string;
  rating: number;
  message: string;
  status?: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
}

export const reviewService = {
  async getApprovedReviews(): Promise<Review[]> {
    try {
      const response = await fetch(`${API_URL}/reviews/approved`);
      if (!response.ok) throw new Error("Failed to fetch approved reviews");
      return await response.json();
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      return [];
    }
  },

  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await fetch(`${API_URL}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return await response.json();
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },

  async submitReview(payload: {
    customer_name: string;
    customer_contact: string;
    rating: number;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to submit review",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error submitting review:", error);
      return {
        success: false,
        error: "Failed to submit review",
      };
    }
  },

  async updateReviewStatus(
    id: string,
    status: "pending" | "approved" | "rejected"
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/reviews/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error updating review status:", error);
      return false;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  },
};