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
  test("mock mode stays on even when env selects supabase mode (otherwise the valid mock session cookie is ignored and /admin bounces to /login)", () => {
    setEnv({
      VERCEL_ENV: "production",
      USE_IN_MEMORY_DB: "false",
      NEXT_PUBLIC_DB_MODE: "supabase",
    });
    expect(useInMemoryDb()).toBe(true);
  });

  test("mock mode stays on in preview deployments", () => {
    setEnv({ VERCEL_ENV: "preview", NEXT_PUBLIC_DB_MODE: "supabase" });
    expect(useInMemoryDb()).toBe(true);
  });

  test("mock mode stays on with no env configured", () => {
    setEnv({});
    expect(useInMemoryDb()).toBe(true);
  });
});
