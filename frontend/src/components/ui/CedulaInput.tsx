import React, { useMemo } from "react";
import { TextInput, Select, Text } from "@mantine/core";
import {
  PREFIJOS_CEDULA,
  sanitizarCedulaNumero,
  bloquearTeclasNoNumericas,
} from "../../lib/sanitizers";

interface CedulaInputProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  value: string; // Stored as e.g. "V-18492301" or "18492301"
  onChange: (fullValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  placeholder?: string;
}

export function CedulaInput({
  label = "Cédula / Documento de Identidad",
  description,
  error,
  value,
  onChange,
  required = false,
  disabled = false,
  size = "sm",
  leftSection,
  rightSection,
  placeholder = "18492301",
}: CedulaInputProps) {
  // Parse prefix and number
  const { prefix, number } = useMemo(() => {
    if (!value) return { prefix: "V", number: "" };
    const match = value.match(/^([VEJGOvejgo])-?(.*)$/);
    if (match) {
      return {
        prefix: match[1].toUpperCase(),
        number: sanitizarCedulaNumero(match[2]),
      };
    }
    return {
      prefix: "V",
      number: sanitizarCedulaNumero(value),
    };
  }, [value]);

  const handlePrefixChange = (newPrefix: string | null) => {
    const pref = newPrefix || "V";
    onChange(number ? `${pref}-${number}` : pref);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanNum = sanitizarCedulaNumero(e.target.value);
    onChange(cleanNum ? `${prefix}-${cleanNum}` : prefix ? `${prefix}-` : "");
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <Text size="xs" fw={700} className="font-sirac-title text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </Text>
          {number && (
            <span className="font-mono text-[10px] text-slate-400">
              {number.length}/9 dígitos
            </span>
          )}
        </div>
      )}

      {description && (
        <Text size="xs" c="dimmed" mb={4} className="font-sirac-sub">
          {description}
        </Text>
      )}

      <div className="flex gap-2 items-start">
        {/* Document Prefix Select (V, E, J, G, O) */}
        <Select
          value={prefix}
          onChange={handlePrefixChange}
          data={PREFIJOS_CEDULA.map((p) => ({
            value: p.value,
            label: p.label,
          }))}
          disabled={disabled}
          size={size}
          w={78}
          allowDeselect={false}
          styles={{
            input: {
              fontWeight: 800,
              fontFamily: "'Titillium Web', sans-serif",
              textAlign: "center",
              letterSpacing: "0.05em",
            },
          }}
        />

        {/* Cédula Number Input */}
        <TextInput
          value={number}
          onChange={handleNumberChange}
          onKeyDown={bloquearTeclasNoNumericas}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          maxLength={9}
          error={error}
          leftSection={leftSection}
          rightSection={rightSection}
          style={{ flex: 1 }}
          styles={{
            input: {
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.06em",
            },
          }}
        />
      </div>
    </div>
  );
}
