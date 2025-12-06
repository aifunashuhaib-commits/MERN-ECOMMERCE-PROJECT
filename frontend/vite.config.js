// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // your Vite port (change if you use a different port)
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend address
        changeOrigin: true,
        secure: false,
        // rewrite: path => path.replace(/^\/api/, '/api') // not necessary here
      }
    }
  }
});
