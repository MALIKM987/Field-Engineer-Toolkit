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
      includeAssets: [
        "icons/icon-192.webp",
        "icons/icon-512.webp",
      ],
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
            src: "/icons/icon-192.webp",
            sizes: "192x192",
            type: "image/webp",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.webp",
            sizes: "512x512",
            type: "image/webp",
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
