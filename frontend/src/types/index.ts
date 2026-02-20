// ============================================
// Shared types across all feature modules
// Maps to Prisma DB schema
// ============================================

// -- Users --
export type Rol = "ADMIN" | "TECNICO";

export interface Usuario {
  id: number;
  nombre: string;
  rol: Rol;
  createdAt: string;
}

// -- Clients --
export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
}

// -- Currency --
export interface Moneda {
  id: number;
  codigo: string;
  tasa_cambio: number;
}

// -- Products / Inventory --
export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  precio_usd: number;
}

// -- Repair Tickets --
export type EstadoTicket =
  | "RECIBIDO"
  | "EN_REVISION"
  | "ESPERANDO_REPUESTO"
  | "REPARADO"
  | "ENTREGADO";

export interface TicketReparacion {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  tecnicoId: number;
  tecnico?: Usuario;
  equipo: string;
  falla: string;
  estado: EstadoTicket;
  mano_obra_usd: number;
  fecha_ingreso: string;
  productos?: TicketProducto[];
  pagos?: Pago[];
}

// -- Ticket <-> Product (intermediate) --
export interface TicketProducto {
  ticketId: number;
  productoId: number;
  cantidad: number;
  producto?: Producto;
}

// -- Payments --
export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "PUNTO_VENTA"
  | "PAGO_MOVIL";

export interface Pago {
  id: number;
  ticketId: number;
  monedaId: number;
  moneda?: Moneda;
  monto_moneda_local: number;
  equivalente_usd: number;
  metodo: MetodoPago;
  fecha: string;
}

// -- API Response wrappers --
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
