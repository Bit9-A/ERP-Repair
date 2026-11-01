import { useState } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  CreditCard,
  Receipt,
  Phone,
  RefreshCw,
  Plus,
  UserCheck,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { StatCard } from "../../../components/ui/StatCard";
import { Modal } from "@mantine/core";
import { motion } from "framer-motion";

// ── Types ──
export interface OnlineOrder {
  id: string;
  numero: number;
  cliente: {
    nombre: string;
    rif: string;
    telefono: string;
    correo: string;
    tipo: "DETAL" | "MAYORISTA" | "GRAN_MAYOR";
    ciudad: string;
    direccion: string;
  };
  items: Array<{
    nombre: string;
    sku: string;
    cantidad: number;
    precio_usd: number;
  }>;
  subtotal_usd: number;
  descuento_usd: number;
  flete_usd: number;
  total_usd: number;
  tasa_bcv: number;
  total_bs: number;
  estado: "PENDIENTE_PAGO" | "VERIFICANDO_PAGO" | "PAGADO" | "EN_PREPARACION" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  metodo_pago: "PAGO_MOVIL" | "ZELLE" | "TRANSFERENCIA" | "BINANCE" | "EFECTIVO";
  banco_origen?: string;
  referencia: string;
  comprobante_url?: string;
  sucursal_despacho: string;
  courier?: string;
  numero_guia?: string;
  fecha: string;
}

export interface WholesaleRequest {
  id: string;
  nombre_comercial: string;
  contacto: string;
  rif: string;
  telefono: string;
  ciudad: string;
  tipo_solicitado: "MAYORISTA" | "GRAN_MAYOR";
  foto_local_url?: string;
  fecha: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
}

export interface CouponItem {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: number;
  compra_minima: number;
  usos_actuales: number;
  limite_usos: number;
  activo: boolean;
  roles_permitidos: string[];
}

// ── Initial Mock Data ──
const INITIAL_ORDERS: OnlineOrder[] = [
  {
    id: "ord-101",
    numero: 1042,
    cliente: {
      nombre: "Luis Landkoer (Distribuidora Tech)",
      rif: "J-50123456-0",
      telefono: "0414-1234567",
      correo: "compras@distribuidoratech.com",
      tipo: "GRAN_MAYOR",
      ciudad: "Caracas",
      direccion: "Av. Francisco de Miranda, Edif. Centro Seguros, Piso 4 Ofic. 42",
    },
    items: [
      { nombre: "Power Bank ROCKET P13 10000mAh 22.5W", sku: "ROCKET-P13", cantidad: 10, precio_usd: 15.0 },
      { nombre: "Cargador Carga Rápida GaN 65W Tipo-C", sku: "GAN-65W", cantidad: 5, precio_usd: 12.0 },
      { nombre: "Cable USB-C a Lightning Reforzado 1.2m", sku: "CBL-IPH-01", cantidad: 20, precio_usd: 2.5 },
    ],
    subtotal_usd: 260.0,
    descuento_usd: 13.0,
    flete_usd: 0,
    total_usd: 247.0,
    tasa_bcv: 45.5,
    total_bs: 11238.5,
    estado: "VERIFICANDO_PAGO",
    metodo_pago: "PAGO_MOVIL",
    banco_origen: "Banesco",
    referencia: "PM-8899231",
    sucursal_despacho: "Sede Principal (Caracas)",
    courier: "MRW",
    fecha: "Hoy, 11:20 AM",
  },
  {
    id: "ord-102",
    numero: 1041,
    cliente: {
      nombre: "Carla Mendoza",
      rif: "V-24555888",
      telefono: "0424-9876543",
      correo: "carlamendoza@gmail.com",
      tipo: "DETAL",
      ciudad: "Valencia",
      direccion: "Urb. Prebo, Calle 137, Casa #12",
    },
    items: [
      { nombre: "Audífonos Bluetooth M8 ANC Noise Cancelling", sku: "AUD-M8-ANC", cantidad: 1, precio_usd: 35.0 },
      { nombre: "Funda Silicona Case iPhone 15 Pro", sku: "CASE-IP15P", cantidad: 1, precio_usd: 8.0 },
    ],
    subtotal_usd: 43.0,
    descuento_usd: 0,
    flete_usd: 5.0,
    total_usd: 48.0,
    tasa_bcv: 45.5,
    total_bs: 2184.0,
    estado: "EN_PREPARACION",
    metodo_pago: "ZELLE",
    referencia: "ZL-55441199",
    sucursal_despacho: "Sucursal Valencia",
    courier: "Zoom",
    fecha: "Hoy, 10:05 AM",
  },
  {
    id: "ord-103",
    numero: 1040,
    cliente: {
      nombre: "Servicio Técnico El Pro",
      rif: "J-41222333-1",
      telefono: "0412-3334455",
      correo: "elpro.repara@gmail.com",
      tipo: "MAYORISTA",
      ciudad: "Maracay",
      direccion: "C.C. Parque Aragua, Nivel PB, Local 18",
    },
    items: [
      { nombre: "Pantalla OLED iPhone 13 Original Pulled", sku: "LCD-IP13-ORG", cantidad: 3, precio_usd: 68.0 },
      { nombre: "Batería Reemplazo iPhone 11 con Flex", sku: "BAT-IP11", cantidad: 4, precio_usd: 14.0 },
    ],
    subtotal_usd: 260.0,
    descuento_usd: 0,
    flete_usd: 0,
    total_usd: 260.0,
    tasa_bcv: 45.5,
    total_bs: 11830.0,
    estado: "ENVIADO",
    metodo_pago: "TRANSFERENCIA",
    banco_origen: "Mercantil",
    referencia: "TR-00998811",
    sucursal_despacho: "Sede Principal (Caracas)",
    courier: "Tealca",
    numero_guia: "TLC-99002231",
    fecha: "Ayer, 04:45 PM",
  },
  {
    id: "ord-104",
    numero: 1039,
    cliente: {
      nombre: "Alejandro Petit",
      rif: "V-18777999",
      telefono: "0416-1112233",
      correo: "petit.ale@outlook.com",
      tipo: "DETAL",
      ciudad: "Caracas",
      direccion: "Los Palos Grandes, 2da Avenida, Res. Parque Real",
    },
    items: [
      { nombre: "Cargador Magnético Magsafe 15W", sku: "CHG-MAG-15W", cantidad: 1, precio_usd: 18.0 },
    ],
    subtotal_usd: 18.0,
    descuento_usd: 0,
    flete_usd: 0,
    total_usd: 18.0,
    tasa_bcv: 45.5,
    total_bs: 819.0,
    estado: "PENDIENTE_PAGO",
    metodo_pago: "PAGO_MOVIL",
    referencia: "Pendiente por transferir",
    sucursal_despacho: "Sede Principal (Caracas)",
    fecha: "Ayer, 09:30 AM",
  },
];

const INITIAL_REQUESTS: WholesaleRequest[] = [
  {
    id: "req-1",
    nombre_comercial: "SmartFix Celulares & Repuestos",
    contacto: "Jesús Albarrán",
    rif: "J-49887712-4",
    telefono: "0414-9988776",
    ciudad: "Barquisimeto",
    tipo_solicitado: "GRAN_MAYOR",
    foto_local_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500",
    fecha: "Hoy, 10:15 AM",
    estado: "PENDIENTE",
  },
  {
    id: "req-2",
    nombre_comercial: "Taller Electrónico San Juan",
    contacto: "Franklin Romero",
    rif: "V-19888222",
    telefono: "0426-5544332",
    ciudad: "San Juan de los Morros",
    tipo_solicitado: "MAYORISTA",
    fecha: "Ayer, 03:20 PM",
    estado: "PENDIENTE",
  },
];

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "c-1",
    codigo: "BIENVENIDA10",
    descripcion: "10% de descuento en la primera compra online",
    tipo: "PORCENTAJE",
    valor: 10,
    compra_minima: 20,
    usos_actuales: 34,
    limite_usos: 100,
    activo: true,
    roles_permitidos: ["DETAL"],
  },
  {
    id: "c-2",
    codigo: "MAYORISTA5",
    descripcion: "5% de descuento adicional en compras superiores a $150",
    tipo: "PORCENTAJE",
    valor: 5,
    compra_minima: 150,
    usos_actuales: 18,
    limite_usos: 50,
    activo: true,
    roles_permitidos: ["MAYORISTA", "GRAN_MAYOR"],
  },
  {
    id: "c-3",
    codigo: "PROMOFLETE",
    descripcion: "Flete gratis ($5 USD de descuento) en órdenes mayores a $50",
    tipo: "MONTO_FIJO",
    valor: 5,
    compra_minima: 50,
    usos_actuales: 45,
    limite_usos: 200,
    activo: true,
    roles_permitidos: ["DETAL", "MAYORISTA", "GRAN_MAYOR"],
  },
];

export function OnlineOrdersPage() {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "REQUESTS" | "COUPONS">("ORDERS");
  const [orders, setOrders] = useState<OnlineOrder[]>(INITIAL_ORDERS);
  const [requests, setRequests] = useState<WholesaleRequest[]>(INITIAL_REQUESTS);
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [showNewCouponModal, setShowNewCouponModal] = useState<boolean>(false);

  // Simulation Form State
  const [simName, setSimName] = useState("Inversiones El Sol C.A.");
  const [simPhone, setSimPhone] = useState("0414-5556677");
  const [simType, setSimType] = useState<"DETAL" | "MAYORISTA" | "GRAN_MAYOR">("MAYORISTA");
  const [simPayment, setSimPayment] = useState<"PAGO_MOVIL" | "ZELLE">("PAGO_MOVIL");

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(25);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "ALL" || order.estado === statusFilter;
    const matchesSearch =
      order.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cliente.rif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.numero.toString().includes(searchQuery) ||
      order.referencia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (estado: OnlineOrder["estado"]) => {
    switch (estado) {
      case "VERIFICANDO_PAGO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Por Verificar Pago
          </span>
        );
      case "PAGADO":
      case "EN_PREPARACION":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Truck className="w-3 h-3" />
            En Preparación
          </span>
        );
      case "ENVIADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Truck className="w-3 h-3" />
            En Camino / Enviado
          </span>
        );
      case "ENTREGADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Entregado
          </span>
        );
      case "CANCELADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Pendiente de Pago
          </span>
        );
    }
  };

  const getClientTypeBadge = (tipo: "DETAL" | "MAYORISTA" | "GRAN_MAYOR") => {
    switch (tipo) {
      case "GRAN_MAYOR":
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold font-mono">
            Gran Mayor
          </span>
        );
      case "MAYORISTA":
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[10px] font-bold font-mono">
            Mayorista
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-[10px] font-bold font-mono">
            Detal / PVP
          </span>
        );
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OnlineOrder["estado"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, estado: newStatus } : null));
    }
  };

  const handleApproveWholesale = (reqId: string, tipo: "MAYORISTA" | "GRAN_MAYOR") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, estado: "APROBADO", tipo_solicitado: tipo } : r))
    );
  };

  const handleSimulateNewOrder = () => {
    const subtotal = 90.0;
    const discount = simType !== "DETAL" ? 9.0 : 0;
    const total = subtotal - discount;

    const newOrd: OnlineOrder = {
      id: `ord-${Date.now()}`,
      numero: Math.floor(1050 + Math.random() * 500),
      cliente: {
        nombre: simName,
        rif: "J-40998877-2",
        telefono: simPhone,
        correo: "cliente.simulado@techland.com",
        tipo: simType,
        ciudad: "Caracas",
        direccion: "Boleíta Norte, Calle Los Laboratorios, Edif. Alfa",
      },
      items: [
        {
          nombre: "Cargador Carga Rápida GaN 65W Tipo-C",
          sku: "GAN-65W",
          cantidad: 6,
          precio_usd: 15.0,
        },
      ],
      subtotal_usd: subtotal,
      descuento_usd: discount,
      flete_usd: 0,
      total_usd: total,
      tasa_bcv: 45.5,
      total_bs: total * 45.5,
      estado: "VERIFICANDO_PAGO",
      metodo_pago: simPayment,
      banco_origen: "Banesco",
      referencia: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      sucursal_despacho: "Sede Principal (Caracas)",
      courier: "MRW",
      fecha: "Recién ingresado",
    };

    setOrders([newOrd, ...orders]);
    setShowSimulateModal(false);
  };

  const handleCreateCoupon = () => {
    if (!newCouponCode) return;
    const c: CouponItem = {
      id: `c-${Date.now()}`,
      codigo: newCouponCode.toUpperCase(),
      descripcion: newCouponDesc || "Promoción especial online",
      tipo: "PORCENTAJE",
      valor: newCouponVal,
      compra_minima: newCouponMin,
      usos_actuales: 0,
      limite_usos: 100,
      activo: true,
      roles_permitidos: ["DETAL", "MAYORISTA"],
    };
    setCoupons([...coupons, c]);
    setNewCouponCode("");
    setNewCouponDesc("");
    setShowNewCouponModal(false);
  };

  const kpis = {
    totalHoy: orders.length,
    porVerificar: orders.filter((o) => o.estado === "VERIFICANDO_PAGO").length,
    enPreparacion: orders.filter((o) => o.estado === "EN_PREPARACION").length,
    solicitudesPendientes: requests.filter((r) => r.estado === "PENDIENTE").length,
    ingresosUSD: orders
      .filter((o) => o.estado !== "CANCELADO" && o.estado !== "PENDIENTE_PAGO")
      .reduce((acc, curr) => acc + curr.total_usd, 0),
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-10">
      {/* ── Executive Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight uppercase">
                  Pedidos & Tienda Online
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CANAL DIGITAL B2B / B2C
                </span>
              </div>
              <p className="text-xs text-slate-300/80 max-w-xl">
                Gestión unificada de órdenes entrantes, comprobantes de pago, cuentas mayoristas y cupones de fidelización.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setOrders([...INITIAL_ORDERS])}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-all cursor-pointer"
              title="Restaurar órdenes de prueba"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-lg shadow-blue-600/30 h-10 px-4 transition-all"
              onClick={() => setShowSimulateModal(true)}
            >
              <Plus className="w-4 h-4" /> Simular Pedido Web
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Row (4 Key Metrics) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Órdenes Totales"
          value={kpis.totalHoy}
          icon={<Globe className="w-5 h-5" />}
          accentColor="#3B82F6"
          subtitle="Ventas B2C y B2B registradas"
          trend={{ value: `${kpis.totalHoy} pedidos`, isPositive: true, label: "hoy" }}
        />
        <StatCard
          title="Por Verificar Pago"
          value={String(kpis.porVerificar).padStart(2, "0")}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#F59E0B"
          subtitle="Comprobantes pendientes"
          trend={{ value: "Urgente", isPositive: false, label: "caja" }}
        />
        <StatCard
          title="En Preparación"
          value={String(kpis.enPreparacion).padStart(2, "0")}
          icon={<Truck className="w-5 h-5" />}
          accentColor="#8B5CF6"
          subtitle="Despacho desde sucursal"
          trend={{ value: "En curso", isPositive: true, label: "almacén" }}
        />
        <StatCard
          title="Facturación Web"
          value={`$${kpis.ingresosUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<CreditCard className="w-5 h-5" />}
          accentColor="#10B981"
          subtitle={`≈ Bs. ${(kpis.ingresosUSD * 45.5).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`}
          trend={{ value: "Liquidado", isPositive: true, label: "BCV" }}
        />
      </div>

      {/* ── Navigation Tabs (Módulos Internos) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ORDERS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Receipt className="w-4 h-4" /> Órdenes & Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "REQUESTS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <UserCheck className="w-4 h-4" /> Solicitudes Mayoristas
          {kpis.solicitudesPendientes > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
              {kpis.solicitudesPendientes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("COUPONS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "COUPONS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Tag className="w-4 h-4" /> Cupones & Promociones ({coupons.length})
        </button>
      </div>

      {/* ── TAB 1: ÓRDENES Y PEDIDOS ── */}
      {activeTab === "ORDERS" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "ALL", label: "Todas" },
                { id: "VERIFICANDO_PAGO", label: "Por Verificar Pago" },
                { id: "EN_PREPARACION", label: "En Preparación" },
                { id: "ENVIADO", label: "Enviados" },
                { id: "ENTREGADO", label: "Entregados" },
                { id: "PENDIENTE_PAGO", label: "Sin Pagar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, RIF o ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-heading uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">N° Orden</th>
                    <th className="py-3.5 px-4">Cliente & RIF</th>
                    <th className="py-3.5 px-4">Destino / Courier</th>
                    <th className="py-3.5 px-4">Productos</th>
                    <th className="py-3.5 px-4">Total USD / Bs.</th>
                    <th className="py-3.5 px-4">Pago & Ref</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        No hay pedidos web que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            #{order.numero}
                          </div>
                          <span className="text-[10px] text-slate-400">{order.fecha}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {order.cliente.nombre}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getClientTypeBadge(order.cliente.tipo)}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {order.cliente.rif}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="font-medium">{order.cliente.ciudad}</div>
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 font-medium">
                            <Truck className="w-3 h-3" /> {order.courier || "Retiro en Tienda"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {order.items.reduce((acc, i) => acc + i.cantidad, 0)} unidades
                          </span>
                          <span className="block text-[11px] text-slate-400 truncate max-w-[190px]">
                            {order.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">
                            ${order.total_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Bs. {order.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 dark:text-slate-200 font-medium">
                            {order.metodo_pago}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                            {order.referencia}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(order.estado)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 text-xs rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Orden
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SOLICITUDES DE MAYORISTAS ── */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading uppercase">
                Talleres y Tiendas Solicitando Cuenta Mayorista
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Al aprobar una solicitud, el cliente podrá ver los precios preferenciales (Mayor o Gran Mayor) en la tienda online.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/20">
              {requests.filter((r) => r.estado === "PENDIENTE").length} Pendientes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">
                      {req.nombre_comercial}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">Contacto: {req.contacto}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      RIF: {req.rif} | Ciudad: {req.ciudad}
                    </div>
                  </div>
                  {req.estado === "APROBADO" ? (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                      Aprobado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/20">
                      Solicita: {req.tipo_solicitado}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-500">Teléfono verificado:</span>
                  <a
                    href={`https://wa.me/${req.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> {req.telefono}
                  </a>
                </div>

                {req.estado === "PENDIENTE" && (
                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1 rounded-xl h-9"
                      onClick={() => handleApproveWholesale(req.id, "MAYORISTA")}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Aprobar Mayorista
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1 rounded-xl h-9"
                      onClick={() => handleApproveWholesale(req.id, "GRAN_MAYOR")}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Aprobar Gran Mayor
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CUPONES Y DESCUENTOS ── */}
      {activeTab === "COUPONS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading uppercase">
                Cupones de Descuento para la Tienda Online
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crea códigos promocionales canjeables en el checkout web.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 rounded-xl h-9 shadow-md shadow-blue-600/20"
              onClick={() => setShowNewCouponModal(true)}
            >
              <Plus className="w-4 h-4" /> Nuevo Cupón
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-base text-blue-600 dark:text-blue-400 tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                      {c.codigo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.activo
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/15 text-slate-500 border border-slate-500/20"
                      }`}
                    >
                      {c.activo ? "ACTIVO" : "PAUSADO"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-3">
                    {c.descripcion}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Descuento:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {c.tipo === "PORCENTAJE" ? `${c.valor}%` : `$${c.valor} USD`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compra Mínima:</span>
                    <span className="text-slate-800 dark:text-slate-100">${c.compra_minima} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Usos Registrados:</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {c.usos_actuales} / {c.limite_usos}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">Aplica a: {c.roles_permitidos.join(", ")}</span>
                  <button
                    onClick={() =>
                      setCoupons((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, activo: !item.activo } : item))
                      )
                    }
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {c.activo ? "Desactivar" : "Reactivar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: GESTIÓN DE PEDIDO SELECCIONADO ── */}
      <Modal
        opened={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          <div className="flex items-center gap-2">
            <Receipt className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white font-heading uppercase text-sm">
              Gestión de Pedido Web #{selectedOrder?.numero}
            </span>
          </div>
        }
        size="lg"
        radius="lg"
        centered
      >
        {selectedOrder && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Customer & Delivery Block */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Datos del Cliente
                </span>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {selectedOrder.cliente.nombre}
                </div>
                <div className="text-slate-500 font-mono text-[10px]">{selectedOrder.cliente.rif}</div>
                <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {selectedOrder.cliente.telefono}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Pago & Referencia
                </span>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {selectedOrder.metodo_pago}
                </div>
                <div className="text-slate-500 font-mono text-[10px]">
                  Ref: {selectedOrder.referencia}
                </div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  Banco: {selectedOrder.banco_origen || "N/A"}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Dirección de Entrega / Despacho
              </span>
              <div className="text-slate-700 dark:text-slate-200 mt-0.5">
                {selectedOrder.cliente.direccion}, {selectedOrder.cliente.ciudad}
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                Despachar desde: <strong className="text-slate-800 dark:text-slate-200">{selectedOrder.sucursal_despacho}</strong> | Courier: <strong className="text-blue-600 dark:text-blue-400">{selectedOrder.courier}</strong>
              </div>
            </div>

            {/* Products List */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block font-heading">
                Artículos Solicitados ({selectedOrder.items.length})
              </span>
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-heading uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Cant</th>
                      <th className="py-2.5 px-3 text-right">P. Unit</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.nombre}</div>
                          <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">{item.cantidad}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-300">${item.precio_usd.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${(item.cantidad * item.precio_usd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center font-mono">
              <span className="text-slate-500 text-xs font-medium">TOTAL A LIQUIDAR (TASA OFICIAL BCV):</span>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-heading">
                  ${selectedOrder.total_usd.toFixed(2)} USD
                </div>
                <div className="text-xs text-slate-400 font-sans">
                  Bs. {selectedOrder.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`https://wa.me/${selectedOrder.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `¡Hola ${selectedOrder.cliente.nombre}! Le escribimos de TechLand para notificarle que su orden web #${selectedOrder.numero} por un total de $${selectedOrder.total_usd.toFixed(2)} (Bs. ${selectedOrder.total_bs.toLocaleString("es-VE")}) ha sido procesada con éxito.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-500/20"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp Cliente
              </a>

              <div className="flex items-center gap-2">
                {selectedOrder.estado === "VERIFICANDO_PAGO" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl h-9"
                    onClick={() => updateOrderStatus(selectedOrder.id, "EN_PREPARACION")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Pago & Despachar
                  </Button>
                )}
                {selectedOrder.estado === "EN_PREPARACION" && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 rounded-xl h-9"
                    onClick={() => updateOrderStatus(selectedOrder.id, "ENVIADO")}
                  >
                    <Truck className="w-3.5 h-3.5" /> Marcar como Enviado
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-9 text-xs"
                  onClick={() => setSelectedOrder(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: SIMULADOR DE ORDEN WEB ── */}
      <Modal
        opened={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Globe className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white font-heading uppercase text-sm">
              Simular Pedido Entrante de la Tienda Online
            </span>
          </div>
        }
        size="md"
        radius="lg"
        centered
      >
        <div className="space-y-4 pt-1 text-xs">
          <div>
            <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Nombre del Cliente / Negocio:</label>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Teléfono:</label>
              <input
                type="text"
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Tipo de Cliente:</label>
              <select
                value={simType}
                onChange={(e) => setSimType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="DETAL">Cliente Detal (PVP)</option>
                <option value="MAYORISTA">Mayorista (Precios Mayor)</option>
                <option value="GRAN_MAYOR">Gran Mayor (Distribuidor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Método de Pago:</label>
            <select
              value={simPayment}
              onChange={(e) => setSimPayment(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="PAGO_MOVIL">Pago Móvil (Banesco / BDV)</option>
              <option value="ZELLE">Zelle (USD)</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
            Se generará una orden con 6 unidades de <strong>Cargador GaN 65W</strong> por un total de <strong>$81.00 USD</strong> en estado <em>Verificando Pago</em> para probar la conciliación bancaria.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-9"
              onClick={() => setShowSimulateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-9 shadow-md shadow-blue-600/20"
              onClick={handleSimulateNewOrder}
            >
              Generar Pedido de Prueba
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: NUEVO CUPÓN DE DESCUENTO ── */}
      <Modal
        opened={showNewCouponModal}
        onClose={() => setShowNewCouponModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Tag className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            <span className="font-bold text-slate-900 dark:text-white font-heading uppercase text-sm">
              Crear Nuevo Cupón Promocional
            </span>
          </div>
        }
        size="md"
        radius="lg"
        centered
      >
        <div className="space-y-4 pt-1 text-xs">
          <div>
            <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Código del Cupón (Ej: BLACKFRIDAY):</label>
            <input
              type="text"
              placeholder="NAVIDAD20"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Descripción del Descuento:</label>
            <input
              type="text"
              placeholder="15% de descuento en accesorios para compras sobre $30"
              value={newCouponDesc}
              onChange={(e) => setNewCouponDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Porcentaje (%):</label>
              <input
                type="number"
                value={newCouponVal}
                onChange={(e) => setNewCouponVal(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-medium">Compra Mínima (USD):</label>
              <input
                type="number"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-9"
              onClick={() => setShowNewCouponModal(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl h-9 shadow-md shadow-blue-600/20"
              onClick={handleCreateCoupon}
            >
              Guardar Cupón
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
