import type { AuthRepo } from './contracts';
import { store, findProfileByEmail } from './in-memory-store';
import { cookies } from 'next/headers';

/** In-memory server auth for the in-memory mock mode.
 *  Reads the mock email cookie `sr-mock-email` and returns the matching user profile.
 *  Falls back to admin if no session is active. */
export const inMemoryServerAuth: AuthRepo = {
  async getUser() {
    store.ensureSeeded();
    const cookieStore = await cookies();
    const emailCookie = cookieStore.get('sr-mock-email')?.value;

    let profile = null;
    if (emailCookie) {
      profile = findProfileByEmail(emailCookie);
    }

    if (!profile) {
      return null;
    }

    if (!profile) return null;

    return {
      id: profile.id,
      phone: profile.phone ?? undefined,
      role: profile.role,
      fullName: profile.fullName ?? undefined,
      email: profile.email ?? undefined,
    };
  },
};
