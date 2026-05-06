import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: ["pwa-icon.svg"],
      injectRegister: "auto",
      manifest: {
        name: "Field Engineer Toolkit",
        short_name: "Field Toolkit",
        description: "Mobile-first toolkit for field and laboratory engineering measurements.",
        theme_color: "#0f766e",
        background_color: "#f5f7f4",
        display: "standalone",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
        start_url: "/",
        scope: "/",
      },
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,txt,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
});
