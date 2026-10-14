import { afterEach, describe, expect, it, vi } from 'vitest';

/*
 * In a third-party iframe with storage blocked (an itch.io embed in a strict browser), merely
 * reading `indexedDB` or `localStorage` throws a SecurityError. The game must keep running
 * without persistence rather than rejecting out of every save call.
 */
describe('storage denied', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).indexedDB;
    delete (globalThis as Record<string, unknown>).localStorage;
    vi.resetModules();
  });

  it('resolves every operation when reading the storage globals throws', async () => {
    const deny = (): never => {
      throw new DOMException('access denied', 'SecurityError');
    };
    Object.defineProperty(globalThis, 'indexedDB', { get: deny, configurable: true });
    Object.defineProperty(globalThis, 'localStorage', { get: deny, configurable: true });
    vi.resetModules();
    const db = await import('@save/db');

    await expect(db.dbAvailable()).resolves.toBe(false);
    await expect(db.dbGet(db.STORE_META, 'meta')).resolves.toBeNull();
    await expect(db.dbSet(db.STORE_SAVES, 'slot1', { a: 1 })).resolves.toBe(false);
    await expect(db.dbDelete(db.STORE_SAVES, 'slot1')).resolves.toBe(false);
    await expect(db.dbKeys(db.STORE_SAVES)).resolves.toEqual([]);
  });
});
