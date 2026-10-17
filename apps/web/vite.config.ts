/// <reference types="vitest/config" />
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Read the version here rather than via $npm_package_version in .env, which
// is only set when the dev server is started through `npm run`.
const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
);

const config: UserConfig & {
  test?: { environment: string; globals: boolean; setupFiles: string[], include: string[]; exclude: string[] };
} = {
  plugins: [react()],
  base: "/alluvial/",
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Vitest runs unit/component tests in src/. Playwright owns e2e/.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "build", "e2e"],
  },
};

export default defineConfig(config);
