import { useState, useEffect } from "react";
import { Spotlight, type SpotlightActionData } from "@mantine/spotlight";
import {
  IconSearch,
  IconReceipt,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";
import { useSearch } from "../../hooks/useSearch";
import { useNavigate } from "react-router-dom";
import "@mantine/spotlight/styles.css";

export function GlobalSpotlight() {
  const [query, setQuery] = useState("");
  const { data } = useSearch(query);
  const navigate = useNavigate();

  const [actions, setActions] = useState<SpotlightActionData[]>([]);

  useEffect(() => {
    if (!data) {
      setActions([]);
      return;
    }

    const newActions: SpotlightActionData[] = [];

    // Map Tickets
    data.tickets.forEach((ticket) => {
      newActions.push({
        id: `ticket-${ticket.id}`,
        label: `${ticket.equipo} - ${ticket.falla_reportada}`,
        description: `Ticket: ${ticket.codigo_ticket} | Estado: ${ticket.estado}`,
        onClick: () =>
          navigate(
            `/reparaciones?search=${ticket.codigo_ticket || ticket.equipo}`,
          ),
        leftSection: <IconReceipt size={24} stroke={1.5} />,
        group: "Tickets de Reparación",
      });
    });

    // Map Productos
    data.productos.forEach((producto) => {
      newActions.push({
        id: `prod-${producto.id}`,
        label: producto.nombre || "Producto sin nombre",
        description: `SKU: ${producto.sku} | Stock: ${producto.stock_actual} | Precio: $${producto.precio_usd?.toFixed(2)}`,
        onClick: () =>
          navigate(`/inventario?search=${producto.sku || producto.nombre}`),
        leftSection: <IconPackage size={24} stroke={1.5} />,
        group: "Inventario",
      });
    });

    // Map Clientes
    data.clientes.forEach((cliente) => {
      newActions.push({
        id: `client-${cliente.id}`,
        label: cliente.nombre || "Cliente sin nombre",
        description: `Doc: ${cliente.cedula} | Correo: ${cliente.correo || "N/A"}`,
        onClick: () =>
          navigate(`/ventas?search=${cliente.cedula || cliente.nombre}`),
        leftSection: <IconUser size={24} stroke={1.5} />,
        group: "Clientes",
      });
    });

    setActions(newActions);
  }, [data, navigate]);

  return (
    <Spotlight
      actions={actions}
      nothingFound="No se encontraron resultados..."
      highlightQuery
      searchProps={{
        placeholder: "Buscar tickets, clientes, productos...",
        leftSection: <IconSearch stroke={1.5} size={20} />,
        onChange: (event) => setQuery(event.currentTarget.value),
        value: query,
      }}
      limit={15}
      scrollable
      maxHeight={400}
      shortcut={["mod + k", "mod + p", "/"]}
    />
  );
}
