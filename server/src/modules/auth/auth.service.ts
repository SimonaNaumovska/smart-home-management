import { supabase } from "../../config/supabase";
import { AppError } from "../../middleware/errorHandler";
import type {
  SignUpDTO,
  SignInDTO,
  AuthResponse,
  SessionResponse,
} from "./auth.types";

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(dto: SignUpDTO): Promise<{ message: string }> {
    const { error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    return {
      message:
        "Account created successfully. Please check your email to verify.",
    };
  }

  /**
   * Sign in an existing user
   */
  async signIn(dto: SignInDTO): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new AppError(error.message, 401);
    }

    if (!data.user || !data.session) {
      throw new AppError("Authentication failed", 401);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(_accessToken: string): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError(error.message, 400);
    }
  }

  /**
   * Get current session from access token
   */
  async getSession(accessToken: string): Promise<SessionResponse> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error) {
      return { user: null };
    }

    if (!user) {
      return { user: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
      },
    };
  }

  /**
   * Refresh session using refresh token
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.user || !data.session) {
      throw new AppError("Failed to refresh session", 401);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }
}

export const authService = new AuthService();
