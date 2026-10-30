import { defineConfig } from "vitest/config";

/**
 * Integration tests for the Snack Roster homepage.
 *
 * These tests boot a real `next dev` server in in-memory DB mode and verify the
 * rendered HTML over HTTP. They live in the `node` environment (no jsdom needed)
 * so they can spawn the server as a child process and assert on response bodies.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Start one dev server per suite; run serially to avoid port clashes.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
});
