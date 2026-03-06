import { api } from "../lib/api";
import type { ApiResponse, TicketReparacion, EstadoTicket } from "../types";

// ============================================
// Repairs service — /api/repairs
// ============================================

export interface RepairsFilters {
  estado?: EstadoTicket;
  tecnicoId?: string;
}

export interface CreateRepairPayload {
  clienteId: string;
  tecnicoId?: string;
  equipo?: string;
  tipo_equipo?: string;
  marca: string;
  modelo: string;
  imei?: string;
  clave?: string;
  patron_visual?: string;
  checklist?: Record<string, boolean>;
  falla: string;
  falla_reportada?: string;
  observaciones?: string;
  porcentaje_tecnico?: number;
}

export interface UpdateRepairPayload extends Partial<CreateRepairPayload> {
  estado?: EstadoTicket;
  precio_total_usd?: number;
}

export interface KanbanCounts {
  RECIBIDO: number;
  EN_REVISION: number;
  ESPERANDO_REPUESTO: number;
  REPARADO: number;
  ENTREGADO: number;
  ABANDONO: number;
}

/** GET /repairs */
export async function getAll(
  filters?: RepairsFilters,
): Promise<TicketReparacion[]> {
  const { data } = await api.get<ApiResponse<TicketReparacion[]>>("/repairs", {
    params: filters,
  });
  return data.data;
}

/** GET /repairs/:id */
export async function getById(id: string): Promise<TicketReparacion> {
  const { data } = await api.get<ApiResponse<TicketReparacion>>(
    `/repairs/${id}`,
  );
  return data.data;
}

/** POST /repairs */
export async function create(
  payload: CreateRepairPayload,
): Promise<TicketReparacion> {
  const { data } = await api.post<ApiResponse<TicketReparacion>>(
    "/repairs",
    payload,
  );
  return data.data;
}

/** PUT /repairs/:id */
export async function update(
  id: string,
  payload: UpdateRepairPayload,
): Promise<TicketReparacion> {
  const { data } = await api.put<ApiResponse<TicketReparacion>>(
    `/repairs/${id}`,
    payload,
  );
  return data.data;
}

/** DELETE /repairs/:id */
export async function remove(id: string): Promise<TicketReparacion> {
  const { data } = await api.delete<ApiResponse<TicketReparacion>>(
    `/repairs/${id}`,
  );
  return data.data;
}

/** GET /repairs/kanban-counts */
export async function getKanbanCounts(): Promise<KanbanCounts> {
  const { data } = await api.get<ApiResponse<KanbanCounts>>(
    "/repairs/kanban-counts",
  );
  return data.data;
}

/** PATCH /repairs/:id/estado */
export async function updateEstado(
  id: string,
  estado: EstadoTicket,
): Promise<TicketReparacion> {
  const { data } = await api.patch<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/estado`,
    { estado },
  );
  return data.data;
}

/** POST /repairs/:id/repuestos */
export async function addRepuesto(
  id: string,
  productoId: string,
  cantidad: number,
): Promise<TicketReparacion> {
  const { data } = await api.post<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/repuestos`,
    { productoId, cantidad },
  );
  return data.data;
}

/** POST /repairs/:id/servicios */
export async function addServicio(
  id: string,
  servicioId: string,
  precioCobrado: number,
): Promise<TicketReparacion> {
  const { data } = await api.post<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/servicios`,
    { servicioId, precioCobrado },
  );
  return data.data;
}

/** DELETE /repairs/:id/repuestos/:repuestoId */
export async function removeRepuesto(
  id: string,
  repuestoId: string,
): Promise<TicketReparacion> {
  const { data } = await api.delete<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/repuestos/${repuestoId}`,
  );
  return data.data;
}

/** DELETE /repairs/:id/servicios/:servicioId */
export async function removeServicio(
  id: string,
  servicioId: string,
): Promise<TicketReparacion> {
  const { data } = await api.delete<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/servicios/${servicioId}`,
  );
  return data.data;
}

/** POST /repairs/:id/entregar */
export async function entregarTicket(
  id: string,
  pagos: Array<{
    monedaId: string;
    monto_moneda_local: number;
    metodo: string;
    referencia?: string;
  }>,
): Promise<TicketReparacion> {
  const { data } = await api.post<ApiResponse<TicketReparacion>>(
    `/repairs/${id}/entregar`,
    { pagos },
  );
  return data.data;
}
