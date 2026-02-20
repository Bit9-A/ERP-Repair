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
const FinancePage = lazy(() =>
  import("../features/finance/pages/FinancePage").then((m) => ({
    default: m.FinancePage,
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
      { path: "finanzas", element: <FinancePage /> },
    ],
  },

  // -- Catch-all --
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
