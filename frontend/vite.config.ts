import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "http://127.0.0.1:3000";

  // Determine proxy target
  let proxyTarget = "http://127.0.0.1:3000";
  if (apiUrl.startsWith("http")) {
    try {
      const url = new URL(apiUrl);
      proxyTarget = url.origin;
    } catch (e) {
      console.warn(
        "Invalid VITE_API_URL, falling back to default proxy target",
      );
    }
  }

  return {
    plugins: [react(), basicSsl()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
