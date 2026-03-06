// Feature-specific ticket types
// Use shared types from ../../types for most definitions.
// This file defines just the form values shape.

export interface TicketFormValues {
  clienteId: string;
  tecnicoId?: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  imei?: string;
  clave?: string;
  patron_visual?: string;
  checklist: {
    camaras: boolean;
    touch: boolean;
    senal: boolean;
    encendido: boolean;
    botones: boolean;
  };
  falla: string;
  falla_reportada?: string;
  observaciones?: string;
  mano_de_obra_usd: number;
  costo_repuestos_usd: number;
  precio_total_usd: number;
  porcentaje_tecnico: number;
}
