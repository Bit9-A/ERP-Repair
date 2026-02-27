import { api } from "../lib/api";
import type { ApiResponse, Usuario } from "../types";

// ============================================
// Auth service — POST /api/users/login
// ============================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/users/login",
    payload,
  );
  return data.data;
}
