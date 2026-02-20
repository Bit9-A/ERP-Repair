import { Button, Group, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketForm } from "../components/TicketForm";
import type { TicketReparacion } from "../../../types";
import type { TicketFormValues } from "../types/tickets.types";

// -- Demo data --
const DEMO_TICKETS: TicketReparacion[] = [
  {
    id: 1,
    clienteId: 1,
    tecnicoId: 1,
    equipo: "Samsung Galaxy A54",
    falla: "Pantalla rota, no enciende al cargar",
    estado: "RECIBIDO",
    mano_obra_usd: 15,
    fecha_ingreso: "2026-02-20",
    cliente: { id: 1, nombre: "María López", telefono: "0414-1234567" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 2,
    clienteId: 2,
    tecnicoId: 2,
    equipo: "iPhone 14",
    falla: "Batería se descarga rápido, solo dura 2h",
    estado: "EN_REVISION",
    mano_obra_usd: 10,
    fecha_ingreso: "2026-02-19",
    cliente: { id: 2, nombre: "Juan Pérez", telefono: "0412-9876543" },
    tecnico: { id: 2, nombre: "Ana", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 3,
    clienteId: 3,
    tecnicoId: 1,
    equipo: "Xiaomi Redmi Note 12",
    falla: "Conector de carga dañado, no carga",
    estado: "EN_REVISION",
    mano_obra_usd: 8,
    fecha_ingreso: "2026-02-18",
    cliente: { id: 3, nombre: "Rosa Martínez", telefono: "0416-5551234" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 4,
    clienteId: 4,
    tecnicoId: 1,
    equipo: "Motorola Moto G54",
    falla: "Táctil no responde en parte inferior",
    estado: "ESPERANDO_REPUESTO",
    mano_obra_usd: 12,
    fecha_ingreso: "2026-02-17",
    cliente: { id: 4, nombre: "Pedro García", telefono: "0424-7771234" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 5,
    clienteId: 5,
    tecnicoId: 2,
    equipo: "Samsung Galaxy S23 Ultra",
    falla: "Cámara trasera borrosa, posible daño en lente",
    estado: "ESPERANDO_REPUESTO",
    mano_obra_usd: 20,
    fecha_ingreso: "2026-02-16",
    cliente: { id: 5, nombre: "Luis Herrera", telefono: "0412-3214567" },
    tecnico: { id: 2, nombre: "Ana", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 6,
    clienteId: 6,
    tecnicoId: 2,
    equipo: "iPhone 13",
    falla: "Reemplazo de cámara posterior completado",
    estado: "REPARADO",
    mano_obra_usd: 18,
    fecha_ingreso: "2026-02-15",
    cliente: { id: 6, nombre: "Ana Torres", telefono: "0414-8889999" },
    tecnico: { id: 2, nombre: "Ana", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 7,
    clienteId: 7,
    tecnicoId: 1,
    equipo: "Huawei P30 Lite",
    falla: "Cambio de batería finalizado, funcional",
    estado: "REPARADO",
    mano_obra_usd: 8,
    fecha_ingreso: "2026-02-14",
    cliente: { id: 7, nombre: "Carmen Rivas", telefono: "0416-1112233" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 8,
    clienteId: 8,
    tecnicoId: 1,
    equipo: "Samsung Galaxy A34",
    falla: "Cliente retiró equipo reparado",
    estado: "ENTREGADO",
    mano_obra_usd: 10,
    fecha_ingreso: "2026-02-12",
    cliente: { id: 8, nombre: "Miguel Sánchez", telefono: "0424-4445566" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 9,
    clienteId: 1,
    tecnicoId: 2,
    equipo: "iPhone 12 Mini",
    falla: "Entregado al cliente, cambio de pantalla OK",
    estado: "ENTREGADO",
    mano_obra_usd: 15,
    fecha_ingreso: "2026-02-10",
    cliente: { id: 1, nombre: "María López", telefono: "0414-1234567" },
    tecnico: { id: 2, nombre: "Ana", rol: "TECNICO", createdAt: "" },
  },
  {
    id: 10,
    clienteId: 9,
    tecnicoId: 1,
    equipo: "Redmi Note 11",
    falla: "No enciende, posible daño en placa",
    estado: "RECIBIDO",
    mano_obra_usd: 0,
    fecha_ingreso: "2026-02-20",
    cliente: { id: 9, nombre: "Sofía Díaz", telefono: "0412-6667788" },
    tecnico: { id: 1, nombre: "Carlos", rol: "TECNICO", createdAt: "" },
  },
];

export function KanbanPage() {
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const handleNewTicket = (_values: TicketFormValues) => {
    // TODO: API integration
    closeForm();
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={3} c="gray.1">
          Tablero Kanban — Reparaciones
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openForm}>
          Nuevo Ticket
        </Button>
      </Group>

      <KanbanBoard tickets={DEMO_TICKETS} />

      <TicketForm
        opened={formOpened}
        onClose={closeForm}
        onSubmit={handleNewTicket}
      />
    </Stack>
  );
}
