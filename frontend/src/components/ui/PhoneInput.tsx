import React, { useMemo } from "react";
import { TextInput, Select, Text } from "@mantine/core";
import { Phone } from "lucide-react";
import {
  PREFIJOS_PAIS,
  sanitizarTelefono,
  bloquearTeclasNoNumericas,
} from "../../lib/sanitizers";

interface PhoneInputProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  value: string; // Stored as e.g. "+58 4141234567" or "04141234567"
  onChange: (fullValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  placeholder?: string;
}

export function PhoneInput({
  label = "Teléfono de Contacto",
  description,
  error,
  value,
  onChange,
  required = false,
  disabled = false,
  size = "sm",
  placeholder = "4141234567",
}: PhoneInputProps) {
  // Parse country code and phone number
  const { countryCode, localNumber } = useMemo(() => {
    if (!value) return { countryCode: "+58", localNumber: "" };

    const trimmed = value.trim();

    // Check if it starts with one of our country codes
    for (const p of PREFIJOS_PAIS) {
      if (trimmed.startsWith(p.codigo)) {
        const remaining = trimmed.slice(p.codigo.length).trim();
        return {
          countryCode: p.codigo,
          localNumber: sanitizarTelefono(remaining),
        };
      }
    }

    // Default to +58 for Venezuela if starts with 04xx
    let clean = sanitizarTelefono(trimmed);
    if (clean.startsWith("0") && clean.length > 1) {
      clean = clean.slice(1);
    }

    return {
      countryCode: "+58",
      localNumber: clean,
    };
  }, [value]);

  const handleCountryChange = (newCode: string | null) => {
    const code = newCode || "+58";
    onChange(localNumber ? `${code} ${localNumber}` : code);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = sanitizarTelefono(e.target.value);
    // If user starts with 0 (e.g. 0414), normalize to 414
    if (clean.startsWith("0") && clean.length > 1) {
      clean = clean.slice(1);
    }
    onChange(clean ? `${countryCode} ${clean}` : countryCode);
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <Text size="xs" fw={700} className="font-sirac-title text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </Text>
          <span className="font-mono text-[10px] text-slate-400">
            {countryCode === "+58" ? "Ej: 4141234567" : "Número sin 0 inicial"}
          </span>
        </div>
      )}

      {description && (
        <Text size="xs" c="dimmed" mb={4} className="font-sirac-sub">
          {description}
        </Text>
      )}

      <div className="flex gap-2 items-start">
        {/* Country Code Select */}
        <Select
          value={countryCode}
          onChange={handleCountryChange}
          data={PREFIJOS_PAIS.map((p) => ({
            value: p.codigo,
            label: `${p.bandera} ${p.codigo}`,
          }))}
          disabled={disabled}
          size={size}
          w={115}
          allowDeselect={false}
          searchable
          styles={{
            input: {
              fontWeight: 700,
              fontFamily: "'Titillium Web', sans-serif",
            },
          }}
        />

        {/* Local Number Input */}
        <TextInput
          value={localNumber}
          onChange={handleNumberChange}
          onKeyDown={bloquearTeclasNoNumericas}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          maxLength={11}
          error={error}
          leftSection={<Phone size={15} className="text-slate-400" />}
          style={{ flex: 1 }}
          styles={{
            input: {
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.05em",
            },
          }}
        />
      </div>
    </div>
  );
}
