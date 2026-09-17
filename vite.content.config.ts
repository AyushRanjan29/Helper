import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/content/content.ts",

      output: {
        format: "iife",
        entryFileNames: "content.js",
        inlineDynamicImports: true,
      },
    },

    outDir: "dist",
    emptyOutDir: false,
  },
});
