import type { AuthRepo } from './contracts';
import { store } from './in-memory-store';

/** In-memory auth: returns an admin user from the seed data.
 *  The login page is a formality for the mock — we always return
 *  the first admin profile in the store. */
export const inMemoryAuth: AuthRepo = {
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
