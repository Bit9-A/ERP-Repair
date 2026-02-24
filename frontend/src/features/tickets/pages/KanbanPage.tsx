import { useState } from "react"; // 1. Importamos useState
import { Button, Group, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketForm } from "../components/TicketForm";
import type { TicketReparacion, TicketFormValues } from "../types/tickets.types";

const DEMO_TICKETS: TicketReparacion[] = [
  {
    id: 1,
    cliente: { nombre: "Juan Pérez", cedula: "12345678", telefono: "0412-1234567", correo: "juan@example.com" },
    equipo: { tipo: "Smartphone", marca: "Apple", modelo: "iPhone 13", imei: "123456789012345", clave: "1234", patron: "1,2,3" },
    checklist: { camaras: true, touch: true, senal: true, encendido: true, botones: true },
    falla: "Pantalla rota",
    estado: "RECIBIDO",
    costo_repuestos_usd: 50,
    precio_total_usd: 120,
    porcentaje_tecnico: 0.40,
    tecnicoId: 1,
    fecha_ingreso: new Date().toISOString(),
  },
  {
    id: 2,
    cliente: { nombre: "María Garcia", cedula: "87654321", telefono: "0414-7654321" },
    equipo: { tipo: "Smartphone", marca: "Samsung", modelo: "S22 Ultra", imei: "987654321098765", clave: "0000", patron: "4,5,6" },
    checklist: { camaras: true, touch: false, senal: true, encendido: true, botones: true },
    falla: "No carga",
    estado: "EN_REVISION",
    costo_repuestos_usd: 30,
    precio_total_usd: 80,
    porcentaje_tecnico: 0.40,
    tecnicoId: 2,
    fecha_ingreso: new Date().toISOString(),
  },
  {
    id: 3,
    cliente: { nombre: "Pedro Lopez", cedula: "11223344", telefono: "0416-1122334" },
    equipo: { tipo: "Tablet", marca: "Xiaomi", modelo: "Pad 5", imei: "556677889900112", clave: "abcd", patron: "" },
    checklist: { camaras: true, touch: true, senal: false, encendido: true, botones: true },
    falla: "Puerto de carga sulfatado",
    estado: "ESPERANDO_REPUESTO",
    costo_repuestos_usd: 15,
    precio_total_usd: 45,
    porcentaje_tecnico: 0.40,
    tecnicoId: 1,
    fecha_ingreso: "2025-11-20T10:00:00Z", // Simulamos un ticket viejo (> 90 días)
  }
];

export function KanbanPage() {
  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);

  // 2. Estado para el ticket seleccionado
  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(null);

  const handleNewTicket = (values: TicketFormValues) => {
    console.log("Datos del Formulario:", values);
    // Aquí irá la lógica para guardar en DB
    closeForm();
    setSelectedTicket(null);
  };

  // 3. Función para abrir un ticket existente
  const handleEditTicket = (ticket: TicketReparacion) => {
    setSelectedTicket(ticket); // Guardamos la info del ticket
    openForm(); // Abrimos el mismo modal
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={3} c="gray.1">
          Tablero Kanban — Reparaciones
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setSelectedTicket(null); // Limpiamos por si acaso
            openForm();
          }}
        >
          Nuevo Ticket
        </Button>
      </Group>

      {/* 4. Pasamos la función handleEditTicket al tablero */}
      <KanbanBoard
        tickets={DEMO_TICKETS}
        onTicketClick={handleEditTicket}
      />

      {/* 5. Le pasamos el selectedTicket al Formulario */}
      <TicketForm
        opened={formOpened}
        onClose={() => {
          closeForm();
          setSelectedTicket(null);
        }}
        initialData={selectedTicket} // Prop nueva
        onSubmit={handleNewTicket}
      />
    </Stack>
  );
}