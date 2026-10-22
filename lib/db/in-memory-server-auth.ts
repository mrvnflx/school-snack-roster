import type { AuthRepo } from './contracts';
import { store } from './in-memory-store';

/** In-memory server auth for the in-memory mock mode.
 *  Returns the first admin profile from seed data so the app works
 *  without any real auth flow. The login page is a formality. */
export const inMemoryServerAuth: AuthRepo = {
  async getUser() {
    store.ensureSeeded();
    const admin = store.profiles.find((p) => p.role === 'admin');
    if (!admin) return null;
    return {
      id: admin.id,
      phone: admin.phone ?? undefined,
      role: admin.role,
      fullName: admin.fullName ?? undefined,
    };
  },
};
