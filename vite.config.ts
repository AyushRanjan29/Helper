import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
        content: "src/content/content.ts",
        background: "src/background/service-worker.ts",
      },

      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") {
            return "content.js";
          }

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