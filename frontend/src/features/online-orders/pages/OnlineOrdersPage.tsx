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
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Modal } from "@mantine/core";

interface OnlineOrder {
  id: string;
  numero: number;
  cliente: {
    nombre: string;
    telefono: string;
    tipo: "DETAL" | "MAYORISTA" | "GRAN_MAYOR";
    ciudad: string;
  };
  items: Array<{
    nombre: string;
    sku: string;
    cantidad: number;
    precio_usd: number;
  }>;
  subtotal_usd: number;
  descuento_usd: number;
  total_usd: number;
  total_bs: number;
  estado: "PENDIENTE_PAGO" | "VERIFICANDO_PAGO" | "PAGADO" | "EN_PREPARACION" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  metodo_pago: string;
  referencia: string;
  comprobante_url?: string;
  fecha: string;
}

const MOCK_ORDERS: OnlineOrder[] = [
  {
    id: "ord-101",
    numero: 1042,
    cliente: {
      nombre: "Luis Landkoer (Distribuidora Tech)",
      telefono: "0414-1234567",
      tipo: "GRAN_MAYOR",
      ciudad: "Caracas",
    },
    items: [
      { nombre: "Power Bank ROCKET P13 10000mAh", sku: "ROCKET-P13", cantidad: 10, precio_usd: 15.0 },
      { nombre: "Cargador 65W GaN Tech 2x C + 1x A", sku: "GAR322", cantidad: 5, precio_usd: 18.5 },
    ],
    subtotal_usd: 242.5,
    descuento_usd: 12.5,
    total_usd: 230.0,
    total_bs: 10465.0,
    estado: "VERIFICANDO_PAGO",
    metodo_pago: "Pago Móvil (Banesco)",
    referencia: "PM-8839210",
    comprobante_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
    fecha: "Hoy, 02:45 PM",
  },
  {
    id: "ord-102",
    numero: 1041,
    cliente: {
      nombre: "Carlos Mendoza",
      telefono: "0424-9876543",
      tipo: "DETAL",
      ciudad: "Valencia",
    },
    items: [
      { nombre: "Audífonos TWS 100H BT 5.3", sku: "AUT250", cantidad: 1, precio_usd: 21.0 },
      { nombre: "Cable C a C Nylon 60W", sku: "CAB273", cantidad: 1, precio_usd: 2.0 },
    ],
    subtotal_usd: 23.0,
    descuento_usd: 0,
    total_usd: 23.0,
    total_bs: 1046.5,
    estado: "EN_PREPARACION",
    metodo_pago: "Zelle",
    referencia: "ZEL-440192",
    fecha: "Hoy, 11:20 AM",
  },
  {
    id: "ord-103",
    numero: 1040,
    cliente: {
      nombre: "Inversiones MovilPro C.A.",
      telefono: "0412-5551234",
      tipo: "MAYORISTA",
      ciudad: "Maracay",
    },
    items: [
      { nombre: "Parlante BT 5.1 Magnético BUNKER", sku: "BUNKER", cantidad: 6, precio_usd: 18.75 },
      { nombre: "Power Bank 20K mAh Li-Polymer", sku: "BAT201", cantidad: 4, precio_usd: 22.75 },
    ],
    subtotal_usd: 203.5,
    descuento_usd: 10.0,
    total_usd: 193.5,
    total_bs: 8804.25,
    estado: "ENVIADO",
    metodo_pago: "Transferencia Banesco",
    referencia: "TRF-902134",
    fecha: "Ayer, 04:15 PM",
  },
  {
    id: "ord-104",
    numero: 1039,
    cliente: {
      nombre: "Elena Rivas",
      telefono: "0416-3334444",
      tipo: "DETAL",
      ciudad: "Caracas",
    },
    items: [
      { nombre: "Pila Alcalina AA Blíster x4", sku: "GAR136", cantidad: 2, precio_usd: 2.56 },
    ],
    subtotal_usd: 5.12,
    descuento_usd: 0,
    total_usd: 5.12,
    total_bs: 232.96,
    estado: "PENDIENTE_PAGO",
    metodo_pago: "Por coordinar (WhatsApp)",
    referencia: "Pendiente",
    fecha: "Ayer, 09:30 AM",
  },
];

export function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>(MOCK_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.estado === filterStatus;
    const matchesSearch =
      order.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getClientTypeBadge = (tipo: OnlineOrder["cliente"]["tipo"]) => {
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

  const kpis = {
    totalHoy: orders.length,
    porVerificar: orders.filter((o) => o.estado === "VERIFICANDO_PAGO").length,
    enPreparacion: orders.filter((o) => o.estado === "EN_PREPARACION").length,
    ingresosUSD: orders
      .filter((o) => o.estado !== "CANCELADO" && o.estado !== "PENDIENTE_PAGO")
      .reduce((acc, curr) => acc + curr.total_usd, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-heading uppercase">
                Pedidos de Tienda Online
              </h1>
              <p className="text-xs text-slate-400">
                Sincronización en tiempo real con TechLand Store (Clientes B2C y Mayoristas B2B)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-800 gap-2 text-xs"
            onClick={() => setOrders([...MOCK_ORDERS])}
          >
            <RefreshCw size={14} /> Sincronizar Tienda
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Órdenes Web</span>
            <Globe size={18} className="text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{kpis.totalHoy}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Sincronizadas con catálogo web</span>
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
          <span className="text-[11px] text-slate-400">Listos para empaquetar o despacho</span>
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Todas" },
            { id: "VERIFICANDO_PAGO", label: "Por Verificar" },
            { id: "EN_PREPARACION", label: "En Preparación" },
            { id: "ENVIADO", label: "Enviados" },
            { id: "ENTREGADO", label: "Entregados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
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
            placeholder="Buscar pedido, cliente, ref..."
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
                <th className="py-3 px-4">N° Pedido</th>
                <th className="py-3 px-4">Cliente / Tipo</th>
                <th className="py-3 px-4">Ciudad / Destino</th>
                <th className="py-3 px-4">Ítems</th>
                <th className="py-3 px-4">Total USD / Bs.</th>
                <th className="py-3 px-4">Método & Ref</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No se encontraron pedidos web con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      #{order.numero}
                      <span className="block text-[10px] text-slate-500 font-normal font-sans">{order.fecha}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{order.cliente.nombre}</div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {getClientTypeBadge(order.cliente.tipo)}
                        <span className="text-[10px] text-slate-500">{order.cliente.telefono}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{order.cliente.ciudad}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-semibold text-white">
                        {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[200px]">
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

      {/* Detail & Action Modal */}
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
                <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {selectedOrder.cliente.telefono}
                </div>
                <div className="mt-1.5">{getClientTypeBadge(selectedOrder.cliente.tipo)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pago y Referencia</span>
                <div className="font-semibold text-slate-200 mt-1">{selectedOrder.metodo_pago}</div>
                <div className="font-mono text-blue-400 mt-0.5">Ref: {selectedOrder.referencia}</div>
                <div className="mt-1.5">{getStatusBadge(selectedOrder.estado)}</div>
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
              <span className="text-slate-400 text-xs">TOTAL A LIQUIDAR:</span>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-400">${selectedOrder.total_usd.toFixed(2)} USD</div>
                <div className="text-xs text-slate-400 font-sans">
                  Bs. {selectedOrder.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <a
                href={`https://wa.me/${selectedOrder.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `¡Hola ${selectedOrder.cliente.nombre}! Le escribimos de TechLand para informarle sobre su pedido web #${selectedOrder.numero}.`
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
    </div>
  );
}
