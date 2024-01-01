import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import express from "vite3-plugin-express"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": { target: "http://localhost:3002", changeOrigin: true } },
  },
  build: {
    rollupOptions: {
      external: ["remult/postgres", "remult/remult-knex"],
    },
  },
})
