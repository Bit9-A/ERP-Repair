import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ColorThemeOption {
  id: string;
  name: string;
  primaryHex: string;
  bgHex: string;
}

export const SIDEBAR_COLOR_OPTIONS: ColorThemeOption[] = [
  { id: "slate", name: "Gris Oscuro (Predeterminado)", primaryHex: "#334155", bgHex: "#020617" },
  { id: "slate-light", name: "Gris Suave", primaryHex: "#64748b", bgHex: "#0f172a" },
  { id: "blue", name: "Azul Tecnológico", primaryHex: "#2563eb", bgHex: "#030712" },
  { id: "indigo", name: "Índigo Profundo", primaryHex: "#4f46e5", bgHex: "#050614" },
  { id: "violet", name: "Violeta Eléctrico", primaryHex: "#7c3aed", bgHex: "#0d041c" },
  { id: "zinc", name: "Zinc Grafito", primaryHex: "#52525b", bgHex: "#09090b" },
  { id: "stone", name: "Piedra Cálida", primaryHex: "#78716c", bgHex: "#0c0a09" },
  { id: "emerald", name: "Esmeralda", primaryHex: "#059669", bgHex: "#02150d" },
  { id: "cyan", name: "Cian Neón", primaryHex: "#0891b2", bgHex: "#021217" },
  { id: "red", name: "Rojo Carmesí", primaryHex: "#dc2626", bgHex: "#180404" },
  { id: "amber", name: "Ámbar Ópalo", primaryHex: "#d97706", bgHex: "#170e02" },
];

export interface FontOption {
  id: string;
  name: string;
  category: string;
  fontFamilyCss: string;
  previewText: string;
  description: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "plus-jakarta",
    name: "Plus Jakarta Sans",
    category: "Geométrica Moderna",
    fontFamilyCss: "'Plus Jakarta Sans', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "Estándar SaaS premium, equilibrio perfecto entre elegancia, limpieza y legibilidad.",
  },
  {
    id: "inter",
    name: "Inter",
    category: "Neutral & Técnica",
    fontFamilyCss: "'Inter', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "La fuente UI por excelencia, ultra legible y óptima para tablas de datos y números.",
  },
  {
    id: "outfit",
    name: "Outfit",
    category: "Vigorosa & Futurista",
    fontFamilyCss: "'Outfit', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "Curvaturas llamativas y modernas de alto impacto visual con personalidad tecnológica.",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "Minimalista & Fresca",
    fontFamilyCss: "'DM Sans', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "Trazos geométricos simplificados que aportan ligereza y una apariencia despejada.",
  },
  {
    id: "manrope",
    name: "Manrope",
    category: "Semi-geométrica Refinada",
    fontFamilyCss: "'Manrope', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "Diseño contemporáneo con proporciones armónicas y excelente jerarquía visual.",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "Tech & Electrónica",
    fontFamilyCss: "'Space Grotesk', sans-serif",
    previewText: "All-Repair Sistema ERP • Reparaciones & POS",
    description: "Carácter distintivo con acentos monoespaciados, ideal para ambientes de taller y hardware.",
  },
];

interface SettingsState {
  sidebarColor: string;
  setSidebarColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (fontId: string) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  shortcutsEnabled: boolean;
  setShortcutsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarColor: "slate",
      setSidebarColor: (color: string) => set({ sidebarColor: color }),
      fontFamily: "plus-jakarta",
      setFontFamily: (fontId: string) => set({ fontFamily: fontId }),
      animationsEnabled: true,
      setAnimationsEnabled: (enabled: boolean) => set({ animationsEnabled: enabled }),
      shortcutsEnabled: true,
      setShortcutsEnabled: (enabled: boolean) => set({ shortcutsEnabled: enabled }),
    }),
    {
      name: "erp-repair-settings",
    }
  )
);
