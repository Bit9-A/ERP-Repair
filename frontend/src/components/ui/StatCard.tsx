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
      {/* Background card with glass effect and subtle ambient glow */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] rounded-2xl transition-colors" />

      {/* Top accent line with ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-90 transition-opacity"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 40%, transparent) 100%)`,
        }}
      />

      {/* Subtle radial corner glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 dark:opacity-30"
        style={{ background: accentColor }}
      />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
          <div className="flex-1 min-w-0 pr-2">
            <Text
              size="xs"
              fw={600}
              className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans truncate"
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
            className="flex items-center justify-center w-11 h-11 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0"
            style={{
              background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
              color: accentColor,
              border: `1px solid color-mix(in srgb, ${accentColor} 26%, transparent)`,
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </Group>

        {/* Footer info: Subtitle or Trend indicator */}
        <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && (
            <Text size="xs" className="text-slate-500 dark:text-slate-400 font-medium">
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
