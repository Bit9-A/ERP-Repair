import type { Rol, TipoContrato } from "../../../types";

export interface UserFormValues {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  tipo_contrato: TipoContrato;
  salario_base_usd: number;
  porcentaje_comision_base: number;
}
