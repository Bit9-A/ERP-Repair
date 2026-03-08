import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion } from "../../../types";
import {
  useMarcas,
  useCreateMarca,
  useModelosByMarca,
  useCreateModelo,
  useClientByCedula,
  useCreateClient,
  useUsers,
} from "../../../services";

import { usePermissions } from "../../../hooks/usePermissions";
import { useAuthStore } from "../../auth";

interface UseTicketFormProps {
  initialData?: TicketReparacion | null;
  opened: boolean;
  onSubmit: (values: TicketFormValues) => void;
}

export function useTicketForm({
  initialData,
  opened,
  onSubmit,
}: UseTicketFormProps) {
  // -- Local Selected State --
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | null>(null);
  const [marcaSearch, setMarcaSearch] = useState("");
  const [modeloSearch, setModeloSearch] = useState("");

  // -- Client Lookup State --
  const [cedula, setCedula] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteCorreo, setClienteCorreo] = useState("");

  const { data: foundClient, isFetching: searchingClient } =
    useClientByCedula(cedula);
  const createClient = useCreateClient();

  const user = useAuthStore((s) => s.user);
  const permisos = usePermissions();
  const canAsignarTecnico = permisos.tickets.asignar;
  const canEditarComision = permisos.tickets.editarComision;

  const { data: allUsers = [] } = useUsers();
  const tecnicoOptions = allUsers
    .filter((u: any) => u.rol === "TECNICO")
    .map((u: any) => ({ value: u.id, label: u.nombre }));

  const { data: marcas = [], isLoading: loadingMarcas } = useMarcas();
  const createMarca = useCreateMarca();
  const { data: modelos = [], isLoading: loadingModelos } = useModelosByMarca(
    selectedMarcaId ?? undefined,
  );
  const createModelo = useCreateModelo();

  // -- Form Initialization --
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
      mano_de_obra_usd: 0,
      costo_repuestos_usd: 0,
      precio_total_usd: 0,
      porcentaje_tecnico: 0.4,
    },
    validate: {
      clienteId: (v) =>
        !v || v.trim().length === 0 ? "El cliente es requerido" : null,
      marca: (v) =>
        !v || v.trim().length === 0 ? "La marca es requerida" : null,
      modelo: (v) =>
        !v || v.trim().length === 0 ? "El modelo es requerido" : null,
      falla: (v) =>
        !v || v.trim().length < 5
          ? "Especifique el problema (mín. 5 caracteres)"
          : null,
      mano_de_obra_usd: (v) =>
        v < 0 ? "No puede ser un valor negativo" : null,
      precio_total_usd: (v) =>
        v < 0 ? "El precio final no puede ser negativo" : null,
      porcentaje_tecnico: (v) =>
        v < 0 || v > 1 ? "Debe ser un valor entre 0 y 1" : null,
    },
  });

  // Client sync
  useEffect(() => {
    if (foundClient) {
      form.setFieldValue("clienteId", foundClient.id);
    } else if (!searchingClient && cedula.length > 0) {
      form.setFieldValue("clienteId", "");
    }
  }, [foundClient, searchingClient, cedula]);

  // Initial Data population
  useEffect(() => {
    if (opened) {
      if (initialData) {
        if (initialData.cliente) {
          setCedula(initialData.cliente.cedula || "");
          setClienteNombre(initialData.cliente.nombre || "");
          setClienteTelefono(initialData.cliente.telefono || "");
          setClienteCorreo(initialData.cliente.correo || "");
        }

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
          mano_de_obra_usd: Math.max(
            0,
            initialData.precio_total_usd -
              (initialData.repuestos?.reduce(
                (sum: number, r: any) =>
                  sum + r.precio_congelado_usd * r.cantidad,
                0,
              ) || 0) -
              (initialData.servicios?.reduce(
                (sum: number, s: any) => sum + s.precio_cobrado_usd,
                0,
              ) || 0),
          ),
        });

        const marca = marcas.find((m: any) => m.nombre === initialData.marca);
        if (marca) setSelectedMarcaId(marca.id);
      } else {
        form.reset();

        // Auto-assign technical fields if current user is not allowed to re-assign or edit commissions
        if (user && !canAsignarTecnico) {
          form.setFieldValue("tecnicoId", user.id);
        }
        if (user && !canEditarComision) {
          form.setFieldValue(
            "porcentaje_tecnico",
            user.porcentaje_comision_base,
          );
        }

        setSelectedMarcaId(null);
        setCedula("");
        setClienteNombre("");
        setClienteTelefono("");
        setClienteCorreo("");
      }
    }
  }, [
    initialData,
    opened,
    user,
    canAsignarTecnico,
    canEditarComision,
    marcas /* usually want this to run when marcas load if initialData has a marca */,
  ]);

  // -- Event Handlers --
  const handleMarcaChange = (value: string | null) => {
    form.setFieldValue("marca", value || "");
    form.setFieldValue("modelo", "");
    const marca = marcas.find((m: any) => m.nombre === value);
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

  // -- Derived Calculations --
  const totalRepuestosCliente =
    initialData?.repuestos?.reduce(
      (sum: number, r: any) => sum + r.precio_congelado_usd * r.cantidad,
      0,
    ) || 0;
  const totalRepuestosCosto =
    initialData?.repuestos?.reduce(
      (sum: number, r: any) => sum + r.costo_congelado_usd * r.cantidad,
      0,
    ) || 0;
  const totalServiciosCliente =
    initialData?.servicios?.reduce(
      (sum: number, s: any) => sum + s.precio_cobrado_usd,
      0,
    ) || 0;

  const manoDeObra = Number(form.values.mano_de_obra_usd || 0);
  const porcentaje = Number(form.values.porcentaje_tecnico || 0);

  const costoRepuestosManual = Number(form.values.costo_repuestos_usd || 0);
  const pagoTecnicoCreate = manoDeObra * porcentaje;
  const precioTotalCreate = manoDeObra + costoRepuestosManual;
  const gananciaLocalCreate = manoDeObra - pagoTecnicoCreate;

  const pagoTecnicoEdit = manoDeObra * porcentaje;
  const precioTotalEdit =
    manoDeObra + totalRepuestosCliente + totalServiciosCliente;
  const gananciaLocalEdit =
    manoDeObra -
    pagoTecnicoEdit +
    (totalRepuestosCliente - totalRepuestosCosto) +
    totalServiciosCliente;

  const handleSubmit = (values: TicketFormValues) => {
    const payload = { ...values };
    if (initialData) {
      payload.precio_total_usd = precioTotalEdit;
      payload.costo_repuestos_usd = totalRepuestosCosto;
    } else {
      payload.precio_total_usd = precioTotalCreate;
      payload.costo_repuestos_usd = costoRepuestosManual;
    }

    // Strip UI-only calculation fields that are not in the DB schema
    delete (payload as any).mano_de_obra_usd;

    onSubmit(payload);
  };

  // Select Options
  const marcaOptions = marcas.map((m: any) => ({
    value: m.nombre,
    label: m.nombre,
  }));
  const modeloOptions = selectedMarcaId
    ? modelos.map((m: any) => ({ value: m.nombre, label: m.nombre }))
    : marcas
        .find((m) => m.nombre === form.values.marca)
        ?.modelos?.map((m: any) => ({ value: m.nombre, label: m.nombre })) ||
      [];

  return {
    form,
    handleSubmit,
    state: {
      cedula,
      setCedula,
      clienteNombre,
      setClienteNombre,
      clienteTelefono,
      setClienteTelefono,
      clienteCorreo,
      setClienteCorreo,
      marcaSearch,
      setMarcaSearch,
      modeloSearch,
      setModeloSearch,
      selectedMarcaId,
    },
    queries: {
      foundClient,
      searchingClient,
      tecnicoOptions,
      loadingMarcas,
      loadingModelos,
      marcaOptions,
      modeloOptions,
    },
    actions: {
      handleMarcaChange,
      handleCreateMarcaInline,
      handleCreateModeloInline,
      createClient,
      createMarca,
      createModelo,
    },
    permissions: {
      canAsignarTecnico,
      canEditarComision,
    },
    computed: {
      totalRepuestosCliente,
      manoDeObra,
      porcentaje,
      pagoTecnicoCreate,
      precioTotalCreate,
      gananciaLocalCreate,
      pagoTecnicoEdit,
      precioTotalEdit,
      gananciaLocalEdit,
      costoRepuestosManual,
    },
  };
}
