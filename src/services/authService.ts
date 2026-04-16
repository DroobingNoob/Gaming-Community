const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
}

const TOKEN_KEY = "gc_admin_token";
const USER_KEY = "gc_admin_user";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Login failed",
        };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Unable to connect to server",
      };
    }
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.user) {
        this.logout();
        return null;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error("Get current user error:", error);
      this.logout();
      return null;
    }
  },

  getStoredUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};