
import type { ProfilesRepo } from './contracts';
import { store } from './in-memory-store';

export const inMemoryProfiles: ProfilesRepo = {
  async getById(id: string) {
    store.ensureSeeded();
    return store.profiles.find(p => p.id === id) ?? null;
  },

  async getByPhone(phone: string) {
    store.ensureSeeded();
    return store.profiles.find(p => p.phone === phone) ?? null;
  },

  async create(id: string, phone: string, fullName?: string) {
    store.ensureSeeded();
    store.profiles.push({
      id,
      role: 'parent',
      fullName: fullName ?? null,
      phone,
      createdAt: new Date().toISOString(),
    });
  },

  async updateRole(id: string, role: 'admin' | 'parent') {
    store.ensureSeeded();
    const profile = store.profiles.find(p => p.id === id);
    if (profile) profile.role = role;
  },

  async listAll() {
    store.ensureSeeded();
    return store.profiles;
  },
};
