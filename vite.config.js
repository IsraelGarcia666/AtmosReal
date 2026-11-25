import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Configure Vite and enable Tailwind CSS.
export default defineConfig({
  base: "/AtmosReal/",
  plugins: [tailwindcss()],
});
