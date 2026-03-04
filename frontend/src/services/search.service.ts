import { api } from "../lib/api";

export interface SearchResultItem {
  id: string;
  nombre?: string; // Para cliente/producto
  equipo?: string; // Para ticket
  titulo?: string;
  descripcion?: string;
  estado?: string;
  sku?: string;
  stock_actual?: number;
  precio_usd?: number;
  cedula?: string;
  correo?: string;
  codigo_ticket?: string;
  falla_reportada?: string;
  telefono?: string;
}

export interface SearchResponse {
  tickets: SearchResultItem[];
  productos: SearchResultItem[];
  clientes: SearchResultItem[];
}

export const searchService = {
  globalSearch: async (query: string, limit = 5): Promise<SearchResponse> => {
    if (!query || query.length < 2) {
      return { tickets: [], productos: [], clientes: [] };
    }
    const { data } = await api.get<{ success: boolean; data: SearchResponse }>(
      "/search",
      {
        params: { q: query, limit },
      },
    );
    return data.data;
  },
};
