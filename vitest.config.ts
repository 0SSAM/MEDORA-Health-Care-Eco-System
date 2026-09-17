import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

const brandEnv = {
  VITE_APP_TITLE: process.env.VITE_APP_TITLE ?? "MEDORA Health Care Eco System",
  VITE_APP_LOGO: process.env.VITE_APP_LOGO ?? "/manus-storage/medora-logo-primary_2cf35bd2.png",
};

export default defineConfig({
  env: brandEnv,
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["server/test.setup.ts"],
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.ts", "client/**/*.spec.ts"],
  },
});
