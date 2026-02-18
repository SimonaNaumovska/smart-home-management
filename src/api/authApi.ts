import { api } from "./client";

export interface SignUpDTO {
  email: string;
  password: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface SessionResponse {
  user: {
    id: string;
    email: string;
  } | null;
}

/**
 * Auth API Service - Connects to Express Backend
 * Handles authentication without direct Supabase imports
 */
class AuthApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on init
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(dto: SignUpDTO): Promise<{ message: string }> {
    return await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(dto: SignInDTO): Promise<AuthResponse> {
    const response: AuthResponse = await api("/auth/signin", {
      method: "POST",
      body: JSON.stringify(dto),
    });

    // Store tokens
    this.accessToken = response.session.accessToken;
    this.refreshToken = response.session.refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.session.accessToken);
      localStorage.setItem("refreshToken", response.session.refreshToken);
    }

    return response;
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (this.accessToken) {
      try {
        await api("/auth/signout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
      } catch (error) {
        // Continue with local cleanup even if backend call fails
        console.error("Sign out error:", error);
      }
    }

    // Clear tokens
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SessionResponse> {
    if (!this.accessToken) {
      return { user: null };
    }

    try {
      return await api("/auth/session", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (error) {
      // If session check fails, try to refresh
      if (this.refreshToken) {
        try {
          await this.refresh();
          return await this.getSession();
        } catch (refreshError) {
          // Refresh failed, clear tokens
          this.accessToken = null;
          this.refreshToken = null;
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
          return { user: null };
        }
      }
      return { user: null };
    }
  }

  /**
   * Refresh session tokens
   */
  async refresh(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response: AuthResponse = await api("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    // Update tokens
    this.accessToken = response.session.accessToken;
    this.refreshToken = response.session.refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.session.accessToken);
      localStorage.setItem("refreshToken", response.session.refreshToken);
    }

    return response;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set up auth state change listener
   * Polls for session changes every 5 seconds
   */
  onAuthStateChange(
    callback: (user: { id: string; email: string } | null) => void,
  ): () => void {
    const interval = setInterval(async () => {
      const session = await this.getSession();
      callback(session.user);
    }, 5000);

    // Initial check
    this.getSession().then((session) => callback(session.user));

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export const authApi = new AuthApiService();
