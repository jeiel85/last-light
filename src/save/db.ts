/**
 * A very small IndexedDB wrapper.
 *
 * Everything the game persists is a plain JSON-serialisable object keyed by a string, so a
 * full ORM would be pure overhead. Every operation resolves rather than rejecting on a
 * missing database, because the game must remain playable in a private window or with
 * storage disabled — it simply loses persistence.
 */

const DB_NAME = 'lastlight';
const DB_VERSION = 1;

export const STORE_SAVES = 'saves';
export const STORE_META = 'meta';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SAVES)) db.createObjectStore(STORE_SAVES);
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

  return dbPromise;
}

export async function dbAvailable(): Promise<boolean> {
  return (await openDatabase()) !== null;
}

export async function dbGet<T>(store: string, key: string): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return fallbackGet<T>(store, key);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readonly');
      const request = tx.objectStore(store).get(key);
      request.onsuccess = () => resolve((request.result as T) ?? null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function dbSet(store: string, key: string, value: unknown): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return fallbackSet(store, key, value);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function dbDelete(store: string, key: string): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return fallbackDelete(store, key);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function dbKeys(store: string): Promise<string[]> {
  const db = await openDatabase();
  if (!db) return fallbackKeys(store);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readonly');
      const request = tx.objectStore(store).getAllKeys();
      request.onsuccess = () => resolve((request.result as IDBValidKey[]).map(String));
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/* ------------------------------------------------------------------ fallback */

/*
 * When IndexedDB is unavailable (private windows, storage blocked, some embedded
 * webviews) the game falls back to localStorage. Saves are smaller than the 5 MB quota in
 * practice, and losing persistence entirely would be a worse failure than a size limit.
 */

const PREFIX = 'lastlight:';

function fallbackGet<T>(store: string, key: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${store}:${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function fallbackSet(store: string, key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`${PREFIX}${store}:${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function fallbackDelete(store: string, key: string): boolean {
  try {
    localStorage.removeItem(`${PREFIX}${store}:${key}`);
    return true;
  } catch {
    return false;
  }
}

function fallbackKeys(store: string): string[] {
  try {
    const out: string[] = [];
    const prefix = `${PREFIX}${store}:`;
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) out.push(key.slice(prefix.length));
    }
    return out;
  } catch {
    return [];
  }
}
