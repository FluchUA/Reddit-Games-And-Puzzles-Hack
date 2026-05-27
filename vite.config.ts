import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devvit } from "@devvit/start/vite";

export default defineConfig({
  plugins: [
    react(),
    // Make sure to add the Devvit plugin last!
    devvit(),
  ],
});