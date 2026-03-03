import { create } from "zustand";
import { persist } from "zustand/middleware";

type ColorScheme = "dark" | "light";

interface ThemeStore {
  colorScheme: ColorScheme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      colorScheme: "dark",
      toggle: () =>
        set({
          colorScheme: get().colorScheme === "dark" ? "light" : "dark",
        }),
    }),
    { name: "erp-color-scheme" },
  ),
);
