import { Suspense } from "react";
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

// -- Mantine styles --
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./global.css";

// Overrides Mantine's internal CSS tokens for light mode.
// We only set body/text globals — NOT gray/dark palette remaps,
// because those variables control both bg AND text color, and remapping
// them caused unintended dark backgrounds on chips, badges etc.
// Text colour is handled via color: !important rules in global.css.
const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#f1f5f9",
    "--mantine-color-default": "#ffffff",
    "--mantine-color-default-hover": "#e8edf3",
    "--mantine-color-default-color": "#1e293b",
    "--mantine-color-text": "#1e293b",
    "--mantine-color-dimmed": "#475569",
  },
  dark: {},
});

export function App() {
  const { colorScheme } = useThemeStore();

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
