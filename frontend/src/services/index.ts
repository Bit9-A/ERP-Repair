// ============================================
// Barrel export — services/
// ============================================

// -- Query keys --
export { queryKeys } from "./queryKeys";

// -- API services --
export * as authService from "./auth.service";
export * as usersService from "./users.service";
export * as inventoryService from "./inventory.service";
export * as repairsService from "./repairs.service";
export * as catalogService from "./catalog.service";
export * as salesService from "./sales.service";
export * as financeService from "./finance.service";
export * as transactionsService from "./transactions.service";
export * as dashboardService from "./dashboard.service";
export * as sucursalesService from "./sucursales.service";

// -- React Query hooks --
export {
  useMe,
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "./hooks/useUsers";

export {
  useProducts,
  useProduct,
  useInventoryStats,
  useLowStock,
  useMovimientos,
  useCreateProduct,
  useUpdateProduct,
  useAdjustStock,
  useAddStock,
  useHistorialPrecios,
  useDeleteProduct,
} from "./hooks/useInventory";

export {
  useRepairs,
  useRepair,
  useKanbanCounts,
  useCreateRepair,
  useUpdateRepair,
  useUpdateEstado,
  useAddRepuesto,
  useAddServicio,
  useDeleteRepair,
} from "./hooks/useRepairs";

export {
  useServicios,
  useServicio,
  useCreateServicio,
  useUpdateServicio,
  useDeleteServicio,
} from "./hooks/useCatalog";

export {
  useSales,
  useSale,
  useSalesStats,
  useCreateSale,
  useMarcarPagada,
  useAnularVenta,
} from "./hooks/useSales";

export {
  useMonedas,
  useCreateMoneda,
  useUpdateTasa,
  usePagos,
  useRegistrarPago,
  useCierre,
  useFinanceStats,
} from "./hooks/useFinance";

export {
  useTransactions,
  useCreateTransaction,
  useTransactionStatsHoy,
  useBalance,
  useTransactionsByCategoria,
} from "./hooks/useTransactions";

export {
  useMarcas,
  useCreateMarca,
  useDeleteMarca,
  useModelosByMarca,
  useCreateModelo,
} from "./hooks/useBrands";

export * as brandsService from "./brands.service";
export * as clientsService from "./clients.service";

export {
  useClients,
  useClient,
  useClientByCedula,
  useCreateClient,
  useUpdateClient,
} from "./hooks/useClients";

export { useDashboardData } from "./hooks/useDashboard";

export {
  useSucursales,
  useSucursal,
  useSucursalInventario,
  useInventarioTotal,
  useCreateSucursal,
  useUpdateSucursal,
  useDeleteSucursal,
  useTransferirStock,
} from "./hooks/useSucursales";

// -- Service types re-exports --
export type { LoginPayload, LoginResponse } from "./auth.service";
export type { CreateUserPayload, UpdateUserPayload } from "./users.service";
export type {
  InventoryFilters,
  CreateProductPayload,
  UpdateProductPayload,
  AdjustStockPayload,
  AddStockPayload,
  InventoryStats,
} from "./inventory.service";
export type {
  RepairsFilters,
  CreateRepairPayload,
  UpdateRepairPayload,
  KanbanCounts,
} from "./repairs.service";
export type {
  CreateServicioPayload,
  UpdateServicioPayload,
} from "./catalog.service";
export type {
  SalesFilters,
  CreateSalePayload,
  SalesStats,
} from "./sales.service";
export type {
  CreateMonedaPayload,
  RegisterPagoPayload,
  CierreDeCaja,
  FinanceStats,
} from "./finance.service";
export type {
  TransactionsFilters,
  CreateTransactionPayload,
  TransactionBalance,
  TransactionStatsHoy,
  CategoriaBreakdown,
} from "./transactions.service";
