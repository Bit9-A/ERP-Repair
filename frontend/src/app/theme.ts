import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Pro Max Design System — RepairShop ERP
// Source: design-system/repairshop-erp/MASTER.md

const brand: MantineColorsTuple = [
  "#edf7ff", // 0
  "#d6ebff", // 1
  "#b5dbff", // 2
  "#84b3ff", // 3
  "#4d94e8", // 4
  "#237cd5", // 5 — primary CTA
  "#1c63aa", // 6 — hover
  "#154a80", // 7
  "#0e3155", // 8 — sidebar bg
  "#07182b", // 9
];

// Dark-mode palette (used when colorScheme = "dark")
const darkPalette: MantineColorsTuple = [
  "#C1C2C5", // 0 — muted text
  "#A6A7AB", // 1
  "#909296", // 2
  "#5C5F66", // 3
  "#373A40", // 4
  "#2C2E33", // 5
  "#1E293B", // 6 — card surface
  "#0F172A", // 7 — main content bg
  "#0B1120", // 8
  "#020617", // 9 — deepest bg / sidebar
];

export const theme = createTheme({
  // -- Colors --
  primaryColor: "brand",
  primaryShade: { light: 5, dark: 5 },
  colors: {
    brand,
    dark: darkPalette,
  },

  // -- Typography (Outfit + Plus Jakarta Sans + Fira Code) --
  fontFamily:
    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"Fira Code", "JetBrains Mono", monospace',
  headings: {
    fontFamily: '"Outfit", sans-serif',
    fontWeight: "600",
  },

  // -- Radius --
  defaultRadius: "md",
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },

  // -- Spacing --
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },

  // -- Shadows --
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.15)",
  },

  // -- Component overrides --
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 200ms ease",
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        padding: "lg",
      },
      styles: {
        root: {
          transition: "all 200ms ease",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    NumberInput: {
      defaultProps: {
        radius: "md",
        thousandSeparator: ".",
        decimalSeparator: ",",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 4,
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          color: "var(--text-primary)",
        },
        label: {
          fontWeight: 500,
        },
      },
    },
    Notification: {
      defaultProps: {
        radius: "md",
      },
    },
  },

  // -- Other --
  cursorType: "pointer",
  focusRing: "auto",
  respectReducedMotion: true,
  autoContrast: true,
});
