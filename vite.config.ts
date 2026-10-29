import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => ({
  base:
    mode === "github-pages"
      ? `${(process.env.BASE_PATH ?? "/Aurelle-Estate").replace(/\/$/, "")}/`
      : "/",
  plugins: [react()],
  server: { watch: { ignored: ["**/dist-pages/**", "**/outputs/**"] } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
}));
