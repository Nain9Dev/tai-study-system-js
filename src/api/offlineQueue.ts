// src/api/offlineQueue.ts

export interface QueuedRequest {
  id: string;
  path: string;
  method: string;
  body: any;
  timestamp: number;
}

const QUEUE_KEY = 'nain_tai_offline_queue';

class OfflineQueue {
  private getQueue(): QueuedRequest[] {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueuedRequest[]) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    // Notificamos a la UI (SyncIndicator) que la cola ha cambiado
    window.dispatchEvent(new CustomEvent('offlineQueue:updated', { detail: queue.length }));
  }

  public addRequest(path: string, method: string, body: any) {
    const queue = this.getQueue();
    queue.push({
      id: crypto.randomUUID(),
      path,
      method,
      body,
      timestamp: Date.now(),
    });
    this.saveQueue(queue);
    console.info(`[OfflineQueue] Request añadida a la cola. Pendientes: ${queue.length}`);
  }

  public getPendingRequests(): QueuedRequest[] {
    return this.getQueue();
  }

  public removeRequest(id: string) {
    const queue = this.getQueue().filter(req => req.id !== id);
    this.saveQueue(queue);
  }

  public clearQueue() {
    this.saveQueue([]);
  }
}

export const offlineQueue = new OfflineQueue();
