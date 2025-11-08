/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { copyFileSync, existsSync, statSync } from "fs";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: "/",
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
    rollupOptions: {
      output: {
        entryFileNames: 'worker.mjs',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
    copyPublicDir: true,
  },
  plugins: [
    react(),
    {
      name: "copy-workers",
      writeBundle() {
        try {
          const workerSrc = resolve(
            __dirname,
            "node_modules/@thatopen/fragments/dist/Worker/worker.mjs",
          );
          const workerDest = resolve(__dirname, "dist/worker.mjs");

          console.log("🔍 Checking worker source:", workerSrc);
          console.log("📍 Worker destination:", workerDest);

          if (existsSync(workerSrc)) {
            copyFileSync(workerSrc, workerDest);
            const stats = statSync(workerDest);
            console.log("✅ Worker file copied successfully");
            console.log("📦 Worker size:", stats.size, "bytes");
          } else {
            console.error("❌ Worker source file not found!");
          }
        } catch (error) {
          console.error("❌ Failed to copy worker file:", error);
        }
      },
    },
  ],
});
