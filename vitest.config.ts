/// <reference types="vitest" />

import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@styles": path.resolve(__dirname, "src/styles"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    isolate: true,
    retry: 1,
    setupFiles: ["./src/test-setup.ts"],
    pool: "threads",
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    reporters: ["default", "html"],
    outputFile: {
      html: "./coverage/index.html",
    },
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
        pretendToBeVisual: true,
        resources: "usable",
      },
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{tsx}"],
      exclude: [],
      reportOnFailure: true,
      thresholds: {
        global: {
          lines: 80,
          functions: 50,
          branches: 50,
          statements: 50,
        },
      },
    },
  },
});
