import { useAuthStore } from "../features/auth/store/auth.store";
import type { UserPermisos } from "../types";

// Permisos base por defecto cuando el usuario no tiene overrides en BD
const ADMIN_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: true,
    crearProducto: true,
    ajustarStock: true,
  },
  ventas: { ver: true, crear: true, anular: true },
  finanzas: { ver: true },
  tickets: { ver: true, asignar: true, cambiarEstado: true },
  usuarios: { ver: true, gestionar: true },
};

const TECNICO_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: false,
    crearProducto: false,
    ajustarStock: true,
  },
  ventas: { ver: false, crear: false, anular: false },
  finanzas: { ver: false },
  tickets: { ver: true, asignar: false, cambiarEstado: true },
  usuarios: { ver: false, gestionar: false },
};

const VENDEDOR_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: false,
    crearProducto: false,
    ajustarStock: false,
  },
  ventas: { ver: true, crear: true, anular: false },
  finanzas: { ver: false },
  tickets: { ver: false, asignar: false, cambiarEstado: false },
  usuarios: { ver: false, gestionar: false },
};

export function usePermissions(): Required<UserPermisos> {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return {
      inventario: {},
      ventas: {},
      finanzas: {},
      tickets: {},
      usuarios: {},
    } as Required<UserPermisos>;
  }

  // Si es ADMIN, siempre tiene acceso total pase lo que pase
  if (user.rol === "ADMIN") {
    return ADMIN_DEFAULTS;
  }

  const defaults =
    user.rol === "TECNICO" ? TECNICO_DEFAULTS : VENDEDOR_DEFAULTS;

  // Si no tiene permisos DB override, usamos defaults
  if (!user.permisos) {
    return defaults;
  }

  // Mezclar defaults con los configurados
  return {
    inventario: { ...defaults.inventario, ...user.permisos.inventario },
    ventas: { ...defaults.ventas, ...user.permisos.ventas },
    finanzas: { ...defaults.finanzas, ...user.permisos.finanzas },
    tickets: { ...defaults.tickets, ...user.permisos.tickets },
    usuarios: { ...defaults.usuarios, ...user.permisos.usuarios },
  };
}
