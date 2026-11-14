import type React from "react";

/**
 * 🛡️ Módulo Centralizado de Sanitización y Validación de Entradas (Estándar SIRAC)
 * Previene ensuciamiento de base de datos e inyecciones de símbolos no permitidos.
 */

// 1. Sanitizador de Cédulas: Solo dígitos, 5 a 9 caracteres
export function sanitizarCedulaNumero(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 9);
}

// 2. Sanitizador de Teléfonos: Solo dígitos, máximo 11 caracteres (ej. 4141234567 o 04141234567)
export function sanitizarTelefono(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 11);
}

// 3. Sanitizador de Nombres y Apellidos: Solo letras, tildes y espacios
export function sanitizarSoloLetras(valor: string, maxLen = 40): string {
  return valor
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, maxLen);
}

// 4. Sanitizador de Texto Institucional / Observaciones
export function sanitizarTextoLimpio(valor: string, maxLen = 150): string {
  return valor
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-()#/]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, maxLen);
}

// 5. Intercepción en teclado: Bloquea teclas no numéricas
export function bloquearTeclasNoNumericas(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Enter"
  ) {
    return;
  }
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

// 6. Intercepción en teclado: Bloquea números y símbolos en campos de solo letras
export function bloquearTeclasNoLetras(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.key === "Backspace" ||
    e.key === "Delete" ||
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "Enter" ||
    e.key === " "
  ) {
    return;
  }
  if (/^[0-9´`$#%&~^<>{}[\]+=/\\*!?;:@_]$/.test(e.key)) {
    e.preventDefault();
  }
}

// Catálogo de prefijos de identificación civil y mercantil
export const PREFIJOS_CEDULA = [
  { value: "V", label: "V-", descripcion: "Venezolano" },
  { value: "E", label: "E-", descripcion: "Extranjero" },
  { value: "J", label: "J-", descripcion: "Jurídico (Comercial / Empresa)" },
  { value: "G", label: "G-", descripcion: "Gubernamental / Institucional" },
  { value: "O", label: "O-", descripcion: "Otro / Pasaporte" },
];

// Catálogo organizado de países con prefijo telefónico y bandera
export const PREFIJOS_PAIS = [
  { codigo: "+58", bandera: "🇻🇪", pais: "Venezuela" },
  { codigo: "+57", bandera: "🇨🇴", pais: "Colombia" },
  { codigo: "+1", bandera: "🇺🇸", pais: "EE.UU. / Canadá" },
  { codigo: "+34", bandera: "🇪🇸", pais: "España" },
  { codigo: "+55", bandera: "🇧🇷", pais: "Brasil" },
  { codigo: "+56", bandera: "🇨🇱", pais: "Chile" },
  { codigo: "+54", bandera: "🇦🇷", pais: "Argentina" },
  { codigo: "+507", bandera: "🇵🇦", pais: "Panamá" },
  { codigo: "+51", bandera: "🇵🇪", pais: "Perú" },
  { codigo: "+593", bandera: "🇪🇨", pais: "Ecuador" },
  { codigo: "+52", bandera: "🇲🇽", pais: "México" },
  { codigo: "+39", bandera: "🇮🇹", pais: "Italia" },
  { codigo: "+351", bandera: "🇵🇹", pais: "Portugal" },
];

