import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Button,
  Group,
  Divider,
  Checkbox,
  SimpleGrid,
  Text,
  Paper,
  Slider,
  Badge,
  Popover,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconFingerprint,
  IconPlus,
  IconSearch,
  IconUserCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion } from "../../../types";
import { calcularTotales } from "../utils/calculations";
import { PatternCanvas } from "./PatternCanvas";
import {
  useMarcas,
  useCreateMarca,
  useModelosByMarca,
  useCreateModelo,
  useClientByCedula,
  useCreateClient,
  useUsers,
} from "../../../services";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  initialData?: TicketReparacion | null;
}

export function TicketForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: TicketFormProps) {
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | null>(null);
  const [marcaSearch, setMarcaSearch] = useState("");
  const [modeloSearch, setModeloSearch] = useState("");

  // -- Client lookup state --
  const [cedula, setCedula] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteCorreo, setClienteCorreo] = useState("");
  const { data: foundClient, isFetching: searchingClient } =
    useClientByCedula(cedula);
  const createClient = useCreateClient();

  // -- Técnicos from DB --
  const { data: allUsers = [] } = useUsers();
  const tecnicoOptions = allUsers
    .filter((u) => u.rol === "TECNICO")
    .map((u) => ({ value: u.id, label: u.nombre }));

  // Auto-set clienteId when a client is found by cédula
  useEffect(() => {
    if (foundClient) {
      form.setFieldValue("clienteId", foundClient.id);
    }
  }, [foundClient]);

  // -- API hooks for Marcas / Modelos --
  const { data: marcas = [], isLoading: loadingMarcas } = useMarcas();
  const createMarca = useCreateMarca();
  const { data: modelos = [], isLoading: loadingModelos } = useModelosByMarca(
    selectedMarcaId ?? undefined,
  );
  const createModelo = useCreateModelo();

  const form = useForm<TicketFormValues>({
    initialValues: {
      clienteId: "",
      tecnicoId: undefined,
      tipo_equipo: "Smartphone",
      marca: "",
      modelo: "",
      imei: "",
      clave: "",
      patron_visual: "",
      checklist: {
        camaras: false,
        touch: false,
        senal: false,
        encendido: false,
        botones: false,
      },
      falla: "",
      falla_reportada: "",
      observaciones: "",
      costo_repuestos_usd: 0,
      precio_total_usd: 0,
      porcentaje_tecnico: 0.4,
    },
  });

  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          clienteId: initialData.clienteId,
          tecnicoId: initialData.tecnicoId,
          tipo_equipo: initialData.tipo_equipo,
          marca: initialData.marca,
          modelo: initialData.modelo,
          imei: initialData.imei || "",
          clave: initialData.clave || "",
          patron_visual: initialData.patron_visual || "",
          checklist:
            (initialData.checklist as TicketFormValues["checklist"]) || {
              camaras: false,
              touch: false,
              senal: false,
              encendido: false,
              botones: false,
            },
          falla: initialData.falla,
          falla_reportada: initialData.falla_reportada || "",
          observaciones: initialData.observaciones || "",
          costo_repuestos_usd: initialData.costo_repuestos_usd,
          precio_total_usd: initialData.precio_total_usd,
          porcentaje_tecnico: initialData.porcentaje_tecnico,
        });
        // Find the marcaId for the initial marca name
        const marca = marcas.find((m) => m.nombre === initialData.marca);
        if (marca) setSelectedMarcaId(marca.id);
      } else {
        form.reset();
        setSelectedMarcaId(null);
      }
    }
  }, [initialData, opened]);

  // Build select data for marcas
  const marcaOptions = marcas.map((m) => ({
    value: m.nombre,
    label: m.nombre,
  }));

  // Build select data for modelos (from selected marca's modelos)
  const modeloOptions = selectedMarcaId
    ? modelos.map((m) => ({ value: m.nombre, label: m.nombre }))
    : marcas
        .find((m) => m.nombre === form.values.marca)
        ?.modelos?.map((m) => ({ value: m.nombre, label: m.nombre })) || [];

  const handleMarcaChange = (value: string | null) => {
    form.setFieldValue("marca", (value || "").toUpperCase());
    form.setFieldValue("modelo", ""); // reset modelo when marca changes
    const marca = marcas.find((m) => m.nombre === (value || "").toUpperCase());
    setSelectedMarcaId(marca?.id ?? null);
  };

  const handleCreateMarcaInline = async () => {
    if (!marcaSearch.trim()) return;
    try {
      const newMarca = await createMarca.mutateAsync(
        marcaSearch.trim().toUpperCase(),
      );
      form.setFieldValue("marca", newMarca.nombre);
      setSelectedMarcaId(newMarca.id);
      setMarcaSearch("");
      notifications.show({
        title: "Marca creada",
        message: `"${newMarca.nombre}" fue agregada`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo crear la marca",
        color: "red",
      });
    }
  };

  const handleCreateModeloInline = async () => {
    if (!modeloSearch.trim() || !selectedMarcaId) return;
    try {
      const newModelo = await createModelo.mutateAsync({
        marcaId: selectedMarcaId,
        nombre: modeloSearch.trim().toUpperCase(),
      });
      form.setFieldValue("modelo", newModelo.nombre);
      setModeloSearch("");
      notifications.show({
        title: "Modelo creado",
        message: `"${newModelo.nombre}" fue agregado`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo crear el modelo",
        color: "red",
      });
    }
  };

  const precioTotal = Number(form.values.precio_total_usd || 0);
  const costoRepuestos = Number(form.values.costo_repuestos_usd || 0);
  const porcentaje = Number(form.values.porcentaje_tecnico || 0);

  const { pagoTecnico, gananciaLocal } = calcularTotales(
    precioTotal,
    costoRepuestos,
    porcentaje,
  );

  const modalTitle = initialData
    ? `Editar Ticket #T-${initialData.id.substring(0, 6)}`
    : "Ingreso de Orden de Servicio";

  const handleSubmit = (values: TicketFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Divider label="1. Datos del Cliente" labelPosition="center" />

          {/* Cédula lookup field */}
          <TextInput
            label="Cédula del Cliente"
            placeholder="V-12345678"
            required
            value={cedula}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setCedula(val);
              // Reset new-client fields when cedula changes
              setClienteNombre("");
              setClienteTelefono("");
              setClienteCorreo("");
              form.setFieldValue("clienteId", "");
            }}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchingClient ? (
                <Loader size={14} />
              ) : foundClient ? (
                <IconUserCheck size={16} color="var(--mantine-color-green-6)" />
              ) : undefined
            }
            description={
              cedula.length >= 3 && !searchingClient
                ? foundClient
                  ? "✅ Cliente encontrado"
                  : "Cliente no registrado — completa los datos abajo"
                : "Escribe al menos 3 caracteres"
            }
          />

          {/* Client found card */}
          {foundClient && cedula.length >= 3 && (
            <Paper
              p="sm"
              radius="md"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUserCheck
                    size={18}
                    color="var(--mantine-color-green-6)"
                  />
                  <div>
                    <Text size="sm" fw={600}>
                      {foundClient.nombre}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {foundClient.cedula} • {foundClient.telefono}
                      {foundClient.correo ? ` • ${foundClient.correo}` : ""}
                    </Text>
                  </div>
                </Group>
                <Badge variant="light" color="green" size="sm">
                  {foundClient._count?.tickets ?? 0} tickets
                </Badge>
              </Group>
            </Paper>
          )}

          {/* New client form (when not found) */}
          {!foundClient && cedula.length >= 3 && !searchingClient && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px dashed rgba(59, 130, 246, 0.2)",
              }}
            >
              <Group gap="xs" mb="sm">
                <IconUserPlus size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" fw={600}>
                  Nuevo Cliente
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <TextInput
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Teléfono"
                  placeholder="0414-1234567"
                  required
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Correo (opcional)"
                  placeholder="email@ejemplo.com"
                  value={clienteCorreo}
                  onChange={(e) => setClienteCorreo(e.currentTarget.value)}
                  size="sm"
                />
              </SimpleGrid>
              <Button
                mt="sm"
                size="sm"
                leftSection={<IconUserPlus size={14} />}
                disabled={!clienteNombre.trim() || !clienteTelefono.trim()}
                loading={createClient.isPending}
                onClick={async () => {
                  try {
                    const newClient = await createClient.mutateAsync({
                      nombre: clienteNombre.trim(),
                      cedula: cedula.trim(),
                      telefono: clienteTelefono.trim(),
                      correo: clienteCorreo.trim() || undefined,
                    });
                    form.setFieldValue("clienteId", newClient.id);
                    notifications.show({
                      title: "Cliente registrado",
                      message: `${newClient.nombre} fue creado exitosamente`,
                      color: "green",
                    });
                  } catch {
                    notifications.show({
                      title: "Error",
                      message: "No se pudo crear el cliente",
                      color: "red",
                    });
                  }
                }}
              >
                Registrar Cliente
              </Button>
            </Paper>
          )}

          <Divider label="2. Información del Equipo" labelPosition="center" />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Select
              label="Tipo de Equipo"
              data={[
                { value: "Smartphone", label: "Smartphone" },
                { value: "Tablet", label: "Tablet" },
                { value: "Laptop", label: "Laptop" },
                { value: "Otro", label: "Otro" },
              ]}
              {...form.getInputProps("tipo_equipo")}
            />

            {/* ── MARCA select with inline create ── */}
            <Select
              label="Marca"
              placeholder="Buscar marca..."
              data={marcaOptions}
              value={form.values.marca || null}
              onChange={handleMarcaChange}
              searchable
              onSearchChange={setMarcaSearch}
              searchValue={marcaSearch}
              rightSection={loadingMarcas ? <Loader size={14} /> : undefined}
              nothingFoundMessage={
                marcaSearch.trim() ? (
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    leftSection={<IconPlus size={14} />}
                    fullWidth
                    onClick={handleCreateMarcaInline}
                    loading={createMarca.isPending}
                  >
                    Crear &quot;{marcaSearch.trim()}&quot;
                  </Button>
                ) : (
                  "Escribe para buscar"
                )
              }
            />

            {/* ── MODELO select with inline create ── */}
            <Select
              label="Modelo"
              placeholder={
                selectedMarcaId
                  ? "Buscar modelo..."
                  : "Selecciona marca primero"
              }
              data={modeloOptions}
              value={form.values.modelo || null}
              onChange={(v) =>
                form.setFieldValue("modelo", (v || "").toUpperCase())
              }
              searchable
              onSearchChange={setModeloSearch}
              searchValue={modeloSearch}
              disabled={!form.values.marca}
              rightSection={loadingModelos ? <Loader size={14} /> : undefined}
              nothingFoundMessage={
                modeloSearch.trim() && selectedMarcaId ? (
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    leftSection={<IconPlus size={14} />}
                    fullWidth
                    onClick={handleCreateModeloInline}
                    loading={createModelo.isPending}
                  >
                    Crear &quot;{modeloSearch.trim()}&quot;
                  </Button>
                ) : (
                  "Escribe para buscar"
                )
              }
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="IMEI"
              placeholder="15 dígitos"
              {...form.getInputProps("imei")}
            />
            <TextInput
              label="Clave/PIN"
              placeholder="1234"
              {...form.getInputProps("clave")}
            />
          </SimpleGrid>

          <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <TextInput
                label="Patrón Visual"
                placeholder="Click para dibujar"
                readOnly
                leftSection={<IconFingerprint size={16} />}
                style={{ cursor: "pointer" }}
                {...form.getInputProps("patron_visual")}
              />
            </Popover.Target>
            <Popover.Dropdown bg="gray.9">
              <Text size="xs" fw={700} mb="xs" c="white" ta="center">
                {initialData
                  ? "PATRÓN GUARDADO (ANIMACIÓN)"
                  : "DIBUJA EL PATRÓN EN LOS PUNTOS"}
              </Text>
              <PatternCanvas
                mode={initialData ? "view" : "draw"}
                value={form.values.patron_visual || ""}
                onPatternComplete={(pattern) =>
                  form.setFieldValue("patron_visual", pattern)
                }
              />
            </Popover.Dropdown>
          </Popover>

          <Divider
            label="3. Estado al Recibir (Checklist)"
            labelPosition="center"
          />
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }}>
            <Checkbox
              label="Cámaras"
              {...form.getInputProps("checklist.camaras", { type: "checkbox" })}
            />
            <Checkbox
              label="Touch"
              {...form.getInputProps("checklist.touch", { type: "checkbox" })}
            />
            <Checkbox
              label="Señal"
              {...form.getInputProps("checklist.senal", { type: "checkbox" })}
            />
            <Checkbox
              label="Enciende"
              {...form.getInputProps("checklist.encendido", {
                type: "checkbox",
              })}
            />
            <Checkbox
              label="Botones"
              {...form.getInputProps("checklist.botones", { type: "checkbox" })}
            />
          </SimpleGrid>
          <Textarea
            label="Falla Reportada"
            required
            {...form.getInputProps("falla")}
          />
          <Textarea
            label="Observaciones"
            {...form.getInputProps("observaciones")}
          />

          <Divider label="4. Costos y Split Dinámico" labelPosition="center" />
          <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
            <NumberInput
              label="Precio Cliente ($)"
              prefix="$"
              min={0}
              {...form.getInputProps("precio_total_usd")}
            />
            <NumberInput
              label="Precio Proveedor Repuestos ($)"
              prefix="$"
              min={0}
              {...form.getInputProps("costo_repuestos_usd")}
            />
            <Select
              label="Técnico"
              placeholder="Asignar"
              data={tecnicoOptions}
              searchable
              nothingFoundMessage="Sin técnicos disponibles"
              onChange={(v) => form.setFieldValue("tecnicoId", v || undefined)}
              value={form.values.tecnicoId || null}
            />
          </SimpleGrid>

          <Stack gap={5} px="md" py="xs">
            <Group justify="space-between">
              <Text size="sm" fw={700}>
                Comisión Técnico:
              </Text>
              <Badge size="lg" variant="light">
                {(porcentaje * 100).toFixed(0)}%
              </Badge>
            </Group>
            <Slider
              step={5}
              min={0}
              max={100}
              label={(val) => `${Math.round(val)}%`}
              value={porcentaje * 100}
              onChange={(val) =>
                form.setFieldValue("porcentaje_tecnico", val / 100)
              }
              marks={[
                { value: 20, label: "20%" },
                { value: 40, label: "40%" },
                { value: 60, label: "60%" },
              ]}
            />
          </Stack>

          {/* Resumen Final */}
          <Paper withBorder p="sm" bg="gray.0" mt="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Mano de Obra Neta
                </Text>
                <Text fw={700}>
                  ${(precioTotal - costoRepuestos).toFixed(2)}
                </Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Pago Técnico ({(porcentaje * 100).toFixed(0)}%)
                </Text>
                <Text fw={700} c="blue">
                  ${(Number(pagoTecnico) || 0).toFixed(2)}
                </Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Tu Ganancia
                </Text>
                <Text fw={700} c="green">
                  ${(Number(gananciaLocal) || 0).toFixed(2)}
                </Text>
              </Stack>
            </SimpleGrid>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Actualizar Ticket" : "Crear Ticket"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
