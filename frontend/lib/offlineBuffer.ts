/**
 * IndexedDB Offline Buffer utility for storing failed GPS pings.
 * Buffers up to 500 pings and flushes them when reconnected.
 */

const DB_NAME = "AstraFlowOfflineDB";
const STORE_NAME = "gps_pings";
const MAX_BUFFER_SIZE = 500;

export interface BufferedPing {
  driver_id: string;
  session_id: string;
  lat: number;
  lng: number;
  accuracy: number;
  speed: number;
  heading: number;
  timestamp: string; // ISO string
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes the IndexedDB instance
 */
function initDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject("IndexedDB not supported");
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  return dbPromise;
}

/**
 * Store a failed ping into the offline buffer.
 * If buffer exceeds MAX_BUFFER_SIZE, drops the oldest entry.
 */
export async function bufferPing(ping: BufferedPing): Promise<void> {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    
    // Check size to enforce limits
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result >= MAX_BUFFER_SIZE) {
        // Open cursor to delete the oldest record
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
          }
        };
      }
    };

    store.put(ping);
  } catch (err) {
    console.error("[OfflineBuffer] Failed to buffer ping:", err);
  }
}

/**
 * Retrieve and clear all buffered pings.
 * Called upon successful network reconnection.
 */
export async function flushBuffer(): Promise<BufferedPing[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const data = request.result as BufferedPing[];
        if (data.length > 0) {
          store.clear(); // Clear store after fetching
        }
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("[OfflineBuffer] Failed to flush buffer:", err);
    return [];
  }
}
