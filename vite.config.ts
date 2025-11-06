/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { copyFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      writeBundle() {
        try {
          const workerSrc = resolve(
            __dirname,
            "node_modules/@thatopen/fragments/dist/Worker/worker.mjs",
          );
          const workerDest = resolve(__dirname, "dist/worker.mjs");

          if (existsSync(workerSrc)) {
            copyFileSync(workerSrc, workerDest);
            console.log("✅ Worker file copied successfully to dist/worker.mjs");
          } else {
            console.error("❌ Worker source file not found at:", workerSrc);
          }
        } catch (error) {
          console.error("❌ Failed to copy worker file:", error);
        }
      },
    },
  ],
});
