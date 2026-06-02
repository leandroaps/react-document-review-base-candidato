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
      "@api": path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "src/components"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@typing": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
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
