import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";

/**
 * Verifica que el usuario esté autenticado y que el token no haya expirado.
 * Si no está autenticado → redirige a /login guardando la ruta original.
 */
export function PrivateRoute() {
  const { isAuthenticated, token, logout } = useAuthStore();
  const location = useLocation();

  // Verificar expiración del JWT sin librería adicional
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        logout();
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    } catch {
      logout();
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
