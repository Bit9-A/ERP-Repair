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
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Modal } from "@mantine/core";

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
      { nombre: "Cargador 65W GaN Tech 2x C + 1x A", sku: "GAR322", cantidad: 5, precio_usd: 18.5 },
      { nombre: "Cable C a C Nylon 60W 1.2m", sku: "CAB273", cantidad: 10, precio_usd: 1.8 },
    ],
    subtotal_usd: 260.5,
    descuento_usd: 13.0,
    flete_usd: 0,
    total_usd: 247.5,
    tasa_bcv: 45.5,
    total_bs: 11261.25,
    estado: "VERIFICANDO_PAGO",
    metodo_pago: "PAGO_MOVIL",
    banco_origen: "Banesco Banco Universal (0134)",
    referencia: "PM-8839210",
    comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
    sucursal_despacho: "Sede Principal (Caracas)",
    courier: "MRW Express",
    fecha: "Hoy, 02:45 PM",
  },
  {
    id: "ord-102",
    numero: 1041,
    cliente: {
      nombre: "Carlos Mendoza",
      rif: "V-24555888",
      telefono: "0424-9876543",
      correo: "carlos.mendoza@gmail.com",
      tipo: "DETAL",
      ciudad: "Valencia",
      direccion: "Urb. El Viñedo, Calle 139, Res. Los Sauces Apto 3B",
    },
    items: [
      { nombre: "Audífonos TWS 100H BT 5.3 ANC", sku: "AUT250", cantidad: 1, precio_usd: 21.0 },
      { nombre: "Cable C a C Nylon 60W 1.2m", sku: "CAB273", cantidad: 1, precio_usd: 2.0 },
    ],
    subtotal_usd: 23.0,
    descuento_usd: 0,
    flete_usd: 3.5,
    total_usd: 26.5,
    tasa_bcv: 45.5,
    total_bs: 1205.75,
    estado: "EN_PREPARACION",
    metodo_pago: "ZELLE",
    referencia: "ZEL-440192",
    sucursal_despacho: "Sede Principal (Caracas)",
    courier: "Zoom Envíos",
    fecha: "Hoy, 11:20 AM",
  },
  {
    id: "ord-103",
    numero: 1040,
    cliente: {
      nombre: "Inversiones MovilPro C.A.",
      rif: "J-40982341-2",
      telefono: "0412-5551234",
      correo: "admin@movilpro.com",
      tipo: "MAYORISTA",
      ciudad: "Maracay",
      direccion: "C.C. Parque Aragua, Nivel Comercial Local 12",
    },
    items: [
      { nombre: "Parlante BT 5.1 Magnético BUNKER 5W", sku: "BUNKER", cantidad: 6, precio_usd: 18.75 },
      { nombre: "Power Bank 20K mAh Li-Polymer Dual Port", sku: "BAT201", cantidad: 4, precio_usd: 22.75 },
    ],
    subtotal_usd: 203.5,
    descuento_usd: 10.0,
    flete_usd: 5.0,
    total_usd: 198.5,
    tasa_bcv: 45.5,
    total_bs: 9031.75,
    estado: "ENVIADO",
    metodo_pago: "TRANSFERENCIA",
    banco_origen: "Banco Mercantil",
    referencia: "TRF-902134",
    sucursal_despacho: "Sede Principal (Caracas)",
    courier: "Tealca",
    numero_guia: "TLC-99382109",
    fecha: "Ayer, 04:15 PM",
  },
  {
    id: "ord-104",
    numero: 1039,
    cliente: {
      nombre: "Elena Rivas",
      rif: "V-18777999",
      telefono: "0416-3334444",
      correo: "elena_rivas@hotmail.com",
      tipo: "DETAL",
      ciudad: "Caracas",
      direccion: "Los Palos Grandes, 2da Avenida, Qta. Flor",
    },
    items: [
      { nombre: "Pila Alcalina AA Blíster x4", sku: "GAR136", cantidad: 4, precio_usd: 2.56 },
    ],
    subtotal_usd: 10.24,
    descuento_usd: 0,
    flete_usd: 2.0,
    total_usd: 12.24,
    tasa_bcv: 45.5,
    total_bs: 556.92,
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

  // New Simulation Form State
  const [simName, setSimName] = useState("Inversiones El Sol C.A.");
  const [simPhone, setSimPhone] = useState("0414-5556677");
  const [simType, setSimType] = useState<"DETAL" | "MAYORISTA" | "GRAN_MAYOR">("MAYORISTA");
  const [simProduct, setSimProduct] = useState("ROCKET-P13");
  const [simQty, setSimQty] = useState(6);
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
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Verificando Pago</Badge>;
      case "PAGADO":
      case "EN_PREPARACION":
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">En Preparación</Badge>;
      case "ENVIADO":
        return <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30">En Camino / Enviado</Badge>;
      case "ENTREGADO":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Entregado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">Cancelado</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">Pendiente de Pago</Badge>;
    }
  };

  const getClientTypeBadge = (tipo: "DETAL" | "MAYORISTA" | "GRAN_MAYOR") => {
    switch (tipo) {
      case "GRAN_MAYOR":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">Gran Mayor</Badge>;
      case "MAYORISTA":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Mayorista</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-[10px]">Detal / PVP</Badge>;
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
    const unitPrice = simType === "GRAN_MAYOR" ? 15.0 : simType === "MAYORISTA" ? 16.25 : 20.0;
    const subtotal = unitPrice * simQty;
    const discount = simType !== "DETAL" ? subtotal * 0.05 : 0;
    const total = subtotal - discount;

    const newOrd: OnlineOrder = {
      id: `ord-${Date.now()}`,
      numero: orders.length + 1043,
      cliente: {
        nombre: simName,
        rif: "J-41222333-1",
        telefono: simPhone,
        correo: "cliente@techland.com",
        tipo: simType,
        ciudad: "Caracas",
        direccion: "Zona Industrial La Trinidad",
      },
      items: [
        {
          nombre: "Power Bank ROCKET P13 10000mAh 22.5W",
          sku: simProduct,
          cantidad: simQty,
          precio_usd: unitPrice,
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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Globe size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-heading uppercase">
                Pedidos & Tienda Online
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                En Vivo (TechLand)
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Gestión unificada de ventas B2C, pedidos mayoristas B2B, cupones y validación de comprobantes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-blue-600/20"
            onClick={() => setShowSimulateModal(true)}
          >
            <Plus size={14} /> Simular Orden Web
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-800 gap-1.5 text-xs"
            onClick={() => setOrders([...INITIAL_ORDERS])}
          >
            <RefreshCw size={14} /> Sincronizar
          </Button>
        </div>
      </div>

      {/* ── Top Navigation Tabs (Módulos Internos) ── */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("ORDERS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ORDERS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Receipt size={16} /> Órdenes & Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "REQUESTS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <UserCheck size={16} /> Solicitudes Mayoristas
          {kpis.solicitudesPendientes > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] flex items-center justify-center font-black">
              {kpis.solicitudesPendientes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("COUPONS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "COUPONS"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Tag size={16} /> Cupones & Promociones ({coupons.length})
        </button>
      </div>

      {/* ── TAB 1: ORDENES Y PEDIDOS ── */}
      {activeTab === "ORDERS" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Totales</span>
                <Globe size={18} className="text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">{kpis.totalHoy}</div>
              <span className="text-[11px] text-emerald-400 font-medium">B2C Detal y B2B Mayor</span>
            </Card>

            <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Por Verificar Pago</span>
                <Clock size={18} className="text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-400 font-mono">{kpis.porVerificar}</div>
              <span className="text-[11px] text-slate-400">Comprobantes listos para conciliar</span>
            </Card>

            <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">En Preparación</span>
                <Truck size={18} className="text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-blue-400 font-mono">{kpis.enPreparacion}</div>
              <span className="text-[11px] text-slate-400">Rebajando stock en sucursal</span>
            </Card>

            <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ventas Confirmadas</span>
                <CreditCard size={18} className="text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
                ${kpis.ingresosUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                ≈ Bs. {(kpis.ingresosUSD * 45.5).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por cliente, RIF o ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Orders Table */}
          <Card className="bg-slate-900/50 border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-heading uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">N° Orden</th>
                    <th className="py-3 px-4">Cliente & RIF</th>
                    <th className="py-3 px-4">Destino / Courier</th>
                    <th className="py-3 px-4">Productos</th>
                    <th className="py-3 px-4">Total USD / Bs.</th>
                    <th className="py-3 px-4">Pago & Ref</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-500">
                        No hay pedidos web que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white text-sm">#{order.numero}</div>
                          <span className="text-[10px] text-slate-500">{order.fecha}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{order.cliente.nombre}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getClientTypeBadge(order.cliente.tipo)}
                            <span className="text-[10px] text-slate-500 font-mono">{order.cliente.rif}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{order.cliente.ciudad}</div>
                          <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
                            <Truck size={10} /> {order.courier || "Retiro en Tienda"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold text-white">
                            {order.items.reduce((acc, i) => acc + i.cantidad, 0)} unidades
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                            {order.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(", ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-white text-sm">
                            ${order.total_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Bs. {order.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium">{order.metodo_pago}</div>
                          <div className="text-[10px] font-mono text-slate-500">{order.referencia}</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.estado)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-blue-400 hover:text-white hover:bg-blue-600/20 text-xs"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={14} className="mr-1" /> Gestionar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: SOLICITUDES DE MAYORISTAS ── */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-heading uppercase">
                Talleres y Tiendas Solicitando Cuenta Mayorista
              </h2>
              <p className="text-xs text-slate-400">
                Al aprobar una solicitud, el cliente podrá ver los precios preferenciales (Mayor o Gran Mayor) en la tienda online.
              </p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {requests.filter((r) => r.estado === "PENDIENTE").length} Pendientes
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <Card key={req.id} className="p-4 bg-slate-900/50 border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{req.nombre_comercial}</h3>
                    <div className="text-xs text-slate-400">Contacto: {req.contacto}</div>
                    <div className="text-[11px] text-slate-500 font-mono">RIF: {req.rif} | {req.ciudad}</div>
                  </div>
                  {req.estado === "APROBADO" ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Aprobado</Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Solicitado: {req.tipo_solicitado}</Badge>
                  )}
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] flex justify-between items-center">
                  <span className="text-slate-400">Teléfono registrado:</span>
                  <a
                    href={`https://wa.me/${req.telefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone size={12} /> {req.telefono}
                  </a>
                </div>

                {req.estado === "PENDIENTE" && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1"
                      onClick={() => handleApproveWholesale(req.id, "MAYORISTA")}
                    >
                      <UserCheck size={14} /> Aprobar Mayorista
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1"
                      onClick={() => handleApproveWholesale(req.id, "GRAN_MAYOR")}
                    >
                      <ShieldCheck size={14} /> Aprobar Gran Mayor
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CUPONES & PROMOCIONES ── */}
      {activeTab === "COUPONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white font-heading uppercase">
                Cupones de Descuento Activos
              </h2>
              <p className="text-xs text-slate-400">
                Los clientes pueden ingresar estos códigos al realizar el checkout en la tienda web de TechLand.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
              onClick={() => setShowNewCouponModal(true)}
            >
              <Plus size={14} /> Crear Nuevo Cupón
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <Card key={c.id} className="p-4 bg-slate-900/50 border-slate-800 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                    {c.codigo}
                  </span>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    {c.tipo === "PORCENTAJE" ? `${c.valor}% OFF` : `$${c.valor} USD OFF`}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300">{c.descripcion}</p>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Compra mínima:</span>
                    <span className="text-white font-mono">${c.compra_minima}.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Usos acumulados:</span>
                    <span className="text-white font-mono">{c.usos_actuales} / {c.limite_usos}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Aplica para:</span>
                    <span className="text-blue-400 font-semibold">{c.roles_permitidos.join(", ")}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: DETALLE Y GESTION DE PEDIDO ── */}
      <Modal
        opened={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          <div className="flex items-center gap-2">
            <Receipt className="text-blue-400" size={20} />
            <span className="font-bold text-white font-heading uppercase text-sm">
              Gestión de Pedido Web #{selectedOrder?.numero}
            </span>
          </div>
        }
        size="lg"
        centered
        styles={{
          content: { backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#f8fafc" },
          header: { backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b" },
        }}
      >
        {selectedOrder && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Customer & Delivery Block */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Datos del Cliente</span>
                <div className="font-bold text-slate-200 mt-1">{selectedOrder.cliente.nombre}</div>
                <div className="text-slate-400 font-mono text-[10px]">{selectedOrder.cliente.rif}</div>
                <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {selectedOrder.cliente.telefono}
                </div>
                <div className="mt-1.5">{getClientTypeBadge(selectedOrder.cliente.tipo)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pago & Conciliación</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedOrder.metodo_pago}</div>
                <div className="font-mono text-blue-400 mt-0.5">Ref: {selectedOrder.referencia}</div>
                {selectedOrder.banco_origen && (
                  <div className="text-[10px] text-slate-500">Banco: {selectedOrder.banco_origen}</div>
                )}
                <div className="mt-1.5">{getStatusBadge(selectedOrder.estado)}</div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Dirección de Entrega / Despacho
              </span>
              <div className="text-slate-200 mt-0.5">{selectedOrder.cliente.direccion}, {selectedOrder.cliente.ciudad}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Despachar desde: <span className="text-white font-semibold">{selectedOrder.sucursal_despacho}</span> | Courier: <span className="text-blue-400 font-semibold">{selectedOrder.courier}</span>
              </div>
            </div>

            {/* Products List */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                Artículos Solicitados ({selectedOrder.items.length})
              </span>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Producto</th>
                      <th className="py-2 px-3 text-center">Cant</th>
                      <th className="py-2 px-3 text-right">P. Unit</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-200">{item.nombre}</div>
                          <div className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-white">{item.cantidad}</td>
                        <td className="py-2 px-3 text-right font-mono">${item.precio_usd.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          ${(item.cantidad * item.precio_usd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center font-mono">
              <span className="text-slate-400 text-xs">TOTAL A LIQUIDAR (CON TASA BCV):</span>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">${selectedOrder.total_usd.toFixed(2)} USD</div>
                <div className="text-xs text-slate-400 font-sans">
                  Bs. {selectedOrder.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <a
                href={`https://wa.me/${selectedOrder.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `¡Hola ${selectedOrder.cliente.nombre}! Le escribimos de TechLand para notificarle que su orden web #${selectedOrder.numero} por un total de $${selectedOrder.total_usd.toFixed(2)} (Bs. ${selectedOrder.total_bs.toLocaleString("es-VE")}) ha sido procesada con éxito.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone size={14} /> WhatsApp Cliente
              </a>

              <div className="flex items-center gap-2">
                {selectedOrder.estado === "VERIFICANDO_PAGO" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5"
                    onClick={() => updateOrderStatus(selectedOrder.id, "EN_PREPARACION")}
                  >
                    <CheckCircle2 size={14} /> Aprobar Pago & Despachar
                  </Button>
                )}
                {selectedOrder.estado === "EN_PREPARACION" && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-1.5"
                    onClick={() => updateOrderStatus(selectedOrder.id, "ENVIADO")}
                  >
                    <Truck size={14} /> Marcar como Enviado
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
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
            <Globe className="text-blue-400" size={20} />
            <span className="font-bold text-white font-heading uppercase text-sm">
              Simular Pedido Entrante de la Tienda Online
            </span>
          </div>
        }
        size="md"
        centered
        styles={{
          content: { backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#f8fafc" },
          header: { backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b" },
        }}
      >
        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Nombre del Cliente / Negocio:</label>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Teléfono:</label>
              <input
                type="text"
                value={simPhone}
                onChange={(e) => setSimPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Tipo de Cliente:</label>
              <select
                value={simType}
                onChange={(e) => setSimType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="DETAL">Cliente Detal (PVP)</option>
                <option value="MAYORISTA">Mayorista (Precios Mayor)</option>
                <option value="GRAN_MAYOR">Gran Mayor (Distribuidor)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Producto:</label>
              <select
                value={simProduct}
                onChange={(e) => setSimProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="ROCKET-P13">Power Bank ROCKET P13</option>
                <option value="GAR322">Cargador 65W GaN Tech</option>
                <option value="AUT250">Audífonos TWS 100H</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Cantidad:</label>
              <input
                type="number"
                value={simQty}
                min={1}
                onChange={(e) => setSimQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Método de Pago Reportado:</label>
            <select
              value={simPayment}
              onChange={(e) => setSimPayment(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="PAGO_MOVIL">Pago Móvil (Banesco / Mercantil)</option>
              <option value="ZELLE">Zelle</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 text-slate-400"
              onClick={() => setShowSimulateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
              onClick={handleSimulateNewOrder}
            >
              Ingresar Orden a la Cola
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: CREAR NUEVO CUPÓN ── */}
      <Modal
        opened={showNewCouponModal}
        onClose={() => setShowNewCouponModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Tag className="text-emerald-400" size={20} />
            <span className="font-bold text-white font-heading uppercase text-sm">
              Crear Nuevo Cupón de Descuento
            </span>
          </div>
        }
        size="md"
        centered
        styles={{
          content: { backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#f8fafc" },
          header: { backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b" },
        }}
      >
        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Código del Cupón (ej: TECH10):</label>
            <input
              type="text"
              placeholder="TECH10"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Descripción:</label>
            <input
              type="text"
              placeholder="Descuento en compras online"
              value={newCouponDesc}
              onChange={(e) => setNewCouponDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Porcentaje (% OFF):</label>
              <input
                type="number"
                value={newCouponVal}
                min={1}
                max={50}
                onChange={(e) => setNewCouponVal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Compra Mínima ($ USD):</label>
              <input
                type="number"
                value={newCouponMin}
                min={0}
                onChange={(e) => setNewCouponMin(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 text-slate-400"
              onClick={() => setShowNewCouponModal(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              onClick={handleCreateCoupon}
            >
              Guardar y Publicar Cupón
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
