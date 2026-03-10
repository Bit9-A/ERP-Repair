// ============================================
// Centralized React Query keys
// ============================================

export const queryKeys = {
  // -- Users --
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", id] as const,
    me: ["users", "me"] as const,
  },

  // -- Inventory --
  inventory: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["inventory", filters] as const) : (["inventory"] as const),
    detail: (id: string) => ["inventory", id] as const,
    stats: ["inventory", "stats"] as const,
    lowStock: ["inventory", "low-stock"] as const,
    movimientos: (id: string) => ["inventory", id, "movimientos"] as const,
  },

  // -- Repairs --
  repairs: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["repairs", filters] as const) : (["repairs"] as const),
    detail: (id: string) => ["repairs", id] as const,
    kanbanCounts: ["repairs", "kanban-counts"] as const,
  },

  // -- Catalog (servicios de reparación) --
  catalog: {
    all: ["catalog"] as const,
    detail: (id: string) => ["catalog", id] as const,
  },

  // -- Sales --
  sales: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["sales", filters] as const) : (["sales"] as const),
    detail: (id: string) => ["sales", id] as const,
    stats: ["sales", "stats"] as const,
  },

  // -- Finance --
  finance: {
    monedas: ["finance", "monedas"] as const,
    pagos: (fecha?: string) =>
      fecha
        ? (["finance", "pagos", fecha] as const)
        : (["finance", "pagos"] as const),
    cierre: (fecha?: string) =>
      fecha
        ? (["finance", "cierre", fecha] as const)
        : (["finance", "cierre"] as const),
    stats: ["finance", "stats"] as const,
    egresos: (periodo?: string) =>
      periodo
        ? (["finance", "egresos", periodo] as const)
        : (["finance", "egresos"] as const),
    recurrentes: ["finance", "egresos", "recurrentes"] as const,
  },

  // -- Transactions --
  transactions: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["transactions", filters] as const)
        : (["transactions"] as const),
    statsHoy: ["transactions", "stats"] as const,
    balance: (desde?: string, hasta?: string) =>
      ["transactions", "balance", { desde, hasta }] as const,
    categorias: (desde?: string, hasta?: string) =>
      ["transactions", "categorias", { desde, hasta }] as const,
  },

  // -- Dashboard --
  dashboard: {
    data: ["dashboard", "data"] as const,
  },
} as const;
