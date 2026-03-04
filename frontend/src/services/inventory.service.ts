import { api } from "../lib/api";
import type {
  ApiResponse,
  Producto,
  MovimientoStock,
  CategoriaProducto,
  TipoPropiedad,
} from "../types";

// ============================================
// Inventory service — /api/inventory
// ============================================

export interface InventoryFilters {
  search?: string;
  categoria?: CategoriaProducto;
  propiedad?: TipoPropiedad;
  sucursalId?: string;
}

export interface CreateProductPayload {
  sku: string;
  nombre: string;
  marca_comp?: string;
  modelo_comp?: string;
  categoria?: CategoriaProducto;
  propiedad?: TipoPropiedad;
  propietario?: string;
  stock_actual?: number;
  stock_minimo?: number;
  costo_usd: number;
  precio_usd: number;
  sucursalId?: string; // branch where initial stock is assigned
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface AdjustStockPayload {
  cantidad: number;
  nota?: string;
}

// Feature 2 & 3: add stock with supplier price and branch
export interface AddStockPayload {
  cantidad: number;
  nota?: string;
  costo_unitario_usd?: number; // supplier price for this entry
  actualizar_costo?: boolean; // whether to update Producto.costo_usd
  sucursalId?: string; // which branch receives the stock
}

export interface InventoryStats {
  totalProductos: number;
  totalUnidades: number;
  valorInventario: number;
  productosAgotados: number;
  productosBajoStock: number;
}

/** GET /inventory */
export async function getAll(filters?: InventoryFilters): Promise<Producto[]> {
  const { data } = await api.get<ApiResponse<Producto[]>>("/inventory", {
    params: filters,
  });
  return data.data;
}

/** GET /inventory/:id */
export async function getById(id: string): Promise<Producto> {
  const { data } = await api.get<ApiResponse<Producto>>(`/inventory/${id}`);
  return data.data;
}

/** POST /inventory */
export async function create(payload: CreateProductPayload): Promise<Producto> {
  const { data } = await api.post<ApiResponse<Producto>>("/inventory", payload);
  return data.data;
}

/** PUT /inventory/:id */
export async function update(
  id: string,
  payload: UpdateProductPayload,
): Promise<Producto> {
  const { data } = await api.put<ApiResponse<Producto>>(
    `/inventory/${id}`,
    payload,
  );
  return data.data;
}

/** PATCH /inventory/:id/stock — adjust stock (manual) */
export async function adjustStock(
  id: string,
  payload: AdjustStockPayload,
): Promise<Producto> {
  const { data } = await api.patch<ApiResponse<Producto>>(
    `/inventory/${id}/stock`,
    payload,
  );
  return data.data;
}

/** POST /inventory/:id/add-stock — add incoming stock with supplier price (Feature 2 & 3) */
export async function addStock(
  id: string,
  payload: AddStockPayload,
): Promise<Producto> {
  const { data } = await api.post<ApiResponse<Producto>>(
    `/inventory/${id}/add-stock`,
    payload,
  );
  return data.data;
}

/** GET /inventory/:id/historial-precios — supplier price history (Feature 2) */
export async function getHistorialPrecios(
  id: string,
): Promise<MovimientoStock[]> {
  const { data } = await api.get<ApiResponse<MovimientoStock[]>>(
    `/inventory/${id}/historial-precios`,
  );
  return data.data;
}

/** DELETE /inventory/:id */
export async function remove(id: string): Promise<Producto> {
  const { data } = await api.delete<ApiResponse<Producto>>(`/inventory/${id}`);
  return data.data;
}

/** GET /inventory/stats */
export async function getStats(): Promise<InventoryStats> {
  const { data } =
    await api.get<ApiResponse<InventoryStats>>("/inventory/stats");
  return data.data;
}

/** GET /inventory/low-stock */
export async function getLowStock(): Promise<Producto[]> {
  const { data } = await api.get<ApiResponse<Producto[]>>(
    "/inventory/low-stock",
  );
  return data.data;
}

/** GET /inventory/:id/movimientos */
export async function getMovimientos(id: string): Promise<MovimientoStock[]> {
  const { data } = await api.get<ApiResponse<MovimientoStock[]>>(
    `/inventory/${id}/movimientos`,
  );
  return data.data;
}
