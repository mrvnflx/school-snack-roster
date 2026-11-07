import { describe, test, expect, afterEach } from "vitest";
import { useInMemoryDb } from "../lib/db/config";

const KEYS = ["VERCEL_ENV", "USE_IN_MEMORY_DB", "NEXT_PUBLIC_DB_MODE"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function setEnv(env: Record<string, string | undefined>) {
  for (const k of KEYS) {
    if (env[k] === undefined) delete process.env[k];
    else process.env[k] = env[k];
  }
}

describe("useInMemoryDb", () => {
  test("preview deployments always use in-memory mock auth, even when project env sets supabase mode (Vercel previews inherit production env)", () => {
    setEnv({
      VERCEL_ENV: "preview",
      USE_IN_MEMORY_DB: "false",
      NEXT_PUBLIC_DB_MODE: "supabase",
    });
    expect(useInMemoryDb()).toBe(true);
  });

  test("local development always uses in-memory mock auth, even in supabase mode", () => {
    setEnv({
      VERCEL_ENV: "development",
      NEXT_PUBLIC_DB_MODE: "supabase",
    });
    expect(useInMemoryDb()).toBe(true);
  });

  test("production keeps explicitly configured supabase mode", () => {
    setEnv({
      VERCEL_ENV: "production",
      NEXT_PUBLIC_DB_MODE: "supabase",
    });
    expect(useInMemoryDb()).toBe(false);
  });

  test("explicit in-memory mode wins outside preview/development", () => {
    setEnv({ VERCEL_ENV: "production", NEXT_PUBLIC_DB_MODE: "in-memory" });
    expect(useInMemoryDb()).toBe(true);
  });

  test("defaults to in-memory mock mode when nothing is configured", () => {
    setEnv({});
    expect(useInMemoryDb()).toBe(true);
  });
});
