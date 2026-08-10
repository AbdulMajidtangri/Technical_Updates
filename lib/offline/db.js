const DB_NAME = "techpulse-offline";
const STORE = "articles";
const VERSION = 1;

/**
 * Open IndexedDB for offline article storage.
 */
export function openOfflineDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("slug", "slug", { unique: false });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open offline database"));
  });
}

function runTransaction(mode, fn) {
  return openOfflineDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const result = fn(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error ?? new Error("Offline storage transaction failed"));
      }),
  );
}

export async function putRecord(record) {
  await runTransaction("readwrite", (store) => store.put(record));
}

export async function getRecord(id) {
  return runTransaction("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function getAllRecords() {
  return runTransaction("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function deleteRecord(id) {
  await runTransaction("readwrite", (store) => store.delete(id));
}

export async function findBySlug(slug) {
  return runTransaction("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const index = store.index("slug");
      const req = index.get(slug);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  });
}

export default openOfflineDb;
