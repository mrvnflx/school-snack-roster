// Simple in-memory store for magic link tokens
type TokenEntry = {
  email: string;
  expiresAt: number;
};

const tokenStore = new Map<string, TokenEntry>();

export function storeMagicToken(token: string, email: string, ttlMs: number = 15 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  tokenStore.set(token, { email, expiresAt });
}

export function consumeMagicToken(token: string): string | null {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  tokenStore.delete(token); // One-time use

  if (Date.now() > entry.expiresAt) {
    return null; // Expired
  }
  return entry.email;
}
