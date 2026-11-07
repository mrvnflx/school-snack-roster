/** Returns true if in-memory mock mode is enabled.
 *
 *  This MVP's only working login is the mock email flow: the login route
 *  sets the `sr-mock-session` cookie and only the in-memory auth recognizes
 *  it. In Supabase mode that cookie is set but ignored, so every guarded
 *  page (`/` and `/admin` included) bounces back to /login even though
 *  the mock session is valid. There is no real Supabase magic-link flow
 *  behind the login form, so mock mode must stay on in every deployment;
 *  env-based mode selection (`NEXT_PUBLIC_DB_MODE`, `USE_IN_MEMORY_DB`,
 *  `VERCEL_ENV`) must not be able to turn it off. */
export function useInMemoryDb(): boolean {
  return true;
}
