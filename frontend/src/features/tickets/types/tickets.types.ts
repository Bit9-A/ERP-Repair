// Definimos los estados posibles del equipo
export type EstadoTicket = 'RECIBIDO' | 'EN_REVISION' | 'ESPERANDO_REPUESTO' | 'REPARADO' | 'ENTREGADO' | 'ABANDONO';

export interface TicketReparacion {
  id: number;
  // Datos del Cliente
  cliente: {
    nombre: string;
    cedula: string;
    telefono: string;
    correo?: string;
  };
  // Ficha Técnica (De tu nota)
  equipo: {
    tipo: string;   // Celular, Tablet, etc.
    marca: string;
    modelo: string;
    imei: string;
    clave: string;
    patron: string; // Representación del dibujo 3x3
  };
  // Checklist de Seguridad para evitar reclamos
  checklist: {
    camaras: boolean;
    touch: boolean;
    senal: boolean;
    encendido: boolean;
    botones: boolean;
  };
  falla: string;
  estado: EstadoTicket;
  // Lógica de Dinero (El Split 60/40)
  costo_repuestos_usd: number;
  precio_total_usd: number;
  porcentaje_tecnico: number;  // Por defecto 0.40
  tecnicoId: number | null;
  // Control de Tiempos
  fecha_ingreso: string;
}

// Lo que necesita el formulario para crear uno nuevo
export interface TicketFormValues extends Omit<TicketReparacion, 'id' | 'fecha_ingreso'> { }