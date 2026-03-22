import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Stack,
  Group,
  Title,
  ActionIcon,
  ScrollArea,
  LoadingOverlay,
  Text,
  Button,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { useProducts, useMonedas, useCreateSale } from "../../../services";
import { useAuthStore } from "../../auth/store/auth.store";
import type { MetodoPago } from "../../../types";

// Extracted Components & Hooks
import { useSaleCart } from "./sale-form/hooks/useSaleCart";
import { ClientSection } from "./sale-form/ClientSection";
import { ProductSearchSection } from "./sale-form/ProductSearchSection";
import { CartTable } from "./sale-form/CartTable";
import { PaymentSection } from "./sale-form/PaymentSection";
import { SummarySection } from "./sale-form/SummarySection";

interface SaleFormProps {
  opened: boolean;
  onClose: () => void;
}

export function SaleForm({ opened, onClose }: SaleFormProps) {
  const { user } = useAuthStore();
  const createSale = useCreateSale();

  // Queries
  const { data: allProducts = [], isLoading: loadingProducts } = useProducts();
  const { data: monedas = [], isLoading: loadingMonedas } = useMonedas();

  // Encapsulated Cart State
  const {
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
  } = useSaleCart();

  // Payment State
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);
  const [selectedMonedaId, setSelectedMonedaId] = useState<string>("");
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago>("EFECTIVO");
  const [referencia, setReferencia] = useState("");
  const [editableRates, setEditableRates] = useState<Record<string, number>>({});
  
  // To remount and reset internal state of ClientSection when form is reset
  const [resetKey, setResetKey] = useState(0);

  // Initialize selected currency and editable rates based on active currencies
  useEffect(() => {
    if (monedas.length > 0) {
      if (!selectedMonedaId) {
        // Defaults to USD if found, else first available
        const defaultMoneda =
          monedas.find((m) => m.codigo === "USD") || monedas[0];
        setSelectedMonedaId(defaultMoneda.id);
      }

      const initialRates: Record<string, number> = {};
      monedas.forEach((m) => {
        if (m.codigo !== "USD") {
          initialRates[m.codigo] = m.tasa_cambio;
        }
      });
      // Only set initial rates once or when completely empty
      setEditableRates((prev) => (Object.keys(prev).length === 0 ? initialRates : prev));
    }
  }, [monedas, selectedMonedaId]);

  const selectedMonedaObj = useMemo(
    () => monedas.find((m) => m.id === selectedMonedaId),
    [monedas, selectedMonedaId]
  );

  const getRate = (codigo: string) => {
    if (codigo === "USD") return 1;
    return editableRates[codigo] || 1;
  };

  const paymentRate = selectedMonedaObj ? getRate(selectedMonedaObj.codigo) : 1;

  const resetForm = () => {
    clearCart();
    setClienteId(undefined);
    setReferencia("");
    setSelectedMetodo("EFECTIVO");
    setResetKey((k) => k + 1);

    const baseData = monedas.find((m) => m.codigo === "USD") || monedas[0];
    if (baseData) setSelectedMonedaId(baseData.id);
  };

  useEffect(() => {
    if (!opened) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      notifications.show({
        title: "Carrito vacío",
        message: "No puede procesar una venta sin productos.",
        color: "red",
      });
      return;
    }

    if (!selectedMonedaId) {
      notifications.show({
        title: "Error",
        message: "Debe seleccionar una moneda de pago.",
        color: "red",
      });
      return;
    }

    if (
      selectedMetodo !== "EFECTIVO" &&
      !referencia.trim()
    ) {
      notifications.show({
        title: "Referencia obligatoria",
        message: "Debe ingresar el número de referencia para este método de pago.",
        color: "red",
      });
      return;
    }

    // If payment is in another currency, calculate amount paying and final USD
    let montoTotalUsd = total;
    const monto_pagado_moneda = Number((total * paymentRate).toFixed(2));

    try {
      await createSale.mutateAsync({
        clienteId,
        sucursalId: user?.sucursalId || undefined,
        vendedorId: user?.id || undefined,
        descuento_usd: descuento,
        items: cart.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
        pago: {
          monedaId: selectedMonedaId,
          monto_moneda_local: monto_pagado_moneda,
          equivalente_usd: montoTotalUsd,
          metodo: selectedMetodo,
          referencia: referencia.trim() || undefined,
        },
      });

      notifications.show({
        title: "Éxito",
        message: "Venta registrada correctamente.",
        color: "green",
      });
      resetForm();
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo registrar la venta.",
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="md"
      withCloseButton={false}
      closeOnClickOutside={false}
      padding={0}
      yOffset="2vh"
      styles={{
        inner: { padding: "1rem" },
        content: {
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 4vh)",
          maxHeight: "none",
          overflow: "hidden"
        },
        body: {
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: 0,
          minHeight: 0
        }
      }}
    >
      {/* HEADER */}
      <Group
        justify="space-between"
        p="md"
        style={{
          flexShrink: 0,
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <Title order={3} size="h4" fw={700}>
            Nueva Venta
          </Title>
          <Text size="xs" c="dimmed">
            Registre los productos y método de pago
          </Text>
        </div>
        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
          <IconX size={20} />
        </ActionIcon>
      </Group>

      {/* BODY */}
      <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
        <Stack p="md" gap="lg" pos="relative">
            <LoadingOverlay
            visible={loadingProducts || loadingMonedas || createSale.isPending}
            zIndex={100}
            overlayProps={{ radius: "sm", blur: 2 }}
          />

          <ClientSection key={`client-${resetKey}`} onClientSelect={setClienteId} />

          <ProductSearchSection
            allProducts={allProducts}
            cart={cart}
            user={user}
            getLocalStock={getLocalStock}
            onAddProduct={addProduct}
          />

          <CartTable
            cart={cart}
            user={user}
            getLocalStock={getLocalStock}
            onUpdateQuantity={updateQuantity}
            onUpdatePrice={updatePrice}
            onRemoveProduct={removeProduct}
          />

          <PaymentSection
            monedas={monedas}
            selectedMonedaId={selectedMonedaId}
            setSelectedMonedaId={setSelectedMonedaId}
            selectedMetodo={selectedMetodo}
            setSelectedMetodo={setSelectedMetodo}
            referencia={referencia}
            setReferencia={setReferencia}
            paymentRate={paymentRate}
            selectedMonedaObj={selectedMonedaObj}
          />

          <SummarySection
            cart={cart}
            subtotal={subtotal}
            descuento={descuento}
            setDescuento={setDescuento}
            total={total}
            editableRates={editableRates}
            setEditableRates={setEditableRates}
            getRate={getRate}
          />
        </Stack>
      </ScrollArea>

      {/* FOOTER */}
      <Group
        justify="flex-end"
        p="md"
        style={{
          flexShrink: 0,
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Group gap="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            disabled={cart.length === 0}
            onClick={handleSubmit}
            loading={createSale.isPending}
          >
            Registrar Venta — ${total.toFixed(2)}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}
