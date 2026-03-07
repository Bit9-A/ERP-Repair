import type { Rol, UserPermisos } from "../../../types";

export interface UserFormValues {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  porcentaje_comision_base: number;
  gana_comision: boolean;
  gana_salario: boolean;
  salario_base_usd: number;
  sucursalId?: string; // Feature 4: branch assignment
  permisos?: UserPermisos; // Feature 5: permissions
}
