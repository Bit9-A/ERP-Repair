import type { CategoriaProducto, TipoPropiedad } from "../../../types";

export interface ProductFormValues {
  sku: string;
  nombre: string;
  marca_comp: string;
  modelo_comp: string;
  categoria: CategoriaProducto;
  propiedad: TipoPropiedad;
  propietario: string;
  stock_actual: number;
  stock_minimo: number;
  costo_usd: number;
  precio_usd: number;
  sucursalId?: string;
}
