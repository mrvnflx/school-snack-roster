/** Returns true if in-memory mock mode is enabled.
 *  Reads the env var at call time so it works correctly with
 *  next start (where the value may differ from build time). */
export function useInMemoryDb(): boolean {
  return process.env.USE_IN_MEMORY_DB === 'true';
}
