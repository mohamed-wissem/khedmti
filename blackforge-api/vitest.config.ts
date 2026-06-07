import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolve the `@/*` path alias (matches tsconfig "paths") without an
  // ESM-only plugin, so the config loads under both CJS and ESM.
  resolve: {
    alias: [{ find: /^@\//, replacement: path.resolve(__dirname, "src") + "/" }],
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/server.ts", "src/docs/**"],
    },
  },
});
