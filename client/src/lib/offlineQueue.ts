export type OfflineDraft = {
  id: string;
  idempotencyKey: string;
  module: string;
  payload: unknown;
  regulated: boolean;
  createdAt: number;
  status?: "queued" | "syncing" | "conflict" | "failed";
  conflictReason?: string;
  lastError?: string;
  lastAttemptAt?: number;
};

const KEY = "bdf-offline-drafts";
const DB_NAME = "bdf-pharma-offline";
const STORE_NAME = "drafts";
const SENSITIVE_KEY_PATTERN = /(?:patient|patientid|mrn|medicalrecord|nationalid|identity|prescription|diagnosis|icd|lab|laboratory|radiology|insurance|claim|password|token|secret|otp|phone|email|address|dob|birth|ssn|healthid)/i;
const MAX_OFFLINE_PAYLOAD_BYTES = 64_000;

function makeKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("indexeddb-unavailable"));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexeddb-open-failed"));
  });
}

function hasSensitiveKey(value: unknown, seen = new Set<unknown>()): boolean {
  if (!value || typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some(item => hasSensitiveKey(item, seen));
  return Object.entries(value).some(([key, nested]) => SENSITIVE_KEY_PATTERN.test(key) || hasSensitiveKey(nested, seen));
}

export function isOfflinePayloadSafe(payload: unknown): boolean {
  try {
    const encoded = JSON.stringify(payload);
    return encoded !== undefined && new TextEncoder().encode(encoded).byteLength <= MAX_OFFLINE_PAYLOAD_BYTES && !hasSensitiveKey(payload);
  } catch {
    return false;
  }
}

export function canQueueOfflineDraft(draft: Pick<OfflineDraft, "regulated" | "payload">): boolean {
  return draft.regulated === false && isOfflinePayloadSafe(draft.payload);
}

export function enqueueOfflineDraft(draft: Omit<OfflineDraft, "id" | "createdAt">): OfflineDraft {
  if (!canQueueOfflineDraft(draft)) throw new Error("regulated-or-sensitive-offline-draft-blocked");
  const idempotencyKey = draft.idempotencyKey || makeKey();
  const item: OfflineDraft = { ...draft, id: idempotencyKey, idempotencyKey, createdAt: Date.now(), status: "queued" };
  const current = JSON.parse(localStorage.getItem(KEY) ?? "[]") as OfflineDraft[];
  localStorage.setItem(KEY, JSON.stringify([...current, item]));
  void persistDraft(item);
  return item;
}

function isStoredDraftSafe(item: unknown): item is OfflineDraft {
  if (!item || typeof item !== "object") return false;
  const draft = item as Partial<OfflineDraft>;
  return draft.regulated === false && typeof draft.id === "string" && isOfflinePayloadSafe(draft.payload);
}

export function listOfflineDrafts(): OfflineDraft[] {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown[];
    const safe = stored.filter(isStoredDraftSafe);
    if (safe.length !== stored.length) localStorage.setItem(KEY, JSON.stringify(safe));
    return safe;
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

export function removeOfflineDraft(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(listOfflineDrafts().filter(item => item.id !== id)));
  void deleteDraft(id);
}

export async function listDurableOfflineDrafts(): Promise<OfflineDraft[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        const stored = request.result as unknown[];
        const safe = stored.filter(isStoredDraftSafe).sort((a, b) => a.createdAt - b.createdAt);
        const unsafeIds = stored.filter(item => !isStoredDraftSafe(item)).map(item => (item as Partial<OfflineDraft>).id).filter((id): id is string => typeof id === "string");
        if (unsafeIds.length === 0) {
          db.close();
          resolve(safe);
          return;
        }
        const cleanup = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
        unsafeIds.forEach(id => cleanup.delete(id));
        cleanup.transaction.oncomplete = () => { db.close(); resolve(safe); };
        cleanup.transaction.onerror = () => { db.close(); resolve(safe); };
      };
      request.onerror = () => { db.close(); reject(request.error ?? new Error("draft-list-failed")); };
    });
  } catch {
    return listOfflineDrafts();
  }
}

export async function updateOfflineDraft(id: string, patch: Pick<OfflineDraft, "status" | "conflictReason" | "lastError" | "lastAttemptAt">): Promise<void> {
  const drafts = listOfflineDrafts().map(item => item.id === id ? { ...item, ...patch } : item);
  localStorage.setItem(KEY, JSON.stringify(drafts));
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const get = store.get(id);
      get.onsuccess = () => { if (get.result) store.put({ ...get.result, ...patch }); };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("draft-update-failed"));
    });
    db.close();
  } catch {
    // localStorage fallback already contains the auditable state
  }
}

export async function markOfflineDraftConflict(id: string, reason: string): Promise<void> {
  await updateOfflineDraft(id, { status: "conflict", conflictReason: reason, lastError: reason, lastAttemptAt: Date.now() });
}

async function persistDraft(item: OfflineDraft) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("draft-persist-failed"));
    });
    db.close();
  } catch {
    // localStorage remains the supported synchronous fallback
  }
}

async function deleteDraft(id: string) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("draft-remove-failed"));
    });
    db.close();
  } catch {
    // localStorage fallback already removed the draft
  }
}
