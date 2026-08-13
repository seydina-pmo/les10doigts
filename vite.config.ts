import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    // Tailwind MUST be first to process @source/@import directives before CSS minification
    tailwindcss(),
    tsconfigPaths(),
    tanstackStart({
      server: {
        entry: "./src/server.ts",
        preset: "vercel",
      },
    }),
  ],
});
