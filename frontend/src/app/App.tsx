import { Suspense } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { LoadingOverlay } from "@mantine/core";

import { theme } from "./theme";
import { router } from "./router";
import { queryClient } from "../lib/queryClient";

// -- Mantine styles --
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./global.css";

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={2077} />
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingOverlay visible />}>
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </MantineProvider>
  );
}
