import {
  Container,
  Group,
  Button,
  TextInput,
  Stack,
  Loader,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { IconSearch, IconUserPlus, IconDownload, IconUsers, IconTool, IconShoppingCart } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "../../../services/hooks/useClients";
import type { Cliente } from "../../../services/clients.service";
import { ClientTable } from "../components/ClientTable";
import { ClientForm, type ClientFormValues } from "../components/ClientForm";
import { ClientHistoryDrawer } from "../components/ClientHistoryDrawer";
import { exportClientsExcel } from "../../../services/excel/exportClientsExcel";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [historyOpened, { open: openHistory, close: closeHistory }] = useDisclosure(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [historyClient, setHistoryClient] = useState<Cliente | null>(null);

  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  // Metrics
  const metrics = useMemo(() => {
    let totalTickets = 0;
    let totalVentas = 0;
    let clientsWithTickets = 0;

    clients.forEach((c) => {
      const ticketsCount = c._count?.tickets || 0;
      const ventasCount = c._count?.ventas || 0;
      totalTickets += ticketsCount;
      totalVentas += ventasCount;
      if (ticketsCount > 0) clientsWithTickets++;
    });

    return {
      total: clients.length,
      clientsWithTickets,
      totalTickets,
      totalVentas,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const lower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lower) ||
        c.cedula.toLowerCase().includes(lower) ||
        c.telefono.includes(lower),
    );
  }, [clients, search]);

  const handleNew = () => {
    setEditingClient(null);
    open();
  };

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    open();
  };

  const handleDelete = async (client: Cliente) => {
    try {
      await deleteClient.mutateAsync(client.id);
      notifications.show({
        title: "Cliente eliminado",
        message: `${client.nombre} ha sido eliminado.`,
        color: "red",
      });
    } catch (e: any) {
      notifications.show({
        title: "Error al eliminar",
        message: e.response?.data?.error || "Error desconocido",
        color: "red",
      });
    }
  };

  const handleExport = async () => {
    if (filteredClients.length === 0) {
      notifications.show({
        title: "Sin datos",
        message: "No hay clientes para exportar.",
        color: "orange",
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportClientsExcel(filteredClients);
      notifications.show({
        title: "Exportación exitosa",
        message: "El directorio se ha exportado correctamente.",
        color: "green",
      });
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Error de Exportación",
        message: "Hubo un problema al generar el archivo Excel.",
        color: "red",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          nombre: values.nombre,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente actualizado",
          message: "Los datos se guardaron correctamente.",
          color: "green",
        });
      } else {
        await createClient.mutateAsync({
          nombre: values.nombre,
          cedula: values.cedula,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente registrado",
          message: `${values.nombre} ha sido agregado.`,
          color: "green",
        });
      }
      close();
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.response?.data?.error || "Revisa los datos.",
        color: "red",
      });
    }
  };

  return (
    <Container fluid p="0">
      <Stack gap="lg">
        {/* ── Executive Header (70% Sirac + 30% Sigepat) ── */}
        <div className="relative overflow-hidden rounded-[24px] p-6 lg:p-7 bg-gradient-to-r from-[#0b1320] via-[#131f33] to-[#18263d] text-white shadow-xl border border-[#1e324f]">
          {/* SIGEPAT watermark decorative icon */}
          <IconUsers className="absolute -right-6 -bottom-6 w-48 h-48 text-blue-400/[0.04] pointer-events-none rotate-12" />

          <Group justify="space-between" align="center" wrap="wrap" gap="md" className="relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30 uppercase tracking-widest font-sirac-title">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  MÓDULO DE OPERACIONES
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sirac-title border border-white/5">
                  {clients.length} REGISTRADOS
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold font-sirac-title text-white tracking-wide uppercase">
                Directorio de Clientes
              </h1>
              <p className="text-xs text-slate-300/80 mt-0.5 font-sirac-sub">
                Gestión de clientes, historial de servicios técnicos y ventas acumuladas
              </p>
            </div>

            <Group gap="sm">
              <Button
                variant="default"
                size="sm"
                leftSection={<IconDownload size={15} />}
                onClick={handleExport}
                loading={isExporting}
                className="bg-[#18263d]/80 hover:bg-[#18263d] text-white border-[#294163] rounded-xl text-xs font-semibold h-9 px-3.5 transition-all font-sirac-title tracking-wide"
              >
                Exportar
              </Button>

              <Button
                size="sm"
                leftSection={<IconUserPlus size={16} />}
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 text-xs font-bold h-9 px-4 transition-all font-sirac-title tracking-wider uppercase"
              >
                Nuevo Cliente
              </Button>
            </Group>
          </Group>

          {/* ── Stat Cards Grid (70% Sirac / 30% Sigepat) ── */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="lg" className="relative z-10">
            {/* Total Clientes */}
            <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                    TOTAL CLIENTES
                  </Text>
                  <Text size="xl" fw={800} className="font-heading text-slate-900 dark:text-white text-2xl">
                    {metrics.total}
                  </Text>
                </Stack>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <IconUsers size={18} />
                </div>
              </Group>
            </div>

            {/* Clientes con Reparaciones */}
            <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                    CON SERVICIO TÉCNICO
                  </Text>
                  <Text size="xl" fw={800} className="font-heading text-blue-600 dark:text-blue-400 text-2xl">
                    {metrics.clientsWithTickets}
                  </Text>
                </Stack>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <IconTool size={18} />
                </div>
              </Group>
            </div>

            {/* Total Reparaciones */}
            <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                    REPARACIONES HISTÓRICAS
                  </Text>
                  <Text size="xl" fw={800} className="font-heading text-emerald-600 dark:text-emerald-400 text-2xl">
                    {metrics.totalTickets}
                  </Text>
                </Stack>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <IconTool size={18} />
                </div>
              </Group>
            </div>

            {/* Ventas Registradas */}
            <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                    VENTAS POS
                  </Text>
                  <Text size="xl" fw={800} className="font-heading text-amber-600 dark:text-amber-400 text-2xl">
                    {metrics.totalVentas}
                  </Text>
                </Stack>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <IconShoppingCart size={18} />
                </div>
              </Group>
            </div>
          </SimpleGrid>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="flex items-center justify-between gap-4">
          <TextInput
            placeholder="Buscar por nombre, cédula o teléfono..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full sm:w-96"
            size="sm"
            styles={{
              input: {
                borderRadius: "12px",
              },
            }}
          />
        </div>

        {/* ── Content Table ── */}
        {isLoading ? (
          <Group justify="center" p="xl">
            <Loader size="lg" />
          </Group>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 dark:border-[#1e324f] bg-white dark:bg-[#131f33] overflow-hidden shadow-xs">
            <ClientTable
              clients={filteredClients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHistory={(client) => {
                setHistoryClient(client);
                openHistory();
              }}
            />
          </div>
        )}
      </Stack>

      <ClientForm
        opened={opened}
        onClose={close}
        onSubmit={handleSubmit}
        initialData={editingClient}
      />
      
      <ClientHistoryDrawer
        opened={historyOpened}
        onClose={closeHistory}
        cliente={historyClient}
      />
    </Container>
  );
}
