import { Suspense, useEffect } from "react";
import { MantineProvider, type CSSVariablesResolver } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { LoadingOverlay } from "@mantine/core";

import { theme } from "./theme";
import { router } from "./router";
import { queryClient } from "../lib/queryClient";
import { useThemeStore } from "../stores/theme.store";
import { useSettingsStore, FONT_OPTIONS } from "../stores/settings.store";

// -- Mantine styles --
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";

import "./global.css";

const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#f8fafc",
    "--mantine-color-default": "#ffffff",
    "--mantine-color-default-hover": "#f1f5f9",
    "--mantine-color-default-color": "#0f172a",
    "--mantine-color-text": "#0f172a",
    "--mantine-color-dimmed": "#475569",
  },
  dark: {},
});

export function App() {
  const { colorScheme } = useThemeStore();
  const { sidebarColor, animationsEnabled, fontFamily } = useSettingsStore();

  useEffect(() => {
    if (colorScheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [colorScheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", sidebarColor);
  }, [sidebarColor]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-animations",
      animationsEnabled ? "enabled" : "disabled"
    );
  }, [animationsEnabled]);

  useEffect(() => {
    const selected = FONT_OPTIONS.find((f) => f.id === fontFamily);
    if (selected) {
      document.documentElement.style.setProperty("--app-font-family", selected.fontFamilyCss);
      document.body.style.fontFamily = selected.fontFamilyCss;
    }
  }, [fontFamily]);

  return (
    <MantineProvider
      theme={theme}
      forceColorScheme={colorScheme}
      cssVariablesResolver={cssVariablesResolver}
    >
      <Notifications position="top-right" zIndex={2077} />
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Suspense fallback={<LoadingOverlay visible />}>
            <RouterProvider router={router} />
          </Suspense>
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
