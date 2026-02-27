// ============================================
// Shared types across all feature modules
// Maps to Prisma DB schema
// ============================================

// -- Users --
export type Rol = "ADMIN" | "TECNICO" | "VENDEDOR";

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  email: string;
  porcentaje_comision_base: number;
  createdAt: string;
}

// -- Clients --
export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
}

// -- Currency --
export interface Moneda {
  id: string;
  codigo: string;
  nombre?: string;
  tasa_cambio: number;
}

// -- Products / Inventory --
export type CategoriaProducto = "EQUIPO" | "ACCESORIO" | "REPUESTO";
export type TipoPropiedad = "PROPIA" | "PRESTADA";

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  marca_comp?: string;
  modelo_comp?: string;
  categoria: CategoriaProducto;
  propiedad: TipoPropiedad;
  propietario?: string;
  stock_actual: number;
  stock_minimo: number;
  costo_usd: number;
  precio_usd: number;
  createdAt?: string;
}

// -- Stock Movements --
export type TipoMovimiento =
  | "ENTRADA"
  | "SALIDA_REPARACION"
  | "SALIDA_VENTA"
  | "AJUSTE"
  | "DEVOLUCION";

export interface MovimientoStock {
  id: string;
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  referencia?: string;
  nota?: string;
  createdAt: string;
}

// -- Repair Tickets --
export type EstadoTicket =
  | "RECIBIDO"
  | "EN_REVISION"
  | "ESPERANDO_REPUESTO"
  | "REPARADO"
  | "ENTREGADO"
  | "ABANDONO";

export interface TicketReparacion {
  id: string;
  clienteId: string;
  cliente?: Cliente;
  tecnicoId?: string;
  tecnico?: Usuario;
  equipo?: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  imei?: string;
  clave?: string;
  patron_visual?: string;
  checklist?: Record<string, boolean>;
  falla: string;
  falla_reportada?: string;
  observaciones?: string;
  estado: EstadoTicket;
  costo_repuestos_usd: number;
  precio_total_usd: number;
  porcentaje_tecnico: number;
  fecha_ingreso: string;
  fecha_entrega?: string;
  repuestos?: TicketProducto[];
  servicios?: TicketServicio[];
  pagos?: Pago[];
}

// -- Ticket <-> Product (intermediate) --
export interface TicketProducto {
  id: string;
  ticketId: string;
  productoId: string;
  cantidad: number;
  precio_congelado_usd: number;
  costo_congelado_usd: number;
  producto?: Producto;
}

// -- Ticket <-> Service (intermediate) --
export interface TicketServicio {
  id: string;
  ticketId: string;
  servicioId: string;
  precio_cobrado_usd: number;
  comision_tecnico_usd: number;
  servicio?: Servicio;
}

// -- Services catalog --
export interface Servicio {
  id: string;
  nombre: string;
  precio_usd: number;
}

// -- Sales --
export type EstadoVenta = "PENDIENTE" | "PAGADA" | "ANULADA";

export interface Venta {
  id: string;
  codigo: string;
  clienteId?: string;
  cliente?: Cliente;
  vendedorId?: string;
  vendedor?: Usuario;
  subtotal_usd: number;
  descuento_usd: number;
  total_usd: number;
  estado: EstadoVenta;
  items?: VentaProducto[];
  pagos?: Pago[];
  tasas_snapshot?: {
    VES: number;
    COP: number;
    timestamp: string;
  };
  createdAt: string;
}

export interface VentaProducto {
  id: string;
  ventaId: string;
  productoId: string;
  cantidad: number;
  precio_congelado_usd: number;
  costo_congelado_usd: number;
  producto?: Producto;
}

// -- Payments --
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "PAGO_MOVIL" | "ZELLE";

export interface Pago {
  id: string;
  ticketId?: string;
  ventaId?: string;
  monedaId: string;
  moneda?: Moneda;
  monto_moneda_local: number;
  equivalente_usd: number;
  metodo: string;
  referencia?: string;
  fecha_pago: string;
}

// -- Financial transactions (ingreso / egreso) --
export type TipoTransaccion = "INGRESO" | "EGRESO";

export interface TransaccionFinanciera {
  id: string;
  tipo: TipoTransaccion;
  monto_usd: number;
  concepto: string;
  categoria?: string;
  ticketId?: string;
  ventaId?: string;
  createdAt: string;
}

// -- API Response wrappers --
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
