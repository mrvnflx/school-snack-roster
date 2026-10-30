import { spawn, execSync } from "node:child_process";
import { writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, afterAll, test, expect } from "vitest";

/**
 * Integration test: the home page must link to the /proto page in the top-right
 * bar (next to the Admin role link). Verified against a live Next.js dev server
 * running in in-memory mode so no external Supabase credentials are required.
 */

const PORT = 4197;
const BASE = `http://127.0.0.1:${PORT}`;
const LOG = join(process.cwd(), "tests", ".nextdev.log");

let server: ReturnType<typeof spawn> | null = null;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll the server until it answers, or throw after a timeout. */
async function waitForServer(timeoutMs = 110_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return;
    } catch {
      /* not ready yet */
    }
    await wait(500);
  }
  throw new Error(`dev server at ${BASE} did not become ready in time`);
}

async function fetchHtml(path: string): Promise<string> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed -> ${res.status}`);
  return res.text();
}

beforeAll(async () => {
  // public/proto/ is git-ignored and copied from prototype/ at build time;
  // ensure it exists before starting the server so /proto is served in dev.
  execSync("node scripts/copy-proto.js", {
    cwd: process.cwd(),
    stdio: "pipe",
  });

  mkdirSync(join(process.cwd(), "tests"), { recursive: true });
  writeFileSync(LOG, `vitest next dev log @ ${new Date().toISOString()}\n`);

  server = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        USE_IN_MEMORY_DB: "true",
        NEXT_PUBLIC_DB_MODE: "in-memory",
      },
      // New process group so we can tear down the whole tree (incl. workers).
      detached: true,
      stdio: "pipe",
    }
  );

  server.stdout?.on("data", (d) => appendFileSync(LOG, `[stdout] ${d}`));
  server.stderr?.on("data", (d) => appendFileSync(LOG, `[stderr] ${d}`));

  server.on("exit", (code, signal) => {
    appendFileSync(LOG, `server exited code=${code} signal=${signal}\n`);
  });

  await waitForServer();
});

afterAll(() => {
  if (!server || server.pid == null) return;
  try {
    // Kill the whole process group (next dev + its workers).
    process.kill(-server.pid, "SIGTERM");
  } catch {
    try {
      server.kill("SIGTERM");
    } catch {
      /* already dead */
    }
  }
});

test("homepage top bar renders a link to /proto", async () => {
  const html = await fetchHtml("/");
  // The link is rendered as an anchor pointing at /proto with visible text.
  expect(html).toContain('href="/proto"');
  expect(html).toMatch(/<a[^>]*href="\/proto"[^>]*>\s*Proto\s*<\/a>/);
});

test("/proto link appears alongside the Admin role link (next to the toggle)", async () => {
  const html = await fetchHtml("/");
  // In-memory mode seeds an admin user, so the Admin link is present.
  expect(html).toContain('href="/admin"');
  // The Proto link is rendered immediately after the Admin link (same bar).
  const adminIdx = html.indexOf('href="/admin"');
  const protoIdx = html.indexOf('href="/proto"');
  expect(adminIdx).toBeGreaterThan(-1);
  expect(protoIdx).toBeGreaterThan(adminIdx);
});

test("/proto route is reachable and serves the prototype page", async () => {
  const html = await fetchHtml("/proto");
  expect(html).toContain("Snack Roster");
  expect(html).toContain("role-toggle");
});
