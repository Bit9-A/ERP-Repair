import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

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

export const router = createBrowserRouter([
  // -- Public routes --
  {
    path: "/login",
    element: <LoginPage />,
  },

  // -- Protected routes (inside AppShell) --
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "inventario", element: <InventoryPage /> },
      { path: "reparaciones", element: <KanbanPage /> },
      { path: "ventas", element: <SalesPage /> },
      { path: "finanzas", element: <FinancePage /> },
      { path: "usuarios", element: <UsersPage /> },
    ],
  },

  // -- Catch-all --
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
