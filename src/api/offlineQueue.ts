// src/api/offlineQueue.ts
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

export interface QueuedRequest {
  id: string;
  path: string;
  method: string;
  body: any;
  timestamp: number;
}

const DB_NAME = 'nain_tai_offline_db';
const STORE_NAME = 'requests_queue';

class OfflineQueue {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  private notifyUI(count: number) {
    window.dispatchEvent(new CustomEvent('offlineQueue:updated', { detail: count }));
  }

  public async addRequest(path: string, method: string, body: any) {
    const db = await this.dbPromise;
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      path,
      method,
      body,
      timestamp: Date.now(),
    };
    
    await db.put(STORE_NAME, request);
    
    const count = await db.count(STORE_NAME);
    this.notifyUI(count);
    console.info(`[OfflineQueue] Request añadida a la cola de IndexedDB. Pendientes: ${count}`);
  }

  public async getPendingRequests(): Promise<QueuedRequest[]> {
    const db = await this.dbPromise;
    const all = await db.getAll(STORE_NAME);
    return all.sort((a, b) => a.timestamp - b.timestamp);
  }

  public async removeRequest(id: string) {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
    const count = await db.count(STORE_NAME);
    this.notifyUI(count);
  }

  public async clearQueue() {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
    this.notifyUI(0);
  }
}

export const offlineQueue = new OfflineQueue();

