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
