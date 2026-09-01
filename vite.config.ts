import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (!normalizedId.includes("node_modules")) {
            return undefined;
          }

          if (
            normalizedId.includes("/react/") ||
            normalizedId.includes("/react-dom/") ||
            normalizedId.includes("/scheduler/") ||
            normalizedId.includes("/zustand/")
          ) {
            return "react-vendor";
          }

          if (
            normalizedId.includes("/react-router/") ||
            normalizedId.includes("/react-router-dom/") ||
            normalizedId.includes("/@remix-run/")
          ) {
            return "router-vendor";
          }

          if (
            normalizedId.includes("/framer-motion/") ||
            normalizedId.includes("/motion/")
          ) {
            return "motion-vendor";
          }

          if (normalizedId.includes("/recharts/")) {
            return "charts-vendor";
          }

          if (
            normalizedId.includes("/@lottiefiles/") ||
            normalizedId.includes("/qrcode/") ||
            normalizedId.includes("/react-icons/")
          ) {
            return "ui-vendor";
          }

          if (
            normalizedId.includes("/axios/") ||
            normalizedId.includes("/socket.io-client/") ||
            normalizedId.includes("/engine.io-client/") ||
            normalizedId.includes("/socket.io-parser/")
          ) {
            return "network-vendor";
          }

          if (normalizedId.includes("/@react-oauth/")) {
            return "auth-vendor";
          }

          if (normalizedId.includes("/qr-scanner/")) {
            return "qr-scanner";
          }

          return "vendor";
        },
      },
    },
  },
});
