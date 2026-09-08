import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    watch: {
      ignored: ["**/node_modules/**", "**/.git/**", "**/AppData/**"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/react-router": path.resolve(
        __dirname,
        "./src/lib/tanstack-shim.tsx"
      ),
    },
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});