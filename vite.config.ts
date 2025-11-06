/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig({
  base: "./",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  optimizeDeps: {
    exclude: ["@thatopen/fragments"],
  },
  worker: {
    format: "es",
  },
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
  plugins: [
    {
      name: "copy-workers",
      closeBundle() {
        try {
          copyFileSync(
            resolve(
              __dirname,
              "node_modules/@thatopen/fragments/dist/Worker/worker.mjs",
            ),
            resolve(__dirname, "dist/worker.mjs"),
          );
        } catch (error) {
          console.warn("Could not copy worker file:", error);
        }
      },
    },
  ],
});
