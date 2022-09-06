import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  root: 'docs',
  base: '/rompatcher-ts/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      devOptions: {
        enabled: true
      }
    })
  ],
})
