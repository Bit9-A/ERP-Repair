import { api } from "../../../lib/api";
import type { Usuario } from "../../../types";

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
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  me: async (): Promise<Usuario> => {
    const { data } = await api.get<Usuario>("/auth/me");
    return data;
  },
};
