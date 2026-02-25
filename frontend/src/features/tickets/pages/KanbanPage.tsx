import { useState } from "react";
import { Button, Group, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketForm } from "../components/TicketForm";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion } from "../../../types";

const DEMO_TICKETS: TicketReparacion[] = [
  {
    id: "t1",
    clienteId: "c1",
    cliente: {
      id: "c1",
      nombre: "Juan Pérez",
      cedula: "V-12345678",
      telefono: "0412-1234567",
      correo: "juan@example.com",
    },
    tipo_equipo: "Smartphone",
    marca: "Apple",
    modelo: "iPhone 13",
    imei: "123456789012345",
    clave: "1234",
    patron_visual: "1,2,3",
    checklist: {
      camaras: true,
      touch: true,
      senal: true,
      encendido: true,
      botones: true,
    },
    falla: "Pantalla rota",
    estado: "RECIBIDO",
    costo_repuestos_usd: 50,
    precio_total_usd: 120,
    porcentaje_tecnico: 0.4,
    tecnicoId: "u2",
    fecha_ingreso: new Date().toISOString(),
  },
  {
    id: "t2",
    clienteId: "c2",
    cliente: {
      id: "c2",
      nombre: "María García",
      cedula: "V-87654321",
      telefono: "0414-7654321",
    },
    tipo_equipo: "Smartphone",
    marca: "Samsung",
    modelo: "S22 Ultra",
    imei: "987654321098765",
    clave: "0000",
    patron_visual: "4,5,6",
    checklist: {
      camaras: true,
      touch: false,
      senal: true,
      encendido: true,
      botones: true,
    },
    falla: "No carga",
    estado: "EN_REVISION",
    costo_repuestos_usd: 30,
    precio_total_usd: 80,
    porcentaje_tecnico: 0.4,
    tecnicoId: "u3",
    fecha_ingreso: new Date().toISOString(),
  },
  {
    id: "t3",
    clienteId: "c3",
    cliente: {
      id: "c3",
      nombre: "Pedro Lopez",
      cedula: "V-11223344",
      telefono: "0416-1122334",
    },
    tipo_equipo: "Tablet",
    marca: "Xiaomi",
    modelo: "Pad 5",
    imei: "556677889900112",
    clave: "abcd",
    checklist: {
      camaras: true,
      touch: true,
      senal: false,
      encendido: true,
      botones: true,
    },
    falla: "Puerto de carga sulfatado",
    estado: "ESPERANDO_REPUESTO",
    costo_repuestos_usd: 15,
    precio_total_usd: 45,
    porcentaje_tecnico: 0.4,
    tecnicoId: "u2",
    fecha_ingreso: "2025-11-20T10:00:00Z",
  },
];

export function KanbanPage() {
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(
    null,
  );

  const handleNewTicket = (values: TicketFormValues) => {
    console.log("Datos del Formulario:", values);
    closeForm();
    setSelectedTicket(null);
  };

  const handleEditTicket = (ticket: TicketReparacion) => {
    setSelectedTicket(ticket);
    openForm();
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
            setSelectedTicket(null);
            openForm();
          }}
        >
          Nuevo Ticket
        </Button>
      </Group>

      <KanbanBoard tickets={DEMO_TICKETS} onTicketClick={handleEditTicket} />

      <TicketForm
        opened={formOpened}
        onClose={() => {
          closeForm();
          setSelectedTicket(null);
        }}
        initialData={selectedTicket}
        onSubmit={handleNewTicket}
      />
    </Stack>
  );
}
