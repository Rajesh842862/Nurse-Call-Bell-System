import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/curovox/" : "/",
  plugins: [react(), tailwindcss()],
   server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/audio": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/socket.io": {
        target: "http://localhost:5000",
        ws:true,
        changeOrigin: true,
      },
    },
  },
}));