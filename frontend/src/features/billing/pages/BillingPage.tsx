import { useState } from "react";
import {
  FileText,
  Search,
  Printer,
  Download,
  Phone,
  Receipt,
  FileCheck,
  Calendar,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Modal } from "@mantine/core";

interface BillingDocument {
  id: string;
  numero: number;
  numero_control: string;
  tipo: "FACTURA" | "NOTA_ENTREGA" | "PRESUPUESTO";
  cliente: {
    nombre: string;
    rif: string;
    direccion: string;
    telefono: string;
    tipo: "DETAL" | "MAYORISTA" | "GRAN_MAYOR";
  };
  vendedor: string;
  operador: string;
  fecha: string;
  vence?: string;
  subtotal_usd: number;
  descuento_usd: number;
  flete_usd: number;
  iva_usd: number;
  total_usd: number;
  tasa_bcv: number;
  total_bs: number;
  estado: "PAGADA" | "PENDIENTE" | "ANULADA";
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio_unit_usd: number;
    total_renglon_usd: number;
  }>;
}

const MOCK_DOCUMENTS: BillingDocument[] = [
  {
    id: "doc-001",
    numero: 1042,
    numero_control: "00006528",
    tipo: "FACTURA",
    cliente: {
      nombre: "LUIS LANDKOER",
      rif: "V-20123456-7",
      direccion: "Av. Principal, Edif. Tech Center, Piso 2",
      telefono: "0414-1234567",
      tipo: "GRAN_MAYOR",
    },
    vendedor: "GILARY DUQUE",
    operador: "MASTER",
    fecha: "05/09/2026 04:02 PM",
    vence: "05/09/2026",
    subtotal_usd: 20.20,
    descuento_usd: 0,
    flete_usd: 0,
    iva_usd: 0,
    total_usd: 20.20,
    tasa_bcv: 45.50,
    total_bs: 919.10,
    estado: "PAGADA",
    items: [
      { codigo: "RAT001", descripcion: "MOUSE INALAMBRICO 2.4GHz 1HORA", cantidad: 2, precio_unit_usd: 5.70, total_renglon_usd: 11.40 },
      { codigo: "HOLD-340", descripcion: "BASE DE TELEFONO MULTIPOSICION", cantidad: 4, precio_unit_usd: 2.20, total_renglon_usd: 8.80 },
    ],
  },
  {
    id: "doc-002",
    numero: 1043,
    numero_control: "00006529",
    tipo: "NOTA_ENTREGA",
    cliente: {
      nombre: "INVERSIONES TECHMAR C.A.",
      rif: "J-40982341-2",
      direccion: "C.C. Gran Bazar, Nivel 1, Local 45",
      telefono: "0424-9876543",
      tipo: "MAYORISTA",
    },
    vendedor: "GILARY DUQUE",
    operador: "CAJA_1",
    fecha: "06/09/2026 11:30 AM",
    subtotal_usd: 227.50,
    descuento_usd: 10.0,
    flete_usd: 5.0,
    iva_usd: 0,
    total_usd: 222.50,
    tasa_bcv: 45.50,
    total_bs: 10123.75,
    estado: "PAGADA",
    items: [
      { codigo: "ROCKET-P13", descripcion: "Power Bank ROCKET P13 10000mAh", cantidad: 10, precio_unit_usd: 15.00, total_renglon_usd: 150.00 },
      { codigo: "GAR322", descripcion: "Cargador 65W GaN Tech 2x C + 1x A", cantidad: 5, precio_unit_usd: 15.50, total_renglon_usd: 77.50 },
    ],
  },
  {
    id: "doc-003",
    numero: 1044,
    numero_control: "00006530",
    tipo: "PRESUPUESTO",
    cliente: {
      nombre: "TALLER EXPRESS VALENCIA",
      rif: "J-50123999-1",
      direccion: "Av. Bolívar Norte, Sector San José",
      telefono: "0412-4445566",
      tipo: "GRAN_MAYOR",
    },
    vendedor: "ADRIAN VERGEL",
    operador: "MASTER",
    fecha: "07/09/2026 09:15 AM",
    vence: "14/09/2026",
    subtotal_usd: 350.00,
    descuento_usd: 20.0,
    flete_usd: 0,
    iva_usd: 0,
    total_usd: 330.00,
    tasa_bcv: 45.60,
    total_bs: 15048.00,
    estado: "PENDIENTE",
    items: [
      { codigo: "BUNKER", descripcion: "Parlante BT 5.1 Magnético BUNKER 5W", cantidad: 20, precio_unit_usd: 17.50, total_renglon_usd: 350.00 },
    ],
  },
];

export function BillingPage() {
  const [documents, setDocuments] = useState<BillingDocument[]>(MOCK_DOCUMENTS);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<BillingDocument | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesType = filterType === "ALL" || doc.tipo === filterType;
    const matchesSearch =
      doc.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.cliente.rif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.numero_control.includes(searchQuery) ||
      doc.numero.toString().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const getDocTypeBadge = (tipo: BillingDocument["tipo"]) => {
    switch (tipo) {
      case "FACTURA":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Factura Fiscal</Badge>;
      case "NOTA_ENTREGA":
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Nota de Entrega</Badge>;
      case "PRESUPUESTO":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Presupuesto</Badge>;
      default:
        return null;
    }
  };

  const getClientTypeBadge = (tipo: BillingDocument["cliente"]["tipo"]) => {
    switch (tipo) {
      case "GRAN_MAYOR":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">Gran Mayor</Badge>;
      case "MAYORISTA":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Mayorista</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-[10px]">Detal / PVP</Badge>;
    }
  };

  const kpis = {
    totalDocs: documents.length,
    facturasUSD: documents.filter((d) => d.tipo === "FACTURA").reduce((a, b) => a + b.total_usd, 0),
    notasUSD: documents.filter((d) => d.tipo === "NOTA_ENTREGA").reduce((a, b) => a + b.total_usd, 0),
    presupuestosUSD: documents.filter((d) => d.tipo === "PRESUPUESTO").reduce((a, b) => a + b.total_usd, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-heading uppercase">
              Facturación & Documentos a2
            </h1>
            <p className="text-xs text-slate-400">
              Control fiscal, Notas de Entrega, Presupuestos y Facturación Multimoneda (USD / Bs. BCV)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-800 gap-2 text-xs"
            onClick={() => setDocuments([...MOCK_DOCUMENTS])}
          >
            <RefreshCw size={14} /> Refrescar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Documentos Emitidos</span>
            <FileText size={18} className="text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{kpis.totalDocs}</div>
          <span className="text-[11px] text-slate-400">Secuencia y control correlativo</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Facturas Fiscales</span>
            <FileCheck size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            ${kpis.facturasUSD.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Con N° de Control Fiscal</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Notas de Entrega</span>
            <Receipt size={18} className="text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-400 font-mono">
            ${kpis.notasUSD.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Despachos mayoristas y mostrador</span>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Presupuestos Activos</span>
            <Calendar size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
            ${kpis.presupuestosUSD.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Pendientes por aprobación cliente</span>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Todos los Documentos" },
            { id: "FACTURA", label: "Facturas Fiscales" },
            { id: "NOTA_ENTREGA", label: "Notas de Entrega" },
            { id: "PRESUPUESTO", label: "Presupuestos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterType === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
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
            placeholder="Buscar por cliente, RIF, control..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Documents Table */}
      <Card className="bg-slate-900/50 border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-heading uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Documento / Control</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Cliente / RIF</th>
                <th className="py-3 px-4">Vendedor & Operador</th>
                <th className="py-3 px-4">Fecha Emisión</th>
                <th className="py-3 px-4">Total USD / Bs.</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No se encontraron documentos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm">#{doc.numero}</div>
                      <div className="text-[11px] font-mono text-emerald-400">CONTROL: {doc.numero_control}</div>
                    </td>
                    <td className="py-3 px-4">{getDocTypeBadge(doc.tipo)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{doc.cliente.nombre}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>RIF: {doc.cliente.rif}</span>
                        {getClientTypeBadge(doc.cliente.tipo)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{doc.vendedor}</div>
                      <div className="text-[10px] text-slate-500 font-mono">OP: {doc.operador}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{doc.fecha}</td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-white text-sm">${doc.total_usd.toFixed(2)} USD</div>
                      <div className="text-[10px] text-slate-400">
                        Bs. {doc.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-emerald-400 hover:text-white hover:bg-emerald-600/20 text-xs"
                          onClick={() => setSelectedDoc(doc)}
                          title="Ver Factura estilo a2"
                        >
                          <Eye size={14} className="mr-1" /> Ver Factura
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Viewer Modal (Estilo a2 Modernizado) */}
      <Modal
        opened={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        size="xl"
        centered
        title={
          <div className="flex items-center gap-2">
            <Receipt className="text-emerald-400" size={20} />
            <span className="font-bold text-white font-heading uppercase text-sm">
              Vista Previa de {selectedDoc?.tipo === "FACTURA" ? "Factura Fiscal" : "Nota de Entrega"} #{selectedDoc?.numero}
            </span>
          </div>
        }
        styles={{
          content: { backgroundColor: "#090d16", border: "1px solid #1e293b", color: "#f8fafc" },
          header: { backgroundColor: "#090d16", borderBottom: "1px solid #1e293b" },
        }}
      >
        {selectedDoc && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Factura Layout Contenedor */}
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-slate-300 space-y-4 shadow-2xl">
              {/* Header Empresa */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <div className="text-lg font-black text-white font-heading tracking-wider">
                    TECHLAND SOLUTIONS C.A.
                  </div>
                  <div className="text-[11px] text-slate-400">RIF: J-50123456-0</div>
                  <div className="text-[10px] text-slate-500">
                    Av. Principal, Edificio Central, Nivel Mezzanina Local 2
                  </div>
                  <div className="text-[10px] text-slate-500">Teléfono: (0212) 555-4321 / 0414-1234567</div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-bold text-emerald-400 font-sans tracking-widest">
                    {selectedDoc.tipo}
                  </div>
                  <div className="text-base font-black text-white">N° {selectedDoc.numero.toString().padStart(8, "0")}</div>
                  <div className="text-xs text-amber-400 font-bold">CONTROL: {selectedDoc.numero_control}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Fecha: {selectedDoc.fecha}</div>
                </div>
              </div>

              {/* Datos Cliente y Vendedor */}
              <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Cliente:</span>
                  <div className="font-bold text-white text-xs">{selectedDoc.cliente.nombre}</div>
                  <div className="text-slate-400">RIF / C.I.: {selectedDoc.cliente.rif}</div>
                  <div className="text-slate-400 truncate">Dirección: {selectedDoc.cliente.direccion}</div>
                  <div className="text-slate-400">Tel: {selectedDoc.cliente.telefono}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Detalles de Operación:</span>
                  <div>Vendedor: <span className="text-slate-200 font-semibold">{selectedDoc.vendedor}</span></div>
                  <div>Operador: <span className="text-slate-200 font-semibold">{selectedDoc.operador}</span></div>
                  <div>Condición: <span className="text-emerald-400 font-bold">CONTADO</span></div>
                  <div>Escala: <span className="text-purple-400 font-bold">{selectedDoc.cliente.tipo}</span></div>
                </div>
              </div>

              {/* Items Renglones */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Descripción</th>
                      <th className="py-2 px-3 text-center">Cant</th>
                      <th className="py-2 px-3 text-right">P. Unit ($)</th>
                      <th className="py-2 px-3 text-right">Total ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {selectedDoc.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 text-emerald-400 font-bold">{item.codigo}</td>
                        <td className="py-2 px-3 text-white">{item.descripcion}</td>
                        <td className="py-2 px-3 text-center font-bold">{item.cantidad}</td>
                        <td className="py-2 px-3 text-right">${item.precio_unit_usd.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">${item.total_renglon_usd.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Liquidación Totales */}
              <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                <div className="text-[10px] text-slate-400 space-y-1">
                  <div>Son: <span className="text-white font-bold uppercase">VEINTE CON 20/100 DÓLARES</span></div>
                  <div className="text-slate-500">Tasa Oficial BCV: {selectedDoc.tasa_bcv.toFixed(2)} Bs/$</div>
                  <div className="text-slate-500 italic mt-2">
                    Garantía válida únicamente presentando este documento original.
                  </div>
                </div>

                <div className="w-64 space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Neto:</span>
                    <span>${selectedDoc.subtotal_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Descuento (0%):</span>
                    <span>-${selectedDoc.descuento_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Flete / Envío:</span>
                    <span>${selectedDoc.flete_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>I.V.A. (0%):</span>
                    <span>${selectedDoc.iva_usd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-sm font-black pt-1 border-t border-slate-800">
                    <span>TOTAL OPERACIÓN:</span>
                    <span>${selectedDoc.total_usd.toFixed(2)} USD</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Total Bs: <span className="font-bold text-white">{selectedDoc.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <a
                href={`https://wa.me/${selectedDoc.cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `¡Hola ${selectedDoc.cliente.nombre}! Le adjuntamos su ${selectedDoc.tipo} N° ${selectedDoc.numero} emitida por TechLand.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone size={14} /> Enviar Factura por WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-1.5"
                  onClick={() => alert(`Enviando factura #${selectedDoc.numero} a la impresora...`)}
                >
                  <Printer size={14} /> Imprimir Ticket (80mm)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
                  onClick={() => alert(`Descargando PDF Factura #${selectedDoc.numero}...`)}
                >
                  <Download size={14} /> Descargar PDF Carta
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
