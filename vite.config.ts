import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@trpc") || id.includes("@tanstack")) return "vendor-data";
          if (id.includes("recharts") || id.includes("chart.js")) return "vendor-charts";
          if (id.includes("streamdown") || id.includes("mermaid") || id.includes("rehype")) return "vendor-markdown";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("react-hook-form") || id.includes("@hookform")) return "vendor-forms";
          if (id.includes("zod")) return "vendor-validation";
          if (id.includes("date-fns")) return "vendor-date";
          if (id.includes("jspdf")) return "vendor-documents";
          if (
            id.includes("@floating-ui") ||
            id.includes("cmdk") ||
            id.includes("vaul") ||
            id.includes("react-day-picker") ||
            id.includes("react-resizable-panels") ||
            id.includes("embla-carousel") ||
            id.includes("next-themes") ||
            id.includes("sonner") ||
            id.includes("superjson")
          )
            return "vendor-ui";
          if (id.includes("react") || id.includes("wouter")) return "vendor-react";
          return "vendor-core";
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
