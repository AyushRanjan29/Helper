import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
        background: "src/background/service-worker.ts",
      },

      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }

          return "assets/[name].js";
        },
      },
    },

    outDir: "dist",
    emptyOutDir: true,
  },
});