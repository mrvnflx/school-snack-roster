import type { ProfilesRepo } from './contracts';
import { store, findProfileByEmail } from './in-memory-store';
import type { Profile } from './types';

export const inMemoryProfiles: ProfilesRepo = {
  async getById(id: string) {
    store.ensureSeeded();
    return store.profiles.find(p => p.id === id) ?? null;
  },

  async getByPhone(phone: string) {
    store.ensureSeeded();
    return store.profiles.find(p => p.phone === phone) ?? null;
  },

  async getByEmail(email: string) {
    store.ensureSeeded();
    return findProfileByEmail(email) ?? null;
  },

  async create(id: string, phone: string, fullName?: string) {
    store.ensureSeeded();
    store.profiles.push({
      id,
      role: 'parent',
      fullName: fullName ?? null,
      phone,
      email: null,
      createdAt: new Date().toISOString(),
    });
  },

  async createWithEmail(email: string, fullName?: string, role: 'admin' | 'parent' = 'parent'): Promise<Profile> {
    store.ensureSeeded();
    const existing = findProfileByEmail(email);
    if (existing) return existing;
    const profile: Profile = {
      id: String(store.profiles.length + 10),
      role,
      fullName: fullName ?? email.split('@')[0],
      phone: null,
      email,
      createdAt: new Date().toISOString(),
    };
    store.profiles.push(profile);
    return profile;
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
