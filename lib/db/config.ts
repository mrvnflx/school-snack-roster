/** Returns true if in-memory mock mode is enabled.
 *  Reads the env vars at call time so it works correctly with
 *  next start (where the value may differ from build time).
 *
 *  VERCEL_ENV is runtime-only (not build-inlined like NEXT_PUBLIC_*),
 *  and Vercel sets it to "preview" for preview deployments — which
 *  inherit production env vars. Preview and local dev must always use
 *  the mock auth, otherwise the mock login cookie is set but Supabase
 *  auth ignores it and every guarded page (/admin included) bounces
 *  back to /login. */
export function useInMemoryDb(): boolean {
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
    return true;
  }
  if (process.env.USE_IN_MEMORY_DB === 'true' || process.env.NEXT_PUBLIC_DB_MODE === 'in-memory') {
    return true;
  }
  if (process.env.USE_IN_MEMORY_DB === 'false' || process.env.NEXT_PUBLIC_DB_MODE === 'supabase') {
    return false;
  }
  return true;
}
