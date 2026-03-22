import { useState, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { useAuthStore } from "../../../../auth/store/auth.store";
import type { Producto } from "../../../../../types";
import { formatCurrency } from "../../../../../utils/currency";

export interface CartItem {
  productoId: string;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
}

export function useSaleCart() {
  const user = useAuthStore((state) => state.user);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [descuento, setDescuento] = useState<number>(0);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0),
    [cart]
  );
  const total = Math.max(0, subtotal - descuento);

  const getLocalStock = (producto: Producto) => {
    const isAdmin = user?.rol === "ADMIN";
    if (isAdmin) return producto.stock_actual;

    if (producto.inventario_sucursales) {
      const localInv = producto.inventario_sucursales.find(
        (inv) => inv.sucursalId === user?.sucursalId
      );
      return localInv?.stock || 0;
    }
    return producto.stock_actual;
  };

  // delta is the amount to add (positive or negative)
  const updateQuantity = (productoId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productoId !== productoId) return item;

        const maxStock = getLocalStock(item.producto);
        const newQty = Math.max(1, Math.min(maxStock, item.cantidad + delta));
        return { ...item, cantidad: newQty };
      })
    );
  };

  const addProduct = (product: Producto, qtyToAdd: number = 1) => {
    const existing = cart.find((item) => item.productoId === product.id);
    const maxStock = getLocalStock(product);
    const currentQty = existing ? existing.cantidad : 0;

    if (currentQty + qtyToAdd > maxStock) {
      notifications.show({
        title: user?.rol === "ADMIN" ? "Stock Global Insuficiente" : "Stock Local Insuficiente",
        message: `Solo quedan ${maxStock - currentQty} unidades disponibles.`,
        color: "red",
      });
      return;
    }

    if (existing) {
      notifications.show({
        title: "Cantidad actualizada",
        message: `${product.nombre} — sumado ${qtyToAdd} unidades`,
        color: "blue",
      });
      setCart((prev) =>
        prev.map((item) =>
          item.productoId === product.id
            ? { ...item, cantidad: item.cantidad + qtyToAdd }
            : item
        )
      );
    } else {
      notifications.show({
        title: "Producto agregado",
        message: `${product.nombre} x${qtyToAdd} — $${formatCurrency(product.precio_usd * qtyToAdd)}`,
        color: "green",
      });
      setCart((prev) => [
        ...prev,
        {
          productoId: product.id,
          producto: product,
          cantidad: qtyToAdd,
          precio_unitario: product.precio_usd,
        },
      ]);
    }
  };

  const removeProduct = (productoId: string) => {
    setCart((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const updatePrice = (productoId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productoId === productoId ? { ...item, precio_unitario: price } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDescuento(0);
  };

  return {
    cart,
    subtotal,
    descuento,
    setDescuento,
    total,
    addProduct,
    removeProduct,
    updateQuantity,
    updatePrice,
    clearCart,
    getLocalStock,
  };
}
