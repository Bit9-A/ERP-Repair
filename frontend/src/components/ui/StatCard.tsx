import { Group, Text } from "@mantine/core";
import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accentColor: string;
  subtitle?: string;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  accentColor,
  subtitle,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18, ease: "easeOut" } }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
      }}
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
    >
      {/* Background card with Sirac midnight surface + Sigepat border radius */}
      <div className="absolute inset-0 bg-white dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] hover:border-slate-300 dark:hover:border-blue-500/40 shadow-xs dark:shadow-md dark:shadow-[#070d18]/40 rounded-2xl transition-all" />

      {/* Top accent line with ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] opacity-90 transition-opacity"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 30%, transparent) 100%)`,
        }}
      />

      {/* SIGEPAT watermark icon behind card */}
      <div className="absolute -right-2 -bottom-2 w-20 h-20 opacity-[0.04] dark:opacity-[0.06] text-slate-900 dark:text-white pointer-events-none flex items-center justify-center scale-125 rotate-12">
        {icon}
      </div>

      {/* Subtle radial corner glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-15 dark:opacity-25"
        style={{ background: accentColor }}
      />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
          <div className="flex-1 min-w-0 pr-2">
            <Text
              size="xs"
              fw={700}
              className="text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em] font-sirac-title truncate text-[11px]"
            >
              {title}
            </Text>
            <div className="mt-1 flex items-baseline gap-2">
              <Text
                size="xl"
                fw={800}
                className="font-heading text-slate-900 dark:text-white text-2xl lg:text-3xl tracking-tight leading-none"
              >
                {value}
              </Text>
            </div>
          </div>

          {/* Icon Badge capsule */}
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0"
            style={{
              background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              color: accentColor,
              border: `1px solid color-mix(in srgb, ${accentColor} 24%, transparent)`,
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </Group>

        {/* Footer info: Subtitle or Trend indicator */}
        <div className="pt-2 mt-auto border-t border-slate-100 dark:border-[#1e324f]/70 flex items-center justify-between text-xs font-sirac-sub">
          {subtitle && (
            <Text size="xs" className="text-slate-500 dark:text-slate-400 font-medium font-sirac-sub">
              {subtitle}
            </Text>
          )}

          {trend && (
            <div className="flex items-center gap-1 ml-auto font-medium">
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive !== false
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
                    : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40"
                }`}
              >
                {trend.isPositive !== false ? "↑" : "↓"} {trend.value}
              </span>
              {trend.label && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
