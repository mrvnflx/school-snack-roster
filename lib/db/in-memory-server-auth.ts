import type { AuthRepo } from './contracts';
import { store, findProfileByEmail } from './in-memory-store';
import { cookies } from 'next/headers';

/** In-memory server auth for the in-memory mock mode.
 *  Reads the mock email cookie `sr-mock-email` and returns the matching user profile. */
export const inMemoryServerAuth: AuthRepo = {
  async getUser() {
    store.ensureSeeded();
    const cookieStore = await cookies();
    const rawEmail = cookieStore.get('sr-mock-email')?.value;
    const emailCookie = rawEmail ? decodeURIComponent(rawEmail).trim() : null;

    if (!emailCookie) {
      return null;
    }

    let profile = findProfileByEmail(emailCookie);
    if (!profile) {
      // Graceful recovery: if profile was cleared from store during worker restart,
      // re-create it on the fly so the session remains valid and consistent.
      const role = emailCookie.includes('admin') ? 'admin' : 'parent';
      profile = {
        id: String(store.profiles.length + 100),
        role,
        fullName: emailCookie.split('@')[0],
        phone: null,
        email: emailCookie,
        createdAt: new Date().toISOString(),
      };
      store.profiles.push(profile);
    }

    return {
      id: profile.id,
      phone: profile.phone ?? undefined,
      role: profile.role,
      fullName: profile.fullName ?? undefined,
      email: profile.email ?? undefined,
    };
  },
};
