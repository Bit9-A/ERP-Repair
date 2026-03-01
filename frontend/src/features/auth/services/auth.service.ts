import { api } from "../../../lib/api";
import type { ApiResponse, Usuario } from "../../../types";

interface LoginPayload {
  nombre: string;
  password: string;
}

interface LoginResponse {
  user: Usuario;
  token: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    // Backend expects { email, password } at POST /users/login
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/users/login",
      { email: payload.nombre, password: payload.password },
    );
    return data.data;
  },

  me: async (): Promise<Usuario> => {
    const { data } = await api.get<ApiResponse<Usuario>>("/users/me");
    return data.data;
  },
};
