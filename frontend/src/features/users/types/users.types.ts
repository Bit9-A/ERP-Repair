import type { Rol } from "../../../types";

export interface UserFormValues {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  porcentaje_comision_base: number;
  sucursalId?: string; // Feature 4: branch assignment
}
