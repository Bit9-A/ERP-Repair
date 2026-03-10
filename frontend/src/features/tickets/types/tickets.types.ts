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
    bateria: boolean;
    carcasa_rota: boolean;
    accesorios_sim_sd: boolean;
    funda: boolean;
    uso_diario_desgaste: boolean;
    biometria: boolean;
    audio: boolean;
    sensor_proximidad: boolean;
    puerto_carga: boolean;
    conectividad_wifi_bt: boolean;
    flash_linterna: boolean;
    pantalla_fallas_internas: boolean;
    tornilleria_faltante: boolean;
    riesgos_explicados: boolean;
  };
  falla: string;
  falla_reportada?: string;
  observaciones?: string;
  mano_de_obra_usd: number;
  costo_repuestos_usd: number;
  precio_total_usd: number;
  porcentaje_tecnico: number;
}
