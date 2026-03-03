import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { PrivateRoute } from "../components/guards/PrivateRoute";
import { RoleGuard } from "../components/guards/RoleGuard";

// -- Lazy-loaded pages --
const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("../features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const InventoryPage = lazy(() =>
  import("../features/inventory/pages/InventoryPage").then((m) => ({
    default: m.InventoryPage,
  })),
);
const KanbanPage = lazy(() =>
  import("../features/tickets/pages/KanbanPage").then((m) => ({
    default: m.KanbanPage,
  })),
);
const SalesPage = lazy(() =>
  import("../features/sales/pages/SalesPage").then((m) => ({
    default: m.SalesPage,
  })),
);
const FinancePage = lazy(() =>
  import("../features/finance/pages/FinancePage").then((m) => ({
    default: m.FinancePage,
  })),
);
const UsersPage = lazy(() =>
  import("../features/users/pages/UsersPage").then((m) => ({
    default: m.UsersPage,
  })),
);
const SucursalesPage = lazy(() =>
  import("../features/sucursales/pages/SucursalesPage").then((m) => ({
    default: m.SucursalesPage,
  })),
);

export const router = createBrowserRouter([
  // -- Public routes --
  {
    path: "/login",
    element: <LoginPage />,
  },

  // -- Protected routes (requires authentication) --
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Todos los roles pueden ver el Dashboard
          {
            index: true,
            element: <DashboardPage />,
          },

          // ADMIN + TECNICO + VENDEDOR pueden ver Inventario
          {
            path: "inventario",
            element: (
              <RoleGuard roles={["ADMIN", "TECNICO", "VENDEDOR"]}>
                <InventoryPage />
              </RoleGuard>
            ),
          },

          // ADMIN + TECNICO pueden ver Reparaciones
          {
            path: "reparaciones",
            element: (
              <RoleGuard roles={["ADMIN", "TECNICO"]}>
                <KanbanPage />
              </RoleGuard>
            ),
          },

          // ADMIN + VENDEDOR pueden ver Ventas
          {
            path: "ventas",
            element: (
              <RoleGuard roles={["ADMIN", "VENDEDOR"]}>
                <SalesPage />
              </RoleGuard>
            ),
          },

          // ADMIN + TECNICO pueden ver Finanzas
          {
            path: "finanzas",
            element: (
              <RoleGuard roles={["ADMIN", "TECNICO"]}>
                <FinancePage />
              </RoleGuard>
            ),
          },

          // Solo ADMIN puede ver Usuarios
          {
            path: "usuarios",
            element: (
              <RoleGuard roles={["ADMIN"]}>
                <UsersPage />
              </RoleGuard>
            ),
          },

          // Solo ADMIN puede ver Sucursales
          {
            path: "sucursales",
            element: (
              <RoleGuard roles={["ADMIN"]}>
                <SucursalesPage />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },

  // -- Catch-all --
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
