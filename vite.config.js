import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "3e3e3b50-d219-44c9-8dd3-075b07731bde-00-1spkrofcic6vh.riker.replit.dev",
    ],
  },
});
